import {
  ActivityIndicator,
  Animated,
  FlatList,
  Modal,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useMemo, useRef, useState } from 'react';

import FastImage from 'react-native-fast-image';
import ImageViewer from 'react-native-image-zoom-viewer';
import { MapModal } from '../modals/MapModal';
import { PageCard } from './PageCard';
import { ThemeButton } from '../input/ThemeButton';
import { ThemeIcon } from '../assets/ThemeIcon';
import { ThemeText } from '../text/ThemeText';
import { useTheme } from '../../utils/hooks/Hooks';

interface PlacesCardCarouselProps {
  items: any[] | undefined;
  error: boolean;
  removeItem?: (index: number) => void;
}

export interface LocationCardType {
  latitude: number;
  longitude: number;
  timestamp: number;
  radius: number;
  data: any[];
}

export const PlacesCardCarousel: React.FC<PlacesCardCarouselProps> = ({
  items,
  error,
  removeItem,
}) => {
  const theme = useTheme();
  const pan = useRef(new Animated.ValueXY()).current;

  const [scrollViewWidth, setScrollViewWidth] = useState<number>(0);

  const [placeMap, setPlaceMap] = useState<
    { name: string; latitude: number; longitude: number } | undefined
  >();

  const boxWidth = useMemo(() => scrollViewWidth * 0.8, [scrollViewWidth]);
  const boxDistance = useMemo(() => scrollViewWidth - boxWidth, [
    scrollViewWidth,
    boxWidth,
  ]);
  const halfBoxDistance = useMemo(() => boxDistance / 2, [boxDistance]);

  const [currentImageZoomIndex, setCurrentImageZoomIndex] = useState<
    number | undefined
  >(undefined);

  const [imageDetailsExpanded, setImageDetailsExpanded] = useState<boolean>(
    true,
  );

  const [zoomImage, setZoomImage] = useState<boolean>(false);

  const renderItem = ({ item, index }) => {
    return (
      <Animated.View
        style={{
          transform: [
            {
              scale: pan.x.interpolate({
                inputRange: [
                  (index - 1) * boxWidth - halfBoxDistance,
                  index * boxWidth - halfBoxDistance,
                  (index + 1) * boxWidth - halfBoxDistance, // adjust positioning
                ],
                outputRange: [0.8, 1, 0.8], // scale down when out of scope
                extrapolate: 'clamp',
              }),
            },
          ],
        }}>
        <View
          style={{
            backgroundColor: theme.colors.cards,
            padding: 12,
            height: '100%',
            width: boxWidth,
            borderRadius: 24,
            elevation: 2,
          }}>
          <View
            style={{
              flex: 0.73,
              width: '100%',
              height: '100%',
            }}>
            <View style={{ flex: 1 }}>
              <TouchableOpacity
                activeOpacity={0.55}
                onPress={() => {
                  setCurrentImageZoomIndex(index);
                  setZoomImage(true);
                }}
                style={{ flex: 1 }}>
                <FastImage
                  style={{ flex: 1 }}
                  source={{
                    uri: item.image,
                    headers: { Authorization: 'token' },
                    priority: FastImage.priority.high,
                  }}
                  resizeMode={FastImage.resizeMode.cover}
                  onError={() => removeItem && removeItem(index)}
                />
              </TouchableOpacity>
            </View>
          </View>
          <View
            style={{
              flexDirection: 'row',
              flex: 0.27,
              marginTop: 4,
              justifyContent: 'space-between',
              alignItems: 'center',
            }}>
            <View
              style={{
                flex: 0.95,
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'flex-start',
              }}>
              <ThemeText
                style={{ fontSize: 18, fontWeight: 'bold' }}
                numberOfLines={1}>
                {item.name}
              </ThemeText>
              <View style={{ flexDirection: 'row' }}>
                <ThemeText style={{ fontSize: 14 }}>
                  {item.type.substring(0, 1).toUpperCase() +
                    item.type.substring(1, item.type.length).replace('_', ' ')}
                </ThemeText>
              </View>
              <ThemeText style={{ fontSize: 14 }}>
                {`Distance: ${item.distance.toFixed(2)}Km`}
              </ThemeText>
            </View>
            <ThemeButton
              icon="map"
              onPress={() =>
                setPlaceMap({
                  name: item.name,
                  latitude: item.lat,
                  longitude: item.lon,
                })
              }
            />
          </View>
        </View>
      </Animated.View>
    );
  };
  return items && items.length !== 0 ? (
    <View style={[{ flex: 0.95, width: '100%', height: '100%' }]}>
      <FlatList
        horizontal
        data={items}
        contentContainerStyle={{ paddingVertical: 0 }}
        contentInsetAdjustmentBehavior="never"
        snapToAlignment="center"
        decelerationRate="fast"
        automaticallyAdjustContentInsets={false}
        showsHorizontalScrollIndicator={false}
        showsVerticalScrollIndicator={false}
        scrollEventThrottle={1}
        snapToInterval={boxWidth}
        contentInset={{
          left: halfBoxDistance,
          right: halfBoxDistance,
        }}
        contentOffset={{ x: halfBoxDistance * -1, y: 0 }}
        onLayout={(e) => {
          setScrollViewWidth(e.nativeEvent.layout.width);
        }}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: pan.x } } }],
          {
            useNativeDriver: false,
          },
        )}
        keyExtractor={(item, index) => `${index}-${item}`}
        renderItem={renderItem}
      />
      <MapModal
        enableZoom={true}
        showSlider={false}
        enableSwipeDown={true}
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
        isVisible={placeMap !== undefined}
        hide={() => setPlaceMap(undefined)}
      />
      {currentImageZoomIndex !== undefined && (
        <Modal visible={zoomImage} transparent={true}>
          <ImageViewer
            backgroundColor={theme.colors.cards}
            imageUrls={items.map((i) => {
              return { url: i.image };
            })}
            index={currentImageZoomIndex}
            renderArrowRight={() => (
              <View style={{ margin: 8 }}>
                <ThemeIcon name={'arrow-right'} size={22} color={'white'} />
              </View>
            )}
            renderArrowLeft={() => (
              <View style={{ margin: 8 }}>
                <ThemeIcon name={'arrow-left'} size={22} color={'white'} />
              </View>
            )}
            renderHeader={(currentIndex) => (
              <View
                style={{
                  backgroundColor: theme.colors.tabs,
                  borderBottomLeftRadius: 45,
                  borderBottomRightRadius: 45,
                  elevation: 2,
                }}>
                <View style={{ alignItems: 'flex-end', zIndex: 9999 }}>
                  <TouchableOpacity
                    onPress={() => {
                      setZoomImage(false);
                      setImageDetailsExpanded(true);
                      setCurrentImageZoomIndex(undefined);
                    }}>
                    <View
                      style={{ paddingVertical: 16, paddingHorizontal: 24 }}>
                      <ThemeIcon name={'close'} size={25} />
                    </View>
                  </TouchableOpacity>
                </View>
                <View
                  style={{
                    justifyContent: 'center',
                    alignItems: 'center',
                    marginBottom: 8,
                  }}>
                  <ThemeText style={{ fontSize: 18 }}>
                    {`${currentIndex + 1}/${items.length}`}
                  </ThemeText>
                </View>
              </View>
            )}
            renderIndicator={() => {}}
            loadingRender={() => (
              <View>
                <ActivityIndicator size={'large'} color={theme.colors.accent} />
              </View>
            )}
            footerContainerStyle={{
              width: '100%',
              height: '22%',
              justifyContent: 'flex-start',
              alignItems: 'center',
              position: 'absolute',
              bottom: 0,
            }}
            renderFooter={(currentIndex) => {
              const item = items[currentIndex];
              return imageDetailsExpanded ? (
                <View
                  style={{
                    flexDirection: 'row',
                    padding: 8,
                    elevation: 2,
                    backgroundColor: theme.colors.tabs,
                    borderRadius: 15,
                    flex: 0.4,
                    marginTop: 4,
                    justifyContent: 'space-between',
                    alignItems: 'center',
                  }}>
                  <TouchableOpacity
                    onPress={() => setImageDetailsExpanded(false)}
                    style={{ marginEnd: 16 }}>
                    <View
                      style={{
                        elevation: 2,
                        width: 35,
                        height: 35,
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderRadius: 10,
                        backgroundColor: theme.colors.accent_secondary,
                      }}>
                      <ThemeIcon name={'menu'} size={15} />
                    </View>
                  </TouchableOpacity>
                  <View
                    style={{
                      flex: 0.85,
                      flexDirection: 'column',
                      justifyContent: 'center',
                      alignItems: 'flex-start',
                    }}>
                    <ThemeText
                      style={{ fontSize: 18, fontWeight: 'bold' }}
                      numberOfLines={1}>
                      {item.name}
                    </ThemeText>
                    <View style={{ flexDirection: 'row' }}>
                      <ThemeText style={{ fontSize: 14 }}>
                        {item.type.substring(0, 1).toUpperCase() +
                          item.type
                            .substring(1, item.type.length)
                            .replace('_', ' ')}
                      </ThemeText>
                    </View>
                    <ThemeText style={{ fontSize: 14 }}>
                      {`Distance: ${item.distance.toFixed(2)}Km`}
                    </ThemeText>
                  </View>
                  <ThemeButton
                    icon="map"
                    onPress={() =>
                      setPlaceMap({
                        name: item.name,
                        latitude: item.lat,
                        longitude: item.lon,
                      })
                    }
                  />
                </View>
              ) : (
                <View
                  style={{ justifyContent: 'center', alignItems: 'center' }}>
                  <TouchableOpacity
                    onPress={() => setImageDetailsExpanded(true)}>
                    <View
                      style={{
                        elevation: 2,
                        width: 45,
                        height: 45,
                        justifyContent: 'center',
                        alignItems: 'center',
                        borderRadius: 10,
                        backgroundColor: theme.colors.tabs,
                      }}>
                      <ThemeIcon name={'menu'} size={15} />
                    </View>
                  </TouchableOpacity>
                </View>
              );
            }}
            enableImageZoom={true}
            flipThreshold={80}
            maxOverflow={600}
            saveToLocalByLongPress={false}
            renderImage={(props) => <FastImage {...props} />}
            enableSwipeDown={true}
            doubleClickInterval={250}
            onCancel={() => {
              setZoomImage(false);
              setImageDetailsExpanded(true);
              setCurrentImageZoomIndex(undefined);
            }}
          />
        </Modal>
      )}
    </View>
  ) : (
    <PageCard>
      <View
        style={{
          justifyContent: 'center',
          alignItems: 'center',
          paddingVertical: 48,
        }}>
        {!items ? (
          error ? (
            <View style={{ flexDirection: 'row' }}>
              <ThemeIcon name={'refresh'} color={theme.colors.error} />
              <ThemeText style={{ color: theme.colors.error, marginStart: 5 }}>
                Requires refresh
              </ThemeText>
            </View>
          ) : (
            <ActivityIndicator size="large" color={theme.colors.primary} />
          )
        ) : (
          <ThemeText>None available.</ThemeText>
        )}
      </View>
    </PageCard>
  );
};
