import { fileURLToPath } from 'node:url';
import { mkdir, rm, cp } from 'node:fs/promises';
process.chdir(fileURLToPath(new URL('..', import.meta.url)));
await rm('dist', { recursive: true, force: true });
await mkdir('dist', { recursive: true });
await cp('index.html', 'dist/index.html');
await cp('src', 'dist/src', { recursive: true });
console.log('Byggt: dist/');
