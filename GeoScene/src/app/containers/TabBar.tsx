import { StyleSheet, Text, View } from 'react-native';

import React from 'react';
// import Icon from 'react-native-vector-icons/FontAwesome5';
import { useTheme } from '@react-navigation/native';

interface TabBarProps {}

export const TabBar: React.FC<TabBarProps> = ({ children }) => {
  //   const [tabIndex, setTabIndex] = useState<number>(0);
  const theme = useTheme();

  return (
    <View style={[styles.container, { backgroundColor: theme.colors.primary }]}>
      <Text>Hello</Text>
      {children}
      {/* <View>
            <Icon name='area-chart' style={grid.icon_green} />
            <Text style={grid.text_green}>{label}</Text>
         </View> */}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    overflow: 'hidden',
  },
});
