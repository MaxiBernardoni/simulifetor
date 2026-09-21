# 06 · Mundo persistente, legado y eventos históricos

> Sección más abierta del diseño: acá hay propuesta, no decisión final.

## Idea
Las vidas no son aisladas. Hay un **mundo** con calendario propio, personas y familias que continúan entre una vida y otra.

## Componentes
### 1. Línea de tiempo global
- **Decidido:** el año de nacimiento de cada vida es **aleatorio** dentro de un rango (propuesta: 1950–2010). Por eso el motor debe conocer el año calendario desde el MVP: eventos, trabajos y actividades tienen restricción por año (ej. no hay redes sociales antes de cierta fecha, cambian los salarios y la moneda).
- Modo dinastía: el heredero continúa cronológicamente desde la muerte del anterior.
- Abierto: si el mundo tiene un calendario global único o cada vida es independiente al sortear época.

### 2. Eventos históricos (país genérico)
Eventos por era que afectan a todos los personajes vivos en esa época:
- Crisis económicas e hiperinflación, recesiones.
- Guerras/conflictos civiles y servicio militar.
- Pandemias.
- Avances tecnológicos (internet, celulares, redes sociales, IA) que habilitan/eliminan trabajos y actividades.
- Cambios políticos y de leyes (legalización de sustancias, derechos, pena de muerte…).
- Modas y cultura de cada década.

Se definen como eventos con condición `era` y efectos sobre el **estado del mundo** (`World.economy`, `World.laws`, `World.tech`), que a su vez modifican pesos y disponibilidad de contenido (por ejemplo, no hay redes sociales antes de cierto año).

### 3. Linaje / dinastía
- Al morir, se elige heredero entre hijos/nietos/parientes.
- Se heredan: dinero (menos impuestos), propiedades, apellido, **reputación familiar**, antecedentes de la familia (mala fama), rasgos genéticos.
- Árbol genealógico visible.

### 4. NPCs persistentes
- Personas importantes de vidas pasadas (ex, rivales, socios, hijos no heredados) siguen "vivas" y envejecen en el mundo; pueden aparecer en vidas futuras con memoria de lo que pasó.

### 5. Estado del mundo
`World` guarda: año global, economía, leyes vigentes, tecnología disponible, personas notables, logros globales, registro de vidas pasadas (museo/salón de la fama).

## Preguntas a resolver
- ¿El mundo avanza solo al jugar o también cuando jugás otra vida en paralelo?
- ¿Empezar desde 1950 o desde otra fecha? ¿Se puede llegar al futuro (2050+)?
- ¿Cuánto influye una vida pasada en las siguientes (pequeño guiño vs. gran consecuencia)?
- ¿Se permite "vida nueva desde cero" sin mundo (modo clásico)?

## Familia viva y árbol jugable (implementado tras la Fase 3)
- **Mundo compartido**: cada partida tiene un `World` con todas las personas de la familia como nodos de un árbol (`engine/world.ts`). Todos comparten el mismo año calendario: cada vez que envejecés, el resto de la familia también.
- **Dos niveles de simulación**: quien ya jugaste sigue con una **vida completa** que maneja un bot (`engine/autoplay.ts`, trabaja, gasta, se casa, tiene hijos y muere); quien nunca controlaste se simula de forma **liviana** (edad, pareja, hijos y muerte). Al cambiar a alguien liviano, se le **genera su vida completa** (`engine/materialize.ts`), coherente con su edad, sus padres, hermanos, pareja e hijos reales.
- **Regla anti-abuso** (`engine/kinship.ts`): solo se puede vivir la vida de **parientes de sangre vivos con hasta 2 generaciones de distancia** hasta el ancestro común (padres, abuelos, hermanos, hijos, nietos, tíos, sobrinos y primos). Cuñados, suegros, parejas, sobrinos nietos y primos segundos aparecen en el árbol pero están **bloqueados**.
- **Árbol dibujado** como el de una familia: parejas unidas por una línea y sus hijos colgando; anillo verde = se puede jugar, gris punteado = bloqueado, gris = fallecido.
- Al morir, se elige entre los parientes elegibles (los hijos heredan la mayor parte del patrimonio).
- Tope de simulación medido: ~0,5 ms por año para ~50 personas.

## Estado (Fase 3, versión anterior: solo herederos)
- **Linaje**: cada vida tiene `lineageId` y `generation`; al morir se elige un heredero (hijo vivo o, si no hay, hermano) y la nueva vida continúa desde la edad que ese pariente tenía al morir el personaje anterior, en el mismo año calendario.
- **Pasado del heredero**: se simula automáticamente (`engine/autoplay.ts`) con la familia real (el personaje anterior y su pareja como padres, hermanos verdaderos) "congelada" durante la simulación.
- **Herencia**: se reparte el patrimonio neto menos 20% de impuesto; el heredero recibe 85% si es hijo único, 60% si tiene hermanos. Se heredan `famous_family` (patrimonio ≥ $500.000) o `infamous_family` (antecedentes/homicidio), que activan eventos de dinastía.
- **Árbol genealógico** y **puntaje de legado** por vida y por dinastía.
- Aún sin hacer: calendario global compartido entre vidas, NPCs persistentes (ex, rivales) y estado del mundo dinámico (Fase 4-5).

## Implementación por etapas
1. Fase 3: solo herencia + árbol genealógico + logros persistentes.
2. Fase 4: calendario global y eventos históricos simples por era.
3. Fase 5: NPCs persistentes y estado del mundo dinámico.


## Eras (implementado)

El año calendario ya compartido por la familia determina la época: tecnología, leyes, precios y sueldos (`content/eras.ts`, ver `docs/10`). Cada personaje del árbol vive su vida en el contexto de su propio año.
