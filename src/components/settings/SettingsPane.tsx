import React from "react";
import {
  OverlayDrawer,
  DrawerHeader,
  DrawerHeaderTitle,
  DrawerBody,
  Button,
  makeStyles,
  tokens,
} from "@fluentui/react-components";
import { Dismiss24Regular } from "@fluentui/react-icons";
import { useTranslation } from "react-i18next";
import { DatabaseSettingsTab } from "@/components/settings/DatabaseSettingsTab";

interface SettingsPaneProps {
  isOpen: boolean;
  onClose: () => void;
}

const useStyles = makeStyles({
  body: {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    padding: "0 16px 16px",
  },
  headerTitle: {
    fontSize: tokens.fontSizeBase400,
    fontWeight: tokens.fontWeightSemibold,
  },
});

export const SettingsPane: React.FC<SettingsPaneProps> = ({
  isOpen,
  onClose,
}) => {
  const styles = useStyles();
  const { t } = useTranslation();

  return (
    <OverlayDrawer
      position="end"
      open={isOpen}
      onOpenChange={(_, data) => {
        if (!data.open) onClose();
      }}
      size="small"
    >
      <DrawerHeader>
        <DrawerHeaderTitle
          action={
            <Button
              appearance="subtle"
              aria-label={t("common.close", "Close")}
              icon={<Dismiss24Regular />}
              onClick={onClose}
            />
          }
        >
          <span className={styles.headerTitle}>
            {t("settings", "Settings")}
          </span>
        </DrawerHeaderTitle>
      </DrawerHeader>
      <DrawerBody className={styles.body}>
        <DatabaseSettingsTab />
      </DrawerBody>
    </OverlayDrawer>
  );
};
