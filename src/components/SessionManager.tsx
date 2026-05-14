import React, { useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useTranslation } from "react-i18next";
import { AppDispatch, RootState } from "@/store";
import { login } from "@/services/authSlice";
import { FullPageCenter } from "./common/FullPageCenter";
import { makeStyles } from "@fluentui/react-components";
import AppSkeleton from "./common/AppSkeleton";

interface SessionManagerProps {
  children: React.ReactNode;
  fallback: React.ReactNode;
}

const useStyles = makeStyles({
  fallbackContainer: {
    padding: "0 20px",
    flexDirection: "column",
    boxSizing: "border-box",
  },
});

const SessionManager: React.FC<SessionManagerProps> = ({
  children,
  fallback,
}) => {
  const styles = useStyles();
  const dispatch = useDispatch<AppDispatch>();
  const hasDispatchedLogin = useRef(false);

  const { loading, isAuthenticated, sessionToken } = useSelector(
    (state: RootState) => state.auth,
  );
  const { t } = useTranslation();

  useEffect(() => {
    if (!hasDispatchedLogin.current && !loading && !sessionToken) {
      hasDispatchedLogin.current = true;
      dispatch(login());
    }
  }, [dispatch, loading, sessionToken]);

  if (loading) {
    return <AppSkeleton message={t("loggingIn")} />;
  }

  if (isAuthenticated) {
    return children;
  }

  return (
    <FullPageCenter className={styles.fallbackContainer}>
      {fallback}
    </FullPageCenter>
  );
};

export default SessionManager;
