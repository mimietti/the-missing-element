# The Missing Element

Tasohyppelypulma, jossa jokaisesta kentästä puuttuu yksi elementti: maa, tuli, ilma tai vesi.
Pelaaja lisää sen oikeaan kohtaan, ja kenttä muuttuu läpäistäväksi.

## Elementit

- **Maa** lisää: pala lattiaa.
- **Tuli** poistaa: polttaa puun (puulattia `-`, puuaita `H`). Leviää ylöspäin nopeasti, sivuille hitaasti, alas ei lainkaan.
  Tuuli nopeuttaa leviämistä tuulen suuntaan ja estää sen vastatuuleen. Palava ruutu on vaarallinen.
- **Tuuli** siirtää: kolmen rivin korkuinen alue, joka työntää vasemmalle tai oikealle. Kovaa tuulta vastaan ei pääse.
- **Vesi** pehmentää: valuu alimpaan kohtaan ja täyttää altaan rivi kerrallaan, kunnes määrä loppuu.
  Vähintään kahden ruudun syvyiseen veteen voi hypätä mistä korkeudesta tahansa; matalassa vedessä kahlataan.
  Uidessa liikutaan hitaasti, ja vedestä pääsee ylös reunalle, joka on enintään ruudun pinnan yläpuolella.

## Sivut

- `index.html`: peli. Kosketusohjaus iPadille, näppäimistö (nuolet, välilyönti, R, 1–4) tietokoneella.
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
