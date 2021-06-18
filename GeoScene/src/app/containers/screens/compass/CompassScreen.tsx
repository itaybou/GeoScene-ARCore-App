import {
  ActivityIndicator,
  Animated,
  Easing,
  UIManager,
  View,
  findNodeHandle,
} from 'react-native';
import React, { useEffect, useRef, useState } from 'react';

import { Compass } from '../../../components/assets/Compass';
import IdleTimerManager from 'react-native-idle-timer';
import { NativeMapView } from '../../../../native/NativeViewsBridge';
import Orientation from 'react-native-orientation';
import { TabScreen } from '../../../components/layout/TabScreen';
import { ThemeButton } from '../../../components/input/ThemeButton';
import { ThemeText } from '../../../components/text/ThemeText';
import { useCallback } from 'react';
import useTheme from '../../../utils/hooks/useTheme';

interface CompassViewProps {}

const ANIMATION_TIMING_CONFIG = {
  duration: 350,
  easing: Easing.inOut(Easing.quad),
  useNativeDriver: false,
};

export const CompassScreen: React.FC<CompassViewProps> = ({}) => {
  const [mapShown, setMapShown] = useState<boolean>(false);
  const [azimuth, setAzimuth] = useState<number>(0);
  const theme = useTheme();
  const mapRef = useRef<number | null>(null);

  const mapAnimation = useRef(new Animated.Value(0)).current;

  const MapsManager = UIManager.getViewManagerConfig('MapView');

  useEffect(() => {
    Orientation.lockToPortrait();
    IdleTimerManager.setIdleTimerDisabled(true);

    return () => {
      Orientation.unlockAllOrientations();
      IdleTimerManager.setIdleTimerDisabled(false);
    };
  }, []);

  const direction = useCallback(() => {
    if (azimuth >= 22.5 && azimuth < 67.5) {
      return 'NE';
    } else if (azimuth >= 67.5 && azimuth < 112.5) {
      return 'E';
    } else if (azimuth >= 112.5 && azimuth < 157.5) {
      return 'SE';
    } else if (azimuth >= 157.5 && azimuth < 202.5) {
      return 'S';
    } else if (azimuth >= 202.5 && azimuth < 247.5) {
      return 'SW';
    } else if (azimuth >= 247.5 && azimuth < 292.5) {
      return 'W';
    } else if (azimuth >= 292.5 && azimuth < 337.5) {
      return 'NW';
    } else {
      return 'N';
    }
  }, [azimuth]);

  return (
    <TabScreen disablePadding={true}>
      <View
        style={{
          flex: 1,
          marginTop: 16,
          justifyContent: 'center',
          paddingVertical: !mapShown ? 50 : 0,
          alignItems: 'center',
        }}>
        <ThemeText style={{ fontSize: 15, fontWeight: 'bold' }}>
          Azimuth
        </ThemeText>
        <ThemeText style={{ fontSize: 35, fontWeight: 'bold' }}>
          {azimuth.toFixed(2)}°
        </ThemeText>
        <ThemeText style={{ fontSize: 30, fontWeight: 'bold' }}>
          {direction()}
        </ThemeText>
        <Compass expanded={!mapShown} big={true} azimuth={azimuth} />
      </View>
      <View
        style={{
          flexDirection: 'column',
          paddingVertical: mapShown ? 4 : 24,
          paddingHorizontal: 12,
        }}>
        <ThemeButton
          text={mapShown ? 'Close Map' : ' Open Map'}
          icon="map"
          onPress={() => {
            setMapShown(!mapShown);
            Animated.timing(mapAnimation, {
              toValue: mapShown ? 0 : 1,
              ...ANIMATION_TIMING_CONFIG,
            }).start(() => {
              UIManager.dispatchViewManagerCommand(
                mapRef.current,
                MapsManager.Commands.ZOOM_BBOX.toString(),
                [],
              );
            });
          }}
        />
      </View>

      <Animated.View
        style={{
          flex: mapAnimation,
          flexDirection: 'row',
        }}>
        <NativeMapView
          isShown={mapShown}
          useObserverLocation={true}
          enableZoom={true}
          useTriangulation={true}
          useCompassOrientation={true}
          onOrientationChanged={(event) => {
            setAzimuth(event.nativeEvent.azimuth);
          }}
          ref={(nativeRef) => (mapRef.current = findNodeHandle(nativeRef))}
          style={{
            width: '100%',
            height: '100%',
          }}
        />
      </Animated.View>
    </TabScreen>
  );
};
