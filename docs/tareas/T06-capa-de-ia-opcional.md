# T06 · Capa de IA opcional con clave gratuita

- **Prioridad / esfuerzo:** baja-media (Fase 4) · XL — dividir en hitos
- **Depende de:** T12 (pantalla de Ajustes)
- **Autonomía:** ⚠️ agrega dependencias y pedidos de red; **el juego debe seguir 100 % igual sin IA**
- **Estado:** todo

## Objetivo
Cumplir la decisión de `docs/05-ia.md`: la IA es **opcional**, usa una **clave propia gratuita** (sin costo para Max), nunca es necesaria y nunca puede romper el juego. Sirve para dos cosas: **narrar** (reescribir el texto de un evento con el contexto de la vida) y **generar eventos nuevos** en el formato estándar, que entran a un pool local después de validarse.

## Contexto
- `docs/05-ia.md` (diseño y riesgos), `docs/04-contenido-y-eventos.md` (formato de evento y reglas de contenido), `src/engine/types.ts` (`GameEvent`), `src/engine/events.ts` (`runYearEvents`, `fireEvent`), `src/engine/registry.ts`, pantalla de Ajustes (T12) o `MoreScreen`.
- Proveedores con capa gratuita: Google Gemini (API REST), Groq (compatible con OpenAI). Las cuotas cambian: por eso hay una interfaz de proveedor.

## Requisitos
### Hito 1 — Núcleo sin red
1. `src/ai/` con: `types.ts` (`AIProvider { id; generate(prompt, opts): Promise<string> }`), `prompts.ts` (plantillas en español con las **reglas de contenido** al principio del prompt: nada sexual con menores, suicidio sin detalles, país genérico, sin marcas), `validate.ts` (validador con **Zod**: `npx expo install zod`) que convierte el texto de la IA en un `GameEvent` seguro: JSON estricto, ids con prefijo `ai.`, `weight ≤ 8`, efectos **acotados** (stats ±15, dinero ±25 % o ±$20.000, sin `die`, sin `arrest` de más de 5 años, sin `setFlag` fuera de una lista blanca), longitud de textos, opciones 2–3, y **filtro de contenido** (lista de términos vetados y reglas para menores). Rechazar todo lo que no pase.
2. `pool.ts`: pool local de eventos generados (máx. 200, con tope por categoría), guardado en `meta` (campo opcional `aiPool`) y cargado en `registry.ts` **solo si la IA está activada**; los eventos del pool se sortean como cualquier otro, con `weight` bajo.
3. Tests con proveedor **simulado** (`MockProvider`): respuestas válidas, JSON roto, efectos fuera de rango, contenido vetado, id duplicado, timeout → siempre cae al contenido normal sin lanzar excepciones.
### Hito 2 — Proveedores y ajustes
4. `providers/gemini.ts` y `providers/groq.ts` con `fetch`, timeout de 8 s, 1 reintento, y manejo claro de errores/cuotas (429). Sin SDKs.
5. **Clave**: guardada con `expo-secure-store` (`npx expo install expo-secure-store`); nunca en `meta`, en la exportación ni en logs. Pantalla de Ajustes → "IA (opcional)": interruptor, elección de proveedor, campo para pegar la clave, botón "Probar conexión", contador de eventos en el pool, "Vaciar pool". Texto que aclare que **la clave la consigue el usuario** en la web del proveedor, gratis, y que el juego funciona igual sin ella.
6. **Modo narrador** (opcional): al mostrar un evento con decisiones, una llamada breve reescribe el texto con nombres y contexto; si tarda > 3 s o falla, se muestra el texto original. Cachear por (evento, contexto resumido).
7. **Generación en segundo plano**: al abrir la app con IA activa y conexión, generar hasta N eventos nuevos por sesión (N = 5), con una petición por evento y `AbortController`; jamás bloquear la UI ni el turno de envejecer.
### Hito 3 — Seguridad y documentación
8. Registro de auditoría local (últimos 50 rechazos con motivo) visible en Ajustes → "Diagnóstico".
9. `docs/05-ia.md` actualizado con lo implementado, límites y cómo cambiar de proveedor; `docs/11` (campos nuevos de `meta`).

## Criterios de aceptación
- [ ] `npm run check` verde; **ningún test hace pedidos de red reales** (todo con `MockProvider` o `fetch` simulado).
- [ ] Con la IA desactivada (por defecto) el comportamiento del juego es **idéntico** (test: las mismas semillas dan las mismas vidas que antes de la tarea).
- [ ] Validador: ≥ 25 casos de rechazo probados; ningún evento validado puede matar al jugador directamente ni cambiar más de lo permitido.
- [ ] UI verificada con el proveedor simulado (un botón "Generar evento de prueba" en modo desarrollo).
- [ ] La clave no aparece en ningún archivo, log, exportación ni captura.

## Fuera de alcance
Modelos locales en el celu; imágenes generadas por IA; chat libre con NPC.

## Riesgos
- Contenido inadecuado que escape al filtro: por eso el validador es estricto y hay un pool auditable; ante la duda, rechazar.
- Cuotas gratuitas cambiantes: interfaz de proveedor + degradación silenciosa.
