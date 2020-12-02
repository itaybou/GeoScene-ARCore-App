/**
 * GeoScene App starting page
 * @format
 */

// import { Button, StyleSheet, View } from 'react-native';

// import { ARGeoScene } from './native/NativeModulesBridge';
// import React from 'react';

// async function initARGeoScene(): Promise<void> {
//   const supported = await ARGeoScene.checkIfDeviceSupportAR();
//   if (supported) {
//     console.log('init');
//     ARGeoScene.navigateToExample();
//   } else {
//     console.log('hello');
//   }
// }

// export default function App() {
//   return (
//     <View style={styles.outer}>
//       <Button title="Example" onPress={initARGeoScene} />
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   outer: {
//     flex: 1,
//   },
// });

import React, { useEffect } from 'react';

import { Navigation } from './app/navigation/Navigation';
import { Providers } from './app/providers/Providers';
import { SettingsProvider } from './app/providers/SettingsProvider';

interface AppProps {}

const App: React.FC<AppProps> = ({}) => {
  useEffect(() => {
    console.log('hello');
  }, []);

  return (
    <Providers>
      <Navigation />
    </Providers>
  );
};

export default App;
