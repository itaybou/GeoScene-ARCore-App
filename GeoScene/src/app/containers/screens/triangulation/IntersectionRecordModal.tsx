import React, { useEffect, useState } from 'react';

import { BottomModal } from '../../../components/modals/BottomModal';
import { NativeMapView } from '../../../../native/NativeViewsBridge';
import { ThemeButton } from '../../../components/input/ThemeButton';
import { ThemeSlider } from '../../../components/input/ThemeSlider';
import { ThemeText } from '../../../components/text/ThemeText';
import { View } from 'react-native';

interface IntersectionRecordModalProps {
  intersectionModalVisible: boolean;
  onApprove: (latitude: number, longitude: number, azi: number) => void;
  hide: () => void;
  azimuth: number | null;
  locationText: string;
  location: {
    latitude: number;
    longitude: number;
  };
}

export const IntersectionRecordModal: React.FC<IntersectionRecordModalProps> = ({
  locationText,
  intersectionModalVisible,
  hide,
  location,
  azimuth,
  onApprove,
}) => {
  const [azimuthDiff, setAzimuthDiff] = useState<number>(
    azimuth === null ? 0 : azimuth,
  );

  useEffect(() => setAzimuthDiff(azimuth === null ? 0 : azimuth), [azimuth]);

  return (
    <BottomModal
      title={'Add Triangulation Record'}
      enableSwipeDown={true}
      screenPercent={0.65}
      buttonIcon={'close'}
      backdropOpacity={0}
      isVisible={intersectionModalVisible}
      hide={hide}
      onButtonPress={hide}
      showButtonIcon={true}>
      {intersectionModalVisible && (
        <View style={{ flex: 1, flexDirection: 'row' }}>
          <View
            style={{ flex: 1, justifyContent: 'space-between', padding: 2 }}>
            <View>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                <ThemeText>{`Azimuth: ${azimuthDiff?.toFixed(3)}°`}</ThemeText>
                <View style={{ flexDirection: 'row' }}>
                  <ThemeButton
                    icon="minus"
                    onPress={() =>
                      setAzimuthDiff(
                        azimuthDiff > 0 ? azimuthDiff - 0.1 : azimuthDiff,
                      )
                    }
                  />
                  <ThemeButton
                    icon="plus"
                    onPress={() =>
                      setAzimuthDiff(
                        azimuthDiff < 360 ? azimuthDiff + 0.1 : azimuthDiff,
                      )
                    }
                  />
                </View>
              </View>
              <ThemeSlider
                value={azimuthDiff}
                step={0.001}
                range={{ min: 0, max: 360 }}
                onValueChange={(value: number) => setAzimuthDiff(value)}
              />
              <ThemeText>{locationText}</ThemeText>
            </View>

            <ThemeButton
              icon="like"
              onPress={() =>
                onApprove(location.latitude, location.longitude, azimuthDiff)
              }
            />
          </View>
          <NativeMapView
            enableLocationTap={false}
            useObserverLocation={true}
            showBoundingCircle={false}
            useTriangulation={false}
            enableZoom={true}
            useCompassOrientation={false}
            showTriangulationData={[
              { latitude: location.latitude, longitude: location.longitude },
              azimuthDiff,
            ]}
            style={{ flex: 1 }}
          />
        </View>
      )}
    </BottomModal>
  );
};
