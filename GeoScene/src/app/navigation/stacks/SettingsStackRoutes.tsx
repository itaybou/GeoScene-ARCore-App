import { Button, View } from 'react-native';
import { Dimensions, FlatList, StyleSheet, Text } from 'react-native';
import {
  SettingsRoutesParamList,
  SettingsStackRouteNavProps,
} from '../params/RoutesParamList';

import { AnimatedSwipeView } from '../../components/layout/AnimatedSwipeView';
import { Center } from '../../components/layout/Center';
import Header from '../../containers/Header';
import React from 'react';
import { ThemeProvider } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { useState } from 'react';
import useTheme from '../../utils/hooks/useTheme';

interface StackProps {}

const Stack = createStackNavigator<SettingsRoutesParamList>();

const width = Dimensions.get('window').width * 0.4;

function Register({ route }: SettingsStackRouteNavProps<'Settings'>) {
  let [ShowComment, setShowModelComment] = useState<boolean>(false);
  let [animateModal, setanimateModal] = useState<boolean>(false);

  return (
    <View
      style={{
        flex: 1,
        flexDirection: 'row',
        alignSelf: 'flex-end',
      }}>
      <AnimatedSwipeView
        toValue={width}
        fromValue={0}
        duration={500}
        isViewOpen={ShowComment}>
        <Text>Hello World</Text>
      </AnimatedSwipeView>
    </View>
  );

  // <HorizontalSlideView animation="spring">
  //   <Center>
  //     <Text>Route name: {route.name}</Text>
  //   </Center>
  // </HorizontalSlideView>
}

export const SettingsStackRoutes: React.FC<StackProps> = ({}) => {
  const theme = useTheme();
  return (
    <Stack.Navigator
      screenOptions={{
        header: Header,
        animationEnabled: false,
      }}>
      <Stack.Screen name="Settings" component={Register} />
    </Stack.Navigator>
  );
};

const styles = StyleSheet.create({
  containerContent: { flex: 1, marginTop: 40 },
  containerHeader: {
    flex: 1,
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
    height: 40,
    backgroundColor: '#F1F1F1',
  },
  headerContent: {
    marginTop: 0,
  },
  Modal: {
    backgroundColor: '#005252',
    marginTop: 0,
  },
});
