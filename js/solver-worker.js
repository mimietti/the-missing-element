importScripts('engine.js','solver.js');
onmessage = e => {
  const {level, opts} = e.data;
  try{
    const res = PPSolver.check(level, opts||{}, msg => postMessage({progress:msg}));
    postMessage({done:true, res});
  }catch(err){ postMessage({error:String(err && err.message || err)}); }
};
