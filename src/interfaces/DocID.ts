export interface docIDRequest {
  CorpID: number;
  AccountID: number;
  UserID: string;
  DocName: string;
  AccountName: string;
  SrvrID: number;
}

export interface docIDResponse {
  DocID: number;
}
