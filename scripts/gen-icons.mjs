// Regenera src/ui/Icon.tsx con imports explícitos de lucide-react-native.
// Uso: npm run icons   (falla con un mensaje claro si algún ícono referenciado no existe)
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

// Íconos usados por el código aunque no aparezcan como `icon: '…'`.
export const EXTRA_ICONS = [
  'Circle', 'Check', 'ChevronRight', 'Gavel', 'Lock', 'Scale', 'Smartphone', 'Landmark', 'Hourglass', 'Sparkles', 'Flag', 'TriangleAlert',
  'CircleCheck', 'MessageCircle', 'TrendingDown', 'Trophy', 'Ghost', 'Baby', 'Star', 'Plus', 'X', 'ArrowLeft', 'Menu', 'Cake', 'Car', 'Siren',
  'Handshake', 'Crown', 'Medal', 'Rocket', 'Target', 'Globe', 'Music', 'Camera', 'Palette', 'Scissors', 'Droplet', 'Eye', 'IdCard', 'Heart',
  'HeartCrack', 'Briefcase', 'School', 'TreePalm', 'Gamepad2', 'Clapperboard', 'PawPrint', 'Pill', 'Coins', 'Banknote', 'Gem',
];

const PATTERNS = [/icon:\s*'([A-Za-z0-9]+)'/g, /icon="([A-Za-z0-9]+)"/g, /icon='([A-Za-z0-9]+)'/g, /name="([A-Z][A-Za-z0-9]+)"/g, /name='([A-Z][A-Za-z0-9]+)'/g];

/** 'Gamepad2' → 'gamepad-2', 'HeartPulse' → 'heart-pulse' (nombre de archivo de lucide). */
export function kebab(name) {
  return name
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/([a-zA-Z])(\d)/g, '$1-$2')
    .toLowerCase();
}

/** Extrae los nombres de íconos citados en un texto de código. */
export function iconsInSource(src) {
  const out = new Set();
  for (const re of PATTERNS) for (const m of src.matchAll(re)) out.add(m[1]);
  return out;
}

function walk(dir, acc = []) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) walk(p, acc);
    else if (/\.(ts|tsx)$/.test(f) && !f.endsWith('Icon.tsx') && !f.endsWith('.test.ts')) acc.push(p);
  }
  return acc;
}

/** Devuelve { ok, missing } comprobando la existencia de cada ícono en lucide-react-native. */
export function checkIcons(names, lucideDir = join(ROOT, 'node_modules/lucide-react-native/dist/esm/icons')) {
  const ok = [];
  const missing = [];
  for (const n of [...names].sort()) (existsSync(join(lucideDir, `${kebab(n)}.mjs`)) ? ok : missing).push(n);
  return { ok, missing };
}

function chunk(items, n = 7) {
  const lines = [];
  for (let i = 0; i < items.length; i += n) lines.push('  ' + items.slice(i, i + n).join(', ') + ',');
  return lines.join('\n');
}

export function renderIconFile(ok) {
  const imports = ok.map((n) => (n === 'Activity' ? 'Activity as ActivityIcon' : n));
  const entries = ok.map((n) => (n === 'Activity' ? 'Activity: ActivityIcon' : n));
  return (
    `import React from 'react';\nimport {\n${chunk(imports)}\n} from 'lucide-react-native';\n` +
    `import type { LucideIcon } from 'lucide-react-native';\n\nconst MAP: Record<string, LucideIcon> = {\n${chunk(entries)}\n};\n\n` +
    `export function Icon({ name, size = 20, color = '#fff' }: { name: string; size?: number; color?: string }) {\n` +
    `  const C = MAP[name] ?? Circle;\n  return <C size={size} color={color} strokeWidth={1.8} />;\n}\n`
  );
}

export function collectAll() {
  const names = new Set(EXTRA_ICONS);
  for (const f of [...walk(join(ROOT, 'src')), join(ROOT, 'App.tsx')]) for (const n of iconsInSource(readFileSync(f, 'utf8'))) names.add(n);
  names.delete('');
  return names;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const { ok, missing } = checkIcons(collectAll());
  if (missing.length) {
    console.error(`Íconos que no existen en lucide-react-native: ${missing.join(', ')}\nCorregí el nombre o usá otro ícono.`);
    process.exit(1);
  }
  writeFileSync(join(ROOT, 'src/ui/Icon.tsx'), renderIconFile(ok));
  console.log(`${ok.length} íconos escritos en src/ui/Icon.tsx`);
}
