import React, {
  useState,
  useCallback,
  useRef,
  useMemo,
  useEffect,
} from "react";
import { useSelector } from "react-redux";
import { useUIOverlay } from "@/hooks/useUIOverlay";
import {
  makeStyles,
  tokens,
  Button,
  Menu,
  MenuTrigger,
  MenuPopover,
  MenuList,
  MenuItem,
  MenuDivider,
  Textarea,
  Spinner,
  Dropdown,
  Option,
  Badge,
  Text,
  Field,
  Checkbox,
  RadioGroup,
  Radio,
} from "@fluentui/react-components";
import {
  BottomSheet,
  useBottomSheetStyles,
} from "@/components/common/BottomSheet";
import {
  MoreHorizontal20Regular,
  ArrowDownload20Regular,
  LockClosed20Regular,
  LockOpen20Regular,
  Checkmark20Regular,
  Dismiss20Regular,
  Delete20Regular,
  ArrowForward20Regular,
  ArrowUndo20Regular,
  Comment20Regular,
  Flag20Regular,
  Signature20Regular,
  History20Regular,
  DocumentMultiple20Regular,
  Add20Regular,
  Attach20Regular,
  Shield20Regular,
  Building20Regular,
  Send20Regular,
  Open20Regular,
  ShieldLock20Regular,
  LockOpen24Regular,
  Delete24Regular,
  Flag24Regular,
  Dismiss24Regular,
  ArrowUpload24Regular,
  History24Regular,
  DocumentMultiple24Regular,
  Attach24Regular,
  Building24Regular,
  Send24Regular,
  ArrowUndo24Regular,
  Checkmark20Filled,
  ShieldCheckmark24Regular,
  ShieldLock24Regular,
  ShieldError24Regular,
} from "@fluentui/react-icons";
import { useNavigate } from "react-router-dom";
import { useAppDispatch } from "@/store";
import {
  setOpenedDocument,
  setLoading,
  setError,
} from "@/services/openedDocumentSlice";
import { openPresentationFromBase64 } from "@/utils/documentOpenUtils";
import { OpenInPowerPointDialog } from "./OpenInPowerPointDialog";
import { RootState } from "@/store";
import {
  useCheckoutDocumentMutation,
  useCheckinDocumentMutation,
  useApproveDocumentMutation,
  useRejectDocumentMutation,
  useChangePriorityMutation,
  useChangeStatusMutation,
  useSubmitForReviewMutation,
  useGetRIXMLSubjectsQuery,
  usePublishDocumentMutation,
  useKillDocumentMutation,
  useBreakDocumentLockMutation,
  useGetWorkflowFiltersQuery,
  useLazyDownloadDocumentQuery,
  useLazyDownloadRIXMLQuery,
  useAnalystSignOffMutation,
  useGetDocumentHistoryQuery,
  useGetDocumentCommentsQuery,
  useAddDocumentCommentMutation,
  useGetUserPermissionsQuery,
  useGetDocumentAttachmentsQuery,
  useLazyDownloadAttachmentQuery,
  useDeleteAttachmentMutation,
  useOverrideComplianceBlockMutation,
  useGetCompanyMentionsQuery,
  useUpdateWallCrossStatusMutation,
} from "@/services/apiSlice";
import {
  DocumentListResponse,
  WorkflowStatus,
  PriorityOption,
  DocumentHistoryResponse,
  DocumentCommentResponse,
  AttachmentInfo,
  CompanyMention,
  RIXMLSubject,
  WallCrossStatus,
} from "@/interfaces/DocumentList";
import { formatDistanceToNow, format } from "date-fns";

const useStyles = makeStyles({
  container: {
    display: "flex",
    gap: "4px",
    alignItems: "center",
  },
  actionButton: {
    minWidth: "28px",
    padding: "4px",
  },
  sheetContent: {
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  textarea: {
    minHeight: "80px",
  },
  statusBadge: {
    marginLeft: "8px",
  },
  historyItem: {
    padding: "12px",
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    "&:last-child": {
      borderBottom: "none",
    },
  },
  historyHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "4px",
  },
  historyStatus: {
    fontWeight: 600,
    color: tokens.colorNeutralForeground1,
  },
  historyTime: {
    fontSize: "12px",
    color: tokens.colorNeutralForeground3,
  },
  historyUser: {
    fontSize: "13px",
    color: tokens.colorNeutralForeground2,
  },
  commentItem: {
    padding: "12px",
    backgroundColor: tokens.colorNeutralBackground2,
    borderRadius: "6px",
    marginBottom: "8px",
  },
  commentHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: "6px",
  },
  commentUser: {
    fontWeight: 600,
    fontSize: "13px",
  },
  commentTime: {
    fontSize: "11px",
    color: tokens.colorNeutralForeground3,
  },
  commentText: {
    fontSize: "13px",
    lineHeight: "1.4",
  },
  versionItem: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 12px",
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    "&:hover": {
      backgroundColor: tokens.colorNeutralBackground1Hover,
    },
  },
  versionInfo: {
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  versionNumber: {
    fontWeight: 600,
  },
  versionMeta: {
    fontSize: "12px",
    color: tokens.colorNeutralForeground3,
  },
  emptyState: {
    padding: "24px",
    textAlign: "center",
    color: tokens.colorNeutralForeground3,
  },
  addCommentSection: {
    marginTop: "12px",
    paddingTop: "12px",
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  menuList: {
    maxHeight: "60vh",
    overflowY: "auto",
  },
  warningText: {
    fontSize: "14px",
    lineHeight: "1.5",
    color: tokens.colorNeutralForeground2,
  },
  warningHighlight: {
    fontWeight: 600,
    color: tokens.colorNeutralForeground1,
  },
  optionsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
  },
  optionCard: {
    position: "relative",
    padding: "12px",
    borderRadius: "8px",
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground1,
    cursor: "pointer",
    transition: "border-color 0.15s ease",
    display: "flex",
    gap: "10px",
    alignItems: "flex-start",
    "&:hover": {
      borderTopColor: tokens.colorBrandStroke1,
      borderRightColor: tokens.colorBrandStroke1,
      borderBottomColor: tokens.colorBrandStroke1,
      borderLeftColor: tokens.colorBrandStroke1,
    },
  },
  optionCardSelected: {
    borderTopColor: tokens.colorBrandStroke1,
    borderRightColor: tokens.colorBrandStroke1,
    borderBottomColor: tokens.colorBrandStroke1,
    borderLeftColor: tokens.colorBrandStroke1,
    backgroundColor: tokens.colorBrandBackground2,
  },
  optionIconWrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "36px",
    height: "36px",
    borderRadius: "8px",
    flexShrink: 0,
    backgroundColor: tokens.colorNeutralBackground3,
  },
  optionIcon: {
    fontSize: "20px",
    color: tokens.colorBrandForeground1,
  },
  optionContent: {
    flex: 1,
    minWidth: 0,
  },
  optionTitle: {
    fontSize: "13px",
    fontWeight: 600,
    color: tokens.colorNeutralForeground1,
    marginBottom: "2px",
  },
  optionDescription: {
    fontSize: "11px",
    color: tokens.colorNeutralForeground3,
    lineHeight: "1.3",
  },
  checkmark: {
    position: "absolute",
    top: "10px",
    right: "10px",
    fontSize: "16px",
    color: tokens.colorBrandForeground1,
  },
  // Wall-cross specific colors
  optionCardNone: {
    "&:hover": {
      borderTopColor: "#10b981",
      borderRightColor: "#10b981",
      borderBottomColor: "#10b981",
      borderLeftColor: "#10b981",
    },
  },
  optionCardNoneSelected: {
    borderTopColor: "#10b981",
    borderRightColor: "#10b981",
    borderBottomColor: "#10b981",
    borderLeftColor: "#10b981",
    backgroundColor: "#f0fdf4",
  },
  optionCardPublic: {
    "&:hover": {
      borderTopColor: "#f59e0b",
      borderRightColor: "#f59e0b",
      borderBottomColor: "#f59e0b",
      borderLeftColor: "#f59e0b",
    },
  },
  optionCardPublicSelected: {
    borderTopColor: "#f59e0b",
    borderRightColor: "#f59e0b",
    borderBottomColor: "#f59e0b",
    borderLeftColor: "#f59e0b",
    backgroundColor: "#fffbeb",
  },
  optionCardNonPublic: {
    "&:hover": {
      borderTopColor: "#ef4444",
      borderRightColor: "#ef4444",
      borderBottomColor: "#ef4444",
      borderLeftColor: "#ef4444",
    },
  },
  optionCardNonPublicSelected: {
    borderTopColor: "#ef4444",
    borderRightColor: "#ef4444",
    borderBottomColor: "#ef4444",
    borderLeftColor: "#ef4444",
    backgroundColor: "#fef2f2",
  },
  optionIconWrapperNone: {
    backgroundColor: "#f0fdf4",
  },
  optionIconWrapperPublic: {
    backgroundColor: "#fffbeb",
  },
  optionIconWrapperNonPublic: {
    backgroundColor: "#fef2f2",
  },
  optionIconNone: {
    fontSize: "20px",
    color: "#10b981",
  },
  optionIconPublic: {
    fontSize: "20px",
    color: "#f59e0b",
  },
  optionIconNonPublic: {
    fontSize: "20px",
    color: "#ef4444",
  },
  checkmarkNone: {
    color: "#10b981",
  },
  checkmarkPublic: {
    color: "#f59e0b",
  },
  checkmarkNonPublic: {
    color: "#ef4444",
  },
  fileUploadArea: {
    border: `2px dashed ${tokens.colorNeutralStroke2}`,
    borderRadius: "8px",
    padding: "20px",
    textAlign: "center",
    cursor: "pointer",
    transition: "border-color 0.2s ease",
    "&:hover": {
      borderTopColor: tokens.colorBrandStroke1,
      borderRightColor: tokens.colorBrandStroke1,
      borderBottomColor: tokens.colorBrandStroke1,
      borderLeftColor: tokens.colorBrandStroke1,
    },
  },
  fileSelected: {
    borderTopColor: tokens.colorBrandStroke1,
    borderRightColor: tokens.colorBrandStroke1,
    borderBottomColor: tokens.colorBrandStroke1,
    borderLeftColor: tokens.colorBrandStroke1,
    backgroundColor: tokens.colorBrandBackground2,
  },
  distributionOption: {
    padding: "12px",
    borderRadius: "8px",
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    marginBottom: "8px",
  },
});

interface WorkflowActionsPanelProps {
  document: DocumentListResponse;
  onActionComplete?: () => void;
  onDocumentDeleted?: (docId: number) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children?: React.ReactElement;
  commentsOpen?: boolean;
  onCommentsOpenChange?: (open: boolean) => void;
  wallCrossOpen?: boolean;
  onWallCrossOpenChange?: (open: boolean) => void;
  onOpenCommentsSheet?: (document: DocumentListResponse) => void;
  onOpenWallCrossSheet?: (document: DocumentListResponse) => void;
}

export const WorkflowActionsPanel: React.FC<WorkflowActionsPanelProps> = ({
  document,
  onActionComplete,
  onDocumentDeleted,
  open,
  onOpenChange,
  children,
  commentsOpen,
  onCommentsOpenChange,
  wallCrossOpen,
  onWallCrossOpenChange,
  onOpenCommentsSheet,
  onOpenWallCrossSheet,
}) => {
  const styles = useStyles();
  const bottomSheetStyles = useBottomSheetStyles();
  const settings = useSelector((state: RootState) => state.settings);

  // Dialog states
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [priorityDialogOpen, setPriorityDialogOpen] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState<string>("");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [breakLockDialogOpen, setBreakLockDialogOpen] = useState(false);
  const [checkinDialogOpen, setCheckinDialogOpen] = useState(false);
  const [checkinFile, setCheckinFile] = useState<File | null>(null);
  const [uploadingCheckin, setUploadingCheckin] = useState(false);
  const [statusDialogOpen, setStatusDialogOpen] = useState(false);
  const [commentsDialogOpenInternal, setCommentsDialogOpenInternal] =
    useState(false);
  const [versionsDialogOpen, setVersionsDialogOpen] = useState(false);

  // Support controlled comments dialog
  const setCommentsDialogOpen = (open: boolean) => {
    setCommentsDialogOpenInternal(open);
    if (onCommentsOpenChange) {
      onCommentsOpenChange(open);
    }
  };

  const commentsDialogOpen =
    commentsDialogOpenInternal || (commentsOpen ?? false);

  useEffect(() => {
    if (commentsOpen && !commentsDialogOpenInternal) {
      setCommentsDialogOpenInternal(true);
    }
  }, [commentsOpen, commentsDialogOpenInternal]);

  const [newComment, setNewComment] = useState("");
  const [attachmentsDialogOpen, setAttachmentsDialogOpen] = useState(false);
  const [companyMentionsDialogOpen, setCompanyMentionsDialogOpen] =
    useState(false);
  const [publishDialogOpen, setPublishDialogOpen] = useState(false);
  const [distributeToPeelHunt, setDistributeToPeelHunt] = useState(true);
  const [distributeToSingleTrack, setDistributeToSingleTrack] = useState(true);
  const [retractDialogOpen, setRetractDialogOpen] = useState(false);
  const [retractReason, setRetractReason] = useState("");
  const [nonFpwPublishWarningOpen, setNonFpwPublishWarningOpen] =
    useState(false);
  const [wallCrossDialogOpenInternal, setWallCrossDialogOpenInternal] =
    useState(false);
  const [selectedWallCrossStatus, setSelectedWallCrossStatus] =
    useState<WallCrossStatus>("none");
  const [openInPowerPointDialogOpen, setOpenInPowerPointDialogOpen] =
    useState(false);

  // Support controlled wall-cross dialog
  const setWallCrossDialogOpen = (open: boolean) => {
    setWallCrossDialogOpenInternal(open);
    if (onWallCrossOpenChange) {
      onWallCrossOpenChange(open);
    }
  };

  const wallCrossDialogOpen =
    wallCrossDialogOpenInternal || (wallCrossOpen ?? false);

  useEffect(() => {
    if (wallCrossOpen && !wallCrossDialogOpenInternal) {
      setWallCrossDialogOpenInternal(true);
      if (document.IsWallCrossed) {
        setSelectedWallCrossStatus(
          document.IsNonPublic ? "nonPublic" : "public",
        );
      } else {
        setSelectedWallCrossStatus("none");
      }
    }
  }, [
    wallCrossOpen,
    wallCrossDialogOpenInternal,
    document.IsWallCrossed,
    document.IsNonPublic,
  ]);

  const [openInPowerPointLoading, setOpenInPowerPointLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Navigation and dispatch
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  // API Mutations
  const [checkout, { isLoading: checkoutLoading }] =
    useCheckoutDocumentMutation();
  const [checkin, { isLoading: checkinLoading }] = useCheckinDocumentMutation();
  const [approve, { isLoading: approveLoading }] = useApproveDocumentMutation();
  const [reject, { isLoading: rejectLoading }] = useRejectDocumentMutation();
  const [changePriority, { isLoading: priorityLoading }] =
    useChangePriorityMutation();
  const [submitForReview, { isLoading: submitLoading }] =
    useSubmitForReviewMutation();
  const [killDocument, { isLoading: killLoading }] = useKillDocumentMutation();
  const [breakLock, { isLoading: breakLockLoading }] =
    useBreakDocumentLockMutation();
  const [downloadDoc, { isLoading: downloadLoading }] =
    useLazyDownloadDocumentQuery();
  const [downloadRIXML, { isLoading: rixmlDownloadLoading }] =
    useLazyDownloadRIXMLQuery();
  const [analystSignOff, { isLoading: signOffLoading }] =
    useAnalystSignOffMutation();
  const [addComment, { isLoading: addingComment }] =
    useAddDocumentCommentMutation();
  const [deleteAttachment] = useDeleteAttachmentMutation();
  const [overrideCompliance, { isLoading: overrideLoading }] =
    useOverrideComplianceBlockMutation();
  const [downloadAttachment] = useLazyDownloadAttachmentQuery();
  const [changeStatus] = useChangeStatusMutation();
  const [publishDocument, { isLoading: publishLoading }] =
    usePublishDocumentMutation();
  const [updateWallCrossStatus, { isLoading: wallCrossLoading }] =
    useUpdateWallCrossStatusMutation();
  const { showToast } = useUIOverlay();

  // Query params
  const accountName = settings.account?.AccountName || "";
  const srvrID = parseInt(settings.account?.SrvrID || "0", 10);
  const userID = parseInt(settings.account?.UserID?.toString() || "0", 10);
  const accountID = parseInt(settings.account?.AccountID || "0", 10);

  // Fetch user permissions for role-based visibility
  const permissionsParams =
    accountName && srvrID && userID && accountID
      ? {
          AccountName: accountName,
          SrvrID: srvrID,
          UserID: userID,
          AccountID: accountID,
        }
      : null;
  const { data: permissionsResponse } = useGetUserPermissionsQuery(
    permissionsParams!,
    {
      skip: !permissionsParams,
    },
  );
  const userRoles = permissionsResponse?.Data?.Roles || [];
  const controlPermissions =
    permissionsResponse?.Data?.ControlPermissions || [];

  const hasRole = useCallback(
    (roleName: string) => {
      return userRoles.some(
        (r) => r.RoleName.toLowerCase() === roleName.toLowerCase(),
      );
    },
    [userRoles],
  );

  const canPerformAction = useCallback(
    (controlName: string) => {
      if (controlPermissions.length === 0) return true;
      const allowedRoleIds = controlPermissions
        .filter((cp) => cp.ControlName === controlName)
        .map((cp) => cp.RoleID);
      return userRoles.some((r) => allowedRoleIds.includes(r.RoleID));
    },
    [controlPermissions, userRoles],
  );

  // Role-based visibility flags
  const isAnalyst = hasRole("Analyst");
  const isCompliance = hasRole("Compliance");
  const isPublisher = hasRole("Publisher");
  const isAdmin = hasRole("Admin");
  const isSupervisory = hasRole("Supervisory");

  // Get filters for priority dropdown and publisher type
  const filterParams =
    accountName && srvrID > 0
      ? { AccountName: accountName, SrvrID: srvrID }
      : null;
  const { data: filtersResponse, isLoading: filtersLoading } =
    useGetWorkflowFiltersQuery(filterParams!, {
      skip: !filterParams || (!priorityDialogOpen && !publishDialogOpen),
    });
  const priorities: PriorityOption[] = filtersResponse?.Data?.Priorities || [];
  const publisherType = filtersResponse?.Data?.PublisherType || "Default";
  const isPeelHuntPublisher = publisherType === "PeelHunt";

  // Fetch document history when status dialog or versions dialog opens
  const { data: historyResponse, isLoading: historyLoading } =
    useGetDocumentHistoryQuery(
      { accountName, docID: document.DocID, srvrID },
      {
        skip:
          (!statusDialogOpen && !versionsDialogOpen) || !accountName || !srvrID,
      },
    );
  const history: DocumentHistoryResponse[] = historyResponse?.Data || [];

  // Fetch document comments when comments dialog opens
  const {
    data: commentsResponse,
    isLoading: commentsLoading,
    refetch: refetchComments,
  } = useGetDocumentCommentsQuery(
    { accountName, docID: document.DocID, srvrID },
    { skip: !commentsDialogOpen || !accountName || !srvrID },
  );
  const comments: DocumentCommentResponse[] = commentsResponse?.Data || [];

  useEffect(() => {
    if (commentsDialogOpen && accountName) {
      refetchComments();
    }
  }, [commentsDialogOpen, accountName, refetchComments]);

  // Fetch attachments when attachments dialog opens
  const {
    data: attachmentsResponse,
    isLoading: attachmentsLoading,
    refetch: refetchAttachments,
  } = useGetDocumentAttachmentsQuery(
    { accountName, docID: document.DocID },
    { skip: !attachmentsDialogOpen || !accountName },
  );
  const attachments: AttachmentInfo[] = attachmentsResponse?.Data || [];

  // Fetch company mentions when dialog opens
  const { data: companyMentionsResponse, isLoading: companyMentionsLoading } =
    useGetCompanyMentionsQuery(
      {
        accountName,
        docID: document.DocID,
        accountID,
        srvrID,
        corpMentionIds: document.CorpMentionIDs || undefined,
      },
      { skip: !companyMentionsDialogOpen || !accountName || !srvrID },
    );
  const companyMentions: CompanyMention[] =
    companyMentionsResponse?.Data?.Mentions || [];

  // Fetch RIXML subjects when publish dialog opens
  const { data: rixmlSubjectsResponse, isLoading: rixmlSubjectsLoading } =
    useGetRIXMLSubjectsQuery(
      { accountName, accountID, srvrID },
      { skip: !publishDialogOpen || !accountName || !srvrID },
    );
  const rixmlSubjects: RIXMLSubject[] =
    rixmlSubjectsResponse?.Data?.Subjects || [];

  // Get unique versions from history
  const versions = useMemo(() => {
    const versionMap = new Map<number, DocumentHistoryResponse>();
    history.forEach((h) => {
      if (
        !versionMap.has(h.DocVersion) ||
        new Date(h.TimeStamp) >
          new Date(versionMap.get(h.DocVersion)!.TimeStamp)
      ) {
        versionMap.set(h.DocVersion, h);
      }
    });
    return Array.from(versionMap.values()).sort(
      (a, b) => b.DocVersion - a.DocVersion,
    );
  }, [history]);

  const isLoading =
    checkoutLoading ||
    checkinLoading ||
    approveLoading ||
    rejectLoading ||
    priorityLoading ||
    submitLoading ||
    killLoading ||
    breakLockLoading ||
    downloadLoading ||
    signOffLoading;

  const baseRequest = useCallback(
    () => ({
      AccountName: accountName,
      SrvrID: srvrID,
      DocID: document.DocID,
      UserID: userID,
      AccountID: accountID,
    }),
    [accountName, srvrID, document.DocID, userID, accountID],
  );

  // Helper function to trigger file download from base64
  const downloadFile = useCallback(
    (base64Data: string, fileName: string, contentType: string) => {
      const byteCharacters = atob(base64Data);
      const byteNumbers = new Array(byteCharacters.length);
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i);
      }
      const byteArray = new Uint8Array(byteNumbers);
      const blob = new Blob([byteArray], { type: contentType });
      const url = URL.createObjectURL(blob);
      const link = window.document.createElement("a");
      link.href = url;
      link.download = fileName;
      window.document.body.appendChild(link);
      link.click();
      window.document.body.removeChild(link);
      URL.revokeObjectURL(url);
    },
    [],
  );

  // DocType: 0=Original, 1=PDF
  const handleDownload = useCallback(
    async (docType: number = 0, docVersion?: number) => {
      try {
        const result = await downloadDoc({
          AccountName: accountName,
          SrvrID: srvrID,
          DocID: document.DocID,
          DocType: docType,
          DocVersion: docVersion,
        }).unwrap();

        if (result.Data?.Success && result.Data.BlobBase64) {
          const fileName =
            result.Data.DocName || `Presentation_${document.DocID}.pptx`;
          const contentType =
            result.Data.ContentType ||
            "application/vnd.openxmlformats-officedocument.presentationml.presentation";
          downloadFile(result.Data.BlobBase64, fileName, contentType);
        } else {
          console.error("Download failed:", result.Data?.Message);
        }
      } catch (error) {
        console.error("Download failed:", error);
      }
    },
    [downloadDoc, accountName, srvrID, document.DocID, downloadFile],
  );

  // Download RIXML via EFADocRetrieve for published documents
  const handleDownloadRIXML = useCallback(async () => {
    if (!document.DocGUID) {
      console.error("DocGUID not available for RIXML download");
      return;
    }
    try {
      const result = await downloadRIXML({
        AccountName: accountName,
        DocGUID: document.DocGUID,
        SrvrID: srvrID,
      }).unwrap();

      if (result.Data?.PDFBinary) {
        const fileName =
          result.Data.FileName || `${document.DocName || "Document"}_RIXML.xml`;
        downloadFile(result.Data.PDFBinary, fileName, "application/xml");
      } else {
        console.error("RIXML download failed: no data returned");
      }
    } catch (error) {
      console.error("RIXML download failed:", error);
    }
  }, [
    downloadRIXML,
    accountName,
    srvrID,
    document.DocGUID,
    document.DocName,
    downloadFile,
  ]);

  const handleCheckout = useCallback(async () => {
    try {
      await checkout(baseRequest()).unwrap();
      await handleDownload(0);
      onActionComplete?.();
    } catch (error) {
      console.error("Checkout failed:", error);
    }
  }, [checkout, baseRequest, handleDownload, onActionComplete]);

  const openCheckinDialog = useCallback(() => {
    setCheckinFile(null);
    setCheckinDialogOpen(true);
  }, []);

  const handleCheckinFileChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (file) {
        setCheckinFile(file);
      }
    },
    [],
  );

  const handleCheckinWithoutUpload = useCallback(async () => {
    try {
      await checkin(baseRequest()).unwrap();
      setCheckinDialogOpen(false);
      onActionComplete?.();
    } catch (error) {
      console.error("Checkin failed:", error);
    }
  }, [checkin, baseRequest, onActionComplete]);

  const handleCheckinWithUpload = useCallback(async () => {
    if (!checkinFile) return;
    setUploadingCheckin(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        try {
          const dataUrl = reader.result as string;
          const base64Content = dataUrl.split(",")[1];

          await checkin({
            ...baseRequest(),
            DocBlob: base64Content,
            DocName: document.DocName,
          }).unwrap();
          setCheckinDialogOpen(false);
          setCheckinFile(null);
          onActionComplete?.();
        } catch (error) {
          console.error("Checkin with upload failed:", error);
        } finally {
          setUploadingCheckin(false);
        }
      };
      reader.readAsDataURL(checkinFile);
    } catch (error) {
      console.error("File read failed:", error);
      setUploadingCheckin(false);
    }
  }, [checkin, baseRequest, checkinFile, onActionComplete, document.DocName]);

  const handleApprove = useCallback(async () => {
    try {
      await approve(baseRequest()).unwrap();
      onActionComplete?.();
    } catch (error) {
      console.error("Approve failed:", error);
    }
  }, [approve, baseRequest, onActionComplete]);

  const handleAnalystSignOff = useCallback(async () => {
    try {
      await analystSignOff({
        ...baseRequest(),
        DocName: document.DocName,
      }).unwrap();
      onActionComplete?.();
    } catch (error) {
      console.error("Analyst sign-off failed:", error);
    }
  }, [analystSignOff, baseRequest, document.DocName, onActionComplete]);

  const handleReject = useCallback(async () => {
    try {
      await reject({ ...baseRequest(), Reason: rejectReason }).unwrap();
      setRejectDialogOpen(false);
      setRejectReason("");
      onActionComplete?.();
    } catch (error) {
      console.error("Reject failed:", error);
    }
  }, [reject, baseRequest, rejectReason, onActionComplete]);

  const handleSubmitForReview = useCallback(async () => {
    try {
      await submitForReview(baseRequest()).unwrap();
      onActionComplete?.();
    } catch (error) {
      console.error("Submit for review failed:", error);
    }
  }, [submitForReview, baseRequest, onActionComplete]);

  const handleKill = useCallback(async () => {
    try {
      await killDocument(baseRequest()).unwrap();
      setDeleteDialogOpen(false);
      onDocumentDeleted?.(document.DocID);
      onActionComplete?.();
    } catch (error) {
      console.error("Kill failed:", error);
    }
  }, [
    killDocument,
    baseRequest,
    onActionComplete,
    onDocumentDeleted,
    document.DocID,
  ]);

  const handleBreakLock = useCallback(async () => {
    try {
      await breakLock(baseRequest()).unwrap();
      setBreakLockDialogOpen(false);
      onActionComplete?.();
    } catch (error) {
      console.error("Break lock failed:", error);
    }
  }, [breakLock, baseRequest, onActionComplete]);

  const handleChangePriority = useCallback(async () => {
    if (!selectedPriority) return;
    try {
      await changePriority({
        ...baseRequest(),
        PriorityID: parseInt(selectedPriority, 10),
      }).unwrap();
      setPriorityDialogOpen(false);
      setSelectedPriority("");
      onActionComplete?.();
    } catch (error) {
      console.error("Change priority failed:", error);
    }
  }, [changePriority, baseRequest, selectedPriority, onActionComplete]);

  const handleAddComment = useCallback(async () => {
    if (!newComment.trim()) return;
    try {
      const latestVersion = versions.length > 0 ? versions[0].DocVersion : 1;
      await addComment({
        ...baseRequest(),
        Comment: newComment,
        DocVersion: latestVersion,
        StatusName: document.StatusName || "Review",
      }).unwrap();
      setNewComment("");
      refetchComments();
    } catch (error) {
      console.error("Add comment failed:", error);
    }
  }, [
    addComment,
    baseRequest,
    newComment,
    document.StatusName,
    refetchComments,
    versions,
  ]);

  const handleOverrideCompliance = useCallback(async () => {
    try {
      const result = await overrideCompliance({
        ...baseRequest(),
      }).unwrap();
      if (result.Data?.Success) {
        onActionComplete?.();
      }
    } catch (error) {
      console.error("Override compliance failed:", error);
    }
  }, [overrideCompliance, baseRequest, onActionComplete]);

  const handlePublish = useCallback(async () => {
    try {
      const templateName = document.TemplateName || "";
      const matchingSubject = rixmlSubjects.find(
        (s) =>
          s.SubjectPublisherDefined.toLowerCase() ===
          templateName.toLowerCase(),
      );

      const result = await publishDocument({
        ...baseRequest(),
        DocName: document.DocName,
        SubjectEnum: matchingSubject?.SubjectEnum || "",
        SubjectPublisherDefined:
          matchingSubject?.SubjectPublisherDefined || templateName,
        DistributeToPeelHunt: distributeToPeelHunt,
        DistributeToSingleTrack: distributeToSingleTrack,
      }).unwrap();
      if (result.Data?.Success) {
        setPublishDialogOpen(false);
        showToast(
          "Document Published",
          result.Data?.Message || "Document has been published successfully.",
          "success",
        );
        onActionComplete?.();
      } else {
        showToast(
          "Publish Failed",
          result.Message ||
            result.Data?.Message ||
            "Failed to publish document.",
          "error",
        );
      }
    } catch (error: unknown) {
      console.error("Publish failed:", error);
      const errorMessage =
        (error as { data?: { Message?: string } })?.data?.Message ||
        (error as Error)?.message ||
        "An unexpected error occurred while publishing.";
      showToast("Publish Failed", errorMessage, "error");
    }
  }, [
    publishDocument,
    baseRequest,
    document.DocName,
    document.TemplateName,
    rixmlSubjects,
    distributeToPeelHunt,
    distributeToSingleTrack,
    onActionComplete,
    showToast,
  ]);

  const handleRetract = useCallback(async () => {
    try {
      const result = await changeStatus({
        ...baseRequest(),
        NewStatus: "Review",
      }).unwrap();
      if (result.Data?.Success) {
        setRetractDialogOpen(false);
        setRetractReason("");
        onActionComplete?.();
      }
    } catch (error) {
      console.error("Retract failed:", error);
    }
  }, [changeStatus, baseRequest, onActionComplete]);

  const handleUpdateWallCrossStatus = useCallback(async () => {
    try {
      const result = await updateWallCrossStatus({
        ...baseRequest(),
        WallCrossStatus: selectedWallCrossStatus,
      }).unwrap();
      if (result.Data?.Success) {
        setWallCrossDialogOpen(false);
        onActionComplete?.();
      }
    } catch (error) {
      console.error("Update wall-cross status failed:", error);
    }
  }, [
    updateWallCrossStatus,
    baseRequest,
    selectedWallCrossStatus,
    onActionComplete,
  ]);

  // Initialize wall-cross status when dialog opens
  const openWallCrossDialog = useCallback(() => {
    if (document.IsWallCrossed) {
      setSelectedWallCrossStatus(document.IsNonPublic ? "nonPublic" : "public");
    } else {
      setSelectedWallCrossStatus("none");
    }
    setWallCrossDialogOpen(true);
  }, [document.IsWallCrossed, document.IsNonPublic]);

  /**
   * Open in PowerPoint — downloads the document and opens it in a new PowerPoint window.
   * Unlike the Word version, we do NOT set document custom properties (DocVariables)
   * because PowerPoint.createPresentation() opens in a new window without access
   * to the add-in's context. State is managed entirely through Redux.
   */
  const handleOpenInPowerPoint = useCallback(
    async (mode: "edit" | "view") => {
      setOpenInPowerPointLoading(true);
      dispatch(setLoading(true));

      try {
        // If edit mode, checkout the document first
        if (mode === "edit") {
          await checkout(baseRequest()).unwrap();
        }

        // Fetch the document blob
        const result = await downloadDoc({
          AccountName: accountName,
          SrvrID: srvrID,
          DocID: document.DocID,
          DocType: 0,
        }).unwrap();

        if (!result.Data?.Success || !result.Data.BlobBase64) {
          throw new Error(
            result.Data?.Message || "Failed to download presentation",
          );
        }

        // Open in a new PowerPoint window
        await openPresentationFromBase64(result.Data.BlobBase64);

        // Store opened document state in Redux
        dispatch(
          setOpenedDocument({
            document: document,
            isCheckedOut: mode === "edit",
            isViewOnly: mode === "view",
            originalBlob: result.Data.BlobBase64,
          }),
        );

        // Close the dialog
        setOpenInPowerPointDialogOpen(false);

        // Navigate to the document workflow page
        navigate("/document-workflow");
      } catch (error) {
        console.error("Open in PowerPoint failed:", error);
        dispatch(
          setError(
            error instanceof Error
              ? error.message
              : "Failed to open presentation",
          ),
        );

        // If we checked out but failed to open, check back in
        if (mode === "edit") {
          try {
            await checkin(baseRequest()).unwrap();
          } catch {
            // Ignore checkin error - user can manually check in later
          }
        }
      } finally {
        setOpenInPowerPointLoading(false);
        dispatch(setLoading(false));
      }
    },
    [
      checkout,
      checkin,
      downloadDoc,
      baseRequest,
      accountName,
      srvrID,
      document,
      dispatch,
      navigate,
    ],
  );

  const handleDeleteAttachment = useCallback(
    async (fileName: string) => {
      try {
        await deleteAttachment({
          accountName,
          docID: document.DocID,
          fileName,
        }).unwrap();
        refetchAttachments();
      } catch (error) {
        console.error("Delete attachment failed:", error);
      }
    },
    [deleteAttachment, accountName, document.DocID, refetchAttachments],
  );

  const handleDownloadAttachment = useCallback(
    async (fileName: string) => {
      try {
        const result = await downloadAttachment({
          accountName,
          docID: document.DocID,
          fileName,
        }).unwrap();

        if (result.Data?.BlobBase64) {
          const byteCharacters = atob(result.Data.BlobBase64);
          const byteNumbers = new Array(byteCharacters.length);
          for (let i = 0; i < byteCharacters.length; i++) {
            byteNumbers[i] = byteCharacters.charCodeAt(i);
          }
          const byteArray = new Uint8Array(byteNumbers);
          const blob = new Blob([byteArray], {
            type: "application/octet-stream",
          });
          const url = window.URL.createObjectURL(blob);
          const a = window.document.createElement("a");
          a.href = url;
          a.download = fileName;
          window.document.body.appendChild(a);
          a.click();
          window.URL.revokeObjectURL(url);
          window.document.body.removeChild(a);
        }
      } catch (error) {
        console.error("Download attachment failed:", error);
      }
    },
    [downloadAttachment, accountName, document.DocID],
  );

  const isDocumentLocked = !!document.LockingUser;
  const status = document.StatusName as WorkflowStatus;

  // Role-based action visibility
  const canCheckout =
    status !== "Published" && canPerformAction("btnLock_Unlock");
  const canBreakLock =
    isDocumentLocked &&
    (isAdmin || isSupervisory || canPerformAction("btnBreakLock"));
  const canSubmitForReview =
    status === "Drafts" && canPerformAction("btnReview");
  const canApprove =
    status === "Review" &&
    (isCompliance ||
      isSupervisory ||
      isPublisher ||
      canPerformAction("btnApprove"));
  const canReject =
    status === "Review" &&
    (isCompliance || isSupervisory || canPerformAction("btnReject"));
  const canAnalystSignOff =
    status === "Review" && isAnalyst && canPerformAction("btnApproveAnalyst");
  const canChangePriority =
    status !== "Published" && canPerformAction("btnPriority");
  const canDelete = status === "Drafts" && canPerformAction("btnKillDraft");
  const canPublish =
    (status === "Final" || status === "Finalised") &&
    (isPublisher || isAdmin || canPerformAction("btnPublish"));
  const canRetract =
    (status === "Final" || status === "Finalised") &&
    (isPublisher || isAdmin || canPerformAction("btnRetractFinal"));
  const canViewStatus =
    canPerformAction("btnStatusReview") ||
    canPerformAction("btnStatusDraft") ||
    canPerformAction("btnStatusFinal");
  const canViewComments =
    canPerformAction("btnCommentaryReview") ||
    canPerformAction("btnCommentaryDraft");

  return (
    <>
      {isLoading && <Spinner size="tiny" />}

      <Menu open={open} onOpenChange={(_, data) => onOpenChange?.(data.open)}>
        <MenuTrigger disableButtonEnhancement>
          {children || (
            <Button
              icon={<MoreHorizontal20Regular />}
              appearance="subtle"
              size="small"
              className={styles.actionButton}
              disabled={isLoading}
            />
          )}
        </MenuTrigger>

        <MenuPopover
          positioning={{
            position: "below-start",
            autoSize: "height",
            flipBoundary: "window",
            overflowBoundary: "window",
          }}
        >
          <MenuList className={styles.menuList}>
            {/* Open in PowerPoint - opens presentation in a new PowerPoint window */}
            <MenuItem
              icon={<Open20Regular />}
              onClick={() => setOpenInPowerPointDialogOpen(true)}
            >
              Open in PowerPoint
            </MenuItem>

            <MenuDivider />

            {/* Checkout/Checkin */}
            {canCheckout && (
              <>
                {isDocumentLocked ? (
                  <MenuItem
                    icon={<LockOpen20Regular />}
                    onClick={openCheckinDialog}
                  >
                    Check In
                  </MenuItem>
                ) : (
                  <MenuItem
                    icon={<LockClosed20Regular />}
                    onClick={handleCheckout}
                  >
                    Check Out
                  </MenuItem>
                )}
              </>
            )}

            {/* Break Lock */}
            {canBreakLock && (
              <MenuItem
                icon={<LockOpen20Regular />}
                onClick={() => setBreakLockDialogOpen(true)}
              >
                Break Lock
              </MenuItem>
            )}

            {(canCheckout || canBreakLock) &&
              (canSubmitForReview ||
                canAnalystSignOff ||
                canPublish ||
                canApprove ||
                canReject) && <MenuDivider />}

            {/* Submit for Review - only for Drafts */}
            {canSubmitForReview && (
              <MenuItem
                icon={<ArrowForward20Regular />}
                onClick={handleSubmitForReview}
              >
                Submit for Review
              </MenuItem>
            )}

            {/* Analyst Sign-off */}
            {canAnalystSignOff && (
              <MenuItem
                icon={<Signature20Regular />}
                onClick={handleAnalystSignOff}
                disabled={signOffLoading}
              >
                Analyst Sign-off
              </MenuItem>
            )}

            {/* Publish - only for Final tab */}
            {canPublish && (
              <MenuItem
                icon={<Send20Regular />}
                onClick={() => {
                  // PowerPoint files are always allowed; non-FPW reports need warning
                  const isPowerPoint =
                    document.DocName?.toLowerCase().endsWith(".pptx") ||
                    document.DocName?.toLowerCase().endsWith(".ppt");
                  if (!document.EFADRINReport && !isPowerPoint) {
                    setNonFpwPublishWarningOpen(true);
                  } else {
                    setPublishDialogOpen(true);
                  }
                }}
              >
                Publish Report
              </MenuItem>
            )}

            {/* Retract */}
            {canRetract && (
              <MenuItem
                icon={<ArrowUndo20Regular />}
                onClick={() => setRetractDialogOpen(true)}
              >
                Retract to Review
              </MenuItem>
            )}

            {/* Approve */}
            {canApprove && (
              <MenuItem icon={<Checkmark20Regular />} onClick={handleApprove}>
                Approve
              </MenuItem>
            )}

            {/* Reject */}
            {canReject && (
              <MenuItem
                icon={<Dismiss20Regular />}
                onClick={() => setRejectDialogOpen(true)}
              >
                Reject
              </MenuItem>
            )}

            {(canCheckout ||
              canBreakLock ||
              canSubmitForReview ||
              canAnalystSignOff ||
              canPublish ||
              canApprove ||
              canReject) && <MenuDivider />}

            {/* Change Priority */}
            {canChangePriority && (
              <MenuItem
                icon={<Flag20Regular />}
                onClick={() => setPriorityDialogOpen(true)}
              >
                Change Priority
                {document.PriorityName && (
                  <Badge
                    appearance="tint"
                    size="small"
                    className={styles.statusBadge}
                  >
                    {document.PriorityName}
                  </Badge>
                )}
              </MenuItem>
            )}

            {/* Wall-Cross Status */}
            <MenuItem
              icon={<ShieldLock20Regular />}
              onClick={() => {
                if (onOpenWallCrossSheet) {
                  onOpenChange?.(false);
                  onOpenWallCrossSheet(document);
                } else {
                  openWallCrossDialog();
                }
              }}
            >
              Wall-Cross Status
              {document.IsWallCrossed && (
                <Badge
                  appearance="filled"
                  size="small"
                  className={styles.statusBadge}
                  style={{
                    backgroundColor: document.IsNonPublic
                      ? "#d13438"
                      : "#ffc83d",
                    color: document.IsNonPublic ? "white" : "black",
                  }}
                >
                  {document.IsNonPublic ? "Non-Public" : "Public"}
                </Badge>
              )}
            </MenuItem>

            {/* View Status / History */}
            {canViewStatus && (
              <MenuItem
                icon={<History20Regular />}
                onClick={() => setStatusDialogOpen(true)}
              >
                View Status
              </MenuItem>
            )}

            {/* Commentary */}
            <MenuItem
              icon={<Comment20Regular />}
              onClick={() => {
                if (onOpenCommentsSheet) {
                  onOpenChange?.(false);
                  onOpenCommentsSheet(document);
                } else {
                  setCommentsDialogOpen(true);
                }
              }}
            >
              Commentary ({document.Comment || 0})
            </MenuItem>

            {/* Previous Versions */}
            <MenuItem
              icon={<DocumentMultiple20Regular />}
              onClick={() => setVersionsDialogOpen(true)}
            >
              Previous Versions
            </MenuItem>

            {/* Manage Attachments */}
            <MenuItem
              icon={<Attach20Regular />}
              onClick={() => setAttachmentsDialogOpen(true)}
            >
              Manage Attachments
              {document.Attachment && (
                <Badge
                  appearance="filled"
                  size="small"
                  className={styles.statusBadge}
                >
                  {document.Attachment}
                </Badge>
              )}
            </MenuItem>

            {/* Company Mentions */}
            <MenuItem
              icon={<Building20Regular />}
              onClick={() => setCompanyMentionsDialogOpen(true)}
            >
              Company Mentions
            </MenuItem>

            {/* Override Compliance Block - Admin only */}
            {isAdmin &&
              (status === "Review" ||
                status === "Final" ||
                status === "Published") &&
              document.ComplianceWarning === 2 && (
                <MenuItem
                  icon={<Shield20Regular />}
                  onClick={handleOverrideCompliance}
                  disabled={overrideLoading}
                >
                  {overrideLoading
                    ? "Overriding..."
                    : "Override Compliance Block"}
                </MenuItem>
              )}

            <MenuDivider />

            {/* Download */}
            <MenuItem
              icon={<ArrowDownload20Regular />}
              onClick={() => handleDownload(0)}
            >
              Download Presentation
            </MenuItem>
            {status === "Published" && (
              <MenuItem
                icon={<ArrowDownload20Regular />}
                onClick={() => handleDownload(1)}
              >
                Download PDF
              </MenuItem>
            )}
            {status === "Published" && document.DocGUID && (
              <MenuItem
                icon={<ArrowDownload20Regular />}
                onClick={handleDownloadRIXML}
                disabled={rixmlDownloadLoading}
              >
                {rixmlDownloadLoading ? "Downloading..." : "Download RIXML"}
              </MenuItem>
            )}

            {/* Delete - only for Drafts */}
            {canDelete && <MenuDivider />}
            {canDelete && (
              <MenuItem
                icon={<Delete20Regular />}
                onClick={() => setDeleteDialogOpen(true)}
              >
                Delete
              </MenuItem>
            )}
          </MenuList>
        </MenuPopover>
      </Menu>

      {/* View Status Bottom Sheet */}
      <BottomSheet
        open={statusDialogOpen}
        onClose={() => setStatusDialogOpen(false)}
        title="Document Status History"
        subtitle={document.DocName}
        icon={<History24Regular />}
      >
        {historyLoading ? (
          <div className={styles.emptyState}>
            <Spinner size="small" />
          </div>
        ) : history.length === 0 ? (
          <div className={styles.emptyState}>No history available</div>
        ) : (
          history.map((item, index) => (
            <div key={index} className={styles.historyItem}>
              <div className={styles.historyHeader}>
                <Text className={styles.historyStatus}>{item.StatusName}</Text>
                <Text className={styles.historyTime}>
                  {format(new Date(item.TimeStamp), "MMM d, yyyy h:mm a")}
                </Text>
              </div>
              <Text className={styles.historyUser}>
                By {item.FullName} • Version {item.DocVersion}
              </Text>
            </div>
          ))
        )}
      </BottomSheet>

      {/* Commentary Bottom Sheet */}
      <BottomSheet
        open={commentsDialogOpen}
        onClose={() => setCommentsDialogOpen(false)}
        title="Document Commentary"
        subtitle={document.DocName}
        maxHeight="80vh"
        footer={
          <div style={{ display: "flex", gap: "8px", width: "100%" }}>
            <Textarea
              value={newComment}
              onChange={(_, data) => setNewComment(data.value)}
              placeholder="Add a comment..."
              style={{ flex: 1, minHeight: "36px" }}
            />
            <Button
              appearance="primary"
              icon={addingComment ? <Spinner size="tiny" /> : <Add20Regular />}
              onClick={handleAddComment}
              disabled={!newComment.trim() || addingComment}
              style={{ minWidth: "36px", height: "36px" }}
            />
          </div>
        }
      >
        {commentsLoading ? (
          <div className={styles.emptyState}>
            <Spinner size="small" />
          </div>
        ) : comments.length === 0 ? (
          <div className={styles.emptyState}>No comments yet</div>
        ) : (
          comments.map((comment, index) => (
            <div key={index} className={styles.commentItem}>
              <div className={styles.commentHeader}>
                <Text className={styles.commentUser}>{comment.FullName}</Text>
                <Text className={styles.commentTime}>
                  {formatDistanceToNow(new Date(comment.TimeRecord), {
                    addSuffix: true,
                  })}
                </Text>
              </div>
              <Text className={styles.commentText}>{comment.Comment}</Text>
              <Badge
                appearance="outline"
                size="small"
                style={{ marginTop: "6px" }}
              >
                {comment.StatusName} • v{comment.DocVersion}
              </Badge>
            </div>
          ))
        )}
      </BottomSheet>

      {/* Previous Versions Bottom Sheet */}
      <BottomSheet
        open={versionsDialogOpen}
        onClose={() => setVersionsDialogOpen(false)}
        title="Previous Versions"
        subtitle={document.DocName}
        icon={<DocumentMultiple24Regular />}
      >
        {historyLoading ? (
          <div className={styles.emptyState}>
            <Spinner size="small" />
          </div>
        ) : versions.length === 0 ? (
          <div className={styles.emptyState}>No versions available</div>
        ) : (
          versions.map((version) => (
            <div key={version.DocVersion} className={styles.versionItem}>
              <div className={styles.versionInfo}>
                <Text className={styles.versionNumber}>
                  Version {version.DocVersion}
                </Text>
                <Text className={styles.versionMeta}>
                  {version.FullName} •{" "}
                  {format(new Date(version.TimeStamp), "MMM d, yyyy")}
                </Text>
              </div>
              <Button
                appearance="subtle"
                icon={<ArrowDownload20Regular />}
                onClick={() => handleDownload(0, version.DocVersion)}
                size="small"
              >
                Download
              </Button>
            </div>
          ))
        )}
      </BottomSheet>

      {/* Reject Bottom Sheet */}
      <BottomSheet
        open={rejectDialogOpen}
        onClose={() => setRejectDialogOpen(false)}
        title="Reject Document"
        subtitle={document.DocName}
        icon={<Dismiss24Regular />}
        footer={
          <>
            <Button
              appearance="secondary"
              onClick={() => setRejectDialogOpen(false)}
              className={bottomSheetStyles.footerButton}
            >
              Cancel
            </Button>
            <Button
              appearance="primary"
              onClick={handleReject}
              disabled={!rejectReason.trim() || rejectLoading}
              className={bottomSheetStyles.footerButton}
            >
              {rejectLoading ? <Spinner size="tiny" /> : "Reject"}
            </Button>
          </>
        }
      >
        <div className={styles.sheetContent}>
          <Text className={styles.warningText}>
            Please provide a reason for rejection:
          </Text>
          <Textarea
            value={rejectReason}
            onChange={(_, data) => setRejectReason(data.value)}
            placeholder="Enter reason for rejection..."
            className={styles.textarea}
          />
        </div>
      </BottomSheet>

      {/* Priority Bottom Sheet */}
      <BottomSheet
        open={priorityDialogOpen}
        onClose={() => setPriorityDialogOpen(false)}
        title="Change Priority"
        subtitle={document.DocName}
        icon={<Flag24Regular />}
        footer={
          <>
            <Button
              appearance="secondary"
              onClick={() => setPriorityDialogOpen(false)}
              className={bottomSheetStyles.footerButton}
            >
              Cancel
            </Button>
            <Button
              appearance="primary"
              onClick={handleChangePriority}
              disabled={!selectedPriority || priorityLoading}
              className={bottomSheetStyles.footerButton}
            >
              {priorityLoading ? <Spinner size="tiny" /> : "Change Priority"}
            </Button>
          </>
        }
      >
        <div className={styles.sheetContent}>
          {filtersLoading ? (
            <div className={styles.emptyState}>
              <Spinner size="small" label="Loading priorities..." />
            </div>
          ) : priorities.length === 0 ? (
            <Text>No priorities available</Text>
          ) : (
            <div className={styles.optionsContainer}>
              {priorities.map((p) => {
                const isSelected = selectedPriority === p.PriorityID.toString();
                return (
                  <div
                    key={p.PriorityID}
                    className={`${styles.optionCard} ${isSelected ? styles.optionCardSelected : ""}`}
                    onClick={() => setSelectedPriority(p.PriorityID.toString())}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" || e.key === " ") {
                        e.preventDefault();
                        setSelectedPriority(p.PriorityID.toString());
                      }
                    }}
                  >
                    <div className={styles.optionIconWrapper}>
                      <Flag20Regular className={styles.optionIcon} />
                    </div>
                    <div className={styles.optionContent}>
                      <div className={styles.optionTitle}>{p.PriorityName}</div>
                    </div>
                    {isSelected && (
                      <Checkmark20Filled className={styles.checkmark} />
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </BottomSheet>

      {/* Delete Confirmation Bottom Sheet */}
      <BottomSheet
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        title="Delete Document"
        subtitle={document.DocName}
        icon={<Delete24Regular />}
        footer={
          <>
            <Button
              appearance="secondary"
              onClick={() => setDeleteDialogOpen(false)}
              className={bottomSheetStyles.footerButton}
            >
              Cancel
            </Button>
            <Button
              appearance="primary"
              onClick={handleKill}
              disabled={killLoading}
              className={bottomSheetStyles.footerButton}
              style={{ backgroundColor: tokens.colorPaletteRedBackground3 }}
            >
              {killLoading ? <Spinner size="tiny" /> : "Delete"}
            </Button>
          </>
        }
      >
        <div className={styles.sheetContent}>
          <Text className={styles.warningText}>
            Are you sure you want to delete{" "}
            <span className={styles.warningHighlight}>{document.DocName}</span>?
          </Text>
          <Text
            className={styles.warningText}
            style={{
              color: tokens.colorPaletteRedForeground1,
              marginTop: "8px",
            }}
          >
            This action cannot be undone.
          </Text>
        </div>
      </BottomSheet>

      {/* Break Lock Confirmation Bottom Sheet */}
      <BottomSheet
        open={breakLockDialogOpen}
        onClose={() => setBreakLockDialogOpen(false)}
        title="Break Document Lock"
        subtitle={document.DocName}
        icon={<LockOpen24Regular />}
        footer={
          <>
            <Button
              appearance="secondary"
              onClick={() => setBreakLockDialogOpen(false)}
              className={bottomSheetStyles.footerButton}
            >
              Cancel
            </Button>
            <Button
              appearance="primary"
              onClick={handleBreakLock}
              disabled={breakLockLoading}
              className={bottomSheetStyles.footerButton}
            >
              {breakLockLoading ? <Spinner size="tiny" /> : "Break Lock"}
            </Button>
          </>
        }
      >
        <div className={styles.sheetContent}>
          <Text className={styles.warningText}>
            Are you sure you want to break the lock on this document?
          </Text>
          <Text
            className={styles.warningText}
            style={{
              color: tokens.colorPaletteYellowForeground2,
              marginTop: "8px",
            }}
          >
            The user who locked it may lose unsaved changes.
          </Text>
        </div>
      </BottomSheet>

      {/* Check In Bottom Sheet */}
      <BottomSheet
        open={checkinDialogOpen}
        onClose={() => setCheckinDialogOpen(false)}
        title="Check In Document"
        subtitle={document.DocName}
        icon={<ArrowUpload24Regular />}
        footer={
          <>
            <Button
              appearance="secondary"
              onClick={() => setCheckinDialogOpen(false)}
              className={bottomSheetStyles.footerButton}
              disabled={checkinLoading || uploadingCheckin}
            >
              Cancel
            </Button>
            <Button
              appearance="secondary"
              onClick={handleCheckinWithoutUpload}
              disabled={checkinLoading || uploadingCheckin}
              className={bottomSheetStyles.footerButton}
            >
              {checkinLoading ? <Spinner size="tiny" /> : "Check In Only"}
            </Button>
            <Button
              appearance="primary"
              onClick={handleCheckinWithUpload}
              disabled={!checkinFile || checkinLoading || uploadingCheckin}
              className={bottomSheetStyles.footerButton}
            >
              {uploadingCheckin ? <Spinner size="tiny" /> : "Upload & Check In"}
            </Button>
          </>
        }
      >
        <div className={styles.sheetContent}>
          <Text className={styles.warningText}>
            Do you want to upload the presentation you worked on before checking
            in?
          </Text>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleCheckinFileChange}
            accept=".pptx,.ppt"
            style={{ display: "none" }}
          />
          <div
            className={`${styles.fileUploadArea} ${checkinFile ? styles.fileSelected : ""}`}
            onClick={() => fileInputRef.current?.click()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
          >
            {checkinFile ? (
              <>
                <Text style={{ fontWeight: 600 }}>{checkinFile.name}</Text>
                <Text
                  style={{
                    fontSize: "12px",
                    color: tokens.colorNeutralForeground3,
                    marginTop: "4px",
                  }}
                >
                  Click to change file
                </Text>
              </>
            ) : (
              <>
                <ArrowUpload24Regular
                  style={{
                    fontSize: "32px",
                    color: tokens.colorNeutralForeground3,
                  }}
                />
                <Text
                  style={{
                    marginTop: "8px",
                    color: tokens.colorNeutralForeground2,
                  }}
                >
                  Click to select a presentation
                </Text>
                <Text
                  style={{
                    fontSize: "12px",
                    color: tokens.colorNeutralForeground3,
                    marginTop: "4px",
                  }}
                >
                  Accepts .ppt and .pptx files
                </Text>
              </>
            )}
          </div>
        </div>
      </BottomSheet>

      {/* Attachments Bottom Sheet */}
      <BottomSheet
        open={attachmentsDialogOpen}
        onClose={() => setAttachmentsDialogOpen(false)}
        title="Manage Attachments"
        subtitle={document.DocName}
        icon={<Attach24Regular />}
      >
        {attachmentsLoading ? (
          <div className={styles.emptyState}>
            <Spinner size="small" />
          </div>
        ) : attachments.length === 0 ? (
          <div className={styles.emptyState}>No attachments</div>
        ) : (
          attachments.map((attachment, idx) => (
            <div key={idx} className={styles.historyItem}>
              <div>
                <Text weight="semibold">{attachment.FileName}</Text>
                <div
                  style={{
                    fontSize: "12px",
                    color: tokens.colorNeutralForeground2,
                  }}
                >
                  Uploaded by {attachment.UploadedBy} on{" "}
                  {format(new Date(attachment.TimeStamp), "MMM d, yyyy h:mm a")}
                </div>
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                <Button
                  size="small"
                  appearance="subtle"
                  icon={<ArrowDownload20Regular />}
                  onClick={() => handleDownloadAttachment(attachment.FileName)}
                />
                <Button
                  size="small"
                  appearance="subtle"
                  icon={<Delete20Regular />}
                  onClick={() => handleDeleteAttachment(attachment.FileName)}
                />
              </div>
            </div>
          ))
        )}
      </BottomSheet>

      {/* Company Mentions Bottom Sheet */}
      <BottomSheet
        open={companyMentionsDialogOpen}
        onClose={() => setCompanyMentionsDialogOpen(false)}
        title="Company Mentions"
        subtitle={document.DocName}
        icon={<Building24Regular />}
      >
        {companyMentionsLoading ? (
          <div className={styles.emptyState}>
            <Spinner size="small" />
          </div>
        ) : companyMentions.length === 0 ? (
          <div className={styles.emptyState}>No company mentions found</div>
        ) : (
          companyMentions.map((company) => (
            <div key={company.CorpID} className={styles.historyItem}>
              <div>
                <Text weight="semibold">{company.CorpName}</Text>
                {company.CorpNameLocal &&
                  company.CorpNameLocal !== company.CorpName && (
                    <div
                      style={{
                        fontSize: "12px",
                        color: tokens.colorNeutralForeground2,
                      }}
                    >
                      {company.CorpNameLocal}
                    </div>
                  )}
              </div>
              <div style={{ display: "flex", gap: "8px" }}>
                {company.IsOnWatchList && (
                  <Badge appearance="tint" color="warning" size="small">
                    Watch List
                  </Badge>
                )}
                {company.IsOnRelationshipList && (
                  <Badge appearance="tint" color="success" size="small">
                    Relationship
                  </Badge>
                )}
              </div>
            </div>
          ))
        )}
      </BottomSheet>

      {/* Publish Bottom Sheet */}
      <BottomSheet
        open={publishDialogOpen}
        onClose={() => setPublishDialogOpen(false)}
        title="Publish Report"
        subtitle={document.DocName}
        icon={<Send24Regular />}
        footer={
          <>
            <Button
              appearance="secondary"
              onClick={() => setPublishDialogOpen(false)}
              className={bottomSheetStyles.footerButton}
            >
              Cancel
            </Button>
            <Button
              appearance="primary"
              onClick={handlePublish}
              disabled={publishLoading || filtersLoading}
              className={bottomSheetStyles.footerButton}
            >
              {publishLoading ? <Spinner size="tiny" /> : "Publish"}
            </Button>
          </>
        }
      >
        <div className={styles.sheetContent}>
          {filtersLoading ? (
            <div className={styles.emptyState}>
              <Spinner size="small" label="Loading options..." />
            </div>
          ) : isPeelHuntPublisher ? (
            <div className={styles.optionsContainer}>
              <div
                className={`${styles.optionCard} ${distributeToPeelHunt ? styles.optionCardSelected : ""}`}
                onClick={() => setDistributeToPeelHunt(!distributeToPeelHunt)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setDistributeToPeelHunt(!distributeToPeelHunt);
                  }
                }}
              >
                <div className={styles.optionContent}>
                  <div className={styles.optionTitle}>
                    Distribute To Peel Hunt
                  </div>
                  <div className={styles.optionDescription}>
                    Send to Peel Hunt distribution network
                  </div>
                </div>
                {distributeToPeelHunt && (
                  <Checkmark20Filled className={styles.checkmark} />
                )}
              </div>
              <div
                className={`${styles.optionCard} ${distributeToSingleTrack ? styles.optionCardSelected : ""}`}
                onClick={() =>
                  setDistributeToSingleTrack(!distributeToSingleTrack)
                }
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setDistributeToSingleTrack(!distributeToSingleTrack);
                  }
                }}
              >
                <div className={styles.optionContent}>
                  <div className={styles.optionTitle}>
                    Distribute To Single Track
                  </div>
                  <div className={styles.optionDescription}>
                    Send to Single Track distribution network
                  </div>
                </div>
                {distributeToSingleTrack && (
                  <Checkmark20Filled className={styles.checkmark} />
                )}
              </div>
            </div>
          ) : (
            <div className={styles.optionsContainer}>
              <div
                className={`${styles.optionCard} ${distributeToSingleTrack ? styles.optionCardSelected : ""}`}
                onClick={() =>
                  setDistributeToSingleTrack(!distributeToSingleTrack)
                }
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setDistributeToSingleTrack(!distributeToSingleTrack);
                  }
                }}
              >
                <div className={styles.optionContent}>
                  <div className={styles.optionTitle}>
                    Distribute for publication
                  </div>
                  <div className={styles.optionDescription}>
                    Publish to distribution networks
                  </div>
                </div>
                {distributeToSingleTrack && (
                  <Checkmark20Filled className={styles.checkmark} />
                )}
              </div>
            </div>
          )}
        </div>
      </BottomSheet>

      {/* Retract Bottom Sheet */}
      <BottomSheet
        open={retractDialogOpen}
        onClose={() => setRetractDialogOpen(false)}
        title="Retract Document"
        subtitle={document.DocName}
        icon={<ArrowUndo24Regular />}
        footer={
          <>
            <Button
              appearance="secondary"
              onClick={() => setRetractDialogOpen(false)}
              className={bottomSheetStyles.footerButton}
            >
              Cancel
            </Button>
            <Button
              appearance="primary"
              onClick={handleRetract}
              className={bottomSheetStyles.footerButton}
            >
              Retract to Review
            </Button>
          </>
        }
      >
        <div className={styles.sheetContent}>
          <Text className={styles.warningText}>
            This will move the document back to Review status.
          </Text>
          <Text
            className={styles.warningText}
            style={{ fontSize: "13px", marginTop: "8px" }}
          >
            The document will need to go through the approval process again
            before it can be finalized.
          </Text>
          <Textarea
            value={retractReason}
            onChange={(_, data) => setRetractReason(data.value)}
            placeholder="Reason for retraction (optional)..."
            className={styles.textarea}
            style={{ marginTop: "12px" }}
          />
        </div>
      </BottomSheet>

      {/* Wall-Cross Status Bottom Sheet */}
      <BottomSheet
        open={wallCrossDialogOpen}
        onClose={() => setWallCrossDialogOpen(false)}
        title="Wall-Cross Status"
        subtitle={document.DocName}
        icon={<ShieldLock24Regular />}
        footer={
          <>
            <Button
              appearance="secondary"
              onClick={() => setWallCrossDialogOpen(false)}
              className={bottomSheetStyles.footerButton}
              disabled={wallCrossLoading}
            >
              Cancel
            </Button>
            <Button
              appearance="primary"
              onClick={handleUpdateWallCrossStatus}
              disabled={wallCrossLoading}
              className={bottomSheetStyles.footerButton}
            >
              {wallCrossLoading ? <Spinner size="tiny" /> : "Update Status"}
            </Button>
          </>
        }
      >
        <div className={styles.optionsContainer}>
          {/* Not Wall-Crossed Option */}
          <div
            className={`${styles.optionCard} ${styles.optionCardNone} ${selectedWallCrossStatus === "none" ? styles.optionCardNoneSelected : ""}`}
            onClick={() => setSelectedWallCrossStatus("none")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setSelectedWallCrossStatus("none");
              }
            }}
          >
            <div
              className={`${styles.optionIconWrapper} ${styles.optionIconWrapperNone}`}
            >
              <ShieldCheckmark24Regular className={styles.optionIconNone} />
            </div>
            <div className={styles.optionContent}>
              <div className={styles.optionTitle}>Not Wall-Crossed</div>
              <div className={styles.optionDescription}>
                This document does not contain wall-crossed information
              </div>
            </div>
            {selectedWallCrossStatus === "none" && (
              <Checkmark20Filled
                className={`${styles.checkmark} ${styles.checkmarkNone}`}
              />
            )}
          </div>

          {/* Public Information Option */}
          <div
            className={`${styles.optionCard} ${styles.optionCardPublic} ${selectedWallCrossStatus === "public" ? styles.optionCardPublicSelected : ""}`}
            onClick={() => setSelectedWallCrossStatus("public")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setSelectedWallCrossStatus("public");
              }
            }}
          >
            <div
              className={`${styles.optionIconWrapper} ${styles.optionIconWrapperPublic}`}
            >
              <ShieldLock24Regular className={styles.optionIconPublic} />
            </div>
            <div className={styles.optionContent}>
              <div className={styles.optionTitle}>
                Wall-Crossed (Public Information Only)
              </div>
              <div className={styles.optionDescription}>
                This document contains public information about a wall-crossed
                event
              </div>
            </div>
            {selectedWallCrossStatus === "public" && (
              <Checkmark20Filled
                className={`${styles.checkmark} ${styles.checkmarkPublic}`}
              />
            )}
          </div>

          {/* Non-Public Information Option */}
          <div
            className={`${styles.optionCard} ${styles.optionCardNonPublic} ${selectedWallCrossStatus === "nonPublic" ? styles.optionCardNonPublicSelected : ""}`}
            onClick={() => setSelectedWallCrossStatus("nonPublic")}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                setSelectedWallCrossStatus("nonPublic");
              }
            }}
          >
            <div
              className={`${styles.optionIconWrapper} ${styles.optionIconWrapperNonPublic}`}
            >
              <ShieldError24Regular className={styles.optionIconNonPublic} />
            </div>
            <div className={styles.optionContent}>
              <div className={styles.optionTitle}>
                Wall-Crossed (Contains Non-Public Information)
              </div>
              <div className={styles.optionDescription}>
                This document contains material non-public information (MNPI)
              </div>
            </div>
            {selectedWallCrossStatus === "nonPublic" && (
              <Checkmark20Filled
                className={`${styles.checkmark} ${styles.checkmarkNonPublic}`}
              />
            )}
          </div>
        </div>
      </BottomSheet>

      {/* Non-FPW Publish Warning Bottom Sheet */}
      <BottomSheet
        open={nonFpwPublishWarningOpen}
        onClose={() => setNonFpwPublishWarningOpen(false)}
        title="Cannot Publish from FPW"
        subtitle={document.DocName}
        icon={<Send24Regular />}
        footer={
          <Button
            appearance="primary"
            onClick={() => setNonFpwPublishWarningOpen(false)}
            className={bottomSheetStyles.footerButton}
          >
            OK
          </Button>
        }
      >
        <div className={styles.sheetContent}>
          <Text className={styles.warningText}>
            This document was not created using the FPW PowerPoint tool.
          </Text>
          <Text className={styles.warningText} style={{ marginTop: "12px" }}>
            Please publish this document using the{" "}
            <span className={styles.warningHighlight}>appropriate tool</span>{" "}
            instead.
          </Text>
        </div>
      </BottomSheet>

      {/* Open in PowerPoint Dialog */}
      <OpenInPowerPointDialog
        open={openInPowerPointDialogOpen}
        onClose={() => setOpenInPowerPointDialogOpen(false)}
        onOpen={handleOpenInPowerPoint}
        isLoading={openInPowerPointLoading}
        docName={document.DocName}
      />
    </>
  );
};
