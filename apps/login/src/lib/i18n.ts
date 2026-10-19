export interface Lang {
  name: string;
  code: string;
}

// GoVeggie ships English and Chinese only. Other locale files stay in the repo but are not offered.
export const LANGS: Lang[] = [
  {
    name: "English",
    code: "en",
  },
  {
    name: "简体中文",
    code: "zh",
  },
];

export const LANGUAGE_COOKIE_NAME = "NEXT_LOCALE";
export const LANGUAGE_HEADER_NAME = "accept-language";

export function shouldUILocalesOverrideCookie(): boolean {
  return process.env.ZITADEL_UI_LOCALES_OVERRIDE_COOKIE === "true";
}

export function getLanguage(code: string): Lang {
  const lang = LANGS.find((l) => l.code === code);
  if (lang) {
    return lang;
  }

  return {
    code,
    name: new Intl.DisplayNames([code], { type: "language" }).of(code) || code,
  };
}
