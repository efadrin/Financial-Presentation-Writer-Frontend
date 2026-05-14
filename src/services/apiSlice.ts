// src/services/apiSlice.ts - PowerPoint Workflow API
import { ApiResponse } from "@/interfaces/ApiResponses";
import { LoginData, LoginRequest } from "@/interfaces/Authentication";
import {
  DocumentListRequest,
  DocumentListResponse,
  WorkflowFilterRequest,
  WorkflowFilterResponse,
  UserPermissionsRequest,
  UserPermissionsResponse,
  DocumentActionRequest,
  DocumentActionResponse,
  CheckinRequest,
  UpdateDocumentRequest,
  ApproveRejectRequest,
  ChangePriorityRequest,
  ChangeStatusRequest,
  SubmitForReviewRequest,
  AddCommentRequest,
  DocumentStatusResponse,
  DocumentCommentResponse,
  DocumentHistoryResponse,
  DownloadDocumentRequest,
  DocumentBlobResponse,
  AnalystSignOffRequest,
  AnalystSignOffResponse,
  AttachmentInfo,
  OverrideComplianceRequest,
  ComplianceExceptionResponse,
  CompanyMentionsResponse,
  RIXMLSubjectsResponse,
  PublishDocumentRequest,
  PublishDocumentResponse,
  UpdateWallCrossStatusRequest,
  SaveToDraftRequest,
  SaveToDraftResponse,
  SubmitForDistributionRequest,
  SubmitForDistributionResponse,
} from "@/interfaces/DocumentList";
import { LoggerInfo, UserInfoLog } from "@/interfaces/LoggerInfo";
import { Company, CompaniesbyUser } from "@/interfaces/Company";
import { AuthorsResponse, UseAuthors } from "@/interfaces/Author";
import {
  AuthorAvatarResponse,
  AuthorAvatarRequest,
} from "@/interfaces/AuthorImage";
import { ReportType, UseReportTypes } from "@/interfaces/ReportType";
import { docIDRequest, docIDResponse } from "@/interfaces/DocID";
import { submitReportRequest } from "@/interfaces/SubmitToEFA";
import {
  GetAvailableUserQueryRequest,
  GetUserQueryResponse,
} from '@/interfaces/UserQuery';
import { QueryChartRequest, QueryChartResponse } from '@/interfaces/QueryChart';
import {
  FinancialTableRequest,
  FinancialTableImageResponse,
} from '@/interfaces/FinancialTable';
import {
  BaseQueryFn,
  createApi,
  FetchArgs,
  fetchBaseQuery,
  FetchBaseQueryError,
} from "@reduxjs/toolkit/query/react";
import { RootState } from "@/store";
import { isTokenExpired } from "@/utils/tokenUtils";
import { BASE_API_URL } from "@/utils/constants";
import { login, selectSessionToken } from "./authSlice";

const baseQueryWithReauth: BaseQueryFn<
  string | FetchArgs,
  unknown,
  FetchBaseQueryError
> = async (args, api, extraOptions) => {
  let state = api.getState() as RootState;
  let sessionToken = selectSessionToken(state);

  if (isTokenExpired(sessionToken)) {
    await api.dispatch(login());
  }

  state = api.getState() as RootState;
  sessionToken = selectSessionToken(state);

  const isFormDataRequest =
    typeof args === "object" &&
    args !== null &&
    (args as FetchArgs).body instanceof FormData;

  const result = await fetchBaseQuery({
    baseUrl: BASE_API_URL,
    timeout: 600000,
    prepareHeaders: (headers) => {
      if (!isFormDataRequest) {
        headers.set("Content-Type", "application/json");
      }
      headers.set("Authorization", `Bearer ${sessionToken}`);
      return headers;
    },
    validateStatus: (response) => {
      return response.status >= 200 && response.status < 300;
    },
  })(args, api, extraOptions);

  if (result.meta?.response?.status === 204) {
    return {
      data: {
        Data: {},
        Message: "No content",
        Succeeded: true,
        StatusCode: 204,
      },
    };
  }

  return result;
};

export interface AccountsApiResponseData {
  Accounts: AccountData[];
}

export interface AccountData {
  AccountID: string;
  AccountName: string;
  SrvrID: string;
  UserID: string;
  FullName: string;
  ServerIPAddress: string;
  FirmKey: string;
  EFAAccountID: number;
}

export interface UseAccounts {
  FinancialSourceID?: string | null;
  FinancialSourceKey?: string | null;
}

export interface UserInfo {
  UserID: number;
  FullName: string;
  Email: string;
  FirmID: number;
  FirmKey: string;
  IsRegistered: boolean;
}

export interface FinancialDatabasesData {
  Email: string;
  FirmID: string;
  FirmKey: string;
  FinancialSources: {
    FinancialSourceID: string;
    FinancialSourceKey: string;
    FinancialSourceName: string;
  }[];
}

export interface CompanyImagesRequest {
  accountID: number;
  accountName: string;
  srvrID: number;
  userID: number;
  languageID: number;
}

export interface CompanyImagesResponse {
  Images: Record<number, string>;
}

export interface ReportTemplateImagesRequest {
  FirmID: number;
}

export interface ReportTemplateImagesResponse {
  Images: Record<number, string>;
}

export const apiSlice = createApi({
  reducerPath: "api",
  baseQuery: baseQueryWithReauth,
  keepUnusedDataFor: 300,
  invalidationBehavior: 'immediate',
  tagTypes: ['DocumentList', 'UserQuery', 'CompanyList'],
  endpoints: (builder) => ({
    // Account & Auth
    getAccounts: builder.query<AccountData[], UseAccounts>({
      query: (params) => ({
        url: "account/account",
        method: "POST",
        body: params,
      }),
      transformResponse: (
        response: ApiResponse<AccountsApiResponseData>,
      ): AccountData[] => response.Data.Accounts,
    }),
    getFinancialDatabases: builder.query<
      ApiResponse<FinancialDatabasesData>,
      void
    >({
      query: () => ({
        url: "user/info",
        method: "GET",
      }),
    }),

    // Logging
    logUserActivity: builder.mutation<ApiResponse<boolean>, LoggerInfo>({
      query: (logInfo) => ({
        url: "useractivity/log",
        method: "POST",
        body: logInfo,
      }),
    }),
    createUser: builder.mutation<ApiResponse<boolean>, UserInfoLog>({
      query: (userInfo) => ({
        url: "useractivity/createupdateuser",
        method: "POST",
        body: userInfo,
      }),
    }),
    getUserInfo: builder.query<ApiResponse<UserInfo>, void>({
      query: () => ({
        url: "user/info",
        method: "GET",
      }),
    }),

    // ---- Workflow Endpoints ----
    getDocumentList: builder.query<
      ApiResponse<DocumentListResponse[]>,
      DocumentListRequest
    >({
      query: (params: DocumentListRequest): FetchArgs => ({
        url: "workflow/documentlist",
        method: "GET",
        params,
      }),
      providesTags: ["DocumentList"],
    }),
    getWorkflowFilters: builder.query<
      ApiResponse<WorkflowFilterResponse>,
      WorkflowFilterRequest
    >({
      query: (params: WorkflowFilterRequest): FetchArgs => ({
        url: "workflow/filters",
        method: "GET",
        params,
      }),
    }),
    getUserPermissions: builder.query<
      ApiResponse<UserPermissionsResponse>,
      UserPermissionsRequest
    >({
      query: (params: UserPermissionsRequest): FetchArgs => ({
        url: "workflow/userpermissions",
        method: "GET",
        params,
      }),
    }),
    saveToDraft: builder.mutation<
      ApiResponse<SaveToDraftResponse>,
      SaveToDraftRequest
    >({
      query: (request) => ({
        url: "workflow/SaveToDraft",
        method: "POST",
        body: request,
      }),
      invalidatesTags: ["DocumentList"],
    }),
    checkoutDocument: builder.mutation<
      ApiResponse<DocumentActionResponse>,
      DocumentActionRequest
    >({
      query: (request) => ({
        url: "workflow/checkout",
        method: "POST",
        body: request,
      }),
      invalidatesTags: ["DocumentList"],
    }),
    checkinDocument: builder.mutation<
      ApiResponse<DocumentActionResponse>,
      CheckinRequest
    >({
      query: (request) => ({
        url: "workflow/checkin",
        method: "POST",
        body: request,
      }),
      invalidatesTags: ["DocumentList"],
    }),
    updateDocument: builder.mutation<
      ApiResponse<DocumentActionResponse>,
      UpdateDocumentRequest
    >({
      query: (request) => ({
        url: "workflow/updateDocument",
        method: "POST",
        body: request,
      }),
      invalidatesTags: ["DocumentList"],
    }),
    approveDocument: builder.mutation<
      ApiResponse<DocumentActionResponse>,
      ApproveRejectRequest
    >({
      query: (request) => ({
        url: "workflow/approve",
        method: "POST",
        body: request,
      }),
      invalidatesTags: ["DocumentList"],
    }),
    rejectDocument: builder.mutation<
      ApiResponse<DocumentActionResponse>,
      ApproveRejectRequest
    >({
      query: (request) => ({
        url: "workflow/reject",
        method: "POST",
        body: request,
      }),
      invalidatesTags: ["DocumentList"],
    }),
    changePriority: builder.mutation<
      ApiResponse<DocumentActionResponse>,
      ChangePriorityRequest
    >({
      query: (request) => ({
        url: "workflow/changePriority",
        method: "POST",
        body: request,
      }),
      invalidatesTags: ["DocumentList"],
    }),
    changeStatus: builder.mutation<
      ApiResponse<DocumentActionResponse>,
      ChangeStatusRequest
    >({
      query: (request) => ({
        url: "workflow/changeStatus",
        method: "POST",
        body: request,
      }),
      invalidatesTags: ["DocumentList"],
    }),
    updateWallCrossStatus: builder.mutation<
      ApiResponse<DocumentActionResponse>,
      UpdateWallCrossStatusRequest
    >({
      query: (request) => ({
        url: "workflow/updateWallCrossStatus",
        method: "POST",
        body: request,
      }),
      invalidatesTags: ["DocumentList"],
    }),
    submitForReview: builder.mutation<
      ApiResponse<DocumentActionResponse>,
      SubmitForReviewRequest
    >({
      query: (request) => ({
        url: "workflow/submitForReview",
        method: "POST",
        body: request,
      }),
      invalidatesTags: ["DocumentList"],
    }),
    killDocument: builder.mutation<
      ApiResponse<DocumentActionResponse>,
      DocumentActionRequest
    >({
      query: (request) => ({
        url: "workflow/kill",
        method: "POST",
        body: request,
      }),
      invalidatesTags: ["DocumentList"],
    }),
    breakDocumentLock: builder.mutation<
      ApiResponse<DocumentActionResponse>,
      DocumentActionRequest
    >({
      query: (request) => ({
        url: "workflow/breakLock",
        method: "POST",
        body: request,
      }),
      invalidatesTags: ["DocumentList"],
    }),
    addDocumentComment: builder.mutation<
      ApiResponse<DocumentActionResponse>,
      AddCommentRequest
    >({
      query: (request) => ({
        url: "workflow/addComment",
        method: "POST",
        body: request,
      }),
      invalidatesTags: ["DocumentList"],
    }),
    analystSignOff: builder.mutation<
      ApiResponse<AnalystSignOffResponse>,
      AnalystSignOffRequest
    >({
      query: (request) => ({
        url: "workflow/analystSignOff",
        method: "POST",
        body: request,
      }),
      invalidatesTags: ["DocumentList"],
    }),
    getDocumentStatus: builder.query<
      ApiResponse<DocumentStatusResponse>,
      { accountName: string; docID: number; accountID: number; srvrID?: number }
    >({
      query: (params) => ({
        url: "workflow/documentStatus",
        method: "GET",
        params,
      }),
    }),
    getDocumentComments: builder.query<
      ApiResponse<DocumentCommentResponse[]>,
      { accountName: string; docID: number; srvrID?: number }
    >({
      query: (params) => ({
        url: "workflow/documentComments",
        method: "GET",
        params,
      }),
    }),
    getDocumentHistory: builder.query<
      ApiResponse<DocumentHistoryResponse[]>,
      { accountName: string; docID: number; srvrID?: number }
    >({
      query: (params) => ({
        url: "workflow/documentHistory",
        method: "GET",
        params,
      }),
    }),
    downloadDocument: builder.query<
      ApiResponse<DocumentBlobResponse>,
      DownloadDocumentRequest
    >({
      query: (params) => ({
        url: "workflow/download",
        method: "GET",
        params,
      }),
    }),
    // Attachments
    getDocumentAttachments: builder.query<
      ApiResponse<AttachmentInfo[]>,
      { accountName: string; docID: number }
    >({
      query: (params) => ({
        url: "workflow/attachments",
        method: "GET",
        params,
      }),
    }),
    downloadAttachment: builder.query<
      ApiResponse<DocumentBlobResponse>,
      { accountName: string; docID: number; fileName: string }
    >({
      query: (params) => ({
        url: "workflow/attachment/download",
        method: "GET",
        params,
      }),
    }),
    deleteAttachment: builder.mutation<
      ApiResponse<DocumentActionResponse>,
      { accountName: string; docID: number; fileName: string }
    >({
      query: (request) => ({
        url: "workflow/attachment",
        method: "DELETE",
        body: request,
      }),
      invalidatesTags: ["DocumentList"],
    }),
    // Compliance Override
    overrideComplianceBlock: builder.mutation<
      ApiResponse<ComplianceExceptionResponse>,
      OverrideComplianceRequest
    >({
      query: (request) => ({
        url: "workflow/overrideCompliance",
        method: "POST",
        body: request,
      }),
      invalidatesTags: ["DocumentList"],
    }),
    // Company Mentions
    getCompanyMentions: builder.query<
      ApiResponse<CompanyMentionsResponse>,
      {
        accountName: string;
        docID: number;
        accountID: number;
        srvrID: number;
        corpMentionIds?: string;
      }
    >({
      query: (params) => ({
        url: "workflow/companyMentions",
        method: "GET",
        params,
      }),
    }),
    // Publish
    getRIXMLSubjects: builder.query<
      ApiResponse<RIXMLSubjectsResponse>,
      { accountName: string; accountID: number; srvrID: number }
    >({
      query: (params) => ({
        url: "workflow/rixmlSubjects",
        method: "GET",
        params,
      }),
    }),
    publishDocument: builder.mutation<
      ApiResponse<PublishDocumentResponse>,
      PublishDocumentRequest
    >({
      query: (request) => ({
        url: "workflow/publish",
        method: "POST",
        body: request,
      }),
      invalidatesTags: ["DocumentList"],
    }),
    // Download RIXML
    downloadRIXML: builder.query<
      ApiResponse<{ FileName: string; DocGUID: string; PDFBinary: string }>,
      { AccountName: string; DocGUID: string; SrvrID: number }
    >({
      query: (params) => ({
        url: "report/getpdf",
        method: "POST",
        body: { ...params, DocType: 5 },
      }),
    }),

    // Upload attachment (FormData)
    uploadAttachment: builder.mutation<
      ApiResponse<DocumentActionResponse>,
      FormData
    >({
      query: (formData) => ({
        url: "workflow/attachment/upload",
        method: "POST",
        body: formData,
      }),
      invalidatesTags: ["DocumentList"],
    }),

    // Distribution
    submitForDistribution: builder.mutation<
      ApiResponse<SubmitForDistributionResponse>,
      SubmitForDistributionRequest
    >({
      query: (request) => ({
        url: "workflow/submitForDistribution",
        method: "POST",
        body: request,
      }),
    }),

    // ---- Company / Author / Template Endpoints ----
    getCompaniesbyUser: builder.query<ApiResponse<Company[]>, CompaniesbyUser>({
      query: (params) => ({
        url: "company/getlistbyuserid",
        method: "POST",
        body: params,
      }),
    }),
    getCompanyImages: builder.query<
      ApiResponse<CompanyImagesResponse>,
      CompanyImagesRequest
    >({
      query: (params) => ({
        url: "company/getimages",
        method: "POST",
        body: params,
      }),
    }),
    getAuthors: builder.query<AuthorsResponse, UseAuthors>({
      query: (params) => ({
        url: "company/getcorpbyanalyst",
        method: "POST",
        body: params,
      }),
    }),
    getAuthorAvatars: builder.query<
      ApiResponse<AuthorAvatarResponse[]>,
      AuthorAvatarRequest
    >({
      query: (params) => ({
        url: "author/getavatars",
        method: "POST",
        body: params,
      }),
    }),
    getReportTemplates: builder.query<
      ApiResponse<ReportType[]>,
      UseReportTypes
    >({
      query: (params) => ({
        url: "reporttemplate/getreporttemplates",
        method: "POST",
        body: params,
      }),
    }),
    getReportTemplateImages: builder.query<
      ApiResponse<ReportTemplateImagesResponse>,
      ReportTemplateImagesRequest
    >({
      query: (params) => ({
        url: "reporttemplate/getimages",
        method: "POST",
        body: params,
      }),
    }),

    // Upload / Submit
    getDocID: builder.mutation<ApiResponse<docIDResponse>, docIDRequest>({
      query: (params) => ({
        url: "reportdocid/generatenewdocid",
        method: "POST",
        body: params,
      }),
    }),
    submitReportToEFA: builder.mutation<
      ApiResponse<string>,
      submitReportRequest
    >({
      query: (params) => ({
        url: "workflow/submittoefa",
        method: "POST",
        body: params,
      }),
      invalidatesTags: ["DocumentList"],
    }),

    // ---- Table & Chart insertion endpoints ----
    getAvailableUserQueries: builder.query<
      GetUserQueryResponse[],
      GetAvailableUserQueryRequest
    >({
      query: (params) => ({
        url: 'userquery/getavailableuserqueries',
        method: 'POST',
        body: params,
      }),
      transformResponse: (response: ApiResponse<GetUserQueryResponse[]>) =>
        response.Data,
      providesTags: ['UserQuery'],
    }),

    getFinancialTableImage: builder.mutation<
      FinancialTableImageResponse[],
      FinancialTableRequest
    >({
      query: (params) => ({
        url: 'financial/getfinancialtableimage',
        method: 'POST',
        body: params,
      }),
      transformResponse: (response: ApiResponse<FinancialTableImageResponse[]>) =>
        response.Data,
    }),

    getQueryChart: builder.query<
      ApiResponse<QueryChartResponse[]>,
      QueryChartRequest
    >({
      query: (params: QueryChartRequest): FetchArgs => ({
        url: 'chart/getquerychartfromxml',
        method: 'GET',
        params,
      }),
    }),
  }),
});

export const {
  // Auth/Account
  useGetAccountsQuery,
  useGetFinancialDatabasesQuery,
  // Logging
  useLogUserActivityMutation,
  useCreateUserMutation,
  // User Info
  useGetUserInfoQuery,
  useLazyGetUserInfoQuery,
  // Workflow
  useGetDocumentListQuery,
  useLazyGetDocumentListQuery,
  useGetWorkflowFiltersQuery,
  useGetUserPermissionsQuery,
  useSaveToDraftMutation,
  useCheckoutDocumentMutation,
  useCheckinDocumentMutation,
  useUpdateDocumentMutation,
  useApproveDocumentMutation,
  useRejectDocumentMutation,
  useChangePriorityMutation,
  useChangeStatusMutation,
  useUpdateWallCrossStatusMutation,
  useSubmitForReviewMutation,
  useKillDocumentMutation,
  useBreakDocumentLockMutation,
  useAddDocumentCommentMutation,
  useAnalystSignOffMutation,
  useGetDocumentStatusQuery,
  useGetDocumentCommentsQuery,
  useGetDocumentHistoryQuery,
  useLazyDownloadDocumentQuery,
  useGetDocumentAttachmentsQuery,
  useLazyDownloadAttachmentQuery,
  useDeleteAttachmentMutation,
  useOverrideComplianceBlockMutation,
  useGetCompanyMentionsQuery,
  useGetRIXMLSubjectsQuery,
  usePublishDocumentMutation,
  useLazyDownloadRIXMLQuery,
  useUploadAttachmentMutation,
  useSubmitForDistributionMutation,
  // Company / Author / Template
  useGetCompaniesbyUserQuery,
  useGetCompanyImagesQuery,
  useGetAuthorsQuery,
  useGetAuthorAvatarsQuery,
  useGetReportTemplatesQuery,
  useGetReportTemplateImagesQuery,
  // Upload / Submit
  useGetDocIDMutation,
  useSubmitReportToEFAMutation,
  // Table & Chart insertion
  useGetAvailableUserQueriesQuery,
  useGetFinancialTableImageMutation,
  useGetQueryChartQuery,
  useLazyGetQueryChartQuery,
} = apiSlice;
