import { Image, StyleSheet } from 'react-native';

import React from 'react';
import useSettings from '../../utils/hooks/useSettings';

interface ThemeLogoProps {
  width: number;
  height: number;
}

const appLogoLight = require('../../assets/img/logo_light.png');
const appLogoDark = require('../../assets/img/logo_dark.png');

export const ThemeLogo: React.FC<ThemeLogoProps> = ({ width, height }) => {
  const { state } = useSettings();
  return (
    <Image
      source={state.theme === 'light' ? appLogoLight : appLogoDark}
      style={[
        {
          width,
          height,
        },
        styles.logo,
      ]}
    />
  );
};

const styles = StyleSheet.create({
  logo: {
    marginBottom: 5,
    resizeMode: 'contain',
    backgroundColor: 'transparent',
  },
});
