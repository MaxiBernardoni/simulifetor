import type { TreeNode, World } from './world';

/** Generaciones hacia arriba hasta cada ancestro (uno mismo = 0). */
export function ancestorsOf(w: World, id: string): Map<string, number> {
  const out = new Map<string, number>([[id, 0]]);
  let frontier = [id];
  let d = 0;
  while (frontier.length && d < 12) {
    d++;
    const next: string[] = [];
    for (const cur of frontier) {
      const n = w.nodes[cur];
      for (const pid of [n?.fatherId, n?.motherId]) {
        if (pid && w.nodes[pid] && !out.has(pid)) {
          out.set(pid, d);
          next.push(pid);
        }
      }
    }
    frontier = next;
  }
  return out;
}

export interface CommonAncestor {
  id: string;
  da: number;
  db: number;
}

/** Ancestro común más cercano entre dos personas (incluye a una de ellas si es ancestro de la otra). */
export function commonAncestor(w: World, a: string, b: string): CommonAncestor | null {
  const A = ancestorsOf(w, a);
  const B = ancestorsOf(w, b);
  let best: CommonAncestor | null = null;
  for (const [id, da] of A) {
    const db = B.get(id);
    if (db === undefined) continue;
    if (
      !best ||
      Math.max(da, db) < Math.max(best.da, best.db) ||
      (Math.max(da, db) === Math.max(best.da, best.db) && da + db < best.da + best.db)
    ) {
      best = { id, da, db };
    }
  }
  return best;
}

/** Distancia de sangre: máximo de generaciones hasta el ancestro común. null si no son parientes de sangre. */
export function bloodDistance(w: World, a: string, b: string): number | null {
  if (a === b) return 0;
  const c = commonAncestor(w, a, b);
  return c ? Math.max(c.da, c.db) : null;
}

export const MAX_SWITCH_DISTANCE = 2;

// ── Anti-abuso de los cambios de personaje (T16). Ajustá estos valores si te resultan duros o blandos. ──
/** Años de juego que tienen que pasar entre dos cambios voluntarios. */
export const SWITCH_COOLDOWN_YEARS = 5;
/** Máximo de cambios voluntarios mientras dura una generación (la muerte siempre permite continuar). */
export const MAX_SWITCHES_PER_GENERATION = 3;

export interface SwitchCheck {
  ok: boolean;
  reason?: string;
  /** El bloqueo pasa solo con el tiempo (enfriamiento). */
  temporary?: boolean;
}

/**
 * Regla anti-abuso: solo se puede vivir la vida de parientes de sangre vivos a hasta 2 generaciones de distancia.
 * Mientras el personaje actual siga vivo (cambio voluntario) además rigen:
 * - la distancia se mide también desde el personaje ancla (`w.anchorId`: con el que arrancó la ranura o el que
 *   tomaste después de una muerte), así los saltos encadenados no alejan más de 2 generaciones;
 * - un enfriamiento de `SWITCH_COOLDOWN_YEARS` años entre cambios;
 * - un tope de `MAX_SWITCHES_PER_GENERATION` cambios por generación.
 * Si el actual murió, ninguna de las tres aplica.
 */
export function canSwitchTo(w: World, fromId: string, toId: string): SwitchCheck {
  const to = w.nodes[toId];
  if (!to) return { ok: false, reason: 'No existe.' };
  if (fromId === toId) return { ok: false, reason: 'Es tu personaje actual.' };
  if (!to.alive) return { ok: false, reason: 'Ya falleció.' };
  const d = bloodDistance(w, fromId, toId);
  if (d === null) return { ok: false, reason: 'No es pariente de sangre (es familia política).' };
  if (d > MAX_SWITCH_DISTANCE) return { ok: false, reason: 'Está a más de 2 generaciones de distancia: no comparten abuelos.' };

  if (w.nodes[fromId]?.alive) {
    const anchor = w.anchorId ?? fromId;
    if (anchor !== fromId && w.nodes[anchor]) {
      const da = bloodDistance(w, anchor, toId);
      if (da === null || da > MAX_SWITCH_DISTANCE) {
        return { ok: false, reason: 'Se aleja demasiado de tu línea familiar de origen. Se destraba cuando tu personaje actual muera.' };
      }
    }
    if (w.lastSwitchYear !== undefined) {
      const left = SWITCH_COOLDOWN_YEARS - (w.year - w.lastSwitchYear);
      if (left > 0) {
        return {
          ok: false,
          temporary: true,
          reason: `Tenés que esperar ${left} ${left === 1 ? 'año' : 'años'} más para volver a cambiar de personaje.`,
        };
      }
    }
    const gen = depthOf(w, fromId);
    if ((w.switchesInGeneration?.[gen] ?? 0) >= MAX_SWITCHES_PER_GENERATION) {
      return {
        ok: false,
        reason: 'Ya cambiaste de personaje demasiadas veces en esta generación. Se destraba cuando tu personaje actual muera.',
      };
    }
  }
  return { ok: true };
}

const pick = (g: 'M' | 'F', m: string, f: string) => (g === 'M' ? m : f);

/** Cómo se llama `toId` respecto de `fromId` ("Primo", "Cuñada", "Abuelo"…). */
export function relationLabel(w: World, fromId: string, toId: string): string {
  const to = w.nodes[toId];
  const from = w.nodes[fromId];
  if (!to || !from) return '';
  const g = to.gender;
  if (fromId === toId) return 'Yo';

  const blood = (a: string, b: string): string | null => {
    const c = commonAncestor(w, a, b);
    if (!c) return null;
    const key = `${c.da},${c.db}`;
    const na = w.nodes[a];
    const nb = w.nodes[b];
    switch (key) {
      case '0,1':
        return pick(g, 'Hijo', 'Hija');
      case '0,2':
        return pick(g, 'Nieto', 'Nieta');
      case '0,3':
        return pick(g, 'Bisnieto', 'Bisnieta');
      case '1,0':
        return pick(g, 'Padre', 'Madre');
      case '2,0':
        return pick(g, 'Abuelo', 'Abuela');
      case '3,0':
        return pick(g, 'Bisabuelo', 'Bisabuela');
      case '1,1': {
        const both = na.fatherId && na.fatherId === nb.fatherId && na.motherId && na.motherId === nb.motherId;
        return both ? pick(g, 'Hermano', 'Hermana') : pick(g, 'Medio hermano', 'Media hermana');
      }
      case '1,2':
        return pick(g, 'Sobrino', 'Sobrina');
      case '2,1':
        return pick(g, 'Tío', 'Tía');
      case '2,2':
        return pick(g, 'Primo', 'Prima');
      case '1,3':
        return pick(g, 'Sobrino nieto', 'Sobrina nieta');
      case '3,1':
        return pick(g, 'Tío abuelo', 'Tía abuela');
      case '2,3':
        return pick(g, 'Sobrino segundo', 'Sobrina segunda');
      case '3,2':
        return pick(g, 'Tío segundo', 'Tía segunda');
      case '3,3':
        return pick(g, 'Primo segundo', 'Prima segunda');
      default:
        return pick(g, 'Pariente lejano', 'Pariente lejana');
    }
  };

  const direct = blood(fromId, toId);
  if (direct) return direct;

  if (from.partnerId === toId || to.partnerId === fromId) return to.married ? pick(g, 'Esposo', 'Esposa') : 'Pareja';

  // Familia política: la pareja de un pariente tuyo.
  if (to.partnerId && w.nodes[to.partnerId]) {
    const rel = commonAncestor(w, fromId, to.partnerId);
    if (rel) {
      const k = `${rel.da},${rel.db}`;
      if (k === '1,1') return pick(g, 'Cuñado', 'Cuñada');
      if (k === '0,1') return pick(g, 'Yerno', 'Nuera');
      if (k === '1,0') return pick(g, 'Pareja de tu padre', 'Pareja de tu madre');
      if (k === '2,1') return pick(g, 'Tío político', 'Tía política');
      if (k === '1,2') return pick(g, 'Sobrino político', 'Sobrina política');
      if (k === '2,2') return pick(g, 'Primo político', 'Prima política');
    }
  }
  // Un pariente de tu pareja.
  if (from.partnerId && w.nodes[from.partnerId]) {
    const rel = commonAncestor(w, from.partnerId, toId);
    if (rel) {
      const k = `${rel.da},${rel.db}`;
      if (k === '1,0') return pick(g, 'Suegro', 'Suegra');
      if (k === '1,1') return pick(g, 'Cuñado', 'Cuñada');
      if (k === '2,0') return pick(g, 'Abuelo político', 'Abuela política');
    }
  }
  return 'Familia política';
}

/** Generaciones desde la raíz del árbol (1 = fundadores). */
export function depthOf(w: World, id: string): number {
  const n = w.nodes[id];
  if (!n) return 1;
  const f = n.fatherId ? depthOf(w, n.fatherId) : 0;
  const m = n.motherId ? depthOf(w, n.motherId) : 0;
  return 1 + Math.max(f, m);
}

// ───────────────────────── Bosque para dibujar el árbol ─────────────────────────

export interface ForestUnit {
  head: TreeNode;
  partner?: TreeNode;
  /** La pareja también aparece como hijo/a en otra rama. */
  partnerLinked?: boolean;
  children: ForestUnit[];
  /** Hijos que se muestran en otra rama (para no repetirlos). */
  hiddenChildren: number;
}

/**
 * Arma el árbol como bosque de unidades familiares (pareja + hijos). Cada persona aparece una sola vez como
 * descendiente; las parejas que pertenecen a otra rama se marcan como vinculadas.
 */
export function buildForest(w: World): ForestUnit[] {
  const nodes = Object.values(w.nodes);
  const cur = w.nodes[w.currentId];
  const anc = cur ? ancestorsOf(w, cur.id) : new Map<string, number>();
  const placed = new Set<string>();
  const consumed = new Set<string>();

  const roots = nodes.filter((n) => !n.fatherId && !n.motherId && (n.blood || !n.partnerId || !w.nodes[n.partnerId]));
  roots.sort(
    (a, b) =>
      (anc.has(a.id) ? 0 : 1) - (anc.has(b.id) ? 0 : 1) ||
      (cur && a.surname === cur.surname ? 0 : 1) - (cur && b.surname === cur.surname ? 0 : 1) ||
      a.birthYear - b.birthYear,
  );

  const build = (head: TreeNode): ForestUnit => {
    placed.add(head.id);
    const partner = head.partnerId ? w.nodes[head.partnerId] : undefined;
    const ids = new Set<string>([head.id, ...(partner ? [partner.id] : [])]);
    const kids = nodes.filter((n) => (n.fatherId && ids.has(n.fatherId)) || (n.motherId && ids.has(n.motherId)));
    kids.sort((a, b) => a.birthYear - b.birthYear);
    const children: ForestUnit[] = [];
    let hidden = 0;
    for (const k of kids) {
      if (placed.has(k.id)) hidden++;
      else children.push(build(k));
    }
    return { head, partner, partnerLinked: !!partner && !!(partner.fatherId || partner.motherId), children, hiddenChildren: hidden };
  };

  const out: ForestUnit[] = [];
  for (const r of roots) {
    if (consumed.has(r.id) || placed.has(r.id)) continue;
    const p = r.partnerId ? w.nodes[r.partnerId] : undefined;
    if (p && !p.fatherId && !p.motherId) consumed.add(p.id);
    out.push(build(r));
  }
  return out;
}
