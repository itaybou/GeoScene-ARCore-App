import { I18nManager } from 'react-native';
import React from 'react';
import Slider from 'react-native-slider3';
import { useTheme } from '../../utils/hooks/Hooks';

interface ThemeSliderProps {
  value: number;
  step: number;
  range: { min: number; max: number };
  onValueChange: (value: number) => void;
  disabled?: boolean;
}

export const ThemeSlider: React.FC<ThemeSliderProps> = ({
  value,
  step,
  range,
  onValueChange,
  disabled = false,
}) => {
  const theme = useTheme();
  return (
    <Slider
      inverted={I18nManager.isRTL}
      value={value}
      disabled={disabled}
      step={step}
      minimumValue={range.min}
      maximumValue={range.max}
      thumbTintColor={
        disabled ? theme.colors.error : theme.colors.accent_secondary
      }
      minimumTrackTintColor={
        disabled
          ? theme.colors.inactiveTint
          : theme.colors.accent_secondary_dark
      }
      onValueChange={onValueChange}
    />
  );
};
