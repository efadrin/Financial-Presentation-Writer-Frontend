import React from "react";
import { makeStyles, tokens, shorthands } from "@fluentui/react-components";

const useStyles = makeStyles({
  container: {
    display: "flex",
    height: "100vh",
    backgroundColor: tokens.colorNeutralBackground1,
    overflow: "hidden",
  },
  sidebar: {
    width: "34px",
    height: "100vh",
    backgroundColor: tokens.colorNeutralBackground2,
    borderRight: `1px solid ${tokens.colorNeutralStroke2}`,
    display: "flex",
    flexDirection: "column",
    ...shorthands.padding("6px"),
    gap: "8px",
  },
  sidebarItem: {
    width: "22px",
    height: "22px",
    backgroundColor: tokens.colorNeutralBackground4,
    borderRadius: "4px",
    animation: "pulse 1.5s ease-in-out infinite",
  },
  mainContent: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    ...shorthands.padding("16px"),
    gap: "16px",
  },
  header: {
    height: "40px",
    backgroundColor: tokens.colorNeutralBackground3,
    borderRadius: "8px",
    animation: "pulse 1.5s ease-in-out infinite",
    animationDelay: "0.1s",
  },
  searchBar: {
    height: "36px",
    backgroundColor: tokens.colorNeutralBackground3,
    borderRadius: "4px",
    animation: "pulse 1.5s ease-in-out infinite",
    animationDelay: "0.2s",
    maxWidth: "100%",
  },
  contentArea: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    gap: "12px",
  },
  listItem: {
    height: "60px",
    backgroundColor: tokens.colorNeutralBackground3,
    borderRadius: "8px",
    animation: "pulse 1.5s ease-in-out infinite",
  },
  loadingText: {
    textAlign: "center",
    color: tokens.colorNeutralForeground3,
    fontSize: "13px",
    marginTop: "20px",
  },
});

const pulseKeyframes = `
  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
`;

interface AppSkeletonProps {
  message?: string;
}

const AppSkeleton: React.FC<AppSkeletonProps> = ({
  message = "Loading...",
}) => {
  const styles = useStyles();

  return (
    <>
      <style>{pulseKeyframes}</style>
      <div className={styles.container}>
        <div className={styles.sidebar}>
          <div className={styles.sidebarItem} />
          <div className={styles.sidebarItem} />
          <div className={styles.sidebarItem} />
          <div className={styles.sidebarItem} />
          <div style={{ flex: 1 }} />
          <div className={styles.sidebarItem} />
        </div>

        <div className={styles.mainContent}>
          <div className={styles.header} />
          <div className={styles.searchBar} />

          <div className={styles.contentArea}>
            <div
              className={styles.listItem}
              style={{ animationDelay: "0.3s" }}
            />
            <div
              className={styles.listItem}
              style={{ animationDelay: "0.4s" }}
            />
            <div
              className={styles.listItem}
              style={{ animationDelay: "0.5s" }}
            />
            <div
              className={styles.listItem}
              style={{ animationDelay: "0.6s" }}
            />
          </div>

          <p className={styles.loadingText}>{message}</p>
        </div>
      </div>
    </>
  );
};

export default AppSkeleton;
