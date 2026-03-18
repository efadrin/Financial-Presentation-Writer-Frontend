import React, { useMemo, useState, useCallback, useEffect } from "react";
import { useSelector } from "react-redux";
import {
  makeStyles,
  tokens,
  Spinner,
  Tab,
  TabList,
  Button,
  Tooltip,
  SearchBox,
  mergeClasses,
} from "@fluentui/react-components";
import { ArrowUpload20Regular } from "@fluentui/react-icons";
import { RootState } from "@/store";
import {
  useGetDocumentListQuery,
  useGetUserPermissionsQuery,
} from "@/services/apiSlice";
import { DocumentListTable } from "@/components/documents/DocumentListTable";
import { DocumentUploadDialog } from "@/components/documents/DocumentUploadDialog";
import { BulkActionsToolbar } from "@/components/documents/BulkActionsToolbar";
import { CommentsBottomSheet } from "@/components/documents/CommentsBottomSheet";
import { WallCrossBottomSheet } from "@/components/documents/WallCrossBottomSheet";
import {
  WorkflowStatus,
  DocumentListResponse,
} from "@/interfaces/DocumentList";

const useStyles = makeStyles({
  container: {
    padding: "16px",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    backgroundColor: tokens.colorNeutralBackground1,
  },
  tabRow: {
    display: "flex",
    alignItems: "center",
    marginBottom: "12px",
    width: "100%",
    flexShrink: 0,
  },
  tabList: {
    display: "flex",
    width: "100%",
    "& > div": {
      display: "flex",
      width: "100%",
    },
  },
  tab: {
    flex: 1,
    justifyContent: "center",
    whiteSpace: "nowrap",
    minWidth: 0,
  },
  searchRow: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginBottom: "12px",
    flexShrink: 0,
    width: "100%",
  },
  content: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    minHeight: 0,
  },
  loadingContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "120px",
  },
  errorContainer: {
    padding: "12px",
    backgroundColor: tokens.colorPaletteRedBackground1,
    borderRadius: tokens.borderRadiusMedium,
    border: `1px solid ${tokens.colorPaletteRedBorder1}`,
  },
  errorText: {
    color: tokens.colorPaletteRedForeground1,
    fontSize: tokens.fontSizeBase200,
  },
  tabBadge: {
    marginLeft: "4px",
    fontSize: tokens.fontSizeBase100,
    color: tokens.colorNeutralForeground3,
  },
  contentRefreshing: {
    position: "relative",
    "&::after": {
      content: '""',
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: tokens.colorNeutralBackground1,
      opacity: 0.6,
      zIndex: 1,
      pointerEvents: "none",
    },
  },
  refreshOverlay: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    zIndex: 2,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "8px",
  },
  contentWrapper: {
    position: "relative",
    flex: 1,
    display: "flex",
    flexDirection: "column",
    minHeight: 0,
  },
});

const WORKFLOW_TABS: { value: WorkflowStatus; label: string }[] = [
  { value: "Drafts", label: "Drafts" },
  { value: "Review", label: "Review" },
  { value: "Final", label: "Final" },
  { value: "Published", label: "Published" },
];

const DocumentsView: React.FC = () => {
  const styles = useStyles();
  const settings = useSelector((state: RootState) => state.settings);

  const [selectedTab, setSelectedTab] = useState<WorkflowStatus>("Drafts");
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDocIds, setSelectedDocIds] = useState<Set<number>>(new Set());
  const [commentsSheetOpen, setCommentsSheetOpen] = useState(false);
  const [selectedDocForComments, setSelectedDocForComments] =
    useState<DocumentListResponse | null>(null);
  const [wallCrossSheetOpen, setWallCrossSheetOpen] = useState(false);
  const [selectedDocForWallCross, setSelectedDocForWallCross] =
    useState<DocumentListResponse | null>(null);

  const baseParams = useMemo(() => {
    if (
      !settings.account?.AccountID ||
      !settings.account?.AccountName ||
      !settings.account?.SrvrID
    ) {
      return null;
    }

    return {
      AccountID: parseInt(settings.account.AccountID, 10),
      AccountName: settings.account.AccountName,
      SrvrID: parseInt(settings.account.SrvrID, 10),
    };
  }, [settings.account]);

  const documentListParams = useMemo(() => {
    if (!baseParams) return null;
    return {
      ...baseParams,
      StatusFilter: selectedTab,
    };
  }, [baseParams, selectedTab]);

  const {
    data: documentListResponse,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetDocumentListQuery(documentListParams!, {
    skip: !documentListParams,
  });

  const documents = documentListResponse?.Data || [];

  const isRefreshing = isFetching && !isLoading && documents.length > 0;

  // Count documents by status for tab badges
  const allDocumentsParams = useMemo(() => {
    if (!baseParams) return null;
    return { ...baseParams };
  }, [baseParams]);

  const { data: allDocsResponse } = useGetDocumentListQuery(
    allDocumentsParams!,
    {
      skip: !allDocumentsParams,
    },
  );

  // Fetch user permissions for role-based actions
  const userID = parseInt(settings.account?.UserID?.toString() || "0", 10);
  const accountID = parseInt(settings.account?.AccountID || "0", 10);
  const accountName = settings.account?.AccountName || "";
  const srvrID = parseInt(settings.account?.SrvrID || "0", 10);

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

  const statusCounts: Record<WorkflowStatus, number> = useMemo(() => {
    const allDocs = allDocsResponse?.Data || [];
    return {
      Drafts: allDocs.filter((d) => d.StatusName === "Drafts").length,
      Review: allDocs.filter((d) => d.StatusName === "Review").length,
      Final: allDocs.filter(
        (d) => d.StatusName === "Final" || d.StatusName === "Finalised",
      ).length,
      Finalised: 0,
      Published: allDocs.filter((d) => d.StatusName === "Published").length,
    };
  }, [allDocsResponse]);

  const handleTabChange = useCallback(
    (_: unknown, data: { value: unknown }) => {
      setSelectedTab(data.value as WorkflowStatus);
      setSelectedDocIds(new Set());
    },
    [],
  );

  useEffect(() => {
    setSelectedDocIds(new Set());
  }, [searchTerm]);

  const selectedDocuments: DocumentListResponse[] = useMemo(() => {
    return documents.filter((doc) => selectedDocIds.has(doc.DocID));
  }, [documents, selectedDocIds]);

  const handleSelectionChange = useCallback(
    (docId: number, selected: boolean) => {
      setSelectedDocIds((prev) => {
        const newSet = new Set(prev);
        if (selected) {
          newSet.add(docId);
        } else {
          newSet.delete(docId);
        }
        return newSet;
      });
    },
    [],
  );

  const handleSelectAll = useCallback(
    (selected: boolean) => {
      if (selected) {
        const allIds = documents
          .filter((doc) => {
            const matchesSearch =
              !searchTerm ||
              doc.DocName.toLowerCase().includes(searchTerm.toLowerCase()) ||
              doc.FullName.toLowerCase().includes(searchTerm.toLowerCase());
            return matchesSearch;
          })
          .map((doc) => doc.DocID);
        setSelectedDocIds(new Set(allIds));
      } else {
        setSelectedDocIds(new Set());
      }
    },
    [documents, searchTerm],
  );

  const handleClearSelection = useCallback(() => {
    setSelectedDocIds(new Set());
  }, []);

  const handleOpenCommentsSheet = useCallback(
    (document: DocumentListResponse) => {
      setSelectedDocForComments(document);
      setCommentsSheetOpen(true);
    },
    [],
  );

  const handleCloseCommentsSheet = useCallback(() => {
    setCommentsSheetOpen(false);
    setTimeout(() => setSelectedDocForComments(null), 300);
  }, []);

  const handleOpenWallCrossSheet = useCallback(
    (document: DocumentListResponse) => {
      setSelectedDocForWallCross(document);
      setWallCrossSheetOpen(true);
    },
    [],
  );

  const handleCloseWallCrossSheet = useCallback(() => {
    setWallCrossSheetOpen(false);
    setTimeout(() => setSelectedDocForWallCross(null), 300);
  }, []);

  const renderContent = () => {
    if (isLoading) {
      return (
        <div className={styles.loadingContainer}>
          <Spinner label="Loading documents..." />
        </div>
      );
    }

    if (error) {
      return (
        <div className={styles.errorContainer}>
          <div className={styles.errorText}>
            Failed to load documents. Please try again.
          </div>
        </div>
      );
    }

    if (!documentListParams) {
      return (
        <div className={styles.errorContainer}>
          <div className={styles.errorText}>
            Account information is not available. Please check your settings.
          </div>
        </div>
      );
    }

    return (
      <DocumentListTable
        documents={documents}
        searchTerm={searchTerm}
        onActionComplete={refetch}
        selectedIds={selectedDocIds}
        onSelectionChange={handleSelectionChange}
        onSelectAll={handleSelectAll}
        onOpenCommentsSheet={handleOpenCommentsSheet}
        onOpenWallCrossSheet={handleOpenWallCrossSheet}
      />
    );
  };

  return (
    <div className={styles.container}>
      <DocumentUploadDialog
        open={uploadDialogOpen}
        onOpenChange={setUploadDialogOpen}
        onUploadComplete={() => {
          refetch();
          setSelectedTab("Drafts");
        }}
      />

      <div className={styles.tabRow}>
        <TabList
          selectedValue={selectedTab}
          onTabSelect={handleTabChange}
          className={styles.tabList}
          size="small"
        >
          {WORKFLOW_TABS.map((tab) => (
            <Tab key={tab.value} value={tab.value} className={styles.tab}>
              {tab.label}
              <span className={styles.tabBadge}>
                ({statusCounts[tab.value] || 0})
              </span>
            </Tab>
          ))}
        </TabList>
      </div>

      <div className={styles.searchRow}>
        <SearchBox
          placeholder="Search documents..."
          value={searchTerm}
          onChange={(_, data) => setSearchTerm(data.value)}
          style={{ flex: 1, maxWidth: "none" }}
        />
        <Tooltip content="Upload presentation" relationship="label">
          <Button
            icon={<ArrowUpload20Regular />}
            onClick={() => setUploadDialogOpen(true)}
            appearance="primary"
            size="small"
          />
        </Tooltip>
      </div>

      <div className={styles.contentWrapper}>
        {selectedDocuments.length > 0 && (
          <BulkActionsToolbar
            selectedDocuments={selectedDocuments}
            currentTab={selectedTab}
            onClearSelection={handleClearSelection}
            onActionComplete={() => {
              refetch();
              handleClearSelection();
            }}
            userRoles={userRoles}
          />
        )}

        <div
          className={mergeClasses(
            styles.content,
            isRefreshing && styles.contentRefreshing,
          )}
        >
          {renderContent()}
        </div>
        {isRefreshing && (
          <div className={styles.refreshOverlay}>
            <Spinner size="small" />
          </div>
        )}
      </div>

      {selectedDocForComments && (
        <CommentsBottomSheet
          document={selectedDocForComments}
          open={commentsSheetOpen}
          onClose={handleCloseCommentsSheet}
        />
      )}

      {selectedDocForWallCross && (
        <WallCrossBottomSheet
          document={selectedDocForWallCross}
          open={wallCrossSheetOpen}
          onClose={handleCloseWallCrossSheet}
          onSuccess={refetch}
        />
      )}
    </div>
  );
};

export default DocumentsView;
