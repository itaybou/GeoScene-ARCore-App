import React from 'react';
import { StyleSheet } from 'react-native';
import { TextInput } from 'react-native-paper';
import { ThemeText } from '../text/ThemeText';
import { View } from 'react-native';
import useTheme from '../../utils/hooks/useTheme';

interface ThemeTextInputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  error?: boolean;
  errorMessage?: string;
  multiline?: boolean;
}

export const ThemeTextInput: React.FC<ThemeTextInputProps> = ({
  label,
  value,
  onChangeText,
  error,
  errorMessage,
  multiline = false,
}) => {
  const theme = useTheme();

  return (
    <View style={styles.container}>
      <TextInput
        mode="outlined"
        label={label}
        theme={{
          colors: {
            text: theme.colors.text,
            primary: theme.colors.accent_secondary_dark,
            error: theme.colors.error,
            background: theme.colors.background,
          },
        }}
        selectionColor={theme.colors.accent}
        underlineColor={theme.colors.accent}
        value={value}
        error={error}
        multiline={multiline}
        numberOfLines={multiline ? 5 : 1}
        onChangeText={onChangeText}
        textAlign="left"
      />
      {error && (
        <View
          style={[styles.errorContainer, { borderColor: theme.colors.error }]}>
          <View
            style={[
              styles.errorNotificationContainer,
              { backgroundColor: theme.colors.error },
            ]}>
            <ThemeText>ERROR</ThemeText>
          </View>
          <View style={styles.errorMessageContainer}>
            <ThemeText>{errorMessage}</ThemeText>
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 4,
  },
  errorContainer: {
    marginVertical: 2,

    flexDirection: 'row',
    width: '100%',
    borderRadius: 4,
    borderWidth: 2,
  },
  errorNotificationContainer: {
    paddingVertical: 2,
    paddingHorizontal: 4,
  },
  errorMessageContainer: { paddingVertical: 2, paddingHorizontal: 4 },
});