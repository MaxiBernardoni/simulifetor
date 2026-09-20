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
