import { ARGeoScene, Overpass } from '../../../native/NativeModulesBridge';
import { Button, View } from 'react-native';
import {
  Dimensions,
  FlatList,
  NativeModules,
  StyleSheet,
  Text,
} from 'react-native';
import {
  SettingsRoutesParamList,
  SettingsStackRouteNavProps,
} from '../params/RoutesParamList';
import { useEffect, useState } from 'react';

import { AboutScreen } from '../../containers/screens/settings/AboutScreen';
import { ActivityIndicator } from 'react-native-paper';
import { AnimatedSwipeView } from '../../components/layout/AnimatedSwipeView';
import { Center } from '../../components/layout/Center';
import Header from '../../containers/Header';
import React from 'react';
import { SettingsScreen } from '../../containers/screens/settings/SettingsScreen';
import { ThemeProvider } from '@react-navigation/native';
import { createChangeset } from '../../api/osm/OSMApi';
import { createStackNavigator } from '@react-navigation/stack';
import promisify from '../../api/promisify';
import useTheme from '../../utils/hooks/useTheme';
import useUser from '../../utils/hooks/useUser';

interface StackProps {}

const Stack = createStackNavigator<SettingsRoutesParamList>();

export const SettingsStackRoutes: React.FC<StackProps> = ({}) => {
  return (
    <Stack.Navigator
      screenOptions={{
        header: Header,
        animationEnabled: false,
      }}>
      <Stack.Screen name="Settings" component={SettingsScreen} />
      <Stack.Screen name="About" component={AboutScreen} />
    </Stack.Navigator>
  );
};
