// Yhteinen piirto pelille ja editorille: luonnonmateriaalit, skandinaavinen värimaailma.
const ART = (function(){
  const C = {
    bg:'#F4F1EA', ink:'#2C3A41', mute:'#7C878A', line:'#D3D8D2', paper:'#F6F6F2',
    stone:'#7F8D92', stoneDark:'#6A787D',
    earth:'#8A6A48', earthDark:'#6C5136', moss:'#7E9A57', wetEarth:'#5E4631', mud:'#4E3B2A', mudHi:'#9DB8C2',
    wood:'#CFA266', woodDark:'#A67945', char:'#3B2F28',
    water:'#5F9DB5', waterHi:'#DCEEF3',
    flameR:'#C8463B', flameO:'#E8833A', flameY:'#F6CB4C',
    grass:'#6F8F45', grassHi:'#93AE5E', windC:'#6F95A1', leaf:'#B9852E',
    lingon:'#BE4A3F', mustard:'#D8A73A', fjord:'#3D6F79', key:'#D9A12A'
  };
  const rr=(g,x,y,w,h,r)=>{ g.beginPath(); g.roundRect? g.roundRect(x,y,w,h,r) : g.rect(x,y,w,h); };
  const hash=(r,c)=>{ let h=(r*73856093)^(c*19349663); h=(h^(h>>>13))*1274126177; return ((h^(h>>>16))>>>0)/4294967296; };
  const mix=(a,b,t)=>{ const p=x=>[parseInt(x.slice(1,3),16),parseInt(x.slice(3,5),16),parseInt(x.slice(5,7),16)];
    const A=p(a),B=p(b); return '#'+A.map((v,i)=>Math.round(v+(B[i]-v)*t).toString(16).padStart(2,'0')).join(''); };

  function stone(g,x,y,s,r){
    g.fillStyle=C.stone; g.fillRect(x,y,s+.5,s+.5);
    g.strokeStyle='rgba(255,255,255,.22)'; g.lineWidth=Math.max(1,s*.04);
    g.beginPath(); g.moveTo(x,y+s*.5); g.lineTo(x+s,y+s*.5);
    const a=r%2?.3:.7, b=r%2?.7:.3;
    g.moveTo(x+s*a,y); g.lineTo(x+s*a,y+s*.5); g.moveTo(x+s*b,y+s*.5); g.lineTo(x+s*b,y+s); g.stroke();
  }
  // maa: ohut laatta, tai täysi ruutu kun alla on kiinteää (pankki, kumpu)
  // o.wet 0..1: kastuu veden alla; o.mud: vesi on imeytynyt läpi, pinnalla mutaa
  function earth(g,x,y,s,o={}){
    const h = o.full? s+.5 : s*.42;
    let col = o.mine? mix(C.earth,'#FFFFFF',.25) : C.earth;
    if(o.mud) col=mix(col,C.wetEarth,.8); else if(o.wet) col=mix(col,C.wetEarth,Math.min(1,o.wet));
    g.fillStyle = col; rr(g,x,y,s+(o.full?.5:0),h,o.full?0:s*.1); g.fill();
    if(o.mud){
      g.fillStyle=C.mud; rr(g,x,y,s+.5,s*.16,s*.05); g.fill();
      const k=o.seed||.5; g.fillStyle=C.mudHi; g.globalAlpha=.55;
      g.beginPath(); g.ellipse(x+s*(.2+.5*k),y+s*.07,s*.14,s*.035,0,0,7); g.fill(); g.globalAlpha=1;
      if(!o.full){ g.fillStyle=C.earthDark; g.fillRect(x+s*.08,y+h-s*.08,s*.84,s*.08); }
      return;
    }
    if(!o.full){ g.fillStyle=C.earthDark; g.fillRect(x+s*.08,y+h-s*.08,s*.84,s*.08); }
    // pieniä kiviä
    g.fillStyle='rgba(255,255,255,.18)'; const k=o.seed||0;
    g.beginPath(); g.arc(x+s*(.25+.5*k),y+h*.62,s*.05,0,7); g.fill();
    if(!o.covered){ g.fillStyle=C.moss; rr(g,x,y,s+.5,s*.11,s*.05); g.fill(); }
    if(o.mine){ g.strokeStyle=C.mustard; g.lineWidth=2; g.setLineDash([4,3]); rr(g,x+1,y+1,s-2,h-2,s*.08); g.stroke(); g.setLineDash([]); }
  }
  function wood(g,x,y,s,o={}){
    const h=s*.3, ch=o.char||0;
    g.fillStyle = ch? mix(C.wood,C.char,Math.min(1,ch)) : C.wood; rr(g,x+.5,y,s-1,h,s*.06); g.fill();
    g.strokeStyle = ch? mix(C.woodDark,C.char,Math.min(1,ch)) : C.woodDark; g.lineWidth=1;
    g.beginPath(); g.moveTo(x+s*.5,y+1); g.lineTo(x+s*.5,y+h-1); g.moveTo(x+s*.06,y+h*.55); g.lineTo(x+s*.4,y+h*.55); g.stroke();
    g.fillStyle=C.woodDark; g.beginPath(); g.arc(x+s*.12,y+h*.3,s*.025,0,7); g.arc(x+s*.88,y+h*.3,s*.025,0,7); g.fill();
  }
  function fence(g,x,y,s,o={}){
    const ch=o.char||0, col= ch? mix(C.wood,C.char,Math.min(1,ch)) : C.wood, dk= ch? mix(C.woodDark,C.char,Math.min(1,ch)) : C.woodDark;
    g.fillStyle=dk; g.fillRect(x+s*.04,y+s*.22,s*.92,s*.12); g.fillRect(x+s*.04,y+s*.68,s*.92,s*.12);
    for(const px of [.12,.56]){
      g.fillStyle=col; const w=s*.32;
      if(o.top){ g.beginPath(); g.moveTo(x+s*px,y+s); g.lineTo(x+s*px,y+s*.18); g.lineTo(x+s*px+w/2,y+s*.02); g.lineTo(x+s*px+w,y+s*.18); g.lineTo(x+s*px+w,y+s); g.fill(); }
      else g.fillRect(x+s*px,y,w,s+.5);
      g.strokeStyle=dk; g.lineWidth=1; g.beginPath(); g.moveTo(x+s*px+w*.5,y+s*.3); g.lineTo(x+s*px+w*.5,y+s*.9); g.stroke();
    }
  }
  function spike(g,x,y,s){
    const n=3,w=s/n;
    for(let k=0;k<n;k++){ g.fillStyle=C.ink; g.beginPath(); g.moveTo(x+k*w,y+s); g.lineTo(x+k*w+w/2,y+s*.48); g.lineTo(x+(k+1)*w,y+s); g.fill();
      g.fillStyle=C.lingon; g.beginPath(); g.moveTo(x+k*w+w*.32,y+s*.66); g.lineTo(x+k*w+w/2,y+s*.48); g.lineTo(x+k*w+w*.68,y+s*.66); g.fill(); }
  }
  // vesi: läpikuultava täyttö, pinnassa liikkuva aaltoviiva (tuulessa korkeampi)
  function water(g,x,y,s,o={}){
    const f=o.frame||0, a=o.alpha??.55;
    g.globalAlpha=a; g.fillStyle=C.water;
    // o.w, o.h: leveämpi tai matalampi vesialue (oletus yksi ruutu)
    const W=o.w||s, H=o.h||s, n=Math.max(8,Math.round(8*W/s)), top=Math.min(s*.18,H*.4);
    if(o.surface){
      const amp=Math.min(s*(o.wind? .09 : .04),H*.3), sp=o.wind? .006*Math.sign(o.wind) : .002, ph=f*sp;
      const yAt=xx=> y+top+Math.sin((xx/s)*Math.PI*2+ph*6)*amp;
      g.beginPath(); g.moveTo(x,y+H);
      for(let k=0;k<=n;k++){ const xx=x+W*k/n; g.lineTo(xx, yAt(xx)); }
      g.lineTo(x+W,y+H); g.closePath(); g.fill();
      g.globalAlpha=Math.min(1,a+.3); g.strokeStyle=C.waterHi; g.lineWidth=Math.max(1.5,s*.06);
      g.beginPath(); for(let k=0;k<=n;k++){ const xx=x+W*k/n; k? g.lineTo(xx,yAt(xx)) : g.moveTo(xx,yAt(xx)); } g.stroke();
    } else g.fillRect(x,y,W,H);
    g.globalAlpha=1;
  }
  // liekki: kolme kieltä, välkkyy; k = voimakkuus 0..1
  function flame(g,x,y,s,f,seed,k=1){
    const base=y+s, tongues=[[.3,.55],[.5,.85],[.7,.6]];
    for(const [layer,col,sc] of [[0,C.flameR,1],[1,C.flameO,.78],[2,C.flameY,.5]]){
      g.fillStyle=col;
      for(const [px,hh] of tongues){
        const fl=Math.sin(f/90+seed*7+px*9)*.12+Math.sin(f/53+seed*3)*.08;
        const h=s*(hh+fl)*sc*k*1.1, w=s*.26*sc;
        const cx=x+s*px+Math.sin(f/70+px*5+seed)*s*.04;
        g.beginPath(); g.moveTo(cx-w,base); g.quadraticCurveTo(cx-w*.9,base-h*.55,cx,base-h); g.quadraticCurveTo(cx+w*.9,base-h*.55,cx+w,base); g.closePath(); g.fill();
      }
    }
  }
  // heinätupsu maan päällä; bend -1..1 (tuulen suunta ja voima)
  function grass(g,x,y,s,seed,f,bend){
    const sway=Math.sin(f/400+seed*6)*.08;
    const b=bend + sway + (bend? Math.sin(f/120+seed*5)*.12*Math.abs(bend) : 0);
    const n=3, x0=x+s*(.2+.5*seed);
    for(let k=0;k<n;k++){
      const bx=x0+(k-1)*s*.07, h=s*(.26+.08*((k+seed*3)%1.5));
      g.strokeStyle= k===1? C.grass : C.grassHi; g.lineWidth=Math.max(1.2,s*.045); g.lineCap='round';
      g.beginPath(); g.moveTo(bx,y); g.quadraticCurveTo(bx+b*h*.3,y-h*.6,bx+b*h*.9,y-h*(1-Math.abs(b)*.35)); g.stroke();
    }
  }
  // tuulen viirut ruudussa; v = -2..2
  function wind(g,x,y,s,v,f,seed){
    // viirut kulkevat ruudun poikki ja häipyvät reunoilla, joten vierekkäiset ruudut muodostavat yhtenäisen virran
    const d=Math.sign(v), str=Math.abs(v), n=str===2?3:2, speed=(str===2? 1.1 : .5)/1000;
    g.strokeStyle=C.windC; g.lineCap='round'; g.lineWidth=Math.max(1.5,s*(str===2?.075:.06));
    for(let k=0;k<n;k++){
      const ph=((f*speed+seed*3.1+k*.43)%1+1)%1;
      const yy=y+s*((k+.5)/n)+Math.sin(f/400+seed*9+k)*s*.06;
      const len=s*(str===2?.7:.5), xs = d>0? x+ph*s-len*.5 : x+s-ph*s+len*.5;
      g.globalAlpha=Math.sin(ph*Math.PI)*.85;
      g.beginPath(); g.moveTo(xs,yy); g.quadraticCurveTo(xs+d*len*.5,yy-s*.06,xs+d*len,yy); g.stroke();
    }
    if(str===2){ // lentävä lehti
      const ph=((f*speed*.8+seed*5)%1+1)%1, lx= d>0? x+ph*s : x+s-ph*s, ly=y+s*(.3+.4*seed)+Math.sin(f/90+seed)*s*.1;
      g.globalAlpha=Math.sin(ph*Math.PI); g.fillStyle=C.leaf; g.save(); g.translate(lx,ly); g.rotate(f/200*d+seed*5); g.beginPath(); g.ellipse(0,0,s*.09,s*.045,0,0,7); g.fill(); g.restore();
    }
    g.globalAlpha=1;
  }
  // virtaava vesi: pystysuora nauha tai ohut kerros pinnalla, liikkuvat valojuovat
  function stream(g,x,y,s,o={}){
    const f=o.frame||0, a=o.alpha??.55;
    g.globalAlpha=a; g.fillStyle=C.water;
    if(o.v){ const w=s*.36, x0=x+(s-w)/2; g.fillRect(x0,y,w,s+.5);
      g.globalAlpha=Math.min(1,a+.25); g.strokeStyle=C.waterHi; g.lineWidth=Math.max(1,s*.05);
      const ph=(f*.004)%1; g.beginPath();
      for(let k=-1;k<2;k++){ const yy=y+((k+ph)*s*.6+s*.2); if(yy<y||yy+s*.18>y+s) continue; g.moveTo(x0+w*.35,yy); g.lineTo(x0+w*.35,yy+s*.18); }
      g.stroke(); }
    else { const h=s*.26, y0=y+s-h, d=o.dir||1, ph=f*.006*d;
      g.beginPath(); g.moveTo(x,y+s);
      for(let k=0;k<=6;k++){ const xx=x+s*k/6; g.lineTo(xx,y0+Math.sin((xx/s)*Math.PI*2-ph*3)*s*.04); }
      g.lineTo(x+s,y+s); g.closePath(); g.fill(); }
    g.globalAlpha=1;
  }
  // lähde: kivinen suu, josta vesi tulee
  function source(g,x,y,s,f=0){
    g.fillStyle=C.stoneDark; rr(g,x+s*.18,y+s*.06,s*.64,s*.34,s*.1); g.fill();
    g.fillStyle=C.ink; rr(g,x+s*.34,y+s*.26,s*.32,s*.14,s*.05); g.fill();
    g.fillStyle=C.water; const ph=((f*.002)%1+1)%1;
    g.beginPath(); g.ellipse(x+s*.5,y+s*(.5+ph*.4),s*.07,s*.1,0,0,7); g.fill();
  }
  function key(g,cx,cy,s,col){
    g.strokeStyle=col||C.key; g.lineWidth=Math.max(2,s*.1); g.lineCap='round';
    g.beginPath(); g.arc(cx-s*.12,cy,s*.14,0,7); g.stroke();
    g.beginPath(); g.moveTo(cx+s*.02,cy); g.lineTo(cx+s*.3,cy); g.moveTo(cx+s*.22,cy); g.lineTo(cx+s*.22,cy+s*.12); g.stroke();
  }
  // elementtikuvake napeille (w × h -kangas)
  function icon(g,el,w,h,o={}){
    g.clearRect(0,0,w,h); const s=Math.min(w,h)*.9, x=(w-s)/2, y=(h-s)/2, f=o.frame||0;
    if(o.dim) g.globalAlpha=.35;
    if(el==='earth'){ earth(g,x,y+s*.3,s,{seed:.3}); grass(g,x,y+s*.3,s,.5,0,0); }
    else if(el==='fire'){ wood(g,x,y+s*.62,s); flame(g,x,y-s*.08,s,f,.3,.95); }
    else if(el==='wind'){ const d=o.dir||1, st=o.strong?2:1;
      g.strokeStyle=C.fjord; g.lineCap='round'; g.lineWidth=Math.max(2,s*.08);
      for(const [yy,l] of [[.3,.7],[.52,.9],[.74,.6]]){ const x0= d>0? x+s*.05 : x+s*.95; g.beginPath(); g.moveTo(x0,y+s*yy); g.lineTo(x0+d*s*l,y+s*yy); g.stroke(); }
      g.fillStyle=C.fjord; const tx= d>0? x+s*.98 : x+s*.02; g.beginPath(); g.moveTo(tx,y+s*.52); g.lineTo(tx-d*s*.2,y+s*.38); g.lineTo(tx-d*s*.2,y+s*.66); g.fill();
      if(st===2){ g.lineWidth=Math.max(1.5,s*.05); g.beginPath(); const x0= d>0? x+s*.2 : x+s*.8; g.moveTo(x0,y+s*.9); g.lineTo(x0+d*s*.4,y+s*.9); g.stroke(); } }
    else if(el==='water'){ g.fillStyle=C.water; g.beginPath(); const cx=x+s/2;
      g.moveTo(cx,y+s*.08); g.bezierCurveTo(cx+s*.1,y+s*.3,cx+s*.32,y+s*.48,cx+s*.32,y+s*.66); g.arc(cx,y+s*.66,s*.32,0,Math.PI); g.bezierCurveTo(cx-s*.32,y+s*.48,cx-s*.1,y+s*.3,cx,y+s*.08); g.fill();
      g.strokeStyle=C.waterHi; g.lineWidth=Math.max(1.5,s*.05); g.beginPath(); g.arc(cx,y+s*.66,s*.2,Math.PI*.95,Math.PI*1.35); g.stroke(); }
    g.globalAlpha=1;
  }
  return {C,rr,hash,mix,stone,earth,wood,fence,spike,water,stream,source,flame,grass,wind,key,icon};
})();
if(typeof module!=='undefined') module.exports=ART;
