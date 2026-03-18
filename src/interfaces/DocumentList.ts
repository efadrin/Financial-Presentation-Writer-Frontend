export interface DocumentListRequest {
  AccountID: number;
  AccountName: string;
  SrvrID: number;
  StatusFilter?: string;
  MarketFilter?: string;
  SectorFilter?: number;
  UserFilter?: number;
  TemplateFilter?: number;
}

export interface DocumentListResponse {
  DocID: number;
  DocName: string;
  DocVersion?: number;
  PageCount: number;
  StatusName: string;
  LastRefreshDate: string;
  FullName: string;
  TemplateName: string;
  // Extended workflow fields
  TimeStamp?: string;
  PriorityName?: string;
  LockingUser?: string;
  Approvals?: string;
  RejectingUser?: string;
  IsPublished?: number;
  DocTypeName?: string;
  Compendium?: string;
  UserIDForDetail?: number;
  Attachment?: string;
  Market?: string;
  SectorID?: number;
  TemplateID?: number;
  LeadAnalystID?: string;
  Comment?: number;
  PrimaryAuthor?: string;
  TemplateDescription?: string;
  ComplianceWarning?: number;
  SubmissionTime?: string;
  CorpMentionIDs?: string;
  // Wall cross fields
  /** Whether the analyst was wall-crossed when creating this document */
  IsWallCrossed?: boolean;
  /** If wall-crossed, whether the content is non-public (true) or public (false) */
  IsNonPublic?: boolean;
  // FDRW report indicator
  /** Whether this document was created using the FDRW Word tool */
  EFADRINReport?: boolean;
  // Document GUID for DocRetrieve API (RIXML download)
  /** The document GUID used for retrieving published documents (RIXML, PDF) via EFADocRetrieve */
  DocGUID?: string;
}

// Workflow filter types
export interface WorkflowFilterRequest {
  AccountName: string;
  SrvrID: number;
}

export interface WorkflowFilterResponse {
  Markets: MarketOption[];
  Sectors: SectorOption[];
  Users: UserOption[];
  Templates: TemplateOption[];
  Priorities: PriorityOption[];
  /** Publisher type for this account: "PeelHunt" or "Default" */
  PublisherType: string;
}

export interface MarketOption {
  ShortName: string;
  Market: string;
}

export interface SectorOption {
  SectorID: number;
  Sector: string;
}

export interface UserOption {
  UserID: number;
  FullName: string;
}

export interface TemplateOption {
  TemplateID: number;
  TemplateName: string;
  TemplateDescription: string;
}

export interface PriorityOption {
  PriorityID: number;
  PriorityName: string;
  IsDefault: boolean;
}

// User permissions types
export interface UserPermissionsRequest {
  AccountName: string;
  SrvrID: number;
  UserID: number;
  AccountID: number;
}

export interface UserPermissionsResponse {
  UserID: number;
  Roles: UserRole[];
  ControlPermissions: ControlPermission[];
}

export interface UserRole {
  RoleID: number;
  RoleName: string;
  FieldName: string;
}

export interface ControlPermission {
  ControlName: string;
  RoleID: number;
  RoleName: string;
}

// Workflow status type
export type WorkflowStatus = 'Drafts' | 'Review' | 'Final' | 'Finalised' | 'Published';

// Document action types
export interface DocumentActionRequest {
  AccountName: string;
  SrvrID: number;
  DocID: number;
  UserID: number;
  AccountID: number;
}

export interface CheckoutRequest extends DocumentActionRequest {}

export interface CheckinRequest extends DocumentActionRequest {
  DocBlob?: string;
  Comment?: string;
  /** Document name (required when DocBlob is provided for check-in with save) */
  DocName?: string;
  /** Corporation ID (optional - will use existing if not provided) */
  CorpID?: number;
}

/**
 * Request for updating a document in place (combines lock check, upload, and unlock in one atomic operation).
 * Used by the "Update Draft" button on the Draft Submission page.
 */
export interface UpdateDocumentRequest extends DocumentActionRequest {
  /** Base64 encoded document blob (required) */
  DocBlob: string;
  /** Document name (optional) */
  DocName?: string;
  /** Corporation ID (optional) */
  CorpID?: number;
  /** Account ID (required) */
  AccountID: number;
}

export interface ApproveRejectRequest extends DocumentActionRequest {
  Reason?: string;
}

export interface ChangePriorityRequest extends DocumentActionRequest {
  PriorityID: number;
}

export interface ChangeStatusRequest extends DocumentActionRequest {
  NewStatus: WorkflowStatus;
}

/** Wall-cross status values */
export type WallCrossStatus = 'none' | 'public' | 'nonPublic';

export interface UpdateWallCrossStatusRequest extends DocumentActionRequest {
  /** Wall-cross status: "none" (not wall-crossed), "public" (wall-crossed with public info), "nonPublic" (wall-crossed with non-public info) */
  WallCrossStatus: WallCrossStatus;
}

export interface SubmitForReviewRequest extends DocumentActionRequest {
  Comment?: string;
}

export interface AddCommentRequest extends DocumentActionRequest {
  Comment: string;
  DocVersion: number;
  StatusName: string;
}

export interface DocumentActionResponse {
  Success: boolean;
  Message: string;
  DocID?: number;
  DocVersion?: number;
  NewStatus?: string;
}

export interface DocumentStatusResponse {
  DocID: number;
  StatusID: number;
  StatusName: string;
  LockingUser?: string;
  FullName?: string;
}

export interface DocumentCommentResponse {
  DocID: number;
  DocVersion: number;
  TimeRecord: string;
  StatusID: number;
  StatusName: string;
  Comment: string;
  FullName: string;
  UserID: number;
}

export interface DocumentHistoryResponse {
  DocID: number;
  DocVersion: number;
  DocName: string;
  FullName: string;
  StatusName: string;
  TimeStamp: string;
  UserID?: number;
}

export interface DownloadDocumentRequest {
  AccountName: string;
  SrvrID: number;
  DocID: number;
  DocType?: number; // 1 = Word, 2 = PDF
  DocVersion?: number;
}

export interface DocumentBlobResponse {
  Success: boolean;
  DocID: number;
  DocVersion: number;
  DocName: string;
  BlobBase64?: string;
  DocType: number;
  ContentType?: string;
  Message?: string;
}

// Analyst sign-off
export interface AnalystSignOffRequest extends DocumentActionRequest {
  DocName?: string;
}

export interface RoleInfo {
  RoleID: number;
  RoleShortName: string;
  RoleName: string;
}

export interface AnalystSignOffResponse {
  Success: boolean;
  Message: string;
  DocID: number;
  AlreadyApproved?: boolean;
  ApprovedByMyself?: boolean;
  RolesNeedingApproval?: RoleInfo[];
  AllApprovalsComplete?: boolean;
}

// Attachment types
export interface AttachmentInfo {
  DocID: number;
  FileName: string;
  UploadedBy: string;
  TimeStamp: string;
}

export interface GetAttachmentRequest {
  AccountName: string;
  DocID: number;
  FileName: string;
}

export interface DeleteAttachmentRequest {
  AccountName: string;
  DocID: number;
  FileName: string;
}

// Compliance Override types
export interface OverrideComplianceRequest {
  AccountName: string;
  SrvrID: number;
  DocID: number;
  UserID: number;
  AccountID: number;
}

export interface ComplianceExceptionResponse {
  Success: boolean;
  Message: string;
  ExceptionExists: boolean;
}

// Company Mentions types
export interface CompanyMention {
  CorpID: number;
  CorpName: string;
  CorpNameLocal: string;
  IsOnWatchList: boolean;
  IsOnRelationshipList: boolean;
}

export interface CompanyMentionsResponse {
  Success: boolean;
  DocID: number;
  Mentions: CompanyMention[];
  Message?: string;
}

// Publish types
export interface RIXMLSubject {
  SubjectPublisherDefined: string;
  SubjectEnum: string;
}

export interface RIXMLSubjectsResponse {
  Success: boolean;
  Subjects: RIXMLSubject[];
  Message?: string;
}

export interface PublishDocumentRequest {
  AccountName: string;
  SrvrID: number;
  DocID: number;
  UserID: number;
  AccountID: number;
  DocName: string;
  SubjectEnum: string;
  SubjectPublisherDefined: string;
  DistributeToPeelHunt: boolean;
  DistributeToSingleTrack: boolean;
}

export interface PublishDocumentResponse {
  Success: boolean;
  Message: string;
  DocID?: number;
  DocVersion?: number;
  NewStatus?: string;
  DistributedToSingleTrack: boolean;
  DistributedToPeelHunt: boolean;
}

// Distribution types
export interface DistributionConfig {
  DistributionServiceUrl?: string;
  DistributionEndpoint: string;
  PublisherType: string;
  SingleTrackEnabled: boolean;
  PeelHuntEnabled: boolean;
  DistributionEnabled: boolean;
}

export interface SubmitForDistributionRequest {
  AccountName: string;
  SrvrID: number;
  AccountID: number;
  DocID: number;
  DocVersion: number;
  DocGUID: string;
  DistributeToSingleTrack: boolean;
  DistributeToPeelHunt: boolean;
  StatusType: string;
}

export interface SubmitForDistributionResponse {
  Success: boolean;
  Message: string;
  SingleTrackSubmitted: boolean;
  PeelHuntSubmitted: boolean;
  SingleTrackResponse?: string;
  PeelHuntResponse?: string;
}

// Save to Draft types (for uploading new documents)
export interface DocVariable {
  Name: string;
  Value: string;
}

export interface SaveToDraftRequest {
  AccountID: number;
  AccountName: string;
  DocID: number;
  DocName: string;
  DocBlob: string;
  CorpID: number;
  UserID: number;
  DocVariables: DocVariable[];
  /** Selected RIXML template WordID (required for PowerPoint files) */
  SelectedWordID?: number;
}

export interface SaveToDraftResponse {
  Success: boolean;
  Message: string;
  DocID?: number;
}
