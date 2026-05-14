import React, { useState, useCallback, useMemo } from "react";
import {
  makeStyles,
  tokens,
  Button,
  Text,
  Divider,
  Tooltip,
} from "@fluentui/react-components";
import {
  Delete20Regular,
  ArrowForward20Regular,
  Checkmark20Regular,
  Dismiss20Regular,
  Signature20Regular,
  Send20Regular,
  ArrowDownload20Regular,
  DismissCircle20Regular,
} from "@fluentui/react-icons";
import {
  DocumentListResponse,
  WorkflowStatus,
} from "@/interfaces/DocumentList";
import { BulkActionConfirmDialog } from "./BulkActionConfirmDialog";
import useBulkDocumentActions, {
  BulkActionType,
} from "@/hooks/useBulkDocumentActions";

const useStyles = makeStyles({
  toolbar: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "10px 12px",
    backgroundColor: tokens.colorNeutralBackground3,
    borderRadius: tokens.borderRadiusMedium,
    marginBottom: "12px",
    flexWrap: "wrap",
  },
  selectionInfo: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    marginRight: "8px",
  },
  selectionCount: {
    fontWeight: tokens.fontWeightSemibold,
    fontSize: tokens.fontSizeBase300,
    color: tokens.colorNeutralForeground1,
  },
  divider: {
    height: "24px",
  },
  actionGroup: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
  },
  clearButton: {
    marginLeft: "auto",
  },
});

interface BulkActionsToolbarProps {
  selectedDocuments: DocumentListResponse[];
  currentTab: WorkflowStatus;
  onClearSelection: () => void;
  onActionComplete: () => void;
  userRoles: { RoleName: string }[];
}

export const BulkActionsToolbar: React.FC<BulkActionsToolbarProps> = ({
  selectedDocuments,
  currentTab,
  onClearSelection,
  onActionComplete,
  userRoles,
}) => {
  const styles = useStyles();
  const { executeBulkAction, progress, resetProgress, isExecuting } =
    useBulkDocumentActions();

  const [dialogOpen, setDialogOpen] = useState(false);
  const [currentAction, setCurrentAction] = useState<BulkActionType | null>(
    null,
  );
  const [rejectReason, setRejectReason] = useState("");

  const hasRole = useCallback(
    (roleName: string) =>
      userRoles.some(
        (r) => r.RoleName.toLowerCase() === roleName.toLowerCase(),
      ),
    [userRoles],
  );

  const isAnalyst = hasRole("Analyst");
  const isCompliance = hasRole("Compliance");
  const isPublisher = hasRole("Publisher");
  const isAdmin = hasRole("Admin");
  const isSupervisory = hasRole("Supervisory");

  const lockedDocuments = useMemo(
    () => selectedDocuments.filter((doc) => doc.LockingUser),
    [selectedDocuments],
  );

  const unlockedDocuments = useMemo(
    () => selectedDocuments.filter((doc) => !doc.LockingUser),
    [selectedDocuments],
  );

  const handleActionClick = (action: BulkActionType) => {
    setCurrentAction(action);
    setRejectReason("");
    resetProgress();
    setDialogOpen(true);
  };

  const handleConfirm = async (skipLocked: boolean) => {
    if (!currentAction) return;
    const docsToProcess = skipLocked ? unlockedDocuments : selectedDocuments;
    if (docsToProcess.length === 0) {
      setDialogOpen(false);
      return;
    }
    const options: { rejectReason?: string } = {};
    if (currentAction === "reject") {
      options.rejectReason = rejectReason;
    }
    await executeBulkAction(currentAction, docsToProcess, options);
  };

  const handleDialogClose = () => {
    if (!isExecuting) {
      setDialogOpen(false);
      setCurrentAction(null);
      setRejectReason("");
      if (progress.completed > 0) {
        onClearSelection();
        onActionComplete();
        resetProgress();
      }
    }
  };

  const renderActions = () => {
    switch (currentTab) {
      case "Drafts":
        return (
          <div className={styles.actionGroup}>
            <Tooltip
              content="Submit selected documents for review"
              relationship="label"
            >
              <Button
                appearance="primary"
                icon={<ArrowForward20Regular />}
                onClick={() => handleActionClick("submitForReview")}
                disabled={isExecuting}
                size="small"
              >
                Submit for Review
              </Button>
            </Tooltip>
            <Tooltip content="Delete selected documents" relationship="label">
              <Button
                appearance="secondary"
                icon={<Delete20Regular />}
                onClick={() => handleActionClick("delete")}
                disabled={isExecuting}
                size="small"
                style={{ color: tokens.colorPaletteRedForeground1 }}
              >
                Delete
              </Button>
            </Tooltip>
          </div>
        );

      case "Review":
        return (
          <div className={styles.actionGroup}>
            {isAnalyst && (
              <Tooltip
                content="Analyst sign-off for selected documents"
                relationship="label"
              >
                <Button
                  appearance="secondary"
                  icon={<Signature20Regular />}
                  onClick={() => handleActionClick("analystSignOff")}
                  disabled={isExecuting}
                  size="small"
                >
                  Analyst Sign-off
                </Button>
              </Tooltip>
            )}
            {(isCompliance || isSupervisory || isPublisher || isAdmin) && (
              <>
                <Tooltip
                  content="Approve selected documents"
                  relationship="label"
                >
                  <Button
                    appearance="primary"
                    icon={<Checkmark20Regular />}
                    onClick={() => handleActionClick("approve")}
                    disabled={isExecuting}
                    size="small"
                  >
                    Approve
                  </Button>
                </Tooltip>
                <Tooltip
                  content="Reject selected documents"
                  relationship="label"
                >
                  <Button
                    appearance="secondary"
                    icon={<Dismiss20Regular />}
                    onClick={() => handleActionClick("reject")}
                    disabled={isExecuting}
                    size="small"
                    style={{ color: tokens.colorPaletteRedForeground1 }}
                  >
                    Reject
                  </Button>
                </Tooltip>
              </>
            )}
          </div>
        );

      case "Final":
      case "Finalised":
        if (isPublisher || isAdmin) {
          return (
            <div className={styles.actionGroup}>
              <Tooltip
                content="Publish selected documents"
                relationship="label"
              >
                <Button
                  appearance="primary"
                  icon={<Send20Regular />}
                  onClick={() => handleActionClick("publish")}
                  disabled={isExecuting}
                  size="small"
                >
                  Publish
                </Button>
              </Tooltip>
            </div>
          );
        }
        return null;

      case "Published":
        return (
          <div className={styles.actionGroup}>
            <Tooltip
              content="Download selected documents as PDFs"
              relationship="label"
            >
              <Button
                appearance="primary"
                icon={<ArrowDownload20Regular />}
                onClick={() => handleActionClick("download")}
                disabled={isExecuting}
                size="small"
              >
                Download PDFs
              </Button>
            </Tooltip>
          </div>
        );

      default:
        return null;
    }
  };

  if (selectedDocuments.length === 0) {
    return null;
  }

  return (
    <>
      <div className={styles.toolbar}>
        <div className={styles.selectionInfo}>
          <Text className={styles.selectionCount}>
            {selectedDocuments.length} document
            {selectedDocuments.length !== 1 ? "s" : ""} selected
          </Text>
          {lockedDocuments.length > 0 && (
            <Text
              style={{
                fontSize: tokens.fontSizeBase200,
                color: tokens.colorNeutralForeground3,
              }}
            >
              ({lockedDocuments.length} locked)
            </Text>
          )}
        </div>
        <Divider vertical className={styles.divider} />
        {renderActions()}
        <Button
          appearance="subtle"
          icon={<DismissCircle20Regular />}
          onClick={onClearSelection}
          disabled={isExecuting}
          size="small"
          className={styles.clearButton}
        >
          Clear
        </Button>
      </div>

      {currentAction && (
        <BulkActionConfirmDialog
          open={dialogOpen}
          onOpenChange={(open) => !open && handleDialogClose()}
          action={currentAction}
          documents={selectedDocuments}
          lockedDocuments={lockedDocuments}
          onConfirm={handleConfirm}
          onCancel={handleDialogClose}
          progress={progress}
          rejectReason={rejectReason}
          onRejectReasonChange={setRejectReason}
        />
      )}
    </>
  );
};
