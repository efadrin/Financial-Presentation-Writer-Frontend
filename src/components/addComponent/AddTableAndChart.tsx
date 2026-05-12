import React, { useEffect, useState } from 'react';
import {
  makeStyles,
  tokens,
  Combobox,
  Option,
  SearchBox,
  Button,
  Spinner,
  Checkbox,
  Dropdown,
  Field,
  Label,
  Badge,
  Divider,
} from '@fluentui/react-components';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '@/store';
import useUserQuery from '@/hooks/useUserQuery';
import useLoadingProgress from '@/hooks/useLoadingProgress';
import { useGetCompaniesbyUserQuery } from '@/services/apiSlice';
import { setDefaultCorp, unlockQuery, markQueryInserted } from '@/store/presentationInsertSlice';
import { getCurrentLanguageIdFromSettings } from '@/utils/languageUtils';
import scanPresentationShapes from '@/features/scanPresentationShapes';
import insertChartToPresentation, { ChartType } from '@/features/insertChartToPresentation';
import insertTableToPresentation from '@/features/insertTableToPresentation';
import { setNamedChartShapes, setNamedTableShapes, setFilledShapes } from '@/store/presentationInsertSlice';
import { AddTableChartItem } from '@/interfaces/UserQuery';

/** Strip XML wrapper from Description fields like <Options><Description>text</Description>...</Options> */
function parseDescription(raw: string | undefined): string {
  if (!raw) return '';
  const match = /<Description>([\s\S]*?)<\/Description>/i.exec(raw);
  if (match) return match[1].trim();
  // Starts with '<' but has no Description tag — discard XML
  if (raw.trimStart().startsWith('<')) return '';
  return raw;
}

const useStyles = makeStyles({
  root: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
    padding: `${tokens.spacingVerticalM} ${tokens.spacingHorizontalM}`,
    height: '100%',
    overflowY: 'auto',
    backgroundColor: tokens.colorNeutralBackground1,
    color: tokens.colorNeutralForeground1,
  },
  sectionLabel: {
    fontSize: tokens.fontSizeBase200,
    color: tokens.colorNeutralForeground3,
    fontWeight: tokens.fontWeightSemibold,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  },
  toolbar: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: tokens.spacingHorizontalS,
  },
  itemRow: {
    flexShrink: 0,
    display: 'flex',
    flexDirection: 'column',
    borderRadius: tokens.borderRadiusMedium,
    border: `1px solid ${tokens.colorNeutralStroke2}`,
    backgroundColor: tokens.colorNeutralBackground1,
    color: tokens.colorNeutralForeground1,
    marginBottom: tokens.spacingVerticalXS,
    overflow: 'hidden',
  },
  itemHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    cursor: 'pointer',
    color: tokens.colorNeutralForeground1,
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground3,
    },
  },
  itemDetails: {
    display: 'flex',
    flexDirection: 'column',
    gap: tokens.spacingVerticalS,
    padding: `${tokens.spacingVerticalS} ${tokens.spacingHorizontalM}`,
    backgroundColor: tokens.colorNeutralBackground2,
  },
  detailRow: {
    display: 'flex',
    alignItems: 'center',
    gap: tokens.spacingHorizontalS,
    flexWrap: 'wrap',
  },
  insertButton: {
    marginLeft: 'auto',
  },
  unavailableBadge: {
    opacity: 0.5,
  },
  noItems: {
    textAlign: 'center',
    color: tokens.colorNeutralForeground3,
    padding: tokens.spacingVerticalL,
  },
  errorBanner: {
    color: tokens.colorPaletteRedForeground1,
    backgroundColor: tokens.colorPaletteRedBackground1,
    borderRadius: tokens.borderRadiusMedium,
    padding: `${tokens.spacingVerticalXS} ${tokens.spacingHorizontalM}`,
    fontSize: tokens.fontSizeBase200,
  },
  progressBar: {
    height: '2px',
    backgroundColor: tokens.colorNeutralBackground3,
    borderRadius: tokens.borderRadiusCircular,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: tokens.colorBrandForeground1,
    transition: 'width 0.15s ease-in-out',
  },
});

const CHART_TYPES: ChartType[] = ['Bar', 'Line', 'Pie', 'Area', 'Column'];
const INSERT_AT_CURSOR = 'Cursor';

interface ExpandedItem {
  corpID: string;
  chartType: ChartType;
  logScale: boolean;
  insertAt: string;
  isInserting: boolean;
}

interface Props {
  type: 'table' | 'chart';
}

const AddTableAndChart: React.FC<Props> = ({ type }) => {
  const isChartMode = type === 'chart';
  const styles = useStyles();
  const dispatch = useDispatch();
  const account = useSelector((state: RootState) => state.settings.account);
  const settings = useSelector((state: RootState) => state.settings);
  const namedChartShapes = useSelector((s: RootState) => s.presentationInsert.namedChartShapes);
  const namedTableShapes = useSelector((s: RootState) => s.presentationInsert.namedTableShapes);
  const lockedQueries = useSelector((s: RootState) => s.presentationInsert.lockedQueries);

  const namedShapes = isChartMode ? namedChartShapes : namedTableShapes;

  const {
    isFetching,
    itemsToRender,
    searchQuery,
    setSearchQuery,
    unavailableCount,
    showUnavailable,
    setShowUnavailable,
    isNonCorporate,
    defaultCorpName,
    effectiveCorpID,
    effectiveModel,
    wordID,
    devDataFlags,
  } = useUserQuery(isChartMode);

  const { progress } = useLoadingProgress(isFetching);

  const languageId = getCurrentLanguageIdFromSettings(settings.selectedLanguage);
  const hasAccount = !!(account?.AccountID && account?.AccountName && account?.SrvrID && account?.UserID);

  // Companies for the non-corporate default picker
  const { data: companiesResponse } = useGetCompaniesbyUserQuery(
    {
      SrvrID: account?.SrvrID || '',
      AccountID: account?.AccountID || '',
      LanguageID: languageId,
      UserID: account?.UserID ? parseInt(account.UserID) : 0,
      AccountName: account?.AccountName || '',
    },
    { skip: !hasAccount || !isNonCorporate }
  );

  const companies = companiesResponse?.Data ?? [];

  // Scan shapes on mount
  useEffect(() => {
    if (!hasAccount) return;
    scanPresentationShapes()
      .then(({ chartShapes, tableShapes, filledShapes }) => {
        dispatch(setNamedChartShapes(chartShapes));
        dispatch(setNamedTableShapes(tableShapes));
        dispatch(setFilledShapes(filledShapes));
      })
      .catch(() => {/* non-fatal */});
  }, [dispatch, hasAccount]);

  // Per-item expanded state
  const [expandedItems, setExpandedItems] = useState<Record<string, ExpandedItem>>({});

  const toggleExpand = (queryName: string, corpID: string) => {
    setExpandedItems((prev) => {
      if (prev[queryName]) {
        const { [queryName]: _, ...rest } = prev;
        return rest;
      }
      return {
        ...prev,
        [queryName]: {
          corpID,
          chartType: 'Bar',
          logScale: false,
          insertAt: namedShapes[0] ?? INSERT_AT_CURSOR,
          isInserting: false,
        },
      };
    });
  };

  const updateItem = (queryName: string, patch: Partial<ExpandedItem>) => {
    setExpandedItems((prev) => ({
      ...prev,
      [queryName]: { ...prev[queryName], ...patch },
    }));
  };

  const handleInsert = async (item: AddTableChartItem) => {
    const expanded = expandedItems[item.QueryName];
    if (!expanded || !account) return;

    updateItem(item.QueryName, { isInserting: true });
    dispatch(unlockQuery(item.QueryName));

    const commonOpts = {
      insertAt: expanded.insertAt,
      queryName: item.QueryName,
      accountName: account.AccountName,
      accountID: account.AccountID,
      corpIDs: expanded.corpID || effectiveCorpID || '',
      srvrID: account.SrvrID,
      languageID: languageId,
      userID: account.UserID,
      firmID: settings.userInfo?.FirmID ? parseInt(settings.userInfo.FirmID) : undefined,
      wordID,
      devDataFlags,
    };

    console.group(`[Insert] ${isChartMode ? 'Chart' : 'Table'}: ${item.QueryName}`);
    console.log('QueryName:', item.QueryName);
    console.log('TableHeader:', item.TableHeader);
    console.log('insertAt:', expanded.insertAt);
    console.log('corpIDs:', commonOpts.corpIDs);
    console.log('accountName:', commonOpts.accountName);
    console.log('accountID:', commonOpts.accountID);
    console.log('srvrID:', commonOpts.srvrID);
    console.log('languageID:', commonOpts.languageID);
    if (isChartMode) {
      console.log('chartType:', expanded.chartType);
      console.log('logScale:', expanded.logScale);
    }

    try {
      if (isChartMode) {
        await insertChartToPresentation({
          ...commonOpts,
          chartType: expanded.chartType,
          logScale: expanded.logScale,
        });
      } else {
        await insertTableToPresentation(commonOpts);
      }
      console.log('✓ Insert succeeded');
      dispatch(markQueryInserted(item.QueryName));
    } catch (e) {
      console.error('✗ Insert failed:', e);
      // error already locked in Redux by the feature function
    } finally {
      console.groupEnd();
      updateItem(item.QueryName, { isInserting: false });
    }
  };

  const insertAtOptions = [INSERT_AT_CURSOR, ...namedShapes];

  return (
    <div className={styles.root}>
      {/* Default corp picker — non-corporate mode only */}
      {isNonCorporate && (
        <Field label="Default Company">
          <Combobox
            placeholder="Select a company…"
            value={defaultCorpName ?? ''}
            onOptionSelect={(_, d) => {
              const company = companies.find((c) => c.corpId.toString() === d.optionValue);
              if (company) {
                dispatch(
                  setDefaultCorp({
                    corpID: company.corpId.toString(),
                    corpName: company.corpName,
                    corpModel: company.model || '',
                  })
                );
              }
            }}
          >
            {companies.slice(0, 80).map((c) => (
              <Option key={c.corpId} value={c.corpId.toString()}>
                {c.corpName}
              </Option>
            ))}
          </Combobox>
        </Field>
      )}

      {/* Search */}
      <SearchBox
        placeholder={isChartMode ? 'Search charts…' : 'Search tables…'}
        value={searchQuery}
        onChange={(_, d) => setSearchQuery(d.value ?? '')}
        style={{ width: '100%' }}
      />

      {/* Progress bar */}
      <div className={styles.progressBar}>
        <div className={styles.progressFill} style={{ width: `${progress}%` }} />
      </div>

      {/* Toolbar */}
      <div className={styles.toolbar}>
        <span className={styles.sectionLabel}>
          {itemsToRender.length} {isChartMode ? 'charts' : 'tables'}
        </span>
        {unavailableCount > 0 && (
          <Button
            appearance="subtle"
            size="small"
            onClick={() => setShowUnavailable((v) => !v)}
          >
            {showUnavailable ? 'Hide' : 'Show'} unavailable ({unavailableCount})
          </Button>
        )}
      </div>

      <Divider />

      {/* Items */}
      {itemsToRender.length === 0 && !isFetching && (
        <div className={styles.noItems}>
          {isFetching ? <Spinner size="small" /> : 'No items found.'}
        </div>
      )}

      {itemsToRender.map((item) => {
        const isExpanded = !!expandedItems[item.QueryName];
        const expanded = expandedItems[item.QueryName];
        const lock = lockedQueries[item.QueryName];
        const isUnavailable = item.HasData === false;

        return (
          <div key={item.QueryName} className={styles.itemRow}>
            <div
              className={styles.itemHeader}
              onClick={() => toggleExpand(item.QueryName, effectiveCorpID ?? '')}
            >
              <div style={{ flex: 1, minWidth: 0 }}>
                <span className={isUnavailable ? styles.unavailableBadge : undefined}>
                  {item.TableHeader || item.QueryName}
                </span>
                {parseDescription(item.Description) && (
                  <div style={{
                    fontSize: tokens.fontSizeBase100,
                    color: tokens.colorNeutralForeground3,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}>
                    {parseDescription(item.Description)}
                  </div>
                )}
              </div>
              {item.Added && (
                <Badge appearance="filled" color="success" size="small">
                  Added
                </Badge>
              )}
              {isUnavailable && (
                <Badge appearance="outline" color="warning" size="small">
                  No data
                </Badge>
              )}
            </div>

            {isExpanded && expanded && (
              <div className={styles.itemDetails}>
                {lock && (
                  <div className={styles.errorBanner}>
                    Error: {lock.message}
                  </div>
                )}

                <div className={styles.detailRow}>
                  {/* Corp override for non-corporate */}
                  {isNonCorporate && (
                    <Field label="Company" style={{ minWidth: 140 }}>
                      <Combobox
                        size="small"
                        value={
                          companies.find((c) => c.corpId.toString() === expanded.corpID)?.corpName ?? ''
                        }
                        onOptionSelect={(_, d) => {
                          updateItem(item.QueryName, { corpID: d.optionValue ?? '' });
                        }}
                      >
                        {companies.slice(0, 80).map((c) => (
                          <Option key={c.corpId} value={c.corpId.toString()}>
                            {c.corpName}
                          </Option>
                        ))}
                      </Combobox>
                    </Field>
                  )}

                  {/* Chart type */}
                  {isChartMode && (
                    <Field label="Chart type" style={{ minWidth: 100 }}>
                      <Dropdown
                        size="small"
                        value={expanded.chartType}
                        selectedOptions={[expanded.chartType]}
                        onOptionSelect={(_, d) =>
                          updateItem(item.QueryName, { chartType: (d.optionValue as ChartType) ?? 'Bar' })
                        }
                      >
                        {CHART_TYPES.map((ct) => (
                          <Option key={ct} value={ct}>
                            {ct}
                          </Option>
                        ))}
                      </Dropdown>
                    </Field>
                  )}

                  {/* Log scale */}
                  {isChartMode && (
                    <Checkbox
                      label="Log scale"
                      checked={expanded.logScale}
                      onChange={(_, d) => updateItem(item.QueryName, { logScale: !!d.checked })}
                    />
                  )}
                </div>

                <div className={styles.detailRow}>
                  {/* Insert at */}
                  <Field label="Insert at" style={{ minWidth: 130 }}>
                    <Dropdown
                      size="small"
                      value={expanded.insertAt}
                      selectedOptions={[expanded.insertAt]}
                      onOptionSelect={(_, d) =>
                        updateItem(item.QueryName, { insertAt: d.optionValue ?? INSERT_AT_CURSOR })
                      }
                    >
                      {insertAtOptions.map((opt) => (
                        <Option key={opt} value={opt}>
                          {opt}
                        </Option>
                      ))}
                    </Dropdown>
                  </Field>

                  {/* Insert button */}
                  <Button
                    className={styles.insertButton}
                    appearance="primary"
                    size="small"
                    disabled={expanded.isInserting}
                    icon={expanded.isInserting ? <Spinner size="tiny" /> : undefined}
                    onClick={() => handleInsert(item)}
                  >
                    {expanded.isInserting ? 'Inserting…' : 'Insert'}
                  </Button>
                </div>

                <Label size="small" style={{ color: tokens.colorNeutralForeground3 }}>
                  {item.QueryName}
                </Label>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default AddTableAndChart;
