import { Image, StyleSheet, View } from 'react-native';

import React from 'react';
import useTheme from '../../utils/hooks/useTheme';

interface TabBarCenterProps {
  color: string;
  focused: boolean;
}

const TabBarCenterButtonIcon: React.FC<TabBarCenterProps> = ({ color }) => {
  return (
    <Image
      style={{ ...styles.iconStyle, tintColor: color }}
      source={require('../../assets/icons/binoculars.png')}
    />
  );
};

export const TabBarCenterButton: React.FC<TabBarCenterProps> = ({
  color,
  focused,
}) => {
  const theme = useTheme();

  return focused ? (
    <View
      style={[
        styles.buttonBorder,
        styles.bottom,
        {
          backgroundColor: theme.colors.accent,
        },
      ]}>
      <View
        style={[
          styles.buttonStyle,
          styles.bottomLift,
          { backgroundColor: theme.colors.tabs },
        ]}>
        <TabBarCenterButtonIcon color={color} focused={focused} />
      </View>
    </View>
  ) : (
    <View
      style={[
        styles.buttonStyle,
        styles.bottom,
        { backgroundColor: theme.colors.tabs },
      ]}>
      <TabBarCenterButtonIcon color={color} focused={focused} />
    </View>
  );
};

const styles = StyleSheet.create({
  buttonStyle: {
    position: 'absolute',
    height: 65,
    width: 65,
    borderRadius: 58,
    justifyContent: 'center',
    alignItems: 'center',
    //elevation: 1,
  },
  buttonBorder: {
    position: 'absolute',
    height: 65,
    width: 65,
    borderRadius: 58,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconStyle: {
    width: 35,
    height: 35,
  },
  bottom: {
    bottom: -3,
  },
  bottomLift: {
    bottom: 2.5,
  },
});
