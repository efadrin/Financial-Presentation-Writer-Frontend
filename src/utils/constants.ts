import { Account } from '@/services/settingSlice';

/**
 * Get the dynamic EFA workflow domain based on the account's ServerIPAddress
 */
export const getWorkflowDomain = (account: Account | null): string => {
  if (!account?.ServerIPAddress) {
    return 'https://eu.efacloud.com';
  }

  let serverIP = account.ServerIPAddress;
  if (!serverIP.startsWith('http://') && !serverIP.startsWith('https://')) {
    serverIP = 'https://' + serverIP;
  }

  serverIP = serverIP.replace(/\/+$/, '');
  return serverIP + '/EFAWebWorkflow';
};

export const BASE_API_URL =
  process.env.API_BASE_URL ||
  'https://hkg.efadrin.biz:8453/efadrin/v3.0/fdrw-api/api';

export const AuthStatusConst = {
  initial: 'initial',
  loggedIn: 'fdrw_logged_in',
  failed: 'failed',
} as const;
type AuthStatusKey = keyof typeof AuthStatusConst;
export type AuthStatus = (typeof AuthStatusConst)[AuthStatusKey];

export const DocVariables = {
  FDRW_DocID: 'FDRW_DocID',
  FDRW_Account: 'FDRW_Account',
  FDRW_SrvrID: 'FDRW_SrvrID',
  EFAAccountID: 'EFAAccountID',
  EFACorpID: 'EFACorpID',
  EFADocID: 'EFADocID',
  EFAUserID: 'EFAUserID',
  EFAAccountName: 'EFAAccountName',
  EFASrvrID: 'EFASrvrID',
  EFADocName: 'EFADocName',
  EFADocStatus: 'EFADocStatus',
  EFADRINReport: 'EFADRINReport',
};

export const ApiName = {
  AnalystCoverage: 'EFAAnalystCoverage',
  AnalystCoverageEx: 'EFAAnalystCoverageEx',
  AnalystImage: 'EFAAnalystImage',
  CorpInfo: 'EFACorpInfo',
};

export const AuthorDetails = {
  CommonTag: 'Author',
  AuthorName: 'AuthorName',
  AuthorGivenName: 'AuthorGivenName',
  AuthorMiddleName: 'AuthorMiddleName',
  AuthorFamilyName: 'AuthorFamilyName',
  AuthorLocation: 'AuthorLocation',
  AuthorEmail: 'AuthorEmail',
  AuthorPhone: 'AuthorPhone',
  AuthorJobTitle: 'AuthorJobTitle',
  AuthorImage: 'AuthorImage',
  AuthorBlankBase64:
    'iVBORw0KGgoAAAANSUhEUgAAACgAAAAoCAMAAAC7IEhfAAADAFBMVEXk5ufj5ebi5ebi5OXm6Onp6+zr7O3q6+zn6ere4OLU19nO0dPN0dPS1dfb3t/l5+jW2dq+wsWwtbirsbSqsLOutLe5vsDP0tTBxcits7avtbepr7K4vcDc3uDl5ufh4+S3vL+orrKts7apsLPY29y5vsHc3+Dn6OnHy824vsDn6enFycy4vb+1ur2ssrWss7XZ3N3a3N7N0NKqsbSvtLbEyMrm6enO0tOus7eqsLTAxMbAxMfS1tfa3d7N0dKrsrWts7XGyszd3+Css7apr7PQ1NXJzc+orrG6v8K7wMKor7Kwtrje4OG6v8GvtLewtrnd4OHm5+ji5ObX2tuyt7rp6uve4eLU19jM0NLMz9HR1Nbf4eLJzc6/w8a0ury0uby1u729wsXT1tfk5ubg4uPO0tS8wcOvtbixt7rDx8nc3t/Fycvm6OissrautLbY2tyus7bh5OXT1tjo6uuxtrkjfL4AAHcAAAAAAAAAAAAAAAAAAAAAAAAhcPwREXeQbYp2BPAAAAAAAAC4AAAAGe8Z7wDvBAAzABltieHHfbzvKG1cABkAGe+KEYgLBG0gdyMA5SLdAAAAAAAAAAAAAAAAAAAAAAC8cYFtx30AAGQAPAAAAAQL7woAAAAABAAAAAAAAADlH/AiHwAgAOUA5SLvCfAAAAv/AN3///8Z73z3BgBZdx53IAgAAAAAAAAAAAAAAAAAAAAAAADyAADmQZcCeULwIHadABl2AnkAALcAAAAAAADAAAACehIAYHYFAAAAAAAAAIAAgAAAwBAAAAAAAAAIDAAAAAAAAAAAAAMAcAAgAHIA5SIZ8EgAAAAAAAAAAADlIiAAAADIAAAA63cAAAAAAAAAAAAAAAAAAAAAGAAAAAAAAAAZ78AAQAAAAAAAAAAZ8BD3BgAKdx4AAAAAAAwAAgABAAAA3QEjPnPwZBv9ABl2AnIAAAAAAgBIAAAAGfAAAAAAAAAAAADAAADhOPgIDAsYAAAAAAAAAIAAAAAAAAAAAAAAAAAAAADIAAAG9uA8AAAAAWJLR0SL8m9H4AAAAAlwSFlzAAAOxAAADsQBlSsOGwAAAhpJREFUeNqNlPtX0zAUx3OXDMuQRZdcMXTosGhxugoOxAk6EMEx8Y0TX8z3fM33/39MuuHZmhb6/SHnNP30e3Nz7y0hAwIgGcqyIyNHHKDmKUGg3zE2mhs7Op7njuYgkSPs2PGCkFLgiQnCE0izTU8KqXByElG4xSlGE8hTp0vTZxCVUqgQPZyJJUGf6ayLIWOkUOA5HudI/dnpfapHyvPh51FHPmVi4iDpTujglmH5govDUuKifZkAtBJEHJW6NGedEvh8JLKRvOxHY1M2Xo1iakEuXrEcnSVvIep4tXbNt8DykrRArC1bIGUrKUPz63HJ3LCSAchU6sOg/nDVvh594Wv2hRdjuhfITVyPlPDWRkwJteXm7eGm8Bo8rikA+FYzBMJFt9mdbZ7Q4vRuE++ZJAzs3Z9nscNgNmExkD1HIRsPHj6KHQUzdcAfL++s1+tBYWuDkEzcxEJ4SOY/cVpPd589z7NsmYWpgIURh73IvXxVrOy123uvS29m325zhw+hQN4Bd95/+FioejURhKpXpew0dluDqLFzRtc+eVWFnV7tzNpBVfUKn784pE/q/w0nmx03+I/sl9osrvpKv9H+7bF8qdnVm9+tPtOsarZ/+NSkT1kOpd74iTEyqAjCqf3FfgcBKkyUrqYc0235Z8b8ag4C9WuxkiWtijiQC8ng7xzZUYdwPU8kXTwE65+TYCpQO2JKpQe7KfUPAzN7/Uht9uUAAAAASUVORK5CYII=',
};

export const Common = {
  ELEMENT_ALL: 'All',
  ANALYST_DELEMITER: ' & ',
  COMPANY_DELEMITER: ', ',
  IMG_TYPE: 'data:image/png;base64,',
  ACCOUNT_CIMB: 'CIMB',
  ACCOUNT_PEELHUNT: 'PEELHUNT',
  EFADEMO: 'EFADEMO',
  RESTRICTED_RELATIONSHIP_ID: '101',
  MAX_AUTHORS: 3,
  STRING_EMPTY: ' ',
  IS_CORP_NOTE: '1',
  LIST_BY_CORP: '1',
  EFA_PREFIX: 'EFA',
  PPTX_EXTENSION: '.pptx',
  PPT_EXTENSION: '.ppt',
  PPTX_MIME_TYPE:
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  PPT_MIME_TYPE: 'application/vnd.ms-powerpoint',
  DOCX_EXTENSION: '.docx',
  DOC_EXTENSION: '.doc',
  DOCX_MIME_TYPE:
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  DOC_MIME_TYPE: 'application/msword',
  FDRN_TITLE: 'FPDW',
  FDRN_ERROR_MSG:
    'Your components have issues. <br> Please contact support at support@efadrin.com',
  MAX_SIZE_BYTES: 1000000000,
  STRING_JOIN_CHARACTER: '|',
  FDRW_PREFIX: 'FDRW',
};

export enum ToastNotiAction {
  info,
  warning,
  error,
  success,
  remove,
  clear,
}

export enum ToastNotiPosition {
  top_right = 'toast-top-right',
  top_left = 'toast-top-left',
  top_center = 'toast-top-center',
  top_full_width = 'toast-top-full-width',
  bottom_right = 'toast-bottom-right',
  bottom_left = 'toast-bottom-left',
  bottom_center = 'toast-bottom-center',
  bottom_full_width = 'toast-bottom-full-width',
}

export const DATE_FORMATS = {
  LONG_US: 'MMMM d, yyyy',
  LONG_UK: 'd MMMM yyyy',
  SHORT_US: 'MMM d, yyyy',
  SHORT_UK: 'd MMM yyyy',
  ISO: 'yyyy-MM-dd',
  EU: 'dd/MM/yyyy',
  US: 'MM/dd/yyyy',
  FINANCIAL: 'd-MMM-yy',
  DOT: 'dd.MM.yyyy',
} as const;

export type DateFormatKey = keyof typeof DATE_FORMATS;
export type DateFormatValue = (typeof DATE_FORMATS)[DateFormatKey];

export const WF_DECLARATION = {
  PUBLIC: 'public',
  NON_PUBLIC: 'nonPublic',
};

// Language mapping for API and i18n
export const LANGUAGE_MAPPING = {
  en: {
    apiId: '2057',
    label: 'English',
    flag: '🇬🇧',
  },
  zh: {
    apiId: '3076',
    label: '中文',
    flag: '🇨🇳',
  },
  zhTW: {
    apiId: '3076',
    label: '中文（繁體）',
    flag: '🇹🇼',
  },
  es: {
    apiId: '2057',
    label: 'Español',
    flag: '🇪🇸',
  },
  fr: {
    apiId: '2057',
    label: 'Français',
    flag: '🇫🇷',
  },
  hi: {
    apiId: '2057',
    label: 'हिन्दी',
    flag: '🇮🇳',
  },
  ja: {
    apiId: '2057',
    label: '日本語',
    flag: '🇯🇵',
  },
  it: {
    apiId: '2057',
    label: 'Italiano',
    flag: '🇮🇹',
  },
  de: {
    apiId: '2057',
    label: 'Deutsch',
    flag: ' 🇩🇪',
  },
} as const;

export type SupportedLanguage = keyof typeof LANGUAGE_MAPPING;
