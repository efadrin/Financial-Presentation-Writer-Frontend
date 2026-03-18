import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import {
  makeStyles,
  tokens,
  Button,
  Tooltip,
} from "@fluentui/react-components";
import { Settings24Regular } from "@fluentui/react-icons";
import { useTranslation } from "react-i18next";
import { useAppSelector } from "@/store";
import { SettingsPane } from "@/components/settings/SettingsPane";

const useStyles = makeStyles({
  container: {
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    backgroundColor: tokens.colorNeutralBackground1,
    overflow: "hidden",
  },
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "flex-end",
    padding: "4px 8px",
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground1,
    minHeight: "40px",
  },
  mainContent: {
    flex: 1,
    overflow: "hidden",
    display: "flex",
    flexDirection: "column",
    minWidth: 0,
    backgroundColor: tokens.colorNeutralBackground1,
  },
});

export const AppLayout: React.FC = () => {
  const styles = useStyles();
  const { t } = useTranslation();
  const settings = useAppSelector((state) => state.settings);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Auto-open settings if no account is configured
  useEffect(() => {
    if (!settings.account?.AccountID) {
      setIsSettingsOpen(true);
    }
  }, []);

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <Tooltip content={t("settings", "Settings")} relationship="label">
          <Button
            appearance="subtle"
            icon={<Settings24Regular />}
            onClick={() => setIsSettingsOpen(true)}
            aria-label={t("settings", "Settings")}
          />
        </Tooltip>
      </div>
      <main className={styles.mainContent}>
        <Outlet />
      </main>
      <SettingsPane
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
      />
    </div>
  );
};
