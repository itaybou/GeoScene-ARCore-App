import React, { createContext, useEffect, useReducer, useState } from 'react';

import { SettingsActionTypes } from './reducers/SettingsReducer';
import SettingsReducer from './reducers/SettingsReducer';
import { SettingsStateType } from './reducers/SettingsReducer';
import SplashScreen from 'react-native-splash-screen';
import { ThemesType } from '../themes/Themes';
import { createSelectorProvider } from 'react-use-context-selector';
import { useAsyncStorage } from '../utils/hooks/useAsyncStorage';

interface SettingsProvider {}

export interface SettingsType {
  theme: ThemesType;
  determineViewshed: boolean;
  visibleRadius: number;
}

const initialSettings: SettingsType = {
  theme: 'light' as ThemesType,
  determineViewshed: true,
  visibleRadius: 30,
};

export const SettingsContext = createContext<{
  state: SettingsStateType;
  dispatch: React.Dispatch<any>;
}>({
  state: initialSettings,
  dispatch: () => null,
});

export const SettingsProviderWithSelector = createSelectorProvider(
  SettingsContext,
);

export const SettingsProvider: React.FC<SettingsProvider> = ({ children }) => {
  const { getStorage, updateStorage } = useAsyncStorage<SettingsType>(
    'settings',
  );
  const [state, dispatch] = useReducer(SettingsReducer, initialSettings);

  const getSettings = async () => {
    const data = await getStorage();
    if (data) {
      dispatch({
        type: SettingsActionTypes.SET_SETTINGS,
        payload: { settings: data },
      });
    } else {
      updateStorage(initialSettings);
    }
    SplashScreen.hide();
  };

  useEffect(() => {
    getSettings();
  }, []);

  return (
    <SettingsProviderWithSelector value={{ state, dispatch }}>
      {children}
    </SettingsProviderWithSelector>
  );
};
