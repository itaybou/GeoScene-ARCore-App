import {
  PermissionStackRouteNavProps,
  PermissionsRoutesParamList,
} from '../params/RoutesParamList';

import Header from '../../containers/Header';
import { ManagePermissions } from '../../containers/screens/permissions/ManagePermissions';
import { Permissions } from '../../containers/screens/permissions/Permissions';
import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

interface PermissionStackRoutesProps {}

const Stack = createStackNavigator<PermissionsRoutesParamList>();

export const PermissionStackRoutes: React.FC<PermissionStackRoutesProps> = ({}) => {
  return (
    <Stack.Navigator
      initialRouteName="Permissions"
      screenOptions={{
        header: Header,
        animationEnabled: false,
      }}>
      <Stack.Screen name="Permissions" component={Permissions} />
      <Stack.Screen name="ManagePermissions" component={ManagePermissions} />
    </Stack.Navigator>
  );
};
