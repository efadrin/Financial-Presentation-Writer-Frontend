import React from "react";
import { useRouteError, useNavigate } from "react-router-dom";
import {
  makeStyles,
  tokens,
  Button,
  Text,
  Title3,
  Body1,
  Caption1,
} from "@fluentui/react-components";
import {
  ArrowClockwise24Regular,
  Home24Regular,
  Warning24Regular,
} from "@fluentui/react-icons";

const useStyles = makeStyles({
  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    minHeight: "100vh",
    width: "100%",
    padding: "32px",
    textAlign: "center",
    gap: "16px",
    backgroundColor: tokens.colorNeutralBackground1,
  },
  iconWrapper: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "80px",
    height: "80px",
    borderRadius: "50%",
    backgroundColor: tokens.colorPaletteYellowBackground2,
    marginBottom: "8px",
  },
  icon: {
    color: tokens.colorPaletteYellowForeground2,
    fontSize: "40px",
  },
  title: {
    marginBottom: "4px",
  },
  description: {
    color: tokens.colorNeutralForeground2,
    maxWidth: "400px",
    lineHeight: "1.5",
  },
  buttonGroup: {
    display: "flex",
    gap: "12px",
    marginTop: "16px",
  },
  errorDetails: {
    marginTop: "24px",
    padding: "12px 16px",
    backgroundColor: tokens.colorNeutralBackground3,
    borderRadius: tokens.borderRadiusMedium,
    maxWidth: "500px",
    textAlign: "left",
    wordBreak: "break-word",
  },
  errorText: {
    fontFamily: "monospace",
    fontSize: "12px",
    color: tokens.colorNeutralForeground3,
  },
});

const CHUNK_ERROR_RELOAD_KEY = "chunk_error_reload_timestamp";
const RELOAD_COOLDOWN_MS = 10000;

const isChunkLoadError = (error: unknown): boolean => {
  if (error instanceof Error) {
    return (
      error.message.includes("Loading chunk") ||
      error.message.includes("ChunkLoadError") ||
      error.message.includes("Failed to fetch dynamically imported module") ||
      error.name === "ChunkLoadError"
    );
  }
  return false;
};

const shouldAutoReload = (): boolean => {
  const lastReload = sessionStorage.getItem(CHUNK_ERROR_RELOAD_KEY);
  if (!lastReload) return true;
  const timeSinceLastReload = Date.now() - parseInt(lastReload, 10);
  return timeSinceLastReload > RELOAD_COOLDOWN_MS;
};

const autoReloadForChunkError = (): void => {
  sessionStorage.setItem(CHUNK_ERROR_RELOAD_KEY, Date.now().toString());
  window.location.reload();
};

const RouteErrorBoundary: React.FC = () => {
  const error = useRouteError();
  const navigate = useNavigate();
  const styles = useStyles();
  const [showDetails, setShowDetails] = React.useState(false);

  const isChunkError = isChunkLoadError(error);
  const canAutoReload = isChunkError && shouldAutoReload();

  React.useEffect(() => {
    if (canAutoReload) {
      autoReloadForChunkError();
    }
  }, [canAutoReload]);

  if (canAutoReload) {
    return (
      <div className={styles.container}>
        <div className={styles.iconWrapper}>
          <ArrowClockwise24Regular className={styles.icon} />
        </div>
        <Title3>Updating...</Title3>
        <Body1 className={styles.description}>
          A new version is available. Refreshing automatically.
        </Body1>
      </div>
    );
  }

  const handleRetry = () => {
    window.location.reload();
  };

  const handleGoHome = () => {
    navigate("/");
  };

  const getErrorMessage = (): string => {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === "string") {
      return error;
    }
    return "An unknown error occurred";
  };

  return (
    <div className={styles.container}>
      <div className={styles.iconWrapper}>
        <Warning24Regular className={styles.icon} />
      </div>

      <Title3 className={styles.title}>
        {isChunkError ? "Page Failed to Load" : "Something went wrong"}
      </Title3>

      <Body1 className={styles.description}>
        {isChunkError
          ? "We tried refreshing automatically but the issue persists. Please wait a moment and try again, or clear your browser cache."
          : "An unexpected error occurred while loading this page. Please try again or return to the home page."}
      </Body1>

      <div className={styles.buttonGroup}>
        <Button
          appearance="primary"
          icon={<ArrowClockwise24Regular />}
          onClick={handleRetry}
        >
          Refresh Page
        </Button>
        <Button
          appearance="secondary"
          icon={<Home24Regular />}
          onClick={handleGoHome}
        >
          Go to Home
        </Button>
      </div>

      <Caption1
        style={{
          color: tokens.colorNeutralForeground3,
          cursor: "pointer",
          marginTop: "16px",
        }}
        onClick={() => setShowDetails(!showDetails)}
      >
        {showDetails ? "Hide error details" : "Show error details"}
      </Caption1>

      {showDetails && (
        <div className={styles.errorDetails}>
          <Text className={styles.errorText}>{getErrorMessage()}</Text>
        </div>
      )}
    </div>
  );
};

export default RouteErrorBoundary;
