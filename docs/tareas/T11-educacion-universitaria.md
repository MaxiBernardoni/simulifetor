# T11 · Carreras universitarias, notas, becas y préstamos estudiantiles

- **Prioridad / esfuerzo:** media · L
- **Depende de:** T04
- **Autonomía:** ✅ segura
- **Estado:** todo

## Objetivo
La universidad hoy es un bloque de 4 años que da "título" (nivel 3). Convertirla en un sistema con **carrera elegida**, notas por año, becas, deuda estudiantil, abandono y posgrados, y que la carrera condicione el trabajo.

## Contexto
- `src/engine/ageUp.ts` (`updateEducation`), `src/engine/actions.ts` (`canEnrollUniversity`, `enrollUniversity`, `dropUniversity`), `src/engine/types.ts` (`Education`), `src/content/careers.ts` (`minEdu`), `src/ui/screens/WorkScreen.tsx`.
- Préstamos: `engine/assets.ts` (`takeLoan`, `loan`).

## Requisitos
1. **Modelo** (campos opcionales; migración con defaults): `Education.major?: string`, `Education.degrees: string[]` (títulos obtenidos), `Education.scholarship?: number` (0–1 de descuento), `Education.studentDebt: number`.
2. **Carreras universitarias** (`content/majors.ts`, ≥ 12): Medicina (6 años), Derecho, Ingeniería, Sistemas, Contabilidad, Arquitectura, Psicología, Educación, Comunicación, Artes, Enfermería, Gastronomía, Ciencias (con investigación). Cada una: duración, costo anual, exigencia de inteligencia mínima, dificultad (afecta el promedio), `unlocks: string[]` (ids de `Career` que habilita) y prestigio.
3. **Inscripción** (UI en Ocupación): elegir carrera (lista con requisitos y cuánto cuesta), **beca** por promedio de la secundaria y clase social (sorteo/mérito), y opción de **préstamo estudiantil** (deuda `studentDebt` con interés 4 %, se paga automáticamente el 8 % del sueldo neto cuando trabajás).
4. **Cursada**: cada año se sortea la nota (función de inteligencia, `gpa`, esfuerzo si el jugador usa "Estudiar más", estrés, pareja/hijos/trabajo simultáneo) con eventos de **examen final, tesis, práctica profesional, cambio de carrera** (decisión: se pierde 1 año) y **abandono** (por notas o por elección). Al graduarse: `degrees.push(major)` y flag `graduated`.
5. **Posgrados**: Maestría (2 años) y Doctorado (4) para quienes ya tienen título afín; suben nivel de carrera y salario.
6. **Carreras (trabajo) dependientes del título**: `Career.requiresMajor?: string[]`; ajustar las 25 actuales (médico → Medicina, abogado → Derecho, etc.) manteniendo compatibilidad: quienes ya tienen `edu.level ≥ 3` sin `major` (partidas viejas) se tratan como "título general" y pueden entrar a las carreras que hoy piden nivel 3.
7. **Contenido**: ≥ 30 eventos universitarios (ingreso, parciales, compañeros, ayudantías, becas, toma de facultad, viaje de estudios, deuda, tesis, egreso), con escena `study`/`graduation`.
8. **Ficha de vida**: la ocupación en la barra muestra "Estudiante de Medicina (3.º)".

## Criterios de aceptación
- [ ] `npm run check` verde. Tests: migración de vidas viejas (nivel 3 sin major), inscripción con/sin beca, deuda estudiantil crece/paga, graduación por carrera desbloquea las carreras correctas, abandono, posgrado, balance (con T01: no más del 35 % de las vidas con título; la deuda estudiantil no genera quiebras en cadena).
- [ ] UI verificada: selección de carrera, beca, préstamo, progreso de la carrera; sin errores.
- [ ] `docs/03`, `docs/04`, `docs/10`, `docs/11`, `CHANGELOG.md`.

## Fuera de alcance
Universidad extranjera/erasmus; sistema de créditos por materia.

## Riesgos
- Romper escenarios (`genius`, `young_millionaire`) que dependen de `edu.level`: actualizar sus `setup`/`won` y los tests.
