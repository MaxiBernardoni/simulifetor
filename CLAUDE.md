@AGENTS.md

# VidaSim — guía para agentes

Simulador de vida en texto para celular (estilo BitLife), **en español rioplatense**, humor negro, para adultos, 100 % offline y de uso personal. App móvil hecha con **Expo (React Native) + TypeScript**. Se prueba en un iPhone con Expo Go.

> Antes de tocar nada leé `docs/` (empezá por `README.md`). Este archivo es el resumen operativo.

## Comandos

```bash
npm install            # dependencias
npm run check          # OBLIGATORIO antes de cada commit: tsc --noEmit + vitest run
npm test               # solo tests (simula cientos de vidas completas)
npm run typecheck      # solo tipos
npx expo start --web --port 8081   # app en el navegador (para verificar la UI)
npm run check:all      # + ESLint y Prettier --check
npm run balance -- --n=500 --profile=normal   # informe de balance (perfiles: normal, crimen, familia, pasivo, romance)
npm run icons          # regenera src/ui/Icon.tsx (falla si falta un ícono)
```

El motor se puede probar sin celular ni navegador: los tests corren en Node.

## Arquitectura (mapa)

| Carpeta | Qué hay | Regla |
|---|---|---|
| `src/engine/` | Motor del juego: TypeScript **puro**, sin React ni Expo | Funciones que mutan una `Life`; el azar sale de un RNG con semilla (`rng.ts`). Nada de `Math.random()` acá |
| `src/content/` | **Datos**: eventos, actividades, acciones con personas, carreras, escenarios, logros, íconos, escenas | Agregar contenido = agregar entradas, casi sin tocar el motor (ver `docs/04-contenido-y-eventos.md`) |
| `src/store/gameStore.ts` | Estado global (Zustand), guardado (AsyncStorage), ranuras, mundo familiar | Toda acción de UI pasa por `mutate()` |
| `src/ui/` | Pantallas y componentes (`screens/`), arte SVG (`art/`), animaciones (`anim.tsx`), tema (`theme.ts`) | La UI solo lee el estado y dispara acciones |
| `docs/` | Diseño y documentación | Mantenerla al día en el mismo commit que el cambio |

Conceptos clave (detalle en `docs/10-motor-y-formulas.md`):

- **`Life`**: la vida completa de un personaje (stats, dinero, trabajo, `people`, `log`, `pending`…). `ageUp(life)` avanza un año.
- **Eventos**: declarativos (`GameEvent`), con condiciones y efectos (`content/dsl.ts`). Los que tienen `choices` quedan en `life.pending` como *prompts* hasta que el jugador elige.
- **`World` / `TreeNode`** (`engine/world.ts`): árbol genealógico compartido. Los que ya jugaste son bots con `Life` completa; el resto se simula "liviano". Se puede jugar (cambiar) solo a parientes de sangre a ≤ 2 generaciones (`engine/kinship.ts`).
- **Escenas** (`ui/art/Scene.tsx` + `content/scenes.ts`): cada evento/actividad se asigna a una ilustración SVG animada.
- **Guardado**: 3 ranuras (`vidasim.slot.N` + `vidasim.world.N`) + `vidasim.meta.v2`. Hay versión de esquema y migraciones (`docs/11-guardado-y-migraciones.md`).

## Convenciones

- **Idioma**: todo texto visible al jugador en español rioplatense (voseo: "tenés", "elegí"). Código y nombres internos: inglés o español breve, coherente con el archivo que tocás. Comentarios en español.
- **Estilo del humor**: seco, ácido, segunda persona ("Te llaman…"). Frases cortas. Ver guía de escritura en `docs/04`.
- **Tipado estricto**: `tsc --noEmit` debe dar 0 errores. No uses `any` salvo que no haya alternativa.
- **Determinismo**: el motor usa `rngOf(life)` / `rngFromState`. Los tests dependen de eso.
- **Compatibilidad de partidas**: si cambiás la forma de `Life`, `World` o `Person`, **subí `SCHEMA_VERSION`** y agregá el relleno en `migrateLife` (`engine/life.ts`) o `reconcile` (store). Las partidas viejas no se rompen.
- **Contenido nuevo** ⇒ tests verdes: ids únicos, `trigger` válidos, toda escena/ícono referenciado existe. Un evento nuevo necesita su escena (`content/scenes.ts`) y, si usa un ícono nuevo, que exista en `ui/Icon.tsx` (se regenera con el script de íconos: ver "Trampas").
- **Commits**: mensajes en español, explicando el porqué; terminar con `Co-Authored-By: Claude Sonnet 5 <noreply@anthropic.com>`. Un commit por unidad lógica.
- No agregues dependencias pesadas sin necesidad. Preferí `npx expo install <paquete>` (versiones compatibles con Expo SDK 57).

## Reglas de contenido (fijas)

- Contenido adulto sin censura **con una sola excepción**: **nunca** contenido sexual que involucre a menores de edad, ni escrito por vos ni generado por una IA integrada. Las etapas infantiles tratan otros temas.
- El suicidio se trata con cuidado: sin instrucciones ni detalles.
- País **genérico** (ficticio). Nada de política real ni marcas reales.
- No copiar marcas, logos, textos ni arte de BitLife. La estética es propia (paleta petróleo/coral/crema).

## Definición de "terminado" para cualquier tarea

1. `npm run check` en verde (tipos + tests).
2. Tests nuevos que cubran lo nuevo (mirá `src/engine/engine.test.ts` y `world.test.ts` como modelo).
3. Si toca la UI: verificada en el navegador (viewport móvil 375×812), sin errores en consola.
4. Docs actualizadas (`docs/` + `CHANGELOG.md`) en el mismo commit.
5. Sin partidas rotas (migración si cambió el esquema).

## Trampas conocidas (aprendidas a los golpes)

- **Servidor Expo en modo CI** (`CI=1 npx expo start --web`) **no recarga** los cambios: hay que reiniciarlo para ver código nuevo. Además usa un puerto nuevo para no chocar con procesos viejos (8081 puede estar tomado). Para detener *tu* servidor filtrá por línea de comando y puerto (`Get-CimInstance Win32_Process` con `expo` + el puerto).
- **Nunca mates todos los procesos `node`** (`taskkill /IM node.exe`): rompe otras herramientas. Filtrá por línea de comando (`expo` + puerto).
- Para inspeccionar la app en el navegador hay ganchos solo en desarrollo: `globalThis.__game` (store de Zustand: `getState()`, `setState()`, acciones) y `globalThis.__kin` (parentesco). Sirven para jugar años rápido y preparar estados.
- En la web las animaciones usan `useNativeDriver: false`; en un navegador en segundo plano `requestAnimationFrame` se frena, así que **esperá 2 s** antes de sacar capturas (las filas con `FadeIn` pueden parecer ausentes).
- `Intl` / `toLocaleString` no es confiable en Hermes: usá `formatMoney` (`engine/format.ts`).
- Íconos de `lucide-react-native`: algunos nombres cambiaron (no existen `Angry`, `Smile`, `Trash2`). El mapa `ui/Icon.tsx` es **explícito** (no importa toda la librería). Si un ícono no está en el mapa, se dibuja un círculo. Regenerarlo: ver `docs/12-verificacion-y-testing.md`.
- Los scripts de Python con muchas comillas dentro de heredocs de bash fallan a veces: escribí el script a un archivo y ejecutalo.
- `Modal` de React Native + animaciones: una captura tomada a mitad de la animación de entrada se ve "traslúcida"; no es un bug.
- Los familiares del árbol (`Person.nodeId`) **no envejecen ni mueren por el motor de la vida**: lo decide el mundo (`world.ts`). No los toques desde eventos salvo con los efectos existentes.

## Trabajo autónomo / rutina nocturna

Hay un backlog de tareas complejas en `docs/tareas/` y el prompt de la rutina en `docs/tareas/PROMPT-RUTINA.md`. Reglas de seguridad: trabajar en una rama `noche/…`, **no tocar `main`**, no borrar datos del usuario, no ejecutar comandos destructivos, dejar un reporte en `docs/tareas/reportes/`.
