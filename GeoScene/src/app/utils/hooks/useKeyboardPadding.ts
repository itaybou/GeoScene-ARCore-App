import { useEffect, useState } from 'react';

import { Keyboard } from 'react-native';

interface KeyboardActiveProps {
  keyboardActive: boolean;
  paddingBottom: number;
}

export const useKeyboardPadding = (
  maxPadding?: number,
): KeyboardActiveProps => {
  const [paddingBottom, setPaddingBottom] = useState<number>(maxPadding ?? 1);

  useEffect(() => {
    const keyboardShowListener = Keyboard.addListener('keyboardDidShow', () =>
      setPaddingBottom(0),
    );
    const keyboardHideListener = Keyboard.addListener('keyboardDidHide', () =>
      setPaddingBottom(maxPadding ?? 1),
    );

    return () => {
      keyboardShowListener.remove();
      keyboardHideListener.remove();
    };
  }, [maxPadding]);

  return { keyboardActive: paddingBottom === 0, paddingBottom };
};

export default useKeyboardPadding;
