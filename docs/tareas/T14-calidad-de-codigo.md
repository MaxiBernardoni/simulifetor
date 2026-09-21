# T14 · Calidad de código: lint, formato, scripts y archivos más chicos

- **Prioridad / esfuerzo:** alta (base para el resto) · M
- **Depende de:** —
- **Autonomía:** ✅ segura (sin cambios de comportamiento)
- **Estado:** review (hechos: ESLint, Prettier, scripts, código muerto, `check:all`; **pendiente**: dividir `Scene.tsx`, `world.ts`, `components.tsx` en archivos < 300 líneas, JSDoc en `engine/*`, `npm audit`)

## Objetivo
Dejar el proyecto listo para que muchas tareas seguidas (y varias corridas nocturnas) no lo ensucien: linter y formateador configurados, scripts reproducibles en vez de comandos sueltos, y los archivos más grandes divididos para que sean fáciles de leer y de tocar sin conflictos.

## Contexto
- `package.json` ya tiene `check` (`tsc --noEmit && vitest run`), `test` y `typecheck`.
- Archivos grandes: `src/ui/art/Scene.tsx` (~500 líneas: definiciones + componente + partículas), `src/engine/world.ts`, `src/ui/components.tsx` (mezcla componentes base, stats, badges, avatares, patrón), `src/content/activities.ts`, `src/store/gameStore.ts`.
- El mapa de íconos `src/ui/Icon.tsx` se genera con un script que hoy no está en el repo (ver "Requisitos 3").
- Estilo actual: comillas simples, punto y coma, líneas largas en contenido (datos), 2 espacios.

## Requisitos
1. **ESLint** con la config de Expo (`npx expo install eslint eslint-config-expo` y flat config). Reglas: `no-unused-vars` (permitir `_x`), `react-hooks/exhaustive-deps` como *warning*, sin `console.log` (permitir `warn`/`error`). Script `npm run lint`. Empezar en modo tolerante: **0 errores**, warnings permitidos; listar cuántos hay en el reporte.
2. **Prettier** con `printWidth: 140`, comillas simples, `semi: true`, `trailingComma: 'all'`; `.prettierignore` para `src/content/**` (los datos están alineados a mano) y `node_modules`. Scripts `npm run format` y `npm run format:check`. Formatear **solo** `src/engine`, `src/store`, `src/ui`, `App.tsx` sin cambiar comportamiento (commit aparte, solo formato).
3. **Scripts reproducibles** en `scripts/`: 
   - `gen-icons.mjs`: recorre `src/**` buscando `icon: '…'`, `icon="…"`, `name="…"`, y los nombres extra de `content/icons.ts`, verifica que cada uno exista en `node_modules/lucide-react-native/dist/esm/icons/<kebab>.mjs` (ojo: `Gamepad2` → `gamepad-2`) y regenera `src/ui/Icon.tsx` con imports explícitos y el mapa. Debe fallar con mensaje claro si falta algún ícono. Script npm `icons`.
   - `dev-web.mjs`: levanta `expo start --web` en un puerto libre (probar desde 8081 hacia arriba) con `CI=1`, imprime la URL y guarda el PID en `.expo/dev-web.pid`; `stop-web.mjs` lo detiene **solo a ese PID**.
4. **Dividir archivos grandes sin cambiar comportamiento**:
   - `Scene.tsx` → `ui/art/scenes.ts` (tabla `SCENES`), `ui/art/particles.tsx`, `ui/art/Scene.tsx` (componente); mantener las exportaciones actuales (`Scene`, `SCENES`, `SCENE_KEYS`, `SCENE_W/H`).
   - `world.ts` → `engine/world/` con `types.ts`, `create.ts`, `lite.ts`, `sync.ts`, `advance.ts` e `index.ts` que re-exporte lo que hoy exporta `world.ts` (los imports existentes siguen funcionando).
   - `components.tsx` → `ui/components/` (`Card`, `Button`, `Bars`, `Header`, `Badges`, `PersonAvatar`, `IconPattern`, `ScenarioBar`…) con `index.ts` que re-exporte todo.
   - Ningún archivo nuevo > 300 líneas.
5. **Código muerto**: eliminar lo no usado (`engine/sim.ts` solo si nadie lo importa además de los tests; el gancho `_rng`, imports sobrantes); dejar un listado en el reporte de lo que se borró.
6. **JSDoc** de una línea en las funciones públicas de `engine/*` que no la tengan.
7. Agregar `npm run check:all` = `lint && format:check && typecheck && test`; **`check` sigue igual** (no agregar lint a `check` hasta que dé 0 warnings).
8. `npm audit --omit=dev`: solo **informar** los resultados en el reporte (no ejecutar `audit fix`).

## Criterios de aceptación
- [ ] `npm run check` y `npm run check:all` verdes; `npm run lint` con 0 errores.
- [ ] `npm run icons` regenera `Icon.tsx` **idéntico** (o con diferencias explicadas) y falla si se referencia un ícono inexistente (agregar un test que lo verifique con una función pura exportada por el script).
- [ ] Los 39 tests existentes siguen pasando sin modificarse (salvo rutas de import).
- [ ] La app se abre en el navegador (375×812), se juega un año y se abre el árbol sin errores de consola: comprobar que la división de archivos no rompió imports.
- [ ] `docs/12-verificacion-y-testing.md` y `CLAUDE.md` actualizados con los scripts nuevos.

## Fuera de alcance
Cambiar lógica del juego, renombrar conceptos, reformatear `src/content/**`.

## Riesgos
- Dividir `world.ts` puede generar imports circulares: usar `import type` donde sea posible y verificar con `npm run check`.
- Prettier puede alterar strings largos de UI: revisar el diff de formato antes de commitear.
