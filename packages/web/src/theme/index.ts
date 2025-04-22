import { Theme, webDarkTheme, webLightTheme } from '@fluentui/react-components';

export interface CustomTheme {
  defaultDark: Theme;
  defaultLight: Theme;
}

export const themes: CustomTheme = {
  defaultDark: webDarkTheme,
  defaultLight: webLightTheme,
};
