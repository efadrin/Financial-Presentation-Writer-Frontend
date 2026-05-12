export interface FinancialTableRequest {
  ApiName: string;
  AccountName: string;
  UserID: string;
  CorpIDs: string;
  QueryNames: string;
  ForceUnits: string;
  ForceAnnualise: string;
  ForceAnnMonth: string;
  NumberOfForecastYears?: string;
  PeriodOffset?: string;
  UseInterimTables: string;
  DevDataFlags: string;
  PriceDate: string;
  IsCorpNote: string;
  LanguageID: string;
  OutputFormat: string;
  SrvrID: string;
  WordID: string;
  FirmID?: number;
  Email?: string;
  OverrideCurrency?: string;
}

export interface FinancialTableImageResponse {
  QueryName: string;
  Base64: string;
  MimeType: string;
  WidthPx: number;
  HeightPx: number;
}
