import type { Life } from './types';
import type { WorldData } from './world';
import { syncLifeToWorld, syncWorldToLife } from './world';
import { canSwitchTo, depthOf } from './kinship';
import { applySwitch, materializeLife } from './materialize';

/**
 * Cambia de personaje dentro del mundo familiar. Devuelve la vida nueva o un mensaje de error (sin cambiar nada).
 * El personaje anterior, si sigue vivo, continúa solo como bot.
 */
export function performSwitch(wd: WorldData, cur: Life, nodeId: string): { life: Life } | { error: string } {
  if (cur.alive && cur.pending.length > 0) return { error: 'Terminá lo que estás haciendo antes de cambiar de personaje.' };
  if (cur.alive && cur.scenario?.status === 'active') return { error: 'No podés cambiar de personaje mientras hay un escenario en curso.' };
  const check = canSwitchTo(wd.world, wd.world.currentId, nodeId);
  if (!check.ok) return { error: check.reason ?? 'No se puede cambiar a esa persona.' };
  const target = wd.lives[nodeId] ?? materializeLife(wd, nodeId);
  if (!target) return { error: 'No se pudo generar esa vida. Probá de nuevo.' };
  delete wd.lives[nodeId];
  if (cur.alive) {
    cur.log = cur.log.slice(-40);
    wd.lives[cur.nodeId!] = cur;
  }
  const w = wd.world;
  if (cur.alive) {
    // Cambio voluntario: cuenta para el enfriamiento y el tope de la generación.
    w.anchorId ??= w.currentId;
    w.lastSwitchYear = w.year;
    const gen = depthOf(w, w.currentId);
    w.switchesInGeneration = { ...(w.switchesInGeneration ?? {}), [gen]: (w.switchesInGeneration?.[gen] ?? 0) + 1 };
  } else {
    // Continuás tras una muerte: nueva línea de origen y enfriamiento desde hoy.
    w.anchorId = nodeId;
    w.lastSwitchYear = w.year;
  }
  applySwitch(target, cur, wd);
  wd.world.currentId = nodeId;
  syncLifeToWorld(wd.world, target);
  syncWorldToLife(wd.world, target);
  return { life: target };
}
