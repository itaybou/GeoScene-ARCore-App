import { SettingsContext, SettingsProvider } from './SettingsProvider';

import { MenuProvider } from 'react-native-popup-menu';
import React from 'react';
import ThemeProvider from './ThemeProvider';
import UserProvider from './UserProvider';

interface ProvidersProps {}

export const Providers: React.FC<ProvidersProps> = ({ children }) => {
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
