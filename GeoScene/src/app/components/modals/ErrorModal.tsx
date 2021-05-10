import { ActivityIndicator, StyleSheet, View } from 'react-native';
import React, { useEffect } from 'react';

import Modal from 'react-native-modal';
import { ThemeButton } from '../input/ThemeButton';
import { ThemeIcon } from '../assets/ThemeIcon';
import { ThemeText } from '../text/ThemeText';
import { useTheme } from '../../utils/hooks/Hooks';

const SHOW_TIMEOUT_SEC = 2;

interface ErrorModalProps {
  text: string | null;
  isVisible: boolean;
  hide: () => void;
}

export const ErrorModal: React.FC<ErrorModalProps> = ({
  isVisible,
  text,
  hide,
}) => {
  const theme = useTheme();

  return (
    <Modal
      isVisible={isVisible}
      backdropOpacity={0.5}
      animationIn="zoomInDown"
      animationOut="zoomOutUp"
      animationInTiming={400}
      animationOutTiming={400}
      backdropTransitionInTiming={400}
      backdropTransitionOutTiming={400}>
      <View
        style={[
          styles.container,
          {
            backgroundColor: theme.colors.tabs,
            borderColor: theme.colors.inactiveTint,
          },
        ]}>
        <View style={styles.innerContainer}>
          <View style={styles.iconContainer}>
            <ThemeIcon name="info" color={theme.colors.error} size={16} />
          </View>
          <ThemeText style={[styles.font, { color: theme.colors.error }]}>
            {text ?? 'Error occured.'}
          </ThemeText>
        </View>
        <ThemeButton onPress={hide} text="OK" />
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 0.2,
    padding: 24,
    borderRadius: 25,
    elevation: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  activityIndicator: { marginTop: 15 },
  iconContainer: { margin: 8 },
  font: { fontSize: 15 },
});
