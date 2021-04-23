/* eslint-disable react-native/no-inline-styles */
import * as React from 'react';

import {
  StyleSheet,
  View,
  Alert,
  Switch,
  TouchableOpacity,
} from 'react-native';

import { MenuItem } from '../../containers/screens/settings/SettingsScreen';
import { ThemeText } from '../text/ThemeText';
import useTheme from '../../utils/hooks/useTheme';
import { TabBarIcon } from '../tabs/TabBarIcon';
import { ThemeSwitch } from '../input/ThemeSwitch';

interface Props {
  item: MenuItem;
  isFirstElement?: boolean;
  isLastElement?: boolean;
}

export const SettingsListItem = ({
  item,
  isFirstElement,
  isLastElement,
}: Props) => {
  const theme = useTheme();

  console.log(item.switchActive);

  return (
    <TouchableOpacity
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.tabs,
          borderTopLeftRadius: isFirstElement ? 16 : 0,
          borderTopRightRadius: isFirstElement ? 16 : 0,
          borderBottomLeftRadius: isLastElement ? 16 : 0,
          borderBottomRightRadius: isLastElement ? 16 : 0,
        },
      ]}
      activeOpacity={0.6}
      disabled={item.switch}
      onPress={item.onClick}>
      <ThemeText style={styles.title}>{item.title}</ThemeText>

      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'flex-end',
        }}>
        <View>
          {!item.switch && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              {item.sideComponent}
              {item.additionalText && (
                <ThemeText style={{ marginEnd: 10, fontSize: 12 }}>
                  {item.additionalText}
                </ThemeText>
              )}
              <TabBarIcon
                name="arrow-right"
                color={theme.colors.inactiveTint}
                size={15}
              />
            </View>
          )}
          {item.switch && (
            <ThemeSwitch
              active={item.switchActive}
              onValueChange={item.onClick}
            />
          )}
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
  },

  title: {
    fontSize: 15,
  },
});
