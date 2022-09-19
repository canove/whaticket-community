import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from 'react-i18next'

import { messages } from "./languages";

const i18nConfig = {
	debug: false,
	defaultNS: ["translations"],
	fallbackLng: "en",
	ns: ["translations"],
	resources: messages,
}

i18n
	.use(LanguageDetector)
	.use(initReactI18next)
	.init(i18nConfig)

export { i18n };
