import React, { useEffect, useMemo, useRef, useState } from 'react';
import { StyleSheet, UIManager, View, findNodeHandle } from 'react-native';

import { BottomModal } from './BottomModal';
import { Button } from 'react-native';
import Modal from 'react-native-modal';
import { NativeMapView } from '../../../native/NativeViewsBridge';
import { SettingsActionTypes } from '../../providers/reducers/SettingsReducer';
import Slider from 'react-native-slider';
import { ThemeText } from '../text/ThemeText';
import { VISIBLE_RADIUS } from '../../constants/Constants';
import useGeolocation from '../../utils/hooks/useGeolocation';
import useSettings from '../../utils/hooks/useSettings';
import useTheme from '../../utils/hooks/useTheme';

interface MapModalProps {
  showSlider: boolean;
  title?: string;
  buttonText?: string;
  isVisible: boolean;
  showButtonIcon: boolean;
  shownPlace: {
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
}

const DEFAULT_BBOX_RADIUS = 5;

export const MapModal: React.FC<MapModalProps> = ({
  isVisible,
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
  enableZoom = false,
  enableLocationTap = false,
}) => {
  const theme = useTheme();
  const mapRef = useRef<number | null>(null);
  const { state } = useSettings();
  const [radius, setRadius] = useState<number>(state.visibleRadius);

  const MapsManager = useMemo(
    () => UIManager.getViewManagerConfig('MapView'),
    [],
  );

  useEffect(() => {
    if (mapRef.current && shownPlace?.latitude && shownPlace?.longitude) {
      UIManager.dispatchViewManagerCommand(
        mapRef.current,
        MapsManager.Commands.ZOOM_SET_BBOX.toString(),
        [
          shownPlace?.latitude,
          shownPlace?.longitude,
          showSlider ? state.visibleRadius : DEFAULT_BBOX_RADIUS,
          true,
        ], // map referece, use compass orientation, use observe location
      );
    }
  }, [mapRef.current, isVisible]);

  return (
    <BottomModal
      isVisible={isVisible}
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
            <Slider
              value={radius}
              step={1}
              minimumValue={VISIBLE_RADIUS.min}
              maximumValue={VISIBLE_RADIUS.max}
              thumbTintColor={theme.colors.accent_secondary}
              minimumTrackTintColor={theme.colors.accent_secondary_dark}
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
          useObserverLocation={false}
          onMapSingleTap={onMapSingleTap}
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
