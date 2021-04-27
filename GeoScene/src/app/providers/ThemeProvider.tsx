import React, { useLayoutEffect } from 'react';
import { SettingsContext, SettingsType } from './SettingsProvider';
import { Theme, Themes, ThemesType } from '../themes/Themes';

import { StatusBar } from 'react-native';
import { useContextSelector } from 'react-use-context-selector';
import { useNavigation } from '@react-navigation/native';

interface ThemeProviderProps {
  theme: ThemesType;
}

export const ThemeContext = React.createContext<Theme>(Themes.light);

const ThemeProvider: React.FC<ThemeProviderProps> = ({ children, theme }) => {
  useLayoutEffect(() => {
    StatusBar.setBarStyle(theme === 'light' ? 'dark-content' : 'light-content');
    StatusBar.setBackgroundColor(Themes[theme].colors.tabs);
  }, [theme]);

  return (
    <ThemeContext.Provider value={Themes[theme]}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
