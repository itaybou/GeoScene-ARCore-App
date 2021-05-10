import {
  Button,
  KeyboardAvoidingView,
  SafeAreaView,
  Text,
  UIManager,
  View,
  findNodeHandle,
} from 'react-native';
import {
  PlacesRoutesParamList,
  PlacesStackRouteNavProps,
} from '../params/RoutesParamList';
import React, { useCallback, useMemo, useRef, useState } from 'react';

import { AddPlace } from '../../containers/screens/places/AddPlace';
import { Center } from '../../components/layout/Center';
import { DownloadPlace } from '../../containers/screens/places/DownloadPlace';
import Header from '../../containers/Header';
import { LocationSearchBar } from '../../components/input/LocationSearchBar';
import { NativeMapView } from '../../../native/NativeViewsBridge';
import { TabScreen } from '../../components/layout/TabScreen';
import { TextInput } from 'react-native-paper';
import { ThemeButton } from '../../components/input/ThemeButton';
import { UserPlaces } from '../../containers/screens/places/UserPlaces';
import { createStackNavigator } from '@react-navigation/stack';
import { requireNativeComponent } from 'react-native';
import { searchPlacesByName } from '../../api/nomination/OSMNominationAPI';
import useGeolocation from '../../utils/hooks/useGeolocation';
import useTheme from '../../utils/hooks/useTheme';

interface StackProps {}

const Stack = createStackNavigator<PlacesRoutesParamList>();

function Register({ route, navigation }: PlacesStackRouteNavProps<'Places'>) {
  console.log(navigation);
  return (
    <Center>
      <Text>Route name: {route.name}</Text>
      <ThemeButton
        onPress={() => navigation.navigate('AddPlace')}
        text="Add Place"
      />
      <ThemeButton
        onPress={() => navigation.navigate('DownloadPlace')}
        text="Download Places"
      />
      <ThemeButton
        onPress={() => navigation.navigate('UserPlaces')}
        text="My Places"
      />
    </Center>
  );
}

export const PlacesStackRoutes: React.FC<StackProps> = ({}) => {
  return (
    <Stack.Navigator
      initialRouteName="Places"
      screenOptions={{
        header: Header,
        animationEnabled: false,
      }}>
      <Stack.Screen name="Places" component={Register} />
      <Stack.Screen name="AddPlace" component={AddPlace} />
      <Stack.Screen name="DownloadPlace" component={DownloadPlace} />
      <Stack.Screen name="UserPlaces" component={UserPlaces} />
    </Stack.Navigator>
  );
};
