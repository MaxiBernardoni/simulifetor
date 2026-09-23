# T19 · Más peinados y avatares que reflejen la edad

- **Prioridad / esfuerzo:** media / L
- **Depende de:** —
- **Autonomía:** ✅ segura (arte SVG + contenido; no toca el motor)
- **Estado:** todo

Pedido de Max (23/09/2026): hoy los peinados se repiten mucho entre personajes, y el avatar de cualquiera (un bebé, un adolescente, un adulto, un anciano) se dibuja igual — nada en `AvatarArt` cambia con la edad.

## Objetivo
1. Muchos más peinados, para que dos personas al azar no terminen pareciéndose todo el tiempo.
2. Que el avatar de cada personaje se vea distinto según su edad: de bebé/niño a joven, adulto y anciano.

## Contexto (archivos que hay que leer/tocar)
- `src/content/look.ts`: `HAIRS` (hoy 20: 10 de hombre, 10 de mujer; el índice es el id guardado en `Look.hairStyle` — **no reordenar los existentes**, solo agregar al final, porque hay partidas guardadas con esos números). `hairStylesFor`, `hairForGender`.
- `src/ui/Avatar.tsx`: `hair(style, ...)` dibuja cada peinado a mano en SVG (agregar uno = agregar un `case`); `AvatarArt({ look, mood, shirt, gray, mask, blink })` arma la cara completa — **no recibe la edad**; `Avatar` (wrapper animado) y `PersonAvatar` (`ui/components.tsx`, para gente del árbol/relaciones) tampoco la pasan.
- `scripts/gen-icons.mjs` no aplica acá (los peinados no son íconos de `lucide-react-native`, son SVG propios).
- Dónde se usan avatares con la edad ya disponible: `ui/screens/LifeScreen.tsx` (`life.age`), `ui/screens/PeopleScreen.tsx` / `ui/components.tsx` (`PersonAvatar` ya recibe `person.age` y `life`), `ui/Avatar.tsx` mismo (creación de personaje, sin vida todavía → tratar como adulto).

## Requisitos
1. **Más peinados** (agregar a `HAIRS`, al final, sin tocar los índices existentes): sumar variedad real, no solo 2 o 3 más — apuntar a duplicar la lista o más (≈ 20 nuevos, la mitad y mitad). Cada uno necesita su propio dibujo en `hair()` (nada de reciclar el mismo path con otro nombre). Mantener la paleta y el estilo plano existente (ver `docs/07-ui-ux.md`), sin copiar peinados de otras apps.
2. **Reflejar la edad en el avatar**, con una función de "etapa" a partir de la edad (algo como bebé < 2, niño/a < 12, adolescente < 18, adulto < 60, mayor ≥ 60 — ajustar a ojo mirando cómo queda) que cambie el dibujo:
   - Proporciones (cabeza más grande y cuerpo más chico de bebé a adulto; ver si ya hay algo así o hay que agregarlo).
   - Pelo: canas progresivas en "mayor" (ya existe un prop `gray` sin usar — conectarlo a la edad en vez de dejarlo muerto; capaz con un gris parcial antes de la canicie completa).
   - Arrugas o algún detalle simple en la piel de la etapa "mayor".
   - Bebés/niños chiquitos: sin vello facial ni ciertos peinados que no correspondan (ver que `hairStylesFor` no ofrezca en la creación de personaje un peinado adulto rarísimo en un bebé — es un detalle menor, no bloqueante).
3. Pasar la edad real a todos los lugares donde se dibuja un avatar con datos de una `Life`/`Person` (`LifeScreen`, `PersonAvatar`, la creación de personaje usa una edad fija de adulto ya que ahí no hay vida todavía).

## Criterios de aceptación
- [ ] `npm run check` en verde.
- [ ] Tests: `hairStylesFor`/`hairForGender` siguen devolviendo ids válidos con la lista ampliada; una prueba que la etapa de edad se calcula bien en los bordes (1, 2, 11, 12, 17, 18, 59, 60 años o los que se elijan); invariantes/partidas viejas no se rompen (los índices de peinado existentes no cambiaron de significado).
- [ ] UI verificada a 375×812: capturas de un mismo personaje en al menos 4 edades distintas mostrando el cambio, y de la pantalla de creación de personaje con varios peinados nuevos.
- [ ] Docs (`docs/07-ui-ux.md`) y `CHANGELOG.md`.

## Fuera de alcance
- Vestimenta/ropa que cambie con la edad o el trabajo (no pedido).
- Reproducir el sistema de "morphing" continuo de otros juegos; alcanza con 3–5 etapas discretas.

## Riesgos y cómo mitigarlos
- Con 40 peinados el selector de la creación de personaje puede quedar largo: paginar o hacer scroll, no es necesario un rediseño grande.
- Dibujar bien "anciano" y "bebé" a mano en SVG lleva tiempo de prueba y error visual; conviene iterar mirando capturas en el navegador antes de darlo por terminado.
