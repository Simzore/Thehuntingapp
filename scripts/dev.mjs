import { handleMaps } from '../server/maps.mjs';
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, sep, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = fileURLToPath(new URL('..', import.meta.url));
const types = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' };
createServer(async (req, res) => {
  try {
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405); res.end(); return;
    }
    const requestUrl = new URL(req.url, 'http://localhost:3000');
    if (requestUrl.pathname.startsWith('/api/maps/')) {
      const response = await handleMaps(new Request(requestUrl, { method: req.method }), process.env);
      res.writeHead(response.status, Object.fromEntries(response.headers));
      res.end(Buffer.from(await response.arrayBuffer())); return;
    }
    const path = decodeURIComponent(new URL(req.url, 'http://localhost').pathname);
    if (path !== '/' && !/^\/(index\.html|src\/(app\.js|styles\.css))$/.test(path)) {
      res.writeHead(404); res.end('Not found'); return;
    }
    const file = resolve(root, '.' + (path === '/' ? '/index.html' : path));
    if (!file.startsWith(root.endsWith(sep) ? root : root + sep)) throw Error('Invalid path');
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': (types[extname(file)] || 'application/octet-stream') + '; charset=utf-8' });
    res.end(req.method === 'HEAD' ? undefined : body);
  } catch {
    res.writeHead(404); res.end('Not found');
  }
}).listen(3000, '127.0.0.1', () => console.log('http://localhost:3000'));
