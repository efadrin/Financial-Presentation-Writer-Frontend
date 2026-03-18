import { createSlice, PayloadAction } from "@reduxjs/toolkit";

export interface FinancialSource {
  FinancialSourceID: string;
  FinancialSourceKey: string;
  FinancialSourceName: string;
}

export interface Account {
  AccountID: string;
  AccountName: string;
  SrvrID: string;
  UserID: string;
  FullName: string;
  ServerIPAddress: string;
}

export interface CachedUserInfo {
  Email: string;
  FirmID: string;
  FirmKey: string;
  isRegistered: boolean;
}

export interface SettingsState {
  financials: FinancialSource;
  account: Account | null;
  userInfo: CachedUserInfo;
}

const initialState: SettingsState = {
  financials: {
    FinancialSourceID: "",
    FinancialSourceName: "",
    FinancialSourceKey: "",
  },
  account: null,
  userInfo: {
    Email: "",
    FirmID: "",
    FirmKey: "",
    isRegistered: false,
  },
};

export const settingSlice = createSlice({
  name: "settings",
  reducerPath: "settings",
  initialState,
  reducers: {
    setFinancialSource(state, action: PayloadAction<FinancialSource>) {
      state.financials = action.payload;
    },
    setAccountData(state, action: PayloadAction<Account | null>) {
      state.account = action.payload;
    },
    setUserInfo(state, action: PayloadAction<CachedUserInfo>) {
      state.userInfo = action.payload;
    },
    pruneAllSettings(state) {
      state.financials = {
        FinancialSourceID: "",
        FinancialSourceName: "",
        FinancialSourceKey: "",
      };
      state.account = null;
      state.userInfo = {
        Email: "",
        FirmID: "",
        FirmKey: "",
        isRegistered: false,
      };
    },
  },
});

export const {
  setFinancialSource,
  setAccountData,
  setUserInfo,
  pruneAllSettings,
} = settingSlice.actions;
export default settingSlice.reducer;
