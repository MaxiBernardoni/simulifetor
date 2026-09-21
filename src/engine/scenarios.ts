import type { Life } from './types';
import type { CreateOpts } from './life';
import { createLife } from './life';
import { autoPlay, tidyAfterSimulation } from './autoplay';
import { addLog } from './effects';
import { getScenario } from '../content/scenarios';

/** Crea la vida de un escenario. Si arranca con edad, genera automáticamente el pasado. */
export function createScenarioLife(scenarioId: string, opts: CreateOpts = {}): Life | null {
  const sc = getScenario(scenarioId);
  if (!sc) return null;
  for (let attempt = 0; attempt < 12; attempt++) {
    const seed = (Date.now() + attempt * 104729) % 2147483647;
    const life = createLife(seed, { ...opts, wealthClass: sc.wealth ?? opts.wealthClass });
    if (sc.startAge > 0) {
      autoPlay(life, { seed, untilAge: sc.startAge, crimeChance: 0.02, activityChance: 0.5 });
      if (!life.alive || life.age !== sc.startAge || life.jailYears > 0) continue;
      // El pasado se simuló; el historial arranca limpio.
      life.log = [];
      life.flags = {};
      life.pending = [];
      tidyAfterSimulation(life);
    }
    sc.setup?.(life);
    life.scenario = { id: sc.id, status: 'active' };
    addLog(life, `Escenario: ${sc.title}. ${sc.goal}`, 'system', 'Objetivo', 'Target');
    return life;
  }
  return null;
}

/** Revisa si se ganó o perdió el escenario. Devuelve el nuevo estado si cambió. */
export function checkScenario(life: Life): 'won' | 'lost' | null {
  const sc = life.scenario;
  if (!sc || sc.status !== 'active') return null;
  const def = getScenario(sc.id);
  if (!def) return null;
  if (life.alive && def.won(life)) {
    sc.status = 'won';
    sc.wonAge = life.age;
    addLog(life, `¡Escenario superado! ${def.goal}`, 'good', def.title, 'Trophy');
    life.pending.push({
      kind: 'result',
      title: '¡Escenario superado!',
      text: `Cumpliste el objetivo de "${def.title}". Podés seguir jugando esta vida.`,
      deltas: [],
      icon: 'Trophy',
      scene: 'graduation',
    });
    return 'won';
  }
  const late = def.deadlineAge !== undefined && life.age > def.deadlineAge;
  if (!life.alive || late || def.lost?.(life)) {
    sc.status = 'lost';
    const why = !life.alive
      ? 'Moriste antes de cumplir el objetivo.'
      : late
        ? `Pasó el tiempo límite (${def.deadlineAge} años).`
        : 'Ya no se puede cumplir el objetivo.';
    addLog(life, `Escenario fallido. ${why}`, 'bad', def.title, 'Flag');
    life.pending.push({
      kind: 'result',
      title: 'Escenario fallido',
      text: `${why} Podés seguir jugando esta vida, pero el objetivo ya no cuenta.`,
      deltas: [],
      icon: 'Flag',
      scene: 'money_loss',
    });
    return 'lost';
  }
  return null;
}
