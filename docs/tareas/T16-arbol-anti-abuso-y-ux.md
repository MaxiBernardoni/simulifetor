# T16 · Árbol genealógico: anti-abuso reforzado y mejor experiencia

- **Prioridad / esfuerzo:** media-alta · L
- **Depende de:** —
- **Autonomía:** ⚠️ hay una decisión de diseño (enfriamiento); la tarea trae un valor por defecto configurable para que Max lo ajuste a la mañana
- **Estado:** todo

## Objetivo
La regla "solo parientes de sangre a ≤ 2 generaciones" se mide desde el personaje **actual**, así que saltando de pariente en pariente se puede llegar más lejos que el límite (encadenamiento). Además el árbol crece con las generaciones y necesita mejor navegación, y el jugador no se entera de lo que pasa con los familiares que no controla.

## Contexto
- `src/engine/kinship.ts` (`canSwitchTo`, `commonAncestor`, `MAX_SWITCH_DISTANCE`), `src/store/gameStore.ts` (`switchCharacter`), `src/engine/world.ts` (`World`).
- `src/ui/screens/FamilyTreeScreen.tsx` (dibujo con `Unit`, `NodeView`, `NodeSheet`, `Branch`), `src/ui/screens/DeathScreen.tsx` (elección de heredero).
- `docs/10-motor-y-formulas.md` → "Mundo familiar"; `docs/09-decisiones-abiertas.md` → "Abuso por saltos encadenados".

## Requisitos
### A. Anti-abuso (motor + store)
1. Constantes en `engine/kinship.ts`: `SWITCH_COOLDOWN_YEARS = 5` (años de juego entre cambios voluntarios), `MAX_SWITCHES_PER_GENERATION = 3`. Configurables; dejar comentado cómo desactivarlos (`0`).
2. `World` guarda `lastSwitchYear?: number` y `switchesInGeneration: Record<number, number>` (opcionales; **migración**: `undefined` = sin historial).
3. `canSwitchTo(w, from, to, opts?)` agrega las razones "Tenés que esperar N años más para volver a cambiar de personaje." y "Ya cambiaste de personaje demasiadas veces en esta generación." **Cuando el personaje actual murió, no aplican** (la muerte siempre permite continuar).
4. **Distancia acumulada**: además de la regla de 2 generaciones desde el actual, calcular la distancia desde el **primer personaje de la ranura** (`World.anchorId`, nuevo) y bloquear si la suma "saltos × distancia" supera un tope (`MAX_DRIFT = 4`) para impedir alejarse indefinidamente. Definir claramente la métrica en un comentario y en `docs/10`; test con una cadena de 3 saltos.
5. La UI (ficha de persona y tarjeta de muerte) muestra el motivo del bloqueo con texto claro y, si es cooldown, los años que faltan.

### B. Novedades de la familia
6. Cuando pasa un año, el mundo genera **noticias** (`World.news: { year, text, nodeId? }[]`, máx. 60, las más viejas se descartan) para: nacimientos, muertes, casamientos, divorcios, y hechos relevantes de los bots (ascenso, prisión, quiebra, herencia grande). Textos cortos en voseo ("Tu prima Sofía se casó.").
7. Mostrarlas en una pestaña "Novedades" dentro de la pantalla del árbol (lista con ícono por tipo y antigüedad) y una insignia con la cantidad sin leer en el botón del Menú.

### C. UX del árbol
8. **Zoom y desplazamiento**: pellizcar para zoom (0,5×–1,5×) y botón "Centrar en mí" (scroll al nodo actual). Persistir el zoom en `meta`.
9. **Buscar** por nombre y **filtro** "Solo los que puedo jugar" que atenúa al resto.
10. **Colapsar** ramas (tocar el ícono en una pareja) para árboles grandes; por defecto colapsar las ramas de más de 4 generaciones de distancia al actual.
11. Rendimiento con 200+ nodos: no recalcular `buildForest` en cada render (memoizar por `world.seq` y `year`) y no dibujar ramas colapsadas.

## Criterios de aceptación
- [ ] `npm run check` verde; tests nuevos en `world.test.ts`/`kinship`: cooldown, límite por generación, deriva acumulada, muerte que anula el cooldown, migración de un `World` sin los campos nuevos.
- [ ] Un test recorre una cadena de saltos y demuestra que el encadenamiento ya no permite llegar a un primo segundo.
- [ ] UI verificada (375×812): ficha con el motivo; pestaña Novedades; zoom; "Centrar en mí"; búsqueda; colapsar; sin errores de consola.
- [ ] `docs/09` (decisión abierta cerrada con el valor elegido), `docs/10`, `docs/11` y `CHANGELOG.md` actualizados.

## Fuera de alcance
Cambiar la regla básica de 2 generaciones (se mantiene); NPCs fuera de la familia (T07).

## Riesgos
- El cooldown puede frustrar: hacerlo configurable y explicar en la UI. Max lo ajusta por la mañana.
- Gestos de pellizco en `react-native-web` distintos a los del celu: usar `PanResponder`/`ScrollView` con `zoomScale` en iOS y un control de +/− como alternativa universal.
