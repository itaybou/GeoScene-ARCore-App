import React from 'react';
import Slider from 'react-native-slider';
import { useTheme } from '../../utils/hooks/Hooks';

interface ThemeSliderProps {
  value: number;
  step: number;
  range: { min: number; max: number };
  onValueChange: (value: number) => void;
}

export const ThemeSlider: React.FC<ThemeSliderProps> = ({
  value,
  step,
  range,
  onValueChange,
}) => {
  const theme = useTheme();
  return (
    <Slider
      value={value}
      step={step}
      minimumValue={range.min}
      maximumValue={range.max}
      thumbTintColor={theme.colors.accent_secondary}
      minimumTrackTintColor={theme.colors.accent_secondary_dark}
      onValueChange={onValueChange}
    />
  );
};
