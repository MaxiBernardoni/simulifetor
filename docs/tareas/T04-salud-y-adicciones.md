# T04 · Enfermedades y adicciones detalladas

- **Prioridad / esfuerzo:** alta (pendiente de la Fase 2) · XL — dividir en hitos
- **Depende de:** T02
- **Autonomía:** ✅ segura
- **Estado:** todo

## Progreso

Sin código todavía. Ya se relevó dónde engancharse: `ageUp.ts` (`driftStats`, `checkMortality` con el factor de salud), flags `chronic`/`substance`/`drinker`/`smoker` (en `content/events/health.ts`, `crime.ts`, `teen.ts`, `activities.ts`, `ageUp.ts:128`, `ui/components.tsx#statusBadges`, `AssetsScreen`). Nota para quien la retome: `Outcome.conditions` (T05) permite variar resultados por condición; el multiplicador de mortalidad debe pasar por `checkMortality` y validarse con `npm run balance` (banda de esperanza de vida 70–79).

## Objetivo
La salud hoy es un número (0–100) con flags sueltos (`chronic`, `substance`, `drinker`, `smoker`). Falta el sistema que BitLife-like promete: **enfermedades con nombre, síntomas, tratamientos y consecuencias**, y **adicciones con niveles y rehabilitación**. Debe sentirse cruel, divertido y con decisiones.

## Contexto
- `src/engine/types.ts` (`Life`, `Effect`, `Cond`), `ageUp.ts` (`driftStats`, `checkMortality`), `content/activities.ts` (`doctor`, `therapy`, `drugs`, `drink`), `content/events/health.ts`, `content/icons.ts`, `content/scenes.ts` (`hospital`, `therapy`).
- `docs/10-motor-y-formulas.md` (salud objetivo por edad, mortalidad ajustada por salud).

## Requisitos
### Hito 1 — Modelo y motor
1. `Life.conditions: { id: string; since: number; severity: 1|2|3; treated: boolean }[]` (campo nuevo **opcional**, migración: `[]`).
2. Catálogo `content/conditions.ts` con ≥ 30 afecciones en 4 grupos: **infecciosas/agudas** (gripe fuerte, neumonía, COVID-like según época), **crónicas** (diabetes, hipertensión, asma, artrosis, EPOC, insuficiencia renal), **graves** (cáncer en 3 tipos, infarto previo, ACV, Alzheimer/demencia), **mentales** (depresión, ansiedad, trastorno de la alimentación, burnout). Cada una define: `label`, `onset` (edad mínima/máxima, probabilidad base anual, modificadores por salud, flags de estilo de vida como `smoker`, `drinker`, `substance`, sedentarismo, estrés), `effects` por año (stats, costo anual, aumento de mortalidad como multiplicador), `curable`/`chronic`, tratamientos posibles con costo, probabilidad de éxito y efectos secundarios, y la progresión (puede subir `severity`).
3. `engine/health.ts`: `rollConditions(life, rng)` (llamado desde `ageUp`), `applyConditionEffects`, `treat(life, conditionId, treatmentId)`. La mortalidad usa el multiplicador de las afecciones graves; el costo anual se suma a los gastos.
4. Nueva condición `c.condition(id)` y efecto `fx.addCondition(id)` / `fx.cure(id)` en el DSL.
### Hito 2 — Adicciones
5. Sistema de adicciones `Life.addictions: { kind: 'alcohol'|'tabaco'|'drogas'|'apuestas'|'juegos'|'redes'; level: 1|2|3 }[]` con: subida por consumo repetido (las actividades `drink`, `drugs`, `casino`, etc. aumentan la probabilidad), efectos por nivel (dinero, salud, felicidad, trabajo), **abstinencia** (empeora unos años al dejar), y **rehabilitación** (actividad "Rehabilitación": costo, éxito según nivel y apoyo de pareja/familia, recaídas).
6. Reemplazar los flags `substance`, `smoker`, `drinker` por el sistema nuevo **manteniendo compatibilidad** (migración: `substance` → droga nivel 2, `smoker` → tabaco nivel 1, `drinker` → alcohol nivel 1) y actualizar los eventos que los usan.
### Hito 3 — Contenido y UI
7. ≥ 40 eventos de salud (diagnósticos, sala de espera, seguros, hospital, terapia, recaídas, apoyo familiar), con escena `hospital`/`therapy` y decisiones (tratamiento caro vs. barato, segunda opinión, ocultarlo a la familia).
8. Pantalla **Salud** (entrada desde Actividades o Menú): lista de afecciones activas (severidad, desde cuándo, tratamiento), adicciones con nivel, y botones de tratamiento/rehabilitación con costo. Insignias en la barra del personaje (`statusBadges`).
9. Reflejar en el árbol/fichas: `NodeSheet` muestra "Enfermo/a" si el nodo tiene vida completa con afección grave.

## Criterios de aceptación
- [ ] `npm run check` verde. Tests: catálogo válido (ids únicos, tratamientos existen), migración de flags viejos, `rollConditions` determinista, tratamiento cura/no cura según semilla, mortalidad con afección grave > sin ella (media en 500 vidas), adicción sube/baja y rehabilitación, DSL nuevo.
- [ ] Balance (con T01 si existe): esperanza de vida media dentro de 70–79 y frecuencia de afecciones plausible (≈ 60 % de las vidas tienen ≥ 1 afección crónica antes de los 75).
- [ ] UI verificada; sin errores; textos en voseo.
- [ ] `docs/03`, `docs/04`, `docs/10`, `docs/11` (migración) y `CHANGELOG.md`.

## Fuera de alcance
Sistema sanitario/seguros por país, epidemias globales (eso es T05).

## Riesgos
- Tono: humor negro sí, pero sin detalles instructivos de consumo ni de autolesión; el suicidio no se muestra ni como opción ni con métodos.
- Complejidad de migrar flags: escribir primero el test de migración.
