import type { AIProvider } from '../types';

/** Proveedor simulado para tests y para probar la UI sin red. Recorre las respuestas en ciclo; un Error se lanza. */
export function createMock(responses: (string | Error)[]): AIProvider {
  let i = 0;
  return {
    id: 'mock',
    async generate() {
      const r = responses[i % responses.length];
      i++;
      if (r instanceof Error) throw r;
      return r;
    },
  };
}

/** Un evento válido de ejemplo (para el botón de prueba en desarrollo). */
export function sampleEventJson(n: number): string {
  return JSON.stringify({
    title: `Rumor en la oficina ${n}`,
    text: `Te enterás de que la empresa va a recortar personal el próximo mes (versión ${n}). Nadie sabe si es verdad.`,
    category: 'work',
    minAge: 20,
    maxAge: 62,
    weight: 3,
    choices: [
      {
        label: 'Ponerte a buscar otro trabajo',
        outcomes: [
          { weight: 5, text: 'Mandaste diez currículums. Te llamaron de uno.', effects: { happiness: 2, money: -100 } },
          { weight: 2, text: 'Perdiste el mes y el rumor era falso.', effects: { happiness: -3 } },
        ],
      },
      { label: 'Ignorarlo', outcomes: [{ weight: 1, text: 'Nada pasó. Como casi siempre.', effects: { happiness: 1 } }] },
    ],
  });
}
