import {
  Animated,
  Dimensions,
  Easing,
  Image,
  StyleSheet,
  View,
} from 'react-native';
import React, { useRef } from 'react';

import { ThemeText } from '../text/ThemeText';
import { useEffect } from 'react';
import useSettings from '../../utils/hooks/useSettings';

interface CompassProps {
  azimuth: number | undefined;
  big?: boolean;
  expanded?: boolean;
}

const compassImageSmall = require('../../assets/img/compass/compass.png');
const compassArrowImageSmall = require('../../assets/img/compass/compass_arrow.png');

const compassImageDarkBig = require('../../assets/img/compass/compass_bg_dark.png');
const compassArrowImageDarkBig = require('../../assets/img/compass/compass_arrow_big_dark.png');

const compassImageLightBig = require('../../assets/img/compass/compass_bg_light.png');
const compassArrowImageLightBig = require('../../assets/img/compass/compass_arrow_big_light.png');

export const Compass: React.FC<CompassProps> = ({
  azimuth,
  expanded,
  big = false,
}) => {
  const settings = useSettings();
  const spinValue = useRef(new Animated.Value(0)).current;

  const spin = () => {
    if (azimuth) {
      let start = spinValue;
      let heading = Math.round(azimuth);

      let rot = start.__getValue();
      let rotM = rot % 360;

      if (rotM < 180 && heading > rotM + 180) rot -= 360;
      if (rotM >= 180 && heading <= rotM - 180) rot += 360;

      rot += heading - rotM;
      Animated.timing(spinValue, {
        toValue: rot,
        duration: 300,
        easing: Easing.inOut(Easing.quad),
        useNativeDriver: false,
      }).start();
    }
  };

  useEffect(spin);

  const spinInterpolate = spinValue.interpolate({
    inputRange: [0, 360],
    outputRange: ['-0deg', '-360deg'],
  });

  return (
    <View style={big ? { flex: 1 } : styles.container}>
      <View style={styles.arrowContainer}>
        <Animated.Image
          resizeMode="contain"
          source={
            big
              ? settings.state.theme === 'light'
                ? compassImageDarkBig
                : compassImageLightBig
              : compassImageSmall
          }
          style={{
            flex: 1,
            transform: [{ rotate: spinInterpolate }],
          }}
        />
      </View>
      <View style={styles.arrowContainer}>
        <Image
          style={{
            flex: 1,
            width: big ? (expanded ? 200 : 100) : 28,
            height: big ? (expanded ? 200 : 100) : 28,
          }}
          resizeMode="contain"
          source={
            big
              ? settings.state.theme === 'light'
                ? compassArrowImageDarkBig
                : compassArrowImageLightBig
              : compassArrowImageSmall
          }
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { width: 65, height: 65 },
  arrowContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
