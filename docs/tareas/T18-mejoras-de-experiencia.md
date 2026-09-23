# T18 · Mejoras de experiencia (lote chico)

- **Prioridad / esfuerzo:** media / M en total (cada punto es S–M)
- **Depende de:** —
- **Autonomía:** ✅ segura
- **Estado:** parcial (puntos 1 y 7 hechos; ver Progreso)

Ideas aprobadas por Max el 21/09/2026 (vibración, ficha de persona, pantalla de muerte, IA, vida del día sin apuro, instalación como app y origen de los cambios). Se pueden hacer por separado.

1. ✅ **Vibración (haptics)** con `expo-haptics`: al envejecer, resultados buenos/malos, logros. Apagable. En web no hace nada.
2. **Ficha de persona desde el historial:** tocar el nombre de alguien en un texto abre su ficha (relación, edad, cercanía, acciones). Requiere que el log guarde el `personId`.
3. **Pantalla de muerte mejor:** epitafio, línea de tiempo con los momentos clave, gráfico de felicidad a lo largo de la vida y botón de compartir (texto).
4. **IA:** indicador de "pensando…" en la continuación y reintento con un toque si falla; exigir en el prompt que aclare la relación cuando nombra a alguien.
5. **Vida del día** (sin apuro): semilla derivada de la fecha para jugar la misma vida y comparar puntaje.
6. **Instalación como app** (ver T13): service worker para abrir sin conexión y ícono propio. En iPhone funciona con "Agregar a inicio", pero los datos de la app instalada están separados de los de Safari (hay que exportar/importar la partida una vez).
7. ✅ **Origen de los cambios** (hecho el 23/09/2026): tocar un chip de `life.lastDelta` en `LifeScreen` despliega qué lo causó ("Primer día de clases: −1, Otros cambios: −2"). Ver `docs/10-motor-y-formulas.md` § "Origen de los cambios del año".

## Criterios de aceptación
- [ ] `npm run check` en verde y tests por punto que toque el motor; UI verificada a 375×812; docs y `CHANGELOG.md`.

## Progreso
- **Punto 1 (vibración):** `expo-haptics` instalado (`npx expo install`). `ui/haptics.ts` (`hapticTap`, `hapticGood`, `hapticBad`) siempre chequea `useGame.getState().hapticsEnabled` y se traga cualquier error del módulo nativo (sin vibrador, navegador en segundo plano…), nunca rompe la UI. Se dispara al tocar "Envejecer" (`LifeScreen`), al mostrar un resultado bueno o malo (`PromptModal`, según el signo de sus stats) y al desbloquear un logro (`Toast.tsx`). Interruptor en Menú → Preferencias (`hapticsEnabled`, guardado en el mismo `Meta` que `seenTutorial`; por defecto encendido, partidas viejas sin el campo también). 5 tests nuevos.
- **Punto 7 (origen de los cambios):** `LogEntry.deltas?` (opcional, sin subir `SCHEMA_VERSION`) guarda los efectos de cada entrada del historial que ya pasa por `ctx.deltas` (evento sin decisiones, resultado de una decisión, actividad o acción con una persona). `Life.lastDeltaSources?: DeltaSource[]` (`engine/types.ts`) se arma en `ageUp()` con `deltaSources()` (nueva, exportada de `engine/ageUp.ts`): recorre el historial desde el principio del año y le resta a cada stat/plata lo que ya se atribuyó; el resto (impuestos, mantenimiento, desgaste natural…) queda en "Otros cambios", así el desglose siempre suma exactamente el total. `DeltaChips` (`ui/components.tsx`) recibe un `sources?` opcional: con él, cada chip es tocable y despliega la lista debajo (un solo chip abierto a la vez, se cierra al cambiar de año); sin `sources` (el resultado de una sola decisión en `PromptModal`) sigue igual que antes. 10 tests nuevos en `engine/deltaSources.test.ts` (279 en total), incluida una prueba de propiedad sobre 60 años simulados al azar que el desglose nunca se desvía del total mostrado. Verificado tocando los chips en el navegador a 390×844.
- **Pendientes:** puntos 2 a 6 (ficha de persona, pantalla de muerte, indicador/reintento de la IA, vida del día, instalación como app).
