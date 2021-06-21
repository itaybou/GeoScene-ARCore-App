import {
  NavigationContainer,
  Route,
  getFocusedRouteNameFromRoute,
} from '@react-navigation/native';
import React, { useState } from 'react';
import {
  SceneRoutesParamList,
  TabRoutesParamList,
  TriangulateRoutesParamList,
} from './params/RoutesParamList';

import { HomeStackRoutes } from './stacks/HomeStackRoutes';
import { MapsStackRoutes } from './stacks/MapsStackRoutes';
import Orientation from 'react-native-orientation';
import { PlacesStackRoutes } from './stacks/PlacesStackRoutes';
import { SceneStackRoutes } from './stacks/SceneStackRoutes';
import { SettingsStackRoutes } from './stacks/SettingsStackRoutes';
import { StyleSheet } from 'react-native';
import { TabBarButton } from '../components/tabs/TabBarButton';
import { TabBarCenterButton } from '../components/tabs/TabBarCenterButton';
import { ThemeIcon } from '../components/assets/ThemeIcon';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useEffect } from 'react';
import useTheme from '../utils/hooks/useTheme';

interface TabRoutesProps {}

const NoNavigationBarScreens = ['AR', 'TriangulateStack'];

const Tabs = createBottomTabNavigator<TabRoutesParamList>();

const containsNavigationTab = (
  route: Route<
    'Scene' | 'Triangulate',
    SceneRoutesParamList | TriangulateRoutesParamList
  >,
) => {
  return !NoNavigationBarScreens.includes(
    getFocusedRouteNameFromRoute(route) ?? '',
  );
};

export const TabRoutes: React.FC<TabRoutesProps> = ({}) => {
  const theme = useTheme();
  const [tabLabelPosition, setTabLabelPosition] = useState<
    'below-icon' | 'beside-icon'
  >('below-icon');

  const orientationListener = (orientation: string) => {
    switch (orientation) {
      case 'LANDSCAPE':
        setTabLabelPosition('beside-icon');
        break;
      case 'PORTRAITUPSIDEDOWN':
      case 'PORTRAIT':
      case 'UNKNOWN':
        setTabLabelPosition('below-icon');
        break;
    }
  };

  useEffect(() => {
    Orientation.addOrientationListener(orientationListener);

    return () => Orientation.removeOrientationListener(orientationListener);
  }, []);

  return (
    <Tabs.Navigator
      initialRouteName="Home"
      tabBarOptions={{
        keyboardHidesTabBar: true,
        labelPosition: tabLabelPosition,
        ...{
          alignItems: 'center',
          justifyContent: 'center',
          activeTintColor: theme.colors.accent,
          inactiveTintColor: theme.colors.inactiveTint,
        },
        ...{
          tabStyle: styles.tabsStyle,
          labelStyle: styles.labelStyle,
          style: {
            ...styles.tabBarStyle,
            ...{
              backgroundColor: theme.colors.tabs,
              borderTopColor: theme.colors.border,
            },
          },
        },
      }}>
      <Tabs.Screen
        name="Home"
        component={HomeStackRoutes}
        options={{
          unmountOnBlur: true,
          tabBarButton: TabBarButton,
          tabBarIcon: ({ color }) => <ThemeIcon name="home" color={color} />,
          title: 'Home',
        }}
      />
      <Tabs.Screen
        name="Places"
        component={PlacesStackRoutes}
        options={{
          unmountOnBlur: true,
          tabBarButton: TabBarButton,
          tabBarIcon: ({ color }) => (
            <ThemeIcon name="location-pin" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="Scene"
        component={SceneStackRoutes}
        options={({ route }) => ({
          tabBarIcon: containsNavigationTab(route)
            ? TabBarCenterButton
            : () => null,
          tabBarLabel: () => null,
          tabBarVisible: containsNavigationTab(route),
          unmountOnBlur: true,
        })}
      />
      <Tabs.Screen
        name="Maps"
        component={MapsStackRoutes}
        options={{
          tabBarButton: TabBarButton,
          tabBarIcon: ({ color }) => <ThemeIcon name="map" color={color} />,
          unmountOnBlur: true,
        }}
      />
      <Tabs.Screen
        name="Settings"
        component={SettingsStackRoutes}
        options={{
          unmountOnBlur: true,
          tabBarButton: TabBarButton,
          tabBarIcon: ({ color }) => (
            <ThemeIcon name="settings" color={color} />
          ),
        }}
      />
    </Tabs.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBarStyle: {
    margin: 0,
    elevation: 20,
    borderTopWidth: 0.5,
    height: 50,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    position: 'absolute',
  },
  labelStyle: {
    fontSize: 10,
  },
  tabsStyle: {
    paddingVertical: 5,
  },
});
