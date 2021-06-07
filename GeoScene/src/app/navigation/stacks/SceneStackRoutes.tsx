import {
  SceneRoutesParamList,
  SceneStackRouteNavProps,
} from '../params/RoutesParamList';

import { ARSceneView } from '../../containers/screens/ar/ARSceneView';
import { Button } from 'react-native';
import { Center } from '../../components/layout/Center';
import Header from '../../containers/Header';
import React from 'react';
import { Text } from 'react-native';
import { ThemeButton } from '../../components/input/ThemeButton';
import { ThemeCardButton } from '../../components/input/ThemeCardButton';
import { TriangulateStackRoutes } from './triangulation/TriangulationStackRoutes';
import { createStackNavigator } from '@react-navigation/stack';
import { useRoute } from '@react-navigation/core';

interface StackProps {}

const Stack = createStackNavigator<SceneRoutesParamList>();

const Scenes: React.FC<SceneStackRouteNavProps<'Scene'>> = ({ navigation }) => {
  return (
    <Center>
      <ThemeCardButton
        text="AR Explore"
        description="Start Augmented Reality view and explore your surroundings."
        icon={'directions'}
        onPress={() => navigation.navigate('AR')}
      />
      <ThemeCardButton
        text="Triangulate"
        description="Perform triangulation in order to tag locations visible to you."
        icon={'compass'}
        onPress={() => navigation.navigate('TriangulateStack')}
      />
    </Center>
  );
};

export const SceneStackRoutes: React.FC<StackProps> = ({}) => {
  const route = useRoute();
  return (
    <Stack.Navigator
      initialRouteName="Scene"
      screenOptions={{
        header: Header,
        animationEnabled: false,
      }}>
      <Stack.Screen name="Scene" component={Scenes} />
      <Stack.Screen
        name="AR"
        component={ARSceneView}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TriangulateStack"
        component={TriangulateStackRoutes}
        options={{ headerShown: false }}
      />
    </Stack.Navigator>
  );
};
