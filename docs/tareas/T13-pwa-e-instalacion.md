# T13 · PWA y build para instalar en el iPhone (sin desplegar)

- **Prioridad / esfuerzo:** baja-media · M
- **Depende de:** T12 (ajustes, tema) recomendable
- **Autonomía:** ✅ segura **si no se despliega nada**: la tarea prepara todo; publicar es decisión de Max
- **Estado:** parcial (hecho: build, manifiesto, plantilla iOS, guía `docs/13-instalacion.md`; pendiente: service worker offline, ícono propio, medir el tamaño de guardado)

## Objetivo
Hoy el juego solo se abre con Expo Go (PC y celular en la misma red). Preparar una **PWA instalable**: se exporta como sitio estático, se abre en Safari y se agrega a la pantalla de inicio, funcionando **offline**. Dejar además documentadas las alternativas (cuenta de Apple Developer / EAS) para decidir después. `docs/09` tiene la decisión abierta.

## Contexto
- Expo web: `react-native-web`, `react-dom`, `@expo/metro-runtime` ya instalados. `app.json` (nombre, ícono, `userInterfaceStyle`).
- `assets/` (íconos del scaffold por defecto de Expo), `src/store/gameStore.ts` (AsyncStorage → en web usa `localStorage`).
- Documentación de Expo (SDK 57): exportación web estática (`npx expo export --platform web`).

## Requisitos
1. **Build**: script npm `build:web` = `expo export --platform web` y `serve:web` (servidor estático simple con `npx serve dist` o un script Node sin dependencias en `scripts/serve-dist.mjs`).
2. **Manifiesto y metadatos**: `public/manifest.webmanifest` (nombre "VidaSim", `display: standalone`, `theme_color` `#0E7C7B`, `background_color` `#FBF7F0`, íconos 192/512 y *maskable*), etiquetas `apple-touch-icon`, `apple-mobile-web-app-capable`, `viewport-fit=cover`, título y descripción. Para iOS: splash con el fondo crema.
3. **Íconos propios**: reemplazar los íconos por defecto de Expo (`assets/icon.png`, `adaptive-icon`, `favicon`, splash) por un ícono de VidaSim **generado por código** (script `scripts/gen-app-icon.mjs`, SVG → PNG con `sharp` como devDependency o con `react-native-svg` renderizado): fondo petróleo, un símbolo simple (reloj de arena o "V" con hoja de vida), sin marcas ajenas.
4. **Offline**: service worker manual (`public/sw.js`, sin Workbox) con estrategia *cache-first* para los estáticos versionados y *network-first* para `index.html`; versionado por hash del build; registro en el `index.html` exportado (plantilla `web/index.html` de Expo). Probarlo: cargar, cortar red, recargar → funciona.
5. **Guardado en web**: comprobar que AsyncStorage (localStorage) persiste, que `Share.share` no es necesario (ya hay copia al portapapeles), y que el límite de ~5 MB de `localStorage` no se supera con el mundo + 3 ranuras (medir; si hace falta, comprimir o usar IndexedDB detrás de una capa `storage.ts` compatible con AsyncStorage). Documentar el resultado.
6. **Documentación** `docs/13-instalacion.md` con: (a) cómo servir `dist/` gratis (GitHub Pages / Netlify / Vercel) **sin ejecutarlo**, con los pasos y advertencias (HTTPS obligatorio para PWA; los datos quedan en el navegador de ese dominio, así que cambiar de dominio pierde las partidas → usar la copia de seguridad); (b) instalar en iPhone (Safari → Compartir → Agregar a inicio); (c) alternativa EAS/Apple Developer (USD 99/año, TestFlight) y Xcode gratis con perfil de 7 días; (d) tabla de pros y contras.

## Criterios de aceptación
- [ ] `npm run build:web` genera `dist/` sin errores; `npm run serve:web` lo sirve y el juego funciona (crear vida, envejecer, guardar, recargar).
- [ ] Test/verificación del manifiesto (JSON válido, campos requeridos) y del service worker (lista de precache incluye los JS/CSS del build; corre un chequeo Node del archivo).
- [ ] Modo offline verificado en el navegador (Network → Offline → recarga OK) y descrito en el reporte.
- [ ] Sin **ningún** despliegue, `git push` ni cuenta externa tocada.
- [ ] `npm run check` verde; `docs/09` (decisión abierta actualizada con los hallazgos), `docs/13`, `CHANGELOG.md`, `README.md` (sección "Instalar en el iPhone").

## Fuera de alcance
Publicar en la App Store; notificaciones push; sincronización en la nube.

## Riesgos
- El export web de Expo puede requerir ajustes de `metro.config`/`app.json` (`web.bundler`, `output: 'static'|'single'`): leer la doc de la versión 57 antes.
- iOS es estricto con PWA (sin service worker en algunos contextos, almacenamiento que puede purgarse tras semanas sin uso): documentarlo y recomendar la copia de seguridad periódica.
