import React, { useMemo } from 'react';
import {
  makeStyles,
  tokens,
  Dialog,
  DialogTrigger,
  DialogSurface,
  DialogTitle,
  DialogBody,
  DialogActions,
  DialogContent,
  Button,
  Spinner,
  Textarea,
  Text,
  Badge,
  ProgressBar,
  MessageBar,
  MessageBarBody,
} from '@fluentui/react-components';
import {
  Warning20Regular,
  Delete20Regular,
  ArrowForward20Regular,
  Checkmark20Regular,
  Dismiss20Regular,
  Signature20Regular,
  Send20Regular,
  ArrowDownload20Regular,
  LockClosed16Regular,
} from '@fluentui/react-icons';
import { DocumentListResponse } from '@/interfaces/DocumentList';
import { BulkActionType, BulkActionProgress } from '@/hooks/useBulkDocumentActions';

const useStyles = makeStyles({
  dialogContent: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px',
  },
  documentList: {
    maxHeight: '200px',
    overflowY: 'auto',
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusMedium,
    padding: '8px',
  },
  documentItem: {
    padding: '6px 8px',
    borderBottom: `1px solid ${tokens.colorNeutralStroke3}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    '&:last-child': {
      borderBottom: 'none',
    },
  },
  documentName: {
    fontSize: tokens.fontSizeBase200,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    flex: 1,
  },
  lockedBadge: {
    marginLeft: '8px',
    flexShrink: 0,
  },
  warningMessage: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '12px',
    backgroundColor: tokens.colorPaletteYellowBackground1,
    borderRadius: tokens.borderRadiusMedium,
    border: `1px solid ${tokens.colorPaletteYellowBorder1}`,
  },
  warningIcon: {
    color: tokens.colorPaletteYellowForeground1,
    flexShrink: 0,
  },
  warningText: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorPaletteYellowForeground2,
  },
  dangerMessage: {
    backgroundColor: tokens.colorPaletteRedBackground1,
    border: `1px solid ${tokens.colorPaletteRedBorder1}`,
  },
  dangerText: {
    color: tokens.colorPaletteRedForeground1,
  },
  textarea: {
    minHeight: '80px',
  },
  progressSection: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  progressText: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground2,
    textAlign: 'center',
  },
  resultsSummary: {
    display: 'flex',
    gap: '16px',
    justifyContent: 'center',
    marginTop: '8px',
  },
  successCount: {
    color: tokens.colorPaletteGreenForeground1,
    fontWeight: tokens.fontWeightSemibold,
  },
  failedCount: {
    color: tokens.colorPaletteRedForeground1,
    fontWeight: tokens.fontWeightSemibold,
  },
  lockWarningSection: {
    marginBottom: '8px',
  },
});

interface BulkActionConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  action: BulkActionType;
  documents: DocumentListResponse[];
  lockedDocuments: DocumentListResponse[];
  onConfirm: (skipLocked: boolean) => void;
  onCancel: () => void;
  progress: BulkActionProgress;
  rejectReason?: string;
  onRejectReasonChange?: (reason: string) => void;
}

const ACTION_CONFIG: Record<
  BulkActionType,
  {
    title: string;
    confirmText: string;
    icon: React.ReactNode;
    isDangerous: boolean;
    description: string;
  }
> = {
  delete: {
    title: 'Delete Documents',
    confirmText: 'Delete',
    icon: <Delete20Regular />,
    isDangerous: true,
    description: 'This action cannot be undone. The following documents will be permanently deleted:',
  },
  submitForReview: {
    title: 'Submit for Review',
    confirmText: 'Submit',
    icon: <ArrowForward20Regular />,
    isDangerous: false,
    description: 'The following documents will be submitted for review:',
  },
  approve: {
    title: 'Approve Documents',
    confirmText: 'Approve',
    icon: <Checkmark20Regular />,
    isDangerous: false,
    description: 'The following documents will be approved:',
  },
  reject: {
    title: 'Reject Documents',
    confirmText: 'Reject',
    icon: <Dismiss20Regular />,
    isDangerous: false,
    description: 'The following documents will be rejected:',
  },
  analystSignOff: {
    title: 'Analyst Sign-off',
    confirmText: 'Sign Off',
    icon: <Signature20Regular />,
    isDangerous: false,
    description: 'The following documents will receive analyst sign-off:',
  },
  publish: {
    title: 'Publish Documents',
    confirmText: 'Publish',
    icon: <Send20Regular />,
    isDangerous: false,
    description: 'The following documents will be published:',
  },
  download: {
    title: 'Download Documents',
    confirmText: 'Download',
    icon: <ArrowDownload20Regular />,
    isDangerous: false,
    description: 'The following documents will be downloaded:',
  },
};

export const BulkActionConfirmDialog: React.FC<BulkActionConfirmDialogProps> = ({
  open,
  onOpenChange,
  action,
  documents,
  lockedDocuments,
  onConfirm,
  onCancel,
  progress,
  rejectReason = '',
  onRejectReasonChange,
}) => {
  const styles = useStyles();
  const config = ACTION_CONFIG[action];

  const unlockedDocuments = useMemo(
    () => documents.filter((doc) => !doc.LockingUser),
    [documents]
  );

  const hasLockedDocs = lockedDocuments.length > 0;
  const isRejectAction = action === 'reject';
  const canConfirm =
    !progress.inProgress &&
    documents.length > 0 &&
    (!isRejectAction || rejectReason.trim().length > 0);

  const progressPercent =
    progress.total > 0 ? (progress.completed / progress.total) * 100 : 0;

  const handleConfirm = () => {
    onConfirm(hasLockedDocs);
  };

  const handleClose = () => {
    if (!progress.inProgress) {
      onCancel();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(_, data) => !progress.inProgress && onOpenChange(data.open)}>
      <DialogSurface style={{ maxWidth: '500px' }}>
        <DialogBody>
          <DialogTitle>{config.title}</DialogTitle>
          <DialogContent className={styles.dialogContent}>
            {/* Lock warning */}
            {hasLockedDocs && !progress.inProgress && (
              <div className={styles.lockWarningSection}>
                <MessageBar intent="warning">
                  <MessageBarBody>
                    {lockedDocuments.length} document(s) are currently locked and will be skipped.
                  </MessageBarBody>
                </MessageBar>
              </div>
            )}

            {/* Danger warning for delete */}
            {config.isDangerous && !progress.inProgress && (
              <div className={`${styles.warningMessage} ${styles.dangerMessage}`}>
                <Warning20Regular className={styles.warningIcon} />
                <span className={`${styles.warningText} ${styles.dangerText}`}>
                  This action cannot be undone!
                </span>
              </div>
            )}

            {/* Progress indicator */}
            {progress.inProgress && (
              <div className={styles.progressSection}>
                <ProgressBar value={progressPercent / 100} />
                <Text className={styles.progressText}>
                  Processing {progress.completed} of {progress.total} documents...
                </Text>
              </div>
            )}

            {/* Results summary after completion */}
            {!progress.inProgress && progress.completed > 0 && (
              <div className={styles.progressSection}>
                <Text className={styles.progressText}>Operation completed</Text>
                <div className={styles.resultsSummary}>
                  <span className={styles.successCount}>
                    {progress.completed - progress.failed} succeeded
                  </span>
                  {progress.failed > 0 && (
                    <span className={styles.failedCount}>{progress.failed} failed</span>
                  )}
                </div>
              </div>
            )}

            {/* Document list (hide during/after progress) */}
            {!progress.inProgress && progress.completed === 0 && (
              <>
                <Text>{config.description}</Text>
                <div className={styles.documentList}>
                  {documents.map((doc) => (
                    <div key={doc.DocID} className={styles.documentItem}>
                      <Text className={styles.documentName} title={doc.DocName}>
                        {doc.DocName}
                      </Text>
                      {doc.LockingUser && (
                        <Badge
                          appearance="outline"
                          color="warning"
                          size="small"
                          icon={<LockClosed16Regular />}
                          className={styles.lockedBadge}
                        >
                          Locked
                        </Badge>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}

            {/* Reject reason textarea */}
            {isRejectAction && !progress.inProgress && progress.completed === 0 && (
              <Textarea
                value={rejectReason}
                onChange={(_, data) => onRejectReasonChange?.(data.value)}
                placeholder="Enter reason for rejection (required)..."
                className={styles.textarea}
              />
            )}
          </DialogContent>
          <DialogActions>
            {progress.completed > 0 && !progress.inProgress ? (
              <Button appearance="primary" onClick={handleClose}>
                Close
              </Button>
            ) : (
              <>
                <Button
                  appearance="secondary"
                  onClick={handleClose}
                  disabled={progress.inProgress}
                >
                  Cancel
                </Button>
                <Button
                  appearance="primary"
                  onClick={handleConfirm}
                  disabled={!canConfirm}
                  icon={progress.inProgress ? <Spinner size="tiny" /> : undefined}
                >
                  {progress.inProgress
                    ? 'Processing...'
                    : hasLockedDocs
                      ? `${config.confirmText} (${unlockedDocuments.length})`
                      : config.confirmText}
                </Button>
              </>
            )}
          </DialogActions>
        </DialogBody>
      </DialogSurface>
    </Dialog>
  );
};
