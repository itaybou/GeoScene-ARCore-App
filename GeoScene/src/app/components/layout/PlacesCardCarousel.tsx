import { ActivityIndicator, Animated, FlatList, View } from 'react-native';
import React, { useMemo, useRef, useState } from 'react';

import FastImage from 'react-native-fast-image';
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
            }}>
            <FastImage
              style={{
                flex: 1,
              }}
              source={{
                uri: item.image,
                headers: { Authorization: 'token' },
                priority: FastImage.priority.high,
              }}
              resizeMode={FastImage.resizeMode.cover}
              onError={() => removeItem && removeItem(index)}
            />
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
