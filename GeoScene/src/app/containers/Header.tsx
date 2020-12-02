import { Dimensions, StyleSheet, Text, View } from 'react-native';

import React from 'react';
import { StackHeaderProps } from '@react-navigation/stack';
import { useTheme } from '@react-navigation/native';

const Header: React.FC<StackHeaderProps> = ({ scene, navigation }) => {
  const theme = useTheme();

  return (
    <View style={[styles.main, { backgroundColor: theme.colors.background }]}>
      <View>
        <Text style={styles.headerText}>{scene.route.name + 2}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {},
  main: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    alignSelf: 'center',
    position: 'absolute',
    alignContent: 'center',
    borderRadius: 70,
    transform: [{ scaleX: 2 }, { scaleY: 0.5 }],
  },
  customShadowStyle: {
    shadowRadius: 3,
    shadowOpacity: 0.3,
    shadowColor: '#595959',
    shadowOffset: { width: 0, height: 2 },
  },
  headerText: {
    fontWeight: 'bold',
    fontSize: 30,
    color: '#333',
    letterSpacing: 1,
  },
});

export default Header;
