# 03 · Game design

> **Estado de implementación (20/09/2026).** Todo lo descrito abajo como base está hecho salvo: fama, enfermedades/adicciones detalladas, negocios propios, mascotas con sistema propio, sonidos y la capa de IA (ver `docs/tareas/`). Números y fórmulas exactas: `docs/10-motor-y-formulas.md`. Sistemas agregados durante las pruebas: escenarios, ranuras, copia de seguridad, **árbol genealógico jugable** y cambio de personaje (`docs/06`).

## Ciclo de juego
1. Pantalla principal: **historial de la vida** (feed de texto por año) + stats + botón **Envejecer**.
2. Al envejecer: sube la edad, se aplican cambios pasivos (salud, salario, intereses, envejecimiento de NPCs) y se sortean 0–3 **eventos**.
3. Eventos con decisión detienen el avance hasta elegir. Los sin decisión se anotan en el feed.
4. Entre años, el jugador puede usar el menú de **Actividades** (limitadas por año en ciertos casos).
5. Se repite hasta la muerte → pantalla de resumen → elegir heredero / nueva vida.

## Stats principales (0–100)
| Stat | Rol |
|---|---|
| Felicidad | Baja → depresión, malas decisiones, eventos negativos. En 0 sostenido puede llevar a crisis. |
| Salud | En 0 = muerte. Afectada por edad, enfermedades, vicios, accidentes. |
| Inteligencia | Rendimiento escolar, acceso a carreras, ciertos eventos. |
| Apariencia | Relaciones, ciertos trabajos, fama. |

Stats secundarios (ocultos o visibles según sistema): Carisma, Karma/Moral, Reputación, Estrés, Condición física, Adicciones.
Stats iniciales influenciados por genética (padres) y nivel socioeconómico de la familia.

## Sistemas (base BitLife)
### Nacimiento y familia
- Se genera país, familia (padres, hermanos, estrato económico), nombre, género, rasgos.
- Opción de nombre/género propios o aleatorios.

### Infancia y escuela
- Primaria, secundaria; notas, amigos, bullying, conducta, castigos.
- Universidad/carrera con costo, becas, deuda estudiantil, abandono.

### Trabajo y carrera
- Trabajos por sector con niveles, salario, rendimiento, ascensos, despidos.
- Rendimiento afecta ascensos; acciones como pedir aumento, trabajar extra, hacer favores/romper reglas.
- Emprendimientos y negocios propios (fase posterior).

### Relaciones
- Familia, amigos, parejas, ex, hijos, rivales.
- Cada NPC tiene: nombre, edad, rasgos, relación (0–100), historia compartida.
- Acciones: conversar, salir, regalar, pelear, pedir plata, romper, casarse, tener hijos, infidelidad, divorcio.
- Contenido adulto sin límites en relaciones entre adultos.

### Actividades (menú)
Gimnasio, médico, terapia, estudiar, salir de fiesta, viaje, casino, apuestas, sustancias, tatuajes/cirugía estética, mascotas, religión, etc.

### Dinero y propiedades
- Ingresos, gastos fijos, deudas, intereses, impuestos.
- Casa, auto, inversiones, herencia, quiebra.

### Crimen y justicia
- Delitos menores a mayores (hurto, estafa, drogas, violencia, crimen organizado).
- Probabilidad de ser atrapado según habilidad/contexto; juicio, abogado, sobornos, cárcel (peleas, fugas), antecedentes que bloquean trabajos.

### Salud
- Enfermedades (comunes, crónicas, graves), adicciones, accidentes, salud mental, tratamientos y costo.
- Muerte por causas variadas (con humor negro) y reanimación/"casi muerte" opcional.

### Fama (fase posterior)
Música, actuación, deporte, política, influencer; niveles de fama y escándalos.

### Logros
Lista de logros desbloqueables que persisten en el `World`.

## Azar y balance
- Cada evento tiene **peso** y **condiciones**; el motor sortea ponderando.
- Nada es 100% determinista: stats modifican probabilidades, no las garantizan.
- Ajuste de dificultad: por defecto "realista con caos"; ajuste para "modo fácil".

## Modos de juego
1. **Sandbox**: vida libre.
2. **Escenarios/Desafíos**: objetivos con condición de victoria (ej. "llegar a presidente", "morir millonario", "sobrevivir sin trabajar"), con restricciones de inicio.
3. **Dinastía**: continuar con heredero (ver doc 06).

## Escenarios (Fase 3)
Desafíos con objetivo y tiempo límite. Algunos empiezan a una edad mayor (se genera el pasado automáticamente) y con condiciones especiales (ej. empezar preso). Están definidos en `src/content/scenarios.ts`; el estado (activo/superado/fallado) vive en `Life.scenario`.

## Muerte y herencia
- Causas: vejez, enfermedad, accidente, crimen, suicidio (tratado con cuidado, sin instrucciones ni detalles), etc.
- Al morir: resumen de vida (edad, patrimonio, logros, familia), puntaje/legado.
- Elegir heredero entre hijos/parientes: hereda parte del dinero y propiedades, apellido/reputación, y arranca a la edad que corresponda (o desde niño).
