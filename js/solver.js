// Ratkaisija: etsii reitin lepotilasta toiseen (kävely, uinti, hypyt, odotus), käyttää samaa moottoria kuin peli.
// Toimii Nodessa (require) ja selaimen workerissa (importScripts).
const PPSolver = (function(){
  const ENG = (typeof module!=='undefined' && typeof require!=='undefined') ? require('./engine.js') : self.PPEngine;
  const {ROWS,COLS,U,makeWorld,newState,cloneS,step,freeFor,settled,canClimb,WIND_H} = ENG;
  const NOIN={dir:0,jump:false};
  const gcd=(a,b)=>b?gcd(b,a%b):a, lcm=(a,b)=>a/gcd(a,b)*b;

  // palauttaa true / false / null (raja tuli vastaan)
  function solve(def,pieces,opts={}){
    const w=makeWorld(def,pieces); const s0=newState(w);
    const P=w.guards.length? w.guards.reduce((a,G)=>lcm(a,G.P),1):1;
    const timeDep = P>1 || w.tEnd>0;
    // aika vaikuttaa tilaan: tulen ja imeytymisen aikana tarkka hetki, sen jälkeen vain vartijoiden vaihe
    const tk = s => (s.t < w.tEnd)? 'f'+s.t : 'p'+(s.t%P);
    const rest = s => settled(w,s);
    const q=[]; let won=null, cnt=0;
    const dom=new Map();
    const push=s=>{
      if(s.won){ won=s; return true; }
      if(s.dead) return false;
      const pk=s.x+','+s.y+','+s.m+','+s.dv+','+tk(s), kk=s.keys;
      let arr=dom.get(pk); if(!arr){ arr=[]; dom.set(pk,arr); }
      for(const k2 of arr) if((k2&kk)===kk) return false;
      for(let i=arr.length-1;i>=0;i--) if((kk&arr[i])===arr[i]) arr.splice(i,1);
      arr.push(kk); cnt++; q.push(s); return false; };
    const air=s=>{ let n=0; while(!rest(s)&&!s.dead&&!s.won&&n++<400) step(w,s,NOIN); return s; };
    push(air(s0));
    const limit=opts.limit||300000;
    for(let qi=0; qi<q.length; qi++){
      const node=q[qi];
      if(cnt>limit) return null;
      if(timeDep || w.hasWind){ const t=cloneS(node); step(w,t,NOIN); air(t); if(push(t)) break; }
      let stop=false;
      // tikkaat: kiipeä ylös tai alas, jokainen ruudun raja on oma pysähdyspaikka
      for(const v of [-1,1]){
        if(stop || !(node.m===4 || canClimb(w,node,v))) continue;
        let s=cloneS(node), lastY=-1, still=0;
        for(let i=0;i<400;i++){
          step(w,s,{dir:0,jump:false,v});
          if(s.dead) break;
          if(s.won){ push(s); stop=true; break; }
          if(!rest(s)){ air(s); if(push(s)) stop=true; break; }
          if(s.m!==4 || s.y%U===0){ if(push(cloneS(s))){ stop=true; break; } }
          if(s.m!==4) break;
          if(s.y===lastY){ if(++still>2) break; } else still=0;   // kiipeää joka toisella tickillä
          lastY=s.y;
        }
      }
      if(stop) break;
      for(const d of [-1,1]){
        let s=cloneS(node), lastX=-1;
        for(let i=0;i<200;i++){
          if(s.m===0 && (canClimb(w,s,-1)||canClimb(w,s,1)) && push(cloneS(s))){ stop=true; break; }   // tikkaiden kohta on oma solmu
          for(const j of [-1,0,1]){ const t=cloneS(s); step(w,t,{dir:j,jump:true}); air(t); if(push(t)){stop=true;break;} }
          if(stop) break;
          const k0=s.keys, m0=s.m;
          step(w,s,{dir:d,jump:false});
          if(s.dead) break;
          if(s.won){ push(s); stop=true; break; }
          if(!rest(s)){ air(s); if(push(s)) stop=true; break; }
          if(s.keys!==k0 || s.m!==m0){ if(push(s)) stop=true; break; }
          if(s.x===lastX) break; lastX=s.x;
        }
        if(stop) break;
      }
      if(won) break;
    }
    return !!won;
  }

  const solPieces=L=>(L.sol||[]).map((s,k)=>s && Object.assign({},L.pieces[k],{r:s.r,c:s.c}));

  function placements(def,p,others){
    const out=[];
    for(let r=1;r<ROWS;r++) for(let c=0;c<COLS;c++){
      const q=Object.assign({},p,{r,c});
      if((p.el==='earth'||p.el==='wind') && c+p.len>COLS) continue;
      if(freeFor(def,q,others)) out.push(q);
    }
    return out;
  }

  // Koko tarkistus editorille. report(viesti) kutsutaan välivaiheissa.
  function check(L,opts={},report=()=>{}){
    const res={};
    const sol=solPieces(L);
    res.missingSol = sol.length!==L.pieces.length || sol.some(s=>!s);
    report({key:'pr.none'});
    res.none = solve(L,[],opts);
    if(!res.missingSol){
      report({key:'pr.sol'});
      res.intended = solve(L,sol,opts);
      if(sol.length>=2){
        res.dropOne=[];
        for(let k=0;k<sol.length;k++){ report({key:'pr.drop',vars:{n:k+1}}); res.dropOne.push(solve(L,sol.filter((_,j)=>j!==k),opts)); }
      }
    }
    if(opts.alternatives && L.pieces.length===1){
      const list=placements(L,L.pieces[0],[]); let n=0, found=[];
      list.forEach((q,i)=>{ if(i%20===0) report({key:'pr.alt',vars:{i,n:list.length}}); if(solve(L,[q],{limit:opts.limit})===true){ n++; found.push(q); } });
      res.alternatives={count:n, list:found};
    }
    return res;
  }

  return {solve,check,solPieces,placements};
})();

if(typeof module!=='undefined') module.exports=PPSolver;
if(typeof self!=='undefined') self.PPSolver=PPSolver;
