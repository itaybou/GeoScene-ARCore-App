import Icon from 'react-native-vector-icons/SimpleLineIcons';
import React from 'react';

interface ThemeIconProps {
  name: string;
  color: string;
  size?: number;
}

export const ThemeIcon: React.FC<ThemeIconProps> = ({ name, color, size }) => {
  return <Icon name={name} size={size ?? 22} color={color} />;
};
