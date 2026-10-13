"""Kirjoittaa js/levels.js luettavaan muotoon: yksi kenttä per lohko, kartan rivit omilla riveillään.
Käyttö: python3 tools/format_levels.py [lähde.json]  (oletus: lukee nykyisen js/levels.js)"""
import json, re, sys, os
root=os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
path=os.path.join(root,'js','levels.js')
src=sys.argv[1] if len(sys.argv)>1 else path
txt=open(src,encoding='utf-8').read()
if src.endswith('.js'):
    txt=txt[txt.index('const LEVELS = [')+15:txt.rindex(']')+1]
levels=json.loads(txt)
def j(v): return json.dumps(v,ensure_ascii=False)
out=['// The Missing Element: kentät.',
     '// Merkit: # kivi  = maa  - puulattia  H puuaita  w vesi  < > tuuli  [ ] kova tuuli  ^ piikki  k avain  E ovi  P aloitus',
     "// pieces: tarjolla olevat elementit {el:'earth'|'fire'|'wind'|'water', len, dir, strong}, sol: tarkistettu ratkaisu",
     '// guards: r = rivi jolla vartija kävelee, c0..c1 reitti, dir 1 = aloittaa vasemmalta','const LEVELS = [']
for i,L in enumerate(levels):
    o=['{']
    o.append(f'  "name": {j(L["name"])},')
    o.append(f'  "hint": {j(L.get("hint",""))},')
    if L.get('en'): o.append(f'  "en": {j(L["en"])},')
    o.append(f'  "pieces": {j(L["pieces"])},')
    o.append(f'  "sol": {j(L.get("sol",[]))},')
    if L.get('guards'): o.append(f'  "guards": {j(L["guards"])},')
    o.append('  "map": [')
    o.append(',\n'.join('    '+j(r) for r in L['map']))
    o.append('  ]')
    o.append('}'+(',' if i<len(levels)-1 else ''))
    out.append('\n'.join(o))
out.append('];')
out.append("if(typeof module!=='undefined') module.exports=LEVELS;")
open(path,'w',encoding='utf-8').write('\n'.join(out)+'\n')
print('kirjoitettu',len(levels),'kenttää ->',path)
