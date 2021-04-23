import { StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import React from 'react';
import { TabScreen } from './TabScreen';
import useTheme from '../../utils/hooks/useTheme';

interface CenterProps {
  style?: StyleProp<ViewStyle>;
}

export const Center: React.FC<CenterProps> = ({ children, style }) => {
  const theme = useTheme();
  return (
    <TabScreen
      style={[
        styles.center,
        style,
        { backgroundColor: theme.colors.background },
      ]}>
      {children}
    </TabScreen>
  );
};

const styles = StyleSheet.create({
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
