# T17 · Relaciones con doble medidor (amistad y amor) e infidelidad

- **Prioridad / esfuerzo:** alta / XL (dividir en hitos)
- **Depende de:** —
- **Autonomía:** ⚠️ cambia el esquema de `Person` y las reglas de pareja; revisar antes de unir
- **Estado:** review (hitos 1–5 hechos; queda el balance fino del hito 6)

## Objetivo
Reemplazar el único medidor de cercanía por dos, al estilo Los Sims 4: **amistad** (siempre visible) y **amor** (oculto hasta que una acción lo desbloquea). Si la amistad cae mucho pasa a negativo y la persona se vuelve **mala onda** (enemigo). Permite varios amoríos a la vez y la posibilidad de que la pareja oficial se entere y acuse de infidelidad.

## Diseño (acordado con Max el 21/09/2026)
- **Amistad:** de −100 a 100 (hoy `closeness` 0–100). Por debajo de −30 la persona es "mala onda": eventos de hostilidad y ya no acepta acciones amistosas.
- **Amor:** `romance?: number` (0–100). `undefined` = bloqueado. Se desbloquea cuando la **amistad llega a la mitad o más (≥ 50)** y ambos son adultos.
- **Acciones por niveles:** cada acción (amistosa o amorosa) tiene un umbral de amistad y/o de amor para aparecer. Ejemplo: coquetear (amistad ≥ 50), cita (amor ≥ 15), beso (amor ≥ 35), sexo (amor ≥ 55). Para acceder a las de arriba hay que subir el amor o la amistad.
- **La otra persona reacciona:** cada acción tiene resultados con peso (bien o mal) que dependen de los niveles actuales. Si reacciona bien suben sus barras (amistad y/o amor); si reacciona mal bajan (puede llegar a "mala onda"). Ambas barras varían según la reacción.
- **Variedad por año:** de todas las acciones desbloqueadas con una persona, cada año se ofrece un subconjunto al azar (p. ej. 4–6). Se calcula de forma determinista con la semilla de la vida + el año + la persona (no hace falta guardar estado) para que la lista no cambie al reabrir la pantalla.
- **Familia:** también se puede fomentar amistad y amor con parientes, con **todos los involucrados adultos (≥ 18)**. Los menores nunca acceden a acciones románticas ni sexuales (regla fija de `CLAUDE.md`).
- **Pareja oficial:** la persona con `kind: 'partner'`; sigue siendo una sola. Los otros vínculos amorosos son "amoríos" (`romance` > 0 sin ser `partner`). Un amorío puede pasar a pareja si no hay pareja oficial, o reemplazarla tras cortar.
- **Infidelidad:** las acciones de riesgo (beso, sexo, mucho amor con un tercero) suman "rastro" a la pareja oficial. Cada año hay probabilidad de que se entere según rastro y azar. Consecuencias: pelea, caída de amistad y amor, ruptura o divorcio; el tercero también reacciona.
- **Tono:** humor negro de siempre; solo adultos.

## Contexto (archivos que hay que leer/tocar)
- `src/engine/types.ts` (`Person`, efecto `relation`), `engine/effects.ts` (línea del efecto `relation`), `engine/ageUp.ts` (desgaste de cercanía, cortes), `engine/people.ts`, `engine/materialize.ts`, `engine/invariants.ts`.
- `content/personActions.ts` (acciones por persona), `content/events/love.ts` y `relationships.ts` (eventos con `target`).
- `ui/screens/PeopleScreen.tsx` (medidores), `ui/components.tsx`.
- `engine/life.ts` (`migrateLife`) y `SCHEMA_VERSION`: `closeness` → `friendship`; sumar `romance` opcional.

## Requisitos (hitos)
1. **Modelo y migración:** `friendship` (−100..100) y `romance?`; migrar partidas viejas (`friendship = closeness`; la pareja actual arranca con `romance = closeness`). Actualizar condiciones (`targetCloseness` → amistad) y el árbol/`materialize`.
2. **UI:** en cada persona, barra de amistad y, si está desbloqueada, barra de amor. Etiqueta "mala onda" cuando es negativa.
3. **Acciones:** amistosas y románticas por niveles (umbrales de amistad/amor), con reacción buena o mala de la otra persona, y las de riesgo. Rotación anual determinista. Condiciones de edad (todos adultos, también entre familia).
4. **Varios amoríos** simultáneos y su relación con la pareja oficial.
5. **Infidelidad:** rastro, descubrimiento, consecuencias y eventos de confrontación; tercero que también reacciona.
6. **Balance:** perfil "familia" y "crimen" sin romper las bandas de `docs/10`.

## Criterios de aceptación (verificables)
- [ ] `npm run check` en verde; migración con test (partida vieja carga y conserva vínculos).
- [ ] Tests: amor bloqueado hasta amistad ≥ 50; cada acción respeta su umbral; la oferta anual es determinista y varía entre años; adultos parientes sí, si alguno es menor nunca; amistad < −30 ⇒ mala onda; infidelidad detectable y con consecuencias; invariantes con las nuevas variables.
- [ ] UI verificada a 375×812.
- [ ] Docs: `docs/10`, `docs/11`, `docs/04`, `CHANGELOG.md`.

## Fuera de alcance
- NPCs persistentes fuera de la familia (T07).

## Riesgos y cómo mitigarlos
- Rompe partidas: migración + test. Rompe el balance: correr `npm run balance` antes y después.
- Contenido sexual: siempre adultos; mantener el tono de humor negro de siempre.

## Progreso
- ✅ **Hito 1 · Modelo y migración** (21/09/2026): `friendship` (−100..100) y `romance?`; `SCHEMA_VERSION` 5; migración de partidas y de las vidas de los bots; condiciones `targetFriendship`/`targetRomance`; efectos `friendship`/`romance` (el amor exige adultos).
- ✅ **Hito 2 · UI:** barra de amistad y, si está desbloqueada, barra de amor (en la lista y en la ficha); "Mala onda" por debajo de −30; los resultados muestran chips de amistad y amor.
- ✅ **Hito 3 · Acciones por niveles y rotación anual:** 6 amistosas y 8 románticas nuevas (`rotate: true`), con reacciones buenas/malas que mueven las barras cantidades distintas; 60 % de oferta anual determinista; también con familia adulta.
- ✅ **Hito 4 · Varios amoríos:** cualquier persona adulta con amor desbloqueado es un amorío; la acción "Pedirle que sean pareja" (amor y amistad ≥ 60) lo convierte en pareja y la anterior pasa a ser ex.
- ✅ **Hito 5 · Infidelidad:** `Person.suspicion` de la pareja. Los gestos románticos con otra persona suman "rastro" (`risk` de la acción: coquetear 6 … pasar la noche 35); mientras haya un amorío con amor ≥ 40 suma 6 por año y no se olvida (sin amorío baja 8 por año). Con sospecha ≥ 20 hay `sospecha × 0,7` de probabilidad anual de que se entere y se dispara `love.cheat_discovered` (3 decisiones; consecuencias: pelea, ruptura o divorcio con pérdida del 25 %). El tercero (`{lover}` / `fx.*('lover', …)`, `findLover` en `engine/text.ts`: quien tiene más amor sin ser la pareja ni el objetivo) también reacciona en cada decisión: se aleja, o se ilusiona si la pareja se va.
- ✅ **Extra (pedido de Max):** las acciones se agrupan por categoría en la ficha (Amistad, Humor y bromas, Amor y seducción, Pareja y compromiso, Peleas y molestias, Plata, Paces y distancia; `ACTION_CATEGORY` en `personActions.ts`); 15 eventos de amistad, amor y enemistad (`content/events/bonds.ts`); íconos de la barra: amigos abrazados en verde (`ui/FriendIcon.tsx`), espadas en rojo si es enemistad, y barra de amor rosa clarito con corazón. La "mala onda" ahora empieza en amistad **negativa** (antes < −30).
- ⏳ **Hito 6 · Balance fino:** los bots no eligen acciones hostiles ni coquetean con terceros (`BOT_AVOIDS`); las bandas de `docs/10` se mantienen. Falta un perfil de bot que use el amor y la infidelidad para medir su efecto.
- ✅ **Títulos de relación:** `relationTitle` (`engine/relationTitle.ts`) resume amistad, amor, enemistad y parentesco: Neutral, Conocido, Amigo, Mejor amigo, Interés amoroso, Amigo con derechos, Romance / Amante (si hay otra pareja), Mala onda, Enemigo, Némesis, Relación tóxica, Amor-odio, Pareja, Pareja distante, Pareja en crisis, Esposo/a, Alma gemela, Ex, Ex amigable, Ex con cuentas pendientes, Ex enemigo, y para familia: Familiar entrañable / cercano / distante / con mala onda / enemigo, Némesis familiar, Familiar con tensión romántica, Familiar y amante, Familiar: amor-odio. Se muestran en la lista y como etiqueta de color en la ficha.
- ✅ **Catálogo ampliado (pedido de Max):** 12 o más acciones por categoría (unas 100 en total: `personActionsExtra.ts`) y un tope de 6 por categoría a la vez, con las esenciales (`core`) siempre presentes y el resto sorteado cada año. Reemplaza la rotación por acción del hito 3. Los bots solo eligen acciones amistosas (`botSkips` en `autoplay.ts`).

