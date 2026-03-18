import { useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import JSZip from 'jszip';
import { RootState } from '@/store';
import {
  useApproveDocumentMutation,
  useRejectDocumentMutation,
  useSubmitForReviewMutation,
  useKillDocumentMutation,
  useAnalystSignOffMutation,
  usePublishDocumentMutation,
  useLazyDownloadDocumentQuery,
  useGetRIXMLSubjectsQuery,
  useGetWorkflowFiltersQuery,
} from '@/services/apiSlice';
import { DocumentListResponse } from '@/interfaces/DocumentList';

export type BulkActionType =
  | 'delete'
  | 'submitForReview'
  | 'approve'
  | 'reject'
  | 'analystSignOff'
  | 'publish'
  | 'download';

export interface BulkActionResult {
  docId: number;
  docName: string;
  success: boolean;
  error?: string;
}

export interface BulkActionProgress {
  total: number;
  completed: number;
  failed: number;
  inProgress: boolean;
  results: BulkActionResult[];
}

interface UseBulkDocumentActionsReturn {
  executeBulkAction: (
    action: BulkActionType,
    documents: DocumentListResponse[],
    options?: { rejectReason?: string; distributeToPeelHunt?: boolean; distributeToSingleTrack?: boolean }
  ) => Promise<BulkActionResult[]>;
  progress: BulkActionProgress;
  resetProgress: () => void;
  isExecuting: boolean;
}

const useBulkDocumentActions = (): UseBulkDocumentActionsReturn => {
  const settings = useSelector((state: RootState) => state.settings);
  const accountName = settings.account?.AccountName || '';
  const srvrID = parseInt(settings.account?.SrvrID || '0', 10);
  const userID = parseInt(settings.account?.UserID?.toString() || '0', 10);
  const accountID = parseInt(settings.account?.AccountID || '0', 10);

  const [progress, setProgress] = useState<BulkActionProgress>({
    total: 0,
    completed: 0,
    failed: 0,
    inProgress: false,
    results: [],
  });

  // Mutations
  const [approve] = useApproveDocumentMutation();
  const [reject] = useRejectDocumentMutation();
  const [submitForReview] = useSubmitForReviewMutation();
  const [killDocument] = useKillDocumentMutation();
  const [analystSignOff] = useAnalystSignOffMutation();
  const [publishDocument] = usePublishDocumentMutation();
  const [downloadDoc] = useLazyDownloadDocumentQuery();

  // Get filters for publish
  const filterParams = accountName && srvrID > 0
    ? { AccountName: accountName, SrvrID: srvrID }
    : null;
  const { data: filtersResponse } = useGetWorkflowFiltersQuery(filterParams!, { skip: !filterParams });
  const publisherType = filtersResponse?.Data?.PublisherType || 'Default';
  const isPeelHuntPublisher = publisherType === 'PeelHunt';

  // Get RIXML subjects for publish
  const { data: rixmlSubjectsResponse } = useGetRIXMLSubjectsQuery(
    { accountName, accountID, srvrID },
    { skip: !accountName || !srvrID }
  );
  const rixmlSubjects = rixmlSubjectsResponse?.Data?.Subjects || [];

  const resetProgress = useCallback(() => {
    setProgress({
      total: 0,
      completed: 0,
      failed: 0,
      inProgress: false,
      results: [],
    });
  }, []);

  const createBaseRequest = useCallback(
    (docId: number) => ({
      AccountName: accountName,
      SrvrID: srvrID,
      DocID: docId,
      UserID: userID,
      AccountID: accountID,
    }),
    [accountName, srvrID, userID, accountID]
  );

  const executeBulkAction = useCallback(
    async (
      action: BulkActionType,
      documents: DocumentListResponse[],
      options?: { rejectReason?: string; distributeToPeelHunt?: boolean; distributeToSingleTrack?: boolean }
    ): Promise<BulkActionResult[]> => {
      const results: BulkActionResult[] = [];

      setProgress({
        total: documents.length,
        completed: 0,
        failed: 0,
        inProgress: true,
        results: [],
      });

      for (const doc of documents) {
        const baseRequest = createBaseRequest(doc.DocID);
        let success = false;
        let error: string | undefined;

        try {
          switch (action) {
            case 'delete':
              await killDocument(baseRequest).unwrap();
              success = true;
              break;

            case 'submitForReview':
              await submitForReview(baseRequest).unwrap();
              success = true;
              break;

            case 'approve':
              await approve(baseRequest).unwrap();
              success = true;
              break;

            case 'reject':
              if (!options?.rejectReason) {
                throw new Error('Reject reason is required');
              }
              await reject({ ...baseRequest, Reason: options.rejectReason }).unwrap();
              success = true;
              break;

            case 'analystSignOff':
              await analystSignOff({ ...baseRequest, DocName: doc.DocName }).unwrap();
              success = true;
              break;

            case 'publish': {
              const templateName = doc.TemplateName || '';
              const matchingSubject = rixmlSubjects.find(
                (s) => s.SubjectPublisherDefined.toLowerCase() === templateName.toLowerCase()
              );

              await publishDocument({
                ...baseRequest,
                DocName: doc.DocName,
                SubjectEnum: matchingSubject?.SubjectEnum || '',
                SubjectPublisherDefined: matchingSubject?.SubjectPublisherDefined || templateName,
                DistributeToPeelHunt: isPeelHuntPublisher ? (options?.distributeToPeelHunt ?? true) : false,
                DistributeToSingleTrack: options?.distributeToSingleTrack ?? true,
              }).unwrap();
              success = true;
              break;
            }

            case 'download': {
              // Download is handled separately below for ZIP creation
              success = true;
              break;
            }
          }
        } catch (err) {
          success = false;
          error = err instanceof Error ? err.message : 'Unknown error occurred';
        }

        const result: BulkActionResult = {
          docId: doc.DocID,
          docName: doc.DocName,
          success,
          error,
        };

        results.push(result);

        setProgress((prev) => ({
          ...prev,
          completed: prev.completed + 1,
          failed: prev.failed + (success ? 0 : 1),
          results: [...prev.results, result],
        }));
      }

      // Special handling for bulk download - create ZIP file
      if (action === 'download') {
        const zip = new JSZip();
        let downloadedCount = 0;

        for (const doc of documents) {
          try {
            const result = await downloadDoc({
              AccountName: accountName,
              SrvrID: srvrID,
              DocID: doc.DocID,
              DocType: doc.StatusName === 'Published' ? 1 : 0,
            }).unwrap();

            if (result.Data?.Success && result.Data.BlobBase64) {
              const fileName = result.Data.DocName || `Document_${doc.DocID}.pdf`;
              // Convert base64 to binary
              const binaryString = atob(result.Data.BlobBase64);
              const bytes = new Uint8Array(binaryString.length);
              for (let i = 0; i < binaryString.length; i++) {
                bytes[i] = binaryString.charCodeAt(i);
              }
              zip.file(fileName, bytes);
              downloadedCount++;
            }
          } catch (err) {
            console.error(`Failed to download document ${doc.DocID}:`, err);
          }
        }

        if (downloadedCount > 0) {
          // Generate ZIP and trigger download
          const zipBlob = await zip.generateAsync({ type: 'blob' });
          const url = URL.createObjectURL(zipBlob);
          const link = document.createElement('a');
          link.href = url;
          link.download = `documents_${new Date().toISOString().slice(0, 10)}.zip`;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          URL.revokeObjectURL(url);
        }
      }

      setProgress((prev) => ({
        ...prev,
        inProgress: false,
      }));

      return results;
    },
    [
      createBaseRequest,
      killDocument,
      submitForReview,
      approve,
      reject,
      analystSignOff,
      publishDocument,
      downloadDoc,
      accountName,
      srvrID,
      rixmlSubjects,
      isPeelHuntPublisher,
    ]
  );

  return {
    executeBulkAction,
    progress,
    resetProgress,
    isExecuting: progress.inProgress,
  };
};

export default useBulkDocumentActions;
