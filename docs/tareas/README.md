# Backlog de tareas (para la rutina nocturna)

Cada archivo `Txx-*.md` es una tarea **autocontenida**: objetivo, contexto (archivos exactos), requisitos, criterios de aceptación verificables, restricciones y riesgos. La rutina de Claude toma la primera tarea con estado `todo` cuyas dependencias estén en `done` (ver `PROMPT-RUTINA.md`).

**Leer siempre primero**: `CLAUDE.md` (raíz), `docs/10-motor-y-formulas.md`, `docs/11-guardado-y-migraciones.md`, `docs/12-verificacion-y-testing.md`.

## Estados

`todo` → `wip` (rama abierta) → `review` (terminada en una rama `noche/*`, esperando que Max la revise y la una a `main`) → `done` (unida a `main`). También `blocked` (con el motivo en la tarea).

> La rutina **nunca** pasa una tarea a `done`: la deja en `review`. Solo Max la pasa a `done` al unir la rama.

## Índice y orden recomendado

| Orden | ID | Tarea | Esfuerzo | Depende de | Autonomía | Estado |
|---|---|---|---|---|---|---|
| 1 | [T14](T14-calidad-de-codigo.md) | Calidad de código: lint, formato, scripts, dividir archivos grandes | M | — | ✅ segura | parcial (ver T14) |
| 2 | [T02](T02-robustez-del-motor.md) | Robustez: tests de propiedades, fuzz, tests del store y migraciones | L | — | ✅ segura | todo |
| 3 | [T01](T01-herramienta-de-balance.md) | Herramienta de balance (`npm run balance`) y calibración | L | T02 | ✅ segura | todo |
| 4 | [T03](T03-contenido-masivo.md) | +250 eventos, +30 actividades, +10 carreras (por lotes) | XL | T01 | ✅ segura (contenido) | todo |
| 5 | [T16](T16-arbol-anti-abuso-y-ux.md) | Árbol: enfriamiento anti-abuso, zoom/pan, novedades de la familia | L | — | ⚠️ revisar decisión | todo |
| 6 | [T04](T04-salud-y-adicciones.md) | Enfermedades y adicciones detalladas | XL | T02 | ✅ segura | todo |
| 7 | [T05](T05-eras-tecnologia-y-leyes.md) | Eras: tecnología, leyes, inflación y eventos históricos | XL | T01 | ✅ segura | parcial (ver T05) |
| 8 | [T15](T15-onboarding-y-ayuda.md) | Tutorial inicial y pantalla "Cómo se juega" | M | — | ✅ segura | todo |
| 9 | [T09](T09-sonidos-de-interfaz.md) | Sonidos de interfaz sintetizados | M | T14 | ✅ segura | todo |
| 10 | [T12](T12-ajustes-modo-oscuro-accesibilidad.md) | Ajustes, modo oscuro, accesibilidad | XL | T14 | ⚠️ refactor grande | todo |
| 11 | [T08](T08-fama-y-carreras.md) | Fama y carreras (músico, actor, deportista, político…) | L | T05 | ✅ segura | todo |
| 12 | [T11](T11-educacion-universitaria.md) | Carreras universitarias, notas, becas, préstamos estudiantiles | L | T04 | ✅ segura | todo |
| 13 | [T10](T10-negocios-propios.md) | Negocios propios | L | T05 | ✅ segura | todo |
| 14 | [T06](T06-capa-de-ia-opcional.md) | Capa de IA opcional con clave gratuita | XL | T12 | ⚠️ dependencias y red | review |
| 15 | [T07](T07-npcs-persistentes.md) | NPCs persistentes fuera de la familia | XL | T16 | ⚠️ cambia el mundo | todo |
| 16 | [T13](T13-pwa-e-instalacion.md) | PWA y build para instalar en el iPhone (sin desplegar) | M | T12 | ✅ segura | todo |

Esfuerzo: S ≈ 1 h · M ≈ 2–3 h · L ≈ 4–6 h · XL ≈ 1 noche completa o más (dividir en hitos).

## Reglas comunes a todas las tareas

1. Rama `noche/AAAA-MM-DD-Txx-slug`. **No tocar `main`.**
2. `npm run check` en verde antes de cada commit. Si no se puede dejar en verde, revertir al último commit verde.
3. Tests nuevos para todo lo nuevo (no borrar ni debilitar tests existentes).
4. Cambio de esquema ⇒ migración + test + entrada en `docs/11`.
5. UI ⇒ verificar en el navegador (375×812) y sin errores de consola; si no hay navegador disponible, marcarlo como "UI sin verificar" en el reporte.
6. Actualizar docs afectadas y `CHANGELOG.md` (sección `[Rutina nocturna] AAAA-MM-DD`).
7. Reportar en `docs/tareas/reportes/AAAA-MM-DD.md` (plantilla en `PROMPT-RUTINA.md`).
8. Reglas de contenido fijas (ver `CLAUDE.md`): nunca contenido sexual con menores, suicidio sin detalles, país genérico, sin marcas ni logos ajenos.
9. Si una tarea es demasiado grande: completar el primer hito, dejar la tarea en `wip` con un apartado `## Progreso` que indique qué está hecho y qué falta.

## Plantilla para tareas nuevas

Ver [`_plantilla.md`](_plantilla.md).
