import { ColorValue, StyleSheet } from 'react-native';

import { Card } from 'react-native-elements';
import React from 'react';
import { useTheme } from '../../utils/hooks/Hooks';

interface CardProps {
  background?: ColorValue | undefined;
  disablePadding?: boolean;
}

export const PageCard: React.FC<CardProps> = ({
  children,
  background,
  disablePadding = false,
}) => {
  const theme = useTheme();

  return (
    <Card
      wrapperStyle={disablePadding ? {} : styles.cardWrapper}
      containerStyle={[
        styles.card,
        disablePadding ? {} : styles.marginContainer,
        { backgroundColor: background ?? theme.colors.cards },
      ]}>
      {children}
    </Card>
  );
};

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 0,
    elevation: 2,
    alignSelf: 'stretch',
  },
  marginContainer: {
    marginBottom: 10,
    marginHorizontal: 10,
  },
  cardWrapper: {
    padding: 1,
    width: '100%',
  },
});
