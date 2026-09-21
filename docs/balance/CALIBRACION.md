# Calibración del balance

Registro de ajustes hechos a partir de `npm run balance` (T01). Cada fila: qué se midió, qué se cambió y el resultado.

## 2026-09-21 — primera calibración (perfil `normal`, 500 vidas)

| Medición inicial | Valor | Banda | Diagnóstico |
|---|---|---|---|
| Quiebras | 42,6 % | ≤ 15 % | **No era la economía, era el bot**: solo buscaba trabajo el 25 % de los años y pasaba años sin sueldo pagando alquiler |
| Con antecedentes | 49,4 % | ≤ 25 % | El bot elegía al azar opciones que terminan en arresto (`court.blackmail` 65 %, `work.embezzle` 45 %, `crime.dealer_offer` 42 % de las vidas) |
| Con título universitario | 97 % | (T11) | El bot se anotaba en la universidad el 30 % de los años |

Ajustes (todos en `engine/autoplay.ts`; **no se tocó ninguna constante de la economía ni de los eventos**):

1. Si no tiene trabajo, el bot busca uno el 60 % de los años (antes 25 %, y solo si "hacía una actividad" ese año).
2. Las opciones de eventos que terminan en arresto se eligen con la probabilidad de crimen del perfil (`crimeChance`), igual que las actividades criminales.
3. Se anota en la universidad con 10 % por año (antes 30 %).

| Resultado (normal) | Antes | Después |
|---|---|---|
| Quiebras | 42,6 % | 6,4 % |
| Con antecedentes | 49,4 % | 20 % |
| Presos alguna vez | 34,4 % | 12,2 % |
| Millonarias | 10 % | 13,6 % |
| Esperanza de vida | 74,3 | 73,9 |
| Patrimonio p50 (valores del 2000) | $129.349 | $254.400 |

Otros arreglos: `hist.rock_nace` no se disparaba nunca (1955–59 con edad 10–35 y nacimientos desde 1950): ahora 1960–65.

Pendientes para revisión humana: el bot casi no se casa fuera del perfil `familia` (5 % → 22 %) porque solo propone matrimonio con ese sesgo; los `dyn.*` (dinastía) nunca se disparan en vidas sueltas del bot, es esperado.
