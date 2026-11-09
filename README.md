# Thehuntingapp

Mobilanpassad webbprototyp för jaktplanering, jaktlag och jaktmarker. Gränssnittet är på svenska. Koden använder JavaScript, HTML, CSS och Leaflet.

## Kom igång

Installera Node.js 22 eller senare. Inga npm-paket behöver installeras.

```sh
npm run dev
```

Öppna http://localhost:3000. Stoppa servern med Ctrl+C.

```sh
npm run check
npm run build
```

Byggningen skapar `dist/`, som kan läggas på en statisk webbserver. HTTPS krävs för GPS på andra adresser än localhost.

## Struktur

```text
index.html          Sidans struktur och gränssnitt
src/
  app.js            Appens logik, kartor, formulär och lokal lagring
  styles.css        Utseende och mobilanpassning
scripts/
  dev.mjs           Lokal webbserver
  check.mjs         Syntax-, referens- och geometrikontroller
  build.mjs         Skapar dist/ från källkoden
docs/
  architecture.md   Teknik, datalagring och begränsningar
  roadmap.md        Plan för nästa steg
```

## Funktioner i prototypen

- Skapa, redigera och ta bort jakter och medlemmar.
- Markera pass, broövergångar och andra föremål.
- Visa eller dölj objektens namn.
- Välj terräng-, satellit- eller hybridlager.
- Rita jaktgräns och namngivna delområden med färger.
- Hämta GPS-position efter användarens godkännande.
- Exportera lokala markdata som JSON.

## Nuvarande begränsningar

Data sparas i webbläsarens localStorage, inte på ett gemensamt konto. Jaktmarken, objekten och medlemmarna är exempeldata. Inbjudningar skickas inte. Kartbilder, Leaflet och typsnitt hämtas över internet. Offlinekartor är inte implementerade. Kartmarkeringar använder ett lokalt koordinatsystem; övergång till geografiska koordinater krävs före verklig användning i fält. Arealen 864 ha är ett exempelvärde.

Kartattribution visas i kartan. Kontrollera kartleverantörens användningsvillkor och eventuell autentisering innan produktionsdrift eller nedladdning av kartor.

Källkoden i GitHub och den publicerade Sites-prototypen är separata. En ändring här publicerar inte automatiskt en ny Sites-version.
