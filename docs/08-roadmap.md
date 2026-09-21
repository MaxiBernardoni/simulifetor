# 08 · Roadmap

Estado al **20/09/2026**: fases 0–3 y el árbol genealógico jugable están hechos. El detalle de cada entrega está en `CHANGELOG.md`; el backlog pendiente, con especificaciones completas, en `docs/tareas/`.

## ✅ Fase 0 — Diseño
Documentación, decisiones de stack y alcance.

## ✅ Fase 1 — MVP jugable
Proyecto Expo + TypeScript, motor puro con semilla, 4 stats, ~133 eventos, escuela/universidad, trabajo, relaciones básicas, dinero y deudas, crimen y cárcel, muerte y resumen, guardado local, tests de simulación.

## ✅ Fase 2 — Núcleo tipo BitLife (relaciones, carrera/dinero, crimen)
Eventos con personas específicas, acciones con personas, deterioro de vínculos, propiedades/autos/préstamos/inversiones, arrestos con juicio, cárcel con libertad condicional/fuga/reinserción, 25 carreras, 19 logros.
**Pendiente de esta fase**: enfermedades y adicciones detalladas (T04) y sonidos de interfaz (T09).

## ✅ Fase 3 — Dinastía y modos
Escenarios (9), 3 ranuras, copia de seguridad, puntaje de legado, eventos de dinastía.

## ✅ Extras pedidos durante las pruebas
- Creación de personaje con avatar personalizable.
- Estética "simulador de vida" con identidad propia (paleta petróleo/coral/crema), ~110 íconos, avatares por persona, insignias, fondo decorativo.
- 33 escenas SVG animadas por evento, animaciones en toda la UI.
- **Árbol genealógico jugable**: familia viva (bots) y cambio de personaje entre parientes de sangre a ≤ 2 generaciones.

## 🚧 Fase 4 — Mundo e historia (en curso)
- ✅ **Eras**: tecnología, leyes y precios/salarios por época (`content/eras.ts`), carreras y actividades de época, 48 eventos históricos, aviso de cambio de década.
- 🔜 Resto de T05: leyes que cambian probabilidades, pena de muerte, escenas nuevas.
- Capa opcional de **IA** con clave gratuita propia (T06).

## 🔜 Fase 5 — Profundidad
- NPCs persistentes fuera de la familia (amigos, rivales, ex) (T07).
- Fama y nuevas carreras (T08), negocios propios (T10), educación con carreras universitarias (T11).
- Más contenido (meta 800+ eventos) y balance permanente (T03, T01).
- PWA / instalación permanente en el iPhone (T13).

## Calidad transversal
Robustez del motor y pruebas de propiedades (T02), herramientas de balance (T01), calidad de código (T14), ajustes y accesibilidad incl. modo oscuro (T12), onboarding (T15), regla anti-abuso reforzada del árbol (T16).

## Cómo se trabaja
- Cada tarea del backlog es autocontenida y termina con `npm run check` en verde.
- Cambios de esquema de partida ⇒ migración (`docs/11`).
- Cada entrega actualiza `CHANGELOG.md` y los documentos afectados.
