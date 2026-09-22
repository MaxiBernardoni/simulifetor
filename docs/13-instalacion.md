# 13 · Publicarlo online gratis y usarlo en el iPhone

VidaSim se exporta como **sitio estático** (`npm run build:web` → carpeta `dist/`). Cualquier hosting estático gratuito sirve. En el iPhone se abre en Safari y se agrega a la pantalla de inicio: queda como una app, sin App Store ni Expo Go.

## Desde la terminal (Cloudflare Workers Static Assets)

El repo ya trae `wrangler.jsonc`. Una sola vez: `npx wrangler login` (abre el navegador para autorizar). Después, cada vez que quieras publicar: `npm run deploy:web`. Queda en `https://vidasim.<tu-subdominio>.workers.dev`.

## Deploy automático (Workers Builds, repo conectado por Git)

Si conectaste el repo a un proyecto de **Workers** en el dashboard de Cloudflare (*Workers & Pages* → tu Worker → *Settings* → *Builds*), cada `git push` a `main` dispara un deploy solo: Cloudflare clona el repo, instala dependencias y corre `npx wrangler deploy` directo (sin un paso de "build" propio como en Pages). Por eso `wrangler.jsonc` tiene `build.command: "npm run build:web"`: es Wrangler mismo el que genera `dist/` antes de desplegar (`[custom build] Running: npm run build:web` en el log). Sin esa línea, el deploy falla con `El directorio "dist" no existe`. Se puede probar en seco y sin publicar nada con `npx wrangler deploy --dry-run`.

## Opción por Git: Cloudflare Pages (o Netlify / Vercel)

Las tres son gratis para uso personal, dan HTTPS (obligatorio) y se actualizan solas con cada `git push`.

**Cloudflare Pages**
1. Cuenta gratis en https://dash.cloudflare.com → *Workers & Pages* → *Create* → *Pages* → *Connect to Git*.
2. Elegí el repo `MaxiBernardoni/simulifetor`, rama `main`.
3. Configuración de build: **Build command** `npm run build:web` · **Build output directory** `dist` · variable de entorno `NODE_VERSION` = `22`.
4. *Save and Deploy*. Te da una URL `https://<algo>.pages.dev`.

**Netlify**: *Add new site → Import from Git*, mismo comando y carpeta `dist`.
**Vercel**: *Add New → Project*, *Framework Preset: Other*, *Build Command* `npm run build:web`, *Output Directory* `dist`.

Sin cuenta ni Git: `npm run build:web` y arrastrá la carpeta `dist` a https://app.netlify.com/drop.

## Instalarlo en el iPhone
1. Abrí la URL en **Safari** (no en Chrome).
2. Botón *Compartir* → **Agregar a pantalla de inicio**.
3. Se abre a pantalla completa, con su ícono.

## Cosas importantes (leelas)
- **Las partidas se guardan en el navegador del iPhone, por dominio.** Si cambiás de URL (por ejemplo de `*.pages.dev` a un dominio propio) o borrás los datos de Safari, **empezás de cero**. Usá Menú → *Copia de seguridad* para exportar/importar tu partida. iOS puede además limpiar los datos de sitios que no abrís por semanas: hacé copias de vez en cuando.
- **La app publicada es pública**: cualquiera con la URL la puede abrir (no hay datos tuyos ahí, las partidas viven en cada dispositivo). Si no querés eso, no compartas el enlace; Cloudflare Access permite protegerla gratis.
- **La clave de la IA en la web** se guarda en el almacenamiento del navegador (no en el llavero seguro como en la app nativa). Usá una clave gratuita y revocable.
- **IA con modelo propio (Ollama en tu PC)**: desde un sitio `https://` el navegador bloquea pedir a `http://IP-local` (contenido mixto). Para eso hace falta exponer tu Ollama con HTTPS (por ejemplo con un túnel gratuito de Cloudflare) o usar Gemini/Groq.
- **Sin modo offline todavía**: si no hay conexión, la primera carga falla; una vez abierto funciona. (Falta un *service worker*, pendiente en T13.)
- El ícono es el de plantilla de Expo: falta un ícono propio (T13).

## Alternativa: GitHub Pages
Gratis y sin cuentas nuevas, pero sirve el sitio en una subruta (`/simulifetor/`) y hace falta configurar `experiments.baseUrl` en `app.json` y una acción de GitHub que corra el build. Es más trabajo que las opciones de arriba.

## Otras vías (no gratis o más complejas)
| Vía | Costo | Notas |
|---|---|---|
| Expo Go (la de ahora) | gratis | PC y celular en la misma red |
| TestFlight con EAS | USD 99/año (cuenta Apple Developer) | app nativa "de verdad" |
| Xcode + cuenta gratis | gratis | la instalación caduca a los 7 días |
