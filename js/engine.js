// ---- The Missing Element: pelimoottori (deterministinen, tick-pohjainen) ----
// Yhteinen pelille, editorille ja ratkaisijalle.
const U = 4;                 // yksikköä per ruutu
const COLS = 28, ROWS = 16;
const JUMP = [-2,-2,-2,-1,-1,-1,-1,0,0,1,1,1,1,2,2,2];
const MAXFALL = 20;          // yksikköä lakipisteestä; enemmän = kuolema
const WALK_SP = 2;           // puoliyksikköä per tick
const SWIM_SP = 1;           // uinti ja kahlaus: puolet kävelystä
const WIND_SP = [0,1,3];     // tuulen työntö: heikko 1, kova 3 (kovempi kuin kävely, vastaan ei pääse)
const FLOAT = 4;             // uidessa jalat ovat näin monta yksikköä pinnan alla
const DIVE = 0.6;            // sukellus: uppoaa pinnan alle 0.6 × pudotuskorkeus
const DIVE_MAX = 24;         // enintään 6 ruutua
// tuli (tickejä, 20 tickiä = 1 s)
const BURN = 50;             // kauanko ruutu palaa
const SPREAD_UP = 20;        // ylös: naapuri syttyy 1 s kuluttua
const SPREAD_SIDE = 40;      // sivulle tyynellä
const SPREAD_WIND = [40,16,8];// sivulle myötätuuleen: tyyni / heikko / kova
const halfSteps=(sp,t)=>Math.floor(t*sp/2)-Math.floor((t-1)*sp/2);

// ruutukoodit
const E=0, EARTH=1, WALL=2, WOOD=3, FENCE=4, SPIKE=6, EXIT=7, WATER=8;
const CH = {'=':EARTH,'#':WALL,'-':WOOD,'H':FENCE,'^':SPIKE,'E':EXIT,'w':WATER,'f':WOOD,'F':FENCE};
const FIRECH = {'f':1,'F':1};   // valmiiksi palava puulattia / puuaita
const WINDCH = {'<':-1,'>':1,'[':-2,']':2};
const ELEMENTS = ['earth','fire','wind','water'];
const WIND_H = 3;            // tuulipalan korkeus ruutuina (rivit r-2..r)

const solid = t => t===EARTH||t===WALL||t===WOOD||t===FENCE;   // vettä pidättävä
const burnable = t => t===WOOD||t===FENCE;

function parseLevel(def){
  const g = new Uint8Array(COLS*ROWS), wind = new Int8Array(COLS*ROWS);
  let start=null; const keys=[]; let exit=null; const fires=[];
  def.map.forEach((row,r)=>{
    for(let c=0;c<COLS;c++){
      const ch=row[c]||'.';
      const t=CH[ch]; if(t) g[r*COLS+c]=t;
      if(WINDCH[ch]) wind[r*COLS+c]=WINDCH[ch];
      if(ch==='E') exit={r,c};
      if(ch==='k') keys.push({r,c});
      if(FIRECH[ch]) fires.push({el:'fire',r,c,t0:0});
      if(ch==='P') start={x:c*U, y:(r+1)*U};
    }
  });
  return {g, wind, start, keys, exit, fires};
}

// palan ruudut (tuli: yksi ruutu, vesi: kaatokohta)
function pieceCells(p){
  const out=[];
  if(p.el==='earth') for(let k=0;k<p.len;k++) out.push([p.r,p.c+k]);
  else if(p.el==='wind') for(let r=p.r-WIND_H+1;r<=p.r;r++) for(let k=0;k<p.len;k++) out.push([r,p.c+k]);
  else out.push([p.r,p.c]);
  return out;
}

// Vesi valuu alimpaan kohtaan ja täyttää yhden altaan rivi kerrallaan, kunnes määrä loppuu
// tai allas on täynnä. Ennen täyttöä vesi valuu reunojen yli altaaseen; täyttynyt allas ei tulvi.
// h = veden korkeus riveinä (99 = täysi allas). Vanhoissa kentissä ilman h:ta vol on ruutujen määrä.
// Piikit jäävät veden alle: vesi asettuu niiden päälle.
function pour(g, r, c, vol, h){
  const cells=[]; let rows=0;
  if(h) vol=1e9;
  const open=(rr,cc)=> rr>=0&&rr<ROWS&&cc>=0&&cc<COLS && !solid(g[rr*COLS+cc]) && g[rr*COLS+cc]!==WATER && g[rr*COLS+cc]!==SPIKE;
  const held=(rr,cc)=> rr+1<ROWS && (solid(g[(rr+1)*COLS+cc]) || g[(rr+1)*COLS+cc]===WATER || g[(rr+1)*COLS+cc]===SPIKE);
  if(!open(r,c)) return cells;
  for(let guard=0; guard<200 && vol>0; guard++){
    while(r+1<ROWS && open(r+1,c)) r++;
    if(r+1>=ROWS) break;                               // valui ulos kentästä
    let a=c, b=c;
    while(open(r,a-1) && held(r,a-1)) a--;
    while(open(r,b+1) && held(r,b+1)) b++;
    const lDrop=open(r,a-1), rDrop=open(r,b+1);        // avoin mutta ei kannateltu = reuna
    if(lDrop||rDrop){                                  // vesi valuu reunan yli
      if(cells.length) break;                          // allas on täynnä: ylimäärä ei tulvi
      c = (lDrop && rDrop)? ((c-a <= b-c)? a-1 : b+1) : (lDrop? a-1 : b+1);
      continue;
    }
    const w=b-a+1;
    if(w>vol) break;                                   // määrä ei riitä koko riville
    for(let x=a;x<=b;x++){ g[r*COLS+x]=WATER; cells.push(r*COLS+x); }
    vol-=w; rows++;
    if(h && rows>=h) break;
    let nc=-1; for(let x=a;x<=b;x++) if(open(r-1,x)){ nc=x; break; }
    if(nc<0 || r-1<1) break;
    r=r-1; c=nc;
  }
  return cells;
}

// Rakentaa maailman: perus + maa- ja tuulipalat, sitten vesi, sitten tulen aikataulu.
// piece: {el, len, dir, strong, r, c, t0?}
function makeWorld(def, pieces){
  const {g,wind,start,keys,exit,fires:lvFires}=parseLevel(def);
  const ps=(pieces||[]).filter(Boolean).concat(lvFires);
  for(const p of ps){
    if(p.el==='earth') for(const [r,c] of pieceCells(p)) g[r*COLS+c]=EARTH;
    if(p.el==='wind') for(const [r,c] of pieceCells(p)) wind[r*COLS+c]=p.dir*(p.strong?2:1);
  }
  const water=[];
  for(const p of ps) if(p.el==='water') water.push(...pour(g,p.r,p.c,p.len,p.h));
  // tuli: syttymisajat lyhimpinä polkuina puuta pitkin
  const ign=new Int32Array(COLS*ROWS).fill(-1);
  let fireEnd=0;
  const fires=ps.filter(p=>p.el==='fire');
  if(fires.length){
    const q=[];
    for(const p of fires){ const i=p.r*COLS+p.c, t0=p.t0||0; if(ign[i]<0||ign[i]>t0){ ign[i]=t0; q.push([t0,i]); } }
    while(q.length){
      q.sort((x,y)=>x[0]-y[0]);
      const [t,i]=q.shift(); if(ign[i]!==t) continue;
      const r=(i/COLS)|0, c=i%COLS;
      const tryN=(rr,cc,d)=>{
        if(d==null || d>=BURN || rr<0||rr>=ROWS||cc<0||cc>=COLS) return;
        const j=rr*COLS+cc; if(!burnable(g[j])) return;
        const tt=t+d; if(ign[j]<0 || tt<ign[j]){ ign[j]=tt; q.push([tt,j]); }
      };
      tryN(r-1,c,SPREAD_UP);                            // ylös nopeasti, alas ei lainkaan
      for(const dc of [-1,1]){
        if(c+dc<0||c+dc>=COLS) continue;
        // tuuli palavan ruudun tai naapurin kohdalla tai niiden yläpuolella (puulattian päällä puhaltava tuuli)
        const wAt=j=> wind[j] || (j>=COLS? wind[j-COLS] : 0);
        const ww = wAt(i) || wAt(r*COLS+c+dc) || 0;
        let d = SPREAD_SIDE;
        if(ww && Math.sign(ww)===dc) d=SPREAD_WIND[Math.abs(ww)];
        else if(ww) d=null;                            // vastatuuleen ei leviä
        tryN(r,c+dc,d);
      }
    }
    for(let i=0;i<ign.length;i++) if(ign[i]>=0) fireEnd=Math.max(fireEnd,ign[i]+BURN);
  }
  const guards=(def.guards||[]).map(G=>{ const R=(G.c1-G.c0)*U; return {...G, R, P:2*R}; });
  let hasWind=false; for(let i=0;i<wind.length;i++) if(wind[i]){ hasWind=true; break; }
  return {g, wind, ign, fireEnd, water, start, keys, exit, guards, hasWind, allKeys:(1<<keys.length)-1};
}

function newState(w){
  return {x:w.start.x, y:w.start.y, m:0, jt:0, jd:0, peak:w.start.y, dv:0, dead:0, won:0, t:0, keys:0, cause:'', face:1};
}
function cloneS(s){ return {...s}; }

function guardPos(G,t){
  const p=t%G.P; const off = p<G.R ? p : G.P-p;
  const x = G.dir<0 ? G.c1*U-off : G.c0*U+off;
  return {x, y:(G.r+1)*U, d: (p<G.R ? 1 : -1)*(G.dir<0?-1:1)};
}

// ruudun tila hetkellä s.t (palanut puu katoaa)
function tileAt(w,s,r,c){
  if(r<0||r>=ROWS||c<0||c>=COLS) return E;
  const i=r*COLS+c, t=w.g[i];
  if(w.ign[i]>=0 && burnable(t) && s.t>=w.ign[i]+BURN) return E;
  return t;
}
function burningAt(w,t,i){ return w.ign[i]>=0 && t>=w.ign[i] && t<w.ign[i]+BURN; }
const standable = t => t===EARTH||t===WALL||t===WOOD||t===FENCE;

function supportCols(w,s){
  if(s.y%U) return [];
  const r=s.y/U, c0=s.x>>2, c1=(s.x+U-1)>>2, out=[];
  for(let c=c0;c<=c1;c++) if(standable(tileAt(w,s,r,c))) out.push(c);
  return out;
}
// kiviseinä ja puuaita estävät liikkeen; uidessa myös maa ja puulattia (altaan reunat)
function blocked(w,s,x,y,swim){
  if(x<0 || x+U>COLS*U) return true;
  const r0=Math.floor((y-8)/U), r1=Math.floor((y-1)/U), c0=x>>2, c1=(x+U-1)>>2;
  for(let r=r0;r<=r1;r++) for(let c=c0;c<=c1;c++){
    const t=tileAt(w,s,r,c);
    if(t===WALL||t===FENCE) return true;
    if(swim && (t===EARTH||t===WOOD)) return true;
  }
  return false;
}
function bodyCols(s){ return [s.x>>2, (s.x+U-1)>>2]; }
function depthAt(w,r,c){ let n=0; while(r>=0 && r<ROWS && w.g[r*COLS+c]===WATER){ n++; r++; } return n; }
function deepWaterAt(w,s){
  const r=Math.floor((s.y-1)/U); const [c0,c1]=bodyCols(s);
  for(let c=c0;c<=c1;c++) if(depthAt(w,r,c)>=2) return true;
  return false;
}
function feetInWater(w,s){
  const r=Math.floor((s.y-1)/U); const [c0,c1]=bodyCols(s);
  for(let c=c0;c<=c1;c++) if(r>=0&&r<ROWS&&w.g[r*COLS+c]===WATER) return true;
  return false;
}
// uidessa jalkojen tavoitekorkeus: pinnan yläreuna + FLOAT
function floatY(w,s){
  const [c0,c1]=bodyCols(s); let best=null;
  for(let c=c0;c<=c1;c++){
    let r=Math.floor((s.y-1)/U);
    if(r<0||r>=ROWS||w.g[r*COLS+c]!==WATER){ r++; if(r<0||r>=ROWS||w.g[r*COLS+c]!==WATER) continue; }
    while(r-1>=0 && w.g[(r-1)*COLS+c]===WATER) r--;
    const fy=r*U+FLOAT; if(best===null||fy<best) best=fy;
  }
  return best;
}
// tuuli, joka vaikuttaa hahmoon (vahvin kehon ruuduista)
function windOn(w,s){
  const r0=Math.floor((s.y-8)/U), r1=Math.floor((s.y-1)/U); const [c0,c1]=bodyCols(s); let v=0;
  for(let r=Math.max(0,r0);r<=Math.min(ROWS-1,r1);r++) for(let c=c0;c<=c1;c++){ const x=w.wind[r*COLS+c]; if(Math.abs(x)>Math.abs(v)) v=x; }
  return v;
}
function drift(w,s,v,swim){
  if(!v) return; const d=Math.sign(v), n=halfSteps(Math.abs(v),s.t);
  for(let k=0;k<n;k++) if(!blocked(w,s,s.x+d,s.y,swim)) s.x+=d;
}
function land(s){
  s.m=0;
  if(s.y-s.peak>MAXFALL){ s.dead=1; s.cause='fall'; }
}
// yksi yksikkö alaspäin: true, jos liike päättyi (laskeutui tai putosi syvään veteen)
function fallUnit(w,s){
  s.y++;
  if(supportCols(w,s).length){ land(s); return true; }
  if(feetInWater(w,s) && deepWaterAt(w,s)){            // syvä vesi: uppoaa pudotuksen mukaan
    s.dv=Math.min(DIVE_MAX, Math.round((s.y-s.peak)*DIVE)); s.m=3; s.peak=s.y; return true; }
  return false;
}
function checkHazards(w,s){
  if(s.y>ROWS*U+8){ s.dead=1; s.cause='pit'; return; }
  const bx0=s.x, bx1=s.x+U-1, by0=s.y-8, by1=s.y-1;
  const r0=Math.floor(by0/U), r1=Math.floor(by1/U), c0=bx0>>2, c1=bx1>>2;
  let atExit=false;
  for(let r=r0;r<=r1;r++) for(let c=c0;c<=c1;c++){
    if(r<0||r>=ROWS) continue;
    const t=tileAt(w,s,r,c);
    if(t===SPIKE && by1>=r*U+2){ s.dead=1; s.cause='spike'; return; }
    if(burningAt(w,s.t,r*COLS+c)){ s.dead=1; s.cause='fire'; return; }
    if(t===EXIT) atExit=true;
  }
  if(s.m===0) for(const c of supportCols(w,s)) if(burningAt(w,s.t,(s.y/U)*COLS+c)){ s.dead=1; s.cause='fire'; return; }
  w.keys.forEach((K,i)=>{ if(!(s.keys>>i&1) && K.r>=r0&&K.r<=r1&&K.c>=c0&&K.c<=c1) s.keys|=1<<i; });
  for(const G of w.guards){
    const p=guardPos(G,s.t);
    if(Math.abs(p.x-s.x)<3 && s.y-8 < p.y-1 && p.y-7 < s.y){ s.dead=1; s.cause='guard'; return; }
  }
  if(atExit && s.keys===w.allKeys) s.won=1;
}

// input: {dir:-1|0|1, jump:bool}
// tilat: m=0 maassa, 1 hyppy, 2 putoaa, 3 ui
function step(w,s,inp){
  if(s.dead||s.won) return s;
  s.t++;
  const wv=windOn(w,s), wsp=Math.sign(wv)*WIND_SP[Math.abs(wv)];
  if(s.m===0){
    const sup=supportCols(w,s);
    if(!sup.length){ s.m=2; s.peak=s.y; }
    else if(deepWaterAt(w,s)){ s.m=3; s.peak=s.y; }
    else{
      const sp = feetInWater(w,s)? SWIM_SP : WALK_SP;
      if(inp.dir) s.face=inp.dir;
      if(inp.jump){ s.m=1; s.jt=0; s.jd=inp.dir*sp; s.peak=s.y; }
      else drift(w,s,inp.dir*sp+wsp,false);
    }
  }
  if(s.m===3){
    if(inp.dir) s.face=inp.dir;
    if(inp.jump && s.dv<=0 && s.y===floatY(w,s)){ s.m=1; s.jt=0; s.jd=inp.dir*WALK_SP; s.peak=s.y; }
    else{
      drift(w,s,inp.dir*SWIM_SP+wsp,true);
      const fy=floatY(w,s);
      if(fy===null){ s.m=2; s.peak=s.y; s.dv=0; }
      else if(s.dv>0){                                 // sukellus jatkuu, kunnes vauhti loppuu tai pohja tulee vastaan
        s.dv--;
        if(supportCols(w,s).length) s.dv=0; else s.y++;
      }
      else if(s.y<fy) s.y++;
      else if(s.y>fy && !blocked(w,s,s.x,s.y-1,false)) s.y--;
      if(s.m===3 && s.dv<=0 && fy!==null && s.y<=fy && supportCols(w,s).length && !deepWaterAt(w,s)) s.m=0;
    }
  }
  else if(s.m===1){
    const dy=JUMP[s.jt++];
    const jdir=Math.sign(s.jd), n=halfSteps(Math.abs(s.jd),s.jt);
    for(let k=0;k<n;k++) if(!blocked(w,s,s.x+jdir,s.y)) s.x+=jdir;
    drift(w,s,wsp,false);
    if(dy<0){
      for(let k=0;k<-dy;k++){
        if(blocked(w,s,s.x,s.y-1)){ s.m=2; break; }
        s.y--;
      }
      if(s.y<s.peak) s.peak=s.y;
    } else if(dy>0){
      for(let k=0;k<dy;k++) if(fallUnit(w,s)) break;
    }
    if(s.m===1 && s.jt>=JUMP.length) s.m=2;
  } else if(s.m===2){
    drift(w,s,wsp,false);
    for(let k=0;k<2;k++) if(fallUnit(w,s)) break;
  }
  checkHazards(w,s);
  return s;
}
// lepotila: seisoo tai kelluu pinnalla
function settled(w,s){ return s.m===0 || (s.m===3 && s.y===floatY(w,s)); }

// Mahtuuko pala tähän? Muut palat huomioidaan.
function freeFor(def, piece, others){
  const base=makeWorld(def,(others||[]).filter(o=>o && o.el!=='water'));
  const {g,keys}=base;
  const key=(r,c)=>keys.some(K=>K.r===r&&K.c===c);
  const cells=pieceCells(piece);
  for(const [r,c] of cells) if(r<1||r>=ROWS||c<0||c>=COLS) return false;
  if(piece.el==='earth') return cells.every(([r,c])=>{ const t=g[r*COLS+c]; return (t===E||t===WATER) && !key(r,c); });
  if(piece.el==='fire'){ const [r,c]=cells[0]; const t=g[r*COLS+c]; return (t===E||burnable(t)) && !key(r,c); }
  if(piece.el==='wind') return cells.every(([r,c])=>{ const t=g[r*COLS+c]; return t===E||t===WATER; });
  if(piece.el==='water') return pour(g.slice(),piece.r,piece.c,piece.len,piece.h).length>0;
  return false;
}
// veden lopulliset ruudut esikatselua varten
function waterPreview(def, piece, others){
  const w=makeWorld(def,(others||[]).filter(o=>o && o.el!=='water'));
  return pour(w.g.slice(),piece.r,piece.c,piece.len,piece.h);
}

const API={U,COLS,ROWS,JUMP,MAXFALL,BURN,FIRECH,WIND_H,E,EARTH,WALL,WOOD,FENCE,SPIKE,EXIT,WATER,CH,WINDCH,ELEMENTS,
  parseLevel,makeWorld,newState,cloneS,step,freeFor,tileAt,burningAt,supportCols,guardPos,settled,pieceCells,pour,waterPreview,floatY,burnable};
if(typeof module!=='undefined') module.exports=API;
if(typeof self!=='undefined') self.PPEngine=API;
