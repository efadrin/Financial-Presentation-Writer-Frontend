export interface submitReportRequest {
  AccountID: number;
  AccountName: string;
  DocID: number;
  DocName: string;
  DocBlob: string;
  CorpID: number;
  UserID: number;
  SrvrID: number;
  DocVariables: DocVariableEntry[];
  CorpMentionIDs?: string;
}

export interface DocVariableEntry {
  Name: string;
  Value: string;
}
