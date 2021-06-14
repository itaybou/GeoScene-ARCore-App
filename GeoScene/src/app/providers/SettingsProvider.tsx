import React, { createContext, useEffect, useReducer, useState } from 'react';

import { Permissions } from '../../native/NativeModulesBridge';
import { SettingsActionTypes } from './reducers/SettingsReducer';
import SettingsReducer from './reducers/SettingsReducer';
import { SettingsStateType } from './reducers/SettingsReducer';
import SplashScreen from 'react-native-splash-screen';
import { ThemesType } from '../themes/Themes';
import { createSelectorProvider } from 'react-use-context-selector';
import { useAsyncStorage } from '../utils/hooks/useAsyncStorage';

interface SettingsProvider {}

export interface PlaceTypes {
  place: {
    city: { name: string; on: boolean };
    town: { name: string; on: boolean };
    village: { name: string; on: boolean };
    island: { name: string; on: boolean };
    farm: { name: string; on: boolean };
  };
  natural: {
    sand: { name: string; on: boolean };
    wood: { name: string; on: boolean };
    peak: { name: string; on: boolean };
    hill: { name: string; on: boolean };
    valley: { name: string; on: boolean };
    volcano: { name: string; on: boolean };
    cliff: { name: string; on: boolean };
    dune: { name: string; on: boolean };
  };
  historic: {
    archaeological_site: { name: string; on: boolean };
    battlefield: { name: string; on: boolean };
    building: { name: string; on: boolean };
    castle: { name: string; on: boolean };
    fort: { name: string; on: boolean };
    ruins: { name: string; on: boolean };
    tomb: { name: string; on: boolean };
  };
}

export const placeTypes = {
  place: {
    city: { name: 'Cities', on: true },
    town: { name: 'Towns', on: true },
    village: { name: 'Villages', on: true },
    island: { name: 'Islands', on: true },
    farm: { name: 'Farms', on: true },
  },
  natural: {
    sand: { name: 'Sand', on: true },
    wood: { name: 'Woods', on: true },
    peak: { name: 'Peaks', on: true },
    hill: { name: 'Hills', on: true },
    valley: { name: 'Valleys', on: true },
    volcano: { name: 'Volcanos', on: true },
    cliff: { name: 'Cliffs', on: true },
    dune: { name: 'Dunes', on: true },
  },
  historic: {
    archaeological_site: { name: 'Archaeological', on: true },
    battlefield: { name: 'Battlefields', on: true },
    building: { name: 'Buildings', on: true },
    castle: { name: 'Castles', on: true },
    fort: { name: 'Forts', on: true },
    ruins: { name: 'Ruins', on: true },
    tomb: { name: 'Tombs', on: true },
  },
};

export interface SettingsType {
  theme: ThemesType;
  determineViewshed: boolean;
  showLocationCenter: boolean;
  showPlacesApp: boolean;
  visibleRadius: number;
  placeTypes: PlaceTypes;
  initialized: boolean;
  markersRefresh: boolean;
  realisticMarkers: boolean;
  offsetOverlapMarkers: boolean;
  showVisiblePlacesOnMap: boolean;
}

const initialSettings: SettingsType = {
  theme: 'light' as ThemesType,
  determineViewshed: true,
  showLocationCenter: true,
  showPlacesApp: true,
  visibleRadius: 30,
  placeTypes,
  initialized: false,
  markersRefresh: true,
  realisticMarkers: true,
  offsetOverlapMarkers: false,
  showVisiblePlacesOnMap: true,
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
        payload: { settings: { ...data, initialized: true } },
      });
    } else {
      updateStorage({ ...initialSettings, initialized: true });
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
