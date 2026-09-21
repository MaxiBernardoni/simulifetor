# 02 · Stack y arquitectura

## Stack

**Expo SDK 57 (React Native 0.86) + TypeScript estricto.** Se desarrolla en Windows y se prueba en el iPhone con la app *Expo Go* (sin Mac). El mismo código corre en el navegador (`expo start --web`), que es como se verifica la UI durante el desarrollo.

| Necesidad | Elección |
|---|---|
| Navegación | Estado propio en el store (`tab`, `creating`); no hay router. El "hub" es la pantalla de vida y cada sección se abre con barra y flecha de volver |
| Estado | Zustand (`store/gameStore.ts`) |
| Guardado | `@react-native-async-storage/async-storage` (JSON versionado) |
| Íconos | `lucide-react-native` con mapa explícito (`ui/Icon.tsx`) |
| Ilustraciones | `react-native-svg` (personajes, escenas y arte propio) |
| Animaciones | `Animated` de React Native (sin dependencias extra); `ui/anim.tsx` |
| Tests | Vitest (corre en Node, sin celular) |
| Web | `react-dom`, `react-native-web` (para verificar y para una futura PWA) |

Limitación conocida: Expo Go requiere PC y celular en la misma red. Para instalarla de forma permanente hay que hacer una PWA o una build con cuenta de Apple (ver tarea T13).

## Principio central: motor separado de la UI

```
src/
  engine/        ← TypeScript PURO (sin React/Expo). Se prueba en Node.
    types.ts        modelo de datos (Life, Person, Effect, Cond, GameEvent…)
    life.ts         createLife, migrateLife, cloneLife
    ageUp.ts        avanzar un año (salud, escuela, trabajo, dinero, cárcel, mortalidad, eventos)
    events.ts       elegir/disparar eventos, resolver decisiones
    conditions.ts   evaluador de condiciones
    effects.ts      aplicador de efectos (stats, dinero, personas, arresto, sentencia…)
    actions.ts      actividades, acciones con personas, trabajo, estudios
    assets.ts       propiedades, autos, préstamos, inversiones, gastos
    people.ts       generación de personas, herencia de rasgos
    looks.ts        aspecto determinístico de una persona sin aspecto propio
    dynasty.ts      puntaje de legado, patrimonio a heredar
    scenarios.ts    crear escenarios y comprobar objetivo/derrota
    autoplay.ts     bot que juega una vida (tests, pasados generados, bots del árbol)
    world.ts        árbol genealógico compartido + simulación liviana + sincronización
    kinship.ts      parentesco, etiquetas, regla de cambio (≤ 2 generaciones), bosque para dibujar
    materialize.ts  generar la vida completa de alguien del árbol; herencia al cambiar
    registry.ts     índices de contenido por id
    rng.ts / text.ts / format.ts / sim.ts
  content/       ← DATOS moddeables (ver docs/04)
    events/*.ts, activities.ts, personActions.ts, careers.ts, scenarios.ts,
    achievements.ts, assets.ts, names.ts, look.ts, icons.ts, scenes.ts, dsl.ts
  store/         ← estado global y persistencia
  ui/            ← pantallas, componentes, arte SVG, animaciones, tema
    screens/  art/  anim.tsx  components.tsx  Avatar.tsx  Icon.tsx  PromptModal.tsx  Toast.tsx  theme.ts
docs/            ← documentación (este directorio)
```

Reglas:
1. `engine` no importa React ni Expo. Recibe una `Life` y la muta; el azar viene de un RNG con semilla guardado en `life.rng`.
2. El contenido son datos tipados, validados por los tests (ids únicos, referencias válidas, escenas existentes).
3. La UI solo lee el estado y dispara acciones del store; toda acción pasa por `mutate()`.
4. `content/*` puede importar tipos y utilidades del motor, pero el motor accede al contenido solo a través de `registry.ts` (y de los mapas de íconos/escenas).

## Modelo de datos (resumen)

- **`Life`**: identidad y aspecto (`name`, `surname`, `gender`, `look`), tiempo (`birthYear`, `age`, `year`, `alive`, `cause`), `stats` (felicidad, salud, inteligencia, apariencia), dinero y bienes (`money`, `assets`, `loan`, `invested`, `pension`), educación (`edu`), trabajo (`job`, `offers`), `people`, `flags`, cárcel (`jailYears`, `trial`), historial (`log`), cola de decisiones (`pending`), linaje (`lineageId`, `generation`, `nodeId`), `scenario`, semilla (`rng`), `schemaVersion`.
- **`Person`**: familiar, amigo, pareja, hijo, ex. Si tiene `nodeId`, es un familiar del árbol y **el mundo decide su edad y su muerte**.
- **`World`** (`engine/world.ts`): `year` compartido, `nodes` (`TreeNode`: nombre, aspecto, nacimiento/muerte, `fatherId`, `motherId`, `partnerId`, `blood`, clase social, resumen de trabajo/patrimonio, `full`), `currentId`, semilla propia.
- **`WorldData`**: `world` + `lives` (vidas completas de los personajes que ya jugaste y siguen vivos, menos la actual).

## Flujo de un año

1. La UI llama `store.ageUp()` → `mutate(ageUp, { tick: true })`.
2. `mutate` clona la vida actual, ejecuta `ageUp(life)` (motor) y luego `advanceWorld(worldData, life)`: el resto de la familia vive el mismo año (bots con `autoPlay`, liviano para el resto) y se sincroniza en ambos sentidos.
3. Se comprueban logros y escenario, se registra la muerte en el historial y se guarda (`saveSlot`, `saveWorld` si cambió, `saveMeta`).

Detalle de fórmulas: `docs/10-motor-y-formulas.md`. Persistencia y migraciones: `docs/11-guardado-y-migraciones.md`.

## Rendimiento

- Vida de 100 años ≈ 100 turnos; cada turno filtra ~190 eventos (índices simples, sin problemas).
- Mundo: ~0,5 ms por año con ~50 personas y 4 bots (medido en Node). Se guarda el mundo solo cuando cambia.
- Los logs de los bots se recortan a 40 entradas al "estacionarlos".
