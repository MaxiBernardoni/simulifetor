# 07 · UI / UX

## Estilo (actualizado tras probar el MVP)
- **Estética cercana a los simuladores de vida clásicos** (pedido del usuario): tema claro, barra roja superior con logo propio y contador de logros, barra de personaje con avatar/ocupación/saldo, feed de texto plano con "Edad: N años" en azul, barra azul con botones circulares y el botón verde **Edad** al centro, y stats abajo con barras que cambian de color según el valor. Las demás secciones se abren con barra roja y flecha de volver. No se copian marcas ni logos: el nombre y el wordmark son propios.
- **Muy visual** (pedido tras Fase 2): cada entrada del historial lleva una ficha de ícono con color por categoría (~110 íconos), los modales tienen un ícono grande arriba, las personas tienen avatar propio dibujado, la barra del personaje muestra insignias de estado (pareja, hijos, casa, cárcel…), hay un fondo con íconos tenues y la pantalla de inicio muestra el recorrido de una vida.
- **Ilustraciones por evento y animaciones** (pedido tras Fase 2): 33 escenas vectoriales (SVG) compuestas con piezas reutilizables (`src/ui/art/props.tsx`) y los personajes (tu avatar y la persona involucrada, con expresiones). Cada evento, actividad y acción con personas se asigna a una escena en `src/content/scenes.ts` (por id, o por etiqueta) y se muestra como banner en los modales. Animaciones: nubes que se desplazan, personajes que flotan, partículas (monedas, corazones, confeti, lluvia, fantasmas), entrada con rebote de modales y botones, barras de stats que se llenan, chips que aparecen en cadena, el botón Envejecer que late, el avatar que salta al cumplir años, aviso animado de logros y transición entre pantallas. En Menú hay una **galería de escenas** (solo en desarrollo).
- **Paleta propia** (para diferenciarse): verde petróleo (`#0E7C7B`) en cabeceras y botones, coral (`#E76F51`) en el botón de avanzar, crema (`#FBF7F0`) de fondo y petróleo oscuro (`#12343B`) en la barra de navegación. Íconos propios: trofeo (logros), maletín, alcancía, manos con corazón y grilla para las secciones. Elementos redondeados tipo "squircle" en lugar de círculos, y stats con chip de ícono + etiqueta sobre la barra.
- Antes (descartado): fondo oscuro minimalista.
- **Íconos vectoriales** consistentes (Phosphor/Lucide), no emojis.
- Barras/anillos de progreso para stats, con color por estado (verde/amarillo/rojo).
- Tarjetas para eventos y decisiones; transiciones cortas.
- Sonidos de interfaz mínimos (clic, envejecer, notificación de evento, muerte). Se pueden desactivar.
- **Avatar dibujado con SVG** (actualizado tras probar el MVP): en la creación se elige nombre, apellido, género, color de piel, color de ojos, peinado (8) y color de pelo, con botón Aleatorio. El avatar se muestra en la pantalla de vida y en el resumen de muerte.

## Navegación (hub central; ya no hay tabs inferiores)
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


## Tutorial y ayuda (T15)

- **Primera vida guiada**: al empezar la primera vida (`meta.seenTutorial` en falso) el flujo es `GuidedStartScreen` (1. elegís género con dos botones grandes, 2. elegís entre tres personajes al azar, con "Ver otros tres" y una salida a la creación manual) y después la **guía con globos** (`ui/coach.tsx`, pasos en `COACH_STEPS` de `content/help.ts`): la pantalla se oscurece, un aro coral resalta cada parte (info del personaje, botón Envejecer, stats, barra de navegación, menú) y un globo amarillo la explica, con Atrás / Siguiente / Saltar guía. Al terminar se marca como vista; las vidas siguientes usan el flujo normal. Quien ya tenía partidas guardadas no la ve.
- **Cómo se juega** (Menú → Cómo se juega, `HelpScreen`): secciones plegables (stats y sus bandas, envejecer, actividades, trabajo, dinero, crimen, escenarios, ranuras, árbol, logros) y glosario.
- **Consejos** en la pantalla de muerte (`tipFor`): sugiere algo que la vida no probó (casa financiada, universidad, inversión, hijos, escenarios…).


## Gesto de volver (deslizar)

`ui/SwipeBack.tsx` envuelve las pantallas con botón de volver (creación de vida, pantallas del Menú y el árbol tras la muerte): deslizá hacia la derecha **desde el borde izquierdo** (primeros 32 px) y la pantalla sigue al dedo; si pasás un tercio del ancho o hacés un gesto rápido, vuelve; si no, rebota. Usa `PanResponder` en modo *capture* para ganarle a los scrolls horizontales (el árbol). Las pantallas abiertas desde el Menú (árbol, partidas, copia, IA, ayuda) ahora vuelven al Menú y no a la vida; el resto vuelve a la vida.
