import { Center } from '../../../components/layout/Center';
import { PageCard } from '../../../components/layout/PageCard';
import React from 'react';
import { ThemeLogo } from '../../../components/assets/ThemeLogo';
import { ThemeText } from '../../../components/text/ThemeText';

interface AboutScreenProps {}

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
    </Center>
  );
};
