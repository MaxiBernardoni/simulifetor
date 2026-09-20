# 08 · Roadmap

## Fase 0 — Diseño (actual)
Documentación, decisiones de stack y alcance.

## Fase 1 — MVP jugable ("unos días") ✅ COMPLETA
Objetivo: vivir una vida completa en el iPhone.
- Proyecto Expo + TypeScript + expo-router, corriendo en Expo Go.
- Motor: estado, RNG con semilla, envejecer, eventos con condiciones/efectos.
- Crear personaje aleatorio (nombre, género, familia simple, **año de nacimiento aleatorio**; el motor filtra contenido por año).
- 4 stats, feed del historial, botón Envejecer.
- ~100–150 eventos (infancia, escuela, trabajo básico, amor, salud, crimen leve, dinero).
- Trabajo simple (algunos empleos con salario) y dinero básico.
- Muerte por vejez/enfermedad/accidente + pantalla de resumen.
- Guardado local con autoguardado.
- Tests del motor y validación de contenido.

## Fase 2 — Núcleo BitLife
Prioridad de sistemas: **1) relaciones, 2) carrera y dinero, 3) crimen y justicia**; el resto después.
- Relaciones completas con NPCs (parejas, hijos, amigos, familia).
- Escuela → universidad, carreras, ascensos.
- Menú de Actividades ampliado.
- Propiedades, deudas, impuestos, herencia.
- Crimen, juicio y cárcel.
- Enfermedades y adicciones.
- Logros.
- Sonidos de UI y pulido visual.

## Fase 3 — Dinastía y modos
- Elegir heredero y continuar con hijo.
- Árbol genealógico y legado.
- Modo escenarios/desafíos.
- Varias ranuras de guardado, exportar/importar.

## Fase 4 — Mundo e historia
- Calendario global y eventos históricos por era.
- Tecnología y leyes que cambian con el tiempo.
- Capa opcional de IA (clave propia gratuita).

## Fase 5 — Profundidad
- NPCs persistentes entre vidas.
- Fama, negocios, política.
- Más contenido (meta 800+ eventos), balance y estadísticas.
- Evaluar publicación (PWA / build permanente en iPhone).

## Cómo trabajamos
- Cada fase se divide en tareas chicas; al final de cada una debe poder probarse en el celu.
- Yo escribo el código y el contenido; vos probás y pedís cambios.
- Se versiona con git (repo propio dentro de esta carpeta).
