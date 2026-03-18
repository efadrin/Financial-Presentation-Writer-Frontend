import React, { useCallback, useMemo } from "react";
import {
  makeStyles,
  tokens,
  Text,
  Spinner,
  Button,
} from "@fluentui/react-components";
import {
  ShieldLock24Regular,
  ShieldCheckmark24Regular,
  Checkmark20Filled,
} from "@fluentui/react-icons";
import { DocumentListResponse } from "@/interfaces/DocumentList";
import { useUpdateWallCrossStatusMutation } from "@/services/apiSlice";
import { BottomSheet, useBottomSheetStyles } from "../common/BottomSheet";
import { useAppSelector } from "@/store";
import { WF_DECLARATION } from "@/utils/constants";

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
  optionCardNone: {},
  optionCardNoneSelected: {
    borderTopColor: tokens.colorPaletteGreenForeground1,
    borderRightColor: tokens.colorPaletteGreenForeground1,
    borderBottomColor: tokens.colorPaletteGreenForeground1,
    borderLeftColor: tokens.colorPaletteGreenForeground1,
    backgroundColor: tokens.colorPaletteGreenBackground1,
  },
  optionCardPublic: {},
  optionCardPublicSelected: {
    borderTopColor: "#ffc83d",
    borderRightColor: "#ffc83d",
    borderBottomColor: "#ffc83d",
    borderLeftColor: "#ffc83d",
    backgroundColor: "#fff8e6",
  },
  optionCardNonPublic: {},
  optionCardNonPublicSelected: {
    borderTopColor: "#d13438",
    borderRightColor: "#d13438",
    borderBottomColor: "#d13438",
    borderLeftColor: "#d13438",
    backgroundColor: "#fde7e9",
  },
  optionIconWrapper: {
    width: "40px",
    height: "40px",
    borderRadius: "10px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    flexShrink: 0,
  },
  optionIconWrapperNone: {
    backgroundColor: tokens.colorPaletteGreenBackground1,
    color: tokens.colorPaletteGreenForeground1,
  },
  optionIconWrapperPublic: {
    backgroundColor: "#fff8e6",
    color: "#ffc83d",
  },
  optionIconWrapperNonPublic: {
    backgroundColor: "#fde7e9",
    color: "#d13438",
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

interface WallCrossBottomSheetProps {
  document: DocumentListResponse;
  open: boolean;
  onClose: () => void;
  onActionComplete?: () => void;
}

export const WallCrossBottomSheet: React.FC<WallCrossBottomSheetProps> = ({
  document,
  open,
  onClose,
  onActionComplete,
}) => {
  const styles = useStyles();
  const bottomSheetStyles = useBottomSheetStyles();
  const settings = useAppSelector((state) => state.setting);

  const accountName = settings.account?.AccountName || "";
  const srvrID = parseInt(settings.account?.SrvrID || "0", 10);
  const userID = parseInt(settings.account?.UserID?.toString() || "0", 10);
  const accountID = parseInt(settings.account?.AccountID || "0", 10);

  const [updateWallCross, { isLoading }] = useUpdateWallCrossStatusMutation();

  // Determine current status
  const currentStatus = useMemo(() => {
    if (!document.IsWallCrossed) return "none";
    return document.IsNonPublic
      ? WF_DECLARATION.NON_PUBLIC
      : WF_DECLARATION.PUBLIC;
  }, [document.IsWallCrossed, document.IsNonPublic]);

  const [selectedStatus, setSelectedStatus] = React.useState(currentStatus);

  React.useEffect(() => {
    setSelectedStatus(currentStatus);
  }, [currentStatus, open]);

  const handleUpdate = useCallback(async () => {
    try {
      await updateWallCross({
        AccountName: accountName,
        SrvrID: srvrID,
        DocID: document.DocID,
        UserID: userID,
        AccountID: accountID,
        WallCrossStatus: selectedStatus,
      }).unwrap();
      onClose();
      onActionComplete?.();
    } catch (error) {
      console.error("Wall-cross update failed:", error);
    }
  }, [
    updateWallCross,
    accountName,
    srvrID,
    document.DocID,
    userID,
    accountID,
    selectedStatus,
    onClose,
    onActionComplete,
  ]);

  return (
    <BottomSheet
      open={open}
      onClose={onClose}
      title="Wall-Cross Status"
      subtitle={document.DocName}
      icon={<ShieldLock24Regular />}
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
            onClick={handleUpdate}
            disabled={isLoading}
            className={bottomSheetStyles.footerButton}
          >
            {isLoading ? <Spinner size="tiny" /> : "Update Status"}
          </Button>
        </>
      }
    >
      <div className={styles.optionsContainer}>
        {/* Not Wall-Crossed */}
        <div
          className={`${styles.optionCard} ${styles.optionCardNone} ${selectedStatus === "none" ? styles.optionCardNoneSelected : ""}`}
          onClick={() => setSelectedStatus("none")}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setSelectedStatus("none");
            }
          }}
        >
          <div
            className={`${styles.optionIconWrapper} ${styles.optionIconWrapperNone}`}
          >
            <ShieldCheckmark24Regular />
          </div>
          <div className={styles.optionContent}>
            <div className={styles.optionTitle}>Not Wall-Crossed</div>
            <div className={styles.optionDescription}>
              This document does not contain wall-crossed information
            </div>
          </div>
          {selectedStatus === "none" && (
            <Checkmark20Filled className={styles.checkmark} />
          )}
        </div>

        {/* Public Wall-Cross */}
        <div
          className={`${styles.optionCard} ${styles.optionCardPublic} ${selectedStatus === WF_DECLARATION.PUBLIC ? styles.optionCardPublicSelected : ""}`}
          onClick={() => setSelectedStatus(WF_DECLARATION.PUBLIC)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setSelectedStatus(WF_DECLARATION.PUBLIC);
            }
          }}
        >
          <div
            className={`${styles.optionIconWrapper} ${styles.optionIconWrapperPublic}`}
          >
            <ShieldLock24Regular />
          </div>
          <div className={styles.optionContent}>
            <div className={styles.optionTitle}>Public Side</div>
            <div className={styles.optionDescription}>
              Contains public wall-crossed information
            </div>
          </div>
          {selectedStatus === WF_DECLARATION.PUBLIC && (
            <Checkmark20Filled className={styles.checkmark} />
          )}
        </div>

        {/* Non-Public Wall-Cross */}
        <div
          className={`${styles.optionCard} ${styles.optionCardNonPublic} ${selectedStatus === WF_DECLARATION.NON_PUBLIC ? styles.optionCardNonPublicSelected : ""}`}
          onClick={() => setSelectedStatus(WF_DECLARATION.NON_PUBLIC)}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              setSelectedStatus(WF_DECLARATION.NON_PUBLIC);
            }
          }}
        >
          <div
            className={`${styles.optionIconWrapper} ${styles.optionIconWrapperNonPublic}`}
          >
            <ShieldLock24Regular />
          </div>
          <div className={styles.optionContent}>
            <div className={styles.optionTitle}>Non-Public Side</div>
            <div className={styles.optionDescription}>
              Contains non-public wall-crossed information
            </div>
          </div>
          {selectedStatus === WF_DECLARATION.NON_PUBLIC && (
            <Checkmark20Filled className={styles.checkmark} />
          )}
        </div>
      </div>
    </BottomSheet>
  );
};
