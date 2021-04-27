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
import { useGeolocation, useTheme, useUser } from '../../../utils/hooks/Hooks';

import { BottomModal } from '../../../components/modals/BottomModal';
import { Center } from '../../../components/layout/Center';
import { FlatList } from 'react-native-gesture-handler';
import Orientation from 'react-native-orientation';
import { Text } from 'react-native';
import { ThemeButton } from '../../../components/input/ThemeButton';
import { ThemeIcon } from '../../../components/assets/ThemeIcon';
import { ThemeSlider } from '../../../components/input/ThemeSlider';
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

interface IntersectionModalProps {
  intersectionText: string;
  intersectionModalVisible: boolean;
  hide: () => void;
  triangulationData: any[] | null;
  triangulationIntersections: any[] | null;
  azimuth: number | null;
}

const IntersectionModal: React.FC<IntersectionModalProps> = ({
  intersectionText,
  intersectionModalVisible,
  hide,
  triangulationData,
  triangulationIntersections,
  azimuth,
}) => {
  const theme = useTheme();
  const [viewedIntersection, setViewedIntersection] = useState<any>(null);

  const renderIntersection = ({ item }) => {
    return (
      <View
        style={{
          paddingHorizontal: 12,
          paddingVertical: 8,
          flexDirection: 'row',
          justifyContent: 'space-between',
          backgroundColor: theme.colors.tabs,
          borderBottomColor: theme.colors.border,
          borderBottomWidth: 2,
        }}>
        <View
          style={{
            flexDirection: 'column',
          }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            <ThemeText style={{ fontSize: 15, fontWeight: 'bold' }}>
              {item.name}
            </ThemeText>
            <ThemeText
              style={{ fontSize: 12, fontWeight: 'bold', marginLeft: 20 }}>
              Distance: {(item.distance / 1000).toFixed(3)} KM
            </ThemeText>
          </View>
          <ThemeText style={{ fontSize: 12 }}>
            Latitude: {item.latitude.toFixed(4)}, Longitude:{' '}
            {item.longitude.toFixed(4)}
          </ThemeText>
        </View>
        <ThemeButton icon="map" onPress={() => setViewedIntersection(item)} />
      </View>
    );
  };

  return (
    <BottomModal
      title={intersectionText}
      enableSwipeDown={true}
      screenPercent={0.65}
      buttonIcon={'close'}
      backdropOpacity={0}
      isVisible={intersectionModalVisible}
      hide={() => {
        setViewedIntersection(null);
        hide();
      }}
      onButtonPress={() => {
        setViewedIntersection(null);
        hide();
      }}
      showButtonIcon={true}>
      {intersectionModalVisible && (
        <View style={{ flex: 1, flexDirection: 'row' }}>
          <View style={{ flex: viewedIntersection === null ? 1 : 0.3 }}>
            {viewedIntersection === null ? (
              <FlatList
                data={triangulationIntersections}
                renderItem={renderIntersection}
                keyExtractor={(item) => item?.id}
              />
            ) : (
              <View
                style={{
                  flexDirection: 'column',
                  flex: 1,
                  justifyContent: 'space-between',
                }}>
                <View style={{}}>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}>
                    <ThemeText style={{ fontSize: 15, fontWeight: 'bold' }}>
                      {viewedIntersection.name}
                    </ThemeText>
                    <ThemeText
                      style={{
                        fontSize: 12,
                        fontWeight: 'bold',
                        marginLeft: 20,
                      }}>
                      Distance:{' '}
                      {(viewedIntersection.distance / 1000).toFixed(3)} KM
                    </ThemeText>
                  </View>
                  <ThemeText style={{ fontSize: 12 }}>
                    Latitude: {viewedIntersection.latitude.toFixed(4)},
                    Longitude: {viewedIntersection.longitude.toFixed(4)}
                  </ThemeText>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginRight: 4,
                  }}>
                  <ThemeButton
                    icon="arrow-left"
                    onPress={() => setViewedIntersection(null)}
                  />
                  <ThemeButton icon="like" onPress={() => {}} />
                </View>
              </View>
            )}
          </View>
          <NativeMapView
            enableLocationTap={false}
            useObserverLocation={true}
            showBoundingCircle={false}
            useTriangulation={false}
            enableZoom={true}
            useCompassOrientation={false}
            showTriangulationData={
              viewedIntersection && [
                viewedIntersection,
                triangulationData?.find((d) => d.id === viewedIntersection.id),
                azimuth,
              ]
            }
            style={{ flex: viewedIntersection === null ? 0 : 0.7 }}
          />
        </View>
      )}
    </BottomModal>
  );
};

interface IntersectionRecordModalProps {
  intersectionModalVisible: boolean;
  onApprove: (latitude: number, longitude: number, azi: number) => void;
  hide: () => void;
  azimuth: number | null;
  locationText: string;
  location: {
    latitude: number;
    longitude: number;
  };
}

const IntersectionRecordModal: React.FC<IntersectionRecordModalProps> = ({
  locationText,
  intersectionModalVisible,
  hide,
  location,
  azimuth,
  onApprove,
}) => {
  const [azimuthDiff, setAzimuthDiff] = useState<number>(
    azimuth === null ? 0 : azimuth,
  );

  useEffect(() => setAzimuthDiff(azimuth === null ? 0 : azimuth), [azimuth]);

  return (
    <BottomModal
      title={'Add Triangulation Record'}
      enableSwipeDown={true}
      screenPercent={0.65}
      buttonIcon={'close'}
      backdropOpacity={0}
      isVisible={intersectionModalVisible}
      hide={hide}
      onButtonPress={hide}
      showButtonIcon={true}>
      {intersectionModalVisible && (
        <View style={{ flex: 1, flexDirection: 'row' }}>
          <View
            style={{ flex: 1, justifyContent: 'space-between', padding: 2 }}>
            <View>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                <ThemeText>{`Azimuth: ${azimuthDiff?.toFixed(3)}°`}</ThemeText>
                <View style={{ flexDirection: 'row' }}>
                  <ThemeButton
                    icon="minus"
                    onPress={() =>
                      setAzimuthDiff(
                        azimuthDiff > 0 ? azimuthDiff - 0.1 : azimuthDiff,
                      )
                    }
                  />
                  <ThemeButton
                    icon="plus"
                    onPress={() =>
                      setAzimuthDiff(
                        azimuthDiff < 360 ? azimuthDiff + 0.1 : azimuthDiff,
                      )
                    }
                  />
                </View>
              </View>
              <ThemeSlider
                value={azimuthDiff}
                step={0.001}
                range={{ min: 0, max: 360 }}
                onValueChange={(value: number) => setAzimuthDiff(value)}
              />
              <ThemeText>{locationText}</ThemeText>
            </View>

            <ThemeButton
              icon="like"
              onPress={() =>
                onApprove(location.latitude, location.longitude, azimuthDiff)
              }
            />
          </View>
          <NativeMapView
            enableLocationTap={false}
            useObserverLocation={true}
            showBoundingCircle={false}
            useTriangulation={false}
            enableZoom={true}
            useCompassOrientation={false}
            showTriangulationData={[
              { latitude: location.latitude, longitude: location.longitude },
              azimuthDiff,
            ]}
            style={{ flex: 1 }}
          />
        </View>
      )}
    </BottomModal>
  );
};

export function TriangulationView({
  route,
  navigation,
}: TriangulateStackRouteNavProps<'Triangulate'>) {
  const theme = useTheme();

  const [ready, setReady] = useState<boolean>(true);
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

  const { state, dispatch } = useUser();
  const [azimuth, setAzimuth] = useState<number>(0);
  const [triangulationData, setTriangulationData] = useState<any[] | null>(
    null,
  );
  const [triangulationIntersections, setTriangulationIntersections] = useState<
    any[]
  >([]);
  const [
    animateToIncludeTriangulationPoints,
    setAnimateToIncludeTriangulationPoints,
  ] = useState<boolean>(true);

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

  useEffect(() => {
    Orientation.lockToLandscapeLeft();
    StatusBar.setHidden(true);

    return () => {
      StatusBar.setHidden(false);
      Orientation.unlockAllOrientations();
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
        {!ready && (
          <Center style={{ flex: 1, zIndex: 1 }}>
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
          <NativeARCameraView
            style={{
              //height,
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
            display: ready ? 'flex' : 'none',
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
            enableLocationTap={false}
            useObserverLocation={true}
            showBoundingCircle={false}
            useTriangulation={true}
            enableZoom={false}
            useCompassOrientation={true}
            animateToIncludeTriangulationPoints={
              animateToIncludeTriangulationPoints
            }
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
