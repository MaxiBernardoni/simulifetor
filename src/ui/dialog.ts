import { Alert, Platform } from 'react-native';

export interface DialogButton {
  text?: string;
  style?: 'default' | 'cancel' | 'destructive';
  onPress?: () => void;
}

/**
 * Igual que `Alert.alert`, pero también funciona en la web: allí `Alert.alert` no hace nada, así que se usa el
 * cuadro del navegador (`confirm` si hay dos botones o más, `alert` si no).
 */
export function showAlert(title: string, message?: string, buttons?: DialogButton[]): void {
  if (Platform.OS !== 'web') {
    Alert.alert(title, message, buttons);
    return;
  }
  const text = message ? `${title}\n\n${message}` : title;
  const action = buttons?.find((b) => b.style !== 'cancel');
  const cancel = buttons?.find((b) => b.style === 'cancel');
  if (buttons && buttons.length > 1 && action) {
    if (globalThis.confirm(text)) action.onPress?.();
    else cancel?.onPress?.();
    return;
  }
  globalThis.alert(text);
  buttons?.[0]?.onPress?.();
}
