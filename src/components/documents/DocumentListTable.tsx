import React, { useMemo, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import {
  makeStyles,
  tokens,
  Body1,
  Tooltip,
  Text,
  Badge,
  Checkbox,
  mergeClasses,
} from "@fluentui/react-components";
import {
  Document20Regular,
  LockClosed16Regular,
  Flag16Filled,
  BuildingMultiple20Regular,
  ShieldLock16Filled,
} from "@fluentui/react-icons";
import { DocumentListResponse } from "@/interfaces/DocumentList";
import { formatDistanceToNow } from "date-fns";
import { WorkflowActionsPanel } from "./WorkflowActionsPanel";
import { useCompaniesWithImages } from "@/hooks/useEntityWithImages";
import { RootState } from "@/store";
import { getCurrentLanguageIdFromSettings } from "@/utils/languageUtils";
import { Common } from "@utils/constants";
import { COLOR_PALETTE } from "@utils/colorPalette";

const useStyles = makeStyles({
  container: {
    display: "flex",
    flexDirection: "column",
    height: "100%",
    minHeight: 0,
  },
  listContainer: {
    flex: 1,
    overflowY: "auto",
    overflowX: "hidden",
    minHeight: 0,
    maxHeight: "100%",
    "&::-webkit-scrollbar": {
      width: "6px",
    },
    "&::-webkit-scrollbar-track": {
      backgroundColor: "transparent",
    },
    "&::-webkit-scrollbar-thumb": {
      backgroundColor: tokens.colorNeutralStroke2,
      borderRadius: "3px",
    },
    "&::-webkit-scrollbar-thumb:hover": {
      backgroundColor: tokens.colorNeutralStroke1,
    },
  },
  listItem: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 12px",
    cursor: "pointer",
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    transition: "background-color 0.1s ease",
    "&:hover": {
      backgroundColor: tokens.colorNeutralBackground1Hover,
    },
    "&:last-child": {
      borderBottom: "none",
    },
  },
  companyImageContainer: {
    width: "50px",
    height: "24px",
    borderRadius: "4px",
    flexShrink: 0,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  companyImage: {
    maxWidth: "48px",
    maxHeight: "22px",
    width: "auto",
    height: "auto",
    objectFit: "contain" as const,
  },
  iconFallback: {
    color: COLOR_PALETTE.BLUE_DENIM,
  },
  docInfo: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    gap: "2px",
  },
  docName: {
    fontSize: "13px",
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground1,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  docMeta: {
    fontSize: "11px",
    color: tokens.colorNeutralForeground3,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  rightSection: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    flexShrink: 0,
  },
  lockIcon: {
    color: tokens.colorPaletteMarigoldForeground1,
    fontSize: "14px",
  },
  wallCrossPublicBadge: {
    fontSize: "10px",
    height: "20px",
    flexShrink: 0,
    backgroundColor: tokens.colorPaletteYellowBackground3,
    color: tokens.colorNeutralForeground1,
  },
  wallCrossNonPublicBadge: {
    fontSize: "10px",
    height: "20px",
    flexShrink: 0,
    backgroundColor: tokens.colorPaletteRedBackground3,
    color: tokens.colorNeutralForegroundOnBrand,
    fontWeight: tokens.fontWeightSemibold,
  },
  wallCrossIcon: {
    fontSize: "12px",
  },
  docNameContainer: {
    display: "flex",
    alignItems: "flex-start",
    gap: "4px",
  },
  commentCountBadge: {
    width: "18px",
    height: "18px",
    borderRadius: "50%",
    backgroundColor: tokens.colorPaletteRedBackground3,
    color: tokens.colorNeutralForegroundOnBrand,
    fontSize: "10px",
    fontWeight: tokens.fontWeightSemibold,
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    cursor: "pointer",
    flexShrink: 0,
    marginTop: "-2px",
    "&:hover": {
      backgroundColor: tokens.colorPaletteRedForeground1,
    },
  },
  priorityBadge: {
    fontSize: "10px",
    height: "18px",
    flexShrink: 0,
  },
  nonEfadrinBadge: {
    fontSize: "10px",
    height: "20px",
    flexShrink: 0,
    backgroundColor: tokens.colorNeutralBackground4,
    color: tokens.colorNeutralForeground2,
  },
  emptyState: {
    textAlign: "center" as const,
    padding: "40px 16px",
    color: tokens.colorNeutralForeground3,
  },
  emptyIcon: {
    fontSize: "40px",
    marginBottom: "12px",
    color: tokens.colorNeutralForeground3,
  },
  listHeader: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "8px 12px",
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground2,
  },
  selectAllCheckbox: {
    flexShrink: 0,
  },
  selectAllLabel: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground2,
  },
  checkboxCell: {
    flexShrink: 0,
    marginRight: "4px",
  },
  listItemSelected: {
    backgroundColor: tokens.colorNeutralBackground1Selected,
  },
  listItemWallCrossedPublic: {
    borderLeft: `3px solid ${tokens.colorPaletteYellowBackground3}`,
  },
  listItemWallCrossedNonPublic: {
    borderLeft: `3px solid ${tokens.colorPaletteRedBackground3}`,
    backgroundColor: tokens.colorPaletteRedBackground1,
  },
});

interface DocumentListTableProps {
  documents: DocumentListResponse[];
  searchTerm?: string;
  onActionComplete?: () => void;
  selectedIds?: Set<number>;
  onSelectionChange?: (docId: number, selected: boolean) => void;
  onSelectAll?: (selected: boolean) => void;
  onOpenCommentsSheet?: (document: DocumentListResponse) => void;
  onOpenWallCrossSheet?: (document: DocumentListResponse) => void;
}

export const DocumentListTable: React.FC<DocumentListTableProps> = ({
  documents,
  searchTerm = "",
  onActionComplete,
  selectedIds = new Set(),
  onSelectionChange,
  onSelectAll,
  onOpenCommentsSheet,
  onOpenWallCrossSheet,
}) => {
  const styles = useStyles();
  const settings = useSelector((state: RootState) => state.settings);
  const [openMenuId, setOpenMenuId] = useState<number | null>(null);
  const [imageErrors, setImageErrors] = useState<Set<string>>(new Set());
  const [commentsOpenDocId, setCommentsOpenDocId] = useState<number | null>(
    null,
  );
  const [wallCrossOpenDocId, setWallCrossOpenDocId] = useState<number | null>(
    null,
  );

  // Fetch company list to get company images
  const queryParams = useMemo(() => {
    const languageId = getCurrentLanguageIdFromSettings(settings);
    const { account } = settings;
    return {
      SrvrID: account?.SrvrID || "",
      AccountID: account?.AccountID || "",
      LanguageID: languageId,
      UserID: Number(account?.UserID || 0),
      AccountName: account?.AccountName || "",
    };
  }, [settings]);

  const shouldSkipQuery = useMemo(
    () => !settings.account?.AccountName || !settings.account?.SrvrID,
    [settings.account],
  );

  const { data: companiesData } = useCompaniesWithImages(queryParams, {
    skip: shouldSkipQuery,
  });

  // Build map for company name -> image lookup
  const companyImageByName = useMemo(() => {
    const byName = new Map<string, string>();
    if (companiesData?.Data && Array.isArray(companiesData.Data)) {
      companiesData.Data.forEach((company) => {
        if (company.companyImage && company.corpName) {
          byName.set(company.corpName.toLowerCase(), company.companyImage);
        }
      });
    }
    return byName;
  }, [companiesData]);

  const handleMenuOpenChange = useCallback((docId: number, open: boolean) => {
    setOpenMenuId(open ? docId : null);
  }, []);

  const handleImageError = useCallback((corpId: string) => {
    setImageErrors((prev) => new Set(prev).add(corpId));
  }, []);

  const getCompanyImageUrl = useCallback(
    (doc: DocumentListResponse): { url: string | null; key: string | null } => {
      if (!doc.DocName) return { url: null, key: null };

      const docNameLower = doc.DocName.toLowerCase();

      const entries = Array.from(companyImageByName.entries());
      for (let i = 0; i < entries.length; i++) {
        const [companyName, image] = entries[i];
        if (docNameLower.includes(companyName)) {
          if (!imageErrors.has(companyName)) {
            if (image.startsWith("data:") || image.startsWith("http")) {
              return { url: image, key: companyName };
            }
            return { url: `${Common.IMG_TYPE}${image}`, key: companyName };
          }
        }
      }

      return { url: null, key: null };
    },
    [companyImageByName, imageErrors],
  );

  const filteredDocuments = useMemo(() => {
    // Deduplicate documents by base name (without extension)
    const deduped = Array.from(
      documents
        .reduce((map, doc) => {
          const baseName = doc.DocName.replace(/\.[^/.]+$/, "").toLowerCase();
          if (!map.has(baseName)) {
            map.set(baseName, doc);
          }
          return map;
        }, new Map<string, DocumentListResponse>())
        .values(),
    );

    return deduped
      .filter((doc) => {
        const matchesSearch =
          !searchTerm ||
          doc.DocName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          doc.FullName.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesSearch;
      })
      .sort((a, b) => {
        const dateA = new Date(a.LastRefreshDate).getTime();
        const dateB = new Date(b.LastRefreshDate).getTime();
        return dateB - dateA;
      });
  }, [documents, searchTerm]);

  const allSelected = useMemo(() => {
    if (filteredDocuments.length === 0) return false;
    return filteredDocuments.every((doc) => selectedIds.has(doc.DocID));
  }, [filteredDocuments, selectedIds]);

  const someSelected = useMemo(() => {
    if (filteredDocuments.length === 0) return false;
    const selectedCount = filteredDocuments.filter((doc) =>
      selectedIds.has(doc.DocID),
    ).length;
    return selectedCount > 0 && selectedCount < filteredDocuments.length;
  }, [filteredDocuments, selectedIds]);

  const handleCheckboxChange = useCallback(
    (docId: number, checked: boolean) => {
      onSelectionChange?.(docId, checked);
    },
    [onSelectionChange],
  );

  const handleSelectAllChange = useCallback(
    (checked: boolean) => {
      onSelectAll?.(checked);
    },
    [onSelectAll],
  );

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return formatDistanceToNow(date, { addSuffix: true });
    } catch {
      return dateString;
    }
  };

  const renderCompanyImage = (doc: DocumentListResponse) => {
    const { url, key } = getCompanyImageUrl(doc);

    if (url) {
      return (
        <div className={styles.companyImageContainer}>
          <img
            src={url}
            alt="Company"
            className={styles.companyImage}
            onError={() => key && handleImageError(key)}
          />
        </div>
      );
    }

    return (
      <div className={styles.companyImageContainer}>
        <BuildingMultiple20Regular className={styles.iconFallback} />
      </div>
    );
  };

  if (documents.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <Document20Regular className={styles.emptyIcon} />
          <Body1>No documents in this category</Body1>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Header with Select All */}
      {filteredDocuments.length > 0 && onSelectAll && (
        <div className={styles.listHeader}>
          <Checkbox
            checked={allSelected ? true : someSelected ? "mixed" : false}
            onChange={(_, data) => handleSelectAllChange(!!data.checked)}
            className={styles.selectAllCheckbox}
          />
          <Text className={styles.selectAllLabel}>
            {selectedIds.size > 0
              ? `${selectedIds.size} selected`
              : `Select all (${filteredDocuments.length})`}
          </Text>
        </div>
      )}

      <div className={styles.listContainer}>
        {filteredDocuments.map((doc) => {
          const isSelected = selectedIds.has(doc.DocID);
          return (
            <WorkflowActionsPanel
              key={doc.DocID}
              document={doc}
              open={openMenuId === doc.DocID}
              onOpenChange={(open) => handleMenuOpenChange(doc.DocID, open)}
              onActionComplete={onActionComplete}
              commentsOpen={commentsOpenDocId === doc.DocID}
              onCommentsOpenChange={(open) =>
                setCommentsOpenDocId(open ? doc.DocID : null)
              }
              wallCrossOpen={wallCrossOpenDocId === doc.DocID}
              onWallCrossOpenChange={(open) =>
                setWallCrossOpenDocId(open ? doc.DocID : null)
              }
              onOpenCommentsSheet={onOpenCommentsSheet}
              onOpenWallCrossSheet={onOpenWallCrossSheet}
            >
              <div
                className={mergeClasses(
                  styles.listItem,
                  isSelected && styles.listItemSelected,
                  doc.IsWallCrossed &&
                    !doc.IsNonPublic &&
                    styles.listItemWallCrossedPublic,
                  doc.IsWallCrossed &&
                    doc.IsNonPublic &&
                    styles.listItemWallCrossedNonPublic,
                )}
              >
                {onSelectionChange && (
                  <Checkbox
                    checked={isSelected}
                    onChange={(ev, data) => {
                      ev.stopPropagation();
                      handleCheckboxChange(doc.DocID, !!data.checked);
                    }}
                    onClick={(ev) => ev.stopPropagation()}
                    className={styles.checkboxCell}
                  />
                )}
                {renderCompanyImage(doc)}
                <div className={styles.docInfo}>
                  <div className={styles.docNameContainer}>
                    <Text className={styles.docName} title={doc.DocName}>
                      {doc.DocName || "Untitled Document"}
                    </Text>
                    {doc.Comment != null && doc.Comment > 0 && (
                      <Tooltip
                        content={`${doc.Comment} comment${doc.Comment > 1 ? "s" : ""} - Click to view`}
                        relationship="label"
                      >
                        <span
                          className={styles.commentCountBadge}
                          onClick={(e) => {
                            e.stopPropagation();
                            if (onOpenCommentsSheet) {
                              onOpenCommentsSheet(doc);
                            } else {
                              setCommentsOpenDocId(doc.DocID);
                            }
                          }}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" || e.key === " ") {
                              e.stopPropagation();
                              if (onOpenCommentsSheet) {
                                onOpenCommentsSheet(doc);
                              } else {
                                setCommentsOpenDocId(doc.DocID);
                              }
                            }
                          }}
                        >
                          {doc.Comment > 99 ? "99+" : doc.Comment}
                        </span>
                      </Tooltip>
                    )}
                  </div>
                  <span className={styles.docMeta}>
                    {doc.FullName} · {formatDate(doc.LastRefreshDate)}
                  </span>
                </div>
                <div className={styles.rightSection}>
                  {!doc.EFADRINReport &&
                    (doc.StatusName === "Final" ||
                      doc.StatusName === "Finalised") && (
                      <Tooltip
                        content="This document was not created using FPW"
                        relationship="label"
                      >
                        <Badge
                          appearance="filled"
                          size="small"
                          className={styles.nonEfadrinBadge}
                        >
                          Non-FPW
                        </Badge>
                      </Tooltip>
                    )}
                  {doc.IsWallCrossed && (
                    <Tooltip
                      content={`${doc.IsNonPublic ? "Wall Crossed - Contains Non-Public Information" : "Wall Crossed - Public Information Only"} (Click to change)`}
                      relationship="label"
                    >
                      <Badge
                        appearance="filled"
                        size="small"
                        icon={
                          <ShieldLock16Filled
                            className={styles.wallCrossIcon}
                          />
                        }
                        className={
                          doc.IsNonPublic
                            ? styles.wallCrossNonPublicBadge
                            : styles.wallCrossPublicBadge
                        }
                        style={{ cursor: "pointer" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          if (onOpenWallCrossSheet) {
                            onOpenWallCrossSheet(doc);
                          } else {
                            setWallCrossOpenDocId(doc.DocID);
                          }
                        }}
                      >
                        {doc.IsNonPublic ? "Non-Public" : "Public"}
                      </Badge>
                    </Tooltip>
                  )}
                  {doc.PriorityName && doc.PriorityName !== "Normal" && (
                    <Badge
                      appearance="tint"
                      color={
                        doc.PriorityName === "1. High" ? "danger" : "warning"
                      }
                      size="small"
                      icon={<Flag16Filled />}
                      className={styles.priorityBadge}
                    >
                      {doc.PriorityName}
                    </Badge>
                  )}
                  {doc.LockingUser && (
                    <Tooltip
                      content={`Locked by ${doc.LockingUser}`}
                      relationship="label"
                    >
                      <LockClosed16Regular className={styles.lockIcon} />
                    </Tooltip>
                  )}
                </div>
              </div>
            </WorkflowActionsPanel>
          );
        })}
      </div>

      {filteredDocuments.length === 0 && documents.length > 0 && (
        <div className={styles.emptyState}>
          <Body1>No documents match your search</Body1>
        </div>
      )}
    </div>
  );
};
