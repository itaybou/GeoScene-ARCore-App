import { Button, Image } from 'react-native';
import {
  HomeRoutesParamList,
  HomeStackRouteNavProps,
} from '../params/RoutesParamList';
import { useGeolocation, useSettings, useTheme } from '../../utils/hooks/Hooks';

import { Center } from '../../components/layout/Center';
import Header from '../../containers/Header';
import { PageCard } from '../../components/layout/PageCard';
import React from 'react';
import { SettingsActionTypes } from '../../providers/reducers/SettingsReducer';
import { ThemeText } from '../../components/text/ThemeText';
import { accurateOptions } from '../../utils/hooks/useGeolocation';
import { color } from 'react-native-reanimated';
import { createStackNavigator } from '@react-navigation/stack';

interface StackProps {}

const Stack = createStackNavigator<HomeRoutesParamList>();

const appLogo = require('../../assets/img/logo.png');

function Register({ route, navigation }: HomeStackRouteNavProps<'Home'>) {
  const location = useGeolocation();
  const { state, dispatch } = useSettings();

  return (
    <Center>
      <Image
        source={appLogo}
        style={{
          width: 400,
          marginBottom: 5,
          height: 60,
          resizeMode: 'contain',
          backgroundColor: 'transparent',
        }}
      />
      <ThemeText>Route name: {route.name}</ThemeText>
      <PageCard>
        {location.loading ? (
          <ThemeText>Loading...</ThemeText>
        ) : (
          <>
            <ThemeText>Lat: {location.latitude}</ThemeText>
            <ThemeText>Lon: {location.longitude}</ThemeText>
            <ThemeText>Acc: {location.accuracy}</ThemeText>
            <ThemeText>Alt: {location.altitude}</ThemeText>
            <ThemeText>Speed: {location.speed}</ThemeText>
            <ThemeText style={{ color: 'red', fontWeight: 'bold' }}>
              {location.error ? `Error: ${location.error.message}` : ''}
            </ThemeText>
          </>
        )}
      </PageCard>
      <Button
        title="Go to register screen"
        onPress={() =>
          dispatch({
            type: SettingsActionTypes.CHANGE_THEME,
            payload: {
              theme: state.theme === 'light' ? 'dark' : 'light',
            },
          })
        }
      />
    </Center>
  );
}

export const HomeStackRoutes: React.FC<StackProps> = ({}) => {
  const theme = useTheme();
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        header: Header,
        animationEnabled: false,
      }}>
      <Stack.Screen name="Home" component={Register} />
    </Stack.Navigator>
  );
};
