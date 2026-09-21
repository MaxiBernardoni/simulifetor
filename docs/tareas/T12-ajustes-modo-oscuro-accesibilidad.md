# T12 · Ajustes, modo oscuro y accesibilidad

- **Prioridad / esfuerzo:** media · XL (refactor transversal)
- **Depende de:** T14 (componentes divididos y lint)
- **Autonomía:** ⚠️ refactor grande: hacer por hitos y no unir sin revisar visualmente
- **Estado:** todo

## Objetivo
La UI usa un objeto `colors` **estático** (`ui/theme.ts`) importado en ~40 archivos, por eso no hay modo oscuro ni tamaño de texto configurable. Crear una pantalla de **Ajustes** y hacer el tema **dinámico**, cuidando la accesibilidad.

## Contexto
- `src/ui/theme.ts` (`colors`, `radius`, `space`, `barColor`, `toneColor`), `src/ui/components.tsx` (y sus derivados tras T14), todas las pantallas en `src/ui/screens/`, `src/ui/art/Scene.tsx` (paletas propias de escenas: **no** cambian con el tema), `App.tsx`.
- `docs/07-ui-ux.md`: paleta actual (petróleo `#0E7C7B`, coral `#E76F51`, crema `#FBF7F0`).

## Requisitos
### Hito 1 — Tema dinámico
1. `ThemeProvider` y hook `useTheme()` que devuelve `{ colors, radius, space, scheme, fontScale }`. Reemplazar `import { colors } from '../theme'` por el hook en componentes y pantallas (mecánico). Los `StyleSheet.create` estáticos pasan a fábricas `makeStyles(theme)` memoizadas (`useMemo`).
2. Paleta **oscura** coherente: fondos petróleo muy oscuro (`#0F1B1E`, superficies `#16272B`), texto crema, acentos coral/teal ajustados; barras de stats y chips legibles; el arte de las escenas y avatares no cambia. Comprobar **contraste WCAG AA** (≥ 4,5:1 texto normal) con un test que calcule la razón para pares texto/fondo declarados en cada paleta.
3. `useColorScheme()` para el modo **Automático** (respetar el del sistema).
### Hito 2 — Ajustes
4. Pantalla **Ajustes** (Menú → "Ajustes"): Tema (Claro/Oscuro/Automático), Tamaño de texto (Chico/Normal/Grande/Muy grande → `fontScale` 0,9/1/1,15/1,3), Reducir animaciones (desactiva partículas, flotación y transiciones; deja solo fundidos), Sonido y volumen (de T09 si existe), Vibración (`expo-haptics` en decisiones y resultados), Restaurar valores.
5. `Settings` en `meta` (campos opcionales con defaults; **sin** subir esquema) y `useSettings()` reactivo.
6. Todos los `Text` aplican `fontScale` (componente `T` o hook) y los layouts fijos (barra de navegación, chips, nodos del árbol) no se rompen con "Muy grande".
### Hito 3 — Accesibilidad
7. `accessibilityLabel`/`accessibilityRole` en botones, ítems de lista, tarjetas de decisión, nodos del árbol ("Agustina, hermana, 25 años, podés jugarla"), barras de stats ("Felicidad 62 de 100").
8. Respetar "Reducir movimiento" del sistema (`AccessibilityInfo.isReduceMotionEnabled`).
9. Áreas táctiles ≥ 44 pt en controles pequeños (chips, badges interactivos, cierre de modales).

## Criterios de aceptación
- [ ] `npm run check` verde; tests de contraste (ambas paletas), de defaults/migración de `settings`, y de `fontScale`.
- [ ] Recorrido visual completo en **claro y oscuro** (inicio, creación, vida, cada sección, modal de decisión, muerte, árbol, ranuras, backup) sin texto ilegible ni elementos "blancos sobre blanco". Guardar capturas en `docs/capturas/oscuro/` (opcional) y describirlo en el reporte.
- [ ] "Reducir animaciones" apaga partículas/flotación (verificable por test del hook).
- [ ] `docs/07-ui-ux.md`, `docs/11`, `CHANGELOG.md`.

## Fuera de alcance
Nuevos temas de color por el usuario; idiomas.

## Riesgos
- El refactor toca casi todos los archivos de UI: hacerlo en commits mecánicos chicos y correr `npm run check` entre ellos. Cualquier color literal (`'#fff'`, `'#E9A23B'`…) revisarlo: si es semántico, pasa al tema.
