import { Badge, Icon } from 'react-native-elements';
import { Image, StyleSheet, ToastAndroid, View } from 'react-native';
import {
  Menu,
  MenuOption,
  MenuOptions,
  MenuTrigger,
  renderers,
} from 'react-native-popup-menu';
import React, { useCallback, useMemo } from 'react';
import { auth, deauth } from '../auth/Authentication';
import { useTheme, useUser } from '../utils/hooks/Hooks';

import Clipboard from '@react-native-community/clipboard';
import { StackHeaderProps } from '@react-navigation/stack';
import { ThemeIcon } from '../components/assets/ThemeIcon';
import { ThemeText } from '../components/text/ThemeText';
import { TouchableOpacity } from 'react-native-gesture-handler';

const defaultProfilePicture = require('../assets/img/profile.png');

export interface ISource {
  source: string | { uri: string };
}

export interface HeaderProps {}

export const Header: React.FC<StackHeaderProps> = ({ scene, navigation }) => {
  const theme = useTheme();
  const { state, dispatch } = useUser();

  const camelCaseToTitle = useCallback((text: string | undefined) => {
    if (!text) return undefined;
    if (text.includes(' ')) return text;
    const result = text.replace(/([A-Z])/g, ' $1');
    return (result.charAt(0).toUpperCase() + result.slice(1)).trim();
  }, []);

  const routeTitle = useMemo(
    () =>
      camelCaseToTitle(scene.descriptor.options.title) ??
      camelCaseToTitle(scene.route.name),
    [scene.descriptor.options.title, scene.route.name, camelCaseToTitle],
  );

  const renderLeftAlignedComponent = useCallback(() => {
    return (
      <View style={styles.leftAlignedContainer}>
        {navigation.canGoBack() && (
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ThemeIcon name="arrow-left" color={theme.colors.text} size={18} />
          </TouchableOpacity>
        )}
        <View style={styles.titleContainer}>
          <ThemeText style={styles.titleTextStyle}>{routeTitle}</ThemeText>
        </View>
      </View>
    );
  }, [navigation, theme.colors.text, routeTitle]);

  const renderAdminIndicator = useCallback(() => {
    return (
      state?.permissions &&
      state?.permissions.admin && (
        <View style={{ position: 'absolute', bottom: 2, left: 0 }}>
          <Icon
            type="font-awesome"
            name={'star'}
            color={theme.colors.accent_secondary}
            size={15}
          />
        </View>
      )
    );
  }, [theme.colors, state]);

  const renderHeaderIcon = useCallback(
    (screen: string, icon: string, size?: number) => {
      return (
        <View style={styles.iconButtonContainer}>
          {state.user?.unreadMessages && (
            <TouchableOpacity
              onPress={() =>
                navigation.navigate('External', { screen: screen })
              }>
              {state.user &&
              icon === 'envelope' &&
              state.user?.unreadMessages > 0 ? (
                <ThemeIcon name="envelope-letter" size={20} />
              ) : (
                <ThemeIcon name={icon} size={size ?? 20} />
              )}
            </TouchableOpacity>
          )}
          {state.user &&
            icon === 'envelope' &&
            state.user?.unreadMessages &&
            state.user?.unreadMessages > 0 && (
              <Badge
                status="success"
                onPress={() =>
                  navigation.navigate('External', { screen: screen })
                }
                value={state.user?.unreadMessages}
                textStyle={{ fontSize: 9 }}
                badgeStyle={{
                  width: 15,
                  height: 15,
                  backgroundColor: theme.colors.accent_secondary,
                  borderWidth: 0,
                }}
                containerStyle={{
                  position: 'absolute',
                  top: -4,
                  right: -6,
                }}
              />
            )}
        </View>
      );
    },
    [state.user, navigation, theme.colors],
  );

  const renderProfilePicture = useCallback(() => {
    const userImage = state.user?.img;
    const { Popover } = renderers;

    return (
      <Menu
        renderer={Popover}
        rendererProps={{
          placement: 'bottom',
          preferredPlacement: 'bottom',
          anchorStyle: { backgroundColor: theme.colors.cards },
        }}>
        <MenuTrigger
          customStyles={{ TriggerTouchableComponent: TouchableOpacity }}>
          <View style={styles.profileImageContainer}>
            <View>
              <Image
                source={
                  userImage
                    ? {
                        uri: userImage,
                      }
                    : defaultProfilePicture
                }
                style={[
                  styles.profileImageStyle,
                  { borderColor: theme.colors.tabs },
                ]}
              />
              {renderAdminIndicator()}
            </View>
            {state.user?.name && (
              <ThemeText style={styles.profileNameText}>
                {state.user?.name}
              </ThemeText>
            )}
          </View>
        </MenuTrigger>
        <MenuOptions
          customStyles={{
            optionsWrapper: {
              width: 180,
              backgroundColor: theme.colors.cards,
            },
          }}>
          {state?.user?.id && (
            <MenuOption
              onSelect={() => {
                Clipboard.setString(state.user?.id as any);
                ToastAndroid.showWithGravity(
                  'OSM ID copied to clipboard',
                  ToastAndroid.SHORT,
                  ToastAndroid.CENTER,
                );
              }}>
              <View
                style={{
                  flexDirection: 'row',
                  padding: 4,
                  justifyContent: 'space-between',
                }}>
                <View
                  style={{
                    flexDirection: 'row',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}>
                  <View style={{ marginEnd: 8 }}>
                    <ThemeIcon
                      name={'tag'}
                      size={10}
                      color={theme.colors.text}
                    />
                  </View>
                  <ThemeText style={{ fontSize: 10, fontWeight: 'bold' }}>
                    OpenStreetMap ID
                  </ThemeText>
                </View>
                <ThemeText style={{ fontSize: 10 }}>
                  {state?.user?.id}
                </ThemeText>
              </View>
            </MenuOption>
          )}
          <MenuOption
            onSelect={() =>
              navigation.navigate('External', { screen: 'Profile' })
            }>
            <View style={{ flexDirection: 'row', padding: 4 }}>
              <View style={{ marginRight: 8 }}>
                <ThemeIcon name={'user'} size={15} color={theme.colors.text} />
              </View>
              <ThemeText>Profile</ThemeText>
            </View>
          </MenuOption>
          <MenuOption onSelect={() => navigation.navigate('Permissions')}>
            <View style={{ flexDirection: 'row', padding: 4 }}>
              <View style={{ marginRight: 8 }}>
                <ThemeIcon name={'key'} size={15} color={theme.colors.text} />
              </View>
              <ThemeText>Permissions</ThemeText>
            </View>
          </MenuOption>
          <MenuOption
            onSelect={() => {
              deauth(dispatch);
              navigation.navigate('Internal', { screen: 'Home' });
            }}>
            <View style={{ flexDirection: 'row', padding: 4 }}>
              <View style={{ marginRight: 8 }}>
                <ThemeIcon
                  name={'logout'}
                  size={15}
                  color={theme.colors.error}
                />
              </View>
              <ThemeText style={{ color: theme.colors.error }}>
                Logout
              </ThemeText>
            </View>
          </MenuOption>
        </MenuOptions>
      </Menu>
    );
  }, [state, theme.colors, dispatch, navigation, renderAdminIndicator]);

  const renderRightAlignedComponent = useCallback(() => {
    const { Popover } = renderers;

    return state.user ? (
      <View style={styles.rightAlignedContainer}>
        {renderHeaderIcon('ProfileSettings', 'user', 18)}
        {state.user?.unreadMessages && renderHeaderIcon('Messages', 'envelope')}
        {renderProfilePicture()}
      </View>
    ) : (
      <Menu
        renderer={Popover}
        rendererProps={{
          placement: 'bottom',
          preferredPlacement: 'bottom',
          anchorStyle: { backgroundColor: theme.colors.cards },
        }}>
        <MenuTrigger>
          <View
            style={{
              flexDirection: 'row',
              justifyContent: 'center',
              alignItems: 'center',
            }}>
            <ThemeText style={{ fontSize: 12 }}>Login</ThemeText>
            <ThemeIcon name={'login'} size={20} />
          </View>
        </MenuTrigger>
        <MenuOptions
          customStyles={{
            optionsWrapper: {
              width: 180,
              backgroundColor: theme.colors.cards,
            },
          }}>
          <MenuOption
            onSelect={() => {
              auth(dispatch);
            }}>
            <View style={{ flexDirection: 'row', padding: 4 }}>
              <View style={{ marginRight: 8 }}>
                <ThemeIcon name={'login'} size={15} />
              </View>
              <ThemeText>Sign In</ThemeText>
            </View>
          </MenuOption>
          <MenuOption
            onSelect={() =>
              navigation.navigate('External', { screen: 'SignUp' })
            }>
            <View style={{ flexDirection: 'row', padding: 4 }}>
              <View style={{ marginRight: 8 }}>
                <ThemeIcon name={'people'} size={15} />
              </View>
              <ThemeText>Sign Up</ThemeText>
            </View>
          </MenuOption>
        </MenuOptions>
      </Menu>
    );
  }, [
    state.user,
    theme.colors,
    renderHeaderIcon,
    renderProfilePicture,
    navigation,
    dispatch,
  ]);

  return (
    <View style={{ backgroundColor: theme.colors.background }}>
      <View style={[{ backgroundColor: theme.colors.tabs }, styles.container]}>
        {renderLeftAlignedComponent()}
        {renderRightAlignedComponent()}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    elevation: 2,
    borderBottomStartRadius: 45,
    width: '100%',
    height: 70,
    top: 0,
    paddingLeft: 24,
    paddingRight: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  leftAlignedContainer: {
    marginRight: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-start',
    flex: 0.5,
  },
  leftAlignedButtonImageStyle: {
    height: 25,
    width: 25,
  },
  titleContainer: {
    marginStart: 16,
    justifyContent: 'flex-start',
  },
  titleTextStyle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  rightAlignedContainer: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    flex: 0.5,
  },
  iconButtonContainer: {
    marginEnd: 29,
  },
  iconImageStyle: {
    width: 18,
    height: 18,
  },
  profileImageContainer: {
    flexDirection: 'column',
    alignItems: 'center',
  },
  profileNameText: {
    fontSize: 9,
  },
  profileImageStyle: {
    width: 50,
    height: 50,
    borderRadius: 20,
  },
  logo: {
    width: 120,
    marginBottom: 5,
    height: 20,
    resizeMode: 'contain',
    backgroundColor: 'transparent',
  },
});

export default Header;
