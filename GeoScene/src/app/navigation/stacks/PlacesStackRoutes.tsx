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

import { Center } from '../../components/layout/Center';
import Header from '../../containers/Header';
import { LocationSearchBar } from '../../components/input/LocationSearchBar';
import { MapsViewFragment } from '../../../native/NativeViewsBridge';
import { TabBarIcon } from '../../components/tabs/TabBarIcon';
import { TabScreen } from '../../components/layout/TabScreen';
import { TextInput } from 'react-native-paper';
import { createStackNavigator } from '@react-navigation/stack';
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
      <Button
        onPress={() => navigation.navigate('DownloadPlace')}
        title="Download Places"
      />
    </Center>
  );
}

interface LocationProps {
  longitude: number | null;
  latitude: number | null;
}

function DownloadPlace({ route }: PlacesStackRouteNavProps<'DownloadPlace'>) {
  const theme = useTheme();
  const location = useGeolocation();
  const [radius, setRadius] = useState<string>('15');
  const [locationMarker, setLocationMarker] = useState<LocationProps>({
    longitude: location.longitude,
    latitude: location.latitude,
  });
  // const
  const mapRef = useRef<number | null>(null);
  const MapsManager = useMemo(
    () => UIManager.getViewManagerConfig('MapView'),
    [],
  );

  console.log(mapRef.current);

  const displayMap = (nativeRef) => {
    mapRef.current = findNodeHandle(nativeRef);
    console.log(mapRef);
    if (mapRef.current) {
      UIManager.dispatchViewManagerCommand(
        mapRef.current,
        MapsManager.Commands.CREATE.toString(),
        [mapRef.current, false, false, true, true], // map referece, use compass orientation, use observe location, enable zoom
      );
      UIManager.dispatchViewManagerCommand(
        mapRef.current,
        MapsManager.Commands.DISPLAY.toString(),
        [mapRef.current], // map referece, use compass orientation, use observe location
      );
    }
  };

  const onChangeNumericTextInput = (text) => {
    const numericRegex = /^([0-9]{1,3})$/;
    console.log(text);

    if (numericRegex.test(text) || !text) {
      setRadius(text);
      const radius = parseInt(text, 10);
      if (text && radius > 0) {
        UIManager.dispatchViewManagerCommand(
          mapRef.current,
          MapsManager.Commands.SET_BBOX.toString(),
          [
            mapRef.current,
            locationMarker.latitude,
            locationMarker.longitude,
            radius,
            false,
          ], // map referece, use compass orientation, use observe location
        );
      }
    }
  };

  return (
    <TabScreen
      style={{
        flex: 1,
        display: 'flex',
        flexDirection: 'column',
      }}>
      <View style={{ flex: 1 }}>
        <View style={{ flex: 0.4, top: 50, marginBottom: 16 }}>
          <Text>{locationMarker.latitude}</Text>
          <Text>{locationMarker.longitude}</Text>
          <KeyboardAvoidingView>
            <View
              style={{ width: '100%', flexDirection: 'row', marginBottom: 4 }}>
              <View
                style={{
                  flex: 0.25,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <Text style={{ fontWeight: 'bold' }}>KM Radius:</Text>
              </View>
              <View style={{ flex: 0.75 }}>
                <TextInput
                  // onSubmitEditing={Keyboard.dismiss}
                  theme={{
                    colors: {
                      primary: theme.colors.accent,
                      background: theme.colors.tabs,
                    },
                  }}
                  selectionColor={theme.colors.accent}
                  underlineColor={theme.colors.accent}
                  textAlign="left"
                  mode="outlined"
                  error={!radius}
                  onChangeText={onChangeNumericTextInput}
                  keyboardType="numeric"
                  value={String(radius) ?? 15}
                  style={{ height: 40 }}
                  maxLength={3}
                />
              </View>
            </View>
            <LocationSearchBar
              onItemSelected={(place) => {
                setLocationMarker({
                  latitude: place.lat,
                  longitude: place.lon,
                });
                UIManager.dispatchViewManagerCommand(
                  mapRef.current,
                  MapsManager.Commands.SET_BBOX.toString(),
                  [
                    mapRef.current,
                    place.lat as number,
                    place.lon as number,
                    parseInt(radius, 10),
                    true,
                  ], // map referece, use compass orientation, use observe location
                );
              }}
            />
          </KeyboardAvoidingView>
        </View>

        <View
          style={{
            flex: 0.6,
            borderColor: theme.colors.inactiveTint,
            borderWidth: 2,
            zIndex: -1,
          }}>
          <MapsViewFragment
            style={{
              flex: 1,
            }}
            onMapSingleTap={(event) => {
              const locationMarker = event.nativeEvent;
              console.log(locationMarker);
              setLocationMarker({
                longitude: locationMarker.longitude,
                latitude: locationMarker.latitude,
              });
              UIManager.dispatchViewManagerCommand(
                mapRef.current,
                MapsManager.Commands.SET_BBOX.toString(),
                [
                  mapRef.current,
                  locationMarker.latitude,
                  locationMarker.longitude,
                  parseInt(radius, 10),
                  false,
                ], // map referece, use compass orientation, use observe location
              );
            }}
            ref={(nativeRef) => !mapRef.current && displayMap(nativeRef)}
          />
        </View>
      </View>
    </TabScreen>
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
      <Stack.Screen name="DownloadPlace" component={DownloadPlace} />
    </Stack.Navigator>
  );
};
