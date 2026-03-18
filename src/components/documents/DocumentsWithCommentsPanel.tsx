import React, { useState } from 'react';
import { makeStyles } from '@fluentui/react-components';
import { DocumentListTable } from './DocumentListTable';
import { CommentsPanel } from './CommentsPanel';
import { DocumentListResponse } from '@/interfaces/DocumentList';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'row',
    height: '100%',
    position: 'relative',
    overflow: 'hidden',
  },
  mainContent: {
    flex: 1,
    height: '100%',
    overflow: 'hidden',
    transition: 'transform 0.3s ease',
  },
  panelContainer: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'white',
    transform: 'translateX(100%)',
    transition: 'transform 0.3s ease',
    zIndex: 10,
  },
  panelContainerVisible: {
    transform: 'translateX(0)',
  },
});

interface DocumentsWithCommentsPanelProps {
  documents: DocumentListResponse[];
  status: string;
  onDocumentClick?: (document: DocumentListResponse) => void;
  onActionComplete?: () => void;
  onDocumentDeleted?: (docId: number) => void;
  selectedDocuments?: number[];
  onDocumentSelect?: (docId: number, selected: boolean) => void;
}

export const DocumentsWithCommentsPanel: React.FC<DocumentsWithCommentsPanelProps> = ({
  documents,
  status,
  onDocumentClick,
  onActionComplete,
  onDocumentDeleted,
  selectedDocuments,
  onDocumentSelect,
}) => {
  const styles = useStyles();
  const [commentsPanelOpen, setCommentsPanelOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<DocumentListResponse | null>(null);

  const handleOpenCommentsPanel = (document: DocumentListResponse) => {
    setSelectedDocument(document);
    setCommentsPanelOpen(true);
  };

  const handleCloseCommentsPanel = () => {
    setCommentsPanelOpen(false);
    setSelectedDocument(null);
  };

  return (
    <div className={styles.container}>
      {/* Main Document List */}
      <div className={styles.mainContent}>
        <DocumentListTable
          documents={documents}
          status={status}
          onDocumentClick={onDocumentClick}
          onActionComplete={onActionComplete}
          onDocumentDeleted={onDocumentDeleted}
          selectedDocuments={selectedDocuments}
          onDocumentSelect={onDocumentSelect}
        />
      </div>

      {/* Slide-in Comments Panel */}
      {selectedDocument && (
        <div
          className={`${styles.panelContainer} ${commentsPanelOpen ? styles.panelContainerVisible : ''}`}
        >
          <CommentsPanel
            docId={selectedDocument.DocID}
            docName={selectedDocument.DocName}
            onClose={handleCloseCommentsPanel}
          />
        </div>
      )}
    </div>
  );
};
