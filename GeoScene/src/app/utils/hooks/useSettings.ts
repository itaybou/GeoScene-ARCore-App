import { SettingsContext } from '../../providers/SettingsProvider';
import { useContext } from 'react';

const useSettings = () => {
  const settingsContext = useContext(SettingsContext);
  return settingsContext;
};

export default useSettings;
