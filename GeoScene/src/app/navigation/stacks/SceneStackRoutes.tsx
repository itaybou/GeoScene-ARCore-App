import React, { useEffect, useState } from 'react';
import {
  SceneRoutesParamList,
  SceneStackRouteNavProps,
} from '../params/RoutesParamList';
import { Text, UIManager, findNodeHandle } from 'react-native';

import { ARViewFragment } from '../../../native/NativeViewsBridge';
import { Button } from 'react-native';
import { Center } from '../../components/layout/Center';
import Header from '../../containers/Header';
import { StatusBar } from 'react-native';
import { View } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';

interface StackProps {}

const Stack = createStackNavigator<SceneRoutesParamList>();

const Scenes: React.FC<SceneStackRouteNavProps<'Scene'>> = ({ navigation }) => {
  return (
    <Center>
      <Text>Hello World</Text>
      <Button title="START AR" onPress={() => navigation.navigate('AR')} />
    </Center>
  );
};

function AR({ route }: SceneStackRouteNavProps<'AR'>) {
  let ref: React.Component<unknown, {}, any> | null = null;
  useEffect(() => {
    const androidViewId = findNodeHandle(ref);
    const manager = UIManager.getViewManagerConfig('ARView');
    UIManager.dispatchViewManagerCommand(
      androidViewId,
      manager.Commands.create.toString(),
      [androidViewId],
    );
    StatusBar.setBackgroundColor('transparent');
    StatusBar.setTranslucent(true);
    // console.log(androidViewId);

    return () => {
      console.log('unmount AR');
      StatusBar.setHidden(false);
    };
  }, []);

  return (
    <View style={{ height: `100%`, backgroundColor: 'white' }}>
      <ARViewFragment ref={(nativeRef) => (ref = nativeRef)} />
    </View>
  );
}

export const SceneStackRoutes: React.FC<StackProps> = ({}) => {
  return (
    <Stack.Navigator
      initialRouteName="Scene"
      screenOptions={{
        header: Header,
      }}>
      <Stack.Screen name="Scene" component={Scenes} />
      <Stack.Screen name="AR" component={AR} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
};
