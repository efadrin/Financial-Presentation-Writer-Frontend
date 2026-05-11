import React, { useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import {
  makeStyles,
  tokens,
  Button,
  Text,
  Badge,
  Spinner,
  Divider,
  MessageBar,
  MessageBarBody,
  MessageBarTitle,
  Textarea,
  RadioGroup,
  Radio,
  Label,
  Tab,
  TabList,
} from '@fluentui/react-components';
import {
  Checkmark20Regular,
  Dismiss20Regular,
  ArrowForward20Regular,
  Send20Regular,
  ArrowUndo20Regular,
  LockOpen20Regular,
  Comment20Regular,
  History20Regular,
  Flag20Regular,
  Edit20Regular,
  Eye20Regular,
  Save20Regular,
  ChevronDown20Regular,
  ChevronUp20Regular,
  DocumentBulletList20Regular,
  TableSimpleRegular,
  DataTrendingRegular,
} from '@fluentui/react-icons';
import AddTableAndChart from '@/components/addComponent/AddTableAndChart';
import { AddComponentTabKeys, AddComponentTabKey } from '@/utils/constants';
import BreadcrumbWithOverflow from '@/components/common/BreadCrumb';
import { Item } from '@/components/common/BreadCrumb/types';
import {
  BottomSheet,
  useBottomSheetStyles,
} from '@/components/common/BottomSheet';
import { RootState, useAppDispatch } from '@/store';
import { clearOpenedDocument } from '@/services/openedDocumentSlice';
import {
  useCheckinDocumentMutation,
  useApproveDocumentMutation,
  useRejectDocumentMutation,
  useSubmitForReviewMutation,
  useChangeStatusMutation,
  useChangePriorityMutation,
  useAddDocumentCommentMutation,
  useGetDocumentHistoryQuery,
  useGetDocumentCommentsQuery,
  useGetUserPermissionsQuery,
  useGetWorkflowFiltersQuery,
} from '@/services/apiSlice';
import { PriorityOption } from '@/interfaces/DocumentList';
import { format } from 'date-fns';
import { getCurrentPresentationBlob, replaceCurrentPresentationFromBase64, injectCustomPropertiesIntoBlob } from '@/utils/documentOpenUtils';

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    width: '100%',
    overflow: 'hidden',
    backgroundColor: tokens.colorNeutralBackground1,
  },
  tabBar: {
    flexShrink: 0,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    paddingLeft: tokens.spacingHorizontalM,
  },
  tabContent: {
    flex: '1 1 auto',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  header: {
    padding: '12px 16px',
    flexShrink: 0,
  },
  breadcrumbContainer: {
    display: 'flex',
    alignItems: 'center',
    minHeight: '24px',
  },
  scrollContainer: {
    flex: '1 1 auto',
    overflowY: 'auto',
    overflowX: 'hidden',
    padding: '16px',
    paddingBottom: '32px',
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
    minHeight: 0,
    '&::-webkit-scrollbar': {
      width: '6px',
    },
    '&::-webkit-scrollbar-track': {
      backgroundColor: 'transparent',
    },
    '&::-webkit-scrollbar-thumb': {
      backgroundColor: tokens.colorNeutralStroke2,
      borderRadius: '3px',
    },
    '&::-webkit-scrollbar-thumb:hover': {
      backgroundColor: tokens.colorNeutralStroke1,
    },
  },
  statusBanner: {
    padding: '10px 12px',
    borderRadius: tokens.borderRadiusMedium,
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flexShrink: 0,
  },
  statusBannerEdit: {
    backgroundColor: tokens.colorPaletteGreenBackground1,
    border: `1px solid ${tokens.colorPaletteGreenBorder1}`,
  },
  statusBannerView: {
    backgroundColor: tokens.colorNeutralBackground3,
    border: `1px solid ${tokens.colorNeutralStroke1}`,
  },
  statusIcon: {
    fontSize: '18px',
    flexShrink: 0,
  },
  statusText: {
    flex: 1,
    minWidth: 0,
  },
  statusTitle: {
    fontWeight: 600,
    fontSize: tokens.fontSizeBase300,
    display: 'block',
  },
  statusSubtitle: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground2,
  },
  section: {
    backgroundColor: tokens.colorNeutralBackground1,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    borderRadius: tokens.borderRadiusMedium,
    overflow: 'hidden',
    flexShrink: 0,
  },
  sectionHeader: {
    padding: '10px 12px',
    backgroundColor: tokens.colorNeutralBackground2,
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    cursor: 'pointer',
    '&:hover': {
      backgroundColor: tokens.colorNeutralBackground2Hover,
    },
  },
  sectionTitle: {
    fontWeight: 600,
    fontSize: tokens.fontSizeBase300,
  },
  sectionContent: {
    padding: '12px',
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: '100px 1fr',
    gap: '6px 10px',
    fontSize: tokens.fontSizeBase200,
  },
  detailLabel: {
    color: tokens.colorNeutralForeground3,
  },
  detailValue: {
    fontWeight: 500,
    color: tokens.colorNeutralForeground1,
  },
  workflowProgress: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    flexWrap: 'wrap',
    marginTop: '10px',
  },
  workflowStep: {
    padding: '4px 10px',
    borderRadius: tokens.borderRadiusSmall,
    fontSize: tokens.fontSizeBase100,
    backgroundColor: tokens.colorNeutralBackground4,
    color: tokens.colorNeutralForeground2,
  },
  workflowStepActive: {
    backgroundColor: tokens.colorBrandBackground,
    color: tokens.colorNeutralForegroundOnBrand,
    fontWeight: 600,
  },
  workflowArrow: {
    color: tokens.colorNeutralForeground4,
    fontSize: tokens.fontSizeBase100,
  },
  actionsGrid: {
    display: 'flex',
    flexWrap: 'wrap',
    gap: '8px',
  },
  actionButton: {
    minWidth: 'auto',
    fontSize: tokens.fontSizeBase200,
    padding: '6px 12px',
  },
  historyItem: {
    padding: '8px 0',
    borderBottom: `1px solid ${tokens.colorNeutralStroke3}`,
    '&:last-child': {
      borderBottom: 'none',
    },
  },
  historyStatus: {
    fontWeight: 600,
    fontSize: tokens.fontSizeBase200,
  },
  historyMeta: {
    fontSize: tokens.fontSizeBase100,
    color: tokens.colorNeutralForeground3,
  },
  emptyState: {
    color: tokens.colorNeutralForeground3,
    fontStyle: 'italic',
    fontSize: tokens.fontSizeBase200,
    padding: '8px 0',
  },
  checkinButton: {
    fontSize: tokens.fontSizeBase200,
    padding: '4px 12px',
  },
});

const WORKFLOW_STEPS = ['Drafts', 'Review', 'Final', 'Published'];

const DocumentWorkflowPage: React.FC = () => {
  const styles = useStyles();
  const bottomSheetStyles = useBottomSheetStyles();
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [activeTab, setActiveTab] = useState<AddComponentTabKey>(AddComponentTabKeys.Workflow);

  const { document, isCheckedOut, isViewOnly, originalBlob, customPropertiesXml } = useSelector(
    (state: RootState) => state.openedDocument
  );
  const settings = useSelector((state: RootState) => state.settings);

  // Query params
  const accountName = settings.account?.AccountName || '';
  const srvrID = parseInt(settings.account?.SrvrID || '0', 10);
  const userID = parseInt(settings.account?.UserID?.toString() || '0', 10);
  const accountID = parseInt(settings.account?.AccountID || '0', 10);

  // Collapse states for sections
  const [historyExpanded, setHistoryExpanded] = useState(false);
  const [commentsExpanded, setCommentsExpanded] = useState(false);

  // Dialog states
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState('');
  const [priorityDialogOpen, setPriorityDialogOpen] = useState(false);
  const [selectedPriority, setSelectedPriority] = useState('');
  const [commentDialogOpen, setCommentDialogOpen] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [checkinLoading, setCheckinLoading] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [discardDialogOpen, setDiscardDialogOpen] = useState(false);
  const [discardLoading, setDiscardLoading] = useState(false);

  // API mutations
  const [checkin] = useCheckinDocumentMutation();
  const [approve] = useApproveDocumentMutation();
  const [reject] = useRejectDocumentMutation();
  const [submitForReview] = useSubmitForReviewMutation();
  const [changeStatus] = useChangeStatusMutation();
  const [changePriority] = useChangePriorityMutation();
  const [addComment] = useAddDocumentCommentMutation();

  // Fetch workflow filters (priorities) when priority dialog is open
  const filterParams =
    accountName && srvrID > 0
      ? { AccountName: accountName, SrvrID: srvrID }
      : null;
  const { data: filtersResponse, isLoading: filtersLoading } =
    useGetWorkflowFiltersQuery(filterParams!, {
      skip: !filterParams || !priorityDialogOpen,
    });
  const priorities: PriorityOption[] =
    filtersResponse?.Data?.Priorities || [];

  // Fetch document history
  const { data: historyResponse, isLoading: historyLoading } =
    useGetDocumentHistoryQuery(
      { accountName, docID: document?.DocID || 0, srvrID },
      { skip: !document || !accountName || !srvrID }
    );
  const history = historyResponse?.Data || [];

  // Fetch document comments
  const {
    data: commentsResponse,
    isLoading: commentsLoading,
    refetch: refetchComments,
  } = useGetDocumentCommentsQuery(
    { accountName, docID: document?.DocID || 0, srvrID },
    { skip: !document || !accountName || !srvrID }
  );
  const comments = commentsResponse?.Data || [];

  // Fetch user permissions
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
    }
  );
  const userRoles = permissionsResponse?.Data?.Roles || [];

  const hasRole = useCallback(
    (roleName: string) => {
      return userRoles.some(
        (r) => r.RoleName.toLowerCase() === roleName.toLowerCase()
      );
    },
    [userRoles]
  );

  const baseRequest = useCallback(
    () => ({
      AccountName: accountName,
      SrvrID: srvrID,
      DocID: document?.DocID || 0,
      UserID: userID,
      AccountID: accountID,
    }),
    [accountName, srvrID, document?.DocID, userID, accountID]
  );

  /**
   * Navigate back to the documents list and clear Redux state.
   */
  const navigateToDocuments = useCallback(() => {
    dispatch(clearOpenedDocument());
    navigate('/documents');
  }, [dispatch, navigate]);

  /**
   * Back navigation — if the document is checked out, show a discard dialog
   * so the user can choose to check in first rather than leaving it locked.
   */
  const handleBack = useCallback(() => {
    if (isCheckedOut) {
      setDiscardDialogOpen(true);
    } else {
      void navigateToDocuments();
    }
  }, [isCheckedOut, navigateToDocuments]);

  /**
   * Discard local changes: restore original slides, check in without uploading
   * the edited content, then navigate back.
   */
  const handleDiscardAndBack = useCallback(async () => {
    setDiscardLoading(true);
    try {
      if (originalBlob) {
        await replaceCurrentPresentationFromBase64(originalBlob);
      }
      await checkin(baseRequest()).unwrap();
      navigateToDocuments();
    } catch (error) {
      console.error('Discard and check-in failed:', error);
    } finally {
      setDiscardLoading(false);
    }
  }, [originalBlob, checkin, baseRequest, navigateToDocuments]);

  /**
   * Check in the document — reads the current presentation content via
   * Office.js getFileAsync and uploads the blob so edits are saved.
   */
  const handleCheckin = useCallback(async () => {
    if (!document) return;
    setCheckinLoading(true);

    try {
      let currentBlob = await getCurrentPresentationBlob();

      // Inject custom document properties back into /docProps/custom.xml.
      // insertSlidesFromBase64 only copies slides, so the properties extracted
      // at open-time must be re-embedded before the file is uploaded.
      if (customPropertiesXml) {
        currentBlob = await injectCustomPropertiesIntoBlob(currentBlob, customPropertiesXml);
      }

      await checkin({
        ...baseRequest(),
        DocBlob: currentBlob,
        DocName: document.DocName,
      }).unwrap();
      navigateToDocuments();
    } catch (error) {
      console.error('Check-in failed:', error);
    } finally {
      setCheckinLoading(false);
    }
  }, [document, customPropertiesXml, checkin, baseRequest, navigateToDocuments]);

  const handleApprove = useCallback(async () => {
    setActionLoading(true);
    try {
      await approve(baseRequest()).unwrap();
      navigateToDocuments();
    } catch (error) {
      console.error('Approve failed:', error);
    } finally {
      setActionLoading(false);
    }
  }, [approve, baseRequest, navigateToDocuments]);

  const handleReject = useCallback(async () => {
    setActionLoading(true);
    try {
      await reject({ ...baseRequest(), Reason: rejectReason }).unwrap();
      setRejectDialogOpen(false);
      setRejectReason('');
      navigateToDocuments();
    } catch (error) {
      console.error('Reject failed:', error);
    } finally {
      setActionLoading(false);
    }
  }, [reject, baseRequest, rejectReason, navigateToDocuments]);

  const handleSubmitForReview = useCallback(async () => {
    setActionLoading(true);
    try {
      await submitForReview(baseRequest()).unwrap();
      navigateToDocuments();
    } catch (error) {
      console.error('Submit for review failed:', error);
    } finally {
      setActionLoading(false);
    }
  }, [submitForReview, baseRequest, navigateToDocuments]);

  const handlePublish = useCallback(async () => {
    setActionLoading(true);
    try {
      await changeStatus({
        ...baseRequest(),
        NewStatus: 'Published',
      }).unwrap();
      navigateToDocuments();
    } catch (error) {
      console.error('Publish failed:', error);
    } finally {
      setActionLoading(false);
    }
  }, [changeStatus, baseRequest, navigateToDocuments]);

  const handleRetract = useCallback(async () => {
    setActionLoading(true);
    try {
      await changeStatus({
        ...baseRequest(),
        NewStatus: 'Review',
      }).unwrap();
      navigateToDocuments();
    } catch (error) {
      console.error('Retract failed:', error);
    } finally {
      setActionLoading(false);
    }
  }, [changeStatus, baseRequest, navigateToDocuments]);

  const handleChangePriority = useCallback(async () => {
    if (!selectedPriority) return;
    setActionLoading(true);
    try {
      await changePriority({
        ...baseRequest(),
        PriorityID: parseInt(selectedPriority, 10),
      }).unwrap();
      setPriorityDialogOpen(false);
      setSelectedPriority('');
    } catch (error) {
      console.error('Change priority failed:', error);
    } finally {
      setActionLoading(false);
    }
  }, [changePriority, baseRequest, selectedPriority]);

  const handleAddComment = useCallback(async () => {
    if (!newComment.trim()) return;
    setActionLoading(true);
    try {
      const latestVersion =
        history.length > 0
          ? (history[0] as any).DocVersion || 1
          : 1;
      await addComment({
        ...baseRequest(),
        Comment: newComment,
        DocVersion: latestVersion,
        StatusName: document?.StatusName || 'Review',
      }).unwrap();
      setNewComment('');
      setCommentDialogOpen(false);
      refetchComments();
    } catch (error) {
      console.error('Add comment failed:', error);
    } finally {
      setActionLoading(false);
    }
  }, [
    addComment,
    baseRequest,
    newComment,
    document?.StatusName,
    history,
    refetchComments,
  ]);

  // Role-based permissions
  const isCompliance = hasRole('Compliance');
  const isPublisher = hasRole('Publisher');
  const isAdmin = hasRole('Admin');
  const isSupervisory = hasRole('Supervisory');

  const status = document?.StatusName || '';
  const canApprove =
    status === 'Review' && (isCompliance || isSupervisory || isPublisher);
  const canReject = status === 'Review' && (isCompliance || isSupervisory);
  const canSubmitForReview = status === 'Drafts' && isCheckedOut;
  const canPublish =
    (status === 'Final' || status === 'Finalised') &&
    (isPublisher || isAdmin);
  const canRetract =
    (status === 'Final' || status === 'Finalised') &&
    (isPublisher || isAdmin);

  const breadcrumbItems: Item[] = document
    ? [
        {
          text: 'Documents',
          key: 'documents',
          priority: 0,
          onClick: handleBack,
        },
        {
          text: 'Workflow',
          key: 'document-workflow',
          priority: 1,
          onClick: () => {},
        },
      ]
    : [
        {
          text: 'Documents',
          key: 'documents',
          priority: 0,
          onClick: handleBack,
        },
      ];

  if (!document) {
    return (
      <div className={styles.root}>
        <div className={styles.header}>
          <div className={styles.breadcrumbContainer}>
            <BreadcrumbWithOverflow items={breadcrumbItems} />
          </div>
        </div>
        <div className={styles.scrollContainer}>
          <MessageBar intent='warning'>
            <MessageBarBody>
              <MessageBarTitle>No Document Open</MessageBarTitle>
              No document is currently open. Please open a document from the
              Documents list.
            </MessageBarBody>
          </MessageBar>
        </div>
      </div>
    );
  }

  const currentStepIndex = WORKFLOW_STEPS.findIndex(
    (step) =>
      step === status || (step === 'Final' && status === 'Finalised')
  );

  return (
    <div className={styles.root}>
      {/* Fixed Header */}
      <div className={styles.header}>
        <div className={styles.breadcrumbContainer}>
          <BreadcrumbWithOverflow items={breadcrumbItems} />
        </div>
      </div>

      {/* Tab Bar */}
      <div className={styles.tabBar}>
        <TabList
          selectedValue={activeTab}
          onTabSelect={(_, d) => setActiveTab(d.value as AddComponentTabKey)}
          size="small"
        >
          <Tab value={AddComponentTabKeys.Workflow} icon={<DocumentBulletList20Regular />}>
            Workflow
          </Tab>
          <Tab value={AddComponentTabKeys.Table} icon={<TableSimpleRegular />}>
            Tables
          </Tab>
          <Tab value={AddComponentTabKeys.Chart} icon={<DataTrendingRegular />}>
            Charts
          </Tab>
        </TabList>
      </div>

      {/* Tab Content */}
      <div className={styles.tabContent}>
        {/* Table tab */}
        {activeTab === AddComponentTabKeys.Table && <AddTableAndChart type="table" />}
        {/* Chart tab */}
        {activeTab === AddComponentTabKeys.Chart && <AddTableAndChart type="chart" />}

        {/* Scrollable Workflow Content — hidden but mounted when other tabs active */}
        <div
          className={styles.scrollContainer}
          style={{ display: activeTab === AddComponentTabKeys.Workflow ? undefined : 'none' }}
        >
        {/* Status Banner */}
        <div
          className={`${styles.statusBanner} ${
            isCheckedOut ? styles.statusBannerEdit : styles.statusBannerView
          }`}
        >
          {isCheckedOut ? (
            <Edit20Regular className={styles.statusIcon} />
          ) : (
            <Eye20Regular className={styles.statusIcon} />
          )}
          <div className={styles.statusText}>
            <Text className={styles.statusTitle}>
              {isCheckedOut ? 'Edit Mode' : 'View Only Mode'}
            </Text>
            <Text className={styles.statusSubtitle}>
              {isCheckedOut
                ? 'Document locked for editing'
                : 'Document opened in read-only mode'}
            </Text>
          </div>
          {isCheckedOut && (
            <Button
              icon={<LockOpen20Regular />}
              appearance='primary'
              size='small'
              className={styles.checkinButton}
              onClick={handleCheckin}
              disabled={checkinLoading}
            >
              {checkinLoading ? <Spinner size='tiny' /> : 'Check In'}
            </Button>
          )}
        </div>

        {/* Document Details Section */}
        <div className={styles.section}>
          <div
            className={styles.sectionHeader}
            style={{ cursor: 'default' }}
          >
            <Text className={styles.sectionTitle}>Document Details</Text>
          </div>
          <div className={styles.sectionContent}>
            <div className={styles.detailsGrid}>
              <Text className={styles.detailLabel}>Name</Text>
              <Text className={styles.detailValue}>{document.DocName}</Text>

              <Text className={styles.detailLabel}>Status</Text>
              <div>
                <Badge
                  appearance='filled'
                  size='small'
                  color={
                    status === 'Published' ? 'success' : 'informative'
                  }
                >
                  {status}
                </Badge>
              </div>

              <Text className={styles.detailLabel}>Priority</Text>
              <Text className={styles.detailValue}>
                {document.PriorityName || 'Normal'}
              </Text>

              <Text className={styles.detailLabel}>Author</Text>
              <Text className={styles.detailValue}>
                {document.PrimaryAuthor || document.FullName}
              </Text>

              <Text className={styles.detailLabel}>Last Modified</Text>
              <Text className={styles.detailValue}>
                {document.TimeStamp
                  ? format(
                      new Date(document.TimeStamp),
                      'MMM d, yyyy h:mm a'
                    )
                  : '-'}
              </Text>

              {document.Approvals && (
                <>
                  <Text className={styles.detailLabel}>Approvals</Text>
                  <Text className={styles.detailValue}>
                    {document.Approvals}
                  </Text>
                </>
              )}
            </div>

            {/* Workflow Progress */}
            <Divider style={{ margin: '12px 0' }} />
            <Text
              className={styles.sectionTitle}
              style={{ marginBottom: '8px', display: 'block' }}
            >
              Workflow Progress
            </Text>
            <div className={styles.workflowProgress}>
              {WORKFLOW_STEPS.map((step, index) => (
                <React.Fragment key={step}>
                  <span
                    className={`${styles.workflowStep} ${
                      index === currentStepIndex
                        ? styles.workflowStepActive
                        : ''
                    }`}
                  >
                    {step}
                  </span>
                  {index < WORKFLOW_STEPS.length - 1 && (
                    <span className={styles.workflowArrow}>→</span>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>

        {/* Workflow Actions Section */}
        <div className={styles.section}>
          <div
            className={styles.sectionHeader}
            style={{ cursor: 'default' }}
          >
            <Text className={styles.sectionTitle}>Workflow Actions</Text>
          </div>
          <div className={styles.sectionContent}>
            <div className={styles.actionsGrid}>
              {canSubmitForReview && (
                <Button
                  icon={<ArrowForward20Regular />}
                  appearance='outline'
                  size='small'
                  className={styles.actionButton}
                  onClick={handleSubmitForReview}
                  disabled={actionLoading}
                >
                  Submit for Review
                </Button>
              )}
              {canApprove && (
                <Button
                  icon={<Checkmark20Regular />}
                  appearance='outline'
                  size='small'
                  className={styles.actionButton}
                  onClick={handleApprove}
                  disabled={actionLoading}
                >
                  Approve
                </Button>
              )}
              {canReject && (
                <Button
                  icon={<Dismiss20Regular />}
                  appearance='outline'
                  size='small'
                  className={styles.actionButton}
                  onClick={() => setRejectDialogOpen(true)}
                  disabled={actionLoading}
                >
                  Reject
                </Button>
              )}
              {canPublish && (
                <Button
                  icon={<Send20Regular />}
                  appearance='outline'
                  size='small'
                  className={styles.actionButton}
                  onClick={handlePublish}
                  disabled={actionLoading}
                >
                  Publish
                </Button>
              )}
              {canRetract && (
                <Button
                  icon={<ArrowUndo20Regular />}
                  appearance='outline'
                  size='small'
                  className={styles.actionButton}
                  onClick={handleRetract}
                  disabled={actionLoading}
                >
                  Retract
                </Button>
              )}
              <Button
                icon={<Flag20Regular />}
                appearance='subtle'
                size='small'
                className={styles.actionButton}
                onClick={() => setPriorityDialogOpen(true)}
                disabled={actionLoading}
              >
                Change Priority
              </Button>
              <Button
                icon={<Comment20Regular />}
                appearance='subtle'
                size='small'
                className={styles.actionButton}
                onClick={() => setCommentDialogOpen(true)}
                disabled={actionLoading}
              >
                Add Comment
              </Button>
            </div>

            {/* Check In button for edit mode */}
            {isCheckedOut && (
              <div
                style={{
                  display: 'flex',
                  gap: '8px',
                  paddingTop: '10px',
                  borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
                  marginTop: '10px',
                }}
              >
                <Button
                  icon={<Save20Regular />}
                  appearance='primary'
                  size='small'
                  className={styles.actionButton}
                  onClick={handleCheckin}
                  disabled={checkinLoading}
                >
                  Check In
                </Button>
              </div>
            )}
          </div>
        </div>

        {/* History Section */}
        <div className={styles.section}>
          <div
            className={styles.sectionHeader}
            onClick={() => setHistoryExpanded(!historyExpanded)}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <History20Regular />
              <Text className={styles.sectionTitle}>
                History ({history.length})
              </Text>
            </div>
            {historyExpanded ? (
              <ChevronUp20Regular />
            ) : (
              <ChevronDown20Regular />
            )}
          </div>
          {historyExpanded && (
            <div className={styles.sectionContent}>
              {historyLoading ? (
                <Spinner size='tiny' />
              ) : history.length === 0 ? (
                <Text className={styles.emptyState}>
                  No history available
                </Text>
              ) : (
                history.slice(0, 10).map((item, index) => (
                  <div key={index} className={styles.historyItem}>
                    <Text className={styles.historyStatus}>
                      {item.StatusName}
                    </Text>
                    <Text className={styles.historyMeta}>
                      {item.FullName} •{' '}
                      {format(
                        new Date(item.TimeStamp),
                        'MMM d, yyyy h:mm a'
                      )}
                    </Text>
                  </div>
                ))
              )}
            </div>
          )}
        </div>

        {/* Comments Section */}
        <div className={styles.section}>
          <div
            className={styles.sectionHeader}
            onClick={() => setCommentsExpanded(!commentsExpanded)}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <Comment20Regular />
              <Text className={styles.sectionTitle}>
                Comments ({comments.length})
              </Text>
            </div>
            {commentsExpanded ? (
              <ChevronUp20Regular />
            ) : (
              <ChevronDown20Regular />
            )}
          </div>
          {commentsExpanded && (
            <div className={styles.sectionContent}>
              {commentsLoading ? (
                <Spinner size='tiny' />
              ) : comments.length === 0 ? (
                <Text className={styles.emptyState}>No comments yet</Text>
              ) : (
                comments.slice(0, 10).map((comment, index) => (
                  <div key={index} className={styles.historyItem}>
                    <Text className={styles.historyStatus}>
                      {comment.FullName}
                    </Text>
                    <Text
                      style={{
                        fontSize: tokens.fontSizeBase200,
                        display: 'block',
                        margin: '4px 0',
                      }}
                    >
                      {comment.Comment}
                    </Text>
                    <Text className={styles.historyMeta}>
                      {format(
                        new Date(comment.TimeRecord),
                        'MMM d, yyyy h:mm a'
                      )}
                    </Text>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </div>
      </div> {/* end tabContent */}

      {/* Reject Bottom Sheet */}
      <BottomSheet
        open={rejectDialogOpen}
        onClose={() => setRejectDialogOpen(false)}
        title='Reject Document'
        subtitle={document?.DocName}
        icon={<Dismiss20Regular />}
        footer={
          <>
            <Button
              appearance='secondary'
              onClick={() => {
                setRejectDialogOpen(false);
                setRejectReason('');
              }}
              className={bottomSheetStyles.footerButton}
            >
              Cancel
            </Button>
            <Button
              appearance='primary'
              onClick={handleReject}
              className={bottomSheetStyles.footerButton}
              disabled={actionLoading}
            >
              {actionLoading ? <Spinner size='tiny' /> : 'Reject'}
            </Button>
          </>
        }
      >
        <Label
          htmlFor='rejectReason'
          style={{ marginBottom: '4px', display: 'block' }}
        >
          Reason for rejection (optional)
        </Label>
        <Textarea
          id='rejectReason'
          value={rejectReason}
          onChange={(_e, data) => setRejectReason(data.value)}
          placeholder='Enter reason for rejection...'
          resize='vertical'
          style={{ width: '100%' }}
        />
      </BottomSheet>

      {/* Change Priority Bottom Sheet */}
      <BottomSheet
        open={priorityDialogOpen}
        onClose={() => setPriorityDialogOpen(false)}
        title='Change Priority'
        subtitle={document?.DocName}
        icon={<Flag20Regular />}
        footer={
          <>
            <Button
              appearance='secondary'
              onClick={() => {
                setPriorityDialogOpen(false);
                setSelectedPriority('');
              }}
              className={bottomSheetStyles.footerButton}
            >
              Cancel
            </Button>
            <Button
              appearance='primary'
              onClick={handleChangePriority}
              className={bottomSheetStyles.footerButton}
              disabled={!selectedPriority || actionLoading}
            >
              {actionLoading ? <Spinner size='tiny' /> : 'Save'}
            </Button>
          </>
        }
      >
        {filtersLoading ? (
          <Spinner size='small' label='Loading priorities...' />
        ) : priorities.length === 0 ? (
          <Text>No priorities available</Text>
        ) : (
          <RadioGroup
            value={selectedPriority}
            onChange={(_e, data) => setSelectedPriority(data.value)}
          >
            {priorities.map((p) => (
              <Radio
                key={p.PriorityID}
                value={String(p.PriorityID)}
                label={p.PriorityName}
              />
            ))}
          </RadioGroup>
        )}
      </BottomSheet>

      {/* Add Comment Bottom Sheet */}
      <BottomSheet
        open={commentDialogOpen}
        onClose={() => setCommentDialogOpen(false)}
        title='Add Comment'
        subtitle={document?.DocName}
        icon={<Comment20Regular />}
        footer={
          <>
            <Button
              appearance='secondary'
              onClick={() => {
                setCommentDialogOpen(false);
                setNewComment('');
              }}
              className={bottomSheetStyles.footerButton}
            >
              Cancel
            </Button>
            <Button
              appearance='primary'
              onClick={handleAddComment}
              className={bottomSheetStyles.footerButton}
              disabled={!newComment.trim() || actionLoading}
            >
              {actionLoading ? <Spinner size='tiny' /> : 'Add Comment'}
            </Button>
          </>
        }
      >
        <Textarea
          value={newComment}
          onChange={(_e, data) => setNewComment(data.value)}
          placeholder='Enter your comment...'
          resize='vertical'
          style={{ width: '100%' }}
        />
      </BottomSheet>

      {/* Discard Changes Bottom Sheet — shown when navigating back with checked-out doc */}
      <BottomSheet
        open={discardDialogOpen}
        onClose={() => setDiscardDialogOpen(false)}
        title='Document Checked Out'
        subtitle={document?.DocName}
        icon={<LockOpen20Regular />}
        footer={<>
          <Button
            appearance='secondary'
            onClick={() => setDiscardDialogOpen(false)}
            className={bottomSheetStyles.footerButton}
            disabled={checkinLoading || discardLoading}
          >
            Cancel
          </Button>
          <Button
            appearance='secondary'
            onClick={() => { setDiscardDialogOpen(false); void handleCheckin(); }}
            className={bottomSheetStyles.footerButton}
            disabled={checkinLoading || discardLoading}
          >
            {checkinLoading ? <Spinner size='tiny' /> : 'Check In'}
          </Button>
          <Button
            appearance='primary'
            onClick={handleDiscardAndBack}
            className={bottomSheetStyles.footerButton}
            disabled={checkinLoading || discardLoading}
            style={{ backgroundColor: tokens.colorPaletteRedBackground3 }}
          >
            {discardLoading ? <Spinner size='tiny' /> : 'Discard & Go Back'}
          </Button>
        </>}
      >
        <Text style={{ fontSize: '14px', lineHeight: '1.5' }}>
          This document is checked out. Going back without checking in will
          leave it locked.
        </Text>
        <Text style={{ fontSize: '13px', color: tokens.colorNeutralForeground3, marginTop: '8px', display: 'block' }}>
          <strong>Check In</strong> — saves your current edits and releases the lock.
        </Text>
        <Text style={{ fontSize: '13px', color: tokens.colorNeutralForeground3, marginTop: '4px', display: 'block' }}>
          <strong>Discard &amp; Go Back</strong> — reverts to the original and releases the lock.
        </Text>
      </BottomSheet>
    </div>
  );
};

export default DocumentWorkflowPage;
