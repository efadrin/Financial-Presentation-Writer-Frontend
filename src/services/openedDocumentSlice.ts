import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { DocumentListResponse } from '@/interfaces/DocumentList';

/**
 * State for tracking the currently opened workflow document in Word
 */
export interface OpenedDocumentState {
  /** The opened document's metadata */
  document: DocumentListResponse | null;
  /** Whether the current user has checked out (locked) the document for editing */
  isCheckedOut: boolean;
  /** Whether the document was opened in view-only mode (no checkout) */
  isViewOnly: boolean;
  /** Whether there are unsaved local changes (draft mode) */
  hasLocalChanges: boolean;
  /** Original document blob for comparison/discard functionality */
  originalBlob: string | null;
  /** Loading state while opening document */
  isLoading: boolean;
  /** Error message if opening failed */
  error: string | null;
}

const initialState: OpenedDocumentState = {
  document: null,
  isCheckedOut: false,
  isViewOnly: false,
  hasLocalChanges: false,
  originalBlob: null,
  isLoading: false,
  error: null,
};

export const openedDocumentSlice = createSlice({
  name: 'openedDocument',
  initialState,
  reducers: {
    /**
     * Start loading a document (before fetching blob)
     */
    setLoading(state, action: PayloadAction<boolean>) {
      state.isLoading = action.payload;
      if (action.payload) {
        state.error = null;
      }
    },

    /**
     * Set the opened document after successfully loading into Word
     */
    setOpenedDocument(
      state,
      action: PayloadAction<{
        document: DocumentListResponse;
        isCheckedOut: boolean;
        isViewOnly: boolean;
        originalBlob: string;
      }>
    ) {
      state.document = action.payload.document;
      state.isCheckedOut = action.payload.isCheckedOut;
      state.isViewOnly = action.payload.isViewOnly;
      state.originalBlob = action.payload.originalBlob;
      state.hasLocalChanges = false;
      state.isLoading = false;
      state.error = null;
    },

    /**
     * Update the document metadata (e.g., after status change)
     */
    updateDocumentMetadata(state, action: PayloadAction<Partial<DocumentListResponse>>) {
      if (state.document) {
        state.document = { ...state.document, ...action.payload };
      }
    },

    /**
     * Mark that local changes have been made
     */
    setHasLocalChanges(state, action: PayloadAction<boolean>) {
      state.hasLocalChanges = action.payload;
    },

    /**
     * Clear the opened document state (after check-in or close)
     */
    clearOpenedDocument(state) {
      state.document = null;
      state.isCheckedOut = false;
      state.isViewOnly = false;
      state.hasLocalChanges = false;
      state.originalBlob = null;
      state.isLoading = false;
      state.error = null;
    },

    /**
     * Set error state
     */
    setError(state, action: PayloadAction<string>) {
      state.error = action.payload;
      state.isLoading = false;
    },

    /**
     * Update checkout status (e.g., after successful checkout or checkin)
     */
    setCheckedOut(state, action: PayloadAction<boolean>) {
      state.isCheckedOut = action.payload;
      if (!action.payload) {
        // If checked in, clear local changes flag
        state.hasLocalChanges = false;
      }
    },
  },
});

export const {
  setLoading,
  setOpenedDocument,
  updateDocumentMetadata,
  setHasLocalChanges,
  clearOpenedDocument,
  setError,
  setCheckedOut,
} = openedDocumentSlice.actions;

export default openedDocumentSlice.reducer;
