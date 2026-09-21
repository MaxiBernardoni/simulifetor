import type { GameEvent } from '../../engine/types';
import { c, fx } from '../dsl';

export const COURT: GameEvent[] = [
  { id: 'court.trial', title: 'Juicio', tags: ['court'], weight: 0,
    conditions: [c.trial()],
    text: 'Te llevan a juicio por {crime}. El fiscal parece un tiburón con corbata. ¿Cómo te defendés?',
    choices: [
      { label: 'Abogado de oficio (gratis)', outcomes: [
        { weight: 2, text: 'Tu abogado de oficio, con 40 causas encima, logró que te absuelvan.', effects: [fx.sentence('none'), fx.hap(10)] },
        { weight: 4, text: 'Tu abogado consiguió una pena reducida.', effects: [fx.sentence('half'), fx.hap(-4)] },
        { weight: 4, text: 'Tu abogado ni se acordaba de tu nombre. Te dieron la pena máxima.', effects: [fx.sentence('full'), fx.hap(-8)] },
      ] },
      { label: 'Abogado privado ($8.000)', conditions: [c.moneyGte(8000)], outcomes: [
        { weight: 4, text: 'Tu abogado carísimo desarmó la acusación. Sos libre.', effects: [fx.money(-8000), fx.sentence('none'), fx.hap(10)] },
        { weight: 4, text: 'Tu abogado negoció una pena reducida.', effects: [fx.money(-8000), fx.sentence('half'), fx.hap(-3)] },
        { weight: 2, text: 'Las pruebas eran demasiado fuertes, ni el mejor abogado pudo salvarte.', effects: [fx.money(-8000), fx.sentence('full'), fx.hap(-8)] },
      ] },
      { label: 'Sobornar al juez ($10.000)', conditions: [c.moneyGte(10000), c.age(18, 99)], outcomes: [
        { weight: 4, text: 'El juez agarró el sobre y de golpe encontró "falta de pruebas".', effects: [fx.money(-10000), fx.sentence('none'), fx.hap(4)] },
        { weight: 6, text: 'El juez te denunció por el soborno. Terminaste peor.', effects: [fx.money(-10000), fx.sentence('double'), fx.hap(-12)] },
      ] },
      { label: 'Declararte culpable', outcomes: [
        { weight: 7, text: 'Te declaraste culpable a cambio de una pena más corta.', effects: [fx.sentence('half'), fx.hap(-4)] },
        { weight: 3, text: 'El juez valoró tu arrepentimiento: libertad condicional.', effects: [fx.sentence('probation'), fx.hap(-2)] },
      ] },
    ] },

  { id: 'court.parole_hearing', title: 'Audiencia de libertad condicional', tags: ['jail'], weight: 10,
    text: 'La junta evalúa tu caso para reducirte la condena.',
    choices: [
      { label: 'Mostrar arrepentimiento', outcomes: [
        { weight: 5, text: 'La junta te creyó y te redujo la condena.', effects: [fx.parole(2), fx.hap(8)] },
        { weight: 5, text: 'No los convenciste. Todo sigue igual.', effects: [fx.hap(-3)] },
      ] },
      { label: 'Reclamar tu inocencia', outcomes: [
        { weight: 2, text: 'Tu reclamo prosperó y te redujeron la condena.', effects: [fx.parole(1), fx.hap(5)] },
        { weight: 8, text: 'Nadie te creyó. Te quedaste con mala fama.', effects: [fx.hap(-6)] },
      ] },
    ] },

  { id: 'court.reentry', title: 'Volver a la vida', tags: ['justice'], weight: 40, once: true,
    conditions: [c.flag('ex_convict'), c.free()],
    text: 'Saliste de la cárcel y el mundo no te espera con los brazos abiertos. Nadie quiere contratar a un ex preso.',
    choices: [
      { label: 'Programa de reinserción (gratis)', outcomes: [
        { weight: 6, text: 'El programa te ayudó a reencaminarte y hacer nuevos contactos.', effects: [fx.hap(6), fx.add('friend')] },
        { weight: 4, text: 'El programa fue una burocracia inútil.', effects: [fx.hap(-2)] },
      ] },
      { label: 'Pagar para limpiar antecedentes ($5.000)', conditions: [c.moneyGte(5000)], outcomes: [
        { weight: 4, text: 'Lograste que borren tus antecedentes. Empezás de nuevo.', effects: [fx.money(-5000), fx.unflag('criminal_record'), fx.hap(10)] },
        { weight: 6, text: 'El trámite fracasó y perdiste la plata.', effects: [fx.money(-5000), fx.hap(-4)] },
      ] },
      { label: 'Volver a lo de siempre', outcomes: [
        { weight: 1, text: 'Volviste a tus viejos contactos. Las calles no perdonan ni olvidan.', effects: [fx.hap(-2)] },
      ] },
    ] },

  { id: 'court.fugitive', title: 'Prófugo/a', tags: ['justice'], weight: 60,
    conditions: [c.flag('fugitive'), c.free()],
    text: 'Vivís mirando por encima del hombro. Cada sirena te hace sudar frío.',
    choices: [
      { label: 'Seguir escondido/a', outcomes: [
        { weight: 6, text: 'Otro año en las sombras, sin que te encuentren.', effects: [fx.hap(-5)] },
        { weight: 4, text: 'La policía te encontró.', effects: [fx.unflag('fugitive'), fx.hap(-10), fx.arrest('fuga y evasión', 3, 8)] },
      ] },
      { label: 'Entregarte', outcomes: [
        { weight: 1, text: 'Te entregaste. Estás cansado de correr.', effects: [fx.unflag('fugitive'), fx.hap(2), fx.arrest('evasión', 1, 3)] },
      ] },
    ] },

  { id: 'court.blackmail', title: 'Un secreto ajeno', tags: ['crime'], weight: 5,
    conditions: [c.age(20, 70), c.has('friend')],
    text: 'Descubrís algo que {friend} quiere esconder desesperadamente. Podrías sacarle provecho.',
    choices: [
      { label: 'Chantajearlo/a', outcomes: [
        { weight: 5, text: 'Pagó todo lo que le pediste. Te ganaste un enemigo de por vida.', effects: [fx.money(6000), fx.close('friend', -50), fx.hap(-2)] },
        { weight: 5, text: 'Te denunció. Terminaste imputado por extorsión.', effects: [fx.hap(-10), fx.arrest('extorsión', 1, 5), fx.remove('friend')] },
      ] },
      { label: 'Guardarte el secreto', outcomes: [{ weight: 1, text: 'Nunca se lo dijiste a nadie. Eso también es lealtad.', effects: [fx.close('friend', 6), fx.hap(2)] }] },
    ] },

  { id: 'court.police_bribe', title: 'Una oferta que no se rechaza', tags: ['crime'], weight: 10,
    conditions: [c.sector('seguridad'), c.job()],
    text: 'Un comerciante te ofrece un sobre para que "mires para otro lado" durante una inspección.',
    choices: [
      { label: 'Aceptar el sobre', outcomes: [
        { weight: 6, text: 'Aceptaste el sobre. Nadie se enteró.', effects: [fx.money(4000), fx.hap(1), fx.flag('corrupt')] },
        { weight: 4, text: 'Asuntos Internos te agarró con las manos en la masa.', effects: [fx.fired(), fx.arrest('cohecho', 1, 4), fx.hap(-10)] },
      ] },
      { label: 'Rechazarlo', outcomes: [{ weight: 1, text: 'Lo rechazaste. Tu jefe lo anotó a tu favor.', effects: [fx.perf(8), fx.hap(2)] }] },
    ] },

  { id: 'court.witness_threat', title: 'Amenaza', tags: ['crime'], weight: 8,
    conditions: [c.flag('gang'), c.age(15, 45)],
    text: 'Un rival de la banda te dejó un mensaje claro: "Sabemos dónde vivís".',
    choices: [
      { label: 'Enfrentarlo', outcomes: [
        { weight: 4, text: 'Le plantaste cara y se echó atrás.', effects: [fx.hap(3)] },
        { weight: 6, text: 'Te esperaron en un callejón y te dejaron muy mal.', effects: [fx.hea(-15), fx.hap(-8)] },
      ] },
      { label: 'Irte del barrio', outcomes: [{ weight: 1, text: 'Te mudaste lejos. Perdiste amigos pero conservaste el cuero.', effects: [fx.unflag('gang'), fx.hap(-3)] }] },
    ] },
];
