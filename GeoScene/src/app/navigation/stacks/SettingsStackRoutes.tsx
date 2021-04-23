import { ARGeoScene, Overpass } from '../../../native/NativeModulesBridge';
import { Button, View } from 'react-native';
import {
  Dimensions,
  FlatList,
  NativeModules,
  StyleSheet,
  Text,
} from 'react-native';
import {
  SettingsRoutesParamList,
  SettingsStackRouteNavProps,
} from '../params/RoutesParamList';
import { useEffect, useState } from 'react';

import { ActivityIndicator } from 'react-native-paper';
import { AnimatedSwipeView } from '../../components/layout/AnimatedSwipeView';
import { Center } from '../../components/layout/Center';
import Header from '../../containers/Header';
import React from 'react';
import { ThemeProvider } from '@react-navigation/native';
import { createChangeset } from '../../api/osm/OSMApi';
import { createStackNavigator } from '@react-navigation/stack';
import promisify from '../../api/promisify';
import useTheme from '../../utils/hooks/useTheme';
import useUser from '../../utils/hooks/useUser';
import { SettingsScreen } from '../../containers/screens/settings/SettingsScreen';

interface StackProps {}

const Stack = createStackNavigator<SettingsRoutesParamList>();

const width = Dimensions.get('window').width * 0.4;

function Register({ route }: SettingsStackRouteNavProps<'Settings'>) {
  const [ShowComment, setShowModelComment] = useState<boolean>(false);
  const [animateModal, setanimateModal] = useState<boolean>(false);

  const [places, setPlaces] = useState<any>([]);
  const [loading, setLoading] = useState<boolean>(true);

  console.log(Overpass);

  console.log(ARGeoScene);

  const theme = useTheme();

  const { state, dispatch } = useUser();

  const fetchUserPlaces = async () => {
    await promisify(
      'getUserPOIs',
      Overpass,
    )('Lior Hassan')
      .then((response) => {
        setPlaces(JSON.parse(response?.data));
        setLoading(false);
      })
      .catch((err) => console.log(err));
  };

  useEffect(() => {
    fetchUserPlaces();
  }, []);

  const renderPlace = ({ item }) => {
    return (
      <View
        style={{
          height: 50,
          flexDirection: 'column',
          borderBottomColor: theme.colors.border,
          borderBottomWidth: 2,
          backgroundColor: theme.colors.tabs,
        }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
          }}>
          <Text style={{ fontSize: 10 }}>{item.id} </Text>
          <Text style={{ fontSize: 20, fontWeight: 'bold' }}>
            {item.tags.name}
          </Text>
        </View>
        <Text style={{ fontSize: 12 }}>
          {item.lat}, {item.lon}
        </Text>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {loading ? (
        <ActivityIndicator color={theme.colors.accent} size="large" />
      ) : (
        <View style={{ flex: 1 }}>
          <FlatList
            data={places}
            renderItem={renderPlace}
            keyExtractor={(item) => item?.id}
          />
          {/* <AnimatedSwipeView
        toValue={width}
        fromValue={0}
        duration={500}
        isViewOpen={ShowComment}>
        <Text>Hello World</Text>
      </AnimatedSwipeView> */}
        </View>
      )}
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
      <Stack.Screen name="Settings" component={SettingsScreen} />
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
