import React, { useState } from "react";
import { DocumentListTable } from "./DocumentListTable";
import { CommentsBottomSheet } from "./CommentsBottomSheet";
import { DocumentListResponse } from "@/interfaces/DocumentList";

interface DocumentsWithBottomSheetProps {
  documents: DocumentListResponse[];
  status: string;
  onDocumentClick?: (document: DocumentListResponse) => void;
  onActionComplete?: () => void;
  onDocumentDeleted?: (docId: number) => void;
  selectedDocuments?: number[];
  onDocumentSelect?: (docId: number, selected: boolean) => void;
}

export const DocumentsWithBottomSheet: React.FC<
  DocumentsWithBottomSheetProps
> = ({
  documents,
  status,
  onDocumentClick,
  onActionComplete,
  onDocumentDeleted,
  selectedDocuments,
  onDocumentSelect,
}) => {
  const [commentsSheetOpen, setCommentsSheetOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] =
    useState<DocumentListResponse | null>(null);

  const handleOpenCommentsSheet = (document: DocumentListResponse) => {
    setSelectedDocument(document);
    setCommentsSheetOpen(true);
  };

  const handleCloseCommentsSheet = () => {
    setCommentsSheetOpen(false);
    // Keep selectedDocument for animation completion
    setTimeout(() => setSelectedDocument(null), 300);
  };

  return (
    <>
      <DocumentListTable
        documents={documents}
        status={status}
        onDocumentClick={onDocumentClick}
        onActionComplete={onActionComplete}
        onDocumentDeleted={onDocumentDeleted}
        selectedDocuments={selectedDocuments}
        onDocumentSelect={onDocumentSelect}
      />

      {/* Bottom Sheet */}
      {selectedDocument && (
        <CommentsBottomSheet
          document={selectedDocument}
          open={commentsSheetOpen}
          onClose={handleCloseCommentsSheet}
        />
      )}
    </>
  );
};
