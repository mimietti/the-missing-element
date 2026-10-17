# The Missing Element

Tasohyppelypulma, jossa jokaisesta kentästä puuttuu yksi elementti: maa, tuli, ilma tai vesi.
Pelaaja lisää sen oikeaan kohtaan, ja kenttä muuttuu läpäistäväksi.

## Elementit

- **Maa** lisää: pala lattiaa. Maa on kiinteää: sen sisään ei voi kävellä eikä hypätä, vain päälle. Puulattian läpi voi hypätä alhaalta.
- **Tuli** poistaa: polttaa puun (puulattia `-`, tikkaat `H`). Naapuri syttyy ylöspäin 1 sekunnissa, sivulle 2 sekunnissa, alas ei lainkaan.
  Tuuli nopeuttaa leviämistä tuulen suuntaan ja estää sen vastatuuleen. Palava ruutu on vaarallinen.
  Kenttään voi laittaa valmiiksi palavan puulattian `f` tai palavat tikkaat `F`.
- **Tikkaat** `H`: niiden läpi kuljetaan, niitä pitkin kiivetään ylös ja alas (nuolet ylös/alas tai ▲▼-napit), ja ylimmän askelman päällä voi seistä.
  Tikkailta pääsee astumalla sivuun tai hyppäämällä. Ilmassa ja vedessä tikkaisiin voi tarttua. Tuli polttaa tikkaat.
- **Tuuli** siirtää: kolmen rivin korkuinen alue, joka työntää vasemmalle tai oikealle. Kovaa tuulta vastaan ei pääse.
- **Vesi** pehmentää: pelaajan vesi on **lähde**, joka virtaa koko ajan (tai editorissa valitun määrän ruutuja).
  Vesi putoaa, liukuu pinnalla lähimmälle reunalle ja täyttää altaan. Täysi allas valuu matalamman reunansa yli.
  Kivi ja puulattia pidättävät vettä, joten puulattiasta voi tehdä altaan pohjan, jonka tuli polttaa. Tikkaiden läpi vesi valuu.
  Maa imee päällään olevaa vettä hitaasti (15 s ruutu per maakerroksen paksuusruutu). Imeytynyt vesi tippuu maakerroksen alta,
  jos siellä on tyhjää; muuten se jää maahan. Märästä maasta tulee mutaa, jossa liikkuminen on hidasta.
  Kentät kannattaa suunnitella niin, että vesi pääsee jonnekin, muuten lähde täyttää kentän vähitellen.
  Vähintään kahden ruudun syvyiseen veteen voi hypätä mistä korkeudesta tahansa; matalassa vedessä kahlataan.
  Mitä korkeammalta hyppää, sitä syvemmälle uppoaa ennen pintaan nousua. Piikit ja avaimet näkyvät veden läpi.
  Uidessa liikutaan hitaasti. Vedestä ei saa kunnon ponnistusta: hyppy nousee vain noin ruudun pinnan yläpuolelle
  (maalta 2,5 ruutua), joten vedestä pääsee ylös reunalle, joka on enintään ruudun pinnan yläpuolella.
  Editorissa: `w` seisova vesi alussa, `S` lähde kenttään.

## Sivut

- `index.html`: peli. Kosketusohjaus iPadille (▲▼ näkyvät, kun kentässä on tikkaat), näppäimistö (nuolet, välilyönti = hyppy, ylös hyppää jos tikkaita ei ole, R, 1–4) tietokoneella.
- `editor.html`: kenttäeditori. Piirrä kenttä, valitse tarjolla olevat elementit ja niiden ratkaisupaikat, testaa ja tarkista.
  Omat kentät tallentuvat selaimeen ja näkyvät pelin Kentät-valikossa kohdassa Omat kentät.

## Rakenne

- `js/engine.js`: pelimoottori (yhteinen pelille, editorille ja ratkaisijalle)
- `js/art.js`: yhteinen piirto
- `js/levels.js`: pelin valmiit kentät
- `js/solver.js`, `js/solver-worker.js`: ratkaisija (selaimessa workerissa, Nodessa suoraan)
- `tools/check.js`: tarkistaa kaikki kentät: `node tools/check.js` tai `node tools/check.js 2 3`
- `tools/format_levels.py`: siistii `js/levels.js`-tiedoston muotoilun

## Kentän lisääminen peliin

1. Tee kenttä editorissa ja varmista Tarkista-napilla, että kaikki rivit ovat vihreällä.
2. Paina Teksti → Kopioi ja lisää teksti `js/levels.js`-listaan.
3. Aja `node tools/check.js`.

## Julkaisu

Render Static Site, asetukset tiedostossa `render.yaml`. Ei build-vaihetta: julkaistava kansio on repon juuri.
