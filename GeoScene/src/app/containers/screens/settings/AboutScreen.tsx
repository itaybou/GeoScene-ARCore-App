import { Image, StyleSheet, View } from 'react-native';

import { Center } from '../../../components/layout/Center';
import { PageCard } from '../../../components/layout/PageCard';
import React from 'react';
import { ThemeLogo } from '../../../components/assets/ThemeLogo';
import { ThemeText } from '../../../components/text/ThemeText';

interface AboutScreenProps {}

const osmLogo = require('../../../assets/img/osm.png');
const openTopoLogo = require('../../../assets/img/ot.png');

export const AboutScreen: React.FC<AboutScreenProps> = ({}) => {
  return (
    <Center>
      <ThemeLogo width={400} height={60} />
      <PageCard>
        <ThemeText>
          GeoScene was created as a Software Engineering Final Project in
          Ben-Gurion University.
        </ThemeText>
      </PageCard>
      <PageCard>
        <ThemeText style={{ marginStart: 5, fontSize: 18, fontWeight: 'bold' }}>
          Powered By
        </ThemeText>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          <Image source={osmLogo} style={[styles.logo]} />
          <ThemeText style={{ marginStart: 5, fontSize: 16 }}>
            OpenStreetMap
          </ThemeText>
        </View>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          <Image source={openTopoLogo} style={[styles.logo]} />
          <ThemeText style={{ marginStart: 5, fontSize: 16 }}>
            OpenTopography
          </ThemeText>
        </View>
      </PageCard>
    </Center>
  );
};

const styles = StyleSheet.create({
  logo: {
    width: '20%',
    resizeMode: 'contain',
    backgroundColor: 'transparent',
  },
});
