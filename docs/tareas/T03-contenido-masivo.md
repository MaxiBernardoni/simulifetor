# T03 · Contenido masivo: +250 eventos, +30 actividades, +10 carreras

- **Prioridad / esfuerzo:** alta (la rejugabilidad depende de esto) · XL — **hacer por lotes** (una corrida = 1–2 lotes)
- **Depende de:** T01 (para medir uso y balance)
- **Autonomía:** ✅ segura (solo datos + escenas + tests)
- **Estado:** todo

## Objetivo
Hoy hay 193 eventos, 34 actividades y 25 carreras. Se repiten pronto. Meta de esta tarea: **450+ eventos**, **65+ actividades**, **35+ carreras**, con variedad por edad, época, clase social, género y estado (pareja, hijos, trabajo, antecedentes), sin romper el balance.

## Contexto
- Formato y DSL: `docs/04-contenido-y-eventos.md` (referencia completa al final).
- Archivos: `src/content/events/*.ts` (por categoría), `activities.ts`, `personActions.ts`, `careers.ts`, `scenes.ts`, `icons.ts`, `dsl.ts`.
- Guía de escritura: segunda persona, humor seco y ácido, frases cortas, voseo; toda decisión con riesgo real; sin chistes atados a hechos reales (país genérico).
- Regla fija: **nada de contenido sexual con menores**; suicidio sin detalles.

## Lotes (cada lote termina con `npm run check` verde y un commit)
| Lote | Contenido | Cantidad |
|---|---|---|
| A | Infancia (0–11) y escuela: familia, mudanzas, juegos, mascotas, miedos, enfermedades leves, primeros amigos, cumpleaños, castigos, vacaciones | 35 eventos |
| B | Adolescencia (12–17): redes/tecnología según año, drogas y alcohol (consecuencias), noviazgo, bullying, deportes, viajes de egresados, primer trabajo, conflictos con padres, decisiones de futuro | 35 eventos |
| C | Adultez temprana (18–30): mudarse, primer departamento, compañeros de piso, fiestas, deudas, trabajos basura, viajes, amores fallidos, redes, vínculos con la familia | 40 eventos |
| D | Trabajo por sector (`c.sector`): comercio, gastronomía, obra, transporte, oficina, salud, legal, tecnología, educación, seguridad, medios, ingeniería, finanzas — 4 eventos por sector; huelgas, jefes, reestructuraciones, accidentes, ascensos | 50 eventos |
| E | Relaciones y familia (con `target`): amigos, parejas, suegros, hermanos, hijos en cada edad, divorcio, viudez, nietos | 40 eventos |
| F | Dinero y casa: alquileres, hipotecas, estafas, herencias, impuestos, inversiones, autos, vecinos | 25 eventos |
| G | Adultez media y vejez (45–100): salud, jubilación, soledad, viajes, memoria, nietos, amigos que se van | 35 eventos |
| H | Azar y sociedad: catástrofes, fiestas populares, elecciones (genéricas), crisis, tecnología, fama de un día | 30 eventos |
| I | +30 actividades (hobbies, deportes, cursos, voluntariado, viajes por tipo, cocina, música, mascotas, terapia de pareja, mudanza, cambio de look) y +10 carreras con sus niveles y 1–2 eventos de sector cada una | 40 + 10 |

## Requisitos por evento
1. `id` único con formato `categoria.nombre` en minúsculas y guion bajo.
2. Al menos **una** de: `conditions` de edad, época (`c.year`), estado (`c.has`, `c.married()`, `c.job()`…) — no eventos "planos" sin condiciones salvo los genéricos.
3. Un tercio de los eventos son **decisiones** (2–3 opciones, resultados con pesos y consecuencias que valgan la pena).
4. Efectos moderados: stats ±1–15, dinero acorde a la escala del juego (salarios $8.000–$150.000; alquiler $7.000/año), sin picos que rompan la economía.
5. **Sin repetición de estructura o chiste**: no más de 2 eventos con el mismo esqueleto ("te ofrecen X, aceptás o no") por lote.
6. Variantes por época cuando corresponda (`c.year(a,b)`): tecnología y costumbres que no existían antes de cierto año.
7. Asignar escena en `content/scenes.ts` si la etiqueta no da una adecuada (o crear una escena nueva solo si hace falta de verdad; ver `docs/10` → "Puntos de extensión").
8. `weight` calibrado: comunes 10–14, raros 3–8, históricos 1000.

## Criterios de aceptación
- [ ] `npm run check` verde. Tests existentes de contenido ya validan ids únicos, `trigger` y escenas.
- [ ] Nuevo test **anti-duplicados**: ningún par de textos de eventos con similitud de Jaccard (por palabras, sin stopwords) > 0,6; ningún `id` repetido.
- [ ] Nuevo test **cobertura por edad**: para vidas "típicas" de cada edad 0–100 (muestreadas por simulación con semilla fija) hay ≥ 3 eventos elegibles distintos en ≥ 95 % de los años.
- [ ] `npm run balance` (si T01 está hecha): ningún evento nuevo > 6 % de los disparos; esperanza de vida y economía siguen dentro de las bandas.
- [ ] Conteos actualizados en `CHANGELOG.md`, `README.md` y `docs/08-roadmap.md`.

## Fuera de alcance
Mecánicas nuevas (usar solo condiciones/efectos existentes; si hace falta una nueva, hacerla como mini-tarea con test aparte), cambios de UI.

## Riesgos
- Tono repetitivo o demasiado negativo: mantener ~50 % de resultados neutros o buenos.
- Frases con género/número mal resueltos: usar formas "/a" como el resto del contenido y `{target}`, `{partner}`, etc.
