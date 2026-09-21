export interface CatalogItem {
  id: string;
  kind: 'house' | 'car';
  name: string;
  price: number;
  icon: string;
}

export const CATALOG: CatalogItem[] = [
  { id: 'apt', kind: 'house', name: 'Departamento', price: 60000, icon: 'House' },
  { id: 'house', kind: 'house', name: 'Casa con jardín', price: 140000, icon: 'House' },
  { id: 'mansion', kind: 'house', name: 'Mansión', price: 600000, icon: 'Landmark' },
  { id: 'car_used', kind: 'car', name: 'Auto usado', price: 9000, icon: 'Zap' },
  { id: 'car_new', kind: 'car', name: 'Auto nuevo', price: 28000, icon: 'Zap' },
  { id: 'car_sport', kind: 'car', name: 'Deportivo', price: 90000, icon: 'Flame' },
];

export const LOAN_STEPS = [5000, 15000, 50000];
export const INVEST_STEPS = [1000, 5000, 20000];
