import { AppRoutesParamList } from './params/RoutesParamList';
import { ExternalStackRoutes } from './stacks/ExternalStackRoutes';
import { NavigationContainer } from '@react-navigation/native';
import React from 'react';
import { TabRoutes } from './TabRoutes';
import { createStackNavigator } from '@react-navigation/stack';

const Stack = createStackNavigator<AppRoutesParamList>();

interface NavigationProps {}

export const Navigation: React.FC<NavigationProps> = ({}) => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Internal"
        screenOptions={{
          headerShown: false,
          animationEnabled: false,
        }}>
        <Stack.Screen name="Internal" component={TabRoutes} />
        <Stack.Screen name="External" component={ExternalStackRoutes} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};
