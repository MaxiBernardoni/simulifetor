# 09 · Decisiones

## Cerradas

| Tema | Decisión |
|---|---|
| Plataforma | iPhone (y Android por añadidura), Expo + TypeScript; se prueba con Expo Go |
| Guardado | Local y offline, 3 ranuras + copia de seguridad exportable |
| Idioma | Español rioplatense |
| País | Genérico |
| Tono | Humor negro, caótico, algo más realista, adulto, sin límites — **salvo**: nunca sexo con menores (regla fija, también para la IA) |
| Base de sistemas | Los de BitLife (adaptados con identidad propia) |
| Stats | Felicidad, Salud, Inteligencia, Apariencia |
| Época de arranque | **Aleatoria**: año de nacimiento sorteado entre 1950 y 2010 |
| Avatar | **Personalizable** (piel, ojos, peinado, color de pelo) dibujado con SVG |
| Estética | Tema claro estilo simulador de vida **con identidad propia** (paleta petróleo/coral/crema; sin copiar marcas ni logos) |
| Íconos | Vectoriales (lucide), no emojis; ~110 en un mapa explícito |
| Ilustraciones | Escenas SVG compuestas por evento; animadas |
| Modos | Vida libre + escenarios; al morir se continúa con un familiar |
| Continuidad | **Árbol genealógico jugable**: familia viva con bots; solo se puede cambiar a parientes de sangre vivos a **≤ 2 generaciones** |
| Herencia | Hijo 85 % (60 % con hermanos) del patrimonio a heredar (80 % del neto); otro pariente 15 % |
| IA | Base sin IA; capa opcional con clave gratuita propia (no implementada aún) |
| Sonido | Solo sonidos de interfaz mínimos (no implementado aún) |
| Sistemas prioritarios | Relaciones, carrera/dinero, crimen (hechos) |
| Uso | Personal, no comercial ni público (por ahora) |

## Abiertas

- **Nombre** del juego (provisorio: VidaSim).
- **Abuso por saltos encadenados** — ✅ **resuelto (T16)**: la distancia también se mide desde el personaje ancla (arranque de la ranura o quien tomaste tras una muerte), hay un enfriamiento de **5 años** entre cambios y un tope de **3 cambios por generación**. Todo se anula cuando el personaje actual muere. Valores en `engine/kinship.ts` (`SWITCH_COOLDOWN_YEARS`, `MAX_SWITCHES_PER_GENERATION`; en 0 se desactivan). Ajustalos si te resultan muy duros o muy blandos.
- **Instalación permanente en el iPhone**: PWA (gratis) vs. cuenta de Apple Developer. Ver T13.
- **Dificultad**: hoy una sola ("realista con caos"). ¿Modos fácil/difícil?
- **Dinero y época**: no hay inflación ni escalas por época todavía (salarios y precios son fijos). Ver T05.
- **Mundo persistente completo**: NPCs fuera de la familia (amigos, rivales, ex). Ver T07.
- **Cuenta de Google** para una API key gratuita, solo si se hace la capa de IA. Ver T06.
- **Privacidad de las copias de seguridad**: el texto exportado contiene todo el progreso sin cifrar (uso personal, sin problema por ahora).
