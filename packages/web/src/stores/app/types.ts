export type Theme = 'light' | 'dark' | 'system';

export interface LanguageItem {
  value: string;
  label: string;
}

export type AppStore = {
  darkMode: boolean;
  theme: Theme;
  currentLanguage: LanguageItem;
  supportedLanguages: LanguageItem[];
  useUTC: boolean;
  timeZone: string;
  isActivityBarVisible: boolean;
  isFullScreen: boolean;
  toggleTheme: (theme: Theme) => void;
  setLanguage: (language: LanguageItem) => void;
  setUseUTC: (useUTC: boolean) => void;
  toggleActivityBar: () => void;
  toggleFullScreen: () => void;
};
