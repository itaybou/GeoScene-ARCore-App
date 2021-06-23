import React, { useCallback, useMemo, useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { LoadingModal } from '../../../components/modals/LoadingModal';
import { MapModal } from '../../../components/modals/MapModal';
import { TabScreen } from '../../../components/layout/TabScreen';
import { ThemeButton } from '../../../components/input/ThemeButton';
import { ThemeText } from '../../../components/text/ThemeText';
import { ThemeTextInput } from '../../../components/input/ThemeTextInput';
import Toast from 'react-native-toast-message';
import { addTriangulationRecord } from '../../../api/firestore/triangulation/TriangulationFirestore';
import useUser from '../../../utils/hooks/useUser';

type Coordinate = {
  latitude?: number | null;
  longitude?: number | null;
};

export interface AddTriangulationProps {
  coordinate: Coordinate;
  azimuth: number;
}

export const AddTriangulation = ({ navigation, route }) => {
  const MAX_DESCRIPTION_LENGTH = 250;

  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const [mapModalVisible, setMapModalVisible] = useState<boolean>(false);
  const [loadingModalVisible, setLoadingModalVisible] = useState<boolean>(
    false,
  );

  const { state } = useUser();

  const getCoordinateString = useMemo(
    () =>
      `Latitude: ${route.params.coordinate?.latitude?.toFixed(
        5,
      )}, Longtitude: ${route.params.coordinate?.longitude?.toFixed(5)}`,
    [route.params],
  );

  const approveTriangulationRecord = useCallback(() => {
    if (name.length === 0 || description.length === 0) {
      Toast.show({
        type: 'error',
        text1: 'Missing details',
        text2:
          'Please provide name and description to your triangulation record.',
        topOffset: 10,
      });
    } else if (state.user) {
      setLoadingModalVisible(!loadingModalVisible);
      addTriangulationRecord(
        state.user?.name,
        name,
        description,
        {
          latitude: route.params.coordinate.latitude,
          longitude: route.params.coordinate.longitude,
        },
        route.params.azimuth,
      ).then(() => {
        setLoadingModalVisible(false);
        navigation.goBack();
      });
    }
  }, [route.params, state.user, navigation, name, description]);

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
            <ThemeText>
              {route.params.coordinate === null
                ? 'No coordinate chosen.'
                : `Current coordinates:\n${getCoordinateString}`}
            </ThemeText>
            <ThemeText>
              {route.params.coordinate === null
                ? 'No coordinate chosen.'
                : `Azimuth: ${route.params.azimuth.toFixed(3)}°`}
            </ThemeText>
            <View style={styles.buttonsContainer}>
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
            onPress={approveTriangulationRecord}
            icon="like"
          />
        </View>
        <MapModal
          screenPercent={0.8}
          showSlider={false}
          enableLocationTap={false}
          enableZoom={true}
          useObserverLocation={true}
          useTriangulation={true}
          title={'Triangulation Coordinates'}
          showButtonIcon={true}
          showBoundingCircle={false}
          isVisible={mapModalVisible}
          hide={() => setMapModalVisible(false)}
          customComponent={
            route.params.coordinate && (
              <View>
                <ThemeText>{getCoordinateString}</ThemeText>
                <ThemeText>{`Azimuth: ${route.params.azimuth.toFixed(
                  3,
                )}°`}</ThemeText>
              </View>
            )
          }
          showTriangulationData={[
            {
              latitude: route.params.coordinate.latitude,
              longitude: route.params.coordinate.longitude,
            },
            route.params.azimuth,
          ]}
        />
        <LoadingModal
          isVisible={loadingModalVisible}
          text={'Adding triangulation point...'}
        />
      </TabScreen>
      <Toast ref={(ref) => Toast.setRef(ref)} />
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
