import React, { useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

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
}

export const AddPlace: React.FC<AddPlaceProps> = ({
  initialName,
  initialDescription,
  initialCoordinate,
}) => {
  const MAX_DESCRIPTION_LENGTH = 5;
  const [name, setName] = useState<string>(initialName ?? '');
  const [description, setDescription] = useState<string>(
    initialDescription ?? '',
  );
  const [coordinate, setCoordinate] = useState<Coordinate | null>(
    initialCoordinate ?? null,
  );

  const [mapModalVisible, setMapModalVisible] = useState<boolean>(false);

  const location = useGeolocation();

  const getCoordinateString = useMemo(
    () =>
      `Latitude: ${coordinate?.latitude?.toFixed(
        5,
      )}, Longtitude: ${coordinate?.longitude?.toFixed(5)}`,
    [coordinate],
  );

  return (
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
              text.length <= MAX_DESCRIPTION_LENGTH + 1 && setDescription(text);
            }}
            multiline={true}
          />
          <View
            style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <ThemeText>
              {coordinate === null
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
          onPress={() => {}}
          icon="like"
        />
      </View>
      <MapModal
        showSlider={false}
        enableLocationTap={true}
        enableZoom={true}
        title={'Map Coordinates'}
        showButtonIcon={true}
        showBoundingCircle={false}
        isVisible={mapModalVisible}
        hide={() => setMapModalVisible(false)}
        customComponent={
          coordinate && <ThemeText>{getCoordinateString}</ThemeText>
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