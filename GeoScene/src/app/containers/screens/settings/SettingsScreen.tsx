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
import { TabBarIcon } from '../../../components/tabs/TabBarIcon';
import { TabScreen } from '../../../components/layout/TabScreen';

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

  const menuItems: MenuItems = {
    theme: {
      darkMode: {
        title: 'Dark Mode',
        switch: true,
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
        switch: true,
        switchActive: state.determineViewshed,
        onClick: () =>
          dispatch({
            type: SettingsActionTypes.CHANGE_VIEWSHED,
            payload: {
              determineViewshed: !state.determineViewshed,
            },
          }),
      },
      visibleRadius: {
        title: 'Visible Radius',
        additionalText: `${state.visibleRadius}Km`,
        switch: false,
        switchActive: null,
        onClick: () => setMapModalVisible(true),
      },
      locationTypes: {
        title: 'Scene Location Types',
        additionalText: `${state.locationTypes} types`,
        switch: false,
        switchActive: null,
        onClick: () => setLocationTypesModalVisible(true),
      },
    },
    about: {
      about: {
        title: 'About GeoScene',
        switch: false,
        switchActive: null,
        onClick: () => {},
      },
    },
  };

  const settingsData: SectionData = [
    {
      title: 'Theme',
      index: 0,
      showHeader: true,
      icon: (color: string) => (
        <TabBarIcon name="drop" size={18} color={color} />
      ),
      data: [menuItems.theme.darkMode],
    },
    {
      title: 'Scene',
      index: 1,
      showHeader: true,
      icon: (color: string) => (
        <TabBarIcon name="compass" size={18} color={color} />
      ),
      data: [
        menuItems.scene.viewshed,
        menuItems.scene.visibleRadius,
        menuItems.scene.locationTypes,
      ],
    },
    {
      title: 'About',
      index: 2,
      showHeader: false,
      data: [menuItems.about.about],
    },
    // {
    //   title: 'Feedback and Help',
    //   icon: (color: string) => (
    //     <TabBarIcon name="question" size={20} color={color} />
    //   ),
    //   data: ['help'],
    // },
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
        onButtonPress={() => {}}
        hide={() => setLocationTypesModalVisible(false)}
      />
    </TabScreen>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    // backgroundColor: theme.colors.background,
  },
});
