import {
  MapsRoutesParamList,
  MapsStackRouteNavProps,
} from '../params/RoutesParamList';

import { Center } from '../../components/layout/Center';
import Header from '../../containers/Header';
import React from 'react';
import { Text } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';

interface StackProps {}

const Stack = createStackNavigator<MapsRoutesParamList>();

function Register({ route }: MapsStackRouteNavProps<'Maps'>) {
  return (
    <Center>
      <Text>Route name: {route.name}</Text>
    </Center>
  );
}

export const MapsStackRoutes: React.FC<StackProps> = ({}) => {
  return (
    <Stack.Navigator
      initialRouteName="Maps"
      screenOptions={{
        header: Header,
      }}>
      <Stack.Screen name="Maps" component={Register} />
    </Stack.Navigator>
  );
};
