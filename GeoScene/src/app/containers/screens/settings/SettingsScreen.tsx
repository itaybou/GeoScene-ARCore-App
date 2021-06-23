import { MenuOption, MenuOptions } from 'react-native-popup-menu';
import {
  PlaceTypes,
  mapTypes,
  placeTypes,
} from '../../../providers/SettingsProvider';
import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';
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
import { ThemeText } from '../../../components/text/ThemeText';

export type SectionData = {
  index: number;
  title: string;
  showHeader: boolean;
  icon?: (color: string) => JSX.Element;
  data: MenuItem[];
}[];

export type MenuItem = {
  title: string;
  dropdown?: boolean;
  dropdownOptions?: typeof MenuOptions;
  additionalText?: string;
  sideComponent?: JSX.Element;
  switch: boolean;
  switchActive: boolean | null;
  onClick: (() => void) | undefined;
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
  const theme = useTheme();
  const [mapModalVisible, setMapModalVisible] = useState<boolean>(false);
  const [locationTypesModalVisible, setLocationTypesModalVisible] = useState<
    boolean
  >(false);

  const location = useGeolocation();

  const capitalizeFirstLetter = (text: string) => {
    return text.charAt(0).toUpperCase() + text.slice(1);
  };

  const activePlaceTypes = [
    ...Object.keys(state.placeTypes.place).filter(
      (k) => state.placeTypes.place[k].on,
    ),
    ...Object.keys(state.placeTypes.natural).filter(
      (k) => state.placeTypes.natural[k].on,
    ),
    ...Object.keys(state.placeTypes.historic).filter(
      (k) => state.placeTypes.historic[k].on,
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
    area: {
      visibleRadius: {
        title: 'Visible Radius',
        additionalText: `${state.visibleRadius}Km`,
        switch: false,
        switchActive: null,
        bottomText: false,
        onClick: () => setMapModalVisible(true),
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
      showMapMarkers: {
        title: 'Show Visible Map Markers',
        switch: true,
        bottomText: false,
        switchActive: state.showVisiblePlacesOnMap,
        onClick: () =>
          dispatch({
            type: SettingsActionTypes.CHANGE_SHOW_MAP_VISIBLE_MARKERS,
            payload: {
              showVisiblePlacesOnMap: !state.showVisiblePlacesOnMap,
            },
          }),
      },
    },
    map: {
      mapType: {
        title: 'Maps Type',
        additionalText: `${capitalizeFirstLetter(state.mapType)}`,
        switch: false,
        dropdown: true,
        dropdownOptions: (
          <MenuOptions
            customStyles={{
              optionsWrapper: {
                width: 150,
                backgroundColor: theme.colors.cards,
              },
            }}>
            {mapTypes.map((type) => (
              <MenuOption
                key={type}
                onSelect={() =>
                  dispatch({
                    type: SettingsActionTypes.CHANGE_MAP_TYPE,
                    payload: {
                      mapType: type,
                    },
                  })
                }>
                <View style={{ flexDirection: 'row', padding: 4 }}>
                  <View style={{ marginRight: 8 }}>
                    <ThemeIcon
                      name={'arrow-right'}
                      size={15}
                      color={theme.colors.text}
                    />
                  </View>
                  <ThemeText>{capitalizeFirstLetter(type)}</ThemeText>
                </View>
              </MenuOption>
            ))}
          </MenuOptions>
        ),
        switchActive: null,
        bottomText: false,
        onClick: () => setMapModalVisible(true),
      },
    },
    ar_optimization: {
      offset_overlap: {
        title: 'Offset Overlaping Markers',
        additionalText:
          'Offset overlapping markers vertically (Slower, Expiremental).',
        switch: true,
        bottomText: true,
        switchActive: state.offsetOverlapMarkers,
        onClick: () =>
          dispatch({
            type: SettingsActionTypes.CHANGE_OFFSET_OVERLAP_MARKERS,
            payload: {
              offsetOverlapMarkers: !state.offsetOverlapMarkers,
            },
          }),
      },
      dynamic_markers: {
        title: 'Dynamic Location Markers',
        additionalText:
          'Location markers will keep refreshing, more accurate (Slower).',
        switch: true,
        bottomText: true,
        switchActive: state.markersRefresh,
        onClick: () =>
          dispatch({
            type: SettingsActionTypes.CHANGE_MARKERS_REFRESH,
            payload: {
              markersRefresh: !state.markersRefresh,
            },
          }),
      },
      realistic_markers: {
        title: 'Realistic Location Markers',
        additionalText:
          'Location markers realistic positioning effect (Slower).',
        switch: true,
        bottomText: true,
        switchActive: state.realisticMarkers,
        onClick: () =>
          dispatch({
            type: SettingsActionTypes.CHANGE_MARKERS_REALISTIC,
            payload: {
              markersRealistic: !state.realisticMarkers,
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
      title: 'Area',
      index: 1,
      showHeader: true,
      icon: (color: string) => (
        <ThemeIcon name="cursor" size={18} color={color} />
      ),
      data: [menuItems.area.visibleRadius],
    },
    {
      title: 'Scene',
      index: 2,
      showHeader: true,
      icon: (color: string) => (
        <ThemeIcon name="compass" size={18} color={color} />
      ),
      data: [
        menuItems.scene.viewshed,
        menuItems.scene.center,
        menuItems.scene.locationTypes,
        menuItems.scene.showPlacesApp,
        menuItems.scene.showMapMarkers,
      ],
    },
    {
      title: 'Maps',
      index: 3,
      showHeader: true,
      icon: (color: string) => <ThemeIcon name="map" size={18} color={color} />,
      data: [menuItems.map.mapType],
    },
    {
      title: 'AR Optimizations',
      index: 4,
      showHeader: true,
      icon: (color: string) => (
        <ThemeIcon name="wrench" size={18} color={color} />
      ),
      data: [
        menuItems.ar_optimization.offset_overlap,
        menuItems.ar_optimization.dynamic_markers,
        menuItems.ar_optimization.realistic_markers,
      ],
    },
    {
      title: 'About',
      index: 3,
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
