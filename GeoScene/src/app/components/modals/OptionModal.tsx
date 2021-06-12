import { ActivityIndicator, StyleSheet, View } from 'react-native';
import React, { useEffect } from 'react';

import Modal from 'react-native-modal';
import { ThemeButton } from '../input/ThemeButton';
import { ThemeIcon } from '../assets/ThemeIcon';
import { ThemeText } from '../text/ThemeText';
import { useTheme } from '../../utils/hooks/Hooks';

interface OptionModalProps {
  text: string | null;
  isVisible: boolean;
  showOnlyOk?: boolean;
  statusBarTranslucent?: boolean;
  big?: boolean;
  onOK: () => void;
  hide: () => void;
}

export const OptionModal: React.FC<OptionModalProps> = ({
  isVisible,
  text,
  onOK,
  hide,
  statusBarTranslucent = true,
  big = true,
  showOnlyOk = false,
}) => {
  const theme = useTheme();

  return (
    <Modal
      isVisible={isVisible}
      backdropOpacity={0.5}
      statusBarTranslucent={statusBarTranslucent}
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
            flex: big ? 0.5 : 0.2,
            backgroundColor: theme.colors.tabs,
            borderColor: theme.colors.inactiveTint,
          },
        ]}>
        <View style={styles.innerContainer}>
          <ThemeText style={[styles.font]}>{text}</ThemeText>
        </View>
        <View
          style={{
            flexDirection: 'row',
            marginTop: 15,
            justifyContent: 'space-between',
          }}>
          {!showOnlyOk && (
            <ThemeButton onPress={hide} text="Cancel" icon={'dislike'} />
          )}
          {
            <ThemeButton
              onPress={() => {
                onOK();
                if (showOnlyOk) {
                  hide();
                }
              }}
              text={showOnlyOk ? 'OK' : 'Yes'}
              icon={'like'}
            />
          }
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 24,
    borderRadius: 25,
    elevation: 20,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  innerContainer: {
    width: '80%',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  activityIndicator: { marginTop: 15 },
  iconContainer: { margin: 8 },
  font: { fontSize: 15 },
});
