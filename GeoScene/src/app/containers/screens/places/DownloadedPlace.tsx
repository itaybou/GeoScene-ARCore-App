import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Text,
  UIManager,
  View,
  findNodeHandle,
} from 'react-native';
import React, { useEffect, useMemo, useRef, useState } from 'react';

import { ARModule } from '../../../../native/NativeModulesBridge';
import { Center } from '../../../components/layout/Center';
import { LoadingModal } from '../../../components/modals/LoadingModal';
import { LocationSearchBar } from '../../../components/input/LocationSearchBar';
import { MapModal } from '../../../components/modals/MapModal';
import { NativeEventEmitter } from 'react-native';
import { NativeMapView } from '../../../../native/NativeViewsBridge';
import { OptionModal } from '../../../components/modals/OptionModal';
import { PlacesStackRouteNavProps } from '../../../navigation/params/RoutesParamList';
import { ScrollView } from 'react-native-gesture-handler';
import { TabScreen } from '../../../components/layout/TabScreen';
import { TextInput } from 'react-native-paper';
import { ThemeButton } from '../../../components/input/ThemeButton';
import { ThemeText } from '../../../components/text/ThemeText';
import { ThemeTextInput } from '../../../components/input/ThemeTextInput';
import { timeConverter } from '../../../utils/time/time';
import useGeolocation from '../../../utils/hooks/useGeolocation';
import { useNavigation } from '@react-navigation/native';
import useTheme from '../../../utils/hooks/useTheme';

interface LocationProps {}

export function DownloadedPlace({
  route,
}: PlacesStackRouteNavProps<'DownloadedPlace'>) {
  const theme = useTheme();

  const [data, setData] = useState<any>(undefined);
  const [placeMap, setPlaceMap] = useState<{
    name: string;
    latitude: number;
    longitude: number;
    radius: number;
  } | null>(null);
  const [removeModalVisible, setShowRemoveModalVisible] = useState<boolean>(
    false,
  );
  const [toDelete, setToDelete] = useState<any>(undefined);

  const navigation = useNavigation();

  // const
  const mapRef = useRef<number | null>(null);
  const MapsManager = useMemo(
    () => UIManager.getViewManagerConfig('MapView'),
    [],
  );

  const getDownloadedPlacesData = async () => {
    const data = await ARModule.fetchStoredLocationData();
    setData(data);
    setShowRemoveModalVisible(false);
  };

  useEffect(() => {
    getDownloadedPlacesData();
  }, []);

  const renderPlace = ({ item }) => {
    return (
      <View
        style={{
          paddingHorizontal: 12,
          paddingVertical: 16,
          flexDirection: 'row',
          justifyContent: 'space-between',
          backgroundColor: theme.colors.tabs,
          borderBottomColor: theme.colors.border,
          borderBottomWidth: 2,
        }}>
        <View
          style={{
            flexDirection: 'column',
            flex: 0.8,
          }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            <ThemeText style={{ fontSize: 20, fontWeight: 'bold' }}>
              {item.name}
            </ThemeText>
          </View>
          <ThemeText style={{ fontSize: 12 }}>
            Radius: {item.radiusKM} KM
          </ThemeText>
          <ThemeText style={{ fontSize: 12 }}>{item.description}</ThemeText>
          <ThemeText style={{ fontSize: 12 }}>
            {timeConverter(item.timestamp)}
          </ThemeText>
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <ThemeButton
            icon="trash"
            onPress={() => {
              setToDelete(item);
              setShowRemoveModalVisible(true);
            }}
          />
          <ThemeButton
            icon="map"
            onPress={() =>
              setPlaceMap({
                name: item.name,
                latitude: item.latitude,
                longitude: item.longitude,
                radius: item.radiusKM,
              })
            }
          />
        </View>
      </View>
    );
  };

  console.log(toDelete);

  return !data ? (
    <Center>
      <ActivityIndicator color={theme.colors.accent} size="large" />
    </Center>
  ) : (data as any[]).length === 0 ? (
    <Center>
      <ThemeText>No locally downloaded places.</ThemeText>
    </Center>
  ) : (
    <>
      <TabScreen style={{ flex: 1 }}>
        <View style={{ flex: 1, marginVertical: 8 }}>
          <FlatList
            data={data}
            renderItem={renderPlace}
            keyExtractor={(item) => item?.id}
          />
        </View>
        <MapModal
          showSlider={false}
          buttonText="CLOSE"
          showButtonIcon={false}
          showBoundingCircle={true}
          boundingCircleRadius={placeMap?.radius}
          shownPlace={{
            latitude: placeMap?.latitude,
            longitude: placeMap?.longitude,
          }}
          title={placeMap?.name}
          customComponent={
            <ThemeText>
              Latitude: {placeMap?.latitude}, Longitude: {placeMap?.longitude}
            </ThemeText>
          }
          isVisible={placeMap !== null}
          hide={() => setPlaceMap(null)}
        />
      </TabScreen>
      <OptionModal
        text={`Are you sure you want to delete stored location ${toDelete?.name} data?`}
        big={false}
        statusBarTranslucent={false}
        isVisible={removeModalVisible}
        hide={() => {
          setShowRemoveModalVisible(false);
          setToDelete(undefined);
        }}
        onOK={async () => {
          await ARModule.deleteStoredLocationData(toDelete.id);
          getDownloadedPlacesData();
          setToDelete(undefined);
        }}
      />
    </>
  );
}
