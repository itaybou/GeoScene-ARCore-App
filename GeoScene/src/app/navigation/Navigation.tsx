import React from 'react';
import { TabRoutes } from './TabRoutes';

interface NavigationProps {}

export const Navigation: React.FC<NavigationProps> = ({ children }) => {
  return <TabRoutes>{children}</TabRoutes>;
};
