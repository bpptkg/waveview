export type Theme = 'light' | 'dark' | 'system';

export type AppStore = {
  darkMode: boolean;
  theme: Theme;
  toggleTheme: (theme: Theme) => void;
};
