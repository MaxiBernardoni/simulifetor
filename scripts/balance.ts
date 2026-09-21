// Informe de balance. Uso: npm run balance -- --n=1000 --seed=1 --profile=normal|crimen|familia|pasivo [--out]
import { mkdirSync, writeFileSync } from 'node:fs';
import { reportToMarkdown, runBalance } from '../src/engine/balance';
import type { Profile } from '../src/engine/balance';

const arg = (name: string, def: string) => process.argv.find((a) => a.startsWith(`--${name}=`))?.split('=')[1] ?? def;
const n = Number(arg('n', '500'));
const seed = Number(arg('seed', '1'));
const profile = arg('profile', 'normal') as Profile;

const report = runBalance({ n, seed, profile });
console.log(reportToMarkdown(report));

if (process.argv.includes('--out')) {
  mkdirSync('docs/balance', { recursive: true });
  const day = new Date().toISOString().slice(0, 10);
  writeFileSync(`docs/balance/${day}-${profile}.md`, reportToMarkdown(report) + '\n');
  console.error(`Guardado en docs/balance/${day}-${profile}.md`);
}
