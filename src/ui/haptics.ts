import * as Haptics from 'expo-haptics';
import { useGame } from '../store/gameStore';

// ponytail: cada llamada se ignora sola si falla (sin vibrador, sin permiso, navegador en segundo plano…);
// nunca debe romper la UI por esto.
const safe = (fn: () => Promise<unknown>) => {
  if (!useGame.getState().hapticsEnabled) return;
  fn().catch(() => {});
};

/** Al envejecer o tocar algo. */
export const hapticTap = (): void => safe(() => Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light));
/** Un resultado bueno o un logro. */
export const hapticGood = (): void => safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success));
/** Un resultado malo. */
export const hapticBad = (): void => safe(() => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning));
