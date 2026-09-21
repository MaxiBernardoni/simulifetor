# 11 · Guardado, ranuras y migraciones

## Claves de almacenamiento (AsyncStorage)

| Clave | Contenido |
|---|---|
| `vidasim.meta.v2` | `{ schemaVersion, history, achievements, scenarioWins, activeSlot }` — datos **globales** (compartidos por todas las ranuras) |
| `vidasim.slot.0..2` | La `Life` **actual** de cada ranura (JSON) |
| `vidasim.world.0..2` | `WorldData` de cada ranura: `{ world, lives }` (árbol y vidas completas de los bots) |
| `vidasim.save.v1` | Formato antiguo de una sola partida. Solo se **lee** para migrar (pasa a la ranura 0) |

`history` guarda un `LifeSummary` por cada personaje que murió (incluidos los bots). `achievements` y `scenarioWins` son globales.

## Versión de esquema

`SCHEMA_VERSION` (`engine/types.ts`) — hoy **4**.

| Versión | Cambio |
|---|---|
| 1 | Vida única con historial |
| 2 | Aspecto (`look`) del personaje |
| 3 | Bienes, préstamo, inversiones, juicio (`trial`) |
| 4 | Linaje (`lineageId`, `generation`), escenarios, ranuras |
| (sin subir) | `nodeId` en `Life` y `Person`: se rellena al cargar (`reconcile`) |

## Cómo se carga (`store.load`)

1. Lee `meta`; por cada ranura lee la vida y su mundo.
2. `migrateLife` rellena campos nuevos con valores por defecto (`assets`, `loan`, `invested`, `trial`, `lineageId`, `generation`).
3. `reconcile(life, world)`: si falta el mundo o el nodo de la vida, **crea el árbol** desde la vida (familia extendida generada); si hay personas con `nodeId` que no existen, se les quita; se re-sincroniza.
4. Si no hay `meta` pero existe `vidasim.save.v1`, se migra a la ranura 0.

## Cuándo se guarda

- Cada acción: `saveSlot(activa)` y `saveMeta`.
- `saveWorld` solo cuando pasó un año, cambió la cantidad de nodos, se cambió de personaje o se importó/creó una partida.
- Si el guardado falla (disco lleno, modo privado), el juego sigue en memoria sin avisar.

## Copia de seguridad

`store.exportData()` devuelve un JSON (`{ app: 'vidasim', schemaVersion, activeSlot, slots, worlds, history, achievements, scenarioWins }`); la pantalla *Copia de seguridad* lo comparte/copia y lo importa pegándolo. `importData` valida `app === 'vidasim'`, migra cada vida y reemplaza **todo**. Un texto ajeno o cortado devuelve un mensaje de error sin tocar nada.

## Reglas para cambiar el esquema

1. Agregá el campo como **opcional** en el tipo, o subí `SCHEMA_VERSION` si cambia el significado de uno existente.
2. Rellená el valor por defecto en `migrateLife` (y en `reconcile` si es del mundo).
3. Escribí un test que cargue una vida "vieja" (sin el campo) y compruebe que se migra.
4. Anotalo en `CHANGELOG.md` y en la tabla de arriba.
5. **Nunca** borres datos del usuario para "arreglar" una incompatibilidad.


## Datos de la IA opcional

`vidasim.ai.v1` (AsyncStorage): `{ config: { enabled, provider, narrator }, pool: GameEvent[], audit: [] }`. Es independiente del esquema de la partida y **no** entra en la copia de seguridad. La clave de API vive en `expo-secure-store` (`vidasim_ai_key`; en web, `vidasim.ai.key.web`) y nunca se exporta.
