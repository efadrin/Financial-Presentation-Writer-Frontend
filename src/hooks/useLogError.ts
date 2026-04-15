import { useCallback } from "react";
import { useDispatch } from "react-redux";
import { store, type AppDispatch } from "@/store";
import { LoggerInfo, UserInfoLog } from "@/interfaces/LoggerInfo";
import { apiSlice } from "@/services/apiSlice";
import {
  serializeErrorWithStack,
  serializeErrorWithStackOnlyMessage,
} from "@/utils/errorUtils";

export function useLogError(userInfo: UserInfoLog, endpoint: string = "/api/") {
  const dispatch = useDispatch<AppDispatch>();

  return useCallback(
    async (action: string, error: unknown) => {
      try {
        let errorMsg = "";
        let errorDetail = "";
        if (error instanceof Error) {
          errorMsg = serializeErrorWithStackOnlyMessage(error);
          errorDetail = serializeErrorWithStack(error);
        } else if (typeof error === "string") {
          errorMsg = error;
          errorDetail = error;
        } else {
          errorMsg = JSON.stringify(error);
          errorDetail = JSON.stringify(error);
        }
        const state = store.getState();
        const settings = state.settings;
        const loggerInfo: LoggerInfo = {
          UserEmail: settings.userInfo?.Email,
          Action: action,
          Endpoint: endpoint,
          Method: "POST",
          ErrorInfo: errorMsg,
          StatusCode: 500,
          Logr: 1,
          LogDetail: errorDetail,
        };
        const logUserActivity = apiSlice.endpoints.logUserActivity;

        try {
          await dispatch(logUserActivity.initiate(loggerInfo)).unwrap();
        } catch (loggingError) {
          console.warn("Failed to log error to server:", loggingError);
        }
      } catch (err) {
        console.warn("Error in useLogError:", err);
      }
    },
    [dispatch, userInfo, endpoint],
  );
}
