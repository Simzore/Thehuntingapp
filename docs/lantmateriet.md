# Anslut Lantmäteriet

## Status

Integrationen är förberedd. Inga riktiga kartbilder har verifierats med behörigt konto. Ingen produkt har beställts och inga avgifter har godkänts. Utan serverinställningar visas en demokarta; ingen annan leverantör används som dold reserv.

Leaflet är ett visningsbibliotek, inte en datakälla. Det behålls för GPS, zoomning och markeringar. Kartkällan byts från Esri till Lantmäteriet.

## Produkter och åtkomst

Beställ rättigheter för användningen i din applikation i Geotorget och kontrollera priser, avtal och eventuell rätt till offlineanvändning innan du aktiverar något:

- [Topografisk webbkarta Visning, cache](https://geotorget.lantmateriet.se/geodataprodukter/topografisk-webbkarta-visning-cache-api): WMTS, `topowebb`, EPSG:3857. Servern anropar `https://maps.lantmateriet.se/topowebb/v1.1/wmts`.
- [Ortofoto Visning](https://geotorget.lantmateriet.se/geodataprodukter/ortofoto-visning-api): WMS, EPSG:3857. Servern anropar `https://maps.lantmateriet.se/ortofoto/wms/v1.3`. Ortofoto är flygbilder, inte satellitbilder. Koden använder WMS-protokollversion 1.1.1 med skikten Ortofoto_0.5, Ortofoto_0.4, Ortofoto_0.25 och Ortofoto_0.16.

Hybridvyn visar ortofoto plus appens egna objektnamn. Den innehåller inte Lantmäteriets väg- och ortnamn som separat överlägg.

[Den äldre avgiftsfria översiktskartan avvecklas 31 december 2026](https://www.lantmateriet.se/sv/geodata/vara-produkter/Produktnyheter/Geografisk-information/avveckling-av-produkten-topografisk-webbkarta-visning-oversiktlig/). Integrationen använder därför inte den utgående produkten.

## Lokal konfiguration

1. Kopiera `.env.example` till `.env` lokalt. Filen är ignorerad av Git.
2. Lägg in den Authorization-header som gäller för ditt konto i `LM_AUTHORIZATION`. För Basic-autentisering är värdet `Basic ` följt av base64 av användarnamn:lösenord. Base64 är ingen kryptering; behandla hela värdet som ett lösenord.
3. Sätt `LM_TOPO_ENABLED=true` först när kontot har behörighet till topografisk cache. Sätt `LM_ORTHO_ENABLED=true` endast om kontot också har rätt till Ortofoto Visning. Produkterna kan aktiveras oberoende av varandra.
4. Kör `npm run dev`. Node läser `.env` endast på servern. Webbläsaren får produktstatus, aldrig behörighetsvärdet.
5. Kontrollera terräng/ortofoto med riktiga anrop och verifiera datatäckning, lagernamn och kartattribution mot ditt avtal. Konfigurationsstatus bevisar inte att kontot har rätt behörighet.

Använd inte formulär, localStorage, URL-parametrar eller klientkod för API-uppgifterna. Lägg aldrig in riktiga värden i `.env.example`, issues eller commits.

## Produktion

`npm run build:worker` genererar `dist/server/index.js`, en Worker med statiskt gränssnitt och kartproxy. På Sites ska hostingmanifestet använda Worker-läge (inget `static`-fält) och behålla samma projekt-id. Ange servervariablerna som skyddade runtime-inställningar hos hostingen. Ingen hemlighet bäddas in i byggningen.

Kartproxyn har ingen egen användarinloggning. Den måste ligga bakom Sites privata åtkomstkontroll eller annan serverkontrollerad inloggning. Publicera inte en aktiverad kartproxy öppet: den använder ditt konto och kan förbruka betald tjänst. Utanför privat Sites-hosting måste inloggning och behörighetskontroll läggas till före aktivering. Lokala utvecklingsservern lyssnar endast på 127.0.0.1.

Endast tillåtna tile-anrop mot två fasta Lantmäteriet-adresser accepteras. Proxyservern följer inte omdirigeringar, vidarebefordrar inte uppströmsfel och stänger av cachelagring. Behörigheten skickas bara i header till Lantmäteriet. Offlinekartor och massnedladdning ingår inte.

## Kontroll före användning

- `npm run check`, `npm test` och relevant byggkommando.
- Riktig verifiering av WMTS och WMS med ditt behöriga konto (återstår).
- Mobiltest av kartlager, GPS, ritning och återladdning av sparade data (återstår).
- Test av privat åtkomst till kartproxyn och att behörighetsvärden inte syns i nätverkstrafiken till webbläsaren.
- Separat beslut om licens och teknik för offlinekartor.
