// ---- The Missing Element: pelimoottori (deterministinen, tick-pohjainen) ----
// Yhteinen pelille, editorille ja ratkaisijalle.
const U = 4;                 // yksikköä per ruutu
const COLS = 28, ROWS = 16;
const JUMP = [-2,-2,-2,-1,-1,-1,-1,0,0,1,1,1,1,2,2,2];       // maasta: nousee 10 yksikköä (2,5 ruutua)
const JUMP_SWIM = [-2,-2,-1,-1,-1,-1,-1,0,1,1,1,1,1,2,2];     // vedestä ei saa ponnistusta: nousee 9 yksikköä
                                                            // ja lähtee ruudun pinnan alta, joten yltää vain ruudun pinnan yläpuolelle
const JUMPS = [JUMP, JUMP_SWIM];
const MAXFALL = 20;          // yksikköä lakipisteestä; enemmän = kuolema
const WALK_SP = 2;           // puoliyksikköä per tick
const SWIM_SP = 1;           // uinti ja kahlaus: puolet kävelystä
const WIND_SP = [0,1,3];     // tuulen työntö: heikko 1, kova 3 (kovempi kuin kävely, vastaan ei pääse)
const FLOAT = 4;             // uidessa jalat ovat näin monta yksikköä pinnan alla
const DIVE = 0.75;           // sukellus: uppoaa pinnan alle 0.75 × pudotuskorkeus
const DIVE_MAX = 24;         // enintään 6 ruutua
// tuli (tickejä, 20 tickiä = 1 s)
const BURN = 50;             // kauanko ruutu palaa
const SPREAD_UP = 20;        // ylös: naapuri syttyy 1 s kuluttua
const SPREAD_SIDE = 40;      // sivulle tyynellä
const SPREAD_WIND = [40,16,8];// sivulle myötätuuleen: tyyni / heikko / kova
// vesi: kevyt ruutusimulaatio, askel WSTEP tickin välein (10 askelta/s)
const WSTEP = 2;
const EMIT = 4;              // lähde tuottaa yhden vesiruudun 4 askeleen välein (2,5 ruutua/s)
const DRAIN = 300;           // maa imee yhden vesiruudun 15 s:ssa per maakerroksen paksuusruutu
const W_STEADY = 60;         // näin monta muuttumatonta askelta = vesi on asettunut
const W_HORIZON = 3000;      // simulaation yläraja (5 min), sen jälkeen tilanne jäädytetään
const halfSteps=(sp,t)=>Math.floor(t*sp/2)-Math.floor((t-1)*sp/2);

// ruutukoodit
const E=0, EARTH=1, WALL=2, WOOD=3, FENCE=4, SPIKE=6, EXIT=7, WATER=8;
const CH = {'=':EARTH,'#':WALL,'-':WOOD,'H':FENCE,'^':SPIKE,'E':EXIT,'f':WOOD,'F':FENCE};
// w = paikallaan oleva vesi alussa, S = lähde (virtaa koko ajan). Vesi on omassa kerroksessaan, ei ruudukossa.
const FIRECH = {'f':1,'F':1};   // valmiiksi palava puulattia / puuaita
const WINDCH = {'<':-1,'>':1,'[':-2,']':2};
const ELEMENTS = ['earth','fire','wind','water'];
const WIND_H = 3;            // tuulipalan korkeus ruutuina (rivit r-2..r)

const solid = t => t===EARTH||t===WALL||t===WOOD||t===FENCE;   // vettä pidättävä
const burnable = t => t===WOOD||t===FENCE;

function parseLevel(def){
  const g = new Uint8Array(COLS*ROWS), wind = new Int8Array(COLS*ROWS);
  let start=null; const keys=[]; let exit=null; const fires=[], initWet=[], sources=[];
  def.map.forEach((row,r)=>{
    for(let c=0;c<COLS;c++){
      const ch=row[c]||'.';
      const t=CH[ch]; if(t) g[r*COLS+c]=t;
      if(WINDCH[ch]) wind[r*COLS+c]=WINDCH[ch];
      if(ch==='E') exit={r,c};
      if(ch==='k') keys.push({r,c});
      if(FIRECH[ch]) fires.push({el:'fire',r,c,t0:0});
      if(ch==='w') initWet.push(r*COLS+c);
      if(ch==='S') sources.push({r,c,t0:0,len:0});
      if(ch==='P') start={x:c*U, y:(r+1)*U};
    }
  });
  // veden keskellä oleva avain on vedessä (kartassa ruutuun mahtuu vain yksi merkki)
  const chAt=(r,c)=> (def.map[r]||'')[c];
  for(const K of keys) if(chAt(K.r,K.c-1)==='w'||chAt(K.r,K.c+1)==='w'||chAt(K.r-1,K.c)==='w') initWet.push(K.r*COLS+K.c);
  return {g, wind, start, keys, exit, fires, initWet, sources};
}

// palan ruudut (tuli: yksi ruutu, vesi: kaatokohta)
function pieceCells(p){
  const out=[];
  if(p.el==='earth') for(let k=0;k<p.len;k++) out.push([p.r,p.c+k]);
  else if(p.el==='wind') for(let r=p.r-WIND_H+1;r<=p.r;r++) for(let k=0;k<p.len;k++) out.push([r,p.c+k]);
  else out.push([p.r,p.c]);
  return out;
}

// Rakentaa maailman: perus + maa- ja tuulipalat, sitten vesi, sitten tulen aikataulu.
// piece: {el, len, dir, strong, r, c, t0?}
function makeWorld(def, pieces){
  const {g,wind,start,keys,exit,fires:lvFires,initWet,sources}=parseLevel(def);
  const ps=(pieces||[]).filter(Boolean).concat(lvFires);
  for(const p of ps){
    if(p.el==='earth') for(const [r,c] of pieceCells(p)) g[r*COLS+c]=EARTH;
    if(p.el==='wind') for(const [r,c] of pieceCells(p)) wind[r*COLS+c]=p.dir*(p.strong?2:1);
  }
  // pelaajan vesi on lähde; len = rajallinen määrä ruutuja, muuten virtaa koko ajan
  for(const p of ps) if(p.el==='water') sources.push({r:p.r,c:p.c,t0:p.t0||0,len:p.len||0});
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
  const w={g, wind, ign, fireEnd, start, keys, exit, guards, hasWind, allKeys:(1<<keys.length)-1,
    initWet, sources, hasWater: initWet.length>0 || sources.length>0, ws:null};
  // aika, jonka jälkeen mikään ei enää muutu (ratkaisija käyttää). Laskee veden loppuun asti vasta kysyttäessä.
  Object.defineProperty(w,'tEnd',{get(){ if(!w.hasWater) return fireEnd; const S=wsim(w); S.advance(1e9); return Math.max(fireEnd,S.frozenAt*WSTEP); }});
  return w;
}

// ---------- vesi ----------
// Vesi liikkuu ruutu kerrallaan. Säännöt:
//  1. Paikallaan oleva vesi putoaa, jos alla on tyhjää.
//  2. Vesiruutu, jonka vierestä samalta riviltä pääsee reunalle (kohtaan jonka alla on tyhjää), lähtee valumaan.
//  3. Lähde tuottaa vesiruudun EMIT askeleen välein. Liikkuva vesiruutu putoaa, tai pinnalla
//     liukuu kohti lähintä reunaa, tai jos reunaa ei ole, asettuu paikalleen. Täysi allas valuu siis
//     matalamman reunansa yli.
//  4. Maa imee päällään olevaa vettä (hitaammin paksumpi maa). Imeytynyt vesi tippuu maakerroksen
//     alta, jos siellä on tyhjää; muuten se jää maahan. Märästä maasta tulee mutaa, kun vesi on poissa.
// Tila tallennetaan askelittain: bitti 1 = vettä, 2 = pystysuora virta, 8 = vaakasuora virta, 4 = märkä maa.
function wsim(w){
  if(w.ws) return w.ws;
  const N=COLS*ROWS, g=w.g, ign=w.ign;
  const wet=new Uint8Array(N), mud=new Uint8Array(N), cnt=new Uint16Array(N);
  const lastV=new Int32Array(N).fill(-99), lastH=new Int32Array(N).fill(-99);
  for(const i of w.initWet) if(!solid(g[i])) wet[i]=1;
  const srcs=w.sources.map(s=>({r:s.r,c:s.c,next:Math.max(1,Math.ceil((s.t0||0)/WSTEP)),left:s.len>0?s.len:Infinity}));
  let parcels=[], k=0, tick=0, stable=0;
  const DS=Math.round(DRAIN/WSTEP);
  const solidAt=i=> solid(g[i]) && !(ign[i]>=0 && tick>=ign[i]+BURN);
  const openAt=(r,c)=> r>=0&&r<ROWS&&c>=0&&c<COLS && !solidAt(r*COLS+c) && !wet[r*COLS+c];
  const belowOpen=(r,c)=> r+1>=ROWS || openAt(r+1,c);
  // lähin reuna samalla rivillä: suunta -1/1 tai 0
  function findDrop(r,c,pref){
    let best=0, bd=1e9;
    for(const d of (pref<0?[-1,1]:[1,-1])) for(let n=1;n<COLS;n++){
      const cc=c+d*n; if(!openAt(r,cc)) break;
      if(belowOpen(r,cc)){ if(n<bd){ bd=n; best=d; } break; }
    }
    return best;
  }
  function snap(){
    const a=new Uint8Array(N);
    for(let i=0;i<N;i++) a[i]=wet[i] | (k-lastV[i]<=EMIT?2:0) | (mud[i]?4:0) | (k-lastH[i]<=EMIT?8:0);
    return a;
  }
  function stepW(){
    k++; tick=k*WSTEP;
    // 1. painovoima alhaalta ylös: koko pylväs putoaa ruudun kerralla
    for(let r=ROWS-1;r>=0;r--) for(let c=0;c<COLS;c++){ const i=r*COLS+c; if(!wet[i]) continue;
      if(solidAt(i)){ wet[i]=0; continue; }
      if(r+1>=ROWS){ wet[i]=0; continue; }
      if(openAt(r+1,c)){ wet[i]=0; wet[i+COLS]=1; lastV[i+COLS]=k; } }
    // 2. reunan yli valuva vesi lähtee liikkeelle
    for(let r=ROWS-1;r>=0;r--) for(let c=0;c<COLS;c++){ const i=r*COLS+c; if(!wet[i]) continue;
      const d=findDrop(r,c,1); if(d){ wet[i]=0; parcels.push({r,c,d}); } }
    // 3. lähteet (veden alla oleva lähde nostaa vettä pintaan)
    for(const s of srcs){ if(s.left<=0 || k<s.next) continue; s.next=k+EMIT;
      let r=s.r; while(r>=0 && wet[r*COLS+s.c]) r--;
      if(r>=0 && openAt(r,s.c)){ parcels.push({r,c:s.c,d:0}); s.left--; } }
    // 4. liikkuvat vesiruudut
    const next=[];
    for(const p of parcels){
      let r=p.r, c=p.c;
      while(r>=0 && wet[r*COLS+c]) r--;                       // toinen ehti asettua samaan ruutuun: nouse pintaan
      if(r<0 || solidAt(r*COLS+c)) continue;
      if(r+1>=ROWS) continue;                                 // valui ulos kentästä
      if(openAt(r+1,c)){ p.r=r+1; p.c=c; lastV[(r+1)*COLS+c]=k; next.push(p); continue; }
      const d=findDrop(r,c,p.d||1);
      if(d){ p.r=r; p.c=c+d; p.d=d; lastH[r*COLS+c+d]=k; lastH[r*COLS+c]=k; next.push(p); continue; }
      wet[r*COLS+c]=1;                                        // asettuu
    }
    parcels=next;
    // 5. maa imee
    for(let i=COLS;i<N;i++){
      if(g[i]!==EARTH || !wet[i-COLS]){ cnt[i]=0; continue; }
      mud[i]=1;
      let d=0; while(i+d*COLS<N && g[i+d*COLS]===EARTH) d++;
      if(++cnt[i] < DS*d) continue;
      cnt[i]=0;
      // pinta laskee: poistetaan altaan ylin ruutu (lähin tästä sarakkeesta), jottei altaaseen jää reikiä
      const c0=i%COLS, seen=new Set([i-COLS]), q=[i-COLS]; let j=i-COLS;
      for(let n=0;n<q.length;n++){ const x=q[n], xr=(x/COLS)|0, xc=x%COLS, jr=(j/COLS)|0;
        if(xr<jr || (xr===jr && Math.abs(xc-c0)<Math.abs(j%COLS-c0))) j=x;
        for(const y of [x-COLS,x+COLS,xc>0?x-1:-1,xc<COLS-1?x+1:-1]) if(y>=0 && y<N && wet[y] && !seen.has(y)){ seen.add(y); q.push(y); } }
      wet[j]=0;
      const b=i+d*COLS, br=(b/COLS)|0, c=i%COLS;
      if(br<ROWS && openAt(br,c)) parcels.push({r:br,c,d:0});           // tippuu maakerroksen alta
    }
  }
  const pending=()=> srcs.some(s=>s.left>0 && s.left!==Infinity) || tick<w.fireEnd || cnt.some(x=>x>0);
  const S={snaps:[snap()], frozenAt:-1,
    advance(kk){
      while(this.frozenAt<0 && k<kk){
        stepW(); const a=snap(), prev=this.snaps[this.snaps.length-1];
        let same=true; for(let i=0;i<N;i++) if(a[i]!==prev[i]){ same=false; break; }
        stable = same? stable+1 : 0; this.snaps.push(a);
        if((stable>=W_STEADY && !pending()) || k>=W_HORIZON) this.frozenAt=k;
      }
    },
    at(t){ const kk=Math.floor(t/WSTEP); this.advance(kk); return this.snaps[Math.min(kk,this.snaps.length-1)]; }
  };
  w.ws=S; return S;
}
const NOWATER=new Uint8Array(COLS*ROWS);
function waterRawAt(w,t){ return w.hasWater? wsim(w).at(Math.max(0,t)) : NOWATER; }
// Pelaajan kokema vesi. Vajaa pintarivi (piirretään tasaisena ohuena kerroksena koko altaan levyltä)
// lasketaan täydeksi, jos sitä on vähintään puolet rivin leveydestä, muuten sitä ei ole lainkaan.
// Näin uiminen ja kahlaaminen vastaavat sitä, mitä ruudulla näkyy.
function waterAt(w,t){
  if(!w.hasWater) return NOWATER;
  const kk=Math.floor(Math.max(0,t)/WSTEP); if(w._wk===kk) return w._wa;
  const S=wsim(w), raw=S.at(kk*WSTEP), ki=Math.min(kk,S.snaps.length-1);
  S.eff=S.eff||[]; if(S.eff[ki]){ w._wk=kk; return (w._wa=S.eff[ki]); }
  const a=raw.slice(), tick=ki*WSTEP, g=w.g, ign=w.ign;
  const solidAt=(r,c)=>{ if(r<0||r>=ROWS||c<0||c>=COLS) return true; const i=r*COLS+c; return solid(g[i]) && !(ign[i]>=0 && tick>=ign[i]+BURN); };
  const wet=(r,c)=> r>=0&&r<ROWS&&c>=0&&c<COLS&&(raw[r*COLS+c]&1);
  for(let r=0;r<ROWS;r++){ let c=0;
    while(c<COLS){
      if(solidAt(r,c)){ c++; continue; }
      let c1=c; while(c1+1<COLS && !solidAt(r,c1+1)) c1++;
      let n=0, held=true, top=true;
      for(let x=c;x<=c1;x++){ if(wet(r,x)) n++; if(!(r+1>=ROWS||solidAt(r+1,x)||wet(r+1,x))) held=false; if(wet(r-1,x)) top=false; }
      const W=c1-c+1;
      if(n && n<W && held && top){ const full=2*n>=W; for(let x=c;x<=c1;x++){ const i=r*COLS+x; a[i]= full? (a[i]|1) : (a[i]&~1); } }
      c=c1+1;
    }
  }
  S.eff[ki]=a; w._wk=kk; return (w._wa=a);
}
// onko ruudussa vettä hetkellä t; muta = märkä maa, jonka päällä ei ole vettä
function wetAt(w,t,i){ return (waterAt(w,t)[i]&1)===1; }
function mudAt(w,t,i){ const a=waterAt(w,t); return (a[i]&4) && !(i>=COLS && (a[i-COLS]&1)); }

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
// kivi, maa ja puuaita ovat kiinteitä: niiden sisään ei voi kävellä eikä hypätä, vain päälle.
// Puulattian läpi voi hypätä alhaalta; uidessa sekin estää (altaan reunat).
function blocked(w,s,x,y,swim){
  if(x<0 || x+U>COLS*U) return true;
  const r0=Math.floor((y-8)/U), r1=Math.floor((y-1)/U), c0=x>>2, c1=(x+U-1)>>2;
  for(let r=r0;r<=r1;r++) for(let c=c0;c<=c1;c++){
    const t=tileAt(w,s,r,c);
    if(t===WALL||t===FENCE||t===EARTH) return true;
    if(swim && t===WOOD) return true;
  }
  return false;
}
function bodyCols(s){ return [s.x>>2, (s.x+U-1)>>2]; }
function depthAt(w,t,r,c){ let n=0; while(r>=0 && r<ROWS && wetAt(w,t,r*COLS+c)){ n++; r++; } return n; }
function deepWaterAt(w,s){
  const r=Math.floor((s.y-1)/U); const [c0,c1]=bodyCols(s);
  for(let c=c0;c<=c1;c++) if(depthAt(w,s.t,r,c)>=2) return true;
  return false;
}
function feetInWater(w,s){
  const r=Math.floor((s.y-1)/U); const [c0,c1]=bodyCols(s);
  for(let c=c0;c<=c1;c++) if(r>=0&&r<ROWS&&wetAt(w,s.t,r*COLS+c)) return true;
  return false;
}
// mutaa jalkojen alla: kävely ja hyppy hitaita kuin kahlatessa
function onMud(w,s){
  if(s.y%U) return false; const r=s.y/U; const [c0,c1]=bodyCols(s);
  for(let c=c0;c<=c1;c++) if(r<ROWS && mudAt(w,s.t,r*COLS+c)) return true;
  return false;
}
// uidessa jalkojen tavoitekorkeus: pinnan yläreuna + FLOAT
function floatY(w,s){
  const [c0,c1]=bodyCols(s); let best=null;
  for(let c=c0;c<=c1;c++){
    let r=Math.floor((s.y-1)/U);
    if(r<0||r>=ROWS||!wetAt(w,s.t,r*COLS+c)){ r++; if(r<0||r>=ROWS||!wetAt(w,s.t,r*COLS+c)) continue; }
    while(r-1>=0 && wetAt(w,s.t,(r-1)*COLS+c)) r--;
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
  if(supportCols(w,s).length){ land(s); return true; }  // sivuliike toi jalkojen alle tason: laskeudu sen päälle
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
      const sp = (feetInWater(w,s)||onMud(w,s))? SWIM_SP : WALK_SP;
      if(inp.dir) s.face=inp.dir;
      if(inp.jump){ s.m=1; s.jt=0; s.js=0; s.jd=inp.dir*sp; s.peak=s.y; }
      else drift(w,s,inp.dir*sp+wsp,false);
    }
  }
  if(s.m===3){
    if(inp.dir) s.face=inp.dir;
    if(inp.jump && s.dv<=0 && s.y===floatY(w,s)){ s.m=1; s.jt=0; s.js=1; s.jd=inp.dir*WALK_SP; s.peak=s.y; }
    else{
      drift(w,s,inp.dir*SWIM_SP+wsp,true);
      const fy=floatY(w,s);
      if(fy===null){ s.m=2; s.peak=s.y; s.dv=0; }
      else if(s.dv>0){                                 // sukellus jatkuu, kunnes vauhti loppuu tai pohja tulee vastaan
        const n = s.dv>8? 2 : 1;                       // alussa nopeasti, sitten hidastuen
        for(let q=0;q<n;q++){ s.dv--; if(supportCols(w,s).length){ s.dv=0; break; } s.y++; }
      }
      else if(s.y<fy){ if(!supportCols(w,s).length) s.y++; }
      else if(s.y>fy && !blocked(w,s,s.x,s.y-1,false)) s.y--;
      if(s.m===3 && s.dv<=0 && fy!==null && s.y<=fy && supportCols(w,s).length && !deepWaterAt(w,s)) s.m=0;
    }
  }
  else if(s.m===1){
    const J=JUMPS[s.js||0], dy=J[s.jt++];
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
    if(s.m===1 && s.jt>=J.length) s.m=2;
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
  const src=new Set(base.sources.map(q=>q.r*COLS+q.c));
  const {g,keys}=base;
  const key=(r,c)=>keys.some(K=>K.r===r&&K.c===c);
  const cells=pieceCells(piece);
  for(const [r,c] of cells) if(r<1||r>=ROWS||c<0||c>=COLS) return false;
  if(piece.el==='earth') return cells.every(([r,c])=>{ const t=g[r*COLS+c]; return (t===E||t===WATER) && !key(r,c); });
  if(piece.el==='fire'){ const [r,c]=cells[0]; const t=g[r*COLS+c]; return (t===E||burnable(t)) && !key(r,c); }
  if(piece.el==='wind') return cells.every(([r,c])=>{ const t=g[r*COLS+c]; return t===E||t===WATER; });
  if(piece.el==='water'){ const [r,c]=cells[0], i=r*COLS+c; return g[i]===E && !src.has(i); }
  return false;
}
// lähteen esikatselu: ruudut, joiden läpi vesi ensin putoaa
function waterPreview(def, piece, others){
  const w=makeWorld(def,(others||[]).filter(o=>o && o.el!=='water')), out=[];
  for(let r=piece.r;r<ROWS;r++){ const i=r*COLS+piece.c; if(solid(w.g[i])) break; out.push(i); }
  return out;
}

const API={U,COLS,ROWS,JUMP,MAXFALL,BURN,FIRECH,DRAIN,WSTEP,wetAt,mudAt,waterAt,waterRawAt,WIND_H,E,EARTH,WALL,WOOD,FENCE,SPIKE,EXIT,WATER,CH,WINDCH,ELEMENTS,
  parseLevel,makeWorld,newState,cloneS,step,freeFor,tileAt,burningAt,supportCols,guardPos,settled,pieceCells,waterPreview,floatY,burnable};
if(typeof module!=='undefined') module.exports=API;
if(typeof self!=='undefined') self.PPEngine=API;
