# T05 · Eras: tecnología, leyes, inflación y eventos históricos

- **Prioridad / esfuerzo:** media-alta (Fase 4) · XL — dividir en hitos
- **Depende de:** T01
- **Autonomía:** ✅ segura
- **Estado:** review (hitos 1 y 2 hechos a mano en la sesión de la Fase 4; faltan: efectos de leyes sobre probabilidades, pena de muerte en juicios, escenas `war`/`disaster`, verificación con `npm run balance` de T01)

## Objetivo
Cada vida nace en un año al azar (1950–2010) pero el mundo se comporta igual en todas las épocas: salarios y precios fijos, sin tecnología ni leyes que cambien. Queremos que **la época importe**: qué trabajos existen, qué se puede comprar, qué es legal, cuánto vale la plata y qué pasa en el mundo.

## Contexto
- `src/content/events/misc.ts` (`HISTORICAL`, 8 eventos), eventos con `c.year(a,b)` en varios archivos (`teen.social_media`, `money.crypto`…).
- `src/engine/ageUp.ts` (sueldos, gastos), `src/engine/assets.ts` (precios de casas/autos, `housingCost`), `src/content/careers.ts` (salarios), `src/content/assets.ts`.
- `World.year` (`engine/world.ts`): el año calendario ya se comparte en la familia.
- `docs/06-mundo-persistente.md` (visión de eras).

## Requisitos
### Hito 1 — Modelo de eras (puro, sin cambios de esquema)
1. `content/eras.ts`: función **pura** `eraAt(year)` que devuelve `{ id, label, tech: Set<string>, laws: Set<string>, priceIndex: number, wageIndex: number }` para 1940–2120 con eras: años 50, 60, 70, 80, 90, 2000, 2010, 2020, 2030+, definiendo `tech` (tv, computadora, internet, celular, smartphone, redes, streaming, ia, autos_autónomos), `laws` (voto_joven, divorcio, drogas_blandas_legales, pena_de_muerte, matrimonio_igualitario, servicio_militar…) — todo genérico, sin países reales.
2. **Índices de precios/salarios** por año (`priceIndex`, `wageIndex`; base 1,0 en 2000; interpolar suavemente con "crisis" y "boom"): aplicarlos a **salarios de carreras**, **precios del catálogo de bienes**, **alquiler/gastos base**, **cuotas de universidad** y a los montos en `formatMoney` **no** (siguen mostrando la moneda genérica). Los montos escritos a mano en eventos/actividades se escalan con un helper `scaleMoney(n, year)` opcional en los efectos (`fx.moneyScaled`) — aplicarlo a los eventos de dinero más comunes.
3. Condiciones nuevas en el DSL: `c.tech('internet')`, `c.law('drogas_blandas_legales')`, `c.era('90s')`; con test.
### Hito 2 — Consecuencias sistémicas
4. **Carreras por época**: `Career.since?: number` y `until?: number` (año). Programador desde 1975, influencer desde 2008, etc.; las que no existen no se ofrecen. Agregar 8 carreras de época (operador telefónico, telegrafista, community manager, repartidor de apps…).
5. **Actividades por época** (`Activity.tech?`): "Redes sociales", "Videojuegos", "Streaming", "Citas por app" según tecnología; otras desaparecen.
6. **Leyes** modifican probabilidades y consecuencias: p. ej. `drogas_blandas_legales` reduce el riesgo de arresto en `drugs`; `pena_de_muerte` agrega un desenlace al juicio por homicidio (tratar con cuidado: texto sobrio, sin detalles).
7. **Eventos históricos** (`tags: ['historical']`, `once`): ≥ 40 nuevos distribuidos entre 1950 y 2110, genéricos (guerra civil, golpe, crisis, hiperinflación, apertura económica, pandemia, boom tecnológico, burbuja, mundial deportivo, desastre natural, cambio de moneda, reforma jubilatoria…), con efectos sobre dinero/felicidad y algunos con **decisión** (emigrar, invertir, cambiar de trabajo). Los que afectan a todos usan `moneyPct` moderado.
8. Los años posteriores a 2026 son **futuro**: eras 2030+, 2050+, 2080+ con tecnología especulativa (autos autónomos, longevidad, realidad virtual) y eventos acordes.
### Hito 3 — UI
9. Mostrar la **época** en la barra del personaje (`Años 90`) y un aviso cuando cambia de era (toast). Escenas nuevas si hacen falta (p. ej. `war`, `disaster`) siguiendo `docs/10` → "Puntos de extensión".

## Criterios de aceptación
- [ ] `npm run check` verde; tests: `eraAt` continua y monótona en tecnología, índices positivos y acotados (0,2–8), `c.tech`/`c.law`/`c.era`, carreras respetan `since/until`, sin eventos que requieran tecnología inexistente en su rango de años (test que recorra eventos con `c.year` y `c.tech`).
- [ ] `npm run balance` (T01): las bandas se mantienen en **cada década** de nacimiento (el bot en 1950 y en 2000 tienen economías comparables en términos reales).
- [ ] Sin cambios de esquema (todo derivado del año) — si hiciera falta guardar algo, migración + `docs/11`.
- [ ] `docs/06`, `docs/10`, `docs/04` y `CHANGELOG.md` actualizados.

## Fuera de alcance
Países reales o eventos con personas reales; NPCs persistentes.

## Riesgos
- Escalar dinero puede desbalancear: medir con T01 en cada hito y mantener las cifras visibles "legibles" (redondear).
- Contenido político sensible: mantener todo genérico y sin referencias a partidos, países o líderes reales.
