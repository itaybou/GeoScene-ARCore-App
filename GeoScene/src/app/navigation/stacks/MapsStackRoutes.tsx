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
import {
  auth,
  authorizationDetails,
  deauth,
  isAuthorized,
} from '../../auth/Authentication';

import { Center } from '../../components/layout/Center';
import Header from '../../containers/Header';
import React from 'react';
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
