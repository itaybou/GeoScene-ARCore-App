import {} from 'react-native-gesture-handler';

import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { PageCard } from '../layout/PageCard';
import React from 'react';
import { ThemeIcon } from '../assets/ThemeIcon';
import { ThemeText } from '../text/ThemeText';
import { useTheme } from '../../utils/hooks/Hooks';

interface ThemeCardButtonProps {
  onPress: () => void;
  text: string;
  description: string;
  icon: string;
}

export const ThemeCardButton: React.FC<ThemeCardButtonProps> = ({
  text,
  description,
  icon,
  onPress,
}) => {
  const theme = useTheme();
  return (
    <TouchableOpacity style={styles.clickableContainer} onPress={onPress}>
      <PageCard background={theme.colors.tabs_secondary} disablePadding={true}>
        <View style={styles.cardContainer}>
          <View style={styles.iconContainer}>
            <ThemeIcon name={icon} color={theme.colors.text} size={28} />
          </View>
          <View style={styles.textContainer}>
            <ThemeText style={styles.title}>{text}</ThemeText>
            <ThemeText>{description}</ThemeText>
          </View>
          <View style={styles.chevronContainer}>
            <ThemeIcon name="arrow-right" color={theme.colors.text} size={15} />
          </View>
        </View>
      </PageCard>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  clickableContainer: { width: '100%' },
  cardContainer: { flexDirection: 'row' },
  iconContainer: {
    flex: 0.2,
    justifyContent: 'center',
    alignItems: 'flex-start',
  },
  textContainer: { flex: 0.7 },
  title: { fontSize: 18, fontWeight: 'bold' },
  chevronContainer: {
    flex: 0.1,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
});
