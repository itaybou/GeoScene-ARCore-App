import { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { RouteProp } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import { TabRoutes } from './../TabRoutes';

export type AppRoutesParamList = {
  Internal: InternalRoutesParamList;
  External: ExternalRoutesParamList;
};

export type AppStackRouteNavProps<T extends keyof AppRoutesParamList> = {
  navigation: StackNavigationProp<AppRoutesParamList, T>;
  route: RouteProp<AppRoutesParamList, T>;
};

export type InternalRoutesParamList = {
  Internal: TabRoutesParamList;
};

export type InternalStackRouteNavProps<
  T extends keyof InternalRoutesParamList
> = {
  navigation: StackNavigationProp<InternalRoutesParamList, T>;
  route: RouteProp<InternalRoutesParamList, T>;
};

export type ExternalRoutesParamList = {
  Profile: undefined;
  Messages: undefined;
  ProfileSettings: undefined;
};

export type ExternalStackRouteNavProps<
  T extends keyof ExternalRoutesParamList
> = {
  navigation: StackNavigationProp<ExternalRoutesParamList, T>;
  route: RouteProp<ExternalRoutesParamList, T>;
};

export type TabRoutesParamList = {
  Home: undefined;
  Places: undefined;
  Scene: SceneRoutesParamList;
  Maps: undefined;
  Settings: undefined;
};

export type TabRoutesNavProps<T extends keyof TabRoutesParamList> = {
  navigation: BottomTabNavigationProp<TabRoutesParamList, T>;
  route: RouteProp<TabRoutesParamList, T>;
};

export type HomeRoutesParamList = {
  Home: undefined;
};

export type HomeStackRouteNavProps<T extends keyof HomeRoutesParamList> = {
  navigation: StackNavigationProp<HomeRoutesParamList, T>;
  route: RouteProp<HomeRoutesParamList, T>;
};

export type PlacesRoutesParamList = {
  Places: undefined;
  DownloadPlace: undefined;
};

export type PlacesStackRouteNavProps<T extends keyof PlacesRoutesParamList> = {
  navigation: StackNavigationProp<PlacesRoutesParamList, T>;
  route: RouteProp<PlacesRoutesParamList, T>;
};

export type SceneRoutesParamList = {
  Scene: undefined;
  AR: undefined;
};

export type SceneStackRouteNavProps<T extends keyof SceneRoutesParamList> = {
  navigation: StackNavigationProp<SceneRoutesParamList, T>;
  route: RouteProp<SceneRoutesParamList, T>;
};

export type MapsRoutesParamList = {
  Maps: undefined;
};

export type MapsStackRouteNavProps<T extends keyof MapsRoutesParamList> = {
  navigation: StackNavigationProp<MapsRoutesParamList, T>;
  route: RouteProp<MapsRoutesParamList, T>;
};

export type SettingsRoutesParamList = {
  Settings: undefined;
};

export type SettingsStackRouteNavProps<
  T extends keyof SettingsRoutesParamList
> = {
  navigation: StackNavigationProp<SettingsRoutesParamList, T>;
  route: RouteProp<SettingsRoutesParamList, T>;
};
