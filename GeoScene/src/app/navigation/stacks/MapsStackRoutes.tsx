import {
  ActivityIndicator,
  Animated,
  Button,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  UIManager,
  View,
  findNodeHandle,
} from 'react-native';
import {
  MapsRoutesParamList,
  MapsStackRouteNavProps,
} from '../params/RoutesParamList';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  addTriangulationPoint,
  getTriangulationData,
} from '../../api/firestore/Firestore';
import {
  auth,
  authorizationDetails,
  deauth,
  isAuthorized,
} from '../../auth/Authentication';
import { useGeolocation, useTheme } from '../../utils/hooks/Hooks';

import { ARSceneViewTest } from '../../containers/screens/triangulation/TriangulationView';
import { Center } from '../../components/layout/Center';
import { Checkbox } from 'react-native-paper';
import Header from '../../containers/Header';
import { NativeMapView } from '../../../native/NativeViewsBridge';
import { TabScreen } from '../../components/layout/TabScreen';
import { ThemeText } from '../../components/text/ThemeText';
import { createStackNavigator } from '@react-navigation/stack';
import useUser from '../../utils/hooks/useUser';

interface StackProps {}

const Stack = createStackNavigator<MapsRoutesParamList>();

function Maps({ route }: MapsStackRouteNavProps<'Maps'>) {
  const theme = useTheme();
  const { state, dispatch } = useUser();

  return (
    <Center>
      <Text>Route name1: {route.name}</Text>
      <ThemeText>{state.user?.name}</ThemeText>
      <ActivityIndicator size="large" color={theme.colors.primary} />
      <Button title="Sign-In" onPress={() => auth(dispatch)} />
      <Button title="Sign-Out" onPress={() => deauth(dispatch)} />
      <Image
        source={{
          uri: state.user?.img,
        }}
        style={{ width: 55, height: 55, borderRadius: 55 / 2 }}
      />
    </Center>
  );
}

function MapsTest({ route }: MapsStackRouteNavProps<'Maps'>) {
  const theme = useTheme();
  const { state, dispatch } = useUser();
  const [azimuth, setAzimuth] = useState<number | null>(null);
  const [triangulationData, setTriangulationData] = useState<any[] | null>(
    null,
  );
  const [triangulationIntersections, setTriangulationIntersections] = useState<
    any[] | null
  >(null);
  const [
    animateToIncludeTriangulationPoints,
    setAnimateToIncludeTriangulationPoints,
  ] = useState<boolean>(false);

  const location = useGeolocation();

  const mapRef = useRef<number | null>(null);
  const MapsManager = UIManager.getViewManagerConfig('MapsFragment');

  useEffect(() => {
    if (mapRef.current) {
      UIManager.dispatchViewManagerCommand(
        mapRef.current,
        MapsManager.Commands.CREATE.toString(),
        [mapRef.current],
      );
    }
  }, [MapsManager.Commands.CREATE, mapRef.current]);

  const fetchTriangulationData = useCallback(async () => {
    if (location.latitude && location.longitude && !triangulationData) {
      await getTriangulationData({
        latitude: location.latitude,
        longitude: location.longitude,
      }).then((data) => {
        console.log(data);
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

  useEffect(() => {
    fetchTriangulationData();
  }, [fetchTriangulationData]);

  useEffect(() => {
    if (state.user) {
      addTriangulationPoint(
        state.user?.name,
        'Test1',
        'blaaa blaaa',
        { latitude: 32.50364093947293, longitude: 35.33079193395417 },
        330,
      );
      addTriangulationPoint(
        state.user?.name,
        'Test2',
        'blaaa blaaa',
        { latitude: 31.82735784224346, longitude: 34.96515319344209 },
        330,
      );
      addTriangulationPoint(
        state.user?.name,
        'Test3',
        'blaaa blaaa',
        { latitude: 31.880140634602405, longitude: 34.86524627016083 },
        330,
      );
    }
  }, []);

  // const dummyData = [
  //   { lat: 31.77508424396634, lon: 34.8175625128214, azimuth: 45 },
  //   { lat: 31.77508424396634, lon: 34.8175625128214, azimuth: 35 },
  //   { lat: 31.77508424396634, lon: 34.8175625128214, azimuth: 330 },
  //   { lat: 31.77508424396634, lon: 34.8175625128214, azimuth: 275 },
  //   { lat: 31.77508424396634, lon: 34.8175625128214, azimuth: 120 },
  //   { lat: 31.77508424396634, lon: 34.8175625128214, azimuth: 180 },
  //   // { lat: 31.77508424396634, lon: 34.8175625128214, azimuth: 90 },
  //   { lat: 31.77508424396634, lon: 34.8175625128214, azimuth: 0 },
  //   { lat: 31.77508424396634, lon: 34.8175625128214, azimuth: 355 },
  //   // { lat: 31.77508424396634, lon: 34.8175625128214, azimuth: 270 },
  //   { lat: 31.77508424396634, lon: 34.8175625128214, azimuth: 80 },
  // ];

  return (
    <TabScreen>
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
          console.log(event.nativeEvent.data);
          setTriangulationIntersections(event.nativeEvent.data);
        }}
        onOrientationChanged={(event) => setAzimuth(event.nativeEvent.azimuth)}
        triangulationData={triangulationData}
        ref={(nativeRef) => (mapRef.current = findNodeHandle(nativeRef))}
        style={{ width: '100%', height: '100%', flex: 1 }}
      />
      <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
        <ThemeText style={{ fontSize: 25 }}>{azimuth}</ThemeText>
        <Checkbox
          color={theme.colors.accent_secondary}
          uncheckedColor={theme.colors.inactiveTint}
          status={animateToIncludeTriangulationPoints ? 'checked' : 'unchecked'}
          onPress={() => {
            setAnimateToIncludeTriangulationPoints(
              !animateToIncludeTriangulationPoints,
            );
            console.log(animateToIncludeTriangulationPoints);
          }}
        />
      </View>
    </TabScreen>
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
