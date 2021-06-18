import {
  PlacesRoutesParamList,
  PlacesStackRouteNavProps,
} from '../params/RoutesParamList';
import React, { useMemo, useState } from 'react';

import { AddPlace } from '../../containers/screens/places/AddPlace';
import { Center } from '../../components/layout/Center';
import { DownloadPlace } from '../../containers/screens/places/DownloadPlace';
import { DownloadedPlace } from '../../containers/screens/places/DownloadedPlace';
import Header from '../../containers/Header';
import { OptionModal } from '../../components/modals/OptionModal';
import { ThemeCardButton } from '../../components/input/ThemeCardButton';
import { UserPlaces } from '../../containers/screens/places/UserPlaces';
import { createStackNavigator } from '@react-navigation/stack';
import { useEffect } from 'react';
import useUser from '../../utils/hooks/useUser';

interface StackProps {}
export interface PlacesProps {
  showAddMessage: boolean;
}

const Stack = createStackNavigator<PlacesRoutesParamList>();

function Places({ route, navigation }: PlacesStackRouteNavProps<'Places'>) {
  const { state } = useUser();
  const [addApprovalMessageVisible, setAddApprovalMessageVisible] = useState<
    boolean
  >(false);

  useEffect(() => {
    if (route?.params?.showAddMessage) {
      setAddApprovalMessageVisible(true);
    }
  }, [route]);

  return (
    <Center>
      {state.user && (
        <ThemeCardButton
          text="My Places"
          description="View the places you added to the map provider."
          icon={'list'}
          onPress={() => navigation.navigate('UserPlaces')}
        />
      )}
      {state.user && (
        <ThemeCardButton
          text="Add Place"
          description="Add a place to the map provider by current location or map choice."
          icon={'plus'}
          onPress={() => navigation.navigate('AddPlace')}
        />
      )}
      <ThemeCardButton
        text="Download Area"
        description="Download information in chossen area to later use while offline."
        icon={'cloud-download'}
        onPress={() => navigation.navigate('DownloadPlace')}
      />
      <ThemeCardButton
        text="My Downloaded Areas"
        description="View Downloaded information stored on device for offline use."
        icon={'drawer'}
        onPress={() => navigation.navigate('DownloadedPlaces')}
      />
      <OptionModal
        big={false}
        isVisible={addApprovalMessageVisible}
        showOnlyOk={true}
        text={'Location add request sent, it will be visible in a short while.'}
        onOK={() => {}}
        hide={() => setAddApprovalMessageVisible(false)}
      />
    </Center>
  );
}

export const PlacesStackRoutes: React.FC<StackProps> = ({}) => {
  return (
    <Stack.Navigator
      initialRouteName="Places"
      screenOptions={{
        header: Header,
        animationEnabled: false,
      }}>
      <Stack.Screen name="Places" component={Places} />
      <Stack.Screen name="AddPlace" component={AddPlace} />
      <Stack.Screen name="DownloadPlace" component={DownloadPlace} />
      <Stack.Screen name="DownloadedPlaces" component={DownloadedPlace} />
      <Stack.Screen name="UserPlaces" component={UserPlaces} />
    </Stack.Navigator>
  );
};
