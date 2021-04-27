import { ActivityIndicator, StyleSheet, View } from 'react-native';

import Modal from 'react-native-modal';
import React from 'react';
import { ThemeText } from '../text/ThemeText';
import { useTheme } from '../../utils/hooks/Hooks';

interface LoadingModalProps {
  text: string;
  isVisible: boolean;
}

export const LoadingModal: React.FC<LoadingModalProps> = ({
  isVisible,
  text,
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
        <ThemeText>{text}</ThemeText>
        <ActivityIndicator
          style={styles.activityIndicator}
          color={theme.colors.accent}
          size="large"
        />
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
  activityIndicator: { marginTop: 15 },
});
