import type { GameEvent } from '../../engine/types';
import { c, fx } from '../dsl';

export const WORK: GameEvent[] = [
  { id: 'work.boss_praise', title: 'Elogio del jefe', tags: ['work'], weight: 14,
    conditions: [c.job(), c.perf(55)],
    text: '{boss} te felicitó frente a todo el equipo. Se te pasó el estrés por cinco minutos.',
    effects: [fx.perf(8), fx.hap(4)] },
  { id: 'work.boss_yells', title: 'Bronca', tags: ['work'], weight: 14,
    conditions: [c.job()],
    text: '{boss} te gritó por un error que ni siquiera fue tuyo. Nadie te defendió.',
    effects: [fx.perf(-6), fx.hap(-4)] },
  { id: 'work.layoffs', title: 'Recorte de personal', tags: ['work'], weight: 8,
    conditions: [c.job(), c.age(20, 64)],
    text: 'La empresa anuncia reducción de personal. Todos miran a todos.',
    choices: [
      { label: 'Ofrecerte voluntario/a con indemnización', outcomes: [
        { weight: 1, text: 'Te fuiste con una indemnización decente. Y sin trabajo.', effects: [fx.money(6000), fx.fired(), fx.hap(-3)] },
      ] },
      { label: 'Pelear tu puesto', outcomes: [
        { weight: 6, text: 'Demostraste que sos indispensable. Te quedás.', effects: [fx.perf(6), fx.hap(2)] },
        { weight: 4, text: 'Te echaron igual, sin indemnización. Feliz día.', effects: [fx.fired(), fx.hap(-10)] },
      ] },
    ] },
  { id: 'work.affair_offer', title: 'Insinuación en la oficina', tags: ['work', 'love'], weight: 8,
    conditions: [c.job(), c.age(21, 60)],
    text: 'Un/a compañero/a de trabajo te tira los perros de forma nada sutil, después de la reunión.',
    choices: [
      { label: 'Aceptar', outcomes: [
        { weight: 5, text: 'Tuvieron un romance secreto. Adrenalina pura.', effects: [fx.hap(6), fx.perf(-3)] },
        { weight: 3, text: 'Los descubrieron. RRHH los citó a los dos. Papelón.', effects: [fx.hap(-6), fx.perf(-12), fx.close('partner', -25)] },
      ] },
      { label: 'Rechazar con cortesía', outcomes: [
        { weight: 1, text: 'Lo/a rechazaste. El clima laboral se puso raro por semanas.', effects: [fx.hap(-1)] },
      ] },
    ] },
  { id: 'work.stolen_idea', title: 'Idea robada', tags: ['work'], weight: 8,
    conditions: [c.job(), c.stat('smarts', '>=', 45)],
    text: 'Tu compañero/a presentó tu proyecto como si fuera suyo. {boss} está fascinado.',
    choices: [
      { label: 'Denunciarlo en voz alta', outcomes: [
        { weight: 5, text: 'Le dejaste en claro a todos quién hizo qué. Te sacaste el mérito.', effects: [fx.perf(10), fx.hap(3)] },
        { weight: 5, text: 'Nadie te creyó. Ahora sos el/la quejoso/a.', effects: [fx.perf(-8), fx.hap(-5)] },
      ] },
      { label: 'Tragártelo', outcomes: [{ weight: 1, text: 'Te lo tragaste. Se te grabó el rencor en el alma.', effects: [fx.hap(-4)] }] },
    ] },
  { id: 'work.office_party', title: 'Fiesta de la empresa', tags: ['work'], weight: 10,
    conditions: [c.job(), c.age(18, 62)],
    text: 'La empresa organizó una fiesta de fin de año. Hay barra libre.',
    choices: [
      { label: 'Tomar y bailar', outcomes: [
        { weight: 4, text: 'Fuiste la vida de la fiesta. Al otro día todos te saludaron con simpatía.', effects: [fx.hap(5), fx.perf(3)] },
        { weight: 4, text: 'Le dijiste a {boss} lo que realmente pensás de él/ella. Hay video.', effects: [fx.hap(2), fx.perf(-15)] },
        { weight: 2, text: 'Te despertaste con alguien del área de sistemas. No sabés cómo.', effects: [fx.hap(3), fx.perf(-2)] },
      ] },
      { label: 'Ir un rato y volver a casa', outcomes: [{ weight: 1, text: 'Te fuiste temprano. Nadie lo notó.', effects: [fx.hap(1)] }] },
    ] },
  { id: 'work.headhunter', title: 'Propuesta de otra empresa', tags: ['work'], weight: 9,
    conditions: [c.job(), c.perf(60)],
    text: 'Una empresa competidora te ofrece un salario más alto.',
    choices: [
      { label: 'Usarlo para negociar', outcomes: [
        { weight: 6, text: '{boss} igualó la oferta para que te quedes.', effects: [fx.raise(1.15), fx.hap(4)] },
        { weight: 4, text: '{boss} se enojó y te dejó de hablar por meses.', effects: [fx.perf(-8), fx.hap(-3)] },
      ] },
      { label: 'Aceptar y cambiar', outcomes: [
        { weight: 1, text: 'Cambiaste de empresa con un mejor sueldo. Nuevos compañeros, mismos problemas.', effects: [fx.raise(1.2), fx.hap(3), fx.perf(-15)] },
      ] },
      { label: 'Ignorarla', outcomes: [{ weight: 1, text: 'Ignoraste la oferta. Lealtad, dicen.', effects: [] }] },
    ] },
  { id: 'work.burnout', title: 'Burnout', tags: ['work', 'health'], weight: 10,
    conditions: [c.job(), c.age(25, 62), c.stat('happiness', '<=', 55)],
    text: 'Te despertás sin ganas de nada. El trabajo te chupó el alma.',
    effects: [fx.hap(-8), fx.hea(-5), fx.perf(-10)] },
  { id: 'work.harassment', title: 'Acoso laboral', tags: ['work'], weight: 6,
    conditions: [c.job(), c.age(18, 60)],
    text: 'Un superior te hace comentarios que te incomodan. Y no es la primera vez.',
    choices: [
      { label: 'Denunciarlo', outcomes: [
        { weight: 5, text: 'La empresa lo despidió y te pidió disculpas. Te sentís aliviado/a.', effects: [fx.hap(5), fx.perf(3)] },
        { weight: 5, text: 'La denuncia se "perdió" y de pronto tu rendimiento empezó a ser mal evaluado.', effects: [fx.hap(-8), fx.perf(-15)] },
      ] },
      { label: 'Aguantar', outcomes: [{ weight: 1, text: 'Seguiste como si nada, pero cada vez te cuesta más levantarte a la mañana.', effects: [fx.hap(-7)] }] },
    ] },
  { id: 'work.embezzle', title: 'La caja abierta', tags: ['work', 'crime'], weight: 5,
    conditions: [c.job(), c.age(20, 60)],
    text: 'Descubrís que podés desviar plata de la empresa sin que nadie lo note. Al menos por un tiempo.',
    choices: [
      { label: 'Aprovecharlo', outcomes: [
        { weight: 6, text: 'Te llevaste unos buenos pesos. Nadie sospecha.', effects: [fx.money(10000), fx.hap(2), fx.flag('embezzler')] },
        { weight: 4, text: 'Una auditoría te descubrió. Te procesan por fraude.', effects: [fx.hap(-12), fx.fired(), fx.jail(1, 4)] },
      ] },
      { label: 'Ignorarlo', outcomes: [{ weight: 1, text: 'Pasaste de largo. La honestidad no paga, pero tampoco te da dolor de cabeza.', effects: [fx.hap(1)] }] },
    ] },
  { id: 'work.unemployed', title: 'Desempleo', tags: ['work'], weight: 14,
    conditions: [c.noJob(), c.age(20, 63), c.moneyLte(3000), c.noFlag('retired')],
    text: 'Pasás el año mandando currículums al vacío. Nadie responde.',
    effects: [fx.hap(-5), fx.perf(0)] },
  { id: 'work.promotion_chance', title: 'Vacante interna', tags: ['work'], weight: 8,
    conditions: [c.job(), c.perf(65)],
    text: 'Se abrió un puesto mejor en tu área.',
    choices: [
      { label: 'Postularte', outcomes: [
        { weight: 5, text: 'Te lo dieron. Te subieron el sueldo.', effects: [fx.raise(1.2), fx.hap(6)] },
        { weight: 5, text: 'Se lo dieron al sobrino del gerente.', effects: [fx.hap(-4)] },
      ] },
      { label: 'Dejarlo pasar', outcomes: [{ weight: 1, text: 'Decidiste no meterte en líos. Seguís en lo mismo.', effects: [] }] },
    ] },
  { id: 'work.great_coworker', title: 'Buen compañero/a', tags: ['work'], weight: 9,
    conditions: [c.job(), c.age(18, 60)],
    text: 'Empezaste a llevarte muy bien con alguien del trabajo. Ya no es solo un compañero.',
    effects: [fx.add('friend'), fx.hap(3)] },
  { id: 'work.remote', title: 'Home office', tags: ['work', 'tech'], weight: 8,
    conditions: [c.job(), c.year(2015, 2200), c.age(22, 60)],
    text: 'Tu empresa te dejó trabajar desde casa. Ahorrás en viáticos y perdés la noción del tiempo.',
    effects: [fx.hap(3), fx.money(400)] },
];
