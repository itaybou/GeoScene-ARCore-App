/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * Generated with the TypeScript template
 * https://github.com/react-native-community/react-native-template-typescript
 *
 * @format
 */

import { Button, StyleSheet, View } from 'react-native';
import React, { ReactElement } from 'react';

import { ARGeoScene } from './NativeModulesBridge';

async function initARGeoScene(): Promise<void> {
  const supported = await ARGeoScene.checkIfDeviceSupportAR();
  if (supported) {
    console.log('init');
    ARGeoScene.navigateToExample();
  } else {
    console.log('hello');
  }
}

function App(): ReactElement {
  return (
    <View style={styles.outer}>
      <Button title="Example" onPress={initARGeoScene} />
    </View>
  );
}

const styles = StyleSheet.create({
  outer: {
    flex: 1,
  },
});

export default App;
