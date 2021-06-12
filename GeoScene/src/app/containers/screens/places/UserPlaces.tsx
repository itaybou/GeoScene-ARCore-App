import { ActivityIndicator, Button, FlatList, View } from 'react-native';
import React, { useCallback, useEffect } from 'react';
import {
  addNewLocation,
  deleteLocation,
  updateLocation,
} from '../../../api/osm/OSMApi';

import { Center } from '../../../components/layout/Center';
import { ErrorModal } from '../../../components/modals/ErrorModal';
import { MapModal } from '../../../components/modals/MapModal';
import { Overpass } from '../../../../native/NativeModulesBridge';
import { TabScreen } from '../../../components/layout/TabScreen';
import { ThemeButton } from '../../../components/input/ThemeButton';
import { ThemeText } from '../../../components/text/ThemeText';
import Toast from 'react-native-toast-message';
import promisify from '../../../api/promisify';
import useGeolocation from '../../../utils/hooks/useGeolocation';
import { useNavigation } from '@react-navigation/core';
import { useState } from 'react';
import useTheme from '../../../utils/hooks/useTheme';
import useUser from '../../../utils/hooks/useUser';

interface UserPlacesProps {}

export const UserPlaces: React.FC<UserPlacesProps> = ({}) => {
  const [errorModalVisible, setErrorModalVisible] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [places, setPlaces] = useState<any>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [placeMap, setPlaceMap] = useState<{
    name: string;
    latitude: number;
    longitude: number;
  } | null>(null);

  const theme = useTheme();

  const navigation = useNavigation();

  const { state, dispatch } = useUser();

  const location = useGeolocation();

  const fetchUserPlaces = async () => {
    await promisify(
      'getUserPOIs',
      Overpass,
    )(state.user?.name)
      .then((response) => {
        setErrorMessage(null);
        setPlaces(JSON.parse(response?.data));
        setLoading(false);
      })
      .catch((err) => {
        setErrorMessage('OSM servers are currently busy, try again later.');
        setPlaces([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchUserPlaces();
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
          <ThemeButton
            icon="pencil"
            onPress={() =>
              navigation.navigate('AddPlace', {
                id: item.id,
                version: item.version,
                lat: item.lat,
                lon: item.lon,
                name: item.tags.name,
                description: item.tags.description,
                update: true,
              })
            }
          />
          <ThemeButton
            icon="trash"
            onPress={() => {
              setLoading(true);
              deleteLocation(item.id, item.version, item.lat, item.lon).then(
                (res) => {
                  if (!res) {
                    setErrorMessage(res);
                    setErrorModalVisible(true);
                  } else {
                    setPlaces(places.filter((p: any) => p.id !== item.id));
                  }
                  setLoading(false);
                },
              );
            }}
          />
        </View>
      </View>
    );
  };

  return (
    <>
      {loading ? (
        <Center>
          <ActivityIndicator color={theme.colors.accent} size="large" />
        </Center>
      ) : (places as any[]).length === 0 && !errorMessage ? (
        <Center>
          <ThemeText>No Places Added By {state.user?.name}</ThemeText>
        </Center>
      ) : errorMessage ? (
        <Center>
          <ThemeText style={{ color: theme.colors.error }}>
            {errorMessage}
          </ThemeText>
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
      )}
      <ErrorModal
        isVisible={errorModalVisible}
        hide={() => setErrorModalVisible(false)}
        text={errorMessage}
      />
    </>
  );
};
