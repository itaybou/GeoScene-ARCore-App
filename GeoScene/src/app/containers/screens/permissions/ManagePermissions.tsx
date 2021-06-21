import {
  AppPermission,
  GlobalPermissions,
  PermissionNames,
} from '../../../providers/UserProvider';
import {
  FlatList,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  View,
} from 'react-native';
import React, { useMemo, useState } from 'react';
import {
  UserPermissions,
  addPermissions,
  getAllUserPermissions,
  getGlobalPermissionsLastChange,
  getUserPermissions,
  getUserPermissionsStartsWith,
  removePermissions,
  updateGlobalPermissions,
  updatePermissions,
} from '../../../api/firestore/permissions/PermissionsFirestore';
import { useSettings, useTheme, useUser } from '../../../utils/hooks/Hooks';

import { BottomModal } from '../../../components/modals/BottomModal';
import { Center } from '../../../components/layout/Center';
import { Checkbox } from 'react-native-paper';
import { ErrorModal } from '../../../components/modals/ErrorModal';
import { Icon } from 'react-native-elements';
import { OptionModal } from '../../../components/modals/OptionModal';
import { PageCard } from '../../../components/layout/PageCard';
import { TabScreen } from '../../../components/layout/TabScreen';
import { ThemeButton } from '../../../components/input/ThemeButton';
import { ThemeIcon } from '../../../components/assets/ThemeIcon';
import { ThemeText } from '../../../components/text/ThemeText';
import { ThemeTextInput } from '../../../components/input/ThemeTextInput';
import { getUserDetails } from '../../../auth/Authentication';
import { permissionTextDict } from './Permissions';
import { timeConverter } from '../../../utils/time/time';
import { useEffect } from 'react';

interface ManagePermissionsProps {}

interface CurrentPermissions {
  doc_id: string;
  data: UserPermissions;
}

export const ManagePermissions: React.FC<ManagePermissionsProps> = ({
  navigation,
}) => {
  const { state } = useUser();
  const settings = useSettings();
  const theme = useTheme();
  const [showAddModal, setShowAddModal] = useState<boolean>(false);
  const [showPermissionModal, setShowPermissionModal] = useState<boolean>(
    false,
  );
  const [currentPermissions, setCurrentPermissions] = useState<
    CurrentPermissions | undefined
  >(undefined);

  const [visiblePermissions, setVisiblePermissions] = useState<
    UserPermissions[]
  >([]);
  const [screen, setScreen] = useState<'user' | 'global'>('user');

  const [filterUsername, setFilterUsername] = useState<string>('');
  const [addUserID, setAddUserID] = useState<string>('');
  const [addUser, setAddUser] = useState<
    { username: string; id: number } | undefined
  >(undefined);
  const [addErrorMessage, setAddErrorMessage] = useState<string | undefined>(
    undefined,
  );
  const [searchTimeout, setSearchTimeout] = useState<
    NodeJS.Timeout | undefined
  >(undefined);

  const [okTimeout, setOkTimeout] = useState<NodeJS.Timeout | undefined>(
    undefined,
  );

  const [removeModalVisible, setRemoveModalVisible] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | undefined>(
    undefined,
  );

  const [showOK, setShowOK] = useState<boolean>(false);
  const [okMessage, setOkMessage] = useState<string | undefined>(undefined);

  const defaultPermissions: AppPermission = useMemo(
    () =>
      PermissionNames.reduce((current, item) => {
        current[item] = false;
        return current;
      }, {}),
    [],
  );
  const [checkedPermissions, setCheckedPermissions] = useState<AppPermission>(
    defaultPermissions,
  );

  const [
    globalPermissions,
    setGlobalPermissions,
  ] = useState<GlobalPermissions | null>(state.global_permissions);

  const [
    globalPermissionsLastChange,
    setGlobalPermissionsLastChange,
  ] = useState<number | undefined>(undefined);

  const [checkedAdmin, setCheckedAdmin] = useState<boolean>(false);

  useEffect(() => {
    setGlobalPermissions(state.global_permissions);
  }, [state.global_permissions]);

  const capitalizeFirstLetter = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  const startOKTimer = (message?: string) => {
    if (okTimeout) {
      clearTimeout(okTimeout);
      setSearchTimeout(undefined);
    }
    if (message) {
      setOkMessage(message);
    }
    setShowOK(true);
    setOkTimeout(
      setTimeout(() => {
        setShowOK(false);
        if (okMessage) {
          setOkMessage(undefined);
        }
      }, 3000),
    );
  };

  const openAddModal = () => {
    setCurrentPermissions(undefined);
    setShowAddModal(true);
    setShowPermissionModal(true);
  };

  const closeAddModal = () => {
    setCheckedPermissions(defaultPermissions);
    setShowPermissionModal(false);
    setShowAddModal(false);
    setCurrentPermissions(undefined);
    setFilterUsername('');
    setAddErrorMessage(undefined);
    setAddUser(undefined);
    setCheckedAdmin(false);
  };

  const closePermissionModal = () => {
    setShowPermissionModal(false);
    setAddUser(undefined);
    setCheckedAdmin(false);
    setCheckedPermissions(defaultPermissions);
    setCurrentPermissions(undefined);
  };

  const searchAndChangeSubscriber = (searchText: string | undefined) => {
    if (searchTimeout) {
      clearTimeout(searchTimeout);
      setSearchTimeout(undefined);
    }
    setSearchTimeout(
      setTimeout(async () => {
        if (!searchText || searchText.length === 0) {
          await findAllUserPermissions();
        } else {
          await getUserPermissionsStartsWith(searchText, setVisiblePermissions);
        }
      }, 400),
    );
  };

  const findAllUserPermissions = async () => {
    await getAllUserPermissions(setVisiblePermissions);
  };

  useEffect(() => {
    findAllUserPermissions();

    return () => {
      if (searchTimeout) {
        clearTimeout(searchTimeout);
      }
      if (okTimeout) {
        clearTimeout(okTimeout);
      }
    };
  }, []);

  const renderVisiblePermission = ({ item }) => {
    return (
      <View
        style={{
          paddingHorizontal: 12,
          paddingVertical: 16,
          flexDirection: 'row',
          justifyContent: 'space-between',
          backgroundColor: theme.colors.tabs,
          borderBottomColor: theme.colors.border,
          borderBottomWidth: 2,
        }}>
        <View
          style={{
            flex: 0.5,
            flexDirection: 'column',
            alignItems: 'flex-start',
          }}>
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
            }}>
            {item.admin && (
              <Icon
                type="font-awesome"
                name={'star'}
                color={theme.colors.accent_secondary}
                size={20}
                style={{ marginEnd: 8 }}
              />
            )}
            <ThemeText style={{ fontSize: 20, fontWeight: 'bold' }}>
              {item.username}
            </ThemeText>
          </View>
          <ThemeText style={{ fontSize: 12 }}>
            {`OpenStreetMap ID: ${item.id}`}
          </ThemeText>
          <View
            style={{
              marginTop: 5,
              alignItems: 'flex-start',
            }}>
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
              }}>
              <ThemeIcon name="clock" size={10} />
              <ThemeText style={{ fontSize: 12, marginStart: 5 }}>
                {`Last Change: ${timeConverter(item.last_change)}`}
              </ThemeText>
            </View>
          </View>
        </View>
        <View
          style={{
            flex: 0.35,
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
          <ThemeButton
            icon="key"
            onPress={async () => {
              const currentPermission = await getUserPermissions(item.id);
              setCurrentPermissions(currentPermission);
              setCheckedAdmin(currentPermission?.data.admin);
              setCheckedPermissions(currentPermission?.data.permissions);
              setShowPermissionModal(true);
            }}
          />
          <ThemeButton
            icon="trash"
            onPress={async () => {
              const currentPermission = await getUserPermissions(item.id);
              setCurrentPermissions(currentPermission);
              setRemoveModalVisible(true);
            }}
          />
        </View>
      </View>
    );
  };

  return (
    <TabScreen>
      <View style={{ marginVertical: 8 }}>
        <ThemeButton
          icon={'home'}
          text={'Back Home'}
          onPress={() => navigation.navigate('Internal', { screen: 'Home' })}
        />
        <View
          style={{
            flexDirection: 'row',
            marginVertical: 8,
            width: '100%',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <ThemeButton
            selected={screen === 'user'}
            icon={'key'}
            text={'User Permissions'}
            onPress={async () => {
              await findAllUserPermissions();
              setShowOK(false);
              setScreen('user');
              setGlobalPermissions(null);
              setGlobalPermissionsLastChange(undefined);
            }}
          />
          <ThemeButton
            selected={screen === 'global'}
            icon={'globe'}
            text={'Global Permissions'}
            onPress={async () => {
              setShowOK(false);
              setScreen('global');
              setGlobalPermissions(state.global_permissions);
              setGlobalPermissionsLastChange(
                await getGlobalPermissionsLastChange(),
              );
            }}
          />
        </View>
      </View>
      {screen == 'user' && (
        <View style={{ flex: 1, marginVertical: 8, width: '100%' }}>
          <View style={{ flex: 1 }}>
            {showOK && (
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <ThemeIcon
                    name="check"
                    size={25}
                    color={
                      settings.state.theme === 'dark'
                        ? theme.colors.accent
                        : theme.colors.accent_dark
                    }
                  />
                </View>
                <ThemeText style={{ marginStart: 16 }}>{okMessage}</ThemeText>
              </View>
            )}
            <View
              style={{
                flexDirection: 'row',
                justifyContent: 'space-around',
                alignItems: 'center',
              }}>
              <ThemeButton
                style={{ height: '70%' }}
                icon={'plus'}
                onPress={openAddModal}
              />
              <View
                style={{
                  flex: 0.95,
                  marginBottom: 8,
                }}>
                <ThemeTextInput
                  value={filterUsername}
                  label={'Filter by Username'}
                  onChangeText={(text: string) => {
                    setFilterUsername(text);
                    searchAndChangeSubscriber(text);
                  }}
                />
              </View>
              <TouchableOpacity
                style={{ marginStart: 8, marginEnd: 8 }}
                onPress={() => {
                  setFilterUsername('');
                  searchAndChangeSubscriber('');
                }}>
                <ThemeIcon name={'close'} size={25} />
              </TouchableOpacity>
            </View>
            <FlatList
              data={visiblePermissions}
              renderItem={renderVisiblePermission}
              keyExtractor={(item) => item.id}
            />
          </View>
          <BottomModal
            showButtonIcon={false}
            title={
              currentPermissions
                ? `${currentPermissions.data.username} Permissions`
                : 'Add Permissions'
            }
            enableSwipeDown={false}
            buttonText={'CLOSE'}
            isVisible={showPermissionModal}
            hide={() => {
              if (showAddModal) {
                closeAddModal();
              } else closePermissionModal();
            }}
            onButtonPress={() => {
              if (showAddModal) {
                closeAddModal();
              } else closePermissionModal();
            }}
            screenPercent={currentPermissions ? 0.7 : addUser ? 0.75 : 0.35}>
            <View onStartShouldSetResponder={(): boolean => true}>
              <ScrollView style={{ marginTop: 16 }}>
                {showAddModal && (
                  <View
                    style={{
                      width: '100%',
                      paddingHorizontal: 8,
                      flexDirection: 'row',
                      justifyContent: 'space-between',
                    }}>
                    <View
                      style={{
                        flex: 1,
                        flexDirection: 'row',
                        justifyContent: 'space-around',
                        alignItems: 'center',
                      }}>
                      <ThemeButton
                        style={{ height: '70%' }}
                        icon={'magnifier'}
                        onPress={async () => {
                          try {
                            const permissions = await getUserPermissions(
                              parseInt(addUserID, 10),
                            );
                            if (!permissions) {
                              const userDetails = await getUserDetails(
                                parseInt(addUserID, 10),
                              );
                              if (userDetails !== null) {
                                setAddUser(userDetails);
                                setAddErrorMessage(undefined);
                              } else {
                                setAddUser(undefined);
                                setAddErrorMessage('Invalid OpenStreetMap ID');
                              }
                              setAddUserID('');
                            } else {
                              setAddUser(undefined);
                              setAddErrorMessage(
                                `User ${permissions.data.username} already has permissions.`,
                              );
                              setAddUserID('');
                            }
                          } catch (err) {
                            setAddUser(undefined);
                            setAddErrorMessage('Invalid OpenStreetMap ID');
                            setAddUserID('');
                          }
                        }}
                      />
                      <View
                        style={{
                          flex: 0.95,
                          marginBottom: 8,
                        }}>
                        <ThemeTextInput
                          numeric={true}
                          error={addErrorMessage !== undefined}
                          errorMessage={addErrorMessage}
                          value={addUserID}
                          label={'OpenStreetMap ID'}
                          onChangeText={(text: string) => {
                            setAddErrorMessage(undefined);
                            setAddUserID(text);
                          }}
                        />
                      </View>
                      <TouchableOpacity
                        style={{ marginStart: 8, marginEnd: 8 }}
                        onPress={() => {
                          setAddUser(undefined);
                          setAddErrorMessage(undefined);
                          setAddUserID('');
                        }}>
                        <ThemeIcon name={'close'} size={25} />
                      </TouchableOpacity>
                    </View>
                  </View>
                )}
                {(addUser || (showPermissionModal && currentPermissions)) && (
                  <View>
                    <PageCard
                      background={theme.colors.tabs}
                      disablePadding={false}>
                      <View
                        style={{
                          flexDirection: 'row',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}>
                        <View style={{ width: '60%' }}>
                          <View
                            style={{
                              marginBottom: 4,
                              padding: 4,
                              width: '100%',
                              flexDirection: 'row',
                              alignItems: 'center',
                            }}>
                            <ThemeIcon
                              name={'user'}
                              size={15}
                              color={theme.colors.text}
                            />
                            <ThemeText
                              style={{
                                marginStart: 8,
                                fontWeight: 'bold',
                                fontSize: 20,
                              }}>
                              {showPermissionModal && currentPermissions
                                ? currentPermissions?.data.username
                                : addUser?.username}
                            </ThemeText>
                          </View>
                          <View
                            style={{
                              marginBottom: 4,
                              padding: 4,
                              width: '100%',
                              flexDirection: 'row',
                              alignItems: 'center',
                            }}>
                            <ThemeIcon
                              name={'globe'}
                              size={15}
                              color={theme.colors.text}
                            />
                            <ThemeText
                              style={{
                                marginStart: 8,
                              }}>{`OpenStreetMap ID  ${
                              showPermissionModal && currentPermissions
                                ? currentPermissions?.data.id
                                : addUser.id
                            }`}</ThemeText>
                          </View>
                        </View>
                        <View
                          style={{
                            width: '40%',
                            justifyContent: 'flex-end',
                            alignItems: 'flex-end',
                          }}>
                          <ThemeButton
                            icon={'ban'}
                            onPress={() => {
                              setAddUser(undefined);
                              if (currentPermissions) {
                                closePermissionModal();
                              }
                            }}
                          />
                        </View>
                      </View>
                    </PageCard>
                    <PageCard
                      background={theme.colors.tabs}
                      disablePadding={false}>
                      <View
                        style={{
                          marginBottom: 4,
                          padding: 4,
                          width: '100%',
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}>
                        <ThemeIcon
                          name={'key'}
                          size={18}
                          color={theme.colors.text}
                        />
                        <ThemeText style={styles.title}>
                          Apply Permissions
                        </ThemeText>
                      </View>
                      <View
                        style={{ paddingVertical: 0, flexDirection: 'column' }}>
                        {PermissionNames.map((item) => (
                          <View
                            key={item}
                            style={{
                              flexDirection: 'row',
                              alignItems: 'center',
                            }}>
                            <Checkbox
                              color={theme.colors.accent_secondary}
                              uncheckedColor={theme.colors.inactiveTint}
                              status={
                                checkedPermissions[item]
                                  ? 'checked'
                                  : 'unchecked'
                              }
                              onPress={() => {
                                setCheckedPermissions({
                                  ...checkedPermissions,
                                  [item]: !checkedPermissions[item],
                                });
                              }}
                            />
                            {item && (
                              <ThemeText>
                                {capitalizeFirstLetter(
                                  permissionTextDict[item],
                                )}
                              </ThemeText>
                            )}
                          </View>
                        ))}
                      </View>
                    </PageCard>
                    <PageCard
                      background={theme.colors.tabs}
                      disablePadding={false}>
                      <View
                        style={{
                          marginBottom: 4,
                          padding: 4,
                          width: '100%',
                          flexDirection: 'row',
                          alignItems: 'center',
                        }}>
                        <ThemeIcon
                          name={'star'}
                          size={18}
                          color={theme.colors.text}
                        />
                        <ThemeText style={styles.title}>Assign Admin</ThemeText>
                      </View>
                      <View
                        style={{ paddingVertical: 0, flexDirection: 'column' }}>
                        <View
                          style={{
                            flexDirection: 'row',
                            alignItems: 'center',
                          }}>
                          <Checkbox
                            color={theme.colors.accent_secondary}
                            uncheckedColor={theme.colors.inactiveTint}
                            status={checkedAdmin ? 'checked' : 'unchecked'}
                            onPress={() => {
                              setCheckedAdmin(!checkedAdmin);
                            }}
                          />
                          <ThemeText>{`Assign ${
                            showPermissionModal && currentPermissions
                              ? currentPermissions?.data.username
                              : addUser.username
                          } to Admin`}</ThemeText>
                        </View>
                      </View>
                    </PageCard>
                  </View>
                )}
                {(addUser || (showPermissionModal && currentPermissions)) && (
                  <View style={{ flex: 0.2, marginBottom: 40 }}>
                    <ThemeButton
                      icon="like"
                      text="Apply"
                      onPress={async () => {
                        if (showAddModal) {
                          await addPermissions(
                            addUser.username,
                            `${addUser.id}`,
                            checkedAdmin,
                            checkedPermissions,
                          );
                          closeAddModal();
                          startOKTimer(`Added ${addUser.username}`);
                          await findAllUserPermissions();
                        } else if (
                          showPermissionModal &&
                          currentPermissions &&
                          currentPermissions?.doc_id
                        ) {
                          const updated = await updatePermissions(
                            currentPermissions?.doc_id,
                            currentPermissions.data.username,
                            `${currentPermissions.data.id}`,
                            checkedAdmin,
                            currentPermissions?.data.admin,
                            checkedPermissions,
                          );
                          if (!updated) {
                            setErrorMessage(
                              'Application must have at least 1 admin at all times.',
                            );
                          } else {
                            startOKTimer(
                              `Updated ${currentPermissions.data.username}`,
                            );
                          }
                          closePermissionModal();
                          await findAllUserPermissions();
                        }
                      }}
                    />
                  </View>
                )}
              </ScrollView>
            </View>
          </BottomModal>
        </View>
      )}
      {screen == 'global' && (
        <View style={{ flex: 1, marginVertical: 8, width: '100%' }}>
          <PageCard background={theme.colors.tabs} disablePadding={false}>
            <View
              style={{
                marginBottom: 4,
                padding: 4,
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <ThemeIcon
                name={'globe-alt'}
                size={18}
                color={theme.colors.text}
              />
              <ThemeText style={styles.title}>Global Permissions</ThemeText>
            </View>
            {globalPermissions && (
              <View style={{ paddingVertical: 0, flexDirection: 'column' }}>
                {Object.keys(globalPermissions)
                  .sort((a, b) => a.length - b.length)
                  .map((item) => (
                    <View
                      key={item}
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                      }}>
                      <Checkbox
                        color={theme.colors.accent_secondary}
                        uncheckedColor={theme.colors.inactiveTint}
                        disabled={
                          item === 'allow_users' &&
                          globalPermissions['allow_all'] &&
                          globalPermissions['allow_users']
                        }
                        status={
                          globalPermissions[item] ? 'checked' : 'unchecked'
                        }
                        onPress={() => {
                          if (
                            item === 'allow_all' &&
                            !globalPermissions[item]
                          ) {
                            setGlobalPermissions({
                              ...globalPermissions,
                              allow_all: true,
                              allow_users: true,
                            });
                          } else if (
                            item === 'allow_users' &&
                            globalPermissions['allow_all'] &&
                            globalPermissions['allow_users']
                          ) {
                            setGlobalPermissions({
                              ...globalPermissions,
                              allow_all: true,
                              allow_users: true,
                            });
                          } else {
                            setGlobalPermissions({
                              ...globalPermissions,
                              [item]: !globalPermissions[item],
                            });
                          }
                        }}
                      />
                      {item && (
                        <ThemeText>
                          {capitalizeFirstLetter(permissionTextDict[item])}
                        </ThemeText>
                      )}
                    </View>
                  ))}
              </View>
            )}
            {globalPermissionsLastChange && (
              <View
                style={{
                  marginTop: 24,
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <ThemeIcon name="clock" size={10} />
                <ThemeText style={{ fontSize: 12, marginStart: 5 }}>
                  {`Last Change: ${timeConverter(globalPermissionsLastChange)}`}
                </ThemeText>
              </View>
            )}
            {showOK && (
              <View
                style={{
                  marginTop: 8,
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <ThemeIcon
                  name="check"
                  size={25}
                  color={
                    settings.state.theme === 'dark'
                      ? theme.colors.accent
                      : theme.colors.accent_dark
                  }
                />
              </View>
            )}
          </PageCard>
          <ThemeButton
            icon="like"
            text="Apply"
            onPress={async () => {
              const changed = await updateGlobalPermissions(globalPermissions);
              setGlobalPermissionsLastChange(
                await getGlobalPermissionsLastChange(),
              );
              if (changed) {
                startOKTimer();
              }
            }}
          />
        </View>
      )}
      <OptionModal
        big={false}
        text={`Are you sure you want to remove permissions for ${currentPermissions?.data.username}`}
        onOK={async () => {
          if (currentPermissions?.doc_id) {
            const removed = await removePermissions(
              currentPermissions?.doc_id,
              currentPermissions.data.admin,
            );
            setRemoveModalVisible(false);
            setCurrentPermissions(undefined);
            if (!removed) {
              setErrorMessage(
                'Application must have at least 1 admin at all times.',
              );
            } else startOKTimer(`Removed ${currentPermissions.data.username}`);
          }
          await findAllUserPermissions();
        }}
        hide={() => {
          setRemoveModalVisible(false);
          setCurrentPermissions(undefined);
        }}
        isVisible={removeModalVisible}
      />
      <ErrorModal
        text={errorMessage ?? 'Error'}
        hide={() => {
          setRemoveModalVisible(false);
          setErrorMessage(undefined);
          setCurrentPermissions(undefined);
        }}
        isVisible={errorMessage !== undefined}
      />
    </TabScreen>
  );
};

const styles = StyleSheet.create({
  list: {
    flex: 1,
    width: '100%',
    marginTop: 0,
  },
  title: { marginLeft: 16, fontSize: 18 },
  seperator: {
    height: 1,
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
});
