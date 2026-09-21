import type { Life } from './types';
import type { WorldData } from './world';
import { getCareer } from './registry';

const check = (bad: string[]) => (cond: boolean, msg: string) => {
  if (!cond) bad.push(msg);
};

/** Devuelve la lista de violaciones de invariantes de una vida (vacía si está sana). */
export function checkLife(l: Life): string[] {
  const bad: string[] = [];
  const add = check(bad);
  for (const [k, v] of Object.entries(l.stats)) add(Number.isInteger(v) && v >= 0 && v <= 100, `stat ${k}=${v} fuera de 0–100 o no entero`);
  for (const k of ['money', 'loan', 'invested', 'pension'] as const) add(Number.isFinite(l[k]), `${k} no es finito (${l[k]})`);
  add(l.loan >= 0, `loan negativo (${l.loan})`);
  add(l.invested >= 0, `invested negativo (${l.invested})`);
  add(l.pension >= 0, `pension negativa (${l.pension})`);
  add(l.age === l.year - l.birthYear, `edad ${l.age} != año ${l.year} - nacimiento ${l.birthYear}`);
  add(l.age >= 0, 'edad negativa');
  if (!l.alive) add(typeof l.cause === 'string' && l.cause.length > 0, 'muerto sin causa');
  add(l.jailYears >= 0, `jailYears negativo (${l.jailYears})`);
  if (l.jailYears > 0) add(l.job === null && l.edu.enrolled === null, 'preso con trabajo o estudiando');
  if (l.job) {
    const c = getCareer(l.job.careerId);
    add(!!c, `carrera inexistente ${l.job.careerId}`);
    if (c) add(l.job.level >= 0 && l.job.level < c.levels.length, `nivel ${l.job.level} fuera de la carrera ${c.id}`);
    add(l.job.salary > 0, `salario no positivo (${l.job.salary})`);
  }

  const ids = new Set<string>();
  let partners = 0;
  for (const p of l.people) {
    add(!ids.has(p.id), `persona duplicada ${p.id}`);
    ids.add(p.id);
    add(Number.isFinite(p.age) && p.age >= 0, `edad inválida de ${p.name} (${p.age})`);
    add(p.friendship >= -100 && p.friendship <= 100, `amistad de ${p.name} = ${p.friendship}`);
    if (p.romance !== undefined) add(p.romance >= 0 && p.romance <= 100, `amor de ${p.name} = ${p.romance}`);
    if (p.kind === 'partner' && p.alive) partners++;
    if (p.married) add(p.kind === 'partner' || p.kind === 'ex', `casado/a no-pareja: ${p.kind}`);
  }
  add(partners <= 1, `${partners} parejas vivas`);

  for (const [id, y] of Object.entries(l.eventLast)) add(y <= l.year, `eventLast ${id}=${y} > año ${l.year}`);
  for (const [k, v] of Object.entries(l.flags)) add(typeof v === 'boolean', `flag ${k} no booleano`);
  for (const e of l.log) if (/\{\w+\}/.test(e.text)) bad.push(`placeholder sin resolver: "${e.text}"`);

  try {
    const back = JSON.parse(JSON.stringify(l));
    add(JSON.stringify(back) === JSON.stringify(l), 'la vida no sobrevive a JSON (ida y vuelta distinta)');
  } catch {
    bad.push('la vida no se puede serializar');
  }
  return bad;
}

/** Devuelve la lista de violaciones de invariantes del mundo familiar. */
export function checkWorld(wd: WorldData, current?: Life): string[] {
  const bad: string[] = [];
  const add = check(bad);
  const w = wd.world;
  const nodes = w.nodes;
  add(!!nodes[w.currentId], 'currentId no existe');
  if (current) add(current.nodeId === w.currentId, `currentId ${w.currentId} != life.nodeId ${current.nodeId}`);
  for (const n of Object.values(nodes)) {
    for (const [k, ref] of [
      ['padre', n.fatherId],
      ['madre', n.motherId],
      ['pareja', n.partnerId],
    ] as const) {
      if (ref) add(!!nodes[ref], `${n.id}: ${k} ${ref} no existe`);
    }
    // Un viudo/a que se vuelve a casar deja al difunto apuntándole: solo se exige reciprocidad entre vivos.
    if (n.alive && n.partnerId && nodes[n.partnerId]?.alive) add(nodes[n.partnerId].partnerId === n.id, `${n.id}: pareja no recíproca`);
    if (n.alive) add(n.age === w.year - n.birthYear, `${n.id}: edad ${n.age} != ${w.year} - ${n.birthYear}`);
    else add(n.deathYear !== undefined, `${n.id}: muerto sin deathYear`);
    for (const pid of [n.fatherId, n.motherId]) {
      const p = pid ? nodes[pid] : undefined;
      // Los nodos generados de la familia extendida pueden tener márgenes más chicos: se tolera desde 12.
      if (p) add(n.birthYear - p.birthYear >= 12, `${n.id}: nació ${n.birthYear - p.birthYear} años después de ${p.id}`);
    }
    // sin ciclos de ancestros
    const seen = new Set<string>([n.id]);
    let stack = [n.fatherId, n.motherId].filter(Boolean) as string[];
    let guard = 0;
    while (stack.length && guard++ < 500) {
      const id = stack.pop()!;
      if (seen.has(id)) {
        if (id === n.id) bad.push(`${n.id}: es su propio ancestro`);
        continue;
      }
      seen.add(id);
      const a = nodes[id];
      if (a) stack = stack.concat([a.fatherId, a.motherId].filter(Boolean) as string[]);
    }
  }
  for (const [id, life] of Object.entries(wd.lives)) {
    add(!!nodes[id], `vida ${id} sin nodo`);
    if (nodes[id]) add(nodes[id].alive || !life.alive, `vida ${id} viva con nodo muerto`);
  }
  return bad;
}
