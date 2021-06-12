import React, { useState } from 'react';
import { SafeAreaView, StyleSheet } from 'react-native';
import {
  useGeolocation,
  useSettings,
  useTheme,
} from '../../../utils/hooks/Hooks';

import { LocationTypesModal } from '../../../components/modals/settings/LocationTypesModal';
import { MapModal } from '../../../components/modals/MapModal';
import { SettingsActionTypes } from '../../../providers/reducers/SettingsReducer';
import { SettingsList } from '../../../components/settings/SettingsList';
import { SettingsStackRouteNavProps } from '../../../navigation/params/RoutesParamList';
import { TabScreen } from '../../../components/layout/TabScreen';
import { ThemeIcon } from '../../../components/assets/ThemeIcon';

export type SectionData = {
  index: number;
  title: string;
  showHeader: boolean;
  icon?: (color: string) => JSX.Element;
  data: MenuItem[];
}[];

export type MenuItem = {
  title: string;
  additionalText?: string;
  sideComponent?: JSX.Element;
  switch: boolean;
  switchActive: boolean | null;
  onClick: () => void;
  bottomText: boolean;
};

type MenuItems = {
  [section: string]: { [item: string]: MenuItem };
};

interface SettingsScreenProps {}

export const SettingsScreen: React.FC<SettingsStackRouteNavProps<
  'Settings'
>> = ({ navigation }) => {
  const { state, dispatch } = useSettings();
  const [mapModalVisible, setMapModalVisible] = useState<boolean>(false);
  const [locationTypesModalVisible, setLocationTypesModalVisible] = useState<
    boolean
  >(false);

  const location = useGeolocation();

  const activePlaceTypes = [
    ...Object.keys(state.placeTypes['place']).filter(
      (k) => state.placeTypes['place'][k].on,
    ),
    ...Object.keys(state.placeTypes['natural']).filter(
      (k) => state.placeTypes['natural'][k].on,
    ),
    ...Object.keys(state.placeTypes['historic']).filter(
      (k) => state.placeTypes['historic'][k].on,
    ),
  ].length;

  const menuItems: MenuItems = {
    theme: {
      darkMode: {
        title: 'Dark Mode',
        switch: true,
        bottomText: false,
        switchActive: state.theme === 'dark',
        onClick: () =>
          dispatch({
            type: SettingsActionTypes.CHANGE_THEME,
            payload: {
              theme: state.theme === 'light' ? 'dark' : 'light',
            },
          }),
      },
    },
    scene: {
      viewshed: {
        title: 'Determine Visible Places',
        additionalText: 'Show only locations estimated to be in line of sight.',
        switch: true,
        bottomText: true,
        switchActive: state.determineViewshed,
        onClick: () =>
          dispatch({
            type: SettingsActionTypes.CHANGE_VIEWSHED,
            payload: {
              determineViewshed: !state.determineViewshed,
            },
          }),
      },
      center: {
        title: 'Show Visible Place Center',
        switch: true,
        bottomText: true,
        additionalText:
          'Show location center instead of the visible area detected.',
        switchActive: state.showLocationCenter,
        onClick: () =>
          dispatch({
            type: SettingsActionTypes.CHANGE_LOCATION_CENTER,
            payload: {
              showLocationCenter: !state.showLocationCenter,
            },
          }),
      },
      visibleRadius: {
        title: 'Visible Radius',
        additionalText: `${state.visibleRadius}Km`,
        switch: false,
        switchActive: null,
        bottomText: false,
        onClick: () => setMapModalVisible(true),
      },
      locationTypes: {
        title: 'Scene Location Types',
        bottomText: false,
        additionalText: `${activePlaceTypes} ${
          activePlaceTypes > 1 || activePlaceTypes === 0 ? 'types' : 'type'
        }`,
        switch: false,
        switchActive: null,
        onClick: () => setLocationTypesModalVisible(true),
      },
      showPlacesApp: {
        title: 'Show GeoScene Places',
        additionalText: 'Include GeoScene added locations in search.',
        switch: true,
        bottomText: true,
        switchActive: state.showPlacesApp,
        onClick: () =>
          dispatch({
            type: SettingsActionTypes.CHANGE_SHOW_PLACES_APP,
            payload: {
              showPlacesApp: !state.showPlacesApp,
            },
          }),
      },
    },
    about: {
      about: {
        title: 'About GeoScene',
        switch: false,
        bottomText: false,
        switchActive: null,
        onClick: () => navigation.navigate('About'),
      },
    },
  };

  const settingsData: SectionData = [
    {
      title: 'Theme',
      index: 0,
      showHeader: true,
      icon: (color: string) => (
        <ThemeIcon name="drop" size={18} color={color} />
      ),
      data: [menuItems.theme.darkMode],
    },
    {
      title: 'Scene',
      index: 1,
      showHeader: true,
      icon: (color: string) => (
        <ThemeIcon name="compass" size={18} color={color} />
      ),
      data: [
        menuItems.scene.viewshed,
        menuItems.scene.center,
        menuItems.scene.visibleRadius,
        menuItems.scene.locationTypes,
        menuItems.scene.showPlacesApp,
      ],
    },
    {
      title: 'About',
      index: 2,
      showHeader: false,
      data: [menuItems.about.about],
    },
  ];

  return (
    <TabScreen style={styles.container}>
      <SettingsList settingsData={settingsData} />
      <MapModal
        showSlider={true}
        shownPlace={{
          latitude: location.latitude,
          longitude: location.longitude,
        }}
        showBoundingCircle={true}
        showButtonIcon={true}
        title={'Set Visible Radius'}
        isVisible={mapModalVisible}
        hide={() => setMapModalVisible(false)}
        onButtonPress={(radius: number) =>
          dispatch({
            type: SettingsActionTypes.CHANGE_VISIBLE_RADIUS,
            payload: {
              visibleRadius: radius,
            },
          })
        }
      />
      <LocationTypesModal
        title={menuItems.scene.locationTypes.title}
        isVisible={locationTypesModalVisible}
        hide={() => setLocationTypesModalVisible(false)}
      />
    </TabScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
