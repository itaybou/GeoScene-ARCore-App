import React from 'react';
import { Switch } from 'react-native';
import useTheme from '../../utils/hooks/useTheme';

interface ThemeSwitchProps {
  active: boolean | null;
  onValueChange: () => void;
}

export const ThemeSwitch: React.FC<ThemeSwitchProps> = ({
  active,
  onValueChange,
}) => {
  const theme = useTheme();

  return (
    <Switch
      style={{ transform: [{ scaleX: 1.3 }, { scaleY: 1.3 }] }}
      trackColor={{ false: '#767577', true: theme.colors.accent_bright }}
      thumbColor={active ? theme.colors.accent : '#f4f3f4'}
      onValueChange={onValueChange}
      value={active ?? false}
    />
  );
};
