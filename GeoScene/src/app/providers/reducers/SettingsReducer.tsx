import AsyncStorage from '@react-native-community/async-storage';
import { SettingsType } from '../SettingsProvider';
import { ThemeType } from '../../themes/Themes';
import { name as appName } from '../../../../app.json';
import { useAsyncStorage } from '../../utils/hooks/useAsyncStorage';

export const SETTINGS_KEY = `${appName}::settings`;

type ActionMap<M extends { [index: string]: any }> = {
  [Key in keyof M]: M[Key] extends undefined
    ? { type: Key }
    : { type: Key; payload: M[Key] };
};

export enum SettingsActionTypes {
  SET_SETTINGS,
  CHANGE_THEME,
}

export type SettingsStateType = {
  theme: ThemeType;
};

type SettingsPayload = {
  [SettingsActionTypes.SET_SETTINGS]: {
    settings: SettingsStateType;
  };
  [SettingsActionTypes.CHANGE_THEME]: {
    theme: ThemeType;
  };
};

export type SettingsActions = ActionMap<SettingsPayload>[keyof ActionMap<
  SettingsPayload
>];

const SettingsReducer = (state: SettingsStateType, action: SettingsActions) => {
  switch (action.type) {
    case SettingsActionTypes.SET_SETTINGS:
      return action.payload.settings;
    case SettingsActionTypes.CHANGE_THEME:
      const newState = { ...state, theme: action.payload.theme };
      AsyncStorage.setItem(`${appName}::settings`, JSON.stringify(newState));
      return newState;
    default:
      throw new Error();
  }
};

export default SettingsReducer;
