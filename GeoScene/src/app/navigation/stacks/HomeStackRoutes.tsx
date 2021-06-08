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
import { ThemeLogo } from '../../components/assets/ThemeLogo';
import { ThemeText } from '../../components/text/ThemeText';
import { color } from 'react-native-reanimated';
import { createStackNavigator } from '@react-navigation/stack';

interface StackProps {}

const Stack = createStackNavigator<HomeRoutesParamList>();

function Home({ route, navigation }: HomeStackRouteNavProps<'Home'>) {
  const location = useGeolocation();
  const theme = useTheme();

  return (
    <Center>
      <ThemeLogo height={60} width={400} />
      <PageCard>
        <ThemeText style={{ fontSize: 18, fontWeight: 'bold' }}>
          Device Sensors:
        </ThemeText>
        {location.loading ? (
          <ThemeText>Loading...</ThemeText>
        ) : (
          <>
            <ThemeText>Latitude: {location.latitude?.toFixed(6)}</ThemeText>
            <ThemeText>Longitude: {location.longitude?.toFixed(6)}</ThemeText>
            <ThemeText>Accuracy: {location.accuracy?.toFixed(2)}m</ThemeText>
            <ThemeText>Altitude: {location.altitude?.toFixed(3)}m</ThemeText>
            <ThemeText>Speed: {location.speed?.toFixed(2)}m/s</ThemeText>
            {location.error && (
              <ThemeText
                style={{ color: theme.colors.error, fontWeight: 'bold' }}>
                {`Error: ${location.error.message}`}
              </ThemeText>
            )}
          </>
        )}
      </PageCard>
    </Center>
  );
}

export const HomeStackRoutes: React.FC<StackProps> = ({}) => {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        header: Header,
        animationEnabled: false,
      }}>
      <Stack.Screen name="Home" component={Home} />
    </Stack.Navigator>
  );
};
