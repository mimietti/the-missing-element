// Tarkistaa kentät: node tools/check.js [kenttänumerot...] [--alt]
const S=require('../js/solver.js'); const LEVELS=require('../js/levels.js');
const args=process.argv.slice(2), alt=args.includes('--alt');
const which=args.filter(a=>/^\d+$/.test(a)).map(Number);
let bad=0;
LEVELS.forEach((L,i)=>{
  if(which.length && !which.includes(i+1)) return;
  const t0=Date.now(); const r=S.check(L,{alternatives:alt,limit:600000});
  const ok = r.none===false && r.intended===true && (!r.dropOne || r.dropOne.every(x=>x===false));
  if(!ok) bad++;
  console.log(`${ok?'OK ':'!! '} ${String(i+1).padStart(2)} ${L.name.padEnd(22)} ilman=${r.none} ratkaisu=${r.intended}`+
    (r.dropOne?` pudota-yksi=${r.dropOne}`:'')+(r.alternatives?` vaihtoehtoja=${r.alternatives.count}`:'')+`  ${((Date.now()-t0)/1000).toFixed(1)}s`);
});
process.exit(bad?1:0);
