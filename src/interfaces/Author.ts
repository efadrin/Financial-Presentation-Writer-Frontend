export interface UseAuthors {
  ApiName: string;
  AccountName: string;
  CorpID: string;
  UserID?: string;
  SrvrID: string;
  ListByCorp: string;
}

export interface Author {
  authorEmail: string;
  authorId: string;
  authorJobTitle: string;
  authorLocation: string;
  authorPhone: string;
  authorSector: string;
  familyName: string;
  fullName: string;
  givenName: string;
  middleName: string;
}

export interface AuthorsResponse {
  Data: Array<{
    corpID: string;
    authors: Author[];
  }>;
  Errors: string;
  Message: string;
  StatusCode: number;
  Succeeded: boolean;
}
