import { Keyboard, StyleProp, StyleSheet, ViewStyle } from 'react-native';

import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import useKeyboardPadding from '../../utils/hooks/useKeyboardPadding';
import useTheme from '../../utils/hooks/useTheme';

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
  container: { padding: 8, marginBottom: 24, flex: 1 },
});
