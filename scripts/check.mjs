import { fileURLToPath } from 'node:url';
import { readFile, access } from 'node:fs/promises';
import { execFileSync } from 'node:child_process';
import assert from 'node:assert/strict';
process.chdir(fileURLToPath(new URL('..', import.meta.url)));
execFileSync(process.execPath, ['--check', 'src/app.js']);
const html = await readFile('index.html', 'utf8');
const ids = [...html.matchAll(/\bid="([^"]+)"/g)].map(m => m[1]);
assert.equal(new Set(ids).size, ids.length, 'HTML IDs must be unique');
for (const file of ['src/app.js', 'src/styles.css']) {
  assert(html.includes(`./${file}`), `Missing reference: ${file}`);
  await access(file);
}
const js = await readFile('src/app.js', 'utf8');
const geometry = js.slice(js.indexOf('function validPolygon'), js.indexOf('const areaColors'));
const valid = new Function(geometry + ';return validPolygon')();
assert(valid([[0,0],[100,0],[100,100],[0,100]]));
assert(!valid([[0,0],[100,100],[0,100],[100,0]]), 'Reject self-intersection');
assert(!valid([[0,0],[10,10],[20,20]]), 'Reject zero-area polygons');
assert(!valid([[0,0],[100,0],[100,0],[0,100]]), 'Reject duplicate adjacent vertices');
console.log('Syntax, HTML references and polygon checks passed. Browser testing is separate.');
