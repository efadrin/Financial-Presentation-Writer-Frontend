export interface Company {
  corpId: string;
  corpName: string;
  shortName: string;
  market: string;
  sector: string;
  model: string;
  securityId: string;
  industry: string;
  annPub: boolean;
  annUnPub: boolean;
  userID: string;
  relationshipIds: string;
  isActive?: boolean;
  companyImage?: string;
}

export interface CompaniesbyUser {
  AccountID: string;
  LanguageID?: string;
  UserID: number;
  AccountName: string;
  SrvrID: string;
}

export type CompanyStringKeys = {
  [K in keyof Company]-?: Record<string, never> extends Pick<Company, K>
    ? never
    : Company[K] extends string
      ? K
      : never;
}[keyof Company];
