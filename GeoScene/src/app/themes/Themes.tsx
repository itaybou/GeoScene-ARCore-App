export interface Theme {
  colors: {
    primary: string;
    accent: string;
    accent_bright: string;
    background: string;
    accent_secondary: string;
    accent_secondary_bright: string;
    accent_secondary_dark: string;
    cards: string;
    border: string;
    inactiveTint: string;
    text: string;
    tabs: string;
    tabs_secondary: string;
  };
}

// const bottomTabStyle = {
//   allowFontScaling: true,
//   labelStyle: { fontSize: 16, paddingTop: 5 },
//   tabStyle: { paddingTop: 5 },
//   style: { height: 60 },
// };

// export enum ThemeType {
//   LIGHT,
//   DARK,
// }

export const Themes: Readonly<{ dark: Theme; light: Theme }> = Object.freeze({
  dark: {
    colors: {
      primary: '#94CF51',
      background: '#121212',
      accent: '#94CF51',
      accent_bright: '#c2e49b',
      accent_secondary: '#2CA59C',
      accent_secondary_bright: '#30aba3',
      accent_secondary_dark: '#227773',
      cards: '#1E1E1E',
      tabs: '#272727',
      tabs_secondary: '#404040',
      border: '#313131',
      inactiveTint: '#999999',
      text: '#ffffff',
    },
  },
  light: {
    colors: {
      primary: '#94CF51',
      background: '#f1f1f1',
      accent: '#94CF51',
      accent_bright: '#c2e49b',
      accent_secondary: '#2CA59C',
      accent_secondary_bright: '#30aba3',
      accent_secondary_dark: '#227773',
      cards: '#f5f5f5',
      tabs: '#ffffff',
      tabs_secondary: '#e6e6e6',
      border: '#f9f9f9',
      inactiveTint: '#777777',
      text: '#000000',
    },
  },
});

export type ThemesType = keyof typeof Themes;
