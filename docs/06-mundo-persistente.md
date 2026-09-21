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

## Estado actual (implementado en la Fase 3)
- **Linaje**: cada vida tiene `lineageId` y `generation`; al morir se elige un heredero (hijo vivo o, si no hay, hermano) y la nueva vida continúa desde la edad que ese pariente tenía al morir el personaje anterior, en el mismo año calendario.
- **Pasado del heredero**: se simula automáticamente (`engine/autoplay.ts`) con la familia real (el personaje anterior y su pareja como padres, hermanos verdaderos) "congelada" durante la simulación.
- **Herencia**: se reparte el patrimonio neto menos 20% de impuesto; el heredero recibe 85% si es hijo único, 60% si tiene hermanos. Se heredan `famous_family` (patrimonio ≥ $500.000) o `infamous_family` (antecedentes/homicidio), que activan eventos de dinastía.
- **Árbol genealógico** y **puntaje de legado** por vida y por dinastía.
- Aún sin hacer: calendario global compartido entre vidas, NPCs persistentes (ex, rivales) y estado del mundo dinámico (Fase 4-5).

## Implementación por etapas
1. Fase 3: solo herencia + árbol genealógico + logros persistentes.
2. Fase 4: calendario global y eventos históricos simples por era.
3. Fase 5: NPCs persistentes y estado del mundo dinámico.
