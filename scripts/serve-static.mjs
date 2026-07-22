import { createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const contentTypes = {
  '.css': 'text/css',
  '.html': 'text/html',
  '.js': 'text/javascript'
};

createServer((request, response) => {
  const requestPath = decodeURIComponent((request.url || '/').split('?')[0]);
  const filePath = resolve(
    join(root, normalize(requestPath === '/' ? '/index.html' : requestPath))
  );
  if (relative(root, filePath).startsWith('..')) {
    response.writeHead(403);
    response.end('Forbidden');
    return;
  }

  try {
    const stats = statSync(filePath);
    if (!stats.isFile()) throw new Error('Not a file');
    response.writeHead(200, { 'Content-Type': contentTypes[extname(filePath)] || 'text/plain' });
    createReadStream(filePath).pipe(response);
  } catch {
    response.writeHead(404);
    response.end('Not found');
  }
}).listen(4173, '127.0.0.1');
