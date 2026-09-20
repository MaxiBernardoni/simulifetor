# 02 · Stack y arquitectura

## Decisión: Expo (React Native) + TypeScript
**Por qué:**
- Desarrollás en Windows y probás en tu iPhone **sin Mac**: instalás *Expo Go* desde el App Store, escaneás un QR y la app corre en el celu, con recarga en vivo.
- Un solo código para iOS y Android.
- TypeScript + datos tipados = ideal para "vibecodear" con menos errores.
- Sin motor de juego pesado: el juego es UI de texto/listas.

**Limitaciones a saber:**
- Expo Go sirve mientras la PC y el iPhone estén en la misma red Wi-Fi. Para tener la app instalada "de forma permanente" en el iPhone se necesita cuenta de Apple Developer (USD 99/año) o Mac + Xcode (perfil gratis que caduca a los 7 días). Alternativa gratuita: publicarla como **PWA** (web app) y "Agregar a pantalla de inicio" en Safari. La arquitectura lo permite (Expo soporta web).

## Librerías propuestas
| Necesidad | Elección |
|---|---|
| Navegación | Tabs propias con estado (Zustand); expo-router queda para cuando haya más pantallas |
| Estado | Zustand |
| Guardado local | AsyncStorage (JSON versionado); SQLite si el mundo persistente lo requiere |
| Íconos | Phosphor / Lucide (set consistente, no emojis) |
| Animaciones | react-native-reanimated (livianas) |
| Sonidos UI | expo-audio (clics, notificaciones) |
| Tests del motor | Vitest/Jest |
| Validación de datos | Tipos de TypeScript + tests del contenido; Zod se suma con la capa de IA |

## Principio clave: motor separado de la UI
```
/src
  /engine        ← lógica pura TypeScript, SIN React. Testeable en la PC.
    state.ts       estado de la vida (Life)
    rng.ts         azar con semilla (reproducible)
    ageUp.ts       avanzar un año
    eventEngine.ts elegir y aplicar eventos
    conditions.ts  evaluador de condiciones
    effects.ts     aplicador de efectos
    systems/       school, career, relationships, crime, health, finance...
  /content       ← DATOS (moddeables)
    events/*.json|ts
    jobs/, diseases/, education/, names/, countries/, eras/
  /ai            ← integración opcional (ver doc 05)
  /store         ← Zustand: conecta engine con UI y persistencia
  /ui            ← componentes y pantallas
  /app           ← rutas (expo-router)
  /assets        ← íconos, sonidos
/docs
```
Reglas:
1. `engine` no importa nada de React ni de Expo. Recibe estado + acción y devuelve estado nuevo (funciones puras).
2. El azar sale de un RNG con semilla → se pueden reproducir bugs y escribir tests.
3. El contenido se carga desde `/content` y se valida con Zod al arrancar.
4. La UI solo lee el estado y dispara acciones.

## Modelo de datos (resumen)
- `Life`: id, semilla, personaje (nombre, género, rasgos), edad, año, país, stats, salud/enfermedades, educación, trabajo, finanzas (dinero, deudas, propiedades), relaciones, antecedentes penales, historial (log de eventos), flags (banderas), logros.
- `World` (persistente entre vidas): año global, línea de tiempo histórica, linaje/familias, NPCs vivos, legado, logros globales. Ver doc 06.
- `Settings`: preferencias, sonido, clave de IA opcional.

## Guardado
- Autoguardado al terminar cada año.
- Varias partidas/ranuras. El `World` es único e independiente de la vida activa.
- Formato JSON versionado (`schemaVersion`) con migraciones para no perder partidas al cambiar el juego.
- Exportar/importar partida como archivo (backup).

## Rendimiento
Vida de 100 años = 100 turnos. Cada turno evalúa cientos de eventos → indexar eventos por etiquetas y rango de edad para no evaluar todos.
