import firestore from '@react-native-firebase/firestore';

export const Triangulation = firestore().collection('Triangulation');
export const UserPermissions = firestore().collection('Permissions');
