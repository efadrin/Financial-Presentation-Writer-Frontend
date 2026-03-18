import React from "react";
import {
  makeStyles,
  tokens,
  Text,
  Spinner,
  Button,
} from "@fluentui/react-components";
import {
  Open24Regular,
  Edit24Regular,
  Eye24Regular,
  Checkmark20Filled,
} from "@fluentui/react-icons";
import { BottomSheet, useBottomSheetStyles } from "../common/BottomSheet";

const useStyles = makeStyles({
  optionsContainer: {
    display: "flex",
    flexDirection: "column",
    gap: "10px",
  },
  optionCard: {
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "14px 16px",
    borderRadius: "10px",
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    cursor: "pointer",
    transition: "all 0.2s ease",
    ":hover": {
      backgroundColor: tokens.colorNeutralBackground2,
    },
  },
  optionCardSelected: {
    borderTopColor: tokens.colorBrandForeground1,
    borderRightColor: tokens.colorBrandForeground1,
    borderBottomColor: tokens.colorBrandForeground1,
    borderLeftColor: tokens.colorBrandForeground1,
    backgroundColor: tokens.colorBrandBackground2,
  },
  optionIconWrapper: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: tokens.colorBrandBackground2,
    color: tokens.colorBrandForeground1,
    flexShrink: 0,
  },
  optionContent: {
    flex: 1,
  },
  optionTitle: {
    fontWeight: 600,
    fontSize: "14px",
  },
  optionDescription: {
    fontSize: "12px",
    color: tokens.colorNeutralForeground3,
    marginTop: "2px",
  },
  checkmark: {
    flexShrink: 0,
    color: tokens.colorBrandForeground1,
  },
});

interface OpenInPowerPointDialogProps {
  open: boolean;
  onClose: () => void;
  onOpen: (mode: "edit" | "view") => void;
  isLoading?: boolean;
  docName?: string;
}

export const OpenInPowerPointDialog: React.FC<OpenInPowerPointDialogProps> = ({
  open,
  onClose,
  onOpen,
  isLoading,
  docName,
}) => {
  const styles = useStyles();
  const bottomSheetStyles = useBottomSheetStyles();
  const [selectedMode, setSelectedMode] = React.useState<"edit" | "view">(
    "edit",
  );

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Open Presentation"
      subtitle={docName}
      icon={<Open24Regular />}
      footer={
        <>
          <Button
            appearance="secondary"
            onClick={onClose}
            className={bottomSheetStyles.footerButton}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button
            appearance="primary"
            onClick={() => onOpen(selectedMode)}
            disabled={isLoading}
            className={bottomSheetStyles.footerButton}
          >
            {isLoading ? <Spinner size="tiny" /> : "Open"}
          </Button>
        </>
      }
    >
      <div className={styles.optionsContainer}>
        {/* Edit Mode */}
        <div
          className={`${styles.optionCard} ${selectedMode === "edit" ? styles.optionCardSelected : ""}`}
          onClick={() => setSelectedMode("edit")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setSelectedMode("edit");
            }
          }}
        >
          <div className={styles.optionIconWrapper}>
            <Edit24Regular />
          </div>
          <div className={styles.optionContent}>
            <div className={styles.optionTitle}>Edit Mode</div>
            <div className={styles.optionDescription}>
              Check out the document and open it for editing
            </div>
          </div>
          {selectedMode === "edit" && (
            <Checkmark20Filled className={styles.checkmark} />
          )}
        </div>

        {/* View Mode */}
        <div
          className={`${styles.optionCard} ${selectedMode === "view" ? styles.optionCardSelected : ""}`}
          onClick={() => setSelectedMode("view")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setSelectedMode("view");
            }
          }}
        >
          <div className={styles.optionIconWrapper}>
            <Eye24Regular />
          </div>
          <div className={styles.optionContent}>
            <div className={styles.optionTitle}>View Mode</div>
            <div className={styles.optionDescription}>
              Open the document in read-only mode without checking out
            </div>
          </div>
          {selectedMode === "view" && (
            <Checkmark20Filled className={styles.checkmark} />
          )}
        </div>
      </div>
    </BottomSheet>
  );
};
