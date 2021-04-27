import { Card } from 'react-native-elements';
import React from 'react';
import { StyleSheet } from 'react-native';
import { useTheme } from '../../utils/hooks/Hooks';

interface CardProps {}

export const PageCard: React.FC<CardProps> = ({ children }) => {
  const theme = useTheme();

  return (
    <Card
      wrapperStyle={styles.cardWrapper}
      containerStyle={[styles.card, { backgroundColor: theme.colors.cards }]}>
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
    marginBottom: 10,
    marginHorizontal: 10,
  },
  cardWrapper: {
    padding: 1,
  },
});
