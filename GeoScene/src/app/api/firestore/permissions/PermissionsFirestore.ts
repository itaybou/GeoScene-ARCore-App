import {
  AppPermission,
  GlobalPermissions,
  Permissions,
} from './../../../providers/UserProvider';

import { UserPermissions } from '../Firestore';

export interface UserPermissions {
  admin: boolean;
  id: number;
  last_change: number;
  username: string;
  permissions: AppPermission;
}

const checkAdminCount = async () => {
  const admins = await UserPermissions.where('admin', '==', true).get();
  return admins.docs.length;
};

export const removePermissions = async (doc_id: string, admin: boolean) => {
  try {
    if (admin) {
      const admins = await checkAdminCount();
      if (admins > 1) {
        await UserPermissions.doc(doc_id).delete();
        return true;
      }
    } else {
      await UserPermissions.doc(doc_id).delete();
      return true;
    }
    return false;
  } catch (ex) {
    return false;
  }
};

export const addPermissions = async (
  username: string,
  id: string,
  admin: boolean,
  permissions: AppPermission,
) => {
  try {
    await UserPermissions.add({
      id,
      username,
      admin,
      permissions,
      last_change: Math.floor(Date.now() / 1000),
    });

    return true;
  } catch (ex) {
    return false;
  }
};

export const updatePermissions = async (
  doc_id: string,
  username: string,
  id: string,
  admin: boolean,
  prevAdmin: boolean,
  permissions: AppPermission,
) => {
  try {
    if (prevAdmin && !admin) {
      const admins = await checkAdminCount();
      if (admins > 1) {
        await UserPermissions.doc(doc_id).update({
          id,
          username,
          admin,
          permissions,
          last_change: Math.floor(Date.now() / 1000),
        });
        return true;
      }
      return false;
    }
    await UserPermissions.doc(doc_id).update({
      id,
      username,
      admin,
      permissions,
      last_change: Math.floor(Date.now() / 1000),
    });
    return true;
  } catch (ex) {
    return false;
  }
};

export const updateGlobalPermissions = async (
  global_permissions: GlobalPermissions | null,
) => {
  try {
    if (!global_permissions) return false;
    await UserPermissions.doc('global').update({
      ...global_permissions,
      last_change: Math.floor(Date.now() / 1000),
    });
    return true;
  } catch (ex) {
    return false;
  }
};

export const getGlobalPermissionsLastChange = async () => {
  const global_permissions = await (
    await UserPermissions.doc('global').get()
  ).data();
  if (global_permissions) return global_permissions.last_change;
  return undefined;
};

export const getUserPermissions = async (user_id: number | undefined) => {
  if (!user_id) return undefined;

  const permissionUsers = await UserPermissions.where('id', '==', `${user_id}`)
    .limit(1)
    .get();

  const permissions = permissionUsers.docs.map((doc) => {
    const data = doc.data();
    return {
      doc_id: doc.id,
      id: data.id,
      admin: data.admin,
      last_change: data.last_change,
      username: data.username,
      permissions: data.permissions,
    };
  });
  if (permissions.length === 1) {
    let perm = permissions[0];
    let { doc_id, ...rest } = perm;
    return { doc_id, data: rest };
  } else return undefined;
};

export const getUserPermissionsStartsWith = async (
  startWith: string,
  setPermissions: (permissions: UserPermissions[]) => void,
) => {
  const endWith = startWith.replace(/.$/, (c) =>
    String.fromCharCode(c.charCodeAt(0) + 1),
  );

  const permissionUsers = await UserPermissions.orderBy('username')
    .orderBy('admin', 'desc')
    .where('username', '>=', startWith)
    .where('username', '<', endWith)
    .get();

  const permissions = permissionUsers.docs.map((doc) => {
    const data = doc.data();
    return {
      id: data.id,
      admin: data.admin,
      last_change: data.last_change,
      username: data.username,
      permissions: data.permissions,
    };
  });
  setPermissions(permissions);
};

export const getAllUserPermissions = async (
  setPermissions: (permissions: UserPermissions[]) => void,
) => {
  const permissionUsers = await UserPermissions.orderBy('admin', 'desc')
    .orderBy('username')
    .get();

  const permissions = permissionUsers.docs.map((doc) => {
    const data = doc.data();
    return {
      id: data.id,
      admin: data.admin,
      last_change: data.last_change,
      username: data.username,
      permissions: data.permissions,
    };
  });
  setPermissions(permissions);
};

export const subscribeUserPermissions = (
  user_id: number | undefined,
  onGlobalPermissionChange: (global_permissions: GlobalPermissions) => void,
  onUserPermissionChange: (permissions: Permissions) => void,
) => {
  const unsubscribeGlobalPermissionListener = UserPermissions.doc(
    'global',
  ).onSnapshot(
    (querySnapshot) => {
      if (querySnapshot.exists) {
        const global_permissions = querySnapshot.data();
        global_permissions &&
          onGlobalPermissionChange({
            allow_all: global_permissions.allow_all,
            allow_users: global_permissions.allow_users,
          });
      }
    },
    (err) => console.error(err),
  );

  if (user_id) {
    const unsubscribeUserPermissionListener = UserPermissions.where(
      'id',
      '==',
      user_id,
    )
      .limit(1)
      .onSnapshot(
        (querySnapshot) => {
          if (querySnapshot.size === 1) {
            const permissions = querySnapshot.docs[0].data();
            onUserPermissionChange({
              admin: permissions.admin,
              permissions: {
                triangulate: permissions.permissions.triangulation,
                add_places: permissions.permissions.add_places,
              },
            });
          }
        },
        (err) => console.error(err),
      );
    return () => {
      unsubscribeGlobalPermissionListener();
      unsubscribeUserPermissionListener();
    };
  }

  return unsubscribeGlobalPermissionListener;
};
