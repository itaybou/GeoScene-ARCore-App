import { Keyboard, StyleProp, StyleSheet, ViewStyle } from 'react-native';
import React from 'react';

import useKeyboardPadding from '../../utils/hooks/useKeyboardPadding';
import useTheme from '../../utils/hooks/useTheme';
import { SafeAreaView } from 'react-native-safe-area-context';

interface TabScreenProps {
  style?: StyleProp<ViewStyle>;
}

export const TabScreen: React.FC<TabScreenProps> = ({ children, style }) => {
  const theme = useTheme();
  const { paddingBottom } = useKeyboardPadding(50);

  return (
    <SafeAreaView
      style={[
        style,
        styles.container,
        { backgroundColor: theme.colors.background, paddingBottom },
      ]}>
      {children}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 8, flex: 1 },
});
