import { Button, Dimensions, StatusBar, StyleSheet, View } from 'react-native';
import React, { useEffect, useMemo } from 'react';

import Modal from 'react-native-modal';
import { ThemeButton } from '../input/ThemeButton';
import { ThemeIcon } from '../assets/ThemeIcon';
import { ThemeText } from '../text/ThemeText';
import useTheme from '../../utils/hooks/useTheme';

interface BottomModalProps {
  isVisible: boolean;
  onModalHide?: () => void;
  hide: () => void;
  title?: string;
  buttonText?: string;
  onButtonPress: () => void;
  screenPercent?: number;
  backdropOpacity?: number;
  buttonIcon?: string;
  showButtonIcon: boolean;
  hideStatusBar?: boolean;
  enableSwipeDown?: boolean;
}

export const BottomModal: React.FC<BottomModalProps> = ({
  children,
  isVisible,
  hide,
  onModalHide,
  buttonText,
  showButtonIcon,
  title,
  onButtonPress,
  screenPercent = 0.55,
  backdropOpacity = 0.5,
  enableSwipeDown = true,
  buttonIcon = 'like',
}) => {
  const theme = useTheme();

  return (
    <View>
      <Modal
        isVisible={isVisible}
        backdropOpacity={backdropOpacity}
        onModalHide={onModalHide}
        onBackdropPress={hide}
        onSwipeComplete={hide}
        swipeDirection={enableSwipeDown ? ['down'] : []}
        style={styles.container}>
        <View
          style={[
            styles.innerContainer,
            {
              backgroundColor: theme.colors.cards,
              flex: screenPercent,
            },
          ]}>
          {enableSwipeDown && (
            <View
              style={[
                styles.arrowIndicatorContainer,
                {
                  backgroundColor: theme.colors.tabs_secondary,
                  left: Dimensions.get('window').width / 2 - 20,
                },
              ]}>
              <ThemeIcon
                name="arrow-down"
                color={theme.colors.text}
                size={12}
              />
            </View>
          )}
          <View style={styles.innerPaddingContainer}>
            <View style={styles.titleContainer}>
              <ThemeText style={styles.title}>{title}</ThemeText>
              <ThemeButton
                onPress={onButtonPress}
                icon={showButtonIcon && buttonIcon}
                text={buttonText}
              />
            </View>
            {children}
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  innerContainer: {
    flex: 1,
    flexDirection: 'column',
    borderTopRightRadius: 25,
    borderTopLeftRadius: 25,
    position: 'relative',
  },
  innerPaddingContainer: { flex: 1, padding: 12 },
  arrowIndicatorContainer: {
    position: 'absolute',
    alignItems: 'center',
    justifyContent: 'flex-start',
    width: '10%',
    borderBottomEndRadius: 15,
    borderBottomStartRadius: 15,
  },
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 12,
    marginTop: 4,
  },
  title: { fontWeight: 'bold', fontSize: 18 },
});
