/* eslint-disable react-native/no-inline-styles */
import * as React from 'react';

import { Menu, MenuTrigger, renderers } from 'react-native-popup-menu';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { MenuItem } from '../../containers/screens/settings/SettingsScreen';
import { ThemeButton } from '../input/ThemeButton';
import { ThemeIcon } from '../assets/ThemeIcon';
import { ThemeSwitch } from '../input/ThemeSwitch';
import { ThemeText } from '../text/ThemeText';
import useTheme from '../../utils/hooks/useTheme';

interface Props {
  item: MenuItem;
  isFirstElement?: boolean;
  isLastElement?: boolean;
  border?: boolean;
  bottomText?: boolean;
  textColor?: string;
  chevron?: boolean;
}

export const SettingsListItem = ({
  item,
  isFirstElement,
  isLastElement,
  textColor,
  border = false,
  bottomText = false,
  chevron = true,
}: Props) => {
  const theme = useTheme();
  const { Popover } = renderers;

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
        border
          ? {
              borderBottomColor: theme.colors.cards,
              borderBottomWidth: 1,
            }
          : {},
      ]}
      activeOpacity={0.6}
      disabled={item.switch || !item.onClick || item.dropdown}
      onPress={item.onClick}>
      <View style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
        <ThemeText style={styles.title}>{item.title}</ThemeText>
        {bottomText && (
          <ThemeText style={styles.bottomText}>{item.additionalText}</ThemeText>
        )}
      </View>

      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'flex-end',
        }}>
        <View>
          {!item.switch && !item.dropdown && (
            <View
              style={{
                flexDirection: 'row',
                alignItems: 'center',
              }}>
              {item.sideComponent}
              {item.additionalText && (
                <ThemeText
                  style={{
                    marginEnd: 10,
                    fontSize: 12,
                    color: textColor ?? theme.colors.text,
                  }}>
                  {item.additionalText}
                </ThemeText>
              )}
              {chevron && (
                <ThemeIcon
                  name="arrow-right"
                  color={theme.colors.inactiveTint}
                  size={15}
                />
              )}
            </View>
          )}
          {item.switch && (
            <ThemeSwitch
              active={item.switchActive}
              onValueChange={item.onClick}
            />
          )}
          {item.dropdown && (
            <Menu
              renderer={Popover}
              rendererProps={{
                placement: 'bottom',
                preferredPlacement: 'bottom',
                anchorStyle: { backgroundColor: theme.colors.cards },
              }}>
              <MenuTrigger
                customStyles={{ TriggerTouchableComponent: TouchableOpacity }}>
                <ThemeButton
                  text={item.additionalText}
                  selected={true}
                  onPress={() => null}
                  cancelPress={true}
                  lean={true}
                />
              </MenuTrigger>
              {item.dropdownOptions}
            </Menu>
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
  bottomText: {
    fontSize: 10,
  },
});
