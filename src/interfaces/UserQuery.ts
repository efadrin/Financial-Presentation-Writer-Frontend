export interface GetUserQueryRequest {
  AccountName?: string;
  AccountID?: string;
  SrvrID?: number | string;
  Model: string;
}

export interface GetUserQueryResponse {
  AccountID: number;
  UserID: number;
  FullName: string;
  QueryID: string;
  QueryName: string;
  TableHeader: string;
  IsChart: boolean;
  Description: string;
  HasData?: boolean;
}

export interface GetAvailableUserQueryRequest {
  AccountID?: number | string;
  AccountName?: string;
  CorpIDs?: string;
  UseDevData: boolean;
  IsInterim?: boolean;
  Model?: string | null;
  SrvrID?: number | string;
}

export interface AddTableChartItem extends GetUserQueryResponse {
  Added?: boolean;
}

export type AuthorMap = Record<string, boolean>;
