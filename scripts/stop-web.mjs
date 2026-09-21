// Detiene únicamente el servidor iniciado por dev-web.mjs (nunca mata "todos los node").
import { execSync } from 'node:child_process';
import { existsSync, readFileSync, unlinkSync } from 'node:fs';

const file = '.expo/dev-web.pid';
if (!existsSync(file)) {
  console.log('No hay servidor registrado.');
  process.exit(0);
}
const pid = Number(readFileSync(file, 'utf8'));
try {
  if (process.platform === 'win32') execSync(`taskkill /PID ${pid} /T /F`, { stdio: 'ignore' });
  else process.kill(-pid);
  console.log(`Servidor ${pid} detenido.`);
} catch {
  console.log(`El proceso ${pid} ya no estaba activo.`);
}
unlinkSync(file);
