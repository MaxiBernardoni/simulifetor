# 04 · Contenido y eventos

El juego es un **motor + datos**. Casi todo el contenido son eventos declarativos.

## Formato de un evento (TypeScript)
```ts
interface GameEvent {
  id: string;                    // "school.cheat_exam"
  title: string;
  text: string;                  // admite {placeholders}: {name}, {partner}, {boss}, {city}...
  tags: string[];                // ["school","crime"]
  weight: number;                // probabilidad relativa
  minAge?: number; maxAge?: number;
  cooldownYears?: number;        // no repetir antes de N años
  once?: boolean;                // una sola vez por vida
  conditions?: Condition[];      // todas deben cumplirse
  effects?: Effect[];            // si no hay choices
  choices?: Choice[];            // decisiones del jugador
}

interface Choice {
  label: string;
  conditions?: Condition[];      // ej. "necesita dinero >= 500"
  outcomes: Outcome[];           // resultados posibles con probabilidad
}

interface Outcome {
  weight: number;
  text: string;
  effects: Effect[];
}
```

## Condiciones (ejemplos)
```
{ stat: "smarts", op: ">=", value: 60 }
{ has: "job" } / { flag: "criminal_record" }
{ age: { between: [18, 30] } }
{ money: { gte: 1000 } }
{ relationship: "partner", exists: true }
{ era: "1980-1999" }
{ chance: 0.15 }
```

## Efectos (ejemplos)
```
{ stat: "happiness", add: -10 }
{ money: { add: -500 } }
{ setFlag: "expelled" }
{ addRelationship: { type: "friend", trait: "rebel" } }
{ startDisease: "flu" }
{ log: "..." }                   // texto extra al historial
{ die: "cause.overdose" }
{ trigger: "event.id" }          // encadena eventos
```

## Efectos y condiciones agregados en la Fase 2
- Eventos con persona objetivo: `target: 'friend' | 'partner' | ...` (el motor elige a alguien que cumpla las condiciones, y `{target}` en el texto es esa persona).
- Efectos: `arrest(crimen, min, max)` abre un juicio; `sentence('full'|'half'|'double'|'probation'|'none')` lo resuelve; `remove(who)`, `loseAsset`, `invest`, `parole`.
- Condiciones: `trial`, `asset('house'|'car')`, `invested`, `loan`.
- Placeholder `{crime}` disponible durante un juicio.

## Ejemplo completo
```json
{
  "id": "school.cheat_exam",
  "title": "Examen difícil",
  "text": "Mañana tenés un examen y no estudiaste nada. Un compañero te ofrece una torta.",
  "tags": ["school"],
  "weight": 10,
  "minAge": 12, "maxAge": 18,
  "choices": [
    { "label": "Copiarte", "outcomes": [
      { "weight": 6, "text": "Sacás un 9. Nadie se entera.", "effects": [{"stat":"smarts","add":-1}] },
      { "weight": 4, "text": "Te cazan. Llaman a tus padres.", "effects": [{"stat":"happiness","add":-8},{"setFlag":"cheater"}] }
    ]},
    { "label": "Hacerte el enfermo", "outcomes": [
      { "weight": 10, "text": "Zafaste, por ahora.", "effects": [{"stat":"happiness","add":2}] }
    ]}
  ]
}
```

## Cómo se elige qué pasa cada año
1. Filtrar eventos por edad, condiciones, cooldown y `once`.
2. Sortear ponderando `weight` (los stats/flags pueden modificar el peso).
3. Máximo N eventos por año (varía por edad).
4. Eventos "obligatorios" (cumpleaños, comienzo de escuela, jubilación) se disparan por reglas del sistema.

## Organización
```
content/events/
  childhood/  school/  work/  love/  family/  crime/
  health/  money/  fame/  random/  historical/
```
Objetivo de cantidad para un MVP jugable: ~150 eventos. Meta a mediano plazo: 800+.

## Guía de escritura
- Segunda persona ("Te llaman…"), tono seco y ácido, frases cortas.
- Cada evento debe tener al menos una opción con riesgo real.
- Variantes por edad/contexto para evitar repetición.
- Evitar chistes que dependan de lo real y actual: el país es genérico.
- Regla fija: sin contenido sexual con menores.

## Validación
Todos los archivos de contenido pasan por esquemas **Zod** al arrancar en desarrollo; un test recorre todos los eventos y avisa de ids duplicados, referencias rotas (`trigger`), y condiciones inválidas.


---

# Referencia completa del DSL de contenido (estado actual)

Se importan desde `src/content/dsl.ts`: `c` (condiciones) y `fx` (efectos).

## Condiciones (`c.*`)

| Función | Significado |
|---|---|
| `stat(stat, op, valor)` | Stat `happiness`/`health`/`smarts`/`looks` con `>=`, `<=`, `>`, `<` |
| `age(min, max)` / `year(min, max)` | Edad / año calendario, inclusivo |
| `flag(f)` / `noFlag(f)` | Bandera de la vida |
| `moneyGte(n)` / `moneyLte(n)` | Dinero mayor/menor o igual |
| `job()` / `noJob()` / `sector(s)` | Con/sin trabajo; sector del trabajo (`comercio`, `salud`, `legal`, `tecnología`…) |
| `perf(min?, max?)` | Rendimiento laboral |
| `edu(n)` | Nivel de estudios ≥ n (0 nada, 1 primaria, 2 secundaria, 3 universidad) |
| `enrolled()` / `notEnrolled()` | Cursando o no |
| `has(kind)` / `hasNot(kind)` | Hay/no hay alguien vivo de ese tipo: `mother father sibling friend partner child ex` |
| `married()` / `single()` | Pareja casada / no |
| `chance(p)` | Probabilidad (0–1) |
| `jailed()` / `free()` | Preso / libre |
| `tClose(min?, max?)` / `tLove(min?, max?)` / `tAge(min?, max?)` | Amistad / amor (bloqueado = no cumple) / edad de la **persona objetivo** (eventos con `target`, acciones con personas) |
| `wealth(...n)` | Clase social 1–3 |
| `trial()` | Hay un juicio pendiente |
| `asset('house'|'car')` | Tiene ese bien |
| `invested(min?, max?)` / `loan()` | Inversiones / tiene préstamo |

## Efectos (`fx.*`)

`hap/hea/sma/loo(n)` (stats), `money(n)`, `moneyPct(p)`, `flag(f)` / `unflag(f)`, `add(kind, 'baby'|'peer'|'young')` (persona nueva), `close(who, n)` (amistad; `who` = `'target'` o un tipo), `love(who, n)` (amor; lo desbloquea si es positivo), `bond(who, amistad, amor)` (ambos a la vez), `becomes(who, kind)`, `marry()`, `remove(who)`, `perf(n)`, `gpa(n)`, `raise(mult)`, `fired()`, `jail(min, max)`, `parole(años)`, `arrest(crimen, min, max)`, `sentence('full'|'half'|'double'|'probation'|'none')`, `loseAsset('house'|'car')`, `invest(n)`, `die(causa)`, `log(texto)`, `trigger(idEvento)`.

## Acciones con personas: categorías, niveles y rotación

- Cada `PersonAction` pertenece a una categoría (`ACTION_CATEGORY` en `content/personActions.ts`; hay un test que exige que todas tengan una): amistad, humor, amor, pareja, conflicto, plata, paz. La ficha de la persona las agrupa con su encabezado.
- `rotate: true`: cada año solo se ofrece una parte (60 %) de la acción; `risk: n`: rastro de infidelidad con la pareja oficial si la persona objetivo es otra.
- Niveles: las acciones se desbloquean con `c.tClose(n)` (amistad) y `c.tLove(n)` (amor). Cada resultado usa `fx.close`, `fx.love` o `fx.bond` con cantidades distintas según la reacción de la otra persona.
- Eventos de amistad, amor y enemistad con una persona: `content/events/bonds.ts` (los de enemistad usan `c.tClose(undefined, -1)`).

## Campos de `GameEvent`

`id` (único, `categoria.nombre`), `title`, `text` (admite placeholders), `tags`, `weight` (default 10), `cooldown` (años, default 4), `once`, `target` (`PersonKind`: elige a alguien que cumpla las condiciones y `{target}` es esa persona), `conditions`, `effects` (sin decisiones) o `choices` (`label`, `conditions?`, `outcomes[{ weight?, text, effects? }]`).

Etiquetas con significado especial: `historical` (siempre se dispara al cumplirse, no cuenta en el cupo anual), `court` (solo por `trigger`), `jail` (solo estando preso; el resto solo estando libre), `dynasty`. Las etiquetas también eligen ícono y escena por defecto (`content/icons.ts`, `content/scenes.ts`).

## Placeholders de texto

`{name}` (vos), `{mother} {father} {sibling} {friend} {partner} {ex} {child}` (primero vivo de ese tipo), `{boss}`, `{job}`, `{crime}` (durante un juicio), `{target}` (persona objetivo). Las personas se rellenan con su relación la primera vez que aparecen en un texto ("Marcos (tu amigo)", "Ricardo (tu jefe)"; `relationLabel` en `engine/text.ts`); si el texto ya dice la relación ("Tu madre {mother}") va solo el nombre. No hace falta aclararla a mano.

## Al agregar contenido

1. Escribí en voseo, seco y ácido. 2. Toda decisión con riesgo real. 3. Asigná escena (`content/scenes.ts`, si no la da la etiqueta). 4. `npm run check`. 5. Actualizá el conteo en `CHANGELOG.md` si es un lote grande.


## Eras y contenido histórico

- Los eventos históricos viven en `content/events/history.ts` (helper `H(id, título, desde, hasta, texto, efectos, extra)`): `tags: ['historical']`, `once`, `weight: 1000`, condición de año. Son genéricos: nada de países, partidos ni personas reales.
- Para contenido que depende de la época usá `c.tech('internet')`, `c.law('servicio_militar')` o `c.era('90s')`; un test verifica que un evento con `c.year` no pida tecnología que aún no existe en su rango.
- Los montos en `fx.money(n)` y los `$` de los textos se escriben en **valores del 2000**; el motor los escala por época.
- Carreras con `since`/`until`; actividades con `tech`.
