import {
  ActivityIndicator,
  Animated,
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
  NativeARCameraView,
  NativeMapView,
} from '../../../../native/NativeViewsBridge';
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import {
  useComponentWillMount,
  useGeolocation,
  useTheme,
} from '../../../utils/hooks/Hooks';

import { Center } from '../../../components/layout/Center';
import IdleTimerManager from 'react-native-idle-timer';
import { IntersectionModal } from './IntersectionModal';
import { IntersectionRecordModal } from './IntersectionRecordModal';
import Orientation from 'react-native-orientation';
import { Text } from 'react-native';
import { ThemeIcon } from '../../../components/assets/ThemeIcon';
import { ThemeText } from '../../../components/text/ThemeText';
import { TriangulateStackRouteNavProps } from '../../../navigation/params/RoutesParamList';
import { getTriangulationRecords } from '../../../api/firestore/triangulation/TriangulationFirestore';

const ANIMATION_TIMING_CONFIG = {
  duration: 250,
  easing: Easing.inOut(Easing.quad),
  useNativeDriver: false,
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
    <View style={[styles.mapButtonWrapper, flex ? { flex } : {}]}>
      <TouchableOpacity
        onPress={onPress}
        style={[style, { backgroundColor: theme.colors.tabs }]}>
        <View style={{ flexDirection: 'row' }}>
          <ThemeIcon
            name={icon}
            color={color ?? theme.colors.accent}
            size={20}
          />
          {text && <ThemeText style={{ marginLeft: 8 }}>{text}</ThemeText>}
        </View>
      </TouchableOpacity>
    </View>
  );
};

export function TriangulationView({
  route,
  navigation,
}: TriangulateStackRouteNavProps<'Triangulate'>) {
  const theme = useTheme();

  const [ARDisplayed, setARDisplayed] = useState<boolean>(false);
  const [intersectionModalVisible, setIntersectionModalVisible] = useState<
    boolean
  >(false);
  const [
    intersectionRecordModalVisible,
    setIntersectionRecordModalVisible,
  ] = useState<boolean>(false);
  const [loadingMap, setLoadingMap] = useState<boolean>(true);

  const [mapShown, setMapShown] = useState<boolean>(false);

  const arRef = useRef<number | null>(null);
  const mapRef = useRef<number | null>(null);
  const mapAnimation = useRef(new Animated.Value(0)).current;

  const ARManager = UIManager.getViewManagerConfig('ARCameraFragment');
  const MapsManager = UIManager.getViewManagerConfig('MapView');

  const [azimuth, setAzimuth] = useState<number>(0);
  const [triangulationData, setTriangulationData] = useState<any[] | null>(
    null,
  );
  const [triangulationIntersections, setTriangulationIntersections] = useState<
    any[]
  >([]);

  const location = useGeolocation();

  const fetchTriangulationData = useCallback(async () => {
    if (location.latitude && location.longitude && !triangulationData) {
      await getTriangulationRecords({
        latitude: location.latitude,
        longitude: location.longitude,
      }).then((data) => {
        setTriangulationData(
          data &&
            data.map((t) =>
              Object({
                id: t.id,
                name: t.name,
                description: t.description,
                azimuth: t.azimuth,
                latitude: t.coordinate.latitude,
                longitude: t.coordinate.longitude,
              }),
            ),
        );
      });
    }
  }, [location.latitude, location.longitude]);

  const locationText = useMemo(
    () =>
      location.latitude && location.longitude
        ? `Latitude: ${location.latitude.toFixed(
            4,
          )}, Longitude: ${location.longitude.toFixed(4)}`
        : '',
    [location.latitude, location.longitude],
  );

  useEffect(() => {
    fetchTriangulationData();
  }, [fetchTriangulationData]);

  useComponentWillMount(() => Orientation.lockToLandscapeLeft());

  useEffect(() => {
    IdleTimerManager.setIdleTimerDisabled(true);
    StatusBar.setHidden(true);

    return () => {
      StatusBar.setHidden(false);
      IdleTimerManager.setIdleTimerDisabled(false);
      Orientation.lockToPortrait();
    };
  }, []);

  useEffect(() => {
    if (arRef.current && !ARDisplayed) {
      UIManager.dispatchViewManagerCommand(
        arRef.current,
        ARManager.Commands.CREATE.toString(),
        [arRef.current],
      );
      setARDisplayed(true);
    }
  }, [ARManager.Commands.CREATE, ARDisplayed]);

  const mapReverseAnimation = mapAnimation.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 0],
  });

  const intersectionText = useMemo(
    () => `${triangulationIntersections?.length} Intersections`,
    [triangulationIntersections?.length],
  );

  return (
    <SafeAreaView
      style={{ flex: 1, flexDirection: 'column', position: 'relative' }}>
      <View style={{ flex: 1, flexDirection: 'row' }}>
        <Animated.View
          style={{
            flex: mapReverseAnimation,
            display: 'flex',
          }}>
          <NativeARCameraView
            style={{
              flex: 1,
            }}
            triangulationIntersections={triangulationIntersections}
            ref={(nativeRef) => (arRef.current = findNodeHandle(nativeRef))}
          />
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              justifyContent: 'center',
              alignItems: 'flex-start',
              flexDirection: 'row',
            }}>
            <View
              style={{
                alignItems: 'center',
                backgroundColor: theme.colors.tabs,
                borderBottomRightRadius: 20,
                borderBottomLeftRadius: 20,
                paddingVertical: 4,
                paddingHorizontal: 16,
              }}>
              <ThemeText style={{ fontSize: 15 }}>{`Azimuth: ${azimuth?.toFixed(
                3,
              )}°`}</ThemeText>
              <ThemeText style={{ fontSize: 10 }}>{locationText}</ThemeText>
              {(intersectionModalVisible || intersectionRecordModalVisible) && (
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                  <ThemeIcon name="lock" color={theme.colors.error} size={15} />
                  <Text
                    style={{
                      fontSize: 15,
                      color: theme.colors.error,
                    }}>
                    Locked Orientation
                  </Text>
                </View>
              )}
            </View>
          </View>
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: '-8%',
              justifyContent: 'flex-end',
              alignItems: 'flex-start',
            }}>
            <View
              style={{
                flexDirection: 'row',
              }}>
              <SideButton
                icon="plus"
                color={theme.colors.text}
                text="Add Record"
                style={styles.bottomButtons}
                onPress={() => {
                  setIntersectionRecordModalVisible(true);
                  if (mapShown) {
                    Animated.timing(mapAnimation, {
                      toValue: 0,
                      ...ANIMATION_TIMING_CONFIG,
                    }).start(() => setMapShown(false));
                  }
                }}
              />
              {triangulationIntersections &&
                triangulationIntersections?.length > 0 && (
                  <SideButton
                    icon="target"
                    color={theme.colors.text}
                    text={intersectionText}
                    style={styles.bottomButtons}
                    onPress={() => {
                      setIntersectionModalVisible(true);
                      if (mapShown) {
                        Animated.timing(mapAnimation, {
                          toValue: 0,
                          ...ANIMATION_TIMING_CONFIG,
                        }).start(() => setMapShown(false));
                      }
                    }}
                  />
                )}
            </View>
          </View>
          <View
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: intersectionModalVisible ? '30%' : 0,
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <ThemeIcon name={'frame'} size={30} color={'red'} />
          </View>
        </Animated.View>
        <Animated.View
          style={{
            //height,
            flex: mapAnimation,
            // width: mapShown ? width * 0.4 : 0,
            flexDirection: 'row',
            display: 'flex',
          }}>
          <SideButton
            style={styles.mapButton}
            flex={0.0001}
            icon="map"
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
            isShown={true}
            enableLocationTap={false}
            useObserverLocation={true}
            showBoundingCircle={false}
            useTriangulation={true}
            enableZoom={false}
            useCompassOrientation={true}
            animateToIncludeTriangulationPoints={true}
            onTriangulationIntersection={(event) => {
              !intersectionModalVisible &&
                !intersectionRecordModalVisible &&
                setTriangulationIntersections(event.nativeEvent.data);
            }}
            onOrientationChanged={(event) =>
              !intersectionModalVisible &&
              !intersectionRecordModalVisible &&
              setAzimuth(event.nativeEvent.azimuth)
            }
            triangulationData={triangulationData}
            ref={(nativeRef) => (mapRef.current = findNodeHandle(nativeRef))}
            style={{ flex: loadingMap ? 0 : 1 }}
          />
        </Animated.View>
      </View>
      <IntersectionModal
        azimuth={azimuth}
        intersectionText={intersectionText}
        intersectionModalVisible={intersectionModalVisible}
        hide={() => setIntersectionModalVisible(false)}
        triangulationData={triangulationData}
        triangulationIntersections={triangulationIntersections}
      />
      <IntersectionRecordModal
        onApprove={(latitude: number, longitude: number, azi: number) =>
          navigation.replace('AddTriangulate', {
            coordinate: { latitude, longitude },
            azimuth: azi,
          })
        }
        azimuth={azimuth}
        locationText={locationText}
        location={{
          latitude: location.latitude,
          longitude: location.longitude,
        }}
        intersectionModalVisible={intersectionRecordModalVisible}
        hide={() => setIntersectionRecordModalVisible(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mapButtonWrapper: {
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
  bottomButtons: {
    height: 70,
    borderWidth: 1,
    borderColor: 'black',
    paddingVertical: 8,
    paddingHorizontal: 24,
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderRadius: 20,
  },
  detailsFrame: {
    width: '100%',
    borderTopLeftRadius: 25,
    elevation: 20,
    position: 'absolute',
    bottom: 0,
  },
});
