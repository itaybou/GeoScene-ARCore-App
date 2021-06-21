import {
  GlobalPermissions,
  Permissions,
  User,
  UserType,
} from '../UserProvider';

import type { ActionMap } from './ActionMap';

export enum UserActionTypes {
  SIGN_IN,
  SET_GLOBAL_PERMISSIONS,
  SET_USER_PERMISSIONS,
}

type UserPayload = {
  [UserActionTypes.SIGN_IN]: {
    user: User | null;
  };
  [UserActionTypes.SET_GLOBAL_PERMISSIONS]: {
    global_permissions: GlobalPermissions | null;
  };
  [UserActionTypes.SET_USER_PERMISSIONS]: {
    permissions: Permissions | null;
  };
};

export type UserActions = ActionMap<UserPayload>[keyof ActionMap<UserPayload>];

const UserReducer = (state: UserType, action: UserActions) => {
  switch (action.type) {
    case UserActionTypes.SIGN_IN: {
      if (state?.user?.permissionListenerUnsubscribe) {
        state?.user?.permissionListenerUnsubscribe();
      }
      const newState = { ...state, user: action.payload.user };
      return newState;
    }
    case UserActionTypes.SET_GLOBAL_PERMISSIONS: {
      const newState = {
        ...state,
        global_permissions: action.payload.global_permissions,
      };
      return newState;
    }
    case UserActionTypes.SET_USER_PERMISSIONS: {
      const newState = {
        ...state,
        permissions: action.payload.permissions,
      };
      return newState;
    }
    default:
      throw new Error();
  }
};

export default UserReducer;
