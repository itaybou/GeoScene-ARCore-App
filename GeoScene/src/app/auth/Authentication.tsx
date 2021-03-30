import OAuthManager from './Auth';
// // import * as osmAuth from 'osm-auth';
import React from 'react';
import { UserActionTypes } from '../providers/reducers/UserReducer';

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

export const getActiveUser = async () => {
  try {
    const details = await authManager.makeRequest(
      'osm',
      'api/0.6/user/details',
      false,
      {
        method: 'GET',
      },
    );

    console.log(details?.data?.osm?.user);
    return {
      name: details.data.osm.user['-display_name'],
      img: details.data.osm.user.img['-href'],
      unreadMessages: details.data.osm.user.messages.received['-unread'],
    };
  } catch (err) {
    console.error(err);
  }
  return null;
  // .then((details) => console.log(details.data.osm.user['-display_name']))
  // .catch((err) => console.log(err));
};

export const auth = async (dispatch: React.Dispatch<any>) => {
  await deauth(dispatch);
  authManager
    .authorize('osm')
    .then(async (resp) => {
      console.log(resp);
      const user = await getActiveUser();
      dispatch({
        type: UserActionTypes.SIGN_IN,
        payload: { user: user ?? null },
      });
    })
    .catch((err) => console.log(err));
};

export const deauth = async (dispatch: React.Dispatch<any>) => {
  authManager
    .deauthorize('osm')
    .then(async (resp) => {
      console.log('deauth ' + resp);
      dispatch({
        type: UserActionTypes.SIGN_IN,
        payload: { user: null },
      });
    })
    .catch((err) => console.log(err));
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