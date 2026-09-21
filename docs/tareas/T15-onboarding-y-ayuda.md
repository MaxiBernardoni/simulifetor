# T15 · Tutorial inicial y pantalla "Cómo se juega"

- **Prioridad / esfuerzo:** media · M
- **Depende de:** —
- **Autonomía:** ✅ segura
- **Estado:** review (tutorial reemplazado por la primera vida guiada con globos; tutorial, ayuda, glosario y consejos hechos; los estados vacíos de Activos/Trabajo ya existían y se agregó el del árbol)

## Objetivo
El juego ya tiene muchos sistemas (actividades, relaciones, justicia, finanzas, escenarios, árbol con cambio de personaje) y nada los explica. Agregar una introducción corta la primera vez y una pantalla de ayuda siempre disponible.

## Contexto
- `src/store/gameStore.ts` (`Meta`, `load`, `saveMeta`), `src/ui/screens/StartScreen.tsx`, `MoreScreen.tsx`, `App.tsx` (rutas por `creating`/`tab`).
- Componentes de UI existentes: `Card`, `IconTile`, `SectionTitle`, `Scene` (`ui/art/Scene.tsx`) y `FadeIn`/`Pop` (`ui/anim.tsx`).
- `docs/07-ui-ux.md` (estilo).

## Requisitos
1. **Tutorial de primer uso**: 5 tarjetas deslizables (sin librerías extra, `ScrollView` horizontal paginado o botones Siguiente/Saltar) con una escena ilustrada de fondo cada una: (1) Envejecer y decidir, (2) Stats y qué los mueve, (3) Actividades y relaciones (una vez por año), (4) Dinero, trabajo y ley (juicios, cárcel), (5) La familia: árbol, muerte y continuar con un pariente (regla de 2 generaciones). Se muestra **una sola vez** tras "Empezar una vida" (flag `seenTutorial` en `meta`, opcional, sin subir esquema; default `false`).
2. **Pantalla "Cómo se juega"** (Menú → "Cómo se juega"): secciones plegables con texto corto y ejemplos: stats, envejecer, actividades, personas, trabajo y estudio, dinero (bienes, préstamos, inversiones), crimen y justicia, escenarios, ranuras y copia de seguridad, árbol genealógico y cambio de personaje, logros. Debe incluir la **tabla de bandas** de qué hace cada stat y qué pasa con la salud/felicidad extremas.
3. **Glosario** dentro de esa pantalla: patrimonio neto, legado, antecedentes, libertad condicional, prófugo, quiebra, familia política, pariente de sangre.
4. **Estados vacíos** con ayuda contextual: Relaciones sin nadie, Activos sin bienes, Trabajo sin oferta, Árbol sin parientes elegibles — una línea que explique qué hacer.
5. **Consejos de carga**: en la pantalla de muerte, un consejo aleatorio sobre algo que el jugador aún no probó (según su historial y logros): "Probá comprar una casa financiada", "Mirá el árbol: tu primo es elegible".
6. Todos los textos en voseo, humor seco, cortos. Nada de párrafos largos.

## Criterios de aceptación
- [ ] `npm run check` verde; test de `meta` sin `seenTutorial` (partida existente) → no se rompe y el tutorial no molesta a quien ya juega (`seenTutorial` se asume `true` si hay partidas guardadas).
- [ ] UI verificada (375×812): tutorial de 5 pasos (Siguiente/Saltar/Atrás), pantalla de ayuda con secciones que se abren, estados vacíos, sin errores de consola.
- [ ] `docs/07-ui-ux.md` y `CHANGELOG.md` actualizados.

## Fuera de alcance
Tutorial interactivo con mecánicas guiadas; traducciones.

## Riesgos
- Que el tutorial tape la primera partida: siempre con "Saltar" visible y un solo disparo.
