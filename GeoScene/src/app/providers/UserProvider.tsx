import React, { createContext, useEffect, useReducer, useState } from 'react';
import { SettingsContext, SettingsType } from './SettingsProvider';
import { Theme, Themes, ThemesType } from '../themes/Themes';
import UserReducer, { UserActionTypes } from './reducers/UserReducer';
import { getActiveUser, isAuthorized } from '../auth/Authentication';

import { StatusBar } from 'react-native';
import { UserStateType } from './reducers/UserReducer';
import { createSelectorProvider } from 'react-use-context-selector';
import { useContextSelector } from 'react-use-context-selector';
import { useNavigation } from '@react-navigation/native';

interface UserProviderProps {}

export interface UserType {
  user: User | null;
}

export interface User {
  name: string | undefined;
  img: string | undefined;
  unreadMessages: number | undefined;
}

const initialUser: UserType = {
  user: null,
};

export const UserContext = createContext<{
  state: UserStateType;
  dispatch: React.Dispatch<any>;
}>({
  state: initialUser,
  dispatch: () => null,
});

export const UserProviderWithSelector = createSelectorProvider(UserContext);

const UserProvider: React.FC<UserProviderProps> = ({ children }) => {
  const [state, dispatch] = useReducer(UserReducer, initialUser);

  const signIn = async () => {
    let userDetails: User | null = null;
    isAuthorized().then(async (response) => {
      if (response) {
        userDetails = await getActiveUser();
      }
      dispatch({
        type: UserActionTypes.SIGN_IN,
        payload: { user: userDetails ?? null },
      });
    });
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
