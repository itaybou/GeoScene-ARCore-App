import {
  TriangulateRoutesParamList,
  TriangulateStackRouteNavProps,
} from '../../params/RoutesParamList';

import { AddTriangulation } from '../../../containers/screens/triangulation/AddTriangulation';
import Header from '../../../containers/Header';
import React from 'react';
import { TriangulationView } from '../../../containers/screens/triangulation/TriangulationView';
import { createStackNavigator } from '@react-navigation/stack';

interface StackProps {}

const Stack = createStackNavigator<TriangulateRoutesParamList>();

export const TriangulateStackRoutes: React.FC<StackProps> = ({}) => {
  return (
    <Stack.Navigator
      initialRouteName="Triangulate"
      screenOptions={{
        header: Header,
        animationEnabled: false,
      }}>
      <Stack.Screen
        name="Triangulate"
        component={TriangulationView}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="AddTriangulate"
        component={AddTriangulation}
        options={{ headerShown: true }}
      />
    </Stack.Navigator>
  );
};
