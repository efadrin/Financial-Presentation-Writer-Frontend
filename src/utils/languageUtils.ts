import i18n from "@/utils/i18n";
import { LANGUAGE_MAPPING } from "@/utils/constants";

/**
 * Get the current language ID for API calls based on i18n language setting
 */
export const getCurrentLanguageId = (): string => {
  const selectedLanguage = i18n.language as keyof typeof LANGUAGE_MAPPING;
  if (!selectedLanguage || !LANGUAGE_MAPPING[selectedLanguage]) {
    return LANGUAGE_MAPPING[selectedLanguage]?.apiId || "2057"; // Default to English
  }
  return LANGUAGE_MAPPING[selectedLanguage]?.apiId || "2057"; // Default to English
};

/**
 * Get language ID from the redux settings language key
 */
export const getCurrentLanguageIdFromSettings = (
  settingsLanguage: string | undefined,
): string => {
  if (!settingsLanguage) return "2057";
  const selectedLanguage = settingsLanguage as keyof typeof LANGUAGE_MAPPING;
  if (!selectedLanguage || !LANGUAGE_MAPPING[selectedLanguage]) {
    return LANGUAGE_MAPPING[selectedLanguage]?.apiId || "2057"; // Default to English
  }
  return LANGUAGE_MAPPING[selectedLanguage]?.apiId || "2057"; // Default to English
};

/**
 * Get language ID from a language key string
 */
export const getLanguageIdFromKey = (languageKey: string): string => {
  return (
    LANGUAGE_MAPPING[languageKey as keyof typeof LANGUAGE_MAPPING]?.apiId ||
    "2057"
  );
};
