# Changelog

Historial de cambios de VidaSim, del más reciente al más antiguo. Cada entrada corresponde a un commit (o grupo de commits) de `main`.

## [T17 hito 6 · Perfil de balance para amoríos e infidelidad]

- Nuevo perfil `romance` en `npm run balance -- --profile=romance`: el bot ahora puede ir por una acción romántica con alguien que no es su pareja (antes las evitaba siempre; `AutoOpts.cheatChance`, en 0 para el resto de los perfiles, sin cambios en ellos). Métricas nuevas en el informe: `divorced` y `caughtCheating` (se enteró la pareja de una infidelidad y la relación se rompió por eso). Con cientos de vidas simuladas: alrededor de 17–28 % termina con la infidelidad descubierta, sin romper el resto de las bandas. Test de banda nuevo (269 en total).

## [Deploy: corrección — Workers Builds ignora el build.command de wrangler.jsonc]

- El intento anterior (`build.command` en `wrangler.jsonc`) no arregla el deploy automático: Cloudflare documenta que **Workers Builds ignora a propósito** los "Custom Builds" del archivo de configuración. El arreglo real es manual y va en el panel: *Settings → Builds → Deploy command* → `npm run deploy:web` (en vez de `npx wrangler deploy`). Ver `docs/13-instalacion.md`. `build.command` se deja igual, porque sí sirve para probar en seco en local con `wrangler deploy --dry-run`.

## [Deploy: arregla el build automático de Cloudflare]

- Con el repo conectado por Git (Workers Builds), Cloudflare corría `npx wrangler deploy` directo, sin generar antes `dist/`, y el deploy fallaba (`El directorio "dist" no existe`). `wrangler.jsonc` ahora tiene `build.command: "npm run build:web"`: Wrangler genera `dist/` solo antes de desplegar. Verificado con `npx wrangler deploy --dry-run` (corre el build, exporta y no publica nada). **Corregido más abajo: esto no alcanza para el deploy automático.**

## [T17 · La IA sincronizada con amistad, amor y enemistad]

- **Eventos generados por la IA** pueden involucrar a una persona (`"person"`: madre, padre, hermano/a, amigo/a, pareja, hijo/a o ex), nombrada siempre con el placeholder `{target}` (nunca un nombre inventado); se rechazan si falta. Igual que el contenido escrito a mano, nunca se ofrecen con un enemigo. Sus resultados pueden sumar o restar amistad (y amor, sobre todo con la pareja).
- **Responder escribiendo**: si la situación tiene una persona, la IA se entera de quién es ("tu amiga", "tu hermano"…) y puede mover su amistad y su amor al juzgar tu respuesta, con los mismos límites que un stat.
- El contexto que recibe la IA (`summarizeLife`) ahora incluye, cuando corresponde, la pareja, la mejor amistad, una enemistad fuerte o un amorío en curso.
- No hizo falta tocar la UI: los chips de resultado ya sabían mostrar amistad y amor. 41 tests nuevos (268 en total); no probado con un proveedor real ni en el navegador (requiere red).

## [T17 · Eventos viejos sincronizados con amistad y amor]

- **Enemistad:** los eventos que suponen una buena relación (un amigo que pide ayuda, casamientos, fianza, visita a tu mamá, operación de tu papá) ya no salen con un enemigo; los chismes del ex solo si no se llevan bien.
- **Amor:** los eventos de pareja (celos, sorpresa, ascenso, enfermedad, mudarse juntos, aniversario, propuesta, infidelidad) piden amor y mueven la barra de amor además de la de amistad. Nuevo efecto `suspect`: la tentación, el romance de oficina, la aventura y "Engañar a tu pareja" dejan rastro de infidelidad.
- **`{friend}`** en los textos es ahora el amigo con mejor amistad, no un enemigo. 7 tests nuevos (254 en total); uno recorre todos los eventos y exige que los cambios con la pareja muevan también el amor.

## [T17 · 12 acciones o más por categoría, tope de 6 y variación anual]

- **Catálogo ampliado:** cada categoría tiene ahora 12 o más acciones (unas 100 en total): 3 de amistad, 9 de humor, 7 de amor, 7 de pareja, 9 de conflicto, 10 de plata y 8 de paz nuevas.
- **Máximo 6 por categoría:** con cada persona se ofrecen hasta 6 acciones por categoría; las esenciales (Conversar, Pasar tiempo juntos, Coquetear, Pedir perdón…) están siempre y el resto cambia cada año.
- Los bots se limitan a acciones amistosas. El test de las 300 vidas tiene más margen de tiempo. 5 tests nuevos (247 en total).

## [T17 · Subpestañas de acciones y amor con familia]

- **Subpestañas:** la ficha de cada persona muestra primero las categorías (tarjetas con su cantidad de acciones); al tocar una aparecen solo sus acciones y hay un botón para volver a las categorías.
- **Amor con familia:** con madre, padre, hermanos o hijos adultos no aparecía nada en algunos años porque todas las acciones románticas rotaban (25 % de los años sin ninguna). "Coquetear", la entrada al amor, ya no rota: siempre está con 50 o más de amistad. Además, si falta amistad, la ficha avisa cuánto. 1 test nuevo, 243 en total.

## [T17 · Títulos de relación y el amante reacciona]

- **Títulos de relación** según amistad, amor, enemistad y parentesco: Neutral, Conocido, Amigo, Mejor amigo, Interés amoroso, Amigo con derechos, Romance/Amante, Mala onda, Enemigo, Némesis, Relación tóxica, Amor-odio, Pareja, Alma gemela, Ex con cuentas pendientes, Familiar entrañable, Familiar y amante, Familiar: amor-odio, etc. Aparecen en la lista y como etiqueta de color en la ficha.
- **El amante reacciona** cuando la pareja descubre el engaño: según la decisión se aleja o se ilusiona; los textos lo nombran con su relación. 10 tests nuevos (242 en total).

## [T17 · Categorías, eventos, íconos e infidelidad]

- **Acciones por categoría** en la ficha de cada persona: Amistad, Humor y bromas, Amor y seducción, Pareja y compromiso, Peleas y molestias, Plata, Paces y distancia. Acciones nuevas: chiste, broma pesada, molestar, tregua y "Pedirle que sean pareja".
- **15 eventos nuevos** de amistad (cumpleaños, se fue de boca, un amigo en crisis, una locura), amor (una mirada distinta, celos, aniversario, rutina, mensaje del ex) y enemistad (chismes, cruce incómodo, tregua, zancadilla, hermanos peleados).
- **Íconos y colores:** amistad con los dos amigos abrazados en verde (barra verde o amarilla), enemistad con espadas rojas y barra roja; amor con barra rosa clarito y corazón. La "mala onda" empieza ahora en amistad negativa.
- **Infidelidad y varios amoríos:** los gestos románticos con otra persona dejan rastro y un amorío fuerte suma sospecha cada año; la pareja puede enterarse y hay que decidir (negar, pedir perdón, admitirlo), con riesgo de ruptura o divorcio. Un amorío puede pasar a ser la pareja oficial.
- Los bots no eligen acciones hostiles ni coquetean con terceros. 10 tests nuevos (232 en total).

## [T17 · Amistad y amor (hitos 1–3)]

- **Doble medidor por persona:** amistad (−100 a 100; por debajo de −30 es "mala onda") y amor (0–100, oculto hasta que una acción lo desbloquea). `SCHEMA_VERSION` 5: las partidas viejas migran solas (la cercanía pasa a amistad; la pareja arranca con amor).
- **Acciones por niveles:** 6 amistosas y 8 románticas nuevas (coquetear, carta de amor, cita, beso, confesarse, sorpresa, escena de celos, pasar la noche). Las románticas piden amistad ≥ 50 y luego amor creciente; solo entre adultos, **también con familiares adultos**. Cada acción tiene reacciones buenas y malas que suman o restan cantidades distintas de amistad y amor.
- **Variedad:** cada año se ofrece una parte de las acciones desbloqueadas (determinista: no cambia al reabrir la pantalla).
- **UI:** dos barras en la lista y en la ficha; los resultados muestran chips de amistad y amor. A quien es "mala onda" no se le ofrecen gestos amistosos.
- Pendiente: varios amoríos con la pareja oficial, infidelidad y su descubrimiento, balance. 15 tests nuevos (222 en total).

## [Textos: relación con cada persona]

- Al nombrar a alguien en un texto (eventos, resultados, acciones con personas) la primera vez aparece qué es del jugador: "Marcos (tu amigo)", "Ricardo (tu jefe)", "Sofía (tu esposa)". Se omite si el texto ya lo dice o si ya se nombró antes en el mismo texto. 1 test nuevo (207).

## [IA: sin montos escritos en los textos]

- Un evento generado decía "cobrás 1.200 dólares" y el juego pagaba $1.550: el monto real se ajusta por época pero la IA escribía la cifra fija. Ahora se rechazan los textos de la IA con montos ("$500", "1.200 dólares", "300 pesos") y el prompt pide describirlos sin cifras; al cargar se limpian los eventos guardados que los tengan. 2 tests nuevos (206).

## [Web: pantalla completa en el iPhone]

- `public/index.html`: el contenedor raíz pasa a `position: fixed` con los cuatro bordes en 0, porque con `height: 100%` la versión instalada en el iPhone dejaba una franja vacía debajo de la barra de navegación. No se pudo reproducir en el navegador de escritorio; hay que confirmarlo en el iPhone tras `npm run deploy:web`.

## [Pantalla de vida: barra abajo]

- La barra de navegación (Ocupación, Activos, Envejecer, Relaciones, Actividades) pasó al borde inferior, debajo de las barras de stats, como en BitLife; antes flotaba a mitad de pantalla en el celular. Verificado en el navegador a 390×844.

## [IA: sin reescritura de textos]

- Se eliminó el modo narrador que reescribía los textos de los eventos (causaba incoherencias). Quedan solo responder escribiendo y el retruque de la IA; el interruptor pasó a llamarse "Responder escribiendo". Se borraron sus tests (204 en total).

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
