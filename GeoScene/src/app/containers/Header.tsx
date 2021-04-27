import {
  Dimensions,
  Image,
  ImageStyle,
  StyleSheet,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';
import React, { useCallback, useMemo } from 'react';
import {
  RouteProp,
  getFocusedRouteNameFromRoute,
} from '@react-navigation/native';
import { useTheme, useUser } from '../utils/hooks/Hooks';

import { Badge } from 'react-native-elements/dist/badge/Badge';
import RNBounceable from '@freakycoder/react-native-bounceable';
import { StackHeaderProps } from '@react-navigation/stack';
import { TabBarIcon } from '../components/tabs/TabBarIcon';
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

const appLogo = require('../assets/img/logo.png');
const defaultProfilePicture = require('../assets/img/profile.png');
// const searchIcon = require("./local-assets/search.png");
// const bagIcon = require("./local-assets/shopping-bag.png");
// const notificationIcon = require("./local-assets/notification.png");

export interface ISource {
  source: string | { uri: string };
}

export interface HeaderProps {
  // // style?: any;
  // // titleText?: string;
  // // ImageComponent?: any;
  // // height?: number | string;
  // // backgroundColor?: string;
  // // disableFirstIcon?: boolean;
  // // disableSecondIcon?: boolean;
  // // disableThirdIcon?: boolean;
  // // disableLeftAlignedButton?: boolean;
  // leftButtonComponent?: React.ReactChild;
  // profileImageSource?: ISource;
  // firstIconImageSource?: ISource;
  // secondIconImageSource?: ISource;
  // thirdIconImageSource?: ISource;
  // leftAlignedButtonImageSource?: ISource;
  // onLeftButtonPress?: () => void;
  // onProfilePicPress?: () => void;
  // onFirstIconPress?: () => void;
  // onSecondIconPress?: () => void;
  // onThirdIconPress?: () => void;
}

export const Header: React.FC<StackHeaderProps> = ({ scene, navigation }) => {
  const theme = useTheme();
  const { state } = useUser();

  const routeTitle = useMemo(
    () => scene.descriptor.options.title ?? scene.route.name,
    [scene.descriptor.options.title, scene.route.name],
  );

  // const screenName = useMemo(
  //   () => getFocusedRouteNameFromRoute(scene.route) ?? 'Home',
  //   [scene.route],
  // );
  // console.log(screenName);

  const renderLeftAlignedComponent = useCallback(() => {
    return (
      <View style={styles.leftAlignedContainer}>
        {navigation.canGoBack() && (
          <RNBounceable
            bounceEffect={0.8}
            bounceFriction={2}
            onPress={() => navigation.goBack()}>
            <TabBarIcon name="arrow-left" color={theme.colors.text} size={18} />
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
            <TabBarIcon
              name="envelope-letter"
              size={20}
              color={theme.colors.text}
            />
          ) : (
            <TabBarIcon
              name={icon}
              size={size ?? 20}
              color={theme.colors.text}
            />
          )}
        </RNBounceable>
      </View>
    );
  };

  // const renderSecondIcon = () => {
  //   const {
  //     onSecondIconPress,
  //     ImageComponent = Image,
  //     disableSecondIcon = false,
  //     secondIconImageSource = bagIcon,
  //   } = this.props;

  //   return (
  //     !disableSecondIcon && (
  //       <View style={styles.iconButtonContainer}>
  //         <RNBounceable
  //           bounceEffect={0.8}
  //           bounceFriction={2}
  //           onPress={onSecondIconPress}
  //         >
  //           <ImageComponent
  //             resizeMode="contain"
  //             source={secondIconImageSource}
  //             style={styles.iconImageStyle}
  //           />
  //         </RNBounceable>
  //       </View>
  //     )
  //   );
  // };

  // const renderThirdIcon = () => {
  //   const {
  //     onThirdIconPress,
  //     ImageComponent = Image,
  //     disableThirdIcon = false,
  //     thirdIconImageSource = notificationIcon,
  //   } = this.props;
  //   return (
  //     !disableThirdIcon && (
  //       <View style={styles.iconButtonContainer}>
  //         <RNBounceable
  //           bounceEffect={0.8}
  //           bounceFriction={2}
  //           onPress={onThirdIconPress}
  //         >
  //           <ImageComponent
  //             resizeMode="contain"
  //             source={thirdIconImageSource}
  //             style={styles.iconImageStyle}
  //           />
  //         </RNBounceable>
  //       </View>
  //     )
  //   );
  // };

  const renderProfilePicture = () => {
    const userImage = state.user?.img;
    return (
      <View style={styles.profileImageContainer}>
        <RNBounceable
          onPress={() =>
            navigation.navigate('External', { screen: 'Profile' })
          }>
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
        </RNBounceable>
        <ThemeText style={styles.profileNameText}>{state.user?.name}</ThemeText>
      </View>
    );
  };

  const renderRightAlignedComponent = () => {
    return (
      <View style={styles.rightAlignedContainer}>
        {renderHeaderIcon('ProfileSettings', 'user', 18)}
        {renderHeaderIcon('Messages', 'envelope')}
        {/* // {this.renderSecondIcon()}
        // {this.renderThirdIcon()} */}
        {renderProfilePicture()}
      </View>
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
