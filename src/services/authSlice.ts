import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import {
  LoginData,
  LoginRequest,
  LoginThunkResponse,
} from '@/interfaces/Authentication';
import { getMSAccessToken, isTokenExpired } from '@/utils/tokenUtils';
import { ApiResponse } from '@/interfaces/ApiResponses';
import { AuthStatus, AuthStatusConst, BASE_API_URL } from '@/utils/constants';
import { RootState } from '@/store';

interface AuthState {
  sessionToken: string | null;
  msAccessToken: string | null;
  lastLogin: Date | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
  status: AuthStatus;
}

const initialState: AuthState = {
  sessionToken: null,
  msAccessToken: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  status: AuthStatusConst.initial,
  lastLogin: null,
};

export const login = createAsyncThunk<LoginThunkResponse>(
  'auth/login',
  async (_, { rejectWithValue, getState }) => {
    try {
      const state = getState() as RootState;
      let msAccessToken = selectMSAccessToken(state);

      if (msAccessToken === null || isTokenExpired(msAccessToken)) {
        msAccessToken = await getMSAccessToken();
      }

      let sessionToken = selectSessionToken(state);
      if (sessionToken === null || isTokenExpired(sessionToken)) {
        const loginRequestBody: LoginRequest = {
          Token: msAccessToken,
        };
        const response = await fetch(`${BASE_API_URL}/auth/login`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(loginRequestBody),
        });

        const responseData: ApiResponse<LoginData> = await response.json();

        if (!response.ok) {
          return rejectWithValue(responseData.Message || 'Login failed');
        }
        sessionToken = responseData.Data.SessionToken;
      }

      return {
        SessionToken: sessionToken,
        MsAccessToken: msAccessToken,
      } as LoginThunkResponse;
    } catch (error) {
      return rejectWithValue(error);
    }
  }
);

export const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setToken: (state, action) => {
      state.sessionToken = action.payload;
      state.isAuthenticated = true;
    },
    clearAuth: (state) => {
      state.sessionToken = null;
      state.isAuthenticated = false;
      state.loading = false;
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.isAuthenticated = false;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.sessionToken = action.payload.SessionToken;
        state.msAccessToken = action.payload.MsAccessToken;
        state.isAuthenticated = true;
        state.loading = false;
        state.error = null;
        state.status = AuthStatusConst.loggedIn;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.isAuthenticated = false;
        state.lastLogin = new Date();
        state.error = action.payload as string;
        state.status = AuthStatusConst.failed;
      });
  },
});

export const { setToken, clearAuth } = authSlice.actions;
export default authSlice.reducer;

export const selectMSAccessToken = (state: RootState) =>
  state[authSlice.name].msAccessToken;
export const selectSessionToken = (state: RootState) =>
  state[authSlice.name].sessionToken;
