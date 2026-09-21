# VidaSim (nombre provisorio)

Simulador de vida en texto para celular, estilo BitLife: humor negro, caótico, algo más realista, para mayores de edad y sin censura. Uso personal, 100% offline, código propio y modificable.

## Cómo correrlo

Requisitos: Node.js 20+ y la app **Expo Go** en el iPhone (PC y celu en la misma red Wi-Fi).

```bash
npm install
npx expo start
```

Escaneá el QR con la cámara del iPhone (abre Expo Go). También se puede probar en la PC con `npx expo start --web`.

Tests del motor (simula cientos de vidas completas):

```bash
npm test
```

## Estructura

| Carpeta | Contenido |
|---|---|
| `src/engine` | Motor del juego: lógica pura TypeScript, sin React. Testeable. |
| `src/content` | **Datos moddeables**: eventos, actividades, acciones con personas, carreras, nombres. |
| `src/store` | Estado (Zustand) y guardado local (AsyncStorage). |
| `src/ui` | Pantallas y componentes. |
| `docs` | Documentación de diseño. |

Para agregar contenido, editá los archivos de `src/content` (ver `docs/04-contenido-y-eventos.md`). El test valida ids únicos y referencias.

## Documentación

| Doc | Contenido |
|---|---|
| [01-vision.md](docs/01-vision.md) | Qué es, tono, principios, público, lo que NO es |
| [02-stack-y-arquitectura.md](docs/02-stack-y-arquitectura.md) | Tecnología elegida, estructura, capas, guardado |
| [03-game-design.md](docs/03-game-design.md) | Stats, ciclo de juego, sistemas |
| [04-contenido-y-eventos.md](docs/04-contenido-y-eventos.md) | Formato de datos de eventos, condiciones, efectos |
| [05-ia.md](docs/05-ia.md) | Cómo integrar IA sin pagar y sin depender de ella |
| [06-mundo-persistente.md](docs/06-mundo-persistente.md) | Legado, dinastías, eventos históricos |
| [07-ui-ux.md](docs/07-ui-ux.md) | Pantallas, navegación, estilo visual |
| [08-roadmap.md](docs/08-roadmap.md) | Fases de desarrollo |
| [09-decisiones-abiertas.md](docs/09-decisiones-abiertas.md) | Decisiones cerradas y abiertas |
| [10-motor-y-formulas.md](docs/10-motor-y-formulas.md) | Cómo funciona el motor hoy: orden del año, fórmulas, economía, mundo familiar |
| [11-guardado-y-migraciones.md](docs/11-guardado-y-migraciones.md) | Claves de guardado, ranuras, versiones de esquema, backups |
| [12-verificacion-y-testing.md](docs/12-verificacion-y-testing.md) | Qué cubren los tests y cómo verificar la UI |
| [../CHANGELOG.md](CHANGELOG.md) | Historial de cambios |
| [../CLAUDE.md](CLAUDE.md) | Guía para agentes (convenciones, trampas, definición de "terminado") |
| [tareas/](docs/tareas/README.md) | **Backlog de tareas complejas** y prompt de la rutina nocturna |

## Estado

**Fase 1 (MVP jugable) completa**: crear vida aleatoria (año de nacimiento 1950–2010), envejecer año a año, 133 eventos, 28 actividades, 13 acciones con personas, 4 stats, escuela y universidad, trabajo con ascensos, relaciones básicas, dinero y deudas, crimen y cárcel, muerte y resumen, guardado automático.

**Fase 2 (núcleo) completa**: 190+ eventos (con personas específicas como objetivo), 15 acciones con personas (engañar, divorciarse, cortar contacto…), 25 carreras con eventos por sector, propiedades, autos, préstamos e inversiones, delitos con arresto y **juicio** (abogado de oficio/privado, soborno, declararse culpable), cárcel con libertad condicional, fuga y reinserción, y 19 logros.

**Familia viva**: árbol genealógico jugable donde cada persona vive su propia vida (bots) y podés cambiar a parientes de sangre hasta 2 generaciones de distancia. **Fase 3 (dinastía y modos) completa**: al morir podés **continuar con un hijo o hermano** (hereda apellido, parte del patrimonio y la fama o infamia de la familia; su pasado se simula automáticamente), **árbol genealógico** con puntaje de legado, **9 escenarios** con objetivo y tiempo límite (Del barro al éxito, Millonario joven, Vida ejemplar, Rey del hampa, Volver a empezar, Centenario, Familia numerosa, Cerebro brillante, Hogar dulce hogar), **3 ranuras de partida** y **copia de seguridad** exportable/importable. Además: ilustraciones por evento (33 escenas SVG) y animaciones.

Próximo: Fase 4 (mundo e historia: calendario global, tecnología y leyes que cambian, capa opcional de IA), ver `docs/08-roadmap.md`.

- [`docs/13-instalacion.md`](docs/13-instalacion.md): publicarlo online gratis e instalarlo en el iPhone.
