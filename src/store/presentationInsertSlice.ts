import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface QueryErrorLockState {
  message: string;
  insertAt: string;
  lockedAt: number;
}

export interface PresentationInsertState {
  namedChartShapes: string[];
  namedTableShapes: string[];
  filledShapes: string[];
  insertedQueryNames: string[];
  lockedQueries: Record<string, QueryErrorLockState>;
  defaultCorpID: string | null;
  defaultCorpName: string | null;
  defaultCorpModel: string | null;
}

const initialState: PresentationInsertState = {
  namedChartShapes: [],
  namedTableShapes: [],
  filledShapes: [],
  insertedQueryNames: [],
  lockedQueries: {},
  defaultCorpID: null,
  defaultCorpName: null,
  defaultCorpModel: null,
};

export const presentationInsertSlice = createSlice({
  name: 'presentationInsert',
  initialState,
  reducers: {
    setNamedChartShapes(state, action: PayloadAction<string[]>) {
      state.namedChartShapes = action.payload;
    },
    setNamedTableShapes(state, action: PayloadAction<string[]>) {
      state.namedTableShapes = action.payload;
    },
    setFilledShapes(state, action: PayloadAction<string[]>) {
      state.filledShapes = action.payload;
    },
    markQueryInserted(state, action: PayloadAction<string>) {
      if (!state.insertedQueryNames.includes(action.payload)) {
        state.insertedQueryNames.push(action.payload);
      }
    },
    lockQuery(
      state,
      action: PayloadAction<{ queryId: string; lock: QueryErrorLockState }>
    ) {
      state.lockedQueries[action.payload.queryId] = action.payload.lock;
    },
    unlockQuery(state, action: PayloadAction<string>) {
      delete state.lockedQueries[action.payload];
    },
    setDefaultCorp(
      state,
      action: PayloadAction<{
        corpID: string | null;
        corpName: string | null;
        corpModel: string | null;
      }>
    ) {
      state.defaultCorpID = action.payload.corpID;
      state.defaultCorpName = action.payload.corpName;
      state.defaultCorpModel = action.payload.corpModel;
      // Clear per-company state so items can be re-inserted for the new company
      state.insertedQueryNames = [];
      state.lockedQueries = {};
    },
  },
});

export const {
  setNamedChartShapes,
  setNamedTableShapes,
  setFilledShapes,
  markQueryInserted,
  lockQuery,
  unlockQuery,
  setDefaultCorp,
} = presentationInsertSlice.actions;

export default presentationInsertSlice.reducer;
