import { ThemeName, ThemeRegistry, ThemeStyle } from "../util/types";
import { darkTheme } from "./dark";
import { lightTheme } from "./light";

export class ThemeManager {
  private static _instance: ThemeManager;
  private _registry: ThemeRegistry = {
    light: lightTheme,
    dark: darkTheme,
  };

  static getInstance(): ThemeManager {
    if (!ThemeManager._instance) {
      ThemeManager._instance = new ThemeManager();
    }
    return ThemeManager._instance;
  }

  getTheme(name: ThemeName): ThemeStyle {
    const theme = this._registry[name];
    if (!theme) {
      throw new Error(`Theme '${name}' is not registered.`);
    }
    return theme;
  }

  registerTheme(name: string, theme: ThemeStyle): void {
    this._registry[name] = theme;
  }
}

export function getThemeManager(): ThemeManager {
  return ThemeManager.getInstance();
}

export function registerTheme(name: string, theme: ThemeStyle): void {
  getThemeManager().registerTheme(name, theme);
}
