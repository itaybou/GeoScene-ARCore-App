import type { ActionMap } from './ActionMap';
import AsyncStorage from '@react-native-community/async-storage';
import { PlaceTypes } from '../SettingsProvider';
import { SettingsType } from '../SettingsProvider';
import { ThemesType } from '../../themes/Themes';
import { name as appName } from '../../../../app.json';
import { useAsyncStorage } from '../../utils/hooks/useAsyncStorage';

export const SETTINGS_KEY = `${appName}::settings`;

export enum SettingsActionTypes {
  SET_SETTINGS,
  CHANGE_THEME,
  CHANGE_VIEWSHED,
  CHANGE_VISIBLE_RADIUS,
  CHANGE_PLACE_TYPES,
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
  [SettingsActionTypes.CHANGE_VISIBLE_RADIUS]: {
    visibleRadius: number;
  };
  [SettingsActionTypes.CHANGE_PLACE_TYPES]: {
    placeTypes: PlaceTypes;
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
    case SettingsActionTypes.CHANGE_VISIBLE_RADIUS: {
      const newState = {
        ...state,
        visibleRadius: action.payload.visibleRadius,
      };
      AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newState));
      return newState;
    }
    case SettingsActionTypes.CHANGE_PLACE_TYPES: {
      const newState = {
        ...state,
        placeTypes: action.payload.placeTypes,
      };
      AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(newState));
      return newState;
    }
    default:
      throw new Error();
  }
};

export default SettingsReducer;
