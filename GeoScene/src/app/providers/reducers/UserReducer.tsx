import type { ActionMap } from './ActionMap';
import AsyncStorage from '@react-native-community/async-storage';
import { SettingsType } from '../SettingsProvider';
import { User } from '../UserProvider';
import { name as appName } from '../../../../app.json';
import { useAsyncStorage } from '../../utils/hooks/useAsyncStorage';

export enum UserActionTypes {
  SIGN_IN,
}

export type UserStateType = {
  user: User | null;
};

type UserPayload = {
  [UserActionTypes.SIGN_IN]: {
    user: User | null;
  };
};

export type UserActions = ActionMap<UserPayload>[keyof ActionMap<UserPayload>];

const UserReducer = (state: UserStateType, action: UserActions) => {
  switch (action.type) {
    case UserActionTypes.SIGN_IN:
      const newState = { ...state, user: action.payload.user };
      return newState;
    default:
      throw new Error();
  }
};

export default UserReducer;
