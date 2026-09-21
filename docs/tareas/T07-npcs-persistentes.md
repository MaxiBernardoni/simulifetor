# T07 · NPCs persistentes fuera de la familia

- **Prioridad / esfuerzo:** media (Fase 5) · XL — dividir en hitos
- **Depende de:** T16 (novedades/noticias del mundo)
- **Autonomía:** ⚠️ cambia el modelo del mundo y el guardado; requiere revisión humana antes de unir
- **Estado:** todo

## Objetivo
Hoy solo la **familia** persiste entre personajes. Amigos, ex parejas, rivales, jefes y socios existen únicamente dentro de la vida donde aparecieron. Hacer que estas personas vivan en el mundo: que **envejezcan, cambien y reaparezcan** en la vida de otros personajes de la misma partida ("tu ex es ahora jefa de tu hermana").

## Contexto
- `src/engine/world.ts` (`World`, `TreeNode`, `liteYear`, `syncLifeToWorld`, `syncWorldToLife`, `advanceWorld`), `src/engine/materialize.ts`, `src/engine/people.ts` (`makePerson`, `spawnPerson`), `src/engine/types.ts` (`Person`, `PersonKind`).
- `docs/06-mundo-persistente.md` (visión), `docs/10-motor-y-formulas.md` (mundo).

## Requisitos
### Hito 1 — Modelo
1. `World.npcs: Record<string, Acquaintance>`: `{ id, name, surname, gender, look, birthYear, deathYear?, alive, age, traits: string[], jobLabel?, wealthClass, ties: { nodeId: string; kind: 'friend'|'ex'|'rival'|'boss'|'partner-of'; closeness: number; since: number }[] }`. Campo **opcional** (migración `{}`); las `Person` de una vida que sean `friend`/`ex`/`rival` se **registran** como `Acquaintance` con un lazo al nodo actual (`syncLifeToWorld`) y guardan `Person.npcId`.
2. Los NPC **envejecen y mueren** en `advanceWorld` con una versión aún más liviana que `liteYear` (solo edad y mortalidad), y pueden **cambiar de pareja/ trabajo** de forma abstracta (etiqueta de ocupación). Máx. 400 NPC por mundo; descartar los más lejanos y sin lazos vivos.
### Hito 2 — Reaparición
3. **Herencia de amistades**: al cambiar de personaje o materializar a un pariente, se le generan lazos con NPC que ya conocían sus familiares (hermanos comparten amigos; los hijos heredan "amigos de la familia"). `materializeLife` los incluye como `Person`s en vez de inventar todos.
4. **Reaparición**: un `friend`/`ex`/`rival` puede reaparecer como `boss` o `partner` de otro personaje del árbol (probabilidad baja por año) con su **historia** (texto "Ya se conocían: fueron pareja cuando ambos tenían 22"). Eventos nuevos con `target` sobre NPC compartidos (≥ 25), p. ej. "tu ex es ahora tu vecina", "el amigo de tu hermano te pide un favor".
4b. **Rivalidades**: `PersonKind` nuevo `rival` con eventos propios (competencia laboral, chismes, sabotaje) y consecuencias persistentes (cercanía negativa que viaja al siguiente personaje que lo conozca).
### Hito 3 — UI y persistencia
5. En **Relaciones**, sección "Conocidos de la familia" (NPC con lazo a parientes, no propios del personaje actual). En el árbol, ícono de "conocido en común" en el `NodeSheet` (los amigos comunes).
6. Guardado: `WorldData.world.npcs` dentro de `vidasim.world.N` (ya persiste el mundo); comprobar tamaño (< 400 KB por mundo con 400 NPC) y podar.
7. Exportar/importar incluye los NPC (viajan con `worlds`).

## Criterios de aceptación
- [ ] `npm run check` verde. Tests: registro idempotente, envejecimiento y muerte, poda por límite, herencia de amistades en `materializeLife`, reaparición determinista con semilla, migración de un `World` sin `npcs`, invariantes T02 extendidos (`checkWorld` valida lazos).
- [ ] Rendimiento: `advanceWorld` con 400 NPC + 50 nodos < 3 ms/año en Node.
- [ ] Sin regresiones de las vidas existentes (misma semilla sin NPC = misma vida hasta que aparece uno).
- [ ] UI verificada; `docs/06`, `docs/10`, `docs/11`, `CHANGELOG.md`.

## Fuera de alcance
NPC como nodos jugables (la regla de 2 generaciones es solo de sangre); IA en NPC.

## Riesgos
- Crecimiento del guardado y del tiempo por año: poda agresiva y medir.
- Continuidad narrativa incoherente (un NPC muerto que reaparece): el invariante de T02 debe impedirlo.
