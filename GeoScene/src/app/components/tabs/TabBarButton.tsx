import { BottomTabBarButtonProps } from '@react-navigation/bottom-tabs';
import React from 'react';
import { TouchableOpacity } from 'react-native';
import useTheme from '../../utils/hooks/useTheme';

export const TabBarButton: React.FC<BottomTabBarButtonProps> = (props) => {
  const theme = useTheme();
  return (
    <TouchableOpacity
      {...props}
      style={
        props.accessibilityState?.selected
          ? [
              props.style,
              { borderBottomColor: theme.colors.accent, borderBottomWidth: 3 },
            ]
          : props.style
      }
    />
  );
};
