import { createLife } from './life';
import { autoPlay } from './autoplay';
import { realNetWorth } from './assets';
import { allEvents } from './registry';

export type Profile = 'normal' | 'crimen' | 'familia' | 'pasivo';

const PROFILES: Record<Profile, { crimeChance: number; activityChance: number; familyBias?: boolean }> = {
  normal: { crimeChance: 0.08, activityChance: 0.5 },
  crimen: { crimeChance: 0.7, activityChance: 0.5 },
  familia: { crimeChance: 0.08, activityChance: 0.5, familyBias: true },
  pasivo: { crimeChance: 0, activityChance: 0 },
};

export interface BalanceReport {
  profile: Profile;
  n: number;
  ageMean: number;
  age: { p10: number; p50: number; p90: number };
  ageHistogram: Record<string, number>;
  causes: Record<string, number>;
  wealth: { p10: number; p50: number; p90: number };
  pct: {
    bankrupt: number;
    millionaire: number;
    record: number;
    married: number;
    children: number;
    degree: number;
    house: number;
    jailed: number;
  };
  /** Cuántas de cada 1.000 vidas dispararon cada evento (una vez o más). */
  eventsPer1000: Record<string, number>;
  neverFired: string[];
  dominant: { id: string; share: number }[];
  eventsPerYear: number;
  goodShare: number;
  msPerLife: number;
}

const pct = (a: number[], q: number) => {
  const s = [...a].sort((x, y) => x - y);
  return s[Math.min(s.length - 1, Math.floor(q * s.length))] ?? 0;
};

/** Simula `n` vidas con el bot y devuelve las métricas de balance. Determinístico para una semilla dada. */
export function runBalance(opts: { n: number; seed?: number; profile?: Profile }): BalanceReport {
  const profile = opts.profile ?? 'normal';
  const cfg = PROFILES[profile];
  const seed0 = opts.seed ?? 1;
  const t0 = Date.now();
  const ages: number[] = [];
  const wealth: number[] = [];
  const causes: Record<string, number> = {};
  const fired: Record<string, number> = {};
  const c = { bankrupt: 0, millionaire: 0, record: 0, married: 0, children: 0, degree: 0, house: 0, jailed: 0 };
  let logsGood = 0;
  let logsAll = 0;
  let eventCount = 0;
  let yearsLived = 0;

  for (let i = 0; i < opts.n; i++) {
    const seed = seed0 * 100003 + i * 7919 + 3;
    const life = createLife(seed);
    autoPlay(life, { seed, ...cfg });
    ages.push(life.age);
    yearsLived += life.age;
    wealth.push(realNetWorth(life));
    const cause = life.cause ?? 'desconocida';
    causes[cause] = (causes[cause] ?? 0) + 1;
    if (life.flags.bankrupt) c.bankrupt++;
    if (realNetWorth(life) >= 1_000_000) c.millionaire++;
    if (life.flags.criminal_record || life.flags.ex_convict) c.record++;
    if (life.people.some((p) => p.married)) c.married++;
    if (life.people.some((p) => p.kind === 'child')) c.children++;
    if (life.edu.level >= 3) c.degree++;
    if (life.assets.some((a) => a.kind === 'house')) c.house++;
    if (life.flags.ex_convict) c.jailed++;
    for (const id of Object.keys(life.eventLast)) {
      fired[id] = (fired[id] ?? 0) + 1;
      eventCount++;
    }
    for (const e of life.log) {
      if (e.tone === 'good') logsGood++;
      if (e.tone === 'good' || e.tone === 'bad') logsAll++;
    }
  }

  const n = opts.n;
  const hist: Record<string, number> = {};
  for (const a of ages) {
    const k = `${Math.floor(a / 10) * 10}-${Math.floor(a / 10) * 10 + 9}`;
    hist[k] = (hist[k] ?? 0) + 1;
  }
  const events = allEvents();
  const per1000: Record<string, number> = {};
  for (const [id, v] of Object.entries(fired)) per1000[id] = Math.round((v / n) * 1000);
  const totalFired = Object.values(fired).reduce((s, v) => s + v, 0) || 1;
  return {
    profile,
    n,
    ageMean: ages.reduce((s, v) => s + v, 0) / n,
    age: { p10: pct(ages, 0.1), p50: pct(ages, 0.5), p90: pct(ages, 0.9) },
    ageHistogram: hist,
    causes: Object.fromEntries(
      Object.entries(causes)
        .sort((a, b) => b[1] - a[1])
        .map(([k, v]) => [k, +((v / n) * 100).toFixed(1)]),
    ),
    wealth: { p10: pct(wealth, 0.1), p50: pct(wealth, 0.5), p90: pct(wealth, 0.9) },
    pct: Object.fromEntries(Object.entries(c).map(([k, v]) => [k, +((v / n) * 100).toFixed(1)])) as BalanceReport['pct'],
    eventsPer1000: per1000,
    neverFired: events.filter((e) => !fired[e.id]).map((e) => e.id),
    dominant: Object.entries(fired)
      .map(([id, v]) => ({ id, share: +((v / totalFired) * 100).toFixed(2) }))
      .filter((d) => d.share > 5),
    eventsPerYear: +(eventCount / Math.max(1, yearsLived)).toFixed(2),
    goodShare: +((logsGood / Math.max(1, logsAll)) * 100).toFixed(1),
    msPerLife: +((Date.now() - t0) / n).toFixed(2),
  };
}

export function reportToMarkdown(r: BalanceReport): string {
  const money = (v: number) => `$${Math.round(v).toLocaleString('en-US').replace(/,/g, '.')}`;
  const lines = [
    `# Balance · perfil ${r.profile} · ${r.n} vidas`,
    '',
    `- Esperanza de vida: media **${r.ageMean.toFixed(1)}** · p10 ${r.age.p10} · p50 ${r.age.p50} · p90 ${r.age.p90}`,
    `- Patrimonio final (valores del 2000): p10 ${money(r.wealth.p10)} · p50 ${money(r.wealth.p50)} · p90 ${money(r.wealth.p90)}`,
    `- % de vidas: ${Object.entries(r.pct)
      .map(([k, v]) => `${k} ${v}%`)
      .join(' · ')}`,
    `- Eventos por año vivido: ${r.eventsPerYear} · resultados buenos: ${r.goodShare}% · ${r.msPerLife} ms por vida`,
    '',
    '## Edades de muerte',
    ...Object.entries(r.ageHistogram)
      .sort()
      .map(([k, v]) => `- ${k}: ${((v / r.n) * 100).toFixed(1)}%`),
    '',
    '## Causas de muerte (%)',
    ...Object.entries(r.causes)
      .slice(0, 12)
      .map(([k, v]) => `- ${k}: ${v}%`),
    '',
    `## Eventos dominantes (> 5 % de los disparos): ${r.dominant.length ? r.dominant.map((d) => `${d.id} (${d.share}%)`).join(', ') : 'ninguno'}`,
    '',
    `## Eventos que nunca se dispararon (${r.neverFired.length})`,
    r.neverFired.length ? r.neverFired.map((id) => `- ${id}`).join('\n') : '- ninguno',
    '',
    '## Los 15 eventos más frecuentes (por 1.000 vidas)',
    ...Object.entries(r.eventsPer1000)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 15)
      .map(([k, v]) => `- ${k}: ${v}`),
  ];
  return lines.join('\n');
}
