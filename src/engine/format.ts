/** Formatea dinero como $12.345 sin depender de Intl (Hermes). */
export function formatMoney(n: number): string {
  const sign = n < 0 ? '-' : '';
  const digits = Math.abs(Math.round(n)).toString();
  return `${sign}$${digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`;
}
