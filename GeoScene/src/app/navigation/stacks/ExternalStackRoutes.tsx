import {
  ExternalRoutesParamList,
  ExternalStackRouteNavProps,
} from '../params/RoutesParamList';
import React, { useState } from 'react';
import { getActiveUser, isAuthorized } from '../../auth/Authentication';
import { useKeyboardPadding, useTheme, useUser } from '../../utils/hooks/Hooks';

import Header from '../../containers/Header';
import { Keyboard } from 'react-native';
import { ThemeButton } from '../../components/input/ThemeButton';
import { ThemeIcon } from '../../components/assets/ThemeIcon';
import { ThemeText } from '../../components/text/ThemeText';
import { ThemeTextInput } from '../../components/input/ThemeTextInput';
import { User } from '../../providers/UserProvider';
import { UserActionTypes } from '../../providers/reducers/UserReducer';
import { View } from 'react-native';
import { WebViewScreen } from '../../containers/screens/WebViewScreen';
import { createStackNavigator } from '@react-navigation/stack';
import { useEffect } from 'react';

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

function Messages({ navigation }: ExternalStackRouteNavProps<'Messages'>) {
  const { dispatch } = useUser();
  const theme = useTheme();

  const [username, setUsername] = useState<string>('');

  const injectedCode = `
  var parentDOM = document.getElementById("content");
  parentDOM.addEventListener("submit", function(evt) {
    window.ReactNativeWebView.postMessage(JSON.stringify({type: "submit", message : "ok"}));
  });
  true;`;

  return (
    <View style={{ flex: 1 }}>
      <View
        style={{
          padding: 8,
          flex: 0.15,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: theme.colors.cards,
        }}>
        <View style={{ padding: 4, width: '100%' }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-start',
              alignItems: 'center',
            }}>
            <ThemeIcon name="paper-plane" size={18} color={theme.colors.text} />
            <ThemeText
              style={{ fontSize: 18, fontWeight: 'bold', marginStart: 8 }}>
              Send Message
            </ThemeText>
          </View>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'flex-end',
              alignItems: 'center',
            }}>
            <View
              style={{
                flex: 1,
                justifyContent: 'center',
              }}>
              <ThemeTextInput
                dense={true}
                label="Username"
                value={username}
                onChangeText={setUsername}
              />
            </View>
            <ThemeButton
              onPress={() => navigation.navigate('SendMessage', { username })}
              icon={'paper-plane'}
            />
          </View>
        </View>
      </View>
      <View style={{ flex: 0.85 }}>
        <WebViewScreen
          showWebControls={true}
          name="Messages"
          uri={PREFIX + 'messages/inbox'}
          injectedCode={injectedCode}
          onMessage={(event) => {
            const data = JSON.parse(event.nativeEvent.data);
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
          }}
        />
      </View>
    </View>
  );
}

function SendMessage({ route }: ExternalStackRouteNavProps<'SendMessage'>) {
  useEffect(() => Keyboard.dismiss(), []);
  return (
    <WebViewScreen
      showWebControls={true}
      name="Profile"
      uri={PREFIX + `message/new/${route?.params?.username}`}
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
  });
  true; `;

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
  return (
    <Stack.Navigator
      initialRouteName="Profile"
      screenOptions={{
        header: Header,
        animationEnabled: false,
      }}>
      <Stack.Screen name="Profile" component={Profile} />
      <Stack.Screen name="Messages" component={Messages} />
      <Stack.Screen name="SendMessage" component={SendMessage} />
      <Stack.Screen name="SignUp" component={SignUp} />
      <Stack.Screen
        name="ProfileSettings"
        component={PorfileSettings}
        options={{ title: 'Profile Settings' }}
      />
    </Stack.Navigator>
  );
};
