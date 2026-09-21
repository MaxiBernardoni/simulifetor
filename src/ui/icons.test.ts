import { describe, it, expect } from 'vitest';
import { checkIcons, collectAll, iconsInSource, kebab } from '../../scripts/gen-icons.mjs';

describe('íconos', () => {
  it('kebab convierte nombres a archivos de lucide', () => {
    expect(kebab('Gamepad2')).toBe('gamepad-2');
    expect(kebab('HeartPulse')).toBe('heart-pulse');
  });
  it('detecta íconos citados en el código', () => {
    const s = iconsInSource(`icon: 'Bot', <Icon name="Heart" /> icon="Star"`);
    expect([...s].sort()).toEqual(['Bot', 'Heart', 'Star']);
  });
  it('todo ícono referenciado en el código existe en lucide-react-native', () => {
    expect(checkIcons(collectAll()).missing).toEqual([]);
  });
  it('falla (missing) con un ícono inexistente', () => {
    expect(checkIcons(['IconoQueNoExiste']).missing).toEqual(['IconoQueNoExiste']);
  });
});
