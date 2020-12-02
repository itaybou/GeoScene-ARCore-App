import { Text, TextProps } from 'react-native';

import React from 'react';
import { useTheme } from '../../utils/hooks/Hooks';

export const ThemeText: React.FC<TextProps> = (props) => {
  const theme = useTheme();
  return (
    <Text {...props} style={{ color: theme.colors.text }}>
      {props.children}
    </Text>
  );
};
