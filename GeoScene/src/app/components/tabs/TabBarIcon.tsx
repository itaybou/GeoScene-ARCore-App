import Icon from 'react-native-vector-icons/SimpleLineIcons';
import React from 'react';

interface TabBarIconProps {
  name: string;
  color: string;
}

export const TabBarIcon: React.FC<TabBarIconProps> = ({ name, color }) => {
  return <Icon name={name} size={22} color={color} />;
};
