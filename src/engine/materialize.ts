import type { Life, Person, PersonKind } from './types';
import type { TreeNode, WorldData } from './world';
import { createLife } from './life';
import { autoPlay, tidyAfterSimulation } from './autoplay';
import { addLog } from './effects';
import { depthOf, relationLabel } from './kinship';
import { estateOf, legacyPoints } from './dynasty';
import { formatMoney } from './format';
import { realNetWorth } from './assets';
import { syncLifeToWorld } from './world';

const person = (n: TreeNode, kind: PersonKind, closeness: number, patch: Partial<Person> = {}): Person => ({
  id: n.id,
  nodeId: n.id,
  kind,
  name: `${n.name} ${n.surname}`,
  gender: n.gender,
  age: n.age,
  alive: n.alive,
  closeness,
  married: undefined,
  look: n.look,
  ...patch,
});

/**
 * Genera la vida completa de alguien del árbol que todavía no tenía una: simula su pasado con su familia real
 * y lo deja en el año actual, con su pareja e hijos tal como están en el árbol.
 */
export function materializeLife(wd: WorldData, nodeId: string): Life | null {
  const w = wd.world;
  const node = w.nodes[nodeId];
  if (!node || !node.alive) return null;
  const nodes = Object.values(w.nodes);

  for (let attempt = 0; attempt < 10; attempt++) {
    const seed = (Date.now() + attempt * 15485863) % 2147483647;
    // Durante la simulación solo están los padres y hermanos (congelados).
    const family: Person[] = [];
    const rnd = (a: number, b: number) => a + ((seed >> attempt) % (b - a + 1) + (b - a + 1)) % (b - a + 1);
    const father = node.fatherId ? w.nodes[node.fatherId] : undefined;
    const mother = node.motherId ? w.nodes[node.motherId] : undefined;
    if (father) family.push(person(father, 'father', rnd(50, 90), { alive: true, frozen: true }));
    if (mother) family.push(person(mother, 'mother', rnd(55, 92), { alive: true, frozen: true }));
    const siblings = nodes.filter((n) => n.id !== node.id && ((node.fatherId && n.fatherId === node.fatherId) || (node.motherId && n.motherId === node.motherId)));
    for (const s of siblings) family.push(person(s, 'sibling', rnd(35, 80), { alive: true, frozen: true }));

    const life = createLife(seed, {
      name: node.name, surname: node.surname, gender: node.gender, look: node.look, birthYear: node.birthYear,
      wealthClass: node.wealthClass, people: family, lineageId: w.familyId, generation: depthOf(w, node.id), silent: true,
    });
    life.nodeId = node.id;
    autoPlay(life, { seed, untilAge: node.age, crimeChance: 0.03, activityChance: 0.5, familyBias: false });
    if (!life.alive || life.age !== node.age) continue;

    // Quita lo que el bot inventó (pareja, hijos, hermanos) y pone lo real del árbol.
    life.people = life.people.filter((p) => p.nodeId || !['partner', 'child', 'ex', 'sibling'].includes(p.kind));
    for (const p of life.people) {
      if (!p.frozen) continue;
      p.frozen = false;
      const src = w.nodes[p.nodeId!];
      if (src) {
        p.age = src.age;
        p.alive = src.alive;
      }
    }
    if (node.partnerId && w.nodes[node.partnerId]) {
      const pn = w.nodes[node.partnerId];
      life.people.push(person(pn, 'partner', 70, { married: !!node.married }));
    }
    for (const c of nodes.filter((n) => n.fatherId === node.id || n.motherId === node.id)) {
      life.people.push(person(c, 'child', 75));
    }
    tidyAfterSimulation(life);
    life.pending = [];
    life.eventLast = {};
    life.log = [];
    if (node.married) life.flags.married_once = true;
    syncLifeToWorld(w, life);
    return life;
  }
  return null;
}

/** Herencia y aviso al pasar a vivir la vida de otra persona. */
export function applySwitch(target: Life, prev: Life | null, wd: WorldData): void {
  const w = wd.world;
  if (!prev) return;
  const prevNode = w.nodes[prev.nodeId ?? ''];
  const rel = prevNode ? relationLabel(w, prev.nodeId!, target.nodeId!) : '';
  const first = `${prev.name} ${prev.surname}`;
  if (!prev.alive) {
    // Herencia: solo cuando el personaje anterior murió.
    const isChild = w.nodes[target.nodeId!]?.fatherId === prev.nodeId || w.nodes[target.nodeId!]?.motherId === prev.nodeId;
    const kids = Object.values(w.nodes).filter((n) => n.alive && (n.fatherId === prev.nodeId || n.motherId === prev.nodeId)).length;
    const factor = isChild ? (kids <= 1 ? 0.85 : 0.6) : 0.15;
    const share = Math.round(estateOf(prev) * factor);
    if (share > 0) {
      target.money += share;
    }
    target.flags.heir = true;
    if (realNetWorth(prev) >= 500000) target.flags.famous_family = true;
    if (prev.flags.criminal_record || prev.flags.murderer) target.flags.infamous_family = true;
    addLog(target, `Continuás la historia de la familia ${prev.surname}. ${first} murió a los ${prev.age} años.`, 'system', `Generación ${target.generation}`, 'Crown');
    if (share > 0) addLog(target, `Heredaste ${formatMoney(share)}.`, 'good', 'Herencia', 'Coins');
  } else {
    addLog(target, `Ahora vivís la vida de ${target.name} (${rel.toLowerCase() || 'familiar'} de ${prev.name}).`, 'system', 'Nuevo personaje', 'Users');
  }
  void legacyPoints;
}
