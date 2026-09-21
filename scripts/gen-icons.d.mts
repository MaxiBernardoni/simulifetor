export function kebab(name: string): string;
export function iconsInSource(src: string): Set<string>;
export function checkIcons(names: Iterable<string>): { ok: string[]; missing: string[] };
export function renderIconFile(ok: string[]): string;
export function collectAll(): Set<string>;
