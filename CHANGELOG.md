# Changelog

Historial de cambios de VidaSim, del más reciente al más antiguo. Cada entrada corresponde a un commit (o grupo de commits) de `main`.

## [IA: segunda persona obligatoria]

- Los eventos que genera la IA se rechazan si no le hablan al jugador (te/tu/voseo) o si tienen un nombre propio de sujeto en tercera persona ("Marcos está despierto…"); lo mismo para resultados y continuaciones. Al cargar, se descartan los eventos ya guardados que incumplan. El prompt prohíbe nombres propios. 2 tests nuevos (208).

## [IA: la IA retruca]

- Al responder escribiendo, la IA puede plantear una situación nueva que continúa la anterior y se basa en tu respuesta; volvés a decidir (opción sugerida o texto libre). Hasta 3 seguidas, con hilo de contexto y las mismas reglas de contenido. 4 tests nuevos (206 en total).

## [IA: verificación automática]

- Se eliminaron los botones "Probar conexión" y "Guardar clave": la clave se guarda sola al pegarla y la conexión se verifica sola ante cualquier cambio (clave, proveedor, dirección, modelo, preset). Indicador en Ajustes: ruedita → tick verde / cruz roja; al tocar la cruz se despliega dentro de la pantalla el motivo del error. Verificado en el navegador con Ollama local y con Groq real (clave falsa → "Invalid API Key"). 3 tests nuevos.

## [IA: solo con conexión verificada]

- Responder escribiendo (y el modo narrador) solo se habilitan después de un "Probar conexión" exitoso; cambiar proveedor, dirección, modelo o clave, o un fallo, lo invalida. Ajustes muestra "Conexión verificada ✓" o el aviso. Verificado en el navegador con Ollama real. 9 tests (`ai/config.test.ts`).

## [IA: errores claros y modelo elegible]

- "Probar conexión" mostraba "No se pudo conectar" ante cualquier error que no fuera de clave o cuota (por ejemplo un modelo sin acceso en el plan gratuito de Groq). Ahora muestra el motivo real del proveedor. Gemini y Groq tienen campo de **modelo** (con atajos para Groq); el modelo por defecto de Groq pasó a `llama-3.1-8b-instant`. 3 tests.

## [Arreglo web] confirmaciones

- En la versión web "Nueva vida" desde el Menú (y borrar todo, borrar partida, importar copia y los avisos del árbol) no hacían nada: `Alert.alert` no funciona en `react-native-web`. Nuevo `ui/dialog.ts` (`showAlert`): usa `Alert` en el celular y el cuadro del navegador en la web. Verificado en el navegador; 3 tests.

## [Responder escribiendo]

- Con la IA y el modo narrador activos, las situaciones con opciones permiten **escribir qué hacés**: la IA cuenta el resultado y asigna puntos, acotados por el validador (mismos límites que los eventos generados). Respuestas tratadas como datos (anti-inyección), filtros de entrada y salida según la edad del personaje, reintento y mensaje claro si falla. `resolveWithOutcome` en el motor. Verificado en el navegador con Ollama real. Tests nuevos (`freetext.test.ts`, 29).

## [Narrador coherente]

- El modo narrador ya no puede inventar hechos: temperatura baja, prompt de cambios mínimos y guarda que descarta reescrituras que pierden datos del original. Reportado desde el iPhone ("Un tío por el parque siempre de ti te da la lata"). `temperature` es ahora una opción del proveedor. Tests nuevos.

## [IA desde el iPhone]

- `scripts/ollama-proxy.mjs` (`npm run ollama:proxy`): mini-proxy local que permite publicar Ollama con Tailscale Serve (HTTPS privado, solo tus dispositivos). Guía y verificación en `docs/05-ia.md`.

## [IA: sin campo de clave para servidores locales]

- Con el preset Ollama (o cualquier dirección local: `localhost`, `127.x`, `192.168.x`, `10.x`, `172.16-31.x`) la pantalla de IA oculta el campo y los botones de clave. El preset Ollama usa `http://localhost:11434/v1`. Verificado en el navegador: "Probar conexión" contra un Ollama real responde "Conexión correcta".

## [IA: prueba real y prompt]

- Probado de punta a punta con Ollama + `dolphin3` local. El prompt de eventos ahora exige segunda persona con voseo, tono seco y un único ejemplo de estilo (con aviso de no copiarlo), y pide montos chicos.

## [Primera vida guiada]

- Tutorial rehecho, más visual y guiado: la primera vida arranca con la elección de género y de personaje (tres opciones al azar) y luego 5 globos que oscurecen la pantalla y resaltan cada parte de la app (`ui/coach.tsx`, `GuidedStartScreen`). Reemplaza al tutorial de 5 tarjetas. Las vidas siguientes no cambian.
- **Arreglo importante**: `tsc` se caía con "Maximum call stack size exceeded" desde el build web, porque leía el bundle de `dist/` (hay `allowJs`). `tsconfig.json` ahora excluye `dist`, `node_modules` y `.expo`. Ese commit anterior se subió con el typecheck roto.

## [Publicación web]

- `npm run build:web` exporta el sitio estático (`dist/`), con `public/index.html` (metadatos para iPhone), manifiesto y ícono de inicio. Verificado servido como estático y sin errores de consola. `wrangler.jsonc` + `npm run deploy:web` para Cloudflare (Workers Static Assets, validado con `--dry-run`). Guía en `docs/13-instalacion.md` (Cloudflare Pages / Netlify / Vercel, instalar en el iPhone y advertencias).

## [Arreglo] materializar personajes

- Al pasar a vivir la vida de un pariente, un evento del pasado simulado podía quitar a un hermano o padre de su lista y la vida quedaba con una familia incompleta (causa del test intermitente `materializar a un hermano`). Ahora los familiares reales del árbol se reponen siempre.

## [Gesto de volver]
- **Ajuste de fluidez**: el fondo que queda detrás al deslizar ya no es oscuro (era el "pantallazo negro"), la pantalla de destino aparece de una (sin el fundido desde transparente, `FadeIn` con `duration=0` arranca visible) y la página vuelve a su lugar recién cuando la nueva ya está dibujada.

- Deslizar desde el borde izquierdo vuelve a la pantalla anterior (estilo Instagram), con animación que sigue al dedo (`ui/SwipeBack.tsx`). Las pantallas del Menú ahora vuelven al Menú, no a la vida. Verificado en el navegador con arrastre desde el borde; **sin probar en un iPhone real**.

## [IA: modelo propio sin censura]

- Nuevo proveedor `compat` (servidor con API estilo OpenAI: Ollama, LM Studio, OpenRouter…), con dirección y modelo configurables, clave opcional y presets. Groq pasó a usar el mismo código. El prompt de eventos admite tono crudo y adulto; las reglas fijas (menores, suicidio, marcas, lugares reales) se siguen aplicando en el validador.
- OpenRouter no tenía hoy ningún modelo gratuito sin filtros: la opción gratuita real es un modelo local (ver `docs/05-ia.md`).
- Tests: 4 nuevos (URL, sin `Authorization` sin clave, direcciones inválidas, validador con contenido adulto).

## [Leyes de época] — cierre de T05

- `Outcome.conditions`: un resultado solo puede salir si se cumplen sus condiciones. Nuevas condiciones `c.noLaw()`. Ejemplo: con `drogas_blandas_legales` vender drogas ya no termina en arresto (multa por venta sin habilitación).

## [Tutorial y ayuda] — T15

- Tutorial de 5 tarjetas la primera vez (con "Saltar"), pantalla **Cómo se juega** con secciones plegables y glosario, consejos contextuales al morir y aviso en el árbol cuando no hay a quién cambiarse. Las partidas existentes no ven el tutorial (`meta.seenTutorial` opcional).
- Tests: `content/help.test.ts` y del store (`seenTutorial`).

## [Árbol: anti-abuso y novedades] — T16 (parcial)

- **Anti-abuso**: la distancia de sangre también se mide desde el personaje ancla (los saltos encadenados ya no te alejan de tu línea), enfriamiento de 5 años entre cambios y máximo 3 cambios por generación. La muerte del personaje actual anula todo. Los motivos se muestran en la ficha de cada persona (los bloqueos temporales, en ámbar). Valores configurables en `engine/kinship.ts`.
- **Novedades de la familia**: nacimientos, muertes, casamientos y separaciones (`engine/news.ts`) en una pestaña nueva del árbol, con contador de no leídas en el Menú.
- **Árbol**: búsqueda por nombre y resaltado de "los que puedo jugar".
- `performSwitch` registra los cambios; campos nuevos y opcionales en `World` (sin subir el esquema).
- Pendiente: zoom con pellizco, "Centrar en mí", colapsar ramas.

## [Balance] — T01

- `npm run balance -- --n=500 --profile=normal|crimen|familia|pasivo [--json] [--out]`: informe de esperanza de vida, causas de muerte, patrimonio, % de quiebras/millonarias/antecedentes/casadas/con hijos, uso de cada evento (dominantes y muertos) y rendimiento (`engine/balance.ts`, `scripts/balance.ts`). Informes en `docs/balance/`.
- Bandas objetivo documentadas en `docs/10` y verificadas por `balance.bands.test.ts`.
- **Calibración**: el desajuste (42 % de quiebras, 49 % con antecedentes) venía del **bot**, no de la economía: ahora busca trabajo de forma constante, esquiva las opciones criminales según su perfil y no se anota siempre en la universidad. Quiebras 42 % → 6 %, antecedentes 49 % → 20 %. Ninguna constante del juego cambió. Ver `docs/balance/CALIBRACION.md`.
- `hist.rock_nace` nunca se disparaba: corregido el rango de años.
- Dependencia de desarrollo nueva: `@types/node`.

## [Robustez del motor] — T02

**Bugs encontrados y corregidos**
- Podías terminar con **2–3 parejas vivas**: reconectar con un ex (`relation.becomes: 'partner'`) no dejaba a la pareja anterior como ex. Ahora una sola pareja a la vez en cualquier camino.
- En el árbol, si un familiar ya tenía pareja y pasaba a ser la pareja del jugador, su relación anterior quedaba colgada (pareja no recíproca). Ahora la relación previa termina.
- Cambiar a un pariente muy anciano fallaba con demasiada frecuencia ("No se pudo generar esa vida"): el bot ahora reintenta hasta 40 veces.
- Test `world.test.ts` intermitente: dependía de semillas con `Date.now()`; los invariantes nuevos no dependen del azar.

**Nuevo**
- `engine/invariants.ts` (`checkLife`, `checkWorld`), `engine/switch.ts` (`performSwitch`, usado por el store) y tests de robustez y del store (ver `docs/12`). Suite de ~120 tests en ~15 s; `FULL=1` para la muestra grande.

## [Calidad de código] — T14 (parcial)

- ESLint (`eslint.config.js`, config de Expo; 0 errores, 0 advertencias) y Prettier (`.prettierrc.json`, ancho 140; `src/content/**` sin formatear). Scripts: `lint`, `format`, `format:check`, `check:all`.
- `scripts/gen-icons.mjs` (`npm run icons`) regenera `Icon.tsx` y falla si falta un ícono; test que verifica que todo ícono referenciado exista. `dev:web` / `stop:web` levantan y detienen solo el servidor propio (por PID).
- Código muerto eliminado (imports y variables sin uso).
- Pendiente: dividir los archivos grandes y JSDoc.

## [IA opcional] — T06

- **Capa de IA** (`src/ai/`), desactivada por defecto y sin efecto en el motor si está apagada. Proveedores gratuitos con clave propia: Google Gemini y Groq (`fetch`, timeout 8 s, 1 reintento; errores de cuota y clave informados sin romper nada).
- **Eventos generados**: cada respuesta pasa por un validador Zod estricto y un filtro de contenido (menores, suicidio, marcas, lugares y personas reales, enlaces) antes de entrar a un pool local (máx. 200). Los efectos están acotados; no pueden matar, arrestar ni marcar flags.
- **Modo narrador**: reescribe el texto de los eventos con decisiones usando el contexto de tu vida; si tarda más de 3 s o falla, se muestra el original.
- **Ajustes** (Menú → IA): activar, proveedor, clave en almacenamiento seguro (`expo-secure-store`), probar conexión, generar, vaciar pool, diagnóstico de rechazos. La clave no viaja en la copia de seguridad.
- Dependencias nuevas: `zod`, `expo-secure-store`.
- Tests: `ai.test.ts` (55): ≥ 25 casos de rechazo, proveedores con `fetch` simulado, determinismo con la IA apagada. Ningún test usa la red.

## [Avatares pulidos] — peinados por género

- **Peinados separados por género**: 9 de hombre (corto, pelado, cresta, afro, jopo, raya al costado, rulos cortos, despeinado, entradas) y 11 de mujer (largo, rulos, rodete, carré, trenza, colitas, pixie, ondas largas, flequillo, cola alta, afro rizado). Ninguno es unisex (`content/look.ts`: `HAIRS`, `hairStylesFor`, `hairForGender`).
- **Creación de personaje**: el selector muestra una grilla con la vista previa de cada peinado con tu piel y tu color de pelo, filtrada por el género elegido; al cambiar de género el peinado se ajusta solo. El avatar grande respira y parpadea.
- **Avatar rediseñado** (`ui/Avatar.tsx`): degradados en cara y ropa, mejillas, ojos con iris y brillos, pestañas y cejas finas en rasgos femeninos, cuello con sombra, cuello en V, brillos en el pelo, sonrisa con dientes. `Avatar animated` respira y parpadea (se usa en la creación y en la cabecera de la vida).
- **Compatibilidad**: los hijos, familiares y personas nuevas usan peinados de su género. Las partidas viejas se migran (`migrateLife`) y `deriveLook` corrige a las demás personas al dibujarlas.
- Tests: `looks.test.ts` (5).

## [Avatares pulidos] — peinados por género

- **Peinados separados por género**: 9 de hombre (corto, pelado, cresta, afro, jopo, raya al costado, rulos cortos, despeinado, entradas) y 11 de mujer (largo, rulos, rodete, carré, trenza, colitas, pixie, ondas largas, flequillo, cola alta, afro rizado). Ninguno es unisex (`content/look.ts`: `HAIRS`, `hairStylesFor`, `hairForGender`).
- **Creación de personaje**: grilla con vista previa de cada peinado (con tu piel y color de pelo) filtrada por género; al cambiar de género el peinado se ajusta solo. El avatar grande respira y parpadea.
- **Estilo del avatar** (`ui/Avatar.tsx`): plano y amable — cabeza redonda y grande, ojos de punto con brillo, cejas marcadas, mejillas, sonrisa simple, hombros anchos con remera y cuello. Rasgos femeninos (pestañas, cejas finas) según el peinado. `Avatar animated` respira y parpadea (creación y cabecera de la vida).
- **Compatibilidad**: hijos, familiares y personas nuevas usan peinados de su género; las partidas viejas se migran (`migrateLife`) y `deriveLook` corrige al resto al dibujar.
- Tests: `looks.test.ts` (5).

## [Fase 4 · Eras] — la época importa (T05, hitos 1 a 3 parciales)

**Nuevo**
- **Eras** (`content/eras.ts`): función pura `eraAt(año)` con tecnología (tv, computadora, celular, internet, redes, smartphone, streaming, IA, realidad virtual, autos autónomos, longevidad), leyes con vigencia (servicio militar, pena de muerte, divorcio, drogas blandas, jornada reducida…) e índices de **precios y salarios** por año (base 1,0 en el 2000, entre 0,16 y 8). No se guarda nada: todo deriva del año calendario.
- **Inflación**: salarios, precios de casas y autos, alquiler, gastos de estilo de vida, cuotas de universidad, costo de actividades, montos de eventos (`fx.money`) y los `$` escritos en los textos se escalan por época (`scaleMoney`, `scaleText`, redondeo legible). Los ahorros en cuenta y las inversiones siguen a la inflación (90 %) para que el dinero quieto no se evapore. Umbral de quiebra, préstamos y logros ("Millonario/a") usan **valores constantes** (`realNetWorth`) para ser justos entre épocas.
- **Condiciones nuevas del DSL**: `c.tech()`, `c.law()`, `c.era()`.
- **Carreras de época** (`Career.since/until`): telegrafista, telefonista, mecanógrafo/a, call center, community manager, repartidor de apps, influencer, científico/a de datos, ingeniero/a de prompts, piloto de drones, diseñador/a de realidad virtual. Programador/a existe desde 1975.
- **Actividades por tecnología** (`Activity.tech`): ver televisión, videojuegos, redes sociales, series, citas por app, charlar con una IA, mundos de realidad virtual.
- **48 eventos históricos** nuevos (`content/events/history.ts`) entre 1951 y 2094 (genéricos), varios con decisiones, más el sorteo del servicio militar mientras rige la ley.
- **UI**: la época aparece junto a la ocupación ("Años 2020") y un aviso "Cambio de época" al cruzar de década.
- Tests: `eras.test.ts` (10).

**Cambios**
- Las partidas viejas no se migran: siguen con sus montos previos y solo los sueldos/precios nuevos usan el índice.
- Balance verificado con 600 vidas por década de nacimiento: patrimonio real mediano 160–310 mil y 10–22 % de millonarios en todas las décadas (comparable a antes).
- `world.test.ts`: el "padre" de un nodo puede ser de género F (parejas del mismo género), el test lo asumía M.

**Pendiente de T05**: desenlace de pena de muerte en juicios y escenas nuevas `war`/`disaster` (decisión de Max).

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
