export interface QueryChartResponse {
  CorpId: string;
  QueryName: string;
  Charts: string[];
  GroupHeader: string;
}

export interface QueryChartRequest {
  AccountName: string;
  AccountID: string;
  CorpIDs: string;
  QueryNames: string;
  DevData?: string;
  UserID?: string;
  PeriodOffset?: string;
  LanguageID: string;
  SrvrID: string;
  WordID?: string;
  FirmID?: number;
  /**
   * JSON configuration for chart generation.
   * Format: {"efaCharts":[{"efaChart":{"expansionFactor":1,"title":"","forecastYears":3,"noForecastIfBlocked":1,"chartType":"Pie","yAxis":{"y1":{"logBase":10}}}}]}
   */
  Config?: string;
}
