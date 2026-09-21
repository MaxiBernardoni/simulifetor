# T17 · Relaciones con doble medidor (amistad y amor) e infidelidad

- **Prioridad / esfuerzo:** alta / XL (dividir en hitos)
- **Depende de:** —
- **Autonomía:** ⚠️ cambia el esquema de `Person` y las reglas de pareja; revisar antes de unir
- **Estado:** todo

## Objetivo
Reemplazar el único medidor de cercanía por dos, al estilo Los Sims 4: **amistad** (siempre visible) y **amor** (oculto hasta que una acción lo desbloquea). Si la amistad cae mucho pasa a negativo y la persona se vuelve **mala onda** (enemigo). Permite varios amoríos a la vez y la posibilidad de que la pareja oficial se entere y acuse de infidelidad.

## Diseño propuesto (defaults; ajustar con Max)
- **Amistad:** de −100 a 100 (hoy `closeness` 0–100). Por debajo de −30 la persona es "mala onda": aparecen eventos de hostilidad y ya no acepta acciones amistosas.
- **Amor:** `romance?: number` (0–100). `undefined` = bloqueado. Se desbloquea con acciones (coquetear, salir, beso) si hay amistad mínima (≥ 30), ambos son adultos y no son parientes de sangre.
- **Pareja oficial:** la persona con `kind: 'partner'`; sigue siendo una sola. Los otros vínculos amorosos son "amoríos" (`romance` > 0 sin ser `partner`). Un amorío puede pasar a pareja si no hay pareja oficial, o reemplazarla tras cortar.
- **Infidelidad:** acciones de riesgo (beso, sexo, alto nivel de amor con un tercero) suman "rastro" a la pareja oficial. Cada año hay probabilidad de que se entere según rastro, cercanía de sus círculos y azar. Consecuencias: pelea, caída de amistad y amor, ruptura o divorcio; el tercero también reacciona.
- **Contenido:** solo adultos (≥ 18) participan de acciones románticas o sexuales. Nunca con menores (regla fija de `CLAUDE.md`).

## Contexto (archivos que hay que leer/tocar)
- `src/engine/types.ts` (`Person`, efecto `relation`), `engine/effects.ts` (línea del efecto `relation`), `engine/ageUp.ts` (desgaste de cercanía, cortes), `engine/people.ts`, `engine/materialize.ts`, `engine/invariants.ts`.
- `content/personActions.ts` (acciones por persona), `content/events/love.ts` y `relationships.ts` (eventos con `target`).
- `ui/screens/PeopleScreen.tsx` (medidores), `ui/components.tsx`.
- `engine/life.ts` (`migrateLife`) y `SCHEMA_VERSION`: `closeness` → `friendship`; sumar `romance` opcional.

## Requisitos (hitos)
1. **Modelo y migración:** `friendship` (−100..100) y `romance?`; migrar partidas viejas (`friendship = closeness`; la pareja actual arranca con `romance = closeness`). Actualizar condiciones (`targetCloseness` → amistad) y el árbol/`materialize`.
2. **UI:** en cada persona, barra de amistad y, si está desbloqueada, barra de amor. Etiqueta "mala onda" cuando es negativa.
3. **Acciones:** amistosas (suben amistad), románticas (desbloquean y suben amor), y de riesgo. Condiciones de edad y parentesco.
4. **Varios amoríos** simultáneos y su relación con la pareja oficial.
5. **Infidelidad:** rastro, descubrimiento, consecuencias y eventos de confrontación; tercero que también reacciona.
6. **Balance:** perfil "familia" y "crimen" sin romper las bandas de `docs/10`.

## Criterios de aceptación (verificables)
- [ ] `npm run check` en verde; migración con test (partida vieja carga y conserva vínculos).
- [ ] Tests: amor bloqueado hasta cumplir condiciones; menores y parientes nunca acceden a amor; amistad < −30 ⇒ mala onda; infidelidad detectable y con consecuencias; invariantes con las nuevas variables.
- [ ] UI verificada a 375×812.
- [ ] Docs: `docs/10`, `docs/11`, `docs/04`, `CHANGELOG.md`.

## Fuera de alcance
- NPCs persistentes fuera de la familia (T07).

## Riesgos y cómo mitigarlos
- Rompe partidas: migración + test. Rompe el balance: correr `npm run balance` antes y después.
- Contenido sexual: siempre adultos; mantener el tono de humor negro de siempre.
