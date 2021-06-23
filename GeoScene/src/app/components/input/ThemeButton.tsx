import React, { useCallback, useRef } from 'react';
import {
  StyleProp,
  StyleSheet,
  Text,
  TouchableHighlight,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

import { ThemeIcon } from '../assets/ThemeIcon';
import useTheme from '../../utils/hooks/useTheme';

interface ThemeButtonProps {
  onPress: () => void;
  text?: string;
  icon?: string;
  disabled?: boolean;
  cancelPress?: boolean;
  lean?: boolean;
  style?: StyleProp<ViewStyle>;
  supportRTL?: boolean;
  selected?: boolean;
}

export const ThemeButton: React.FC<ThemeButtonProps> = ({
  text,
  icon,
  style,
  onPress,
  selected = false,
  lean = false,
  disabled = false,
  supportRTL = true,
  cancelPress = false,
}) => {
  const theme = useTheme();
  return (
    <TouchableHighlight
      style={[
        lean ? styles.buttonLean : styles.button,
        style,
        {
          backgroundColor: disabled
            ? theme.colors.inactiveTint
            : selected
            ? theme.colors.accent_bright
            : theme.colors.accent_secondary,
        },
      ]}
      disabled={disabled || cancelPress}
      onPress={onPress}
      underlayColor={theme.colors.accent_secondary_dark}
      activeOpacity={0.2}>
      <View
        style={[
          lean ? styles.buttonInnerLean : styles.buttonInner,
          {
            backgroundColor: disabled
              ? theme.colors.inactiveTint
              : selected
              ? theme.colors.accent
              : theme.colors.accent_secondary_bright,
          },
        ]}>
        {icon && (
          <ThemeIcon
            name={icon}
            size={18}
            color={'black'}
            supportRTL={supportRTL}
          />
        )}
        {text && (
          <Text style={icon && [styles.textMargin, lean && styles.textLean]}>
            {text}
          </Text>
        )}
      </View>
    </TouchableHighlight>
  );
};

const styles = StyleSheet.create({
  button: {
    margin: 2,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 3,
    paddingVertical: 3,
    borderRadius: 8,
    elevation: 2,
  },
  buttonLean: {
    margin: 2,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 2,
    paddingVertical: 0,
    borderRadius: 8,
    elevation: 2,
  },
  buttonInner: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 18,
    paddingVertical: 4,
    borderRadius: 8,
  },
  buttonInnerLean: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 2,
    borderRadius: 8,
  },
  textMargin: { marginStart: 4 },
  textLean: { fontSize: 12 },
});
