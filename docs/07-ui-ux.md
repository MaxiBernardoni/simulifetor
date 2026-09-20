# 07 · UI / UX

## Estilo
- **Minimalista pero atractivo**: fondo oscuro suave (con modo claro opcional), tipografía legible, una paleta de acento, mucho aire.
- **Íconos vectoriales** consistentes (Phosphor/Lucide), no emojis.
- Barras/anillos de progreso para stats, con color por estado (verde/amarillo/rojo).
- Tarjetas para eventos y decisiones; transiciones cortas.
- Sonidos de interfaz mínimos (clic, envejecer, notificación de evento, muerte). Se pueden desactivar.
- **Avatar dibujado con SVG** (actualizado tras probar el MVP): en la creación se elige nombre, apellido, género, color de piel, color de ojos, peinado (8) y color de pelo, con botón Aleatorio. El avatar se muestra en la pantalla de vida y en el resumen de muerte.

## Navegación (tabs inferiores)
1. **Vida** — feed del historial + botón **Envejecer** + stats compactos.
2. **Actividades** — menú por categorías (salud, ocio, dinero, crimen, etc.).
3. **Trabajo/Estudio** — ocupación actual, ascensos, escuela.
4. **Relaciones** — familia, amigos, pareja, hijos; acciones por persona.
5. **Activos** — dinero, propiedades, deudas.
6. **Más** — logros, legado/árbol, ajustes, ranuras de guardado.

## Pantallas clave
- Inicio: continuar / nueva vida / dinastía / escenarios / ajustes.
- Crear personaje: aleatorio o personalizado (nombre, género, país genérico, modo).
- Evento con decisión: modal a pantalla parcial con texto y botones.
- Muerte y resumen: causa, edad, patrimonio, logros, familia, botón elegir heredero.
- Árbol genealógico.
- Ajustes: sonido, tema, texto, backup, clave de IA (opcional).

## Principios UX
- Todo alcanzable con el pulgar (acciones abajo).
- Nunca perder progreso: autoguardado por año.
- Feedback inmediato de cambios de stat (+/- flotante).
- Una mano, sesiones cortas.
