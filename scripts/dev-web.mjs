// Levanta `expo start --web` (modo CI: NO recarga; reiniciar tras cada cambio) en el primer puerto libre desde 8081.
// Guarda el PID en .expo/dev-web.pid para que stop-web.mjs lo detenga a él y solo a él.
import { spawn } from 'node:child_process';
import { mkdirSync, writeFileSync } from 'node:fs';
import net from 'node:net';

const free = (port) =>
  new Promise((resolve) => {
    const s = net.createServer();
    s.once('error', () => resolve(false));
    s.once('listening', () => s.close(() => resolve(true)));
    s.listen(port, '127.0.0.1');
  });

let port = Number(process.argv[2]) || 8081;
while (!(await free(port))) port++;

const isWin = process.platform === 'win32';
const child = spawn(isWin ? 'npx.cmd' : 'npx', ['expo', 'start', '--web', '--port', String(port)], {
  env: { ...process.env, CI: '1' },
  detached: !isWin,
  stdio: 'ignore',
  shell: isWin,
});
child.unref();
mkdirSync('.expo', { recursive: true });
writeFileSync('.expo/dev-web.pid', String(child.pid));
console.log(`Expo web iniciando en http://localhost:${port} (PID ${child.pid}). Detener con: npm run stop:web`);
