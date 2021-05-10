import {
  KeyboardAvoidingView,
  Text,
  UIManager,
  View,
  findNodeHandle,
} from 'react-native';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import { ARModule } from '../../../../native/NativeModulesBridge';
import { LoadingModal } from '../../../components/modals/LoadingModal';
import { LocationSearchBar } from '../../../components/input/LocationSearchBar';
import { NativeEventEmitter } from 'react-native';
import { NativeMapView } from '../../../../native/NativeViewsBridge';
import { PlacesStackRouteNavProps } from '../../../navigation/params/RoutesParamList';
import { TabScreen } from '../../../components/layout/TabScreen';
import { TextInput } from 'react-native-paper';
import { ThemeButton } from '../../../components/input/ThemeButton';
import useGeolocation from '../../../utils/hooks/useGeolocation';
import useTheme from '../../../utils/hooks/useTheme';

interface LocationProps {
  longitude: number | null;
  latitude: number | null;
}

export function DownloadPlace({
  route,
}: PlacesStackRouteNavProps<'DownloadPlace'>) {
  const theme = useTheme();
  const location = useGeolocation();
  const [downloadModalVisible, setShowDownloadModalVisible] = useState<boolean>(
    false,
  );
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

  const a = async () => {
    const data = await ARModule.fetchStoredLocationData();
    console.log(data);
  };

  useEffect(() => {
    a();
    const eventEmitter = new NativeEventEmitter(ARModule);
    const downloadEventListener = eventEmitter.addListener(
      'DownloadEvent',
      (event) => {
        console.log(event);
        if (event.done) {
          setShowDownloadModalVisible(false);
        }
      },
    );

    return () => downloadEventListener.remove();
  }, []);

  const onChangeNumericTextInput = (text) => {
    const numericRegex = /^([0-9]{1,3})$/;

    if (numericRegex.test(text) || !text) {
      setRadius(text);
      const radius = parseInt(text, 10);

      if (text && radius > 0) {
        UIManager.dispatchViewManagerCommand(
          mapRef.current,
          MapsManager.Commands.ZOOM_SET_BBOX.toString(),
          [locationMarker.latitude, locationMarker.longitude, radius, false], // map referece, use compass orientation, use observe location
        );
      }
    }
  };

  return (
    <>
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
                style={{
                  width: '100%',
                  flexDirection: 'row',
                  marginBottom: 4,
                }}>
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
                    MapsManager.Commands.ZOOM_SET_BBOX.toString(),
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
            <NativeMapView
              enableLocationTap={true}
              useObserverLocation={false}
              showBoundingCircle={true}
              enableZoom={true}
              style={{ width: '100%', height: '100%', flex: 1 }}
              onMapSingleTap={(event) => {
                const locationMarker = event.nativeEvent;
                setLocationMarker({
                  longitude: locationMarker.longitude,
                  latitude: locationMarker.latitude,
                });
                UIManager.dispatchViewManagerCommand(
                  mapRef.current,
                  MapsManager.Commands.ZOOM_SET_BBOX.toString(),
                  [
                    locationMarker.latitude,
                    locationMarker.longitude,
                    parseInt(radius, 10),
                    false,
                  ], // map referece, use compass orientation, use observe location
                );
              }}
              ref={(nativeRef) => (mapRef.current = findNodeHandle(nativeRef))}
            />
          </View>
          <ThemeButton
            icon="cloud-download"
            text="Download"
            onPress={async () => {
              setShowDownloadModalVisible(true);
              await ARModule.downloadAndStoreLocationData(
                'Test2222',
                'Test Description5555',
                locationMarker.latitude,
                locationMarker.longitude,
                parseInt(radius, 10),
              );
            }}
          />
        </View>
      </TabScreen>
      <LoadingModal
        isVisible={downloadModalVisible}
        text={'Downloading location data, this may take up to a minute.'}
      />
    </>
  );
}
