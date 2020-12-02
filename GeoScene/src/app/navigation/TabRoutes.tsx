import {
  NavigationContainer,
  Route,
  getFocusedRouteNameFromRoute,
} from '@react-navigation/native';
import {
  SceneRoutesParamList,
  TabRoutesParamList,
} from './params/RoutesParamList';

import { HomeStackRoutes } from './stacks/HomeStackRoutes';
import { MapsStackRoutes } from './stacks/MapsStackRoutes';
import { PlacesStackRoutes } from './stacks/PlacesStackRoutes';
import React from 'react';
import { SceneStackRoutes } from './stacks/SceneStackRoutes';
import { SettingsStackRoutes } from './stacks/SettingsStackRoutes';
import { StyleSheet } from 'react-native';
import { TabBarButton } from '../components/tabs/TabBarButton';
import { TabBarCenterButton } from '../components/tabs/TabBarCenterButton';
import { TabBarIcon } from '../components/tabs/TabBarIcon';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import useTheme from '../utils/hooks/useTheme';

interface TabRoutesProps {}

const NoNavigationBarScreens = ['AR'];

const Tabs = createBottomTabNavigator<TabRoutesParamList>();

// function HomeScreen({ route }: TabRoutesNavProps<'Home'>) {
//   const { state, dispatch } = useContext(SettingsContext);
//   const theme = useTheme();
//   console.log(state);
//   return (
//     <Center>
//       <Text>Route name: {route.name}</Text>
//       <Button
//         title="Go to login screen"
//         buttonStyle={{ backgroundColor: theme.colors.notification }}
//         onPress={() =>
//           dispatch({
//             type: SettingsActionTypes.CHANGE_THEME,
//             payload: {
//               theme:
//                 state.theme === ThemeType.LIGHT
//                   ? ThemeType.DARK
//                   : ThemeType.LIGHT,
//             },
//           })
//         }
//       />
//     </Center>
//   );
// }

// function ScenesScreen({ navigation }: TabRoutesNavProps<'Scene'>) {
//   const theme = useTheme();

//   return (
//     <Center>
//       <Text>Scenes</Text>
//       <Button
//         title="Go to register screen"
//         buttonStyle={{ backgroundColor: theme.colors.notification }}
//         onPress={() => navigation.navigate('Home')}
//       />
//     </Center>
//   );
// }

const containsNavigationTab = (route: Route<'Scene', SceneRoutesParamList>) => {
  return !NoNavigationBarScreens.includes(
    getFocusedRouteNameFromRoute(route) ?? '',
  );
};

export const TabRoutes: React.FC<TabRoutesProps> = ({}) => {
  const theme = useTheme();

  return (
    <NavigationContainer>
      <Tabs.Navigator
        initialRouteName="Home"
        tabBarOptions={{
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
            tabBarButton: TabBarButton,
            tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
            title: 'Home',
          }}
        />
        <Tabs.Screen
          name="Places"
          component={PlacesStackRoutes}
          options={{
            tabBarButton: TabBarButton,
            tabBarIcon: ({ color }) => (
              <TabBarIcon name="location-pin" color={color} />
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
          })}
        />
        <Tabs.Screen
          name="Maps"
          component={MapsStackRoutes}
          options={{
            tabBarButton: TabBarButton,
            tabBarIcon: ({ color }) => <TabBarIcon name="map" color={color} />,
          }}
        />
        <Tabs.Screen
          name="Settings"
          component={SettingsStackRoutes}
          options={{
            tabBarButton: TabBarButton,
            tabBarIcon: ({ color }) => (
              <TabBarIcon name="settings" color={color} />
            ),
          }}
        />
      </Tabs.Navigator>
    </NavigationContainer>
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
