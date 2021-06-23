import React, { createContext, useEffect, useReducer } from 'react';
import UserReducer, { UserActionTypes } from './reducers/UserReducer';
import { getActiveUser, isAuthorized } from '../auth/Authentication';

import { Permissions } from '../../native/NativeModulesBridge';
import SplashScreen from 'react-native-splash-screen';

interface UserProviderProps {}
export interface UserType {
  user: User | null;
  permissions: Permissions | null;
  global_permissions: GlobalPermissions | null;
}

export interface AppPermission {
  triangulate: boolean;
  add_places: boolean;
}

export const PermissionNames = ['triangulate', 'add_places'] as const;

export interface GlobalPermissions {
  allow_all: boolean;
  allow_users: boolean;
}
export interface Permissions {
  admin: boolean | undefined;
  permissions: AppPermission;
}

export interface User {
  id: number | undefined;
  name: string | undefined;
  img: string | undefined;
  unreadMessages: number | undefined;
  permissionListenerUnsubscribe: (() => void) | undefined;
}

const initialUser: UserType = {
  user: null,
  permissions: null,
  global_permissions: null,
};

export const UserContext = createContext<{
  state: UserType;
  dispatch: React.Dispatch<any>;
}>({
  state: initialUser,
  dispatch: () => null,
});

export const checkPermissions = (
  user: UserType,
  feature: keyof AppPermission,
): boolean | null | undefined => {
  return (
    user.global_permissions?.allow_all ||
    (user.user &&
      (user.global_permissions?.allow_users ||
        user.permissions?.admin ||
        user.permissions?.permissions?.[feature]))
  );
};

const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(UserReducer, initialUser);

  const signIn = async () => {
    let userDetails: User | null = null;
    const authorized = await isAuthorized();
    if (authorized) {
      userDetails = await getActiveUser(dispatch);
    }
    dispatch({
      type: UserActionTypes.SIGN_IN,
      payload: { user: userDetails ?? null },
    });

    SplashScreen.hide();
  };

  useEffect(() => {
    signIn();
  }, []);

  return (
    <UserContext.Provider value={{ state, dispatch }}>
      {children}
    </UserContext.Provider>
  );
};

export default UserProvider;
