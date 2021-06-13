import {
  ActivityIndicator,
  Animated,
  BackHandler,
  Easing,
  GestureResponderEvent,
  SafeAreaView,
  StatusBar,
  StyleProp,
  StyleSheet,
  TouchableOpacity,
  UIManager,
  View,
  ViewStyle,
  findNodeHandle,
} from 'react-native';
import {
  NativeARView,
  NativeMapView,
} from '../../../../native/NativeViewsBridge';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useSettings, useTheme } from '../../../utils/hooks/Hooks';

import { Center } from '../../../components/layout/Center';
import { ErrorModal } from '../../../components/modals/ErrorModal';
import IdleTimerManager from 'react-native-idle-timer';
import { LocationDetailsFrame } from '../../LocationDetailsFrame';
import { OptionModal } from '../../../components/modals/OptionModal';
import Orientation from 'react-native-orientation';
import { SceneStackRouteNavProps } from '../../../navigation/params/RoutesParamList';
import { ThemeIcon } from '../../../components/assets/ThemeIcon';
import { ThemeText } from '../../../components/text/ThemeText';

const ANIMATION_TIMING_CONFIG = {
  duration: 250,
  easing: Easing.inOut(Easing.ease),
  useNativeDriver: false,
};

interface LocationNameProps {
  en_name: string;
  heb_name: string;
  main_name: string;
  type: string;
  distance: string;
  mElevation: number;
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

interface SideButtonProps {
  onPress: ((event: GestureResponderEvent) => void) | undefined;
  style?: StyleProp<ViewStyle>;
  icon: string;
  text?: string;
  color?: string;
  flex?: number;
}

const SideButton: React.FC<SideButtonProps> = ({
  onPress,
  style,
  icon,
  text,
  color,
  flex,
}) => {
  const theme = useTheme();

  return (
    <View style={[{ justifyContent: 'center', alignItems: 'center' }]}>
      <TouchableOpacity
        onPress={onPress}
        style={[style, { backgroundColor: theme.colors.tabs }]}>
        <View style={{ flexDirection: 'row' }}>
          <ThemeIcon
            name={icon}
            color={color ?? theme.colors.accent}
            size={12}
          />
          {text && (
            <ThemeText style={{ marginLeft: 8, fontSize: 10 }}>
              {text}
            </ThemeText>
          )}
        </View>
      </TouchableOpacity>
    </View>
  );
};

export function ARSceneView({
  route,
  navigation,
}: SceneStackRouteNavProps<'AR'>) {
  const theme = useTheme();
  const { state } = useSettings();

  const [closeModalShown, setCloseModalShown] = useState<boolean>(false);
  const [errorModalShown, setErrorModalShown] = useState<boolean>(false);
  const [azimuth, setAzimuth] = useState<number | undefined>(undefined);

  const [ready, setReady] = useState<boolean>(false);
  const [ARDisplayed, setARDisplayed] = useState<boolean>(false);
  const [loadingMessage, setLoadingMessage] = useState<string>('Initializing');
  const [loadingMap, setLoadingMap] = useState<boolean>(true);

  const [mapShown, setMapShown] = useState<boolean>(false);
  const [detailsShown, setDetailsShown] = useState<boolean>(false);
  const [detailsExpanded, setDetailsExpanded] = useState<boolean>(false);
  const [elevation, setElevation] = useState<number | undefined>(undefined);
  const [locationName, setLocationName] = useState<
    LocationNameProps | null | undefined
  >(null);

  const [visibleLocations, setVisibleLocations] = useState<
    | {
        maxDistance: number;
        minDistance: number;
        first: boolean;
        last: boolean;
      }
    | undefined
  >(undefined);

  const [locationCount, setLocationCount] = useState<
    { locationCount: number; currentCount: number } | undefined
  >(undefined);
  const [cacheUse, setCacheUse] = useState<boolean>(false);
  const [localUse, setLocalUse] = useState<string | undefined>(undefined);

  const [infoOpen, setInfoOpen] = useState<boolean>(false);

  const arRef = useRef<number | null>(null);
  const mapRef = useRef<number | null>(null);
  const mapAnimation = useRef(new Animated.Value(0)).current;
  const detailsAnimation = useRef(new Animated.Value(0)).current;

  const ARManager = UIManager.getViewManagerConfig('ARFragment');
  const MapsManager = UIManager.getViewManagerConfig('MapView');

  const closeSession = useCallback(() => {
    if (arRef.current) {
      UIManager.dispatchViewManagerCommand(
        arRef.current,
        ARManager.Commands.CLOSE.toString(),
        [],
      );
      navigation.navigate('Scene');
    }
  }, [ARManager.Commands.CLOSE]);

  useEffect(() => {
    Orientation.lockToLandscapeLeft();
    StatusBar.setHidden(true);
    IdleTimerManager.setIdleTimerDisabled(true);
    const backHandler = BackHandler.addEventListener(
      'hardwareBackPress',
      () => {
        setCloseModalShown(true);
        return true;
      },
    );

    return () => {
      backHandler.remove();
      StatusBar.setHidden(false);
      Orientation.unlockAllOrientations();
      IdleTimerManager.setIdleTimerDisabled(false);
    };
  }, []);

  useEffect(() => {
    if (arRef.current && !ARDisplayed) {
      UIManager.dispatchViewManagerCommand(
        arRef.current,
        ARManager.Commands.CREATE.toString(),
        [
          arRef.current,
          state.determineViewshed,
          state.visibleRadius,
          state.placeTypes,
          state.showPlacesApp,
          state.showLocationCenter,
          state.markersRefresh,
          state.realisticMarkers,
        ],
      );
      setARDisplayed(true);
    }
  }, [ARManager.Commands.CREATE, ARDisplayed, state]);

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
      toValue: detailsShown ? 0 : 0.32,
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
      toValue: detailsExpanded ? 0.32 : 1,
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
      {ready && (
        <View
          style={{
            position: 'absolute',
            left: 5,
            bottom: '-11%',
            zIndex: 100,
            justifyContent: 'center',
            alignItems: 'center',
            // backgroundColor: theme.colors.tabs,
            borderRadius: 10,
          }}>
          <View
            style={{
              flexDirection: 'row',
            }}>
            {(!state.markersRefresh || !state.realisticMarkers) && (
              <SideButton
                icon="refresh"
                color={theme.colors.text}
                style={styles.bottomButtons}
                onPress={() => {
                  if (arRef.current && ARDisplayed) {
                    UIManager.dispatchViewManagerCommand(
                      arRef.current,
                      ARManager.Commands.REFRESH.toString(),
                      [],
                    );
                  }
                }}
              />
            )}
            {visibleLocations && (
              <>
                {!visibleLocations.first && (
                  <SideButton
                    icon="arrow-down"
                    color={theme.colors.text}
                    text={
                      visibleLocations.minDistance < 1000
                        ? `${visibleLocations.minDistance}m`
                        : `${(visibleLocations.minDistance / 1000).toFixed(
                            2,
                          )}Km`
                    }
                    style={styles.bottomButtons}
                    onPress={() => {
                      if (arRef.current && ARDisplayed) {
                        UIManager.dispatchViewManagerCommand(
                          arRef.current,
                          ARManager.Commands.SHOW_MARKERS.toString(),
                          [false],
                        );
                      }
                    }}
                  />
                )}
                {!visibleLocations.last && (
                  <SideButton
                    icon="arrow-up"
                    color={theme.colors.text}
                    text={
                      visibleLocations.maxDistance < 1000
                        ? `${visibleLocations.maxDistance}m`
                        : `${(visibleLocations.maxDistance / 1000).toFixed(
                            2,
                          )}Km`
                    }
                    style={styles.bottomButtons}
                    onPress={() => {
                      if (arRef.current && ARDisplayed) {
                        UIManager.dispatchViewManagerCommand(
                          arRef.current,
                          ARManager.Commands.SHOW_MARKERS.toString(),
                          [true],
                        );
                      }
                    }}
                  />
                )}
              </>
            )}
          </View>
        </View>
      )}
      {elevation && ready && (
        <View
          style={{
            position: 'absolute',
            left: 5,
            top: 5,
            zIndex: 100,
            justifyContent: 'center',
            alignItems: 'center',
            backgroundColor: theme.colors.tabs,
            paddingVertical: 4,
            paddingHorizontal: 8,
            borderRadius: 10,
          }}>
          <TouchableOpacity onPress={() => setInfoOpen(!infoOpen)}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <View
                style={{
                  marginEnd: infoOpen ? 10 : 5,
                  paddingVertical: infoOpen ? 0 : 12,
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <ThemeIcon
                  name={infoOpen ? 'arrow-left' : 'arrow-right'}
                  size={10}
                  color={theme.colors.text}
                />
              </View>
              {infoOpen && (
                <View>
                  <ThemeText
                    style={{
                      fontSize: 14,
                      fontWeight: 'bold',
                    }}>
                    {`Est. Elevation: ${elevation}m`}
                  </ThemeText>
                  <ThemeText
                    style={{
                      fontSize: 12,
                      fontWeight: 'bold',
                    }}>{`Azimuth: ${azimuth?.toFixed(3)}°`}</ThemeText>
                  <View style={{ flexDirection: 'row' }}>
                    {(cacheUse || localUse) && (
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'center',
                          alignItems: 'center',
                        }}>
                        <ThemeIcon
                          name={'folder-alt'}
                          size={10}
                          color={theme.colors.accent_secondary}
                        />
                        <View style={{ marginStart: 4 }}>
                          <ThemeText
                            style={{
                              fontSize: 12,
                              color: theme.colors.accent_secondary,
                              fontWeight: 'bold',
                            }}>
                            {localUse !== undefined
                              ? localUse.length < 20
                                ? `Saved: ${localUse}`
                                : `${localUse.substring(0, 18)}...`
                              : 'Cache'}
                          </ThemeText>
                        </View>
                      </View>
                    )}
                    <ThemeText
                      style={{
                        fontSize: 12,
                        marginStart: cacheUse ? 12 : 0,
                      }}>
                      {locationCount === undefined ||
                      locationCount.locationCount === 0
                        ? `No locations visible`
                        : `Showing ${locationCount.currentCount}/${locationCount.locationCount} locations`}
                    </ThemeText>
                  </View>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </View>
      )}

      <View style={{ flex: 1, flexDirection: 'row' }}>
        {!ready && (
          <Center style={{ flex: 1, zIndex: 1 }}>
            <ThemeText>{loadingMessage}</ThemeText>
            <ActivityIndicator size="large" color={theme.colors.primary} />
          </Center>
        )}
        <Animated.View
          style={{
            flex: mapReverseAnimation,
            display: ready ? 'flex' : 'none',
          }}>
          <NativeARView
            style={{
              flex: ready ? 1 : 0,
            }}
            ref={(nativeRef) => (arRef.current = findNodeHandle(nativeRef))}
            onUserElevation={(event: any) =>
              setElevation(event.nativeEvent.elevation)
            }
            onUseCache={(event: any) => setCacheUse(true)}
            onLocalUse={(event: any) => setLocalUse(event.nativeEvent.name)}
            onChangedVisible={(event: any) =>
              setVisibleLocations({
                minDistance: event.nativeEvent.min_distance,
                maxDistance: event.nativeEvent.max_distance,
                first: event.nativeEvent.first,
                last: event.nativeEvent.last,
              })
            }
            onLocationCount={(event) =>
              setLocationCount({
                locationCount: event.nativeEvent.count,
                currentCount: event.nativeEvent.current,
              })
            }
            onLocationMarkerTouch={(event: any) => {
              const {
                en_name,
                heb_name,
                main_name,
                type,
                distance,
                mElevation,
              } = event.nativeEvent;
              setLocationName({
                en_name,
                heb_name,
                main_name,
                type,
                distance,
                mElevation,
              });
              if (!detailsShown) {
                toggleShowDetailsFrame();
              }
            }}
            onReady={(event) => {
              if (event.nativeEvent.ready) {
                setReady(true);
              } else setErrorModalShown(true);
            }}
            onLoadingProgress={(event: any) =>
              setLoadingMessage(event.nativeEvent.message)
            }
          />
        </Animated.View>
        {ready && (
          <Animated.View
            style={{
              flex: mapAnimation,
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
                  <ActivityIndicator
                    size="large"
                    color={theme.colors.primary}
                  />
                )}
              </Center>
            )}
            <NativeMapView
              isShown={mapShown}
              enableZoom={false}
              useObserverLocation={true}
              useCompassOrientation={true}
              onOrientationChanged={(event) =>
                setAzimuth(event.nativeEvent.azimuth)
              }
              style={{
                flex: loadingMap ? 0 : 1,
                display: mapShown ? 'flex' : 'none',
              }}
              ref={(nativeRef) => (mapRef.current = findNodeHandle(nativeRef))}
            />
          </Animated.View>
        )}
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
          name_en={locationName?.en_name}
          name_heb={locationName?.heb_name}
          main_name={locationName?.main_name}
          type={locationName?.type}
          distance={locationName?.distance}
          elevation={locationName?.mElevation}
          onExpand={expandDetailsFrame}
          onClose={() => {
            if (detailsShown) {
              toggleShowDetailsFrame(() => setLocationName(null));
            }
          }}
        />
      </Animated.View>
      <OptionModal
        text="Are you sure you want to close the current Augmented Reality Session?"
        isVisible={closeModalShown}
        hide={() => setCloseModalShown(false)}
        onOK={closeSession}
      />
      <ErrorModal
        text="External error occurred while fetching data, please try again later."
        isVisible={errorModalShown}
        hide={() => {
          closeSession();
          setErrorModalShown(false);
          navigation.navigate('Scene');
        }}
      />
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
  bottomButtons: {
    height: 70,
    paddingVertical: 8,
    paddingHorizontal: 24,
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderRadius: 20,
  },
});
