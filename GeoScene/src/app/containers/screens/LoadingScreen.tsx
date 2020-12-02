import { ActivityIndicator } from 'react-native';
import { Center } from '../../components/layout/Center';
import React from 'react';

interface LoadingScreenProps {}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({}) => {
  return (
    <Center>
      <ActivityIndicator size="large" />
    </Center>
  );
};
