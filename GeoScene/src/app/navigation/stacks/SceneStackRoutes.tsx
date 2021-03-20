import {
  ARViewFragment,
  MapsViewFragment,
} from '../../../native/NativeViewsBridge';
import {
  ActivityIndicator,
  Animated,
  Dimensions,
  Easing,
  GestureResponderEvent,
  SafeAreaView,
  StyleSheet,
  Text,
  TouchableOpacity,
  UIManager,
  View,
  findNodeHandle,
} from 'react-native';
import React, {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
} from 'react';
import {
  SceneRoutesParamList,
  SceneStackRouteNavProps,
} from '../params/RoutesParamList';

import { Button } from 'react-native';
import { Center } from '../../components/layout/Center';
import Header from '../../containers/Header';
import { LocationDetailsFrame } from '../../containers/LocationDetailsFrame';
import Orientation from 'react-native-orientation';
import { StatusBar } from 'react-native';
import { TabBarIcon } from '../../components/tabs/TabBarIcon';
import { ThemeText } from '../../components/text/ThemeText';
import { createStackNavigator } from '@react-navigation/stack';
import { useRoute } from '@react-navigation/core';
import { useTheme } from '../../utils/hooks/Hooks';

interface StackProps {}
interface LocationNameProps {
  en_name: string;
  heb_name: string;
}

const Stack = createStackNavigator<SceneRoutesParamList>();

const Scenes: React.FC<SceneStackRouteNavProps<'Scene'>> = ({ navigation }) => {
  return (
    <Center>
      <Text>Hello World</Text>
      <Button title="START AR" onPress={() => navigation.navigate('AR')} />
    </Center>
  );
};

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
        <TabBarIcon name="map" color={theme.colors.accent} size={20} />
      </TouchableOpacity>
    </View>
  );
};

const ANIMATION_TIMING_CONFIG = {
  duration: 250,
  easing: Easing.inOut(Easing.quad),
  useNativeDriver: false,
};

function AR({ route }: SceneStackRouteNavProps<'AR'>) {
  const theme = useTheme();

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

  const ARManager = UIManager.getViewManagerConfig('ARView');
  const MapsManager = UIManager.getViewManagerConfig('MapView');

  useLayoutEffect(() => {
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
      console.log('unmount AR');
      StatusBar.setHidden(false);
      Orientation.unlockAllOrientations();
    };
  }, []);

  const displayAR = useCallback(
    (nativeRef) => {
      arRef.current = findNodeHandle(nativeRef);
      if (arRef.current && !ARDisplayed) {
        UIManager.dispatchViewManagerCommand(
          arRef.current,
          ARManager.Commands.CREATE.toString(),
          [arRef.current],
        );
        setARDisplayed(true);
      }
    },
    [ARManager.Commands.CREATE, ARDisplayed],
  );

  const displayMap = useCallback(
    (nativeRef) => {
      mapRef.current = findNodeHandle(nativeRef);
      if (mapRef.current && !mapDisplayed) {
        UIManager.dispatchViewManagerCommand(
          mapRef.current,
          MapsManager.Commands.CREATE.toString(),
          [mapRef.current, true, true, false, false], // map referece, use compass orientation, use observe location, enable zoom
        );
        setMapDisplayed(true);
      }
    },
    [MapsManager.Commands.CREATE, mapDisplayed],
  );

  // const viewReady = useCallback(() => {
  //   setReady(true);
  //   UIManager.dispatchViewManagerCommand(
  //     androidMapsViewId,
  //     MapsManager.Commands.DISPLAY.toString(),
  //     [],
  //   );
  // }, [MapsManager.Commands.DISPLAY, androidMapsViewId]);

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
    console.log('expand');
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
  console.log(detailsExpanded);

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
          <ARViewFragment
            style={{
              //height,
              flex: 1,
            }}
            ref={(nativeRef) => displayAR(nativeRef)}
            onLocationMarkerTouch={(event) => {
              const { en_name, heb_name } = event.nativeEvent;
              setLocationName({ en_name, heb_name });
              console.log({ en_name, heb_name });
              if (!detailsShown) {
                toggleShowDetailsFrame();
              }
            }}
            onReady={(event) => {
              setReady(true);
            }}
            onLoadingProgress={(event) =>
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
                    MapsManager.Commands.DISPLAY.toString(),
                    [mapRef.current],
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
          <MapsViewFragment
            style={{
              flex: loadingMap ? 0 : 1,
            }}
            ref={(nativeRef) => displayMap(nativeRef)}
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
      <Stack.Screen name="AR" component={AR} options={{ headerShown: false }} />
    </Stack.Navigator>
  );
};
