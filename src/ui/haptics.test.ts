/* eslint-disable import/first */
import { describe, expect, it, vi } from 'vitest';

const { impactAsync, notificationAsync } = vi.hoisted(() => ({
  impactAsync: vi.fn().mockResolvedValue(undefined),
  notificationAsync: vi.fn().mockResolvedValue(undefined),
}));
vi.mock('expo-haptics', () => ({
  impactAsync,
  notificationAsync,
  ImpactFeedbackStyle: { Light: 'light' },
  NotificationFeedbackType: { Success: 'success', Warning: 'warning' },
}));

import { useGame } from '../store/gameStore';
import { hapticBad, hapticGood, hapticTap } from './haptics';

describe('haptics: se puede apagar y nunca rompe la UI', () => {
  it('con la vibración activada, llama al módulo nativo', () => {
    useGame.setState({ hapticsEnabled: true });
    hapticTap();
    hapticGood();
    hapticBad();
    expect(impactAsync).toHaveBeenCalledWith('light');
    expect(notificationAsync).toHaveBeenCalledWith('success');
    expect(notificationAsync).toHaveBeenCalledWith('warning');
  });

  it('con la vibración apagada, no llama a nada', () => {
    impactAsync.mockClear();
    notificationAsync.mockClear();
    useGame.setState({ hapticsEnabled: false });
    hapticTap();
    hapticGood();
    hapticBad();
    expect(impactAsync).not.toHaveBeenCalled();
    expect(notificationAsync).not.toHaveBeenCalled();
  });

  it('si el módulo nativo falla, no lanza', async () => {
    useGame.setState({ hapticsEnabled: true });
    impactAsync.mockRejectedValueOnce(new Error('sin vibrador'));
    expect(() => hapticTap()).not.toThrow();
    await new Promise((r) => setTimeout(r, 0)); // deja que el .catch() interno corra
  });
});
