# Arkitektur

## Nuvarande implementation

Appens gränssnitt är en webbapp med en serveradapter för kartor. `index.html` laddar `src/styles.css` och `src/app.js`. Leaflet 1.9.4 laddas från unpkg och används som kartvisare. Kartdata hämtas via `/api/maps/` från Lantmäteriets topografiska WMTS och Ortofoto WMS. Hybrid använder ortofoto och appens egna objektnamn, utan ett separat väg- eller ortnamnslager. Typsnitt laddas från Google Fonts. `server/maps.mjs` validerar kartanrop och lägger till serverns skyddade Authorization-header. Ingen databas finns. Lokal server är bunden till localhost; produktion kräver privat hosting eller serverkontrollerad inloggning. `scripts/build-worker.mjs` bygger en Worker med både app och serveradapter.

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

Inför autentisering för jaktlaget, medlemskap, serverlagring och behörighetskontroller innan flera användare delar information. Kartproxyn måste även fortsättningsvis skyddas bakom hostingens inloggning. Offlinekartor kräver separat kartlicens, cachehantering, lagringskvoter och synkronisering. Ingen av dessa funktioner är implementerad i prototypen.
