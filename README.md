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
npm test
npm run build
```

`npm run build` skapar appens statiska filer i `dist/`. Kartlagren behöver dessutom serverrutterna i `server/maps.mjs`; ren statisk hosting kan bara visa demokartan. `npm run build:worker` paketerar både server och app för Worker-hosting. HTTPS krävs för GPS på andra adresser än localhost.

## Struktur

```text
index.html          Sidans struktur och gränssnitt
src/
  app.js            Appens logik, kartor, formulär och lokal lagring
  styles.css        Utseende och mobilanpassning
scripts/
  dev.mjs           Lokal webbserver
  check.mjs         Syntax-, referens- och geometrikontroller
  build.mjs         Skapar statiska filer i dist/
  build-worker.mjs  Bygger server + app för privat Worker-hosting
server/
  maps.mjs          Serveranslutning till Lantmäteriet
tests/
  maps.test.mjs     Kartproxy och koordinatkontroller
docs/
  architecture.md   Teknik, datalagring och begränsningar
  roadmap.md        Plan för nästa steg
```

## Funktioner i prototypen

- Skapa, redigera och ta bort jakter och medlemmar.
- Markera pass, broövergångar och andra föremål.
- Visa eller dölj objektens namn.
- Förberedd anslutning till Lantmäteriets topografiska karta, ortofoto och hybrid med appens egna objektnamn.
- Rita jaktgräns och namngivna delområden med färger.
- Hämta GPS-position efter användarens godkännande.
- Exportera lokala markdata som JSON.

## Nuvarande begränsningar

Data sparas i webbläsarens localStorage, inte på ett gemensamt konto. Jaktmarken, objekten och medlemmarna är exempeldata. Inbjudningar skickas inte. Lantmäteriets kartbilder kräver behörighet och serverkonfiguration; utan detta visas en tydligt märkt demokarta. Leaflet och typsnitt hämtas över internet. Offlinekartor är inte implementerade. Kartmarkeringar använder ett lokalt koordinatsystem; övergång till geografiska koordinater krävs före verklig användning i fält. Arealen 864 ha är ett exempelvärde.

Kartkälla är Lantmäteriet. Leaflet används fortsatt som kartvisare. Esris kartlager har tagits bort ur denna källkod. Se [anslutningsguiden](docs/lantmateriet.md) för behörighet, skyddade serverinställningar och verifiering innan aktivering.

Källkoden i GitHub och den publicerade Sites-prototypen är separata. En ändring här publicerar inte automatiskt en ny Sites-version.
