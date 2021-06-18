import { ActivityIndicator, FlatList, View } from 'react-native';
import React, { useEffect, useState } from 'react';

import { ARModule } from '../../../../native/NativeModulesBridge';
import { Center } from '../../../components/layout/Center';
import { MapModal } from '../../../components/modals/MapModal';
import { OptionModal } from '../../../components/modals/OptionModal';
import { PlacesStackRouteNavProps } from '../../../navigation/params/RoutesParamList';
import { TabScreen } from '../../../components/layout/TabScreen';
import { ThemeButton } from '../../../components/input/ThemeButton';
import { ThemeIcon } from '../../../components/assets/ThemeIcon';
import { ThemeText } from '../../../components/text/ThemeText';
import { timeConverter } from '../../../utils/time/time';
import useTheme from '../../../utils/hooks/useTheme';

interface LocationProps {}

export function DownloadedPlace({
  route,
}: PlacesStackRouteNavProps<'DownloadedPlaces'>) {
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
          <ThemeText style={{ fontSize: 12 }}>{item.description}</ThemeText>
          <View
            style={{
              marginTop: 5,
              alignItems: 'flex-start',
            }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <ThemeIcon name="location-pin" size={10} />
              <ThemeText style={{ fontSize: 12, marginStart: 5 }}>
                {item.latitude.toFixed(6)}, {item.longitude.toFixed(6)}
              </ThemeText>
            </View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-start',
                alignItems: 'center',
              }}>
              <ThemeIcon name="globe" size={10} />
              <ThemeText style={{ fontSize: 12, marginStart: 5 }}>
                Radius: {item.radiusKM} KM
              </ThemeText>
            </View>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'flex-start',
                alignItems: 'center',
              }}>
              <ThemeIcon name="location-pin" size={10} />
              <ThemeText style={{ fontSize: 12, marginStart: 5 }}>
                {timeConverter(item.timestamp)}
              </ThemeText>
            </View>
          </View>
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
              Latitude: {placeMap?.latitude.toFixed(6)}, Longitude:{' '}
              {placeMap?.longitude.toFixed(6)}
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
          await ARModule.deleteStoredLocationData(toDelete?.id);
          getDownloadedPlacesData();
          setToDelete(undefined);
        }}
      />
    </>
  );
}
