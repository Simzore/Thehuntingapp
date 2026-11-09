// Server-only adapter. Never import this module into browser code.
const TOPO = 'https://maps.lantmateriet.se/topowebb/v1.1/wmts';
const ORTHO = 'https://maps.lantmateriet.se/ortofoto/wms/v1.3';
const ATTRIBUTION = '© Lantmäteriet';
const headers = { 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff' };
const json = (status, message) => Response.json({ message }, { status, headers });
function authorized(env) {
  return /^(Basic|Bearer) [A-Za-z0-9+/=_\-.~]+$/.test(env.LM_AUTHORIZATION || '');
}
export function mapConfig(env = {}) {
  const auth = authorized(env);
  return {
    provider: 'Lantmäteriet', attribution: ATTRIBUTION,
    terrain: auth && env.LM_TOPO_ENABLED === 'true',
    satellite: auth && env.LM_ORTHO_ENABLED === 'true',
    hybrid: auth && env.LM_ORTHO_ENABLED === 'true',
    hybridDescription: 'Ortofoto med appens egna objektnamn, utan separat väg- eller ortnamnslager.',
  };
}
export function tileRequest(url) {
  const match = /^\/api\/maps\/(terrain|satellite)\/(\d{1,2})\/(\d{1,6})\/(\d{1,6})\.png$/.exec(url.pathname);
  if (!match || url.search) return null;
  const [, kind, zText, xText, yText] = match;
  const [z, x, y] = [zText, xText, yText].map(Number);
  if (z > 17 || x >= 2 ** z || y >= 2 ** z) return null;
  if (kind === 'terrain') {
    const upstream = new URL(TOPO);
    upstream.search = new URLSearchParams({ SERVICE: 'WMTS', VERSION: '1.0.0', REQUEST: 'GetTile',
      LAYER: 'topowebb', STYLE: 'default', FORMAT: 'image/png', TILEMATRIXSET: '3857',
      TILEMATRIX: String(z), TILECOL: String(x), TILEROW: String(y) });
    return { kind, upstream };
  }
  // XYZ in Web Mercator -> WMS 1.1.1 BBOX, always east/north axis order.
  const edge = 20037508.342789244, size = edge * 2 / 2 ** z;
  const bbox = [x * size - edge, edge - (y + 1) * size, (x + 1) * size - edge, edge - y * size];
  const upstream = new URL(ORTHO);
  upstream.search = new URLSearchParams({ SERVICE: 'WMS', VERSION: '1.1.1', REQUEST: 'GetMap',
    LAYERS: 'Ortofoto_0.5,Ortofoto_0.4,Ortofoto_0.25,Ortofoto_0.16', STYLES: '',
    SRS: 'EPSG:3857', BBOX: bbox.join(','), WIDTH: '256', HEIGHT: '256', FORMAT: 'image/png' });
  return { kind, upstream };
}
export async function handleMaps(request, env = {}, fetcher = fetch) {
  const url = new URL(request.url);
  if (request.method !== 'GET') return json(405, 'Endast GET stöds.');
  if (url.pathname === '/api/maps/config') return Response.json(mapConfig(env), { headers });
  const tile = tileRequest(url);
  if (!tile) return json(400, 'Ogiltig kartförfrågan.');
  if (!mapConfig(env)[tile.kind]) return json(503, 'Lantmäteriets kartlager är inte konfigurerat.');
  try {
    const upstream = await fetcher(tile.upstream, {
      headers: { Authorization: env.LM_AUTHORIZATION, Accept: 'image/png' },
      redirect: 'error', signal: AbortSignal.timeout(10000),
    });
    // WMS can return XML exceptions with HTTP 200. Never forward them or upstream auth errors.
    const type = upstream.headers.get('Content-Type')?.split(';')[0].trim().toLowerCase();
    if (!upstream.ok || type !== 'image/png') return json(502, 'Kartbilden kunde inte hämtas. Kontrollera behörighet och tjänstestatus.');
    const bytes = await upstream.arrayBuffer();
    if (bytes.byteLength > 5 * 1024 * 1024) return json(502, 'Kartbilden var för stor.');
    return new Response(bytes, { headers: { ...headers, 'Content-Type': 'image/png' } });
  } catch {
    return json(502, 'Lantmäteriets karttjänst kunde inte nås.');
  }
}
