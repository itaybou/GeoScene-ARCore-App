import { ActivityIndicator, Button, FlatList, View } from 'react-native';
import React, { useCallback, useEffect } from 'react';
import { deleteLocation, updateLocation } from '../../../api/osm/OSMApi';

import { Center } from '../../../components/layout/Center';
import { MapModal } from '../../../components/modals/MapModal';
import { Overpass } from '../../../../native/NativeModulesBridge';
import { TabScreen } from '../../../components/layout/TabScreen';
import { ThemeButton } from '../../../components/input/ThemeButton';
import { ThemeText } from '../../../components/text/ThemeText';
import Toast from 'react-native-toast-message';
import promisify from '../../../api/promisify';
import { useState } from 'react';
import useTheme from '../../../utils/hooks/useTheme';
import useUser from '../../../utils/hooks/useUser';

interface UserPlacesProps {}

export const UserPlaces: React.FC<UserPlacesProps> = ({}) => {
  const [places, setPlaces] = useState<any>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [placeMap, setPlaceMap] = useState<{
    name: string;
    latitude: number;
    longitude: number;
  } | null>(null);

  const theme = useTheme();

  const { state, dispatch } = useUser();

  const fetchUserPlaces = async () => {
    await promisify(
      'getUserPOIs',
      Overpass,
    )('Lior Hassan')
      .then((response) => {
        setPlaces(JSON.parse(response?.data));
        setLoading(false);
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    fetchUserPlaces();
  }, []);

  const showErrorToast = useCallback(
    () =>
      Toast.show({
        type: 'error',
        text1: 'Unable to fetch data',
        text2: 'Please try again later',
        topOffset: 10,
      }),
    [],
  );

  const renderPlace = ({ item }) => {
    console.log(item);
    return (
      <>
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
            }}>
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <ThemeText style={{ fontSize: 10 }}>{item.id} </ThemeText>
              <ThemeText style={{ fontSize: 20, fontWeight: 'bold' }}>
                {item.tags.name}
              </ThemeText>
            </View>
            <ThemeText style={{ fontSize: 12 }}>
              {item.lat}, {item.lon}
            </ThemeText>
          </View>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}>
            <ThemeButton
              icon="map"
              onPress={() =>
                setPlaceMap({
                  name: item.tags.name,
                  latitude: item.lat,
                  longitude: item.lon,
                })
              }
            />
            <ThemeButton icon="pencil" onPress={() => f()} />
            <ThemeButton
              icon="trash"
              onPress={() => {
                setLoading(true);
                const res = deleteLocation(
                  item.id,
                  item.version,
                  item.lat,
                  item.lon,
                );
                if (!res) {
                  showErrorToast();
                  setLoading(false);
                } else fetchUserPlaces();
              }}
            />
          </View>
        </View>
        <Toast ref={(ref) => Toast.setRef(ref)} />
      </>
    );
  };

  return loading ? (
    <Center>
      <ActivityIndicator color={theme.colors.accent} size="large" />
    </Center>
  ) : (places as any[]).length === 0 ? (
    <Center>
      <ThemeText>No Places Added By {state.user?.name}</ThemeText>
    </Center>
  ) : (
    <TabScreen style={{ flex: 1 }}>
      <View style={{ flex: 1, marginVertical: 8 }}>
        <FlatList
          data={places}
          renderItem={renderPlace}
          keyExtractor={(item) => item?.id}
        />
      </View>
      <MapModal
        showSlider={false}
        buttonText="CLOSE"
        showButtonIcon={false}
        showBoundingCircle={false}
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
  );
};
