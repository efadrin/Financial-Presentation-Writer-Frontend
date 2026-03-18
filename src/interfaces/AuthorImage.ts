export interface AuthorImageResponse {
  authorId: string;
  authorImage: string;
  mimeType: string;
}
export interface AuthorImageRequest {
  ApiName: string;
  AccountName: string;
  SrvrID: string;
  UserID: string;
}
export interface AuthorAvatarResponse {
  authorId: string;
  authorAvatar: string;
}
export interface AuthorAvatarRequest {
  SrvrID: string;
}
