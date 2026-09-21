import { describe, it, expect } from 'vitest';
import { validateAiEvent, extractJson } from './validate';
import { contentProblem } from './filter';
import { generateEvents, narrate } from './service';
import { createMock, sampleEventJson } from './providers/mock';
import { createGemini } from './providers/gemini';
import { createGroq } from './providers/groq';
import { postJson } from './http';
import type { FetchLike } from './http';
import { AIError } from './types';
import { allEvents, getEvent, setAiEvents } from '../engine/registry';
import { simulateLife } from '../engine/sim';
import { applyEffects, newEffectCtx } from '../engine/effects';
import { createLife } from '../engine/life';
import { rngOf } from '../engine/rng';
import { eventPrompt, CONTENT_RULES } from './prompts';
import { ALL_EVENTS } from '../content/events';

const base = () => JSON.parse(sampleEventJson(1));
const mut = (fn: (o: any) => void) => {
  const o = base();
  fn(o);
  return o;
};

describe('validador de eventos de IA', () => {
  it('acepta un evento válido y lo convierte en GameEvent seguro', () => {
    const r = validateAiEvent(sampleEventJson(1));
    expect(r.ok).toBe(true);
    if (r.ok) {
      expect(r.event.id.startsWith('ai.')).toBe(true);
      expect(r.event.tags).toContain('ai');
      expect(r.event.weight).toBeLessThanOrEqual(8);
      expect(r.event.once).toBe(true);
      expect(r.event.choices).toHaveLength(2);
      expect(JSON.stringify(r.event)).not.toContain('"die"');
    }
  });

  it('tolera JSON dentro de un bloque de código y con texto alrededor', () => {
    const wrapped = 'Claro, acá va:\n```json\n' + sampleEventJson(2) + '\n```\nEspero que sirva';
    expect(validateAiEvent(wrapped).ok).toBe(true);
    expect(() => extractJson('nada')).toThrow();
  });

  const rejects: [string, unknown][] = [
    ['JSON roto', '{"title": "x", '],
    ['texto sin JSON', 'hola mundo'],
    ['no es un objeto', '[1,2,3]'],
    ['sin título', mut((o) => delete o.title)],
    ['título muy corto', mut((o) => (o.title = 'ab'))],
    ['título muy largo', mut((o) => (o.title = 'a'.repeat(61)))],
    ['texto muy largo', mut((o) => (o.text = 'palabra '.repeat(80)))],
    ['texto muy corto', mut((o) => (o.text = 'corto'))],
    ['categoría inválida', mut((o) => (o.category = 'hackeo'))],
    ['maxAge menor que minAge', mut((o) => ((o.minAge = 50), (o.maxAge = 20)))],
    ['edad negativa', mut((o) => (o.minAge = -1))],
    ['peso fuera de rango', mut((o) => (o.weight = 50))],
    ['campo extra', mut((o) => (o.evil = true))],
    ['sin efectos ni opciones', mut((o) => delete o.choices)],
    ['efectos y opciones a la vez', mut((o) => (o.effects = { happiness: 1 }))],
    ['una sola opción', mut((o) => (o.choices = [o.choices[0]]))],
    ['cuatro opciones', mut((o) => (o.choices = [o.choices[0], o.choices[1], o.choices[0], o.choices[1]]))],
    ['stat fuera de rango (+)', mut((o) => (o.choices[0].outcomes[0].effects.happiness = 40))],
    ['stat fuera de rango (-)', mut((o) => (o.choices[0].outcomes[0].effects.health = -99))],
    ['dinero excesivo', mut((o) => (o.choices[0].outcomes[0].effects.money = 5_000_000))],
    ['moneyPct excesivo', mut((o) => (o.choices[0].outcomes[0].effects.moneyPct = 0.9))],
    ['efecto no permitido (die)', mut((o) => (o.choices[0].outcomes[0].effects.die = 'todo'))],
    ['efecto no permitido (arrest)', mut((o) => (o.choices[0].outcomes[0].effects.arrest = 5))],
    ['efecto no permitido (setFlag)', mut((o) => (o.choices[0].outcomes[0].effects.setFlag = 'x'))],
    ['efectos acumulados enormes', mut((o) => (o.choices[0].outcomes[0].effects = { happiness: 15, health: 15, smarts: 15, looks: 15 }))],
    [
      'más de tres resultados',
      mut(
        (o) =>
          (o.choices[0].outcomes = [
            o.choices[0].outcomes[0],
            o.choices[0].outcomes[0],
            o.choices[0].outcomes[0],
            o.choices[0].outcomes[0],
          ]),
      ),
    ],
    ['resultado sin texto', mut((o) => delete o.choices[0].outcomes[0].text)],
    ['sexo con un menor', mut((o) => (o.text = 'Un adolescente de 15 años tiene sexo con un compañero en la escuela.'))],
    [
      'contenido sexual en evento para menores',
      mut((o) => ((o.minAge = 10), (o.maxAge = 16), (o.text = 'Tu compañero te muestra imágenes de sexo en el recreo del colegio.'))),
    ],
    ['pedofilia', mut((o) => (o.text = 'Aparece una historia de pedofilia en tu barrio que nadie quiere contar.'))],
    ['suicidio', mut((o) => (o.text = 'Pensás en el suicidio cada vez que volvés solo a casa de la oficina.'))],
    ['quitarse la vida en una opción', mut((o) => (o.choices[0].label = 'Quitarse la vida'))],
    ['marca real', mut((o) => (o.text = 'Tu jefe te obliga a comprar todo en Amazon durante el mes entero.'))],
    ['país real', mut((o) => (o.text = 'Te mudás a España para escapar de un rumor de oficina absurdo.'))],
    ['persona real', mut((o) => (o.text = 'Un imitador de Messi aparece en la fiesta de tu empresa anual.'))],
    ['enlace', mut((o) => (o.text = 'Un compañero te manda un enlace http://estafa.example para cobrar premios.'))],
    ['fuga de prompt', mut((o) => (o.text = 'Como modelo de lenguaje no puedo escribir eso, pero acá va una situación.'))],
  ];
  it.each(rejects)('rechaza: %s', (_name, raw) => {
    const r = validateAiEvent(raw);
    expect(r.ok).toBe(false);
  });

  it('rechaza duplicados por id y por título', () => {
    const first = validateAiEvent(sampleEventJson(3));
    expect(first.ok).toBe(true);
    if (!first.ok) return;
    expect(validateAiEvent(sampleEventJson(3), new Set([first.event.id])).ok).toBe(false);
    expect(
      validateAiEvent(
        mut((o) => (o.text = 'Otro texto totalmente distinto para el mismo título de antes.')),
        new Set(),
        new Set(['rumor en la oficina 1']),
      ).ok,
    ).toBe(false);
  });

  it('un evento validado no puede matar ni mover más de lo permitido', () => {
    const r = validateAiEvent(sampleEventJson(4));
    if (!r.ok) throw new Error('debía ser válido');
    const l = createLife(5);
    l.age = 30;
    l.money = 1000;
    const before = { ...l.stats };
    for (const c of r.event.choices!) for (const o of c.outcomes) applyEffects(l, o.effects, newEffectCtx(), rngOf(l));
    expect(l.alive).toBe(true);
    for (const k of Object.keys(before) as (keyof typeof before)[]) expect(Math.abs(l.stats[k] - before[k])).toBeLessThanOrEqual(45);
  });
});

describe('filtro de contenido', () => {
  it('deja pasar humor negro adulto normal', () => {
    expect(contentProblem('Tu suegra te dice que tenés cara de deuda. Tiene razón. Te robaste la última medialuna.')).toBeNull();
    expect(contentProblem('Pasás la noche con alguien que conociste en un boliche y no recordás el nombre.')).toBeNull();
  });
  it('el prompt lleva las reglas de contenido al principio', () => {
    expect(eventPrompt('ctx').startsWith(CONTENT_RULES)).toBe(true);
    expect(CONTENT_RULES).toContain('menores');
  });
});

describe('generación con proveedor simulado', () => {
  const known = () => ({ ids: new Set<string>(), titles: new Set<string>() });

  it('agrega los válidos y registra los rechazados', async () => {
    const p = createMock([sampleEventJson(10), 'no es json', sampleEventJson(11)]);
    const r = await generateEvents(p, 'k', 3, 'ctx', known());
    expect(r.added).toHaveLength(2);
    expect(r.rejected).toHaveLength(1);
    expect(r.error).toBeUndefined();
  });

  it('un error de red corta la tanda sin lanzar excepciones', async () => {
    const p = createMock([sampleEventJson(20), new AIError('network', 'caído')]);
    const r = await generateEvents(p, 'k', 4, 'ctx', known());
    expect(r.added).toHaveLength(1);
    expect(r.error?.kind).toBe('network');
  });

  it('cuota agotada y clave inválida se informan y no lanzan', async () => {
    for (const kind of ['quota', 'auth', 'timeout'] as const) {
      const r = await generateEvents(createMock([new AIError(kind, kind)]), 'k', 2, 'ctx', known());
      expect(r.added).toHaveLength(0);
      expect(r.error?.kind).toBe(kind);
    }
  });

  it('un rechazo del filtro del proveedor no es un error fatal', async () => {
    const r = await generateEvents(createMock([new AIError('filtered', 'x'), sampleEventJson(30)]), 'k', 2, 'ctx', known());
    expect(r.added).toHaveLength(1);
    expect(r.rejected).toHaveLength(1);
  });

  it('el narrador devuelve null si falla, tarda o el texto no pasa el filtro', async () => {
    const original = 'Tu jefe te pide que trabajes el fin de semana sin pagarte nada.';
    expect(await narrate(createMock([new AIError('timeout', 't')]), 'k', 'e1', original, 'ctx')).toBeNull();
    expect(await narrate(createMock(['{"x":1}']), 'k', 'e2', original, 'ctx')).toBeNull();
    expect(
      await narrate(createMock(['Mirá este enlace http://malo.example que te va a gustar mucho']), 'k', 'e3', original, 'ctx'),
    ).toBeNull();
    expect(await narrate(createMock(['ok']), 'k', 'e4', original, 'ctx')).toBeNull();
    const good = await narrate(
      createMock(['Tu jefe, con su sonrisa de siempre, te pide que trabajes el sábado gratis.']),
      'k',
      'e5',
      original,
      'ctx',
    );
    expect(good).toContain('sábado');
  });
});

describe('proveedores HTTP (fetch simulado, sin red)', () => {
  const ok =
    (data: unknown): FetchLike =>
    async () => ({ ok: true, status: 200, json: async () => data, text: async () => JSON.stringify(data) });
  const status =
    (n: number): FetchLike =>
    async () => ({ ok: false, status: n, json: async () => ({}), text: async () => '' });

  it('Gemini y Groq extraen el texto de la respuesta', async () => {
    const g = createGemini(ok({ candidates: [{ content: { parts: [{ text: 'hola' }] } }] }));
    expect(await g.generate('p', 'k')).toBe('hola');
    const q = createGroq(ok({ choices: [{ message: { content: 'chau' } }] }));
    expect(await q.generate('p', 'k')).toBe('chau');
  });

  it('traducen 401, 429 y respuestas vacías', async () => {
    await expect(createGroq(status(401)).generate('p', 'k')).rejects.toMatchObject({ kind: 'auth' });
    await expect(createGroq(status(429)).generate('p', 'k')).rejects.toMatchObject({ kind: 'quota' });
    await expect(createGroq(ok({ choices: [] })).generate('p', 'k')).rejects.toMatchObject({ kind: 'bad-response' });
    await expect(createGemini(ok({ promptFeedback: { blockReason: 'SAFETY' } })).generate('p', 'k')).rejects.toMatchObject({
      kind: 'filtered',
    });
  });

  it('reintenta una vez ante un 500 y luego tiene éxito', async () => {
    let calls = 0;
    const f: FetchLike = async () => {
      calls++;
      return calls === 1
        ? { ok: false, status: 500, json: async () => ({}), text: async () => '' }
        : { ok: true, status: 200, json: async () => ({ x: 1 }), text: async () => '' };
    };
    expect(await postJson('u', {}, {}, { fetchImpl: f })).toEqual({ x: 1 });
    expect(calls).toBe(2);
  });

  it('un pedido que no responde termina en timeout', async () => {
    const hang: FetchLike = (_u, init) => new Promise((_res, rej) => init.signal?.addEventListener('abort', () => rej(new Error('abort'))));
    await expect(postJson('u', {}, {}, { fetchImpl: hang, timeoutMs: 20, retries: 0 })).rejects.toMatchObject({ kind: 'timeout' });
  });

  it('la clave viaja en el encabezado, nunca en el cuerpo', async () => {
    let seen: { headers: Record<string, string>; body: string } | null = null;
    const f: FetchLike = async (_u, init) => {
      seen = { headers: init.headers, body: init.body };
      return { ok: true, status: 200, json: async () => ({ choices: [{ message: { content: 'x' } }] }), text: async () => '' };
    };
    await createGroq(f).generate('hola', 'SECRETA123');
    expect(seen!.headers.Authorization).toContain('SECRETA123');
    expect(seen!.body).not.toContain('SECRETA123');
  });
});

describe('integración con el motor', () => {
  it('sin eventos de IA el motor es idéntico (mismas semillas, mismas vidas)', () => {
    setAiEvents([]);
    const a = simulateLife(77);
    const b = simulateLife(77);
    expect(JSON.stringify(a.log)).toBe(JSON.stringify(b.log));
    expect(allEvents()).toBe(ALL_EVENTS);
  });

  it('los eventos del pool se registran y se pueden buscar; al vaciar desaparecen', () => {
    const r = validateAiEvent(sampleEventJson(40));
    if (!r.ok) throw new Error('inválido');
    setAiEvents([r.event]);
    expect(getEvent(r.event.id)).toBeDefined();
    expect(allEvents().length).toBe(ALL_EVENTS.length + 1);
    // Con eventos de IA activos las vidas siguen terminando sin errores.
    for (let s = 1; s <= 30; s++) expect(simulateLife(s).alive).toBe(false);
    setAiEvents([]);
    expect(getEvent(r.event.id)).toBeUndefined();
  });
});
