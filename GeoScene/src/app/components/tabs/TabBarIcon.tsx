import Icon from 'react-native-vector-icons/SimpleLineIcons';
import React from 'react';

interface TabBarIconProps {
  name: string;
  color: string;
  size?: number;
}

export const TabBarIcon: React.FC<TabBarIconProps> = ({
  name,
  color,
  size,
}) => {
  return <Icon name={name} size={size ?? 22} color={color} />;
};
