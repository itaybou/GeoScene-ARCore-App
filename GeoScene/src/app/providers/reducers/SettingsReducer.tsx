// @ts-nocheck

import type { ActionMap } from './ActionMap';
import AsyncStorage from '@react-native-community/async-storage';
import { PlaceTypes } from '../SettingsProvider';
import { SettingsType } from '../SettingsProvider';
import { ThemesType } from '../../themes/Themes';
import { name as appName } from '../../../../app.json';
import { cloneObject } from '../../utils/object/ObjectUtils';
import { useAsyncStorage } from '../../utils/hooks/useAsyncStorage';

export const SETTINGS_KEY = `${appName}::settings`;

export enum SettingsActionTypes {
  SET_SETTINGS,
  CHANGE_THEME,
  CHANGE_VIEWSHED,
  CHANGE_LOCATION_CENTER,
  CHANGE_VISIBLE_RADIUS,
  CHANGE_SHOW_PLACES_APP,
  CHANGE_PLACE_TYPES,
  CHANGE_MARKERS_REFRESH,
  CHANGE_MARKERS_REALISTIC,
}

type SettingsPayload = {
  [SettingsActionTypes.SET_SETTINGS]: {
    settings: SettingsType;
  };
  [SettingsActionTypes.CHANGE_THEME]: {
    theme: ThemesType;
  };
  [SettingsActionTypes.CHANGE_VIEWSHED]: {
    determineViewshed: boolean;
  };
  [SettingsActionTypes.CHANGE_LOCATION_CENTER]: {
    showLocationCenter: boolean;
  };
  [SettingsActionTypes.CHANGE_VISIBLE_RADIUS]: {
    visibleRadius: number;
  };
  [SettingsActionTypes.CHANGE_SHOW_PLACES_APP]: {
    showPlacesApp: boolean;
  };
  [SettingsActionTypes.CHANGE_MARKERS_REFRESH]: {
    markersRefresh: boolean;
  };
  [SettingsActionTypes.CHANGE_MARKERS_REALISTIC]: {
    markersRealistic: boolean;
  };
  [SettingsActionTypes.CHANGE_PLACE_TYPES]: {
    category: any;
    placeType: any;
    value: boolean;
  };
};

export type SettingsActions = ActionMap<SettingsPayload>[keyof ActionMap<
  SettingsPayload
>];

const SettingsReducer = (state: SettingsType, action: SettingsActions) => {
  switch (action.type) {
    case SettingsActionTypes.SET_SETTINGS:
      return action.payload.settings;
    case SettingsActionTypes.CHANGE_THEME: {
      const newState = { ...state, theme: action.payload.theme };
      AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newState));
      return newState;
    }
    case SettingsActionTypes.CHANGE_VIEWSHED: {
      const newState = {
        ...state,
        determineViewshed: action.payload.determineViewshed,
      };
      AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newState));
      return newState;
    }
    case SettingsActionTypes.CHANGE_LOCATION_CENTER: {
      const newState = {
        ...state,
        showLocationCenter: action.payload.showLocationCenter,
      };
      AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newState));
      return newState;
    }
    case SettingsActionTypes.CHANGE_MARKERS_REFRESH: {
      const newState = {
        ...state,
        markersRefresh: action.payload.markersRefresh,
      };
      AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newState));
      return newState;
    }
    case SettingsActionTypes.CHANGE_MARKERS_REALISTIC: {
      const newState = {
        ...state,
        realisticMarkers: action.payload.markersRealistic,
      };
      AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newState));
      return newState;
    }
    case SettingsActionTypes.CHANGE_VISIBLE_RADIUS: {
      const newState = {
        ...state,
        visibleRadius: action.payload.visibleRadius,
      };
      AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newState));
      return newState;
    }
    case SettingsActionTypes.CHANGE_SHOW_PLACES_APP: {
      const newState = {
        ...state,
        showPlacesApp: action.payload.showPlacesApp,
      };
      AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newState));
      return newState;
    }
    case SettingsActionTypes.CHANGE_PLACE_TYPES: {
      let placeTypes = cloneObject(state.placeTypes);
      placeTypes[action.payload.category][action.payload.placeType].on =
        action.payload.value;
      const newState = {
        ...state,
        placeTypes,
      };
      AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newState));
      return newState;
    }
    default:
      throw new Error();
  }
};

export default SettingsReducer;
