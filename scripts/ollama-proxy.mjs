// Mini-proxy para usar Ollama desde otro dispositivo (por ejemplo el iPhone vía Tailscale Serve).
// Ollama rechaza (403) los pedidos cuyo encabezado Host no sea local; este proxy escucha SOLO en 127.0.0.1
// y reenvía a Ollama con Host "localhost:11434". No abre nada a la red: quien lo publica es `tailscale serve`.
// Uso: node scripts/ollama-proxy.mjs [puertoProxy=11435] [puertoOllama=11434]
import http from 'node:http';

const PROXY_PORT = Number(process.argv[2]) || 11435;
const OLLAMA_PORT = Number(process.argv[3]) || 11434;

http
  .createServer((req, res) => {
    const headers = { ...req.headers, host: `localhost:${OLLAMA_PORT}` };
    const up = http.request({ host: '127.0.0.1', port: OLLAMA_PORT, path: req.url, method: req.method, headers }, (r) => {
      res.writeHead(r.statusCode ?? 502, r.headers);
      r.pipe(res); // streaming: las respuestas largas llegan a medida que se generan
    });
    up.on('error', () => {
      res.writeHead(502, { 'Content-Type': 'text/plain' });
      res.end('No se pudo conectar con Ollama (¿está corriendo?)');
    });
    req.pipe(up);
  })
  .listen(PROXY_PORT, '127.0.0.1', () => console.log(`Proxy en http://127.0.0.1:${PROXY_PORT} → Ollama :${OLLAMA_PORT}`));
