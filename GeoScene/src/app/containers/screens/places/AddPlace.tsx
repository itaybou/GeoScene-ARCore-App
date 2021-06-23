import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { addNewLocation, updateLocation } from '../../../api/osm/OSMApi';

import { ErrorModal } from '../../../components/modals/ErrorModal';
import { LoadingModal } from '../../../components/modals/LoadingModal';
import { MapModal } from '../../../components/modals/MapModal';
import { TabScreen } from '../../../components/layout/TabScreen';
import { ThemeButton } from '../../../components/input/ThemeButton';
import { ThemeText } from '../../../components/text/ThemeText';
import { ThemeTextInput } from '../../../components/input/ThemeTextInput';
import useGeolocation from '../../../utils/hooks/useGeolocation';
import useTheme from '../../../utils/hooks/useTheme';

type Coordinate = {
  latitude?: number | null;
  longitude?: number | null;
};

export interface AddPlaceProps {
  initialName?: string;
  initialDescription?: string;
  initialCoordinate?: Coordinate;
  update?: boolean;
  nodeID?: string;
  csID?: string;
}

export const AddPlace = ({ navigation, route }) => {
  const MAX_DESCRIPTION_LENGTH = 250;
  const [name, setName] = useState<string>(route?.params?.name ?? '');
  const [description, setDescription] = useState<string>(
    route?.params?.description ?? '',
  );
  const [coordinate, setCoordinate] = useState<Coordinate | null>(
    { latitude: route?.params?.lat, longitude: route?.params?.lon } ?? null,
  );

  const [mapModalVisible, setMapModalVisible] = useState<boolean>(false);
  const [errorModalVisible, setErrorModalVisible] = useState<boolean>(false);
  const [loadingModalVisible, setLoadingModalVisible] = useState<boolean>(
    false,
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const location = useGeolocation();

  const getCoordinateString = useMemo(
    () =>
      `Latitude: ${coordinate?.latitude?.toFixed(
        5,
      )}, Longtitude: ${coordinate?.longitude?.toFixed(5)}`,
    [coordinate],
  );

  const approveLocation = useCallback(async () => {
    if (coordinate && coordinate.latitude && coordinate.longitude) {
      setLoadingModalVisible(true);
      let response;
      route?.params?.update
        ? (response = updateLocation(
            route?.params?.id,
            route?.params?.version,
            coordinate.latitude,
            coordinate.longitude,
            name,
            description,
          ))
        : (response = addNewLocation(
            coordinate.latitude,
            coordinate.longitude,
            name,
            description,
          ));
      if (await response) {
        setLoadingModalVisible(false);
        navigation.replace('Places', {
          showAddMessage: true,
        });
      } else {
        setLoadingModalVisible(false);
        setErrorMessage('Error while trying to approve location.');
        setErrorModalVisible(true);
      }
    } else {
      setLoadingModalVisible(false);
      setErrorMessage('You must choose coordinates to add/update location.');
      setErrorModalVisible(true);
    }
  }, [route, name, description, navigation, coordinate]);

  return (
    <>
      <TabScreen>
        <View style={styles.container}>
          <View>
            <ThemeTextInput
              label="Name"
              value={name}
              onChangeText={(text) => setName(text)}
            />
            <ThemeTextInput
              label="Description"
              value={description}
              error={description.length === MAX_DESCRIPTION_LENGTH + 1}
              errorMessage={`Text provided is too long, maximum ${MAX_DESCRIPTION_LENGTH} characters.`}
              onChangeText={(text) => {
                text.length <= MAX_DESCRIPTION_LENGTH + 1 &&
                  setDescription(text);
              }}
              multiline={true}
            />
            <View
              style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
              <ThemeText>
                {coordinate === null ||
                coordinate.latitude === undefined ||
                coordinate.longitude === undefined
                  ? 'No coordinate chosen.'
                  : `Current coordinates:\n${getCoordinateString}`}
              </ThemeText>
              {coordinate !== null && (
                <ThemeButton
                  style={styles.resetButtonContainer}
                  disabled={description.length === MAX_DESCRIPTION_LENGTH + 1}
                  onPress={() => setCoordinate(null)}
                  icon="close"
                />
              )}
            </View>
            <View style={styles.buttonsContainer}>
              <ThemeButton
                style={styles.buttonContainer}
                disabled={description.length === MAX_DESCRIPTION_LENGTH + 1}
                onPress={() =>
                  setCoordinate({
                    latitude: location?.latitude,
                    longitude: location?.longitude,
                  })
                }
                icon="location-pin"
                text="Current coordinates"
              />
              <ThemeButton
                style={styles.buttonContainer}
                disabled={description.length === MAX_DESCRIPTION_LENGTH + 1}
                onPress={() => setMapModalVisible(true)}
                icon="map"
                text="Map coordinates"
              />
            </View>
          </View>
          <ThemeButton
            disabled={description.length === MAX_DESCRIPTION_LENGTH + 1}
            onPress={approveLocation}
            icon="like"
          />
        </View>
        <MapModal
          screenPercent={0.8}
          showSlider={false}
          enableLocationTap={true}
          enableZoom={true}
          title={'Map Coordinates'}
          showButtonIcon={true}
          showBoundingCircle={false}
          isVisible={mapModalVisible}
          hide={() => setMapModalVisible(false)}
          customComponent={
            coordinate &&
            coordinate?.latitude &&
            coordinate.longitude && <ThemeText>{getCoordinateString}</ThemeText>
          }
          onMapSingleTap={(event) => {
            const coordinate = event.nativeEvent;
            setCoordinate({
              latitude: coordinate.latitude,
              longitude: coordinate.longitude,
            });
          }}
          shownPlace={{
            latitude: coordinate?.latitude,
            longitude: coordinate?.longitude,
          }}
        />
      </TabScreen>
      <LoadingModal
        text={'Waiting for location approval...'}
        isVisible={loadingModalVisible}
      />
      <ErrorModal
        text={errorMessage}
        isVisible={errorModalVisible}
        hide={() => setErrorModalVisible(false)}
      />
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  buttonsContainer: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'center',
  },
  buttonContainer: { flex: 1 },
  resetButtonContainer: { flex: 0.8 },
});
