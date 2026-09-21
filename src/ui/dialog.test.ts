/* eslint-disable import/first */
import { afterEach, describe, expect, it, vi } from 'vitest';

// La UI de React Native no corre en Node: se simula solo lo que usa el módulo.
vi.mock('react-native', () => ({ Alert: { alert: vi.fn() }, Platform: { OS: 'web' } }));
import { showAlert } from './dialog';

const g = globalThis as unknown as { confirm: (m: string) => boolean; alert: (m: string) => void };

describe('showAlert en la web', () => {
  afterEach(() => vi.restoreAllMocks());

  it('con dos botones usa confirm y ejecuta la acción si se acepta', () => {
    g.confirm = vi.fn(() => true);
    const ok = vi.fn();
    const no = vi.fn();
    showAlert('¿Empezar otra vida?', 'Se abandona la actual.', [
      { text: 'Cancelar', style: 'cancel', onPress: no },
      { text: 'Nueva vida', style: 'destructive', onPress: ok },
    ]);
    expect(g.confirm).toHaveBeenCalledWith('¿Empezar otra vida?\n\nSe abandona la actual.');
    expect(ok).toHaveBeenCalledTimes(1);
    expect(no).not.toHaveBeenCalled();
  });

  it('si se cancela no ejecuta la acción', () => {
    g.confirm = vi.fn(() => false);
    const ok = vi.fn();
    showAlert('Borrar', 'x', [
      { text: 'Cancelar', style: 'cancel' },
      { text: 'Borrar', style: 'destructive', onPress: ok },
    ]);
    expect(ok).not.toHaveBeenCalled();
  });

  it('sin botones o con uno solo muestra un aviso', () => {
    g.alert = vi.fn();
    showAlert('No se puede cambiar', 'Tenés que esperar 3 años.');
    expect(g.alert).toHaveBeenCalledWith('No se puede cambiar\n\nTenés que esperar 3 años.');
  });
});
