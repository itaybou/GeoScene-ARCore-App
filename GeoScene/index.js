// @ts-nocheck
/**
 * @format
 */

import App from './src/App';
import { AppRegistry } from 'react-native';
import { name as appName } from './app.json';

console.log(App);
AppRegistry.registerComponent(appName, () => App);
