import {
  Dimensions,
  Image,
  ImageStyle,
  StyleSheet,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import {
  Menu,
  MenuOption,
  MenuOptions,
  MenuTrigger,
  renderers,
} from 'react-native-popup-menu';
import React, { useCallback, useMemo } from 'react';
import {
  RouteProp,
  getFocusedRouteNameFromRoute,
} from '@react-navigation/native';
import { auth, deauth } from '../auth/Authentication';
import { useTheme, useUser } from '../utils/hooks/Hooks';

import { Badge } from 'react-native-elements/dist/badge/Badge';
import RNBounceable from '@freakycoder/react-native-bounceable';
import { StackHeaderProps } from '@react-navigation/stack';
import { ThemeIcon } from '../components/assets/ThemeIcon';
import { ThemeText } from '../components/text/ThemeText';

// const Header: React.FC<StackHeaderProps> = ({ scene, navigation }) => {
//   const theme = useTheme();

//   return (
//     <View style={[styles.main, { backgroundColor: theme.colors.background }]}>
//       <View>
//         <Text style={styles.headerText}>{scene.route.name + 2}</Text>
//       </View>
//     </View>
//   );
// };

const defaultProfilePicture = require('../assets/img/profile.png');
// const searchIcon = require("./local-assets/search.png");
// const bagIcon = require("./local-assets/shopping-bag.png");
// const notificationIcon = require("./local-assets/notification.png");

export interface ISource {
  source: string | { uri: string };
}

export interface HeaderProps {}

export const Header: React.FC<StackHeaderProps> = ({ scene, navigation }) => {
  const theme = useTheme();
  const { state, dispatch } = useUser();

  const routeTitle = useMemo(
    () => scene.descriptor.options.title ?? scene.route.name,
    [scene.descriptor.options.title, scene.route.name],
  );

  const renderLeftAlignedComponent = useCallback(() => {
    return (
      <View style={styles.leftAlignedContainer}>
        {navigation.canGoBack() && (
          <RNBounceable
            bounceEffect={0.8}
            bounceFriction={2}
            onPress={() => navigation.goBack()}>
            <ThemeIcon name="arrow-left" color={theme.colors.text} size={18} />
          </RNBounceable>
        )}
        <View style={styles.titleContainer}>
          <ThemeText style={styles.titleTextStyle}>{routeTitle}</ThemeText>
        </View>
      </View>
    );
  }, [navigation, theme.colors.text, routeTitle]);

  const renderHeaderIcon = (screen: string, icon: string, size?: number) => {
    return (
      <View style={styles.iconButtonContainer}>
        <RNBounceable
          bounceEffect={0.8}
          bounceFriction={2}
          onPress={() => navigation.navigate('External', { screen: screen })}>
          {state.user &&
          icon === 'envelope' &&
          state.user?.unreadMessages > 0 ? (
            <ThemeIcon
              name="envelope-letter"
              size={20}
              color={theme.colors.text}
            />
          ) : (
            <ThemeIcon
              name={icon}
              size={size ?? 20}
              color={theme.colors.text}
            />
          )}
        </RNBounceable>
      </View>
    );
  };

  const renderProfilePicture = () => {
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
        <MenuTrigger>
          <View style={styles.profileImageContainer}>
            <Image
              source={
                userImage
                  ? {
                      uri: userImage,
                    }
                  : defaultProfilePicture
              }
              style={styles.profileImageStyle}
            />

            <ThemeText style={styles.profileNameText}>
              {state.user?.name}
            </ThemeText>
          </View>
        </MenuTrigger>
        <MenuOptions
          customStyles={{
            optionsWrapper: { width: 200, backgroundColor: theme.colors.cards },
          }}>
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
  };

  const renderRightAlignedComponent = () => {
    return state.user ? (
      <View style={styles.rightAlignedContainer}>
        {renderHeaderIcon('ProfileSettings', 'user', 18)}
        {renderHeaderIcon('Messages', 'envelope')}
        {renderProfilePicture()}
      </View>
    ) : (
      <RNBounceable onPress={() => auth(dispatch)}>
        <View
          style={{
            flexDirection: 'row',
            justifyContent: 'center',
            alignItems: 'center',
          }}>
          <ThemeText style={{ fontSize: 10 }}>Login</ThemeText>
          <ThemeIcon name={'login'} size={20} color={theme.colors.text} />
        </View>
      </RNBounceable>
    );
  };

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
    justifyContent: 'center',
  },
  leftAlignedButtonImageStyle: {
    height: 25,
    width: 25,
  },
  titleContainer: {
    marginLeft: 16,
  },
  titleTextStyle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  rightAlignedContainer: {
    marginLeft: 'auto',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButtonContainer: {
    marginRight: 24,
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
