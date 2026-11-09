import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mapConfig, tileRequest, handleMaps } from '../server/maps.mjs';
const env = { LM_AUTHORIZATION: 'Basic dGVzdDp0ZXN0', LM_TOPO_ENABLED: 'true', LM_ORTHO_ENABLED: 'true' };
const request = path => new Request('http://localhost' + path);
test('missing credentials disable products without leaking authorization', async () => {
  assert.equal(mapConfig().terrain, false);
  const r = await handleMaps(request('/api/maps/config'), env);
  const text = await r.text();
  assert(!text.includes('dGVzd')); assert.equal(JSON.parse(text).terrain, true);
  assert.equal((await handleMaps(request('/api/maps/terrain/1/1/1.png'))).status, 503);
});
test('only allowed XYZ paths and matrix bounds reach upstream', () => {
  for (const path of ['/api/maps/terrain/18/1/1.png', '/api/maps/terrain/2/4/1.png', '/api/maps/terrain/2/1/4.png', '/api/maps/terrain/1/-1/1.png', '/api/maps/terrain/1/1/1.png?url=https://example.com', '/api/maps/evil/1/1/1.png']) {
    assert.equal(tileRequest(new URL('http://localhost'+path)), null);
  }
  const tile = tileRequest(new URL('http://localhost/api/maps/terrain/13/4420/2500.png'));
  assert.equal(tile.upstream.origin, 'https://maps.lantmateriet.se');
  assert.equal(tile.upstream.searchParams.get('TILEROW'), '2500');
  assert.equal(tile.upstream.searchParams.get('TILECOL'), '4420');
  assert.equal(tile.upstream.searchParams.get('TILEMATRIXSET'), '3857');
});
test('ortho uses WMS 1.1.1 and the correct Web Mercator bounding box', () => {
  const { upstream } = tileRequest(new URL('http://localhost/api/maps/satellite/1/1/0.png'));
  const bbox = upstream.searchParams.get('BBOX').split(',').map(Number);
  assert.deepEqual(bbox, [0,0,20037508.342789244,20037508.342789244]);
  assert.equal(upstream.searchParams.get('VERSION'), '1.1.1');
  assert.equal(upstream.searchParams.get('SRS'), 'EPSG:3857');
});
test('authorization stays server-side and successful PNGs are forwarded', async () => {
  const r = await handleMaps(request('/api/maps/terrain/1/1/1.png'), env, async (url, options) => {
    assert.equal(url.hostname, 'maps.lantmateriet.se');
    assert.equal(options.headers.Authorization, env.LM_AUTHORIZATION);
    assert.equal(options.redirect, 'error');
    return new Response(new Uint8Array([137,80,78,71]), { headers: { 'Content-Type': 'image/png' } });
  });
  assert.equal(r.status,200);assert.equal(r.headers.get('Cache-Control'),'no-store');
  assert.equal(r.headers.get('Authorization'), null);
});
test('XML exceptions and upstream authentication errors are sanitized', async () => {
  for (const status of [200,401,403]) {
    const r = await handleMaps(request('/api/maps/terrain/1/1/1.png'), env, async () => new Response('<secret>credentials</secret>', {status,headers:{'Content-Type':'text/xml'}}));
    assert.equal(r.status,502);assert(!(await r.text()).includes('credentials'));
  }
});
test('timeouts and redirects fail closed; unknown methods and products are rejected', async () => {
  const r = await handleMaps(request('/api/maps/terrain/1/1/1.png'), env, async () => { throw Error('secret'); });
  assert.equal(r.status,502);assert(!(await r.text()).includes('secret'));
  assert.equal((await handleMaps(new Request('http://localhost/api/maps/config',{method:'POST'}),env)).status,405);
  assert.equal((await handleMaps(request('/api/maps/terrain/1/1/1.png'),{...env,LM_TOPO_ENABLED:'false'})).status,503);
});
