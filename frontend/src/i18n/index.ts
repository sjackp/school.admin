import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import ar from "./ar.json";
import en from "./en.json";

const resources = {
  ar: { translation: ar },
  en: { translation: en },
};

const savedLang = typeof window !== "undefined" ? window.localStorage.getItem("lang") : null;
const initialLang = savedLang === "en" ? "en" : "ar";

i18n.use(initReactI18next).init({
  resources,
  lng: initialLang,
  fallbackLng: "ar",
  interpolation: {
    escapeValue: false,
  },
});

export function setLanguage(lang: "ar" | "en") {
  i18n.changeLanguage(lang);
  if (typeof window !== "undefined") {
    window.localStorage.setItem("lang", lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  }
}

// Initialize dir on first load
if (typeof document !== "undefined") {
  document.documentElement.lang = initialLang;
  document.documentElement.dir = initialLang === "ar" ? "rtl" : "ltr";
}

export default i18n;


