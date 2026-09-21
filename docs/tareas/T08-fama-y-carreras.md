# T08 · Fama y carreras de la fama

- **Prioridad / esfuerzo:** media · L
- **Depende de:** T05 (eras: influencer, streaming, etc.)
- **Autonomía:** ✅ segura
- **Estado:** todo

## Objetivo
Sumar el quinto stat que muestran los simuladores de vida — **Fama** — y las carreras que la usan: músico, actor, deportista, influencer/streamer, escritor y político. Suma decisiones, escándalos y caídas.

## Contexto
- `src/engine/types.ts` (`StatKey`, `Life.stats`), `engine/life.ts` (`createLife`, `migrateLife`), `ui/components.tsx` (`STAT_META`, `LifeStat`), `screens/LifeScreen.tsx` (`STATS`), `content/careers.ts`, `content/events/*`, `content/achievements.ts`, `content/scenes.ts`.
- Carreras hoy: 25 tradicionales sin fama.

## Requisitos
1. **Stat `fame`** (0–100): agregar a `StatKey` y a `Life.stats` (migración: `fame ??= 0`). Barra en la pantalla principal con ícono `Star` (color dorado) **solo si `fame > 0` o el jugador tiene una carrera de fama** (mostrarla siempre haría ruido). La fama **decae** −2/año si no se alimenta, sube con actividades y eventos.
2. **Carreras de la fama** (`Career.fameTrack?: true`): Músico, Actor/Actriz, Deportista profesional, Influencer/Streamer (desde 2008 si existe T05), Escritor/a, Político/a. Cada una con niveles, **salario variable** (`fameSalary`: base × (0,3 + fame/50) con picos), requisitos de entrada distintos (audición/casting, talento = inteligencia/apariencia, edad) y **riesgo de fracaso**: la mayoría no despega (probabilidad de ascenso baja y dependiente de la fama).
3. **Actividades**: "Ensayar", "Ir a audiciones", "Grabar un video", "Dar una entrevista", "Ir a un evento", "Contratar un publicista" (cuesta plata, sube fama), "Escándalo calculado".
4. **Eventos** (≥ 40): oportunidades (una discográfica llama), viralidad, escándalos (fotos, declaraciones), acoso de fans/haters, cancelación, giras, contratos abusivos, lesión de un deportista, elecciones (genéricas: candidatura, campaña, corrupción), retiro. Con escenas (`party`, `tech`, `court`, `money_win`…) y decisiones con riesgo.
5. **Efectos de la fama** sobre el resto del juego: aumenta ingresos, atrae parejas/amigos "interesados", reduce la privacidad (eventos de paparazzi), mejora el trato en el juicio (`court.trial` opción de "abogado famoso") y modifica el legado (`legacyPoints` + fama/4).
6. **Escenarios nuevos**: "Estrella de la nada" (empezar pobre, llegar a fama ≥ 80 antes de los 40) y "Presidente" (llegar al nivel máximo de la carrera política).
7. **Logros** (≥ 6): "Quince minutos de fama", "Disco de oro", "Cancelado", "Candidato", "Presidente", "De la fama a la ruina".
8. Árbol/`NodeSheet`: mostrar fama de los parientes con vida completa.

## Criterios de aceptación
- [ ] `npm run check` verde. Tests: migración de una vida sin `fame`, decaimiento, salario variable acotado, ninguna carrera de fama > 5 % de las vidas del bot normal (balance con T01), escenarios nuevos creables.
- [ ] UI verificada: la barra aparece solo cuando corresponde; sin errores.
- [ ] `docs/03`, `docs/04`, `docs/10`, `docs/11`, `CHANGELOG.md`.

## Fuera de alcance
Redes sociales como sistema (seguidores, plataformas) — la fama es un número simple; política real.

## Riesgos
- Agregar un stat toca UI y tests que iteran `Object.values(stats)` (rango 0–100): ajustarlos.
- Política: mantener partidos, países y líderes genéricos y ficticios.
