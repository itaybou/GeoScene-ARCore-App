import {
  ActivityIndicator,
  Animated,
  Button,
  Dimensions,
  Image,
  StyleSheet,
  Text,
  View,
  useRef,
} from 'react-native';
import {
  MapsRoutesParamList,
  MapsStackRouteNavProps,
} from '../params/RoutesParamList';
import React, { useState } from 'react';
import {
  auth,
  authorizationDetails,
  deauth,
  isAuthorized,
} from '../../auth/Authentication';

import { Center } from '../../components/layout/Center';
import { Checkbox } from 'react-native-paper';
import Header from '../../containers/Header';
import { NativeMapView } from '../../../native/NativeViewsBridge';
import { TabScreen } from '../../components/layout/TabScreen';
import { ThemeText } from '../../components/text/ThemeText';
import { createStackNavigator } from '@react-navigation/stack';
import { useTheme } from '../../utils/hooks/Hooks';
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
  const [
    animateToIncludeTriangulationPoints,
    setAnimateToIncludeTriangulationPoints,
  ] = useState<boolean>(false);

  const dummyData = [
    { lat: 31.77508424396634, lon: 34.8175625128214, azimuth: 45 },
    { lat: 31.77508424396634, lon: 34.8175625128214, azimuth: 35 },
    { lat: 31.77508424396634, lon: 34.8175625128214, azimuth: 330 },
    { lat: 31.77508424396634, lon: 34.8175625128214, azimuth: 275 },
    { lat: 31.77508424396634, lon: 34.8175625128214, azimuth: 120 },
    { lat: 31.77508424396634, lon: 34.8175625128214, azimuth: 180 },
    // { lat: 31.77508424396634, lon: 34.8175625128214, azimuth: 90 },
    { lat: 31.77508424396634, lon: 34.8175625128214, azimuth: 0 },
    { lat: 31.77508424396634, lon: 34.8175625128214, azimuth: 355 },
    // { lat: 31.77508424396634, lon: 34.8175625128214, azimuth: 270 },
    { lat: 31.77508424396634, lon: 34.8175625128214, azimuth: 80 },
  ];

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
        onOrientationChanged={(event) => setAzimuth(event.nativeEvent.azimuth)}
        triangulationData={dummyData}
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
      <Stack.Screen name="Maps" component={MapsTest} />
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
