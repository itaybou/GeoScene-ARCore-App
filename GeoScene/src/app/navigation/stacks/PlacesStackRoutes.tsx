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
import { DownloadedPlace } from '../../containers/screens/places/DownloadedPlace';
import Header from '../../containers/Header';
import { LocationSearchBar } from '../../components/input/LocationSearchBar';
import { NativeMapView } from '../../../native/NativeViewsBridge';
import { TabScreen } from '../../components/layout/TabScreen';
import { TextInput } from 'react-native-paper';
import { ThemeButton } from '../../components/input/ThemeButton';
import { ThemeCardButton } from '../../components/input/ThemeCardButton';
import { UserPlaces } from '../../containers/screens/places/UserPlaces';
import { createStackNavigator } from '@react-navigation/stack';
import { requireNativeComponent } from 'react-native';
import { searchPlacesByName } from '../../api/nomination/OSMNominationAPI';
import useGeolocation from '../../utils/hooks/useGeolocation';
import useTheme from '../../utils/hooks/useTheme';
import useUser from '../../utils/hooks/useUser';

interface StackProps {}

const Stack = createStackNavigator<PlacesRoutesParamList>();

function Places({ route, navigation }: PlacesStackRouteNavProps<'Places'>) {
  const { state } = useUser();
  return (
    <Center>
      {state.user && (
        <ThemeCardButton
          text="My Places"
          description="View the places you added to the map provider."
          icon={'list'}
          onPress={() => navigation.navigate('UserPlaces')}
        />
      )}
      {state.user && (
        <ThemeCardButton
          text="Add Place"
          description="Add a place to the map provider by current location or map choice."
          icon={'plus'}
          onPress={() => navigation.navigate('AddPlace')}
        />
      )}
      <ThemeCardButton
        text="Download Area"
        description="Download information in chossen area to later use while offline."
        icon={'cloud-download'}
        onPress={() => navigation.navigate('DownloadPlace')}
      />
      <ThemeCardButton
        text="My Downloaded Areas"
        description="View Downloaded information stored on device for offline use."
        icon={'drawer'}
        onPress={() => navigation.navigate('DownloadedPlace')}
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
      <Stack.Screen name="Places" component={Places} />
      <Stack.Screen name="AddPlace" component={AddPlace} />
      <Stack.Screen name="DownloadPlace" component={DownloadPlace} />
      <Stack.Screen name="DownloadedPlace" component={DownloadedPlace} />
      <Stack.Screen name="UserPlaces" component={UserPlaces} />
    </Stack.Navigator>
  );
};
