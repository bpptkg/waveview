import { Theme } from '@fluentui/react-components';
import vepsDarkTheme from './veps/dark.json';
import vepsLightTheme from './veps/light.json';

export interface CustomTheme {
  defaultDark: Theme;
  defaultLight: Theme;
}

export const themes: CustomTheme = {
  defaultDark: vepsDarkTheme,
  defaultLight: vepsLightTheme,
};
