# 12 · Verificación y testing

## Qué se prueba automáticamente (`npm test`)

`src/engine/engine.test.ts`
- **Contenido**: ids únicos, todo evento tiene texto y efectos o decisiones, los `trigger` apuntan a eventos que existen, actividades/acciones con ids únicos, carreras con niveles, ≥ 100 eventos.
- **Motor**: `createLife` determinista con la misma semilla, rango del año de nacimiento, `ageUp` avanza edad y año, reemplazo de `{placeholders}`, **300 vidas simuladas** (terminan, stats en 0–100, esperanza de vida 55–95, deuda > −$100.000), misma semilla = misma vida.
- **Fase 2**: arresto → sentencia, absolución, condena acotada en menores, compra financiada, capacidad de préstamo, el juicio se dispara y resuelve, sin `{placeholders}` sin resolver en 120 vidas.
- **Escenas**: todo evento/actividad/acción resuelve a una escena existente.
- **Fase 3**: todos los escenarios se crean y arrancan activos a la edad correcta, "Volver a empezar" arranca preso, `checkScenario` gana/pierde, el legado no es negativo.

`src/engine/world.test.ts`
- Etiquetas de parentesco; regla de cambio (permitidos: padres, abuelos, hermanos, tíos, primos, sobrinos, hijos; bloqueados: cuñados, tíos políticos, tíos abuelos, primos segundos, sobrinos segundos…); razones de bloqueo; el bosque no repite descendientes.
- Mundo: `createWorld` arma padres/abuelos con referencias válidas, 60 años de simulación consistentes (edades, muertes, géneros de padres), hijos nacidos en la vida aparecen como parientes de sangre, materializar un hermano da una vida coherente, los bots viven hasta morir, `syncLifeToWorld` es idempotente.

## Verificar la UI en el navegador

```bash
CI=1 npx expo start --web --port 8091      # usá un puerto libre; en modo CI NO recarga: reiniciá tras cada cambio
```

Abrí `http://localhost:8091` con viewport móvil (375×812). Ganchos de desarrollo en la consola:

```js
const g = globalThis.__game, st = () => g.getState();
st().startCreating(); st().setCreating({ step: 'create' });
st().newLife({ name: 'Ana', surname: 'Prueba', gender: 'F' });
// jugar años rápido resolviendo decisiones
const play = (n) => { let m = 0; while (m < n && st().life.alive) { const l = st().life;
  if (l.pending.length) { const p = l.pending[0]; p.kind === 'result' ? st().dismiss() : st().choose(0); }
  else { st().ageUp(); m++; } } };
play(30);
g.setState({ tab: 'tree' });                 // abrir una pantalla
globalThis.__kin.relationLabel(w, a, b);      // parentesco (w = st().world.world)
```

Checklist de una tarea de UI: sin errores en consola, funciona en 375×812, esperar ~2 s antes de capturas (animaciones), probar el estado vacío y el de "muerto".

## Scripts útiles

- **Regenerar el mapa de íconos** (`ui/Icon.tsx`): recorre `src/**` buscando `icon: '…'`, `icon="…"`, `name="…"` y genera imports explícitos verificando que existan en `lucide-react-native`. El script usado está descrito en `docs/tareas/T14-calidad-de-codigo.md` (conviene dejarlo como `scripts/gen-icons.mjs`).
- **Medir balance**: hoy se hace con tests temporales (`_probe.test.ts`) que corren `simulateLife` en bucle. La tarea T01 lo convierte en un comando permanente.

## Qué NO está cubierto (huecos conocidos)

- No hay tests de UI (componentes). La UI se verifica a mano.
- No se probó en un iPhone físico el rendimiento de las animaciones ni del mundo (solo en Node y en el navegador).
- El guardado en AsyncStorage no tiene test automatizado (se probó a mano: recargar y comparar).
- No hay pruebas de propiedades / fuzz masivo del motor (tarea T02).


## Robustez (T02)

- `engine/invariants.ts`: `checkLife(life)` y `checkWorld(wd, life?)` devuelven la lista de violaciones (stats 0–100, números finitos, edad = año − nacimiento, una sola pareja viva, sin placeholders `{…}` en el log, ida y vuelta por JSON idéntica; referencias del árbol válidas, parejas recíprocas entre vivos, sin ciclos de ancestros, hijos ≥ 12 años menores que sus padres…).
- `engine/robustness.test.ts`: cuatro perfiles de bot (sin crimen, crimen alto, sesgo familiar, por defecto) revisados en 6 edades, los 9 escenarios × 11 vidas y un fuzz de mundos con cambio de personaje cada 3–7 años. **Muestra chica por defecto; `FULL=1 npm test` corre 1.000 vidas por perfil y 200 mundos.**
- `engine/switch.ts` (`performSwitch`): el cambio de personaje es una función pura del motor (el store la usa), para poder probarlo sin UI.
- `store/gameStore.test.ts`: AsyncStorage simulado en memoria; cubre guardado por ranura, recarga, cambio de ranura, exportar/borrar/importar, importación inválida, migración desde `vidasim.save.v1`, partida corrupta y cambio de personaje con decisiones pendientes.
- No cubierto: componentes de UI, animaciones, `expo-secure-store` (la IA usa proveedores simulados).
- Ojo: `createLife`/`materializeLife`/`createScenarioLife` usan `Date.now()` como semilla en algunos caminos, así que algunas pruebas de mundo no son 100 % reproducibles: los invariantes están pensados para valer siempre.
