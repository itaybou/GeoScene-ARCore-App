/**
 * GeoScene App starting page
 * @format
 */

import { Navigation } from './app/navigation/Navigation';
import { Providers } from './app/providers/Providers';
import React from 'react';

interface AppProps {}

const App: React.FC<AppProps> = ({}) => {
  return (
    <Providers>
      <Navigation />
    </Providers>
  );
};

export default App;
