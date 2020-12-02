import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import React from 'react';
import useTheme from '../../utils/hooks/useTheme';

interface CenterProps {
  style?: StyleProp<ViewStyle>;
}

export const Center: React.FC<CenterProps> = ({ children, style }) => {
  const theme = useTheme();
  return (
    <View
      style={[
        styles.center,
        style,
        { backgroundColor: theme.colors.background },
      ]}>
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
