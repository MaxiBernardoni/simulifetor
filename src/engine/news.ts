import type { NewsItem, World } from './world';
import { relationLabel } from './kinship';

const NEWS_MAX = 60;

export type Snapshot = Map<string, { alive: boolean; partnerId?: string; married?: boolean }>;

/** Foto del estado de las personas, para comparar cuando pasa un año y detectar novedades. */
export function snapshotWorld(w: World): Snapshot {
  const s: Snapshot = new Map();
  for (const n of Object.values(w.nodes)) s.set(n.id, { alive: n.alive, partnerId: n.partnerId, married: n.married });
  return s;
}

const first = (name: string) => name.split(' ')[0];
const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

/** Agrega una novedad (las más viejas se descartan). */
export function pushNews(w: World, kind: NewsItem['kind'], text: string, nodeId?: string): void {
  w.newsSeq = (w.newsSeq ?? 0) + 1;
  const item: NewsItem = { id: w.newsSeq, year: w.year, kind, text, nodeId };
  w.news = [...(w.news ?? []), item].slice(-NEWS_MAX);
}

/** Compara con la foto anterior y escribe las novedades de la familia: nacimientos, muertes, casamientos y separaciones. */
export function recordNews(w: World, before: Snapshot): void {
  const label = (id: string) => {
    const l = relationLabel(w, w.currentId, id).toLowerCase();
    return l ? `tu ${l}` : 'un familiar';
  };
  for (const n of Object.values(w.nodes)) {
    if (n.id === w.currentId) continue;
    const b = before.get(n.id);
    const nm = first(n.name);
    if (!b) {
      const mother = n.motherId ? w.nodes[n.motherId] : undefined;
      if (n.age === 0 && mother) pushNews(w, 'birth', `Nació ${nm}, hijo/a de ${label(mother.id)} ${first(mother.name)}.`, n.id);
      continue;
    }
    if (b.alive && !n.alive) pushNews(w, 'death', `Falleció ${label(n.id)} ${nm} a los ${n.age} años.`, n.id);
    if (n.alive && n.partnerId && n.partnerId !== b.partnerId) {
      const p = w.nodes[n.partnerId];
      if (p)
        pushNews(w, 'wedding', `${cap(label(n.id))} ${nm} ${n.married ? 'se casó con' : 'empezó a salir con'} ${first(p.name)}.`, n.id);
    } else if (n.alive && b.partnerId && !n.partnerId) {
      pushNews(w, 'split', `${cap(label(n.id))} ${nm} se separó.`, n.id);
    }
  }
}
