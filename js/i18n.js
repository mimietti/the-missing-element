// Kielet: englanti (oletus) ja suomi. Yhteinen pelille ja editorille.
const I18N = {
en: {
  // peli
  'lvl.num':'Level {n} / {total}', 'lvl.own':'Custom level', 'lvl.test':'Editor test',
  'keys':'Keys {got}/{n}',
  'el.earth':'Earth','el.fire':'Fire','el.wind':'Wind','el.water':'Water','el.na':'not in this level',
  'piece.move':' · move', 'aria.addPiece':'Add element: ', 'aria.movePiece':'Move element: ',
  'restart':'Try again', 'fullscreen':'Full screen', 'menu':'Levels', 'toEditor':'Editor',
  'left':'Left', 'right':'Right', 'jump':'Jump',
  'place.drag':'Drag the element into place', 'place.pour':'Drag to choose where the spring flows from', 'place.nofit':'Does not fit here', 'place.moveWarn':'Moving restarts the level',
  'place.remove':'Remove', 'place.cancel':'Cancel', 'place.ok':'Place',
  'toast.moved':'Element moved, restarting', 'toast.removed':'Element removed, restarting', 'toast.nofs':'Full screen is not allowed in this view',
  'cause.fall':'You fell too far', 'cause.spike':'Spikes!', 'cause.pit':'You fell into the pit', 'cause.guard':'The guard caught you', 'cause.fire':'You got burned', 'cause.x':'Oops',
  'win.test.title':'{name} completed', 'win.test.text':'The test level can be played through.', 'again':'Again', 'backEditor':'Back to editor',
  'win.all.title':'All levels completed', 'win.all.text':'You solved every built-in level. Make your own in the level editor.', 'playAgain':'Play again',
  'win.title':'{name} completed', 'win.next':'Next: {name}', 'nextLevel':'Next level',
  'menu.title':'Levels', 'menu.unlocked':'Test mode: every level can be selected. Completed levels are marked.',
  'menu.open':'Unlocked {n} / {total}.', 'menu.keep':'Elements you add stay in the level until you move or remove them.',
  'menu.own':'Custom levels', 'close':'Close', 'editor':'Level editor', 'lang':'Language: English',
  // editor
  'ed.title':'Level editor', 'ed.back':'← Game', 'ed.name':'Level name', 'ed.hint':'Hint for the player',
  'ed.new':'New', 'ed.open':'Open', 'ed.save':'Save', 'ed.text':'Text', 'ed.check':'Check', 'ed.test':'Test',
  'tool..':'Erase','tool.=':'Earth','tool.#':'Stone','tool.-':'Wood floor','tool.H':'Wooden fence','tool.f':'Burning wood floor','tool.F':'Burning fence','ed.height':'Height','ed.full':'Fill pool','tool.w':'Still water','tool.S':'Spring','ed.unlimited':'Unlimited','tool.<':'Wind ←','tool.>':'Wind →','tool.[':'Strong wind ←','tool.]':'Strong wind →','tool.^':'Spike',
  'tool.k':'Key','tool.P':'Start','tool.E':'Door','tool.G':'Guard', 'ed.tools':'Tools',
  'ed.pieces':'Elements on offer', 'ed.offer':'On offer', 'ed.size':'Width', 'ed.amount':'Amount', 'ed.dir':'Direction', 'ed.strong':'Strong',
  'ed.piecesHelp':'Tick the elements the player gets. Press Solution and tap the spot where it belongs: earth = left end, wind = bottom-left corner of a 3-row area, water = the spring. The check uses this placement.',
  'ed.guards':'Guards', 'ed.noGuards':'No guards.',
  'ed.guardsHelp':'Choose the Guard tool and drag horizontally along the row the guard walks on (above the floor). The drag direction is the starting direction.',
  'ed.checkTitle':'Check', 'ed.alt':'Count every working placement (one-element levels only, slow)', 'ed.notChecked':'Not checked yet.',
  'ed.type':'Piece {n} type', 'ed.len':'Piece {n} length', 'ed.solBtn':'Solution', 'ed.solMove':'Move', 'ed.solTitle':'Set the intended spot',
  'ed.delPiece':'Remove piece {n}', 'ed.tapSpot':'Tap the spot for: {n}', 'ed.noFitSol':'The element does not fit here',
  'ed.guardRow':'Row {r}: columns {c0}–{c1} {d}', 'ed.delGuard':'Remove', 'ed.guardShort':'Drag the guard’s route over at least two cells',
  'ed.edgeOnly':'Only tiles can be drawn on the border', 'ed.coord':'row {r}, column {c}',
  'ed.p.noStart':'The level has no start.', 'ed.p.noExit':'The level has no door.', 'ed.p.edge':'{what} is in the border wall (row {r}, column {c}). Move it inside the level.',
  'ed.start':'The start', 'ed.door':'The door',
  'ed.newTitle':'New level', 'ed.newText':'The current draft will be replaced. Saved levels are kept.', 'ed.cancel':'Cancel', 'ed.blank':'Start from scratch',
  'ed.openTitle':'Open level', 'ed.ownLevels':'Custom levels', 'ed.noOwn':'No saved levels yet.', 'ed.gameLevels':'Game levels (opens as a copy)',
  'ed.copy':' (copy)', 'ed.opened':'Opened: {name}', 'ed.deleteQ':'Delete {name}?', 'ed.deleted':'Deleted: {name}', 'ed.delAria':'Delete {name}',
  'ed.saved':'Saved to custom levels', 'ed.savedOver':'Saved (replaced the one with the same name)', 'ed.saveFail':'Saving failed: browser storage is not available',
  'ed.testFail':'The test cannot start: browser storage is not available',
  'ed.textTitle':'Level as text', 'ed.textHelp':'Copy the text and paste it to Claude to add the level to the game. You can also paste text here and import a level.',
  'ed.import':'Import from text', 'ed.copyBtn':'Copy', 'ed.copied':'Copied to clipboard', 'ed.selected':'Text selected: copy it',
  'ed.imported':'Level imported', 'ed.importFail':'Could not read the text: {msg}', 'ed.sizeErr':'the map must be 28 × 16',
  'ed.checking':'Checking…', 'ed.noWorker':'The check cannot run in this browser.', 'ed.error':'Error: {msg}',
  'ed.r.noneT':'The level can be completed without adding anything', 'ed.r.noneF':'Without elements the level cannot be completed', 'ed.r.noneN':'Without elements: no answer within the limit',
  'ed.r.noSol':'Set a solution spot for every element on offer to check the solution.', 'ed.r.noPieces':'Offer at least one element.',
  'ed.r.solT':'With the solution the level can be completed', 'ed.r.solF':'With the solution the level cannot be completed', 'ed.r.solN':'Solution: no answer within the limit',
  'ed.r.dropT':'{n} is unnecessary: the level works without it', 'ed.r.dropF':'{n} is needed', 'ed.r.dropN':'{n}: no answer within the limit',
  'ed.r.alt':'Working placements: {n}', 'ed.r.time':'Took {s} s.',
  'pr.none':'Without pieces…', 'pr.sol':'With the solution…', 'pr.drop':'Without {n}…', 'pr.alt':'Alternatives {i}/{n}…',
  'ed.newLevel':'New level', 'ed.unnamed':'Untitled'
},
fi: {
  'lvl.num':'Kenttä {n} / {total}', 'lvl.own':'Oma kenttä', 'lvl.test':'Editorin testi',
  'keys':'Avaimet {got}/{n}',
  'el.earth':'Maa','el.fire':'Tuli','el.wind':'Tuuli','el.water':'Vesi','el.na':'ei tässä kentässä',
  'piece.move':' · siirrä', 'aria.addPiece':'Lisää elementti: ', 'aria.movePiece':'Siirrä elementti: ',
  'restart':'Yritä uudelleen', 'fullscreen':'Koko näyttö', 'menu':'Kentät', 'toEditor':'Editoriin',
  'left':'Vasemmalle', 'right':'Oikealle', 'jump':'Hyppy',
  'place.drag':'Vedä elementti paikalleen', 'place.pour':'Vedä kohtaan, josta lähde virtaa', 'place.nofit':'Ei mahdu tähän', 'place.moveWarn':'Siirto aloittaa kentän alusta',
  'place.remove':'Poista', 'place.cancel':'Peru', 'place.ok':'Aseta',
  'toast.moved':'Elementti siirretty, aloitetaan alusta', 'toast.removed':'Elementti poistettu, aloitetaan alusta', 'toast.nofs':'Koko näyttö ei ole sallittu tässä näkymässä',
  'cause.fall':'Putosit liian korkealta', 'cause.spike':'Piikit!', 'cause.pit':'Putosit kuiluun', 'cause.guard':'Vartija sai kiinni', 'cause.fire':'Tuli poltti', 'cause.x':'Hups',
  'win.test.title':'{name} läpäisty', 'win.test.text':'Testikenttä on pelattavissa läpi.', 'again':'Uudelleen', 'backEditor':'Takaisin editoriin',
  'win.all.title':'Kaikki kentät läpäisty', 'win.all.text':'Valmiit kentät on ratkaistu. Tee omia kenttäeditorissa.', 'playAgain':'Pelaa uudelleen',
  'win.title':'{name} läpäisty', 'win.next':'Seuraavaksi: {name}', 'nextLevel':'Seuraava kenttä',
  'menu.title':'Kentät', 'menu.unlocked':'Testivaihe: kaikki kentät ovat valittavissa. Läpäistyt on merkitty.',
  'menu.open':'Avoinna {n} / {total}.', 'menu.keep':'Lisäämäsi elementit säilyvät kentässä, kunnes siirrät tai poistat ne.',
  'menu.own':'Omat kentät', 'close':'Sulje', 'editor':'Kenttäeditori', 'lang':'Kieli: suomi',
  'ed.title':'Kenttäeditori', 'ed.back':'← Peli', 'ed.name':'Kentän nimi', 'ed.hint':'Vihje pelaajalle',
  'ed.new':'Uusi', 'ed.open':'Avaa', 'ed.save':'Tallenna', 'ed.text':'Teksti', 'ed.check':'Tarkista', 'ed.test':'Testaa',
  'tool..':'Pyyhi','tool.=':'Maa','tool.#':'Kivi','tool.-':'Puulattia','tool.H':'Puuaita','tool.f':'Palava puulattia','tool.F':'Palava puuaita','ed.height':'Korkeus','ed.full':'Täysi allas','tool.w':'Seisova vesi','tool.S':'Lähde','ed.unlimited':'Rajaton','tool.<':'Tuuli ←','tool.>':'Tuuli →','tool.[':'Kova tuuli ←','tool.]':'Kova tuuli →','tool.^':'Piikki',
  'tool.k':'Avain','tool.P':'Aloitus','tool.E':'Ovi','tool.G':'Vartija', 'ed.tools':'Työkalut',
  'ed.pieces':'Tarjolla olevat elementit', 'ed.offer':'Tarjolla', 'ed.size':'Leveys', 'ed.amount':'Määrä', 'ed.dir':'Suunta', 'ed.strong':'Kova',
  'ed.piecesHelp':'Valitse elementit, jotka pelaaja saa. Paina Ratkaisu ja napauta kohtaa, johon elementti kuuluu: maa = vasen pää, tuuli = kolmen rivin alueen vasen alakulma, vesi = lähteen paikka. Tarkistus käyttää tätä sijoitusta.',
  'ed.guards':'Vartijat', 'ed.noGuards':'Ei vartijoita.',
  'ed.guardsHelp':'Valitse Vartija-työkalu ja vedä ruudukossa vaakasuoraan rivillä, jolla vartija kävelee (lattian yläpuolella). Vetosuunta on liikkeen alkusuunta.',
  'ed.checkTitle':'Tarkistus', 'ed.alt':'Laske kaikki toimivat sijoitukset (vain yhden elementin kentät, hidas)', 'ed.notChecked':'Ei vielä tarkistettu.',
  'ed.type':'Palan {n} tyyppi', 'ed.len':'Palan {n} pituus', 'ed.solBtn':'Ratkaisu', 'ed.solMove':'Siirrä', 'ed.solTitle':'Aseta tarkoitettu paikka',
  'ed.delPiece':'Poista pala {n}', 'ed.tapSpot':'Napauta paikka: {n}', 'ed.noFitSol':'Elementti ei mahdu tähän',
  'ed.guardRow':'Rivi {r}: sarakkeet {c0}–{c1} {d}', 'ed.delGuard':'Poista', 'ed.guardShort':'Vedä vartijan reitti vähintään kahden ruudun matkalle',
  'ed.edgeOnly':'Reunaruutuihin voi piirtää vain laattoja', 'ed.coord':'rivi {r}, sarake {c}',
  'ed.p.noStart':'Kentästä puuttuu aloituspaikka.', 'ed.p.noExit':'Kentästä puuttuu ovi.', 'ed.p.edge':'{what} on reunaseinässä (rivi {r}, sarake {c}). Siirrä se kentän sisälle.',
  'ed.start':'Aloituspaikka', 'ed.door':'Ovi',
  'ed.newTitle':'Uusi kenttä', 'ed.newText':'Nykyinen luonnos korvataan. Tallennetut kentät säilyvät.', 'ed.cancel':'Peru', 'ed.blank':'Aloita tyhjästä',
  'ed.openTitle':'Avaa kenttä', 'ed.ownLevels':'Omat kentät', 'ed.noOwn':'Ei vielä tallennettuja kenttiä.', 'ed.gameLevels':'Pelin kentät (avautuu kopiona)',
  'ed.copy':' (kopio)', 'ed.opened':'Avattu: {name}', 'ed.deleteQ':'Poista {name}?', 'ed.deleted':'Poistettu: {name}', 'ed.delAria':'Poista {name}',
  'ed.saved':'Tallennettu omiin kenttiin', 'ed.savedOver':'Tallennettu (korvasi saman nimisen)', 'ed.saveFail':'Tallennus epäonnistui: selaimen tallennustila ei ole käytettävissä',
  'ed.testFail':'Testi ei käynnisty: selaimen tallennustila ei ole käytettävissä',
  'ed.textTitle':'Kenttä tekstinä', 'ed.textHelp':'Kopioi teksti ja liitä se Claudelle, niin kenttä voidaan lisätä peliin. Voit myös liittää tähän tekstin ja tuoda kentän.',
  'ed.import':'Tuo tekstistä', 'ed.copyBtn':'Kopioi', 'ed.copied':'Kopioitu leikepöydälle', 'ed.selected':'Teksti valittu: kopioi se',
  'ed.imported':'Kenttä tuotu', 'ed.importFail':'Tekstiä ei voitu lukea: {msg}', 'ed.sizeErr':'kartan koon pitää olla 28 × 16',
  'ed.checking':'Tarkistetaan…', 'ed.noWorker':'Tarkistus ei käynnisty tässä selaimessa.', 'ed.error':'Virhe: {msg}',
  'ed.r.noneT':'Kenttä menee läpi lisäämättä mitään', 'ed.r.noneF':'Ilman elementtejä kenttä ei mene läpi', 'ed.r.noneN':'Ilman elementtejä: ei ratkennut aikarajassa',
  'ed.r.noSol':'Aseta jokaiselle tarjolla olevalle elementille ratkaisupaikka, niin ratkaisu tarkistetaan.', 'ed.r.noPieces':'Valitse vähintään yksi tarjolla oleva elementti.',
  'ed.r.solT':'Ratkaisulla kenttä menee läpi', 'ed.r.solF':'Ratkaisulla kenttä ei mene läpi', 'ed.r.solN':'Ratkaisu: ei ratkennut aikarajassa',
  'ed.r.dropT':'{n} on turha: kenttä menee läpi ilman sitä', 'ed.r.dropF':'{n} tarvitaan', 'ed.r.dropN':'{n}: ei ratkennut aikarajassa',
  'ed.r.alt':'Toimivia sijoituksia: {n}', 'ed.r.time':'Aikaa kului {s} s.',
  'pr.none':'Ilman paloja…', 'pr.sol':'Ratkaisulla…', 'pr.drop':'Ilman: {n}…', 'pr.alt':'Vaihtoehdot {i}/{n}…',
  'ed.newLevel':'Uusi kenttä', 'ed.unnamed':'Nimetön'
}};

let LANG = 'en';
try{ const l=localStorage.getItem('tme-lang'); if(l==='fi'||l==='en') LANG=l; }catch(e){}
function T(key, vars){
  let s = (I18N[LANG] && I18N[LANG][key]); if(s==null) s = I18N.en[key]; if(s==null) s = key;
  if(vars) s = s.replace(/\{(\w+)\}/g,(m,k)=> vars[k]!=null? vars[k] : m);
  return s;
}
// Kentän nimi ja vihje valitulla kielellä. Kentässä on suomi (name/hint) ja englanti (en.name/en.hint).
function LT(def, field){
  if(LANG==='en' && def.en && def.en[field]!=null && def.en[field]!=='') return def.en[field];
  if(LANG==='fi' && def.fi && def.fi[field]!=null && def.fi[field]!=='') return def.fi[field];
  return def[field]||'';
}
function setLang(l){ LANG=l; try{ localStorage.setItem('tme-lang',l); }catch(e){} document.documentElement.lang=l; applyI18n(); }
function applyI18n(root){
  (root||document).querySelectorAll('[data-i18n]').forEach(el=>{ el.textContent=T(el.dataset.i18n); });
  (root||document).querySelectorAll('[data-i18n-aria]').forEach(el=>{ el.setAttribute('aria-label',T(el.dataset.i18nAria)); });
  (root||document).querySelectorAll('[data-i18n-ph]').forEach(el=>{ el.setAttribute('placeholder',T(el.dataset.i18nPh)); });
}
const FLAGS = {
  en:'<svg viewBox="0 0 60 30" width="30" height="15" aria-hidden="true"><clipPath id="ukc"><path d="M30,15h30v15zv15h-30zh-30v-15zv-15h30z"/></clipPath><path d="M0,0v30h60v-30z" fill="#012169"/><path d="M0,0L60,30M60,0L0,30" stroke="#fff" stroke-width="6"/><path d="M0,0L60,30M60,0L0,30" clip-path="url(#ukc)" stroke="#C8102E" stroke-width="4"/><path d="M30,0v30M0,15h60" stroke="#fff" stroke-width="10"/><path d="M30,0v30M0,15h60" stroke="#C8102E" stroke-width="6"/></svg>',
  fi:'<svg viewBox="0 0 18 11" width="27" height="16.5" aria-hidden="true"><rect width="18" height="11" fill="#fff"/><rect x="5" width="3" height="11" fill="#002F6C"/><rect y="4" width="18" height="3" fill="#002F6C"/></svg>'
};
function langButton(btn, onChange){
  const paint=()=>{ btn.innerHTML=FLAGS[LANG]; btn.setAttribute('aria-label',T('lang')); btn.title=T('lang'); };
  btn.addEventListener('click',()=>{ setLang(LANG==='en'?'fi':'en'); paint(); onChange&&onChange(); });
  paint(); document.documentElement.lang=LANG;
}
