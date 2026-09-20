import type { GameEvent } from '../../engine/types';
import { c, fx } from '../dsl';

export const FAMILY: GameEvent[] = [
  { id: 'family.sibling_help', title: 'Tu hermano/a te necesita', tags: ['family'], weight: 9,
    conditions: [c.has('sibling'), c.age(18, 80), c.moneyGte(2000)],
    text: '{sibling} está en problemas económicos y te pide ayuda.',
    choices: [
      { label: 'Ayudarlo/a con $2.000', outcomes: [
        { weight: 1, text: 'Le diste una mano. Se emocionó y prometió devolverte todo (no lo va a hacer).', effects: [fx.money(-2000), fx.close('sibling', 15), fx.hap(3)] },
      ] },
      { label: 'Decirle que no podés', outcomes: [
        { weight: 1, text: 'Le dijiste que no. Tu mamá se enteró y te miró con desilusión.', effects: [fx.close('sibling', -12), fx.close('mother', -5), fx.hap(-3)] },
      ] },
    ] },
  { id: 'family.child_trouble', title: 'Problemas con tu hijo/a', tags: ['family'], weight: 10,
    conditions: [c.has('child'), c.age(28, 70)],
    text: 'La escuela te llamó: {child} está en problemas.',
    choices: [
      { label: 'Castigarlo/a', outcomes: [
        { weight: 5, text: '{child} entendió que se pasó. Por ahora.', effects: [fx.close('child', -4)] },
        { weight: 5, text: '{child} te gritó que te odia y se encerró en su cuarto.', effects: [fx.close('child', -15), fx.hap(-3)] },
      ] },
      { label: 'Hablar con calma', outcomes: [
        { weight: 6, text: 'Charlaron largo rato y se entendieron.', effects: [fx.close('child', 10), fx.hap(3)] },
        { weight: 4, text: '{child} lo tomó como una debilidad y siguió igual.', effects: [fx.hap(-2)] },
      ] },
    ] },
  { id: 'family.reunion', title: 'Reunión familiar', tags: ['family'], weight: 12,
    conditions: [c.has('mother'), c.age(16, 99)],
    text: 'Se juntó toda la familia en un asado. Tu tío discutió de política. Tu tía criticó tu peso. Un clásico.',
    effects: [fx.hap(3), fx.close('mother', 3)] },
  { id: 'family.parent_ill', title: 'Tu madre está enferma', tags: ['family', 'health'], weight: 8,
    conditions: [c.has('mother'), c.age(30, 80)],
    text: '{mother} recibió un diagnóstico difícil. Pasás mucho tiempo en el hospital con ella.',
    effects: [fx.hap(-6), fx.money(-800), fx.close('mother', 10)] },
  { id: 'family.grandchild', title: 'Nieto/a', tags: ['family'], weight: 10, once: true,
    conditions: [c.has('child'), c.age(50, 90)],
    text: '{child} te dio la noticia: vas a ser abuelo/a. Lloraste sin entender por qué.',
    effects: [fx.hap(10)] },
  { id: 'family.kid_leaves', title: 'Se fue de casa', tags: ['family'], weight: 8,
    conditions: [c.has('child'), c.age(40, 80)],
    text: '{child} se mudó solo/a. Ahora la casa parece enorme y silenciosa.',
    effects: [fx.hap(-3), fx.close('child', 3)] },
  { id: 'family.parent_advice', title: 'Consejo de tu padre', tags: ['family'], weight: 8,
    conditions: [c.has('father'), c.age(14, 60)],
    text: '{father} te dio un consejo que sonó absurdo. Diez años después te diste cuenta de que tenía razón.',
    effects: [fx.close('father', 5), fx.sma(1), fx.hap(1)] },
];
