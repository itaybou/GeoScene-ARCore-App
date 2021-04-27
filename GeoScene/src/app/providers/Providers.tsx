import {
  SettingsContext,
  SettingsProvider,
  SettingsType,
} from './SettingsProvider';

import React from 'react';
import ThemeProvider from './ThemeProvider';
import { ThemesType } from 'themes/Themes';
import UserProvider from './UserProvider';
import { useContextSelector } from 'react-use-context-selector';

interface ProvidersProps {}

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
  // const theme = useContextSelector<SettingsType, ThemesType>(
  //   SettingsContext,
  //   (context) => context.state.theme,
  // );

  return (
    <SettingsProvider>
      <SettingsContext.Consumer>
        {(settings) => (
          <ThemeProvider theme={settings.state.theme}>
            <UserProvider>{children}</UserProvider>
          </ThemeProvider>
        )}
      </SettingsContext.Consumer>
    </SettingsProvider>
  );
};
