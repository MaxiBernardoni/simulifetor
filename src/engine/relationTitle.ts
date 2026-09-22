import type { Person } from './types';

export type TitleTone = 'good' | 'love' | 'bad' | 'neutral';
export interface RelationTitle {
  title: string;
  tone: TitleTone;
}

const FAMILY = new Set(['mother', 'father', 'sibling', 'child']);

/**
 * El "título" de una relación: resume amistad, amor y enemistad (y el parentesco) en una etiqueta.
 * Ej.: Mejor amigo, Amiga con derechos, Amante, Némesis, Amor-odio, Familiar entrañable, Alma gemela.
 * `hasPartner`: el jugador tiene otra pareja oficial (cambia "Romance" por "Amante").
 */
export function relationTitle(
  p: Pick<Person, 'kind' | 'gender' | 'friendship' | 'romance' | 'married'>,
  hasPartner = false,
): RelationTitle {
  const f = p.friendship;
  const r = p.romance ?? 0;
  const fem = p.gender === 'F';
  const g = (m: string, w: string) => (fem ? w : m);
  const out = (title: string, tone: TitleTone): RelationTitle => ({ title, tone });
  const family = FAMILY.has(p.kind);

  // Amor mezclado con enemistad.
  if (r >= 25 && f < 0) {
    if (family) return out('Familiar: amor-odio', 'bad');
    return f <= -50 ? out('Amor-odio', 'bad') : out('Relación tóxica', 'bad');
  }

  if (p.kind === 'partner') {
    if (f >= 80 && r >= 80) return out('Alma gemela', 'love');
    if (f < 0) return out('Pareja en crisis', 'bad');
    if (p.married) return out(f < 25 ? g('Esposo distante', 'Esposa distante') : g('Esposo', 'Esposa'), 'love');
    return out(f < 25 ? 'Pareja distante' : 'Pareja', 'love');
  }

  if (p.kind === 'ex') {
    if (f <= -50) return out(g('Ex enemigo', 'Ex enemiga'), 'bad');
    if (f < 0) return out('Ex con mala onda', 'bad');
    if (r >= 40) return out('Ex con cuentas pendientes', 'love');
    if (f >= 60) return out(g('Ex amigable', 'Ex amigable'), 'good');
    return out('Ex', 'neutral');
  }

  if (family) {
    if (f <= -80) return out('Némesis familiar', 'bad');
    if (f <= -50) return out('Familiar enemigo', 'bad');
    if (f < 0) return out('Familiar con mala onda', 'bad');
    if (r >= 60 && f >= 50) return out('Familiar y amante', 'love');
    if (r >= 25) return out('Familiar con tensión romántica', 'love');
    if (f >= 80) return out('Familiar entrañable', 'good');
    if (f >= 50) return out('Familiar cercano', 'good');
    if (f >= 15) return out('Familiar', 'neutral');
    return out('Familiar distante', 'neutral');
  }

  // Amigos y conocidos.
  if (f <= -80) return out('Némesis', 'bad');
  if (f <= -50) return out(g('Enemigo', 'Enemiga'), 'bad');
  if (f < 0) return out('Mala onda', 'bad');
  if (r >= 60 && f >= 50) return out(hasPartner ? 'Amante' : 'Romance', 'love');
  if (r >= 45 && f >= 40) return out(g('Amigo con derechos', 'Amiga con derechos'), 'love');
  if (r >= 25) return out('Interés amoroso', 'love');
  if (f >= 85) return out(g('Mejor amigo', 'Mejor amiga'), 'good');
  if (f >= 40) return out(g('Amigo', 'Amiga'), 'good');
  if (f >= 15) return out(g('Conocido', 'Conocida'), 'neutral');
  return out('Neutral', 'neutral');
}
