import {
  SettingsContext,
  SettingsProvider,
  SettingsType,
} from './SettingsProvider';

import { MenuProvider } from 'react-native-popup-menu';
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
            <MenuProvider backHandler={true}>
              <UserProvider>{children}</UserProvider>
            </MenuProvider>
          </ThemeProvider>
        )}
      </SettingsContext.Consumer>
    </SettingsProvider>
  );
};
