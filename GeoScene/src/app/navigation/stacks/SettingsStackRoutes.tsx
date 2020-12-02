import {
  SettingsRoutesParamList,
  SettingsStackRouteNavProps,
} from '../params/RoutesParamList';

import { Center } from '../../components/layout/Center';
import Header from '../../containers/Header';
import React from 'react';
import { Text } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';

interface StackProps {}

const Stack = createStackNavigator<SettingsRoutesParamList>();

function Register({ route }: SettingsStackRouteNavProps<'Settings'>) {
  return (
    <Center>
      <Text>Route name: {route.name}</Text>
    </Center>
  );
}

export const SettingsStackRoutes: React.FC<StackProps> = ({}) => {
  return (
    <Stack.Navigator
      initialRouteName="Settings"
      screenOptions={{
        header: Header,
      }}>
      <Stack.Screen name="Settings" component={Register} />
    </Stack.Navigator>
  );
};
