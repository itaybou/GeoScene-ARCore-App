import { I18nManager } from 'react-native';
import Icon from 'react-native-vector-icons/SimpleLineIcons';
import React from 'react';
import { useTheme } from '../../utils/hooks/Hooks';

interface ThemeIconProps {
  name: string;
  color?: string;
  size?: number;
  supportRTL?: boolean;
}

export const ThemeIcon: React.FC<ThemeIconProps> = ({
  name,
  color,
  size,
  supportRTL = true,
}) => {
  const theme = useTheme();

  return (
    <Icon
      name={name}
      size={size ?? 22}
      color={color ?? theme.colors.text}
      style={
        supportRTL &&
        I18nManager.isRTL && { transform: [{ rotateY: '180deg' }] }
      }
    />
  );
};
