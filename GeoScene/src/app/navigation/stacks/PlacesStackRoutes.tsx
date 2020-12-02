import {
  PlacesRoutesParamList,
  PlacesStackRouteNavProps,
} from '../params/RoutesParamList';

import { Center } from '../../components/layout/Center';
import Header from '../../containers/Header';
import React from 'react';
import { Text } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';

interface StackProps {}

const Stack = createStackNavigator<PlacesRoutesParamList>();

function Register({ route }: PlacesStackRouteNavProps<'Places'>) {
  return (
    <Center>
      <Text>Route name: {route.name}</Text>
    </Center>
  );
}

export const PlacesStackRoutes: React.FC<StackProps> = ({}) => {
  return (
    <Stack.Navigator
      initialRouteName="Places"
      screenOptions={{
        header: Header,
      }}>
      <Stack.Screen name="Places" component={Register} />
    </Stack.Navigator>
  );
};
