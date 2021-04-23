import { Button, Dimensions, StyleSheet, View } from 'react-native';
import React, { useMemo } from 'react';

import Modal from 'react-native-modal';
import { TabBarIcon } from '../tabs/TabBarIcon';
import { ThemeButton } from '../input/ThemeButton';
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
  showButtonIcon: boolean;
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
}) => {
  const theme = useTheme();

  return (
    <View>
      <Modal
        isVisible={isVisible}
        backdropOpacity={0.5}
        onModalHide={onModalHide}
        onBackdropPress={hide}
        onSwipeComplete={hide}
        swipeDirection={['down']}
        style={styles.container}>
        <View
          style={[
            styles.innerContainer,
            {
              backgroundColor: theme.colors.cards,
              flex: screenPercent,
            },
          ]}>
          <View
            style={[
              styles.arrowIndicatorContainer,
              {
                backgroundColor: theme.colors.tabs_secondary,
                left: Dimensions.get('window').width / 2 - 20,
              },
            ]}>
            <TabBarIcon name="arrow-down" color={theme.colors.text} size={12} />
          </View>
          <View style={styles.innerPaddingContainer}>
            <View style={styles.titleContainer}>
              <ThemeText style={styles.title}>{title}</ThemeText>
              <ThemeButton
                onPress={onButtonPress}
                icon={showButtonIcon && 'like'}
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
