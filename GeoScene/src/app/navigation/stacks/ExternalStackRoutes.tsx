import { Button, Text } from 'react-native';
import {
  ExternalRoutesParamList,
  ExternalStackRouteNavProps,
} from '../params/RoutesParamList';
import { User, UserActionTypes } from '../../providers/reducers/UserReducer';
import { getActiveUser, isAuthorized } from '../../auth/Authentication';
import {
  useGeolocation,
  useSettings,
  useTheme,
  useUser,
} from '../../utils/hooks/Hooks';

import { Card } from 'react-native-elements';
import { Center } from '../../components/layout/Center';
import Header from '../../containers/Header';
import { PageCard } from '../../components/layout/PageCard';
import React from 'react';
import { SettingsActionTypes } from '../../providers/reducers/SettingsReducer';
import { ThemeText } from '../../components/text/ThemeText';
import { WebViewScreen } from '../../containers/screens/WebViewScreen';
import { accurateOptions } from '../../utils/hooks/useGeolocation';
import { color } from 'react-native-reanimated';
import { createStackNavigator } from '@react-navigation/stack';
import { signIn } from '../../providers/UserProvider';

interface StackProps {}

const Stack = createStackNavigator<ExternalRoutesParamList>();
const PREFIX = 'https://www.openstreetmap.org/';

function Profile({}: ExternalStackRouteNavProps<'Profile'>) {
  const { state } = useUser();
  const user = state.user;

  return (
    <WebViewScreen
      showWebControls={true}
      name="Profile"
      uri={PREFIX + `user/${user?.name}`}
    />
  );
}

function Messages({}: ExternalStackRouteNavProps<'Messages'>) {
  return (
    <WebViewScreen
      showWebControls={true}
      name="Messages"
      uri={PREFIX + 'messages/inbox'}
    />
  );
}

function SignUp({}: ExternalStackRouteNavProps<'SignUp'>) {
  return (
    <WebViewScreen
      showWebControls={true}
      name="SignUp"
      uri={PREFIX + 'user/new'}
    />
  );
}

function PorfileSettings({}: ExternalStackRouteNavProps<'ProfileSettings'>) {
  const { state, dispatch } = useUser();
  const user = state.user;

  const injectedCode = `
  var form = document.getElementById("accountForm");
  form.addEventListener("submit", function(evt) {
    window.ReactNativeWebView.postMessage(JSON.stringify({type: "submit", message : "ok"}));
  }); `;

  return (
    <WebViewScreen
      showWebControls={true}
      name="Profile Settings"
      uri={PREFIX + `user/${user?.name}/account`}
      injectedCode={injectedCode}
      onMessage={(event) => {
        const data = JSON.parse(event.nativeEvent.data);
        setTimeout(() => {
          if (data && data?.message === 'ok') {
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
          }
        }, 5000);
      }}
    />
  );
}

export const ExternalStackRoutes: React.FC<StackProps> = ({}) => {
  const theme = useTheme();
  return (
    <Stack.Navigator
      initialRouteName="Profile"
      screenOptions={{
        header: Header,
        animationEnabled: false,
      }}>
      <Stack.Screen name="Profile" component={Profile} />
      <Stack.Screen name="Messages" component={Messages} />
      <Stack.Screen name="SignUp" component={SignUp} />
      <Stack.Screen
        name="ProfileSettings"
        component={PorfileSettings}
        options={{ title: 'Profile Settings' }}
      />
    </Stack.Navigator>
  );
};
