import { useStore } from '../store/useStore';
import { translations, Translations } from './translations';
import { SupportedLanguage } from '../types';

export const useTranslation = (): {
  t: Translations;
  language: SupportedLanguage;
  setLanguage: (lang: SupportedLanguage) => void;
} => {
  const language = useStore((s) => s.language);
  const setLanguage = useStore((s) => s.setLanguage);

  return {
    t: translations[language] || translations.id,
    language,
    setLanguage,
  };
};
