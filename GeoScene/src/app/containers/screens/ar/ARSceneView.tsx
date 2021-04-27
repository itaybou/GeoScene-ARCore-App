import {
  ActivityIndicator,
  Animated,
  Easing,
  GestureResponderEvent,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  TouchableOpacity,
  UIManager,
  View,
  findNodeHandle,
} from 'react-native';
import {
  NativeARView,
  NativeMapView,
} from '../../../../native/NativeViewsBridge';
import React, { useEffect, useRef, useState } from 'react';
import { useSettings, useTheme } from '../../../utils/hooks/Hooks';

import { Center } from '../../../components/layout/Center';
import { LocationDetailsFrame } from '../../LocationDetailsFrame';
import Orientation from 'react-native-orientation';
import { SceneStackRouteNavProps } from '../../../navigation/params/RoutesParamList';
import { ThemeIcon } from '../../../components/assets/ThemeIcon';
import { ThemeText } from '../../../components/text/ThemeText';

const ANIMATION_TIMING_CONFIG = {
  duration: 250,
  easing: Easing.inOut(Easing.quad),
  useNativeDriver: false,
};

interface LocationNameProps {
  en_name: string;
  heb_name: string;
}

interface MapButtonProps {
  onPress: ((event: GestureResponderEvent) => void) | undefined;
}

const MapButton: React.FC<MapButtonProps> = ({ onPress }) => {
  const theme = useTheme();

  return (
    <View style={styles.mapButtonWrapper}>
      <TouchableOpacity
        onPress={onPress}
        style={[styles.mapButton, { backgroundColor: theme.colors.tabs }]}>
        <ThemeIcon name="map" color={theme.colors.accent} size={20} />
      </TouchableOpacity>
    </View>
  );
};

export function ARSceneView({ route }: SceneStackRouteNavProps<'AR'>) {
  const theme = useTheme();
  const { state } = useSettings();

  const [ready, setReady] = useState<boolean>(false);
  const [ARDisplayed, setARDisplayed] = useState<boolean>(false);
  const [mapDisplayed, setMapDisplayed] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('Initializing');
  const [loadingMap, setLoadingMap] = useState<boolean>(true);

  const [mapShown, setMapShown] = useState<boolean>(false);
  const [detailsShown, setDetailsShown] = useState<boolean>(false);
  const [detailsExpanded, setDetailsExpanded] = useState<boolean>(false);
  const [locationName, setLocationName] = useState<
    LocationNameProps | null | undefined
  >(null);

  const arRef = useRef<number | null>(null);
  const mapRef = useRef<number | null>(null);
  const mapAnimation = useRef(new Animated.Value(0)).current;
  const detailsAnimation = useRef(new Animated.Value(0)).current;
  // const ARAnimation = useRef(new Animated.Value(1)).current;

  // const ARAnimation =

  // let arRef: React.Component<unknown, {}, any> | null = null;
  // let mapsRef: React.Component<unknown, {}, any> | null = null;

  // const androidARViewId = useRef(findNodeHandle(arRef));
  // const androidMapsViewId = useRef(findNodeHandle(mapsRef));

  const ARManager = UIManager.getViewManagerConfig('ARFragment');
  const MapsManager = UIManager.getViewManagerConfig('MapView');

  useEffect(() => {
    Orientation.lockToLandscapeLeft();

    // setWidth(Dimensions.get('window').width);
    // setHeight(Dimensions.get('window').height);
    // console.log(androidARViewId.current);
    // console.log(androidMapsViewId.current);

    // UIManager.dispatchViewManagerCommand(
    //   androidMapsViewId.current,
    //   MapsManager.Commands.CREATE.toString(),
    //   [androidMapsViewId.current],
    // );
    StatusBar.setHidden(true);
    // StatusBar.setBackgroundColor('transparent');
    // StatusBar.setTranslucent(true);
    // console.log(androidViewId);

    return () => {
      // console.log({ ref: arRef.current, display: ARDisplayed });
      // if (arRef.current && ARDisplayed) {
      //   UIManager.dispatchViewManagerCommand(
      //     arRef.current,
      //     ARManager.Commands.CLOSE.toString(),
      //     [arRef.current],
      //   );
      // }
      StatusBar.setHidden(false);
      Orientation.unlockAllOrientations();
    };
  }, []);

  useEffect(() => {
    if (arRef.current && !ARDisplayed) {
      UIManager.dispatchViewManagerCommand(
        arRef.current,
        ARManager.Commands.CREATE.toString(),
        [arRef.current, state.determineViewshed, state.visibleRadius],
      );
      setARDisplayed(true);
    }
  }, [ARManager.Commands.CREATE, ARDisplayed]);

  const mapReverseAnimation = mapAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });

  const detailsHeight = detailsAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: ['0%', '100%'],
  });

  const toggleShowDetailsFrame = (afterAnimation?: () => void) => {
    Orientation.lockToLandscapeLeft();
    Animated.timing(detailsAnimation, {
      toValue: detailsShown ? 0 : 0.3,
      ...ANIMATION_TIMING_CONFIG,
    }).start(() => {
      afterAnimation && afterAnimation();
      setDetailsShown(!detailsShown);
      setDetailsExpanded(false);
    });
  };

  const expandDetailsFrame = (afterAnimation?: () => void) => {
    Orientation.lockToLandscapeLeft();
    Animated.timing(detailsAnimation, {
      toValue: detailsExpanded ? 0.3 : 1,
      ...ANIMATION_TIMING_CONFIG,
    }).start(() => {
      afterAnimation && afterAnimation();
      setDetailsExpanded(!detailsExpanded);
      if (!detailsExpanded) {
        Orientation.unlockAllOrientations();
      }
    });
  };

  return (
    <SafeAreaView
      style={{ flex: 1, flexDirection: 'column', position: 'relative' }}>
      <View style={{ flex: 1, flexDirection: 'row' }}>
        {!ready && (
          <Center style={{ flex: 1, zIndex: 1 }}>
            <ThemeText>{loadingMessage}</ThemeText>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </Center>
        )}
        <Animated.View
          style={{
            //height,
            flex: mapReverseAnimation,
            // width: mapShown ? width * 0.6 : width,
            // height,
            display: ready ? 'flex' : 'none',
          }}>
          <NativeARView
            style={{
              //height,
              flex: 1,
            }}
            ref={(nativeRef) => (arRef.current = findNodeHandle(nativeRef))}
            onUseCache={(event: any) =>
              console.log('cache: ' + event.nativeEvent)
            }
            onLocationMarkerTouch={(event: any) => {
              const { en_name, heb_name } = event.nativeEvent;
              setLocationName({ en_name, heb_name });
              if (!detailsShown) {
                toggleShowDetailsFrame();
              }
            }}
            onReady={() => {
              setReady(true);
            }}
            onLoadingProgress={(event: any) =>
              setLoadingMessage(event.nativeEvent.message)
            }
          />
        </Animated.View>
        <Animated.View
          style={{
            //height,
            flex: mapAnimation,
            // width: mapShown ? width * 0.4 : 0,
            flexDirection: 'row',
            display: ready ? 'flex' : 'none',
          }}>
          <MapButton
            onPress={() => {
              setMapShown(!mapShown);
              if (!mapShown) {
                setLoadingMap(true);
              }
              Animated.timing(mapAnimation, {
                toValue: mapShown ? 0 : 0.4,
                ...ANIMATION_TIMING_CONFIG,
              }).start(() => {
                if (!mapShown) {
                  UIManager.dispatchViewManagerCommand(
                    mapRef.current,
                    MapsManager.Commands.ZOOM_BBOX.toString(),
                    [],
                  );
                  setLoadingMap(false);
                }
              });
            }}
          />
          {loadingMap && mapShown && (
            <Center>
              <ThemeText>Loading Map</ThemeText>
              {mapShown && (
                <ActivityIndicator size="large" color={theme.colors.primary} />
              )}
            </Center>
          )}
          <NativeMapView
            enableZoom={false}
            useObserverLocation={true}
            useCompassOrientation={true}
            style={{
              flex: loadingMap ? 0 : 1,
            }}
            ref={(nativeRef) => (mapRef.current = findNodeHandle(nativeRef))}
          />
        </Animated.View>
      </View>
      <Animated.View
        style={[
          styles.detailsFrame,
          {
            backgroundColor: theme.colors.cards,
            height: detailsHeight,
          },
        ]}>
        <LocationDetailsFrame
          name={locationName?.en_name}
          onExpand={expandDetailsFrame}
          onClose={() => {
            if (detailsShown) {
              toggleShowDetailsFrame(() => setLocationName(null));
            }
          }}
        />
      </Animated.View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapButtonWrapper: {
    flex: 0.001,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapButton: {
    width: 65,
    height: 60,
    justifyContent: 'center',
    alignItems: 'flex-start',
    paddingStart: 9,
    borderRadius: 60,
  },
  detailsFrame: {
    width: '100%',
    borderTopLeftRadius: 25,
    elevation: 20,
    position: 'absolute',
    bottom: 0,
  },
});
