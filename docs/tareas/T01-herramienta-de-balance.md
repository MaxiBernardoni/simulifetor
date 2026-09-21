# T01 · Herramienta de balance y calibración

- **Prioridad / esfuerzo:** alta · L
- **Depende de:** T02 (invariantes)
- **Autonomía:** ✅ segura (los cambios de constantes deben ser conservadores y quedar documentados)
- **Estado:** review

## Objetivo
Convertir las mediciones ad hoc (tests temporales `_probe.test.ts`) en un **comando permanente** que produzca un informe de balance, definir **bandas objetivo** documentadas y calibrar el juego para que caiga dentro de ellas. Sin esto, cada evento nuevo puede romper la economía o la esperanza de vida sin que nadie lo note.

## Contexto
- Fórmulas y constantes actuales: `docs/10-motor-y-formulas.md` (mortalidad, economía, salud, eventos por año).
- `src/engine/autoplay.ts` (`autoPlay`, `tidyAfterSimulation`), `src/engine/sim.ts`.
- Mediciones ya conocidas (300 vidas, bot sin crimen): esperanza de vida ≈ 73; mediana de patrimonio ≈ $225.000; ~16 % supera $1.000.000; quiebras ≈ 27 % con el bot aleatorio.

## Requisitos
1. Agregar `tsx` como devDependency y crear `scripts/balance.ts` (script npm `balance`) con opciones `--n=1000 --seed=1 --profile=normal|crimen|familia|pasivo --json`. Perfiles = configuraciones de `autoPlay` (`crimeChance`, `activityChance`, `familyBias`).
2. El informe (Markdown a consola y, con `--out`, a `docs/balance/AAAA-MM-DD-<perfil>.md`) incluye:
   - Esperanza de vida (media, p10/p50/p90), edades de muerte en histograma de 10 años y **causas de muerte** (%).
   - Patrimonio neto final (p10/p50/p90) y % de vidas: quiebra, millonarias (> $1.000.000), con antecedentes, casadas, con hijos, con título universitario, con casa, presas alguna vez.
   - **Uso del contenido**: para cada evento, cuántas veces se disparó por 1.000 vidas; lista de eventos que **nunca** se disparan (candidatos a revisar condiciones/peso) y de los que dominan (> 5 % de todos los disparos).
   - Eventos por año (media por franja de edad) y proporción de resultados buenos/malos (por el signo de felicidad+salud).
   - Rendimiento: ms por año y por vida completa.
3. **Bandas objetivo** (documentarlas en `docs/10-motor-y-formulas.md` y dejar un test `balance.bands.test.ts` con una muestra chica, 150 vidas, que las verifica con tolerancia amplia; la muestra grande queda en el script):
   - Esperanza de vida media 70–79 años; p10 ≥ 45.
   - Quiebras ≤ 20 % en el perfil `normal`; millonarias 5–15 %.
   - Con antecedentes ≤ 12 % en `normal` (con `crimeChance` 0,08) y ≥ 40 % en `crimen`.
   - Casadas ≥ 45 % y con hijos ≥ 40 % en `familia`.
   - Ningún evento representa > 6 % de los disparos; ≤ 10 % de los eventos con 0 disparos en 2.000 vidas (los "históricos" por año quedan exceptuados si el rango de nacimiento no los alcanza).
4. **Calibración**: si el perfil `normal` cae fuera de una banda, ajustar **una constante por vez** (mortalidad, gastos, impuestos, salarios de una carrera, pesos de eventos), repetir la medición y registrar cada ajuste (antes/después) en `docs/balance/CALIBRACION.md` y en `docs/10`. Cambios pequeños (≤ 15 % por constante). No cambiar la mecánica, solo números.
5. Revisar los eventos "muertos" o dominantes: corregir condiciones/pesos de los que sean errores evidentes y listar el resto en el reporte para revisión humana.

## Criterios de aceptación
- [ ] `npm run balance -- --n=500 --profile=normal` corre en < 60 s y genera el informe.
- [ ] Los perfiles cumplen las bandas (o hay una justificación escrita por banda incumplida).
- [ ] `npm run check` verde (incluye el test de bandas con muestra chica y semilla fija).
- [ ] Sin cambios de esquema de partida.
- [ ] `docs/10-motor-y-formulas.md` con las constantes vigentes; `docs/balance/` con el primer informe.

## Fuera de alcance
Agregar contenido (T03), cambiar la estructura de los sistemas, tocar la IA o la UI.

## Riesgos
- Sobreajustar al bot: recordar que el bot elige al azar; el objetivo es detectar roturas, no simular a un humano. Usar tolerancias amplias.
- Los tests estadísticos pueden ser inestables: semilla fija y tolerancias; nunca depender de `Date.now()`.
