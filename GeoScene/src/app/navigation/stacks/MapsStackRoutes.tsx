import {
  MapsRoutesParamList,
  MapsStackRouteNavProps,
} from '../params/RoutesParamList';
import React, { useMemo, useRef, useState } from 'react';
import { StyleSheet, View, findNodeHandle } from 'react-native';
import { useGeolocation, useSettings, useTheme } from '../../utils/hooks/Hooks';

import { BottomModal } from '../../components/modals/BottomModal';
import { Checkbox } from 'react-native-paper';
import { Compass } from '../../components/assets/Compass';
import Header from '../../containers/Header';
import { NativeMapView } from '../../../native/NativeViewsBridge';
import { SettingsListItem } from '../../components/settings/SettingsListItem';
import { TabScreen } from '../../components/layout/TabScreen';
import { ThemeButton } from '../../components/input/ThemeButton';
import { ThemeIcon } from '../../components/assets/ThemeIcon';
import { ThemeSlider } from '../../components/input/ThemeSlider';
import { ThemeText } from '../../components/text/ThemeText';
import { UIManager } from 'react-native';
import { VISIBLE_RADIUS } from '../../constants/Constants';
import { createStackNavigator } from '@react-navigation/stack';
import useUser from '../../utils/hooks/useUser';

// interface MapOptionProps {}

// export const MapOption: React.FC<MapOptionProps> = ({}) => {
//   const theme = useTheme();
//   return (
//     <Checkbox
//       color={theme.colors.accent_secondary}
//       uncheckedColor={theme.colors.inactiveTint}
//       status={checked.includes(k) ? 'checked' : 'unchecked'}
//       onPress={() => {
//         setChecked(
//           checked.includes(k)
//             ? checked.filter((i) => i !== k)
//             : [...checked, k],
//         );
//       }}
//     />
//   );
// };

interface StackProps {}

const Stack = createStackNavigator<MapsRoutesParamList>();

function Maps({ route }: MapsStackRouteNavProps<'Maps'>) {
  const theme = useTheme();
  const location = useGeolocation();
  const { state } = useSettings();

  const [center, setCenter] = useState<
    { latitude: number; longitude: number } | undefined
  >(undefined);
  const [followLocation, setFollowLocation] = useState<boolean>(false);
  const [useCompass, setUseCompass] = useState<boolean>(false);
  const [useDistance, setUseDistance] = useState<boolean>(false);
  const [detectCenter, setDetectCenter] = useState<boolean>(false);
  const [showBottomMenu, setShowBottomMenu] = useState<boolean>(false);
  const [showBoundingCircle, setShowBoundingCircle] = useState<boolean>(false);

  const [azimuth, setAzimuth] = useState<number | undefined>(undefined);
  const [distance, setDistance] = useState<number | undefined>(undefined);
  const [radius, setRadius] = useState<number>(0);

  const mapRef = useRef<number | null>(null);
  const MapsManager = useMemo(
    () => UIManager.getViewManagerConfig('MapView'),
    [],
  );

  return (
    <>
      <TabScreen disablePadding={true}>
        <NativeMapView
          isShown={true}
          enableLocationTap={false}
          useObserverLocation={followLocation}
          showBoundingCircle={showBoundingCircle}
          useTriangulation={useCompass}
          enableZoom={true}
          useCompassOrientation={useCompass}
          enableGetCenter={detectCenter}
          enableDistanceCalculation={useDistance}
          onOrientationChanged={(event) => {
            if (useCompass) {
              setAzimuth(event.nativeEvent.azimuth);
            } else setAzimuth(undefined);
          }}
          onDistanceCalculation={(event) => {
            if (useDistance) {
              setDistance(event.nativeEvent?.distance);
            } else setDistance(undefined);
          }}
          onMapCenterChanged={(event) =>
            setCenter({
              latitude: event.nativeEvent.latitude,
              longitude: event.nativeEvent.longitude,
            })
          }
          ref={(nativeRef) => (mapRef.current = findNodeHandle(nativeRef))}
          style={{ width: '100%', height: '100%', flex: 1 }}
        />
        <ThemeButton
          style={{ position: 'absolute', right: 5, top: 5 }}
          onPress={() => setShowBottomMenu(true)}
          icon={'map'}
        />
        <ThemeButton
          style={{ position: 'absolute', right: 5, bottom: 5 }}
          onPress={() => {
            UIManager.dispatchViewManagerCommand(
              mapRef.current,
              MapsManager.Commands.ZOOM_SET_BBOX.toString(),
              [location.latitude, location.longitude, 1, false], // map referece, use compass orientation, use observe location
            );
            setRadius(1);
          }}
          icon={'location-pin'}
        />
        {(detectCenter || azimuth || useDistance) && (
          <>
            <View
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              {detectCenter && (
                <ThemeIcon name={'size-actual'} size={15} color={'red'} />
              )}
            </View>
            <View
              style={{
                position: 'absolute',
                left: 5,
                top: 5,
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: theme.colors.tabs,
                paddingVertical: 4,
                paddingHorizontal: 8,
                borderRadius: 10,
              }}>
              {center && detectCenter && (
                <ThemeText
                  style={{
                    fontSize: 16,
                    fontWeight: 'bold',
                  }}>
                  {`Center: ${center?.latitude.toFixed(
                    6,
                  )}, ${center?.longitude.toFixed(6)}`}
                </ThemeText>
              )}
              {azimuth && (
                <ThemeText
                  style={{
                    fontSize: 16,
                    fontWeight: 'bold',
                  }}>
                  {`Azimuth: ${azimuth.toFixed(6)}`}
                </ThemeText>
              )}
              {useDistance && (
                <ThemeText
                  style={{
                    fontSize: 16,
                    fontWeight: 'bold',
                  }}>
                  {distance
                    ? `Distance: ${
                        distance > 1000
                          ? (distance / 1000).toFixed(3)
                          : Math.ceil(distance)
                      } ${distance > 1000 ? 'KM' : 'M'}`
                    : 'Distance: Select 2 points.'}
                </ThemeText>
              )}
              {useDistance && !distance && (
                <ThemeButton
                  onPress={() =>
                    UIManager.dispatchViewManagerCommand(
                      mapRef.current,
                      MapsManager.Commands.DIST_MY_LOCATION.toString(),
                      [],
                    )
                  }
                  text="Use My Location"
                />
              )}
            </View>
          </>
        )}
        {azimuth && (
          <View
            style={{
              position: 'absolute',
              bottom: 5,
              left: 5,
            }}>
            <Compass azimuth={azimuth} />
          </View>
        )}
      </TabScreen>
      <BottomModal
        title={'Map Settings'}
        screenPercent={0.65}
        showButtonIcon={true}
        isVisible={showBottomMenu}
        hide={() => setShowBottomMenu(false)}
        onButtonPress={() => setShowBottomMenu(false)}>
        <SettingsListItem
          item={{
            title: 'Follow Location',
            switch: true,
            switchActive: followLocation,
            additionalText: 'Keep map centered to my location.',
            onClick: () => setFollowLocation(!followLocation),
          }}
          isFirstElement={true}
          border={true}
          bottomText={true}
        />
        <SettingsListItem
          item={{
            title: 'Compass Rotate',
            switch: true,
            switchActive: useCompass,
            additionalText: 'Rotate map according to device compass.',
            onClick: () => {
              setUseCompass(!useCompass);
              if (!useCompass) {
                setFollowLocation(true);
              }
              if (useCompass) {
                setAzimuth(undefined);
              }
            },
          }}
          border={true}
          bottomText={true}
        />
        <SettingsListItem
          item={{
            title: 'Calculate Distance',
            switch: true,
            switchActive: useDistance,
            additionalText:
              'Tap map to select point to calculate distance between.',
            onClick: () => {
              setUseDistance(!useDistance);
              if (useDistance) {
                setDistance(undefined);
              }
            },
          }}
          border={true}
          bottomText={true}
        />
        <SettingsListItem
          item={{
            title: 'Show Visible Radius',
            switch: true,
            switchActive: showBoundingCircle,
            additionalText: 'Shows visible radius as defined in user settings.',
            onClick: () => {
              setShowBoundingCircle(!showBoundingCircle);
              if (!showBoundingCircle) {
                UIManager.dispatchViewManagerCommand(
                  mapRef.current,
                  MapsManager.Commands.ZOOM_SET_BBOX.toString(),
                  [
                    location.latitude,
                    location.longitude,
                    state.visibleRadius,
                    false,
                  ], // map referece, use compass orientation, use observe location
                );
              }
            },
          }}
          border={true}
          bottomText={true}
        />
        <SettingsListItem
          item={{
            title: 'Detect Map Center',
            switch: true,
            switchActive: detectCenter,
            additionalText: 'Show map center coordinates.',
            onClick: () => setDetectCenter(!detectCenter),
          }}
          isLastElement={true}
          border={true}
          bottomText={true}
        />
        <View style={{ flex: 1, flexDirection: 'column', padding: 16 }}>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <View
              style={{
                flex: 1,
                flexDirection: 'column',
                alignItems: 'flex-start',
              }}>
              <ThemeText style={{ fontSize: 15 }}>Zoom KM</ThemeText>
              <ThemeText style={{ fontSize: 10 }}>
                Map breadth zoom level in KM.
              </ThemeText>
              {useCompass && (
                <ThemeText style={{ fontSize: 10, color: theme.colors.error }}>
                  Can't change zoom level in compass mode.
                </ThemeText>
              )}
            </View>
            <ThemeText style={{ fontSize: 15, marginRight: 5 }}>
              {radius} KM
            </ThemeText>
            <ThemeButton
              disabled={useCompass}
              onPress={() =>
                UIManager.dispatchViewManagerCommand(
                  mapRef.current,
                  MapsManager.Commands.ZOOM_IN_OUT.toString(),
                  [radius, false, false], // map referece, use compass orientation, use observe location
                )
              }
              text="Zoom"
            />
          </View>
          <ThemeSlider
            value={radius}
            disabled={useCompass}
            step={1}
            range={{ min: 1, max: 200 }}
            onValueChange={(value: number) => {
              setRadius(value);
              UIManager.dispatchViewManagerCommand(
                mapRef.current,
                MapsManager.Commands.ZOOM_IN_OUT.toString(),
                [value, false, false], // map referece, use compass orientation, use observe location
              );
            }}
          />
        </View>
      </BottomModal>
    </>
  );
}

export const MapsStackRoutes: React.FC<StackProps> = ({}) => {
  return (
    <Stack.Navigator
      initialRouteName="Maps"
      screenOptions={{
        header: Header,
        animationEnabled: false,
      }}>
      <Stack.Screen name="Maps" component={Maps} />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  panel: {
    flex: 1,
    backgroundColor: 'white',
    position: 'relative',
  },
  panelHeader: {
    height: 180,
    backgroundColor: '#b197fc',
    justifyContent: 'flex-end',
    padding: 24,
  },
  textHeader: {
    fontSize: 28,
    color: '#FFF',
  },
  icon: {
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    top: -24,
    right: 18,
    width: 48,
    height: 48,
    zIndex: 1,
  },
  iconBg: {
    backgroundColor: '#2b8a3e',
    position: 'absolute',
    top: -24,
    right: 18,
    width: 48,
    height: 48,
    borderRadius: 24,
    zIndex: 1,
  },
});
