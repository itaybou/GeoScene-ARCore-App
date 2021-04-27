import { BottomModal } from '../BottomModal';
import { Checkbox } from 'react-native-paper';
import React from 'react';
import { ThemeText } from '../../text/ThemeText';
import { View } from 'react-native';
import { useState } from 'react';
import useTheme from '../../../utils/hooks/useTheme';

interface LocationTypesModalProps {
  isVisible: boolean;
  title: string;
  hide: () => void;
  onButtonPress: (value: any) => void;
}

const test = {
  city: 'Cities',
  town: 'Towns',
  peak: 'Mountain',
  forest: 'Forest',
};

export const LocationTypesModal: React.FC<LocationTypesModalProps> = ({
  isVisible,
  hide,
  title,
  onButtonPress,
}) => {
  const theme = useTheme();
  const [checked, setChecked] = useState<string[]>(Object.keys(test));

  console.log(checked);
  return (
    <BottomModal
      title={title}
      showButtonIcon={true}
      isVisible={isVisible}
      hide={hide}
      onButtonPress={() => {
        onButtonPress(checked);
        hide();
      }}>
      <View style={{ paddingVertical: 4 }}>
        {Object.keys(test).map((k) => (
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Checkbox
              color={theme.colors.accent_secondary}
              uncheckedColor={theme.colors.inactiveTint}
              status={checked.includes(k) ? 'checked' : 'unchecked'}
              onPress={() => {
                setChecked(
                  checked.includes(k)
                    ? checked.filter((i) => i !== k)
                    : [...checked, k],
                );
              }}
            />
            <ThemeText>{k}</ThemeText>
          </View>
        ))}
      </View>
    </BottomModal>
  );
};
