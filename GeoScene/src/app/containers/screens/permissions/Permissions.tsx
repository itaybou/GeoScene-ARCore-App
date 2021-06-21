import {
  AppPermission,
  GlobalPermissions,
} from '../../../providers/UserProvider';
import { Image, SectionList, StyleSheet, View } from 'react-native';
import { useTheme, useUser } from '../../../utils/hooks/Hooks';

import { Center } from '../../../components/layout/Center';
import FastImage from 'react-native-fast-image';
import { PageCard } from '../../../components/layout/PageCard';
import React from 'react';
import { Section } from 'react-native-paper/lib/typescript/components/List/List';
import { SettingsListItem } from '../../../components/settings/SettingsListItem';
import { SettingsListSectionHeader } from '../../../components/settings/SettingsListSectionHeader';
import { ThemeButton } from '../../../components/input/ThemeButton';
import { ThemeIcon } from '../../../components/assets/ThemeIcon';
import { ThemeText } from '../../../components/text/ThemeText';

interface PermissionsProps {}

export type PermissionType = Record<
  keyof GlobalPermissions | keyof AppPermission,
  string
>;

const defaultProfilePicture = require('../../../assets/img/profile.png');

export const permissionTextDict: PermissionType = {
  triangulate: 'Trinagulation',
  add_places: 'Add OSM Places',
  allow_all: 'Features open for all users',
  allow_users: 'Features open for logged in users',
};

export const Permissions: React.FC<PermissionsProps> = ({ navigation }) => {
  const { state } = useUser();
  const theme = useTheme();

  const capitalizeFirstLetter = (str: string) => {
    return str.charAt(0).toUpperCase() + str.slice(1);
  };

  return (
    <Center>
      <PageCard background={theme.colors.tabs}>
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
              <ThemeIcon name={'user'} size={12} color={theme.colors.text} />
              <ThemeText
                style={{
                  marginStart: 8,
                }}>{`Welcome, ${state.user?.name}`}</ThemeText>
            </View>
            <View
              style={{
                marginBottom: 4,
                padding: 4,
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <ThemeIcon name={'globe'} size={12} color={theme.colors.text} />
              <ThemeText
                style={{
                  marginStart: 8,
                }}>{`OpenStreetMap ID  ${state.user?.id}`}</ThemeText>
            </View>
          </View>
          <View
            style={{
              width: '40%',
              justifyContent: 'flex-end',
              alignItems: 'flex-end',
            }}>
            <Image
              source={
                state.user?.img
                  ? { uri: state.user?.img }
                  : defaultProfilePicture
              }
              style={[
                { width: 80, height: 80, borderRadius: 25 },
                { borderColor: theme.colors.tabs },
              ]}
            />
          </View>
        </View>

        {state.permissions?.admin && (
          <View>
            <View
              style={{
                marginBottom: 4,
                padding: 4,
                width: '100%',
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              <ThemeIcon name={'star'} size={18} color={theme.colors.text} />
              <ThemeText style={styles.title}>Admin</ThemeText>
            </View>
            <ThemeButton
              icon={'settings'}
              text={'Manage User Permissions'}
              onPress={() => navigation.navigate('ManagePermissions')}
            />
          </View>
        )}
      </PageCard>

      <SectionList
        sections={[
          {
            title: 'User Permissions',
            icon: 'key',
            showHeader: true,
            index: 0,
            data: state.permissions?.permissions
              ? Object.entries(state.permissions?.permissions)
              : [],
          },
          {
            title: 'Global Permissions',
            icon: 'globe-alt',
            showHeader: true,
            index: 1,
            data: state?.global_permissions
              ? Object.entries(state.global_permissions)
              : [],
          },
        ]}
        style={styles.list}
        showsVerticalScrollIndicator={false}
        bounces={false}
        onEndReachedThreshold={0.5}
        ItemSeparatorComponent={() => <View style={styles.seperator} />}
        keyExtractor={(it) => it[0]}
        renderItem={(props) => {
          const show = props.section.data.length > 0;
          const isFirstElement = props.index === 0;
          const isLastElement = props.index === props.section.data.length - 1;

          return (
            show && (
              <SettingsListItem
                item={{
                  title: capitalizeFirstLetter(
                    permissionTextDict[props.item[0]],
                  ),
                  switch: false,
                  switchActive: false,
                  additionalText: props.item[1] ? 'Active' : 'Inactive',
                  onClick: undefined,
                }}
                chevron={false}
                textColor={
                  props.item[1] ? theme.colors.accent : theme.colors.error
                }
                isFirstElement={isFirstElement}
                isLastElement={isLastElement}
              />
            )
          );
        }}
        renderSectionHeader={({
          section: { index, title, showHeader, icon, data },
        }) => {
          return data.length > 0 ? (
            <SettingsListSectionHeader
              icon={
                showHeader
                  ? icon && (
                      <ThemeIcon
                        name={icon}
                        size={18}
                        color={theme.colors.text}
                      />
                    )
                  : null
              }
              paddingTop={index !== 0}
              showHeader={showHeader}
              title={title}
            />
          ) : (
            <PageCard background={theme.colors.tabs}>
              <View
                style={{
                  flexDirection: 'row',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}>
                <ThemeText style={{ color: theme.colors.error }}>
                  {`No ${title} set${index === 0 ? ' for your user.' : '.'}`}
                </ThemeText>
              </View>
            </PageCard>
          );
        }}
      />

      <ThemeButton
        icon={'home'}
        text={'Back Home'}
        onPress={() => navigation.navigate('Internal', { screen: 'Home' })}
      />
    </Center>
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
