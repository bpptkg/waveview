import en_US from "../i18n/en_US";

export interface Locale {
  time: {
    month: string[];
    monthAbbr: string[];
    dayOfWeek: string[];
    dayOfWeekAbbr: string[];
  };
}

export function getDefaultLocale(): Locale {
  return en_US;
}

export function getLocale(lang: string): Locale {
  switch (lang) {
    case "en_US":
      return en_US;
    default:
      return en_US;
  }
}
