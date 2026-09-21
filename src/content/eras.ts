// Eras: tecnología, leyes y costo de vida por año calendario. Todo es genérico (sin países reales).
// Función pura del año: no se guarda nada en la partida.

export interface Era {
  id: string;
  label: string;
  tech: Set<string>;
  laws: Set<string>;
  priceIndex: number;
  wageIndex: number;
}

/** Desde qué año existe cada tecnología. */
export const TECH: Record<string, number> = {
  tv: 1950,
  telefono: 1940,
  computadora: 1982,
  celular: 1994,
  internet: 1997,
  redes: 2006,
  smartphone: 2009,
  streaming: 2013,
  ia: 2023,
  autos_autonomos: 2040,
  realidad_virtual: 2035,
  longevidad: 2065,
};

/** Rango de años [desde, hasta] (hasta = null: sigue vigente) en que rige cada ley. */
export const LAWS: Record<string, [number, number | null]> = {
  servicio_militar: [1900, 1996],
  pena_de_muerte: [1900, 1994],
  divorcio: [1972, null],
  drogas_blandas_legales: [2014, null],
  matrimonio_igualitario: [2010, null],
  jornada_reducida: [2040, null],
};

// Nivel general de precios (base 1,0 en el año 2000). Interpolación geométrica entre puntos.
const PRICE_POINTS: [number, number][] = [
  [1940, 0.16], [1950, 0.22], [1960, 0.3], [1970, 0.42], [1980, 0.62], [1990, 0.82],
  [2000, 1.0], [2010, 1.3], [2020, 1.65], [2030, 2.05], [2050, 3.1], [2080, 5.0], [2120, 8.0],
];

// Factor de salario real: crisis lo bajan, booms lo suben (siempre entre 0,85 y 1,1).
const WAGE_POINTS: [number, number][] = [
  [1940, 1], [1975, 1], [1982, 0.9], [1985, 0.97], [1989, 0.88], [1992, 1], [1997, 1.05], [2001, 0.9],
  [2004, 1], [2008, 0.93], [2011, 1.04], [2019, 1.03], [2020, 0.95], [2023, 1.02], [2050, 1.06], [2120, 1.06],
];

function interp(points: [number, number][], year: number, geometric: boolean): number {
  if (year <= points[0][0]) return points[0][1];
  const last = points[points.length - 1];
  if (year >= last[0]) return last[1];
  for (let i = 1; i < points.length; i++) {
    const [y1, v1] = points[i];
    if (year <= y1) {
      const [y0, v0] = points[i - 1];
      const t = (year - y0) / (y1 - y0);
      return geometric ? v0 * Math.pow(v1 / v0, t) : v0 + (v1 - v0) * t;
    }
  }
  return last[1];
}

export const priceIndex = (year: number): number => interp(PRICE_POINTS, year, true);
export const wageIndex = (year: number): number => priceIndex(year) * interp(WAGE_POINTS, year, false);

export const hasTech = (tech: string, year: number): boolean => year >= (TECH[tech] ?? Infinity);
export const hasLaw = (law: string, year: number): boolean => {
  const r = LAWS[law];
  return !!r && year >= r[0] && (r[1] === null || year <= r[1]);
};

export function eraAt(year: number): Era {
  // Década: 40s (todo lo anterior a 1950), 50s … 90s, 2000s, 2010s…
  const d = Math.max(1940, Math.floor(year / 10) * 10);
  const short = d < 2000 ? String(d % 100) : String(d);
  return {
    id: `${short}s`,
    label: `Años ${short}`,
    tech: new Set(Object.keys(TECH).filter((t) => hasTech(t, year))),
    laws: new Set(Object.keys(LAWS).filter((l) => hasLaw(l, year))),
    priceIndex: priceIndex(year),
    wageIndex: wageIndex(year),
  };
}

/** Redondeo "legible": pocas cifras significativas para cifras grandes. */
export function niceRound(n: number): number {
  const a = Math.abs(n);
  if (a < 100) return Math.round(n);
  const step = a < 1000 ? 10 : a < 10000 ? 50 : a < 100000 ? 500 : 5000;
  return Math.round(n / step) * step;
}

/** Escala un monto escrito en "dólares del 2000" al valor de ese año. */
export function scaleMoney(n: number, year: number): number {
  return niceRound(n * priceIndex(year));
}

/** Reemplaza montos "$1.500" dentro de un texto por su valor en el año dado. */
export function scaleText(text: string, year: number): string {
  if (!text.includes('$')) return text;
  return text.replace(/\$(\d{1,3}(?:\.\d{3})+|\d+)/g, (_m, num: string) => {
    const v = scaleMoney(parseInt(num.replace(/\./g, ''), 10), year);
    return '$' + String(v).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  });
}
