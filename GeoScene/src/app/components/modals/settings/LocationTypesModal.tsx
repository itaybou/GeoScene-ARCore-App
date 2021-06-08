import { FlatList, LogBox, View } from 'react-native';
import React, { useEffect } from 'react';

import { BottomModal } from '../BottomModal';
import { Checkbox } from 'react-native-paper';
import { PageCard } from '../../layout/PageCard';
import { ScrollView } from 'react-native-gesture-handler';
import { SettingsActionTypes } from '../../../providers/reducers/SettingsReducer';
import { ThemeText } from '../../text/ThemeText';
import useSettings from '../../../utils/hooks/useSettings';
import { useState } from 'react';
import useTheme from '../../../utils/hooks/useTheme';

interface LocationTypesModalProps {
  isVisible: boolean;
  title: string;
  hide: () => void;
}

export const LocationTypesModal: React.FC<LocationTypesModalProps> = ({
  isVisible,
  hide,
  title,
}) => {
  const theme = useTheme();
  const { state, dispatch } = useSettings();
  const { placeTypes } = state;

  useEffect(
    () => LogBox.ignoreLogs(['VirtualizedLists should never be nested']),
    [],
  );

  return (
    <BottomModal
      title={title}
      enableSwipeDown={false}
      showButtonIcon={true}
      isVisible={isVisible}
      screenPercent={0.75}
      hide={hide}
      onButtonPress={() => {
        hide();
      }}>
      <ScrollView>
        <PageCard background={theme.colors.tabs} disablePadding={false}>
          <ThemeText style={{ fontSize: 15, fontWeight: 'bold' }}>
            Places
          </ThemeText>
          <View style={{ paddingVertical: 0 }}>
            <FlatList
              columnWrapperStyle={{
                justifyContent: 'space-around',
              }}
              data={Object.keys(placeTypes['place'])}
              numColumns={3}
              keyExtractor={(item) => item}
              renderItem={({ item }) => {
                return (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}>
                    <Checkbox
                      color={theme.colors.accent_secondary}
                      uncheckedColor={theme.colors.inactiveTint}
                      status={
                        Object.keys(state.placeTypes['place'])
                          .filter((k) => state.placeTypes['place'][k].on)
                          .includes(item)
                          ? 'checked'
                          : 'unchecked'
                      }
                      onPress={() => {
                        state.placeTypes['place'][item].on = !state.placeTypes[
                          'place'
                        ][item].on;
                        dispatch({
                          type: SettingsActionTypes.CHANGE_PLACE_TYPES,
                          payload: {
                            placeTypes: state.placeTypes,
                          },
                        });
                      }}
                    />
                    <ThemeText>{placeTypes['place'][item].name}</ThemeText>
                  </View>
                );
              }}
            />
          </View>
        </PageCard>
        <PageCard background={theme.colors.tabs} disablePadding={false}>
          <ThemeText style={{ fontSize: 15, fontWeight: 'bold' }}>
            Natural
          </ThemeText>
          <View style={{ paddingVertical: 0 }}>
            <FlatList
              columnWrapperStyle={{
                justifyContent: 'space-around',
              }}
              data={Object.keys(placeTypes['natural'])}
              numColumns={3}
              keyExtractor={(item) => item}
              renderItem={({ item }) => {
                return (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}>
                    <Checkbox
                      color={theme.colors.accent_secondary}
                      uncheckedColor={theme.colors.inactiveTint}
                      status={
                        Object.keys(state.placeTypes['natural'])
                          .filter((k) => state.placeTypes['natural'][k].on)
                          .includes(item)
                          ? 'checked'
                          : 'unchecked'
                      }
                      onPress={() => {
                        state.placeTypes['natural'][item].on = !state
                          .placeTypes['natural'][item].on;
                        dispatch({
                          type: SettingsActionTypes.CHANGE_PLACE_TYPES,
                          payload: {
                            placeTypes: state.placeTypes,
                          },
                        });
                      }}
                    />
                    <ThemeText>{placeTypes['natural'][item].name}</ThemeText>
                  </View>
                );
              }}
            />
          </View>
        </PageCard>
        <PageCard background={theme.colors.tabs} disablePadding={false}>
          <ThemeText style={{ fontSize: 15, fontWeight: 'bold' }}>
            Historic
          </ThemeText>
          <View style={{ paddingVertical: 0 }}>
            <FlatList
              columnWrapperStyle={{
                justifyContent: 'space-around',
              }}
              data={Object.keys(placeTypes['historic'])}
              numColumns={2}
              keyExtractor={(item) => item}
              renderItem={({ item }) => {
                return (
                  <View
                    style={{
                      flexDirection: 'row',
                      alignItems: 'center',
                    }}>
                    <Checkbox
                      color={theme.colors.accent_secondary}
                      uncheckedColor={theme.colors.inactiveTint}
                      status={
                        Object.keys(state.placeTypes['historic'])
                          .filter((k) => state.placeTypes['historic'][k].on)
                          .includes(item)
                          ? 'checked'
                          : 'unchecked'
                      }
                      onPress={() => {
                        state.placeTypes['historic'][item].on = !state
                          .placeTypes['historic'][item].on;
                        dispatch({
                          type: SettingsActionTypes.CHANGE_PLACE_TYPES,
                          payload: {
                            placeTypes: state.placeTypes,
                          },
                        });
                      }}
                    />
                    <ThemeText>{placeTypes['historic'][item].name}</ThemeText>
                  </View>
                );
              }}
            />
          </View>
        </PageCard>
      </ScrollView>
    </BottomModal>
  );
};
