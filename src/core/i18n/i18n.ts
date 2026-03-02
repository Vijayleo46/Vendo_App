import i18next from 'i18next';
import { initReactI18next } from 'react-i18next';
import * as Localization from 'expo-localization';
import AsyncStorage from '@react-native-async-storage/async-storage';

import en from './locales/en.json';
import ml from './locales/ml.json';
import hi from './locales/hi.json';
import ta from './locales/ta.json';

const LANGUAGE_KEY = '@app_language';

const resources = {
    en: { translation: en },
    ml: { translation: ml },
    hi: { translation: hi },
    ta: { translation: ta },
};

const initI18n = async () => {
    let savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);

    if (!savedLanguage) {
        const locales = Localization.getLocales();
        savedLanguage = locales && locales.length > 0 ? locales[0].languageCode : 'en';
    }

    await i18next
        .use(initReactI18next)
        .init({
            compatibilityJSON: 'v4',
            resources,
            lng: savedLanguage || 'en',
            fallbackLng: 'en',
            interpolation: {
                escapeValue: false,
            },
        });
};

initI18n();

export default i18next;
export { LANGUAGE_KEY };
