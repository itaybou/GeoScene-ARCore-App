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
  style?: StyleProp<ViewStyle>;
}

export const ThemeButton: React.FC<ThemeButtonProps> = ({
  text,
  icon,
  style,
  onPress,
  disabled = false,
}) => {
  const theme = useTheme();
  return (
    <TouchableHighlight
      style={[
        styles.button,
        style,
        { backgroundColor: theme.colors.accent_secondary },
      ]}
      disabled={disabled}
      onPress={onPress}
      underlayColor={theme.colors.accent_secondary_dark}
      activeOpacity={0.2}>
      <View
        style={[
          styles.buttonInner,
          {
            backgroundColor: theme.colors.accent_secondary_bright,
          },
        ]}>
        {icon && <ThemeIcon name={icon} size={18} color={'black'} />}
        {text && <Text style={icon && styles.textMargin}>{text}</Text>}
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
  buttonInner: {
    flexDirection: 'row',
    paddingHorizontal: 18,
    paddingVertical: 4,
    borderRadius: 8,
  },
  textMargin: { marginStart: 4 },
});
