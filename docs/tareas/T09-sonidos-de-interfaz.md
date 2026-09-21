# T09 · Sonidos de interfaz sintetizados

- **Prioridad / esfuerzo:** media · M
- **Depende de:** T14 (scripts)
- **Autonomía:** ✅ segura (no requiere descargar audio: se sintetiza)
- **Estado:** todo

## Objetivo
Decisión de diseño cerrada: "solo sonidos de interfaz mínimos". Agregar feedback sonoro discreto (toques, envejecer, resultado bueno/malo, logro, muerte) **sin depender de archivos externos**: los sonidos se generan por código y se guardan en `assets/sounds/`.

## Contexto
- `src/ui/anim.tsx`, `src/ui/components.tsx` (`Button`, `Row`), `src/ui/screens/LifeScreen.tsx` (botón Envejecer), `src/ui/PromptModal.tsx`, `src/ui/Toast.tsx`, `src/store/gameStore.ts`.
- Expo: `npx expo install expo-audio` (compatible con Expo Go).
- Estilo sonoro: suave, corto, tipo "burbuja/madera" (no arcade estridente).

## Requisitos
1. **Generador**: `scripts/gen-sounds.mjs` (script npm `sounds`) que sintetiza con JS puro (senos + envolventes ADSR + un poco de ruido filtrado) archivos **WAV 16-bit mono 22,05 kHz** en `assets/sounds/`: `tap` (≈ 60 ms), `age` (subida corta ≈ 250 ms), `good` (dos notas ascendentes), `bad` (dos notas descendentes), `pop` (chips/logros), `achievement` (arpegio corto), `death` (nota grave que decae ≈ 900 ms), `coin`, `page`. Cada uno ≤ 40 KB. Determinista (sin `Math.random()`; usar un LCG con semilla) para que el script reproduzca los mismos bytes. Commitear los `.wav` generados.
2. **Servicio** `src/ui/sound.ts`: `playSound(name)` con precarga perezosa, un `Player` por sonido, tolerante a fallos (si no hay audio o falla, no hace nada y no rompe), respeta un `enabled` global y un volumen (0–1). Nunca reproduce más de 3 a la vez; los toques rápidos reinician el sonido.
3. **Integración**: `tap` en `Button`/`Row`/`PressScale`; `age` al envejecer; `good`/`bad` al abrir el resultado según el puntaje de stats (`PromptModal`); `pop` en `DeltaChips`; `achievement` en `Toast`; `death` al pasar a la pantalla de muerte; `coin` en compras/ventas/préstamos.
4. **Ajuste** persistido en `meta` (campos opcionales `sound: boolean` (default `true`), `soundVolume: number` (default `0.6`)) y un interruptor en Menú ("Sonido") — el resto de ajustes va en T12; si T12 no está hecha, poner solo el interruptor y el control de volumen en `MoreScreen`.
5. En web, respetar la política de autoplay (iniciar tras el primer toque).
6. Documentar en `docs/07-ui-ux.md` la lista de sonidos y cuándo suenan.

## Criterios de aceptación
- [ ] `npm run sounds` regenera los mismos bytes (verificar con un test que compara el hash de un sonido generado en memoria con el archivo commiteado).
- [ ] `npm run check` verde; tests de `playSound` con el módulo de audio mockeado: respeta `enabled`, no explota si falla, limita a 3 simultáneos.
- [ ] UI verificada: el interruptor apaga todo; sin errores de consola aunque el navegador bloquee el audio.
- [ ] `docs/07-ui-ux.md`, `docs/11` (campos nuevos de `meta`), `CHANGELOG.md`.

## Fuera de alcance
Música de fondo; vibración háptica (T12).

## Riesgos
- Sonidos molestos: mantenerlos suaves (pico ≤ −6 dBFS) y cortos.
- `expo-audio` puede comportarse distinto en Expo Go/web: usar `try/catch` y no bloquear el hilo de UI.
