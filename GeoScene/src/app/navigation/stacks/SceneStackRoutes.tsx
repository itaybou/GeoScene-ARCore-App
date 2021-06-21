import React, { useState } from 'react';
import {
  SceneRoutesParamList,
  SceneStackRouteNavProps,
} from '../params/RoutesParamList';

import { ARModule } from '../../../native/NativeModulesBridge';
import { ARSceneView } from '../../containers/screens/ar/ARSceneView';
import { Center } from '../../components/layout/Center';
import { CompassScreen } from '../../containers/screens/compass/CompassScreen';
import Header from '../../containers/Header';
import { LoadingModal } from '../../components/modals/LoadingModal';
import { OptionModal } from '../../components/modals/OptionModal';
import { ThemeButton } from '../../components/input/ThemeButton';
import { ThemeCardButton } from '../../components/input/ThemeCardButton';
import { TriangulateStackRoutes } from './triangulation/TriangulationStackRoutes';
import { View } from 'react-native';
import { checkPermissions } from '../../providers/UserProvider';
import { createStackNavigator } from '@react-navigation/stack';
import { useRoute } from '@react-navigation/core';
import useUser from '../../utils/hooks/useUser';

interface StackProps {}

const Stack = createStackNavigator<SceneRoutesParamList>();

const Scenes: React.FC<SceneStackRouteNavProps<'Scene'>> = ({ navigation }) => {
  const { state } = useUser();
  const [deleteModalShown, setDeleteModalShown] = useState<boolean>(false);
  const [loadingModalShown, setLoadingModalShown] = useState<boolean>(false);

  const [deleteResponse, setDeleteResponse] = useState<any>(undefined);

  return (
    <Center>
      <ThemeCardButton
        text="AR Explore"
        description="Start Augmented Reality view and explore your surroundings."
        icon={'directions'}
        onPress={() => navigation.navigate('AR')}
      />
      {checkPermissions(state, 'triangulate') && (
        <ThemeCardButton
          text="Triangulate"
          description="Perform triangulation in order to tag locations visible to you."
          icon={'size-actual'}
          onPress={() => navigation.navigate('TriangulateStack')}
        />
      )}
      <ThemeCardButton
        text="Compass"
        description="Use compass to determine your orientation."
        icon={'compass'}
        onPress={() => navigation.navigate('Compass')}
      />
      <View
        style={{
          width: '100%',
          justifyContent: 'center',
          alignItems: 'center',
          paddingHorizontal: 10,
          marginTop: 15,
        }}>
        <ThemeButton
          text="Clear AR Places Cache"
          style={{ width: '100%', paddingVertical: 6 }}
          icon={'trash'}
          onPress={() => setDeleteModalShown(true)}
        />
      </View>
      <OptionModal
        text={
          deleteResponse
            ? `Deleted ${deleteResponse.deleted_pois} cached places from ${deleteResponse.deleted_raster} raster.`
            : 'Are you sure you want to delete cached location data?'
        }
        big={false}
        statusBarTranslucent={false}
        isVisible={deleteModalShown || deleteResponse !== undefined}
        showOnlyOk={!loadingModalShown && deleteResponse}
        hide={() => setDeleteModalShown(false)}
        onOK={
          deleteResponse
            ? () => setDeleteResponse(undefined)
            : async () => {
                setDeleteModalShown(false);
                setLoadingModalShown(true);
                const response = await ARModule.deleteCachedLocationData();
                setDeleteResponse(response);
                setLoadingModalShown(false);
                setDeleteModalShown(false);
              }
        }
      />
      <LoadingModal
        text="Are you sure you want to delete cached location data?"
        isVisible={loadingModalShown}
      />
    </Center>
  );
};

export const SceneStackRoutes: React.FC<StackProps> = ({}) => {
  const route = useRoute();
  return (
    <Stack.Navigator
      initialRouteName="Scene"
      screenOptions={{
        header: Header,
        animationEnabled: false,
      }}>
      <Stack.Screen name="Scene" component={Scenes} />
      <Stack.Screen
        name="AR"
        component={ARSceneView}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="TriangulateStack"
        component={TriangulateStackRoutes}
        options={{ headerShown: false }}
      />
      <Stack.Screen
        name="Compass"
        component={CompassScreen}
        options={{ headerShown: true }}
      />
    </Stack.Navigator>
  );
};
