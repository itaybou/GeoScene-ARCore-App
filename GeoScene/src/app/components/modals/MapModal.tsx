import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, UIManager, View, findNodeHandle } from 'react-native';

import { BottomModal } from './BottomModal';
import { NativeMapView } from '../../../native/NativeViewsBridge';
import { ThemeSlider } from '../../components/input/ThemeSlider';
import { ThemeText } from '../text/ThemeText';
import { VISIBLE_RADIUS } from '../../constants/Constants';
import useSettings from '../../utils/hooks/useSettings';
import useTheme from '../../utils/hooks/useTheme';

interface MapModalProps {
  showSlider: boolean;
  title?: string;
  buttonText?: string;
  screenPercent?: number;
  isVisible: boolean;
  showButtonIcon: boolean;
  shownPlace?: {
    latitude: number | null | undefined;
    longitude: number | null | undefined;
  } | null;
  customComponent?: JSX.Element | null;
  enableLocationTap?: boolean;
  enableZoom?: boolean;
  showBoundingCircle: boolean;
  onMapSingleTap?: (event: any) => void;
  hide: () => void;
  onButtonPress?: (value: any) => void;
  showTriangulationData?: any[];
  useObserverLocation?: boolean;
  useTriangulation?: boolean;
  boundingCircleRadius?: number;
  enableSwipeDown?: boolean;
}

const DEFAULT_BBOX_RADIUS = 5;

export const MapModal: React.FC<MapModalProps> = ({
  isVisible,
  screenPercent,
  hide,
  showSlider,
  showBoundingCircle,
  customComponent,
  shownPlace,
  buttonText,
  showButtonIcon,
  onButtonPress,
  title,
  onMapSingleTap,
  showTriangulationData,
  boundingCircleRadius,
  enableSwipeDown = true,
  useTriangulation = false,
  useObserverLocation = false,
  enableZoom = false,
  enableLocationTap = false,
}) => {
  const theme = useTheme();
  const mapRef = useRef<number | null>(null);
  const { state } = useSettings();
  const [radius, setRadius] = useState<number>(
    boundingCircleRadius ?? state.visibleRadius,
  );

  const MapsManager = useMemo(
    () => UIManager.getViewManagerConfig('MapView'),
    [],
  );

  useEffect(() => {
    if (
      mapRef.current &&
      shownPlace?.latitude &&
      shownPlace?.longitude &&
      !showTriangulationData
    ) {
      UIManager.dispatchViewManagerCommand(
        mapRef.current,
        MapsManager.Commands.ZOOM_SET_BBOX.toString(),
        [
          shownPlace?.latitude,
          shownPlace?.longitude,
          showSlider
            ? state.visibleRadius
            : boundingCircleRadius
            ? boundingCircleRadius
            : DEFAULT_BBOX_RADIUS,
          true,
        ], // map referece, use compass orientation, use observe location
      );
    }
  }, [mapRef.current, isVisible]);

  return (
    <BottomModal
      isVisible={isVisible}
      enableSwipeDown={enableSwipeDown}
      screenPercent={screenPercent}
      hide={hide}
      showButtonIcon={showButtonIcon}
      onModalHide={() => showSlider && setRadius(state.visibleRadius)}
      title={title}
      onButtonPress={() => {
        onButtonPress && onButtonPress(radius);
        hide();
      }}
      buttonText={buttonText}>
      {showSlider && (
        <View style={styles.sliderContainer}>
          <View style={styles.sliderComponentContainer}>
            <ThemeSlider
              value={radius}
              step={1}
              range={VISIBLE_RADIUS}
              onValueChange={(value: number) => {
                setRadius(value);
                UIManager.dispatchViewManagerCommand(
                  mapRef.current,
                  MapsManager.Commands.ZOOM_SET_BBOX.toString(),
                  [shownPlace?.latitude, shownPlace?.longitude, value, true], // map referece, use compass orientation, use observe location
                );
              }}
            />
          </View>
          <View style={styles.sliderValueContainer}>
            <ThemeText>{radius} Km</ThemeText>
          </View>
        </View>
      )}
      <View style={styles.customComponentContainer}>{customComponent}</View>
      <View
        style={[
          styles.mapContainer,
          {
            borderColor: theme.colors.inactiveTint,
          },
        ]}>
        <NativeMapView
          enableZoom={enableZoom}
          showBoundingCircle={showBoundingCircle}
          useTriangulation={useTriangulation}
          useObserverLocation={useObserverLocation}
          onMapSingleTap={onMapSingleTap}
          showTriangulationData={showTriangulationData}
          enableLocationTap={enableLocationTap}
          style={styles.map}
          ref={(nativeRef) => (mapRef.current = findNodeHandle(nativeRef))}
        />
      </View>
    </BottomModal>
  );
};

const styles = StyleSheet.create({
  sliderContainer: {
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  sliderComponentContainer: {
    flex: 0.8,
  },
  sliderValueContainer: {
    flex: 0.2,
    alignItems: 'center',
    justifyContent: 'flex-start',
  },
  mapContainer: {
    borderWidth: 2,
    flex: 1,
  },
  map: {
    width: '100%',
    height: '100%',
    flex: 1,
  },
  customComponentContainer: { marginVertical: 2 },
});
