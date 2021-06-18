import React, { useState } from 'react';
import { StyleSheet, View } from 'react-native';

import { BottomModal } from '../../../components/modals/BottomModal';
import { FlatList } from 'react-native-gesture-handler';
import { NativeMapView } from '../../../../native/NativeViewsBridge';
import { ThemeButton } from '../../../components/input/ThemeButton';
import { ThemeText } from '../../../components/text/ThemeText';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../../utils/hooks/Hooks';

interface IntersectionModalProps {
  intersectionText: string;
  intersectionModalVisible: boolean;
  hide: () => void;
  triangulationData: any[] | null;
  triangulationIntersections: any[] | null;
  azimuth: number | null;
}

export const IntersectionModal: React.FC<IntersectionModalProps> = ({
  intersectionText,
  intersectionModalVisible,
  hide,
  triangulationData,
  triangulationIntersections,
  azimuth,
}) => {
  const theme = useTheme();
  const [viewedIntersection, setViewedIntersection] = useState<any>(null);

  const navigation = useNavigation();

  const renderIntersection = ({ item }) => {
    return (
      <View
        style={[
          styles.listRowContainer,
          {
            backgroundColor: theme.colors.tabs,
            borderBottomColor: theme.colors.border,
          },
        ]}>
        <View
          style={{
            flexDirection: 'column',
          }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            <ThemeText style={{ fontSize: 15, fontWeight: 'bold' }}>
              {item.name}
            </ThemeText>
            <ThemeText
              style={{ fontSize: 12, fontWeight: 'bold', marginLeft: 20 }}>
              Distance: {(item.distance / 1000).toFixed(3)} KM
            </ThemeText>
          </View>
          <ThemeText style={{ fontSize: 12 }}>
            Latitude: {item.latitude.toFixed(4)}, Longitude:{' '}
            {item.longitude.toFixed(4)}
          </ThemeText>
        </View>
        <ThemeButton icon="map" onPress={() => setViewedIntersection(item)} />
      </View>
    );
  };

  return (
    <BottomModal
      title={intersectionText}
      enableSwipeDown={false}
      screenPercent={0.65}
      buttonIcon={'close'}
      backdropOpacity={0}
      isVisible={intersectionModalVisible}
      hide={() => {
        setViewedIntersection(null);
        hide();
      }}
      onButtonPress={() => {
        setViewedIntersection(null);
        hide();
      }}
      showButtonIcon={true}>
      {intersectionModalVisible && (
        <View style={{ flex: 1, flexDirection: 'row' }}>
          <View
            style={{ flex: viewedIntersection === null ? 1 : 0.3 }}
            onStartShouldSetResponder={(): boolean => true}>
            {viewedIntersection === null ? (
              <FlatList
                data={triangulationIntersections}
                renderItem={renderIntersection}
                keyExtractor={(item) => item?.id}
              />
            ) : (
              <View
                style={{
                  flexDirection: 'column',
                  flex: 1,
                  justifyContent: 'space-between',
                }}>
                <View>
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}>
                    <ThemeText style={{ fontSize: 15, fontWeight: 'bold' }}>
                      {viewedIntersection.name}
                    </ThemeText>
                  </View>
                  <ThemeText
                    style={{
                      fontSize: 12,
                      fontWeight: 'bold',
                    }}>
                    Distance: {(viewedIntersection.distance / 1000).toFixed(3)}{' '}
                    KM
                  </ThemeText>
                  <ThemeText style={{ fontSize: 12 }}>
                    Latitude: {viewedIntersection.latitude.toFixed(4)},
                    Longitude: {viewedIntersection.longitude.toFixed(4)}
                  </ThemeText>
                  <View style={{ marginTop: 8, marginRight: 8 }}>
                    <ThemeText style={{ fontSize: 12, fontWeight: 'bold' }}>
                      Description:
                    </ThemeText>
                    <ThemeText style={{ fontSize: 12 }}>
                      {viewedIntersection.description}
                    </ThemeText>
                  </View>
                </View>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'space-between',
                    marginRight: 4,
                  }}>
                  <ThemeButton
                    icon="arrow-left"
                    onPress={() => setViewedIntersection(null)}
                  />
                  <ThemeButton
                    icon="like"
                    onPress={() => {
                      if (viewedIntersection) {
                        navigation.navigate('Places', {
                          screen: 'AddPlace',
                          params: {
                            lat: viewedIntersection.latitude,
                            lon: viewedIntersection.longitude,
                            name: viewedIntersection.name,
                            description: viewedIntersection.description,
                            update: false,
                          },
                        });
                      }
                    }}
                  />
                </View>
              </View>
            )}
          </View>
          <NativeMapView
            enableLocationTap={false}
            useObserverLocation={true}
            showBoundingCircle={false}
            useTriangulation={false}
            enableZoom={true}
            useCompassOrientation={false}
            showTriangulationData={
              viewedIntersection && [
                viewedIntersection,
                triangulationData?.find((d) => d.id === viewedIntersection.id),
                azimuth,
              ]
            }
            style={{ flex: viewedIntersection === null ? 0 : 0.7 }}
          />
        </View>
      )}
    </BottomModal>
  );
};

const styles = StyleSheet.create({
  listRowContainer: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    borderBottomWidth: 2,
  },
});
