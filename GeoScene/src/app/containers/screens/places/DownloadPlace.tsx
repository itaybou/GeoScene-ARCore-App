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
import { ScrollView } from 'react-native-gesture-handler';
import { TabScreen } from '../../../components/layout/TabScreen';
import { TextInput } from 'react-native-paper';
import { ThemeButton } from '../../../components/input/ThemeButton';
import { ThemeTextInput } from '../../../components/input/ThemeTextInput';
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
  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
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

  useEffect(() => {
    const eventEmitter = new NativeEventEmitter(ARModule);
    const downloadEventListener = eventEmitter.addListener(
      'DownloadEvent',
      (event) => {
        if (event.done) {
          setShowDownloadModalVisible(false);
          setName('');
          setDescription('');
          setRadius('15');
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
        <ScrollView style={{ flex: 1 }}>
          <ThemeTextInput label="Name" value={name} onChangeText={setName} />
          <ThemeTextInput
            label="Description"
            value={description}
            onChangeText={setDescription}
          />

          <ThemeTextInput
            label="Radius KM"
            numeric={true}
            onChangeText={onChangeNumericTextInput}
            value={String(radius) ?? 15}
            maxLength={3}
          />
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
        </ScrollView>
        <View
          style={{
            flex: 1,
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
          disabled={!name || !description}
          icon="cloud-download"
          text="Download"
          onPress={async () => {
            setShowDownloadModalVisible(true);
            await ARModule.downloadAndStoreLocationData(
              name,
              description,
              locationMarker.latitude,
              locationMarker.longitude,
              parseInt(radius, 10),
            );
          }}
        />
      </TabScreen>
      <LoadingModal
        isVisible={downloadModalVisible}
        text={'Downloading location data, this may take up to a minute.'}
      />
    </>
  );
}