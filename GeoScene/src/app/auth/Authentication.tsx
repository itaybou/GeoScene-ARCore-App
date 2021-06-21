import { GlobalPermissions, UserPermissions } from '../providers/UserProvider';

import OAuthManager from './Auth';
import React from 'react';
import { UserActionTypes } from '../providers/reducers/UserReducer';
import { subscribeUserPermissions } from '../api/firestore/permissions/PermissionsFirestore';

export const authManager = new OAuthManager('GeoScene');

authManager.addProvider({
  osm: {
    auth_version: '1.0',
    authorize_url: 'https://www.openstreetmap.org/oauth/authorize',
    access_token_url: 'https://www.openstreetmap.org/oauth/access_token',
    callback_url: ({ app_name }) => `${app_name}://oauth`,
    api_url: 'https://api.openstreetmap.org/',
  },
});

const config = {
  osm: {
    consumer_key: 'Xb335I64hQ4gkkKnANsYgSqwyFhbSfLpwsUod09j',
    consumer_secret: '96Zy85bkDgdNuG0fve6pNUfz1QPcwZQiqh6JF2zD',
  },
};

authManager.configure(config);

//www.openstreetmap.org/api/0.6/user/the_uid
export const getUserDetails = async (user_id: number) => {
  try {
    const details = await authManager.makeRequest(
      'osm',
      `api/0.6/user/${user_id}`,
      false,
      {
        method: 'GET',
      },
    );

    return {
      id: details?.data?.osm?.user?.['-id'],
      username: details?.data?.osm?.user?.['-display_name'],
    };
  } catch (err) {
    console.error(err);
  }
  return null;
};

export const getActiveUser = async (dispatch?: React.Dispatch<any>) => {
  try {
    const details = await authManager.makeRequest(
      'osm',
      'api/0.6/user/details',
      false,
      {
        method: 'GET',
      },
    );

    let permissionListenerUnsubscribe;
    const userId = details?.data?.osm?.user?.['-id'];
    if (userId && dispatch) {
      dispatch({
        type: UserActionTypes.SET_GLOBAL_PERMISSIONS,
        payload: { global_permissions: null },
      });
      dispatch({
        type: UserActionTypes.SET_USER_PERMISSIONS,
        payload: { permissions: null },
      });

      permissionListenerUnsubscribe = subscribeUserPermissions(
        userId,
        (global_permissions: GlobalPermissions | undefined) =>
          dispatch({
            type: UserActionTypes.SET_GLOBAL_PERMISSIONS,
            payload: { global_permissions },
          }),
        (permissions: UserPermissions | undefined) =>
          dispatch({
            type: UserActionTypes.SET_USER_PERMISSIONS,
            payload: { permissions },
          }),
      );
    }

    return {
      id: userId,
      name: details?.data?.osm?.user?.['-display_name'],
      img: details?.data?.osm?.user?.img?.['-href'],
      unreadMessages: details?.data?.osm?.user?.messages?.received['-unread'],
      permissionListenerUnsubscribe,
    };
  } catch (err) {
    console.error(err);
  }
  return null;
};

export const auth = async (dispatch: React.Dispatch<any>) => {
  await deauth(dispatch);
  authManager
    .authorize('osm')
    .then(async (resp) => {
      const user = await getActiveUser(dispatch);
      dispatch({
        type: UserActionTypes.SIGN_IN,
        payload: { user: user ?? null },
      });
    })
    .catch((err) => console.error(err));
};

export const deauth = async (dispatch: React.Dispatch<any>) => {
  authManager
    .deauthorize('osm')
    .then(async (resp) => {
      dispatch({
        type: UserActionTypes.SIGN_IN,
        payload: { user: null },
      });
    })
    .catch((err) => console.error(err));
};

export const authorizationDetails = async () => {
  try {
    const response = await authManager.savedAccount('osm');
    return response;
  } catch (err) {
    return null;
  }
};

export const isAuthorized = async () => {
  const response = await authorizationDetails();
  return response !== null;
};
