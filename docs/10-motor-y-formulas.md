# 10 · Motor y fórmulas

Referencia de cómo funciona el motor **hoy**. Si cambiás una constante, actualizá este documento. Las constantes están en `src/engine/ageUp.ts`, `assets.ts`, `events.ts`, `world.ts`, `materialize.ts` y `dynasty.ts`.

## Orden de `ageUp(life)`

Si la vida murió o hay decisiones pendientes (`life.pending`), no hace nada.

1. `age++`, `year++`, se limpian `usedThisYear` y `offers`.
2. **`agePeople`**: cada persona envejece (`p.age++`). Las que **no** son del árbol mueren con `baseMortality(edad) × 0,9`; las del árbol (`nodeId`) solo se enfrían (la muerte la decide el mundo). Solo se enfría la amistad positiva (`cool`); la negativa (enemistad o "mala onda", < 0) no se apaga sola, y el amor baja 0–2 con 30 % de probabilidad al año. Luego: amigos/ex con amistad entre 0 y 8 se pierden (los enemigos se quedan); pareja con `min(amistad, amor) ≤ 15` corta (50 %/año; si estaban casados, divorcio con pérdida del 30 % del dinero).

**Infidelidad (T17)**: los gestos románticos con alguien que no es la pareja suman `risk` a `partner.suspicion`; cada año, con un amorío (amor ≥ 40) suma 6 y no se olvida (sin amorío baja 8). Con sospecha ≥ 20, probabilidad anual `min(0,9; sospecha × 0,7 / 100)` de que se entere: se dispara `love.cheat_discovered` (no sale al azar) y la sospecha vuelve a 0. El amante (`findLover`: la persona adulta con más amor que no es la pareja ni el objetivo) reacciona en cada decisión con `fx.bond('lover', …)`; en los textos es `{lover}` ("la otra persona" si no hay). Los chips del resultado solo cuentan los cambios de la persona objetivo.

**Amistad y amor (T17)**: cada `Person` tiene `friendship` (−100 a 100) y `romance?` (0 a 100, `undefined` = bloqueado). El efecto `relation` mueve ambas y registra el cambio real en los `deltas` del resultado (chips de amistad y amor). El amor solo se crea o cambia si **ambos son adultos** (defensa en `applyEffect`). Con cada persona se ofrecen **hasta 6 acciones por categoría** (`offeredActions`, `actions.ts`): de las que cumplen sus condiciones (niveles de amistad y amor, edades, parentesco) entran primero las esenciales (`core`) y el resto se sortea con un hash de vida + año + persona + acción. Cambia cada año, es estable dentro del año y no consume azar del juego.
3. **`driftStats`**: felicidad vuelve hacia 55 (6 %/año); salud tiende a un objetivo por edad (85 hasta 39, 72 hasta 59, 58 hasta 74, 45 desde 75) con fuerza 0,15 (0,08 pasados los 60) y pierde 0–2/año desde los 60; apariencia baja 1 (40 %/año) pasados los 35; enfermedad crónica −1 salud/año y adicción −2.
4. **`updateEducation`**: primaria a los 5, secundaria a los 12, egreso a los 18 (salvo abandono). Promedio (`gpa`) se mueve hacia `smarts×0,8 + 0..25`. Universidad: 4 años, $4.000/año salvo familia acomodada, expulsión posible con `gpa < 30`.
5. **`updateWork`**: sueldo neto = bruto × 0,8 (**impuesto 20 %**). Rendimiento ±8 + ajuste por inteligencia. Ascenso: rendimiento ≥ 75, ≥ 2 años en el nivel, 60 %. Aumento del 3 %/año si no asciende. Despido: rendimiento < 15 (50 %). **Jubilación a los 65**: pensión = 45 % del sueldo neto. Después: `updateAssets` (ver abajo) y gastos.
6. **Gastos** (desde los 18, salvo preso o "ayudado por la familia" si < 22, clase ≥ 2 y sin trabajo): vivienda (**alquiler $7.000**, o $2.000 + 1 % del valor si tenés casa) + autos ($900 c/u) + hijos < 18 ($2.500 c/u) + **estilo de vida** = `max(0, sueldo×0,8 − 12.000) × 0,6`. Deuda (dinero < 0): +8 %/año; bajo **−$40.000 = quiebra** (se pierde todo, queda en −$5.000, felicidad −12).
7. **`updateJail`**: −1 año de condena, salud −1, felicidad −3; al salir, flag `ex_convict`.
8. **`checkMortality`**: salud ≤ 0 mata; si no, `baseMortality(edad) × factor(salud)` con `factor = clamp(1 + (50−salud)/60, 0,4, 2,5)`.
9. **Eventos del año** (`runYearEvents`): primero los `historical` elegibles (siempre); luego N eventos: edad < 4 → 1; ≥ 70 → 1 (60 %) o 2; resto → 1 (35 %), 2 (45 %), 3 (20 %). Se sortea por `weight`. Máximo 2 decisiones en cola por año. Cooldown por defecto 4 años; `once` no se repite.

`baseMortality`: <1: 0,5 % · <15: 0,04 % · <40: 0,12 % · <55: 0,4 % · <65: 1 % · <75: 2,5 % · <85: 7 % · <95: 18 % · resto 35 %. Resultado: esperanza de vida media ≈ 73–76 años en simulaciones.

## Economía (`assets.ts`)

- Casas: valor ±(−4…+9) %/año; autos −10 %/año. Casa de $60.000 / $140.000 / $600.000; autos $9.000 / $28.000 / $90.000.
- Compra financiada: **20 % de entrada**; el resto es préstamo. Capacidad del banco = 3 × ingresos anuales + 50 % del valor de tus bienes − préstamo actual.
- Préstamo: interés **6 %/año** y cuota automática = max($1.500, 10 % del saldo).
- Inversión: retorno anual sorteado {−25 %: 10 %, −5 %: 25 %, +6 %: 35 %, +14 %: 25 %, +40 %: 5 %} (esperado ≈ +3,9 %).
- Patrimonio neto = dinero + inversiones + bienes − préstamo.
- Calibración medida (300 vidas con bot sin crimen): mediana ≈ $225.000, ~16 % supera $1.000.000.

## Justicia (`effects.ts`)

`arrest(crimen, min, max)` deja `life.trial` y dispara el evento `court.trial` (tag `court`, fuera del sorteo aleatorio). Las opciones aplican `sentence`: `full`, `half` (mitad, mínimo 1), `double`, `probation` (sin cárcel pero con antecedentes) o `none`. Menores: condena tope 3 años (reformatorio). Cualquier condena marca `criminal_record`, quita el trabajo y la universidad.

## Escenarios (`scenarios.ts`, `content/scenarios.ts`)

`createScenarioLife`: crea la vida (con clase forzada si corresponde), simula el pasado con `autoPlay` hasta `startAge` (reintenta si muere o queda preso), limpia flags/log y aplica `setup`. `checkScenario` corre tras cada acción: ganó (`won`), o perdió si murió / pasó `deadlineAge` / `lost(life)`; agrega un prompt de resultado.

## Autojugador (`autoplay.ts`)

Cada año: con probabilidad `activityChance` busca trabajo, se anota a la universidad, compra/vende/invierte/pide préstamo al azar, hace una actividad (los delitos solo con probabilidad `crimeChance`) y una acción con una persona; con `familyBias` empuja a formar pareja, casarse y tener hijos. Resuelve las decisiones eligiendo al azar entre las disponibles. RNG independiente del de la vida.

## Mundo familiar (`world.ts`, `kinship.ts`, `materialize.ts`)

- **Creación** (`createWorld`): nodo del jugador, padres/hermanos/pareja/hijos de la vida, y una familia extendida generada: abuelos por cada padre (sobreviven según edad), 0–2 tíos por lado (65 % con pareja y 0–3 hijos → primos).
- **Año** (`advanceWorld`): por cada año hasta igualar el de la vida actual, cada nodo vivo (menos el actual): si tiene `Life` completa → `autoPlay` de 1 año (`activityChance` 0,4, `crimeChance` 0,03, `familyBias`); si no → `liteYear`: envejece, muere con la mortalidad base (×0,85 clase alta, ×1,15 baja), divorcio (0,5 % con hijos / 1,2 % sin), pareja nueva (9 %/año soltero de 20 a 55, 4 % viudo/a hasta 75) y, si es mujer con pareja varón de 20 a 41 años, hijo con 17 % (13 % desde el segundo; máx. 4). Los recién llegados (bebés, parejas nuevas) se registran **después** de avanzar el año para no envejecer de más. Al final se sincroniza cada vida con el árbol (`syncLifeToWorld`, `syncWorldToLife`).
- **Cambio de personaje** (`store.switchCharacter`): valida (`canSwitchTo`), toma o genera la vida del destino (`materializeLife`), estaciona la actual como bot si sigue viva y aplica la herencia si murió.
- **Regla ≤ 2 generaciones** (`kinship.ts`): se busca el ancestro común más cercano con `da` generaciones desde uno y `db` desde el otro; se puede cambiar si existe y `max(da, db) ≤ 2`. Es decir: padres, abuelos, hermanos (también medios), hijos, nietos, tíos, sobrinos y primos. No se puede: cuñados, suegros, parejas, sobrinos nietos, tíos abuelos, primos segundos ni fallecidos.
- **Herencia** (`applySwitch`): solo si murió el personaje anterior: hijo 85 % del patrimonio a heredar si es el único (60 % si hay hermanos), otro pariente 15 %; patrimonio a heredar = 80 % del neto (20 % de impuesto de sucesión). Marca `heir` y, si corresponde, `famous_family` (neto ≥ $500.000) o `infamous_family` (antecedentes/homicidio).
- **Materialización**: crea la vida con padres y hermanos reales "congelados" (`frozen`), simula el pasado con `autoPlay` (sin pareja ni hijos propios), y al terminar reemplaza los inventados por los reales del árbol; reintenta hasta 10 veces si muere en la simulación.

### Anti-abuso del cambio de personaje y novedades (T16)

- `canSwitchTo` exige siempre: pariente de sangre vivo a ≤ 2 generaciones **del personaje actual**. Con el actual vivo (cambio voluntario) exige además: ≤ 2 generaciones del **ancla** (`World.anchorId`), `SWITCH_COOLDOWN_YEARS` (5) años desde `World.lastSwitchYear` y menos de `MAX_SWITCHES_PER_GENERATION` (3) cambios en la generación (`World.switchesInGeneration`). Si el actual murió no aplica nada de esto; quien lo reemplaza pasa a ser el ancla y arranca un enfriamiento nuevo.
- `performSwitch` (`engine/switch.ts`) registra el cambio. `SwitchCheck.temporary` marca los bloqueos que se van con el tiempo (la UI los pinta ámbar).
- **Novedades** (`engine/news.ts`): al avanzar un año se compara una foto de los nodos y se escriben nacimientos, muertes, casamientos/parejas nuevas y separaciones en `World.news` (máx. 60, ids crecientes; `newsSeen` guarda la última leída).

## Legado (`dynasty.ts`)

`legacy = edad + patrimonio/8.000 + 6×hijos + 4×nivel de estudios + 15 si llegó al tope de su carrera − 8 con antecedentes − 25 si homicida + 30 si superó un escenario` (mínimo 0).

## Eras e inflación (`content/eras.ts`)

- `eraAt(año)` → `{ id, label, tech, laws, priceIndex, wageIndex }`, puro y cacheado. Tecnologías: `TECH` (año de aparición). Leyes: `LAWS` (rango de vigencia).
- **Índice de precios** `priceIndex(año)`: base 1,0 en 2000; puntos anclados (1950: 0,22 · 1980: 0,62 · 2010: 1,3 · 2050: 3,1 · 2120: 8) con interpolación geométrica. **Índice de salarios** = precios × factor real (0,85–1,1: crisis lo bajan, booms lo suben).
- Todo monto escrito en el contenido está en "valores del 2000". Se escala con `scaleMoney(n, año)` (redondeo legible) en: `fx.money`, costo de actividades y acciones (`costOf`), textos (`fill` → `scaleText`), catálogo de bienes (`priceOf`), alquiler/auto/hijos/estilo de vida, universidad, jubilación mínima, umbrales de deuda/quiebra.
- Sueldos: al conseguir trabajo y al ascender se multiplica por `wageIndex`; el aumento anual es 3 % real × la inflación del año.
- Ahorros con saldo positivo ganan 90 % de la inflación; las inversiones suben con la inflación; las casas también.
- Comparaciones entre épocas (logros, escenarios, legado, "familia famosa") usan `realNetWorth` = patrimonio / índice de precios.
- Carreras: `since`/`until` (año). Actividades: `tech`. Condiciones: `c.tech`, `c.law`, `c.era`.

## Bandas de balance objetivo (T01)

Medidas con `npm run balance -- --n=500 --profile=<perfil>` (perfiles: `normal`, `crimen`, `familia`, `pasivo`, `romance`; ver `engine/balance.ts`). El bot elige al azar, así que las bandas sirven para **detectar roturas**, no para simular a una persona.

| Métrica (perfil) | Banda | Última medición |
|---|---|---|
| Esperanza de vida media (normal) | 70–79 | 73,9 |
| p10 de la edad de muerte (normal) | ≥ 45 | 60 |
| Quiebras (normal) | ≤ 15 % | 6,4 % |
| Millonarias, patrimonio ≥ $1.000.000 en valores del 2000 (normal) | 5–20 % | 13,6 % |
| Con antecedentes (normal, `crimeChance` 0,08) | ≤ 25 % | 20 % |
| Con antecedentes (crimen) | ≥ 40 % | 83,6 % |
| Con hijos (familia) | ≥ 40 % | 45 % |
| Casadas (familia) | ≥ 18 % (el bot propone el 30 % de los años elegibles) | 22 % |
| Eventos que dominan (> 5 % de los disparos) | ninguno | ninguno |
| Eventos sin disparos (1.000 vidas) | solo `dyn.*` y `law.*` | 8 (`dyn.*` y `hist.rock_nace`, ya corregido) |

`engine/balance.bands.test.ts` verifica estas bandas con 100–150 vidas y tolerancia amplia. Los ajustes hechos están en `docs/balance/CALIBRACION.md` y los informes en `docs/balance/`.

## Puntos de extensión frecuentes

| Quiero… | Tocar |
|---|---|
| Un evento nuevo | `content/events/*.ts` + `content/scenes.ts` (si no cae en una escena por etiqueta) |
| Una actividad / acción con personas | `content/activities.ts` / `personActions.ts` + escena en `content/scenes.ts` |
| Una condición o efecto nuevo | `engine/types.ts` (unión), `conditions.ts` / `effects.ts`, `content/dsl.ts` y un test |
| Una carrera | `content/careers.ts` (+ eventos de sector con `c.sector()`) |
| Un escenario | `content/scenarios.ts` (test existente recorre todos) |
| Una escena ilustrada | `ui/art/props.tsx` (piezas) + `ui/art/Scene.tsx` (definición) + `SCENE_KEYS` en `content/scenes.ts` |
