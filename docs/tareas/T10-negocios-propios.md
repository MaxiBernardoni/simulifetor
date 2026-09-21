# T10 · Negocios propios

- **Prioridad / esfuerzo:** media · L
- **Depende de:** T05 (precios por época) — opcional pero recomendado
- **Autonomía:** ✅ segura
- **Estado:** todo

## Objetivo
Permitir emprender: abrir un negocio, decidir cuánto invertir, contratar gente, ver ganancias y pérdidas anuales y vivir sus crisis. Es la salida "de riesgo" para hacer plata (o perderla) sin ser empleado.

## Contexto
- `src/engine/assets.ts` (bienes, préstamos, inversiones), `engine/ageUp.ts` (`updateWork`, gastos), `engine/types.ts`, `content/assets.ts`, `ui/screens/AssetsScreen.tsx`, `content/events/money.ts`.
- `docs/10-motor-y-formulas.md` (economía).

## Requisitos
1. **Modelo** (campo opcional `Life.business?: Business`, migración `undefined`): `{ kind, name, opened: number, capital: number, employees: number, quality: 0–100, profitLast: number, debt: number, marketing: number }`.
2. **Tipos de negocio** (`content/businesses.ts`, ≥ 10): kiosco, cafetería, restaurante, peluquería, taller mecánico, tienda de ropa, gimnasio, estudio de diseño, agencia de viajes, bar/boliche, productora, huerta/vivero. Cada uno: inversión inicial mínima, margen esperado, sensibilidad a la economía, riesgo, carreras que dan ventaja (p. ej. cocinero → restaurante).
3. **Apertura** (Activos → Negocio): elegir tipo, nombre, capital (de tu dinero y/o préstamo), contratar empleados. Requiere edad ≥ 18 y sin condena vigente.
4. **Ciclo anual** (`updateBusiness` llamado desde `ageUp`): ingresos ≈ demanda × calidad × (1 + marketing) × ciclo económico; costos = sueldos de empleados + alquiler + insumos + impuestos; resultado anual sorteado con varianza; se suma/resta al dinero (si el negocio pierde más de lo que tenés, aparece deuda). **Cierre forzoso** si `capital ≤ 0` o deuda > umbral; quiebra personal solo si el negocio se financió con tu patrimonio.
5. **Decisiones anuales** (acciones en Activos): invertir en marketing, contratar/despedir, expandir (sucursal: multiplica), mejorar calidad, vender el negocio (precio = múltiplo de ganancias), cerrar, **dejar a un familiar a cargo** (mecánica con el árbol: un pariente con vida completa puede heredarlo; ver `kinship`).
6. **Eventos** (≥ 30): inspección, robo, huelga de empleados, crisis, boom, competidor, oferta de compra, socio deshonesto, incendio, viralidad, herencia del negocio; con escenas (`office`, `money_win`, `money_loss`, `street_crime`, `court`).
7. **Trabajo + negocio**: se puede tener trabajo y negocio; si el jugador es su propio jefe (`job` nulo) el negocio cuenta como ocupación en la barra ("Dueño/a de Cafetería").
8. **Herencia**: si el dueño muere, el negocio pasa (con valor) al heredero elegido (`applySwitch`), como bien.
9. Patrimonio neto (`netWorth`) incluye el valor del negocio.

## Criterios de aceptación
- [ ] `npm run check` verde. Tests: migración (`business` ausente), ciclo determinista con semilla, cierre por deuda, venta con múltiplo, herencia, `netWorth` con negocio, invariantes de T02 (`checkLife`) extendidos al negocio.
- [ ] Balance (T01): entre 3 % y 12 % de las vidas del bot abren un negocio; su patrimonio final mediano no supera 2× al de quienes no lo hacen; tasa de cierre entre 30 % y 60 % en 10 años.
- [ ] UI verificada (Activos → Negocio: abrir, decisiones, resumen anual); sin errores.
- [ ] `docs/03`, `docs/10`, `docs/11`, `CHANGELOG.md`.

## Fuera de alcance
Bolsa de valores compleja, franquicias, socios como personajes del árbol (T07).

## Riesgos
- Economía inflacionaria: limitar retornos anuales (−80 % a +120 % del capital) y probar con T01.
