import { Image, StyleSheet, View } from 'react-native';

import { Center } from '../../../components/layout/Center';
import { PageCard } from '../../../components/layout/PageCard';
import React from 'react';
import { ScrollView } from 'react-native-gesture-handler';
import { TabScreen } from '../../../components/layout/TabScreen';
import { ThemeLogo } from '../../../components/assets/ThemeLogo';
import { ThemeText } from '../../../components/text/ThemeText';

interface AboutScreenProps {}

const osmLogo = require('../../../assets/img/osm.png');
const openTopoLogo = require('../../../assets/img/ot.png');

export const AboutScreen: React.FC<AboutScreenProps> = ({}) => {
  return (
    <ScrollView>
      <TabScreen>
        <ThemeLogo width={400} height={60} />
        <PageCard>
          <ThemeText>
            GeoScene was created as a Software Engineering Final Project in
            Ben-Gurion University.
          </ThemeText>
          <ThemeText>
            The goal of the application is to help travelers, tourists and other
            users to gain spatial orientation.
          </ThemeText>
          <ThemeText>
            GeoScene identifies and presents information about the POIs
            currently in the users FoV using marker-less geo-location based AR
            environment and the mobile device camera.
          </ThemeText>
          <ThemeText>
            When the user points their camera at a POI, a location marker will
            be augmented onto their camera view showing the name and distance of
            the POI from the user.
          </ThemeText>
        </PageCard>
        <PageCard>
          <ThemeText
            style={{ marginStart: 5, fontSize: 18, fontWeight: 'bold' }}>
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
      </TabScreen>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  logo: {
    width: '20%',
    resizeMode: 'contain',
    backgroundColor: 'transparent',
  },
});
