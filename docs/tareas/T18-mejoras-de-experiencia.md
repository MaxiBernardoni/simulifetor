# T18 · Mejoras de experiencia (lote chico)

- **Prioridad / esfuerzo:** media / M en total (cada punto es S–M)
- **Depende de:** —
- **Autonomía:** ✅ segura
- **Estado:** todo

Ideas aprobadas por Max el 21/09/2026 (vibración, ficha de persona, pantalla de muerte, IA, vida del día sin apuro, instalación como app y origen de los cambios). Se pueden hacer por separado.

1. **Vibración (haptics)** con `expo-haptics` (`npx expo install expo-haptics`): al envejecer, resultados buenos/malos, logros. Apagable. En web no hace nada.
2. **Ficha de persona desde el historial:** tocar el nombre de alguien en un texto abre su ficha (relación, edad, cercanía, acciones). Requiere que el log guarde el `personId`.
3. **Pantalla de muerte mejor:** epitafio, línea de tiempo con los momentos clave, gráfico de felicidad a lo largo de la vida y botón de compartir (texto).
4. **IA:** indicador de "pensando…" en la continuación y reintento con un toque si falla; exigir en el prompt que aclare la relación cuando nombra a alguien.
5. **Vida del día** (sin apuro): semilla derivada de la fecha para jugar la misma vida y comparar puntaje.
6. **Instalación como app** (ver T13): service worker para abrir sin conexión y ícono propio. En iPhone funciona con "Agregar a inicio", pero los datos de la app instalada están separados de los de Safari (hay que exportar/importar la partida una vez).
7. **Origen de los cambios** (aprobado): tocar un chip (−4, −$4.869) muestra qué lo causó ("Felicidad −4: Estalla la burbuja −3, Gripe −1"). Requiere guardar en `lastDelta` el título del evento de cada cambio.

## Criterios de aceptación
- [ ] `npm run check` en verde y tests por punto que toque el motor; UI verificada a 375×812; docs y `CHANGELOG.md`.
