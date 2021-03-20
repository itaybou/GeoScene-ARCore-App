import { Keyboard, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';
import React, { useEffect, useState } from 'react';

import useKeyboardPadding from '../../utils/hooks/useKeyboardPadding';
import useTheme from '../../utils/hooks/useTheme';

interface TabScreenProps {
  style?: StyleProp<ViewStyle>;
}

export const TabScreen: React.FC<TabScreenProps> = ({ children, style }) => {
  const theme = useTheme();
  const { paddingBottom } = useKeyboardPadding(50);

  return (
    <View
      style={[
        style,
        styles.container,
        { backgroundColor: theme.colors.background, paddingBottom },
      ]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { padding: 8, flex: 1 },
});
