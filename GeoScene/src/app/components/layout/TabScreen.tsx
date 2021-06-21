import { Keyboard, StyleProp, StyleSheet, View, ViewStyle } from 'react-native';

import React from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ScrollView } from 'react-native-gesture-handler';
import useKeyboardPadding from '../../utils/hooks/useKeyboardPadding';
import useTheme from '../../utils/hooks/useTheme';

interface TabScreenProps {
  style?: StyleProp<ViewStyle>;
  disablePadding?: boolean;
}

export const TabScreen: React.FC<TabScreenProps> = ({
  children,
  style,
  disablePadding,
}) => {
  const theme = useTheme();
  const { paddingBottom } = useKeyboardPadding(50);

  return (
    <SafeAreaView
      style={[
        disablePadding ? styles.noPaddingContainer : styles.container,
        { backgroundColor: theme.colors.background, paddingBottom },
      ]}>
      <View
        style={[
          style,
          disablePadding ? styles.minMarginContainer : styles.marginContainer,
        ]}>
        {children}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { padding: 8, flex: 1 },
  scrollContainer: { flexGrow: 1 },
  noPaddingContainer: { flex: 1 },
  marginContainer: { flex: 1, marginBottom: 24 },
  minMarginContainer: { flex: 1, marginBottom: 2 },
});
