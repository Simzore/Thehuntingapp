# Arkitektur

## Nuvarande implementation

Appen är en statisk webbapp. `index.html` laddar `src/styles.css` och `src/app.js`. Leaflet 1.9.4 laddas från unpkg och visar Esris World Topo Map, World Imagery och referenslager för hybridvyn. Typsnitt laddas från Google Fonts. Ingen serverkod eller databas finns.

Applogiken är tills vidare samlad i en JavaScript-fil. Funktioner för formulär, kartor och lagring kan delas upp i moduler när funktionerna byggs vidare.

## Data

Nyckeln `jaktmark-v1` i localStorage innehåller:

- `members`: namn och roll.
- `hunts`: namn, datum, tid och samlingsplats.
- `pins`: namn, typ och lokala x/y-koordinater.
- `boundary`: jaktmarkens gränspunkter.
- `areas`: namn, färg och polygonpunkter.
- `view`: kartlager och synlighet för namn och områden.

Äldre sparad data kompletteras med standardvärden för områden och vyinställningar. GPS-positionen används i kartan men sparas inte i apptillståndet.

## Kartkoordinater

Exempelobjekten ligger i en SVG med viewBox 800 × 560, lagd över kartområdet mellan [57.05, 14.50] och [57.09, 14.605]. Dessa punkter är inte verifierade fastighetsgränser. Areaexport inkluderar kartområdets gränser för att beskriva koordinatsystemet. En kommande version bör lagra geografiska data som GeoJSON i WGS84 med uttrycklig migrering av befintliga exempeldata.

## Fortsatt arkitektur

Inför autentisering, medlemskap per jaktlag, serverlagring och behörighetskontroller innan flera användare delar information. Offlinekartor kräver separat kartlicens, cachehantering, lagringskvoter och synkronisering. Ingen av dessa funktioner är implementerad i prototypen.
