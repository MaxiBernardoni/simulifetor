# Changelog

Historial de cambios de VidaSim, del más reciente al más antiguo. Cada entrada corresponde a un commit (o grupo de commits) de `main`.

## [Familia viva] — árbol genealógico jugable · `32a0edb`

**Nuevo**
- **Mundo familiar compartido** (`engine/world.ts`): cada partida tiene un árbol de `TreeNode` que comparten el mismo año calendario. Cuando el jugador envejece, toda la familia envejece.
- **Dos niveles de simulación**: quienes ya jugaste siguen con una vida completa manejada por un bot (`autoplay.ts`); el resto se simula de forma liviana (edad, pareja, hijos, muerte). Rendimiento medido: ~0,5 ms/año con ~50 personas.
- **Cambio de personaje** entre parientes de sangre vivos a **hasta 2 generaciones** de distancia (`engine/kinship.ts`). Cuñados, suegros, parejas, sobrinos nietos y primos segundos aparecen en el árbol pero bloqueados.
- **Materialización** (`engine/materialize.ts`): al jugar a alguien "liviano" se le genera una vida completa coherente con su edad, padres, hermanos, pareja e hijos reales.
- **Árbol dibujado** (`ui/screens/FamilyTreeScreen.tsx`) al estilo genealógico: parejas unidas por línea, hijos colgando, círculos con avatar y parentesco, anillos de estado, ficha de persona y scroll horizontal centrado.
- Etiquetas de parentesco automáticas (Padre, Tía política, Sobrino segundo, Cuñada…).
- Pantalla de muerte: elegís entre los parientes elegibles; herencia según parentesco (hijos 60–85 %, otros 15 %).
- Persistencia del mundo por ranura (`vidasim.world.N`); las partidas viejas reciben un árbol generado.
- Tests: `world.test.ts` (12) — parentesco, regla de cambio, consistencia de 60 años, materialización, bots.

**Cambios internos**
- `Person.nodeId`, `Life.nodeId`; `personDied()` extraído de `ageUp`; `engine/looks.ts` (aspecto determinístico).
- Se elimina `createHeir` (reemplazado por el árbol).

## [Ilustraciones y animaciones] · `b4b1f71`

- **33 escenas SVG** (`ui/art/Scene.tsx`, `props.tsx`) compuestas con piezas reutilizables y personajes (tu avatar y la persona involucrada, con expresiones feliz/triste/enojado/sorpresa y sombreros). Cada evento, actividad y acción con personas se mapea a una escena (`content/scenes.ts`), y la escena reacciona al resultado.
- Animaciones (`ui/anim.tsx`): nubes que se desplazan, personajes que flotan, partículas (monedas, corazones, confeti, lluvia, destellos, fantasmas), entradas con rebote, chips que aparecen en cadena, barras de stats que se llenan, botón de envejecer que late, avatar que salta al cumplir años, aviso animado de logros, transición entre pantallas.
- Galería de escenas en Menú (solo desarrollo). Tests que garantizan que toda escena referenciada exista.

## [UI muy visual] · `037919e`

- ~110 íconos (mapa explícito en `ui/Icon.tsx`), ficha de ícono con color por categoría en cada entrada del historial, modales con ícono grande, avatares para cada persona, insignias de estado (pareja, hijos, casa, cárcel…), fondo con íconos tenues, pantalla de inicio con el recorrido de una vida.

## [Paleta e identidad propia] · `484ae52`

- Paleta petróleo / coral / crema, botón de avanzar cuadrado redondeado, íconos y formas propios (trofeo, alcancía, manos con corazón…), stats con chip de ícono.

## [Estética tipo simulador de vida] · `056e24d`

- Tema claro, barra roja con logo propio, barra de personaje con avatar/ocupación/saldo, historial de texto plano, barra de navegación con botón central de avanzar, stats abajo. Navegación tipo "hub": cada sección se abre con barra y flecha de volver.

## [Fase 3] — dinastía y modos · `0abc382`

- **Escenarios** (9): Del barro al éxito, Millonario joven, Vida ejemplar, Rey del hampa, Volver a empezar, Centenario, Familia numerosa, Cerebro brillante, Hogar dulce hogar. Con objetivo, tiempo límite, dificultad, pasado generado automáticamente (`engine/scenarios.ts`).
- **Autojugador** (`engine/autoplay.ts`): bot con sesgos configurables (crimen, familia). Se usa en tests, escenarios y bots del árbol.
- **3 ranuras de partida** y **copia de seguridad** exportable/importable como texto.
- Puntaje de **legado** por vida. 7 eventos de dinastía (carta, reloj, negocio familiar, escándalo, presión del apellido…).
- Modelo: `Life.lineageId/generation/scenario`, `LifeSummary` ampliado.

## [Fase 2] — relaciones, dinero y crimen · `a05a8ed`

- **Relaciones**: 22 eventos con una persona específica (`target`), 15 acciones con personas (engañar, divorciarse, cortar contacto…), amistades y parejas que se deterioran.
- **Carrera y dinero**: 10 carreras nuevas (25 en total) con 15 eventos por sector; propiedades y autos (comprar/financiar/vender), préstamos con cuota, inversiones, gasto de estilo de vida, quiebra.
- **Crimen y justicia**: arrestos con **juicio** (abogado de oficio/privado, soborno, culpable), 4 delitos nuevos, cárcel con libertad condicional, fuga, reinserción, prófugo.
- 19 **logros** persistentes; migración de partidas (`migrateLife`).

## Creación de personaje · `fd0615d`

- Pantalla para elegir nombre, apellido, género, color de piel y de ojos, peinado (8) y color de pelo, con botón Aleatorio y avatar SVG en vivo. Se sortean año de nacimiento (1950–2010), familia y stats.

## [Fase 1] — MVP jugable · `5ccab8d`

- Proyecto Expo + TypeScript, motor puro con RNG con semilla, ~133 eventos con decisiones, 4 stats, escuela y universidad, trabajo con ascensos, relaciones básicas, dinero y deudas, crimen y cárcel, muerte y resumen, guardado automático, tests de simulación (300 vidas).

## Fase 0 — diseño

- Documentación inicial (`docs/01` a `docs/09`): visión, stack, game design, formato de contenido, IA opcional, mundo persistente, UI, roadmap y decisiones.
