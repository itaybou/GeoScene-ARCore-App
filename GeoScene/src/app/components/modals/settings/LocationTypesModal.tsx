import { FlatList, LogBox, View } from 'react-native';
import React, { useEffect, useMemo } from 'react';

import { BottomModal } from '../BottomModal';
import { Checkbox } from 'react-native-paper';
import { PageCard } from '../../layout/PageCard';
import { ScrollView } from 'react-native-gesture-handler';
import { SettingsActionTypes } from '../../../providers/reducers/SettingsReducer';
import { ThemeButton } from '../../input/ThemeButton';
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

  const placeTypes = useMemo(() => {
    return { place: 'Places', natural: 'Natural', historic: 'Historic' };
  }, []);

  const [currentCategory, setCurrentCategory] = useState<
    keyof typeof placeTypes
  >('place');

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
      screenPercent={0.7}
      hide={hide}
      onButtonPress={() => {
        hide();
      }}>
      <ScrollView>
        <View
          style={{
            paddingHorizontal: 8,
            paddingTop: 16,
            flexDirection: 'row',
            justifyContent: 'space-between',
          }}>
          <ThemeButton
            text={placeTypes['place']}
            onPress={() => setCurrentCategory('place')}
          />
          <ThemeButton
            text={placeTypes['natural']}
            onPress={() => setCurrentCategory('natural')}
          />
          <ThemeButton
            text={placeTypes['historic']}
            onPress={() => setCurrentCategory('historic')}
          />
        </View>
        <PageCard background={theme.colors.tabs} disablePadding={false}>
          <ThemeText style={{ fontSize: 15, fontWeight: 'bold' }}>
            {placeTypes[currentCategory]}
          </ThemeText>
          <View style={{ paddingVertical: 0, flexDirection: 'column' }}>
            {Object.keys(state.placeTypes[currentCategory]).map((item) => (
              <View
                key={item}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                }}>
                <Checkbox
                  color={theme.colors.accent_secondary}
                  uncheckedColor={theme.colors.inactiveTint}
                  status={
                    Object.keys(state.placeTypes[currentCategory])
                      .filter((k) => state.placeTypes[currentCategory][k].on)
                      .includes(item)
                      ? 'checked'
                      : 'unchecked'
                  }
                  onPress={() => {
                    dispatch({
                      type: SettingsActionTypes.CHANGE_PLACE_TYPES,
                      payload: {
                        category: currentCategory,
                        placeType: item,
                        value: !state.placeTypes[currentCategory][item].on,
                      },
                    });
                  }}
                />
                <ThemeText>
                  {state.placeTypes[currentCategory][item].name}
                </ThemeText>
              </View>
            ))}
          </View>
        </PageCard>
      </ScrollView>
    </BottomModal>
  );
};
