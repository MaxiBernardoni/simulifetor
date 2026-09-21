# T02 · Robustez del motor: propiedades, fuzz, store y migraciones

- **Prioridad / esfuerzo:** alta · L
- **Depende de:** —
- **Autonomía:** ✅ segura (agrega tests y arregla bugs que aparezcan)
- **Estado:** review

## Objetivo
Hoy hay 39 tests, casi todos de humo y de casos puntuales. Antes de sumar más sistemas hay que blindar el motor con **invariantes** que se comprueben sobre miles de vidas, la capa de guardado (store) y las migraciones. Cada bug que aparezca se corrige en la misma tarea.

## Contexto
- `src/engine/engine.test.ts`, `src/engine/world.test.ts` (modelo de estilo).
- `src/engine/autoplay.ts` (bot), `src/engine/sim.ts` (`simulateLife`).
- `src/store/gameStore.ts` depende de `@react-native-async-storage/async-storage` (mockear en tests con un `Map` en memoria; vitest `vi.mock`).
- `docs/11-guardado-y-migraciones.md` describe claves y migraciones.

## Requisitos
1. **Invariantes de vida** (`src/engine/invariants.ts` exporta `checkLife(life): string[]` con la lista de violaciones; los tests lo llaman tras cada año en 1.000 vidas con semillas distintas y con distintos sesgos del bot: sin crimen, con crimen alto, con `familyBias`, escenarios y vidas de bots del árbol):
   - stats enteros dentro de 0–100; `money`, `loan`, `invested`, `pension` finitos (no `NaN`/`Infinity`) y `loan ≥ 0`, `invested ≥ 0`;
   - `age === year − birthYear`; si `!alive`, `cause` definida y `pending` sin decisiones nuevas;
   - `jailYears ≥ 0`; si `jailYears > 0` no hay `job` ni universidad en curso;
   - `job.level` dentro de los niveles de su carrera; `salary > 0`;
   - personas: ids únicos en la vida, edades ≥ 0, `closeness` 0–100, como mucho **una** pareja viva (`kind: 'partner'`), `married` solo en parejas;
   - `eventLast` con años ≤ `year`; flags booleanos; ningún placeholder `{…}` sin resolver en el `log`;
   - la vida se puede serializar con `JSON.stringify` y volver a leerse **idéntica** (sin `undefined` que cambien el resultado, sin ciclos).
2. **Invariantes del mundo** (`checkWorld(world, lives)`): referencias `fatherId/motherId/partnerId` existen; el padre es `M` y la madre `F` **o** hay una nota explícita de excepción; `partnerId` es recíproco (o ambos nulos); un nodo no es su propio ancestro (sin ciclos); edades de vivos = `year − birthYear`; un hijo nace al menos 15 años después de sus padres (permitir margen para nodos generados); los muertos tienen `deathYear`; el nodo actual existe y `currentId` coincide con `life.nodeId`; toda `Life` de `lives` tiene nodo vivo y `full`.
3. **Fuzz de cambios de personaje**: 200 mundos; en cada uno, 80 años donde cada 3–7 años se cambia a un pariente elegible al azar (`canSwitchTo` ok) y se comprueban ambos conjuntos de invariantes; incluir muertes y elección de heredero. Verificar que **nunca** se logra cambiar a alguien que `canSwitchTo` rechaza.
4. **Tests del store** (`src/store/gameStore.test.ts`, mockeando AsyncStorage): 
   - nueva vida → guardado en la ranura activa (vida + mundo + meta);
   - `ageUp` guarda; recargar (`load`) devuelve el mismo estado;
   - cambiar de ranura y volver conserva cada partida;
   - `exportData` → `wipe` → `importData` restaura todo; un texto inválido devuelve error y **no** modifica el estado;
   - migración desde `vidasim.save.v1` (vida vieja sin `assets`, `loan`, `nodeId`…) → aparece en la ranura 0 con mundo creado;
   - `switchCharacter` con decisiones pendientes o escenario activo devuelve el mensaje correcto y no cambia nada.
5. **Migraciones**: fixtures JSON de vidas de la versión 2 y 3 (crear a mano, mínimas) y test de que `migrateLife` + `reconcile` producen una vida válida según `checkLife`.
6. Corregir en el motor **todo bug que revelen los tests** (documentar cada uno en el reporte y en `CHANGELOG.md`). Si un bug requiere cambiar el comportamiento del juego de forma notoria, elegir la corrección más conservadora y anotarlo.
7. El bot debe poder correr 1.000 vidas en menos de 30 s en Node (si no, optimizar o bajar el tamaño de la muestra en CI y dejar un `FULL=1` para la muestra grande).

## Criterios de aceptación
- [ ] `npm run check` verde; ≥ 25 tests nuevos (o los equivalentes con `it.each`).
- [ ] `checkLife`/`checkWorld` usados en al menos: 1.000 vidas libres, 100 escenarios (los 9 × ~11 semillas), 200 mundos con cambios.
- [ ] Reporte con la lista de bugs encontrados y corregidos (aunque sea "ninguno").
- [ ] `docs/12-verificacion-y-testing.md` actualizado (lo que ahora está cubierto y lo que no).

## Fuera de alcance
Tests de componentes de UI; cambiar la economía o los eventos (eso es T01/T03).

## Riesgos
- Tiempo de ejecución de la suite: mantenerla < 40 s (usar muestras parametrizadas).
- Falsos positivos por invariantes demasiado estrictas (p. ej. edad de los padres al nacer en nodos generados): ajustar el invariante, no el dato, y documentar la excepción.
