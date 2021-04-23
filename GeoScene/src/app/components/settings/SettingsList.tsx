import * as React from 'react';

import { SectionList, StyleSheet, View } from 'react-native';

import {
  MenuItem,
  SectionData,
} from '../../containers/screens/settings/SettingsScreen';
import useTheme from '../../utils/hooks/useTheme';
import { SettingsListItem } from './SettingsListItem';
import { SettingsListSectionHeader } from './SettingsListSectionHeader';

interface SettingsListProps {
  settingsData: SectionData;
}

export const SettingsList: React.FC<SettingsListProps> = ({ settingsData }) => {
  const theme = useTheme();

  return (
    <SectionList
      sections={settingsData}
      style={styles.list}
      showsVerticalScrollIndicator={false}
      bounces={false}
      onEndReachedThreshold={0.5}
      ItemSeparatorComponent={() => <View style={styles.seperator} />}
      keyExtractor={(it) => it.title}
      renderItem={(props) => {
        const isFirstElement = props.index === 0;
        const isLastElement = props.index === props.section.data.length - 1;

        return (
          <SettingsListItem
            item={props.item}
            isFirstElement={isFirstElement}
            isLastElement={isLastElement}
          />
        );
      }}
      renderSectionHeader={({
        section: { index, title, showHeader, icon },
      }) => (
        <SettingsListSectionHeader
          icon={showHeader ? icon && icon(theme.colors.text) : null}
          paddingTop={index !== 0}
          showHeader={showHeader}
          title={title}
        />
      )}
    />
  );
};

const styles = StyleSheet.create({
  list: {
    flex: 1,
    width: '100%',
    marginTop: 0,
  },
  seperator: {
    height: 1,
    width: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.05)',
  },
});
