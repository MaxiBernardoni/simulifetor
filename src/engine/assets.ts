import type { Life } from './types';
import type { Rng } from './rng';
import { addLog } from './effects';
import { CATALOG } from '../content/assets';
import { formatMoney } from './format';
import { priceIndex, scaleMoney } from '../content/eras';

/** Precio de un bien del catálogo en el año de la vida. */
export const priceOf = (life: Life, price: number): number => scaleMoney(price, life.year);

export const LOAN_RATE = 0.06;
export const DOWN_PAYMENT = 0.2;

const clampMin = (n: number, min: number) => Math.max(min, n);

export const assetValue = (life: Life) => life.assets.reduce((s, a) => s + a.value, 0);
export const netWorth = (life: Life) => life.money + life.invested + assetValue(life) - life.loan;

/** Patrimonio en valores constantes del 2000 (logros y comparaciones entre épocas). */
export const realNetWorth = (life: Life): number => Math.round(netWorth(life) / priceIndex(life.year));

/** Cuánto más puede pedir el banco según ingresos y bienes. */
export function loanCapacity(life: Life): number {
  if (life.age < 18 || life.jailYears > 0) return 0;
  const income = (life.job?.salary ?? 0) + life.pension;
  const cap = income * 3 + assetValue(life) * 0.5;
  return Math.max(0, Math.round(cap - life.loan));
}

export function canBuy(life: Life, catalogId: string, financed: boolean): string | null {
  const item = CATALOG.find((c) => c.id === catalogId);
  if (!item) return 'No existe';
  if (life.age < 18) return 'Sos menor de edad';
  if (life.jailYears > 0) return 'Estás preso';
  if (item.kind === 'house' && life.assets.some((a) => a.kind === 'house')) return 'Ya tenés una vivienda';
  if (item.kind === 'car' && life.assets.filter((a) => a.kind === 'car').length >= 2) return 'Ya tenés dos autos';
  if (financed) {
    const down = Math.round(priceOf(life, item.price) * DOWN_PAYMENT);
    if (life.money < down) return `Necesitás ${formatMoney(down)} de entrada`;
    if (loanCapacity(life) < priceOf(life, item.price) - down) return 'El banco no te aprueba el crédito';
  } else if (life.money < priceOf(life, item.price)) {
    return `Necesitás ${formatMoney(priceOf(life, item.price))}`;
  }
  return null;
}

export function buyAsset(life: Life, catalogId: string, financed: boolean): void {
  if (canBuy(life, catalogId, financed) || life.pending.length) return;
  const item = CATALOG.find((c) => c.id === catalogId)!;
  if (financed) {
    const down = Math.round(priceOf(life, item.price) * DOWN_PAYMENT);
    life.money -= down;
    life.loan += priceOf(life, item.price) - down;
  } else {
    life.money -= priceOf(life, item.price);
  }
  life.assets.push({
    id: `a${life.year}${life.assets.length}${item.id}`,
    catalogId: item.id,
    kind: item.kind,
    name: item.name,
    value: priceOf(life, item.price),
    boughtYear: life.year,
  });
  addLog(life, `Compraste: ${item.name} por ${formatMoney(priceOf(life, item.price))}${financed ? ' (financiado)' : ''}.`, 'good', 'Compra', 'House');
}

export function sellAsset(life: Life, assetId: string): void {
  const i = life.assets.findIndex((a) => a.id === assetId);
  if (i < 0 || life.pending.length) return;
  const a = life.assets[i];
  life.assets.splice(i, 1);
  life.money += a.value;
  addLog(life, `Vendiste ${a.name.toLowerCase()} por ${formatMoney(a.value)}.`, 'neutral', 'Venta', 'Coins');
}

export function takeLoan(life: Life, amount: number): void {
  if (life.pending.length || amount > loanCapacity(life)) return;
  life.loan += amount;
  life.money += amount;
  addLog(life, `Pediste un préstamo de ${formatMoney(amount)}.`, 'neutral', 'Banco', 'Landmark');
}

export function repayLoan(life: Life, amount: number): void {
  const pay = Math.min(amount, life.loan, Math.max(0, life.money));
  if (pay <= 0 || life.pending.length) return;
  life.loan -= pay;
  life.money -= pay;
  addLog(life, `Devolviste ${formatMoney(pay)} del préstamo.`, 'neutral', 'Banco', 'Landmark');
}

export function investMoney(life: Life, amount: number): void {
  const amt = Math.min(amount, Math.max(0, life.money));
  if (amt <= 0 || life.pending.length || life.age < 18) return;
  life.money -= amt;
  life.invested += amt;
}

export function withdrawInvestments(life: Life): void {
  if (life.invested <= 0 || life.pending.length) return;
  life.money += life.invested;
  life.invested = 0;
}

/** Paso anual: valuación de bienes, inversiones, intereses y cuotas. */
export function updateAssets(life: Life, rng: Rng): void {
  const inflation = priceIndex(life.year) / priceIndex(life.year - 1);
  for (const a of life.assets) {
    a.value = Math.round(a.kind === 'house' ? a.value * (1 + (rng.int(-4, 9) / 100)) * inflation : a.value * 0.9 * inflation);
    a.value = clampMin(a.value, 500);
  }
  if (life.invested > 0) {
    const r = rng.weighted([-0.25, -0.05, 0.06, 0.14, 0.4], (x) => (x === -0.25 ? 10 : x === -0.05 ? 25 : x === 0.06 ? 35 : x === 0.14 ? 25 : 5)) ?? 0;
    const delta = Math.round(life.invested * r);
    life.invested = Math.round((life.invested + delta) * inflation);
    if (Math.abs(r) >= 0.14) {
      addLog(life, r > 0 ? `Tus inversiones subieron ${formatMoney(delta)}.` : `Tus inversiones cayeron ${formatMoney(-delta)}.`, r > 0 ? 'good' : 'bad', 'Inversiones', 'TrendingUp');
    }
  }
  if (life.loan > 0) {
    life.loan = Math.round(life.loan * (1 + LOAN_RATE));
    const pay = Math.min(life.loan, Math.max(Math.round(1500 * priceIndex(life.year)), Math.round(life.loan * 0.1)));
    life.loan -= pay;
    life.money -= pay;
    if (life.loan === 0) addLog(life, 'Terminaste de pagar tu préstamo.', 'good', 'Banco', 'Landmark');
  }
}

/** Costo anual de vivir: alquiler o mantenimiento, según tengas casa propia. */
export function housingCost(life: Life): number {
  const house = life.assets.find((a) => a.kind === 'house');
  return house ? Math.round(2000 * priceIndex(life.year)) + Math.round(house.value * 0.01) : Math.round(7000 * priceIndex(life.year));
}

export function carCost(life: Life): number {
  return life.assets.filter((a) => a.kind === 'car').length * Math.round(900 * priceIndex(life.year));
}
