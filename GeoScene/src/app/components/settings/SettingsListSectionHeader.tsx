import * as React from 'react';

import { StyleSheet, View } from 'react-native';

import { ThemeText } from '../text/ThemeText';

interface SettingsListSectionHeaderProps {
  icon: JSX.Element | null | undefined;
  title: string;
  showHeader: boolean;
  paddingTop: boolean;
}

export const SettingsListSectionHeader = ({
  icon,
  title,
  showHeader,
  paddingTop,
}: SettingsListSectionHeaderProps) => {
  return (
    <View style={[styles.container, { marginTop: paddingTop ? 16 : 0 }]}>
      {showHeader && icon}
      {showHeader && <ThemeText style={styles.title}>{title}</ThemeText>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 4,
    padding: 4,
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  title: { marginLeft: 16, fontSize: 18 },
});
