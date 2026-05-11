import { useState, useMemo, useEffect } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/store';
import { AddTableChartItem } from '@/interfaces/UserQuery';
import { useGetAvailableUserQueriesQuery } from '@/services/apiSlice';

/** Strip XML from Description fields like <Options><Description>text</Description>...</Options> */
function stripXmlDescription(raw: string | undefined): string {
  if (!raw) return '';
  const match = /<Description>([\s\S]*?)<\/Description>/i.exec(raw);
  if (match) return match[1].trim();
  if (raw.trimStart().startsWith('<')) return '';
  return raw;
}

/** Parse a named custom property from PPTX /docProps/custom.xml. */
function parseCustomPropertyValue(xml: string, name: string): string | null {
  // <vt:lpwstr> or <vt:i4>
  const re = new RegExp(
    `<[^>]*fmtid[^>]*>\\s*<[^/][^>]*name=["']${name}["'][^>]*>\\s*<vt:[a-z4]+>([^<]*)</vt:`,
    'i'
  );
  const m = re.exec(xml);
  if (m) return m[1].trim();

  // Flat format: <vt:lpwstr>VALUE</vt:lpwstr> after the property name
  const idx = xml.indexOf(`name="${name}"`);
  if (idx === -1) {
    const idx2 = xml.indexOf(`name='${name}'`);
    if (idx2 === -1) return null;
    const substr = xml.slice(idx2);
    const m2 = /<vt:[a-z4]+>([^<]*)<\/vt:/.exec(substr);
    return m2 ? m2[1].trim() : null;
  }
  const substr = xml.slice(idx);
  const m2 = /<vt:[a-z4]+>([^<]*)<\/vt:/.exec(substr);
  return m2 ? m2[1].trim() : null;
}

const useUserQuery = (isChartMode: boolean) => {
  const account = useSelector((state: RootState) => state.settings.account);
  const customPropertiesXml = useSelector(
    (state: RootState) => state.openedDocument.customPropertiesXml
  );
  const defaultCorpID = useSelector(
    (state: RootState) => state.presentationInsert.defaultCorpID
  );
  const defaultCorpName = useSelector(
    (state: RootState) => state.presentationInsert.defaultCorpName
  );
  const defaultCorpModel = useSelector(
    (state: RootState) => state.presentationInsert.defaultCorpModel
  );

  const insertedQueryNames = useSelector(
    (state: RootState) => state.presentationInsert.insertedQueryNames
  );
  const [searchQuery, setSearchQuery] = useState('');
  const [showUnavailable, setShowUnavailable] = useState(false);

  const corpIdFromXml = useMemo(() => {
    if (!customPropertiesXml) return null;
    return parseCustomPropertyValue(customPropertiesXml, 'EFACorpID');
  }, [customPropertiesXml]);

  const modelFromXml = useMemo(() => {
    if (!customPropertiesXml) return null;
    return parseCustomPropertyValue(customPropertiesXml, 'EFAModel');
  }, [customPropertiesXml]);

  const isNonCorporate = !corpIdFromXml || corpIdFromXml === '-1';

  const effectiveCorpID = isNonCorporate
    ? (defaultCorpID ?? null)
    : corpIdFromXml;

  const effectiveModel = isNonCorporate
    ? (defaultCorpModel ?? '')
    : (modelFromXml ?? '');

  const accountName = account?.AccountName ?? null;
  const accountID = account?.AccountID;
  const srvrID = account?.SrvrID;

  const shouldSkip =
    !accountName ||
    !accountID ||
    (!corpIdFromXml && !isNonCorporate) ||
    (isNonCorporate && !defaultCorpID);

  // --- Log 1: API request params and skip decision ---
  useEffect(() => {
    console.group(`[useUserQuery] ${isChartMode ? 'Charts' : 'Tables'} — API params`);
    console.log('accountName:', accountName);
    console.log('accountID:', accountID);
    console.log('srvrID:', srvrID);
    console.log('corpIdFromXml:', corpIdFromXml);
    console.log('modelFromXml:', modelFromXml);
    console.log('isNonCorporate:', isNonCorporate);
    console.log('defaultCorpID:', defaultCorpID);
    console.log('effectiveCorpID:', effectiveCorpID);
    console.log('effectiveModel:', effectiveModel);
    console.log('skip:', shouldSkip);
    console.groupEnd();
  }, [accountName, accountID, srvrID, corpIdFromXml, modelFromXml, isNonCorporate, defaultCorpID, effectiveCorpID, effectiveModel, shouldSkip, isChartMode]);

  const {
    data: rawItems = [],
    isFetching,
  } = useGetAvailableUserQueriesQuery(
    {
      AccountName: accountName ?? undefined,
      AccountID: accountID,
      SrvrID: srvrID,
      Model: effectiveModel,
      CorpIDs: effectiveCorpID ?? '',
      UseDevData: false,
    },
    { skip: shouldSkip }
  );

  // --- Log 2: Raw API response ---
  useEffect(() => {
    if (isFetching) {
      console.log(`[useUserQuery] ${isChartMode ? 'Charts' : 'Tables'} — fetching...`);
    } else {
      console.group(`[useUserQuery] ${isChartMode ? 'Charts' : 'Tables'} — raw API response`);
      console.log('total items:', rawItems.length);
      console.log('charts in response:', rawItems.filter((i) => i.IsChart).length);
      console.log('tables in response:', rawItems.filter((i) => !i.IsChart).length);
      console.log('IsChart sample values:', rawItems.slice(0, 5).map((i) => ({ QueryName: i.QueryName, IsChart: i.IsChart, type: typeof i.IsChart })));
      console.table(rawItems.map((i) => ({ QueryName: i.QueryName, TableHeader: i.TableHeader, IsChart: i.IsChart, HasData: i.HasData })));
      console.groupEnd();
    }
  }, [rawItems, isFetching, isChartMode]);

  const queryTypeItems = useMemo(
    () => rawItems.filter((item) => !!item.IsChart === isChartMode),
    [rawItems, isChartMode]
  );

  // --- Log 3: After IsChart type filter ---
  useEffect(() => {
    console.group(`[useUserQuery] ${isChartMode ? 'Charts' : 'Tables'} — after type filter`);
    console.log(`${isChartMode ? 'IsChart=true' : 'IsChart=false'} items:`, queryTypeItems.length);
    console.table(queryTypeItems.map((i) => ({ QueryName: i.QueryName, TableHeader: i.TableHeader, HasData: i.HasData })));
    console.groupEnd();
  }, [queryTypeItems, isChartMode]);

  const itemsWithAdded: AddTableChartItem[] = useMemo(
    () =>
      queryTypeItems.map((item) => ({
        ...item,
        Added: insertedQueryNames.includes(item.QueryName),
      })),
    [queryTypeItems, insertedQueryNames]
  );

  // --- Log 4: After Added mapping ---
  useEffect(() => {
    const addedItems = itemsWithAdded.filter((i) => i.Added);
    console.group(`[useUserQuery] ${isChartMode ? 'Charts' : 'Tables'} — after Added mapping`);
    console.log('insertedQueryNames tracked:', insertedQueryNames);
    console.log('items marked Added:', addedItems.length);
    if (addedItems.length) console.table(addedItems.map((i) => ({ QueryName: i.QueryName, TableHeader: i.TableHeader })));
    console.groupEnd();
  }, [itemsWithAdded, insertedQueryNames, isChartMode]);

  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return itemsWithAdded
      .filter((item) => {
        if (!showUnavailable && item.HasData === false) return false;
        if (!q) return true;
        // Strip XML from Description before matching
        const descText = stripXmlDescription(item.Description);
        return (
          item.QueryName.toLowerCase().includes(q) ||
          (item.TableHeader ?? '').toLowerCase().includes(q) ||
          descText.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        // Available before unavailable
        const hasDataDiff = Number(b.HasData !== false) - Number(a.HasData !== false);
        if (hasDataDiff !== 0) return hasDataDiff;
        // Recently added first
        const addedDiff = Number(b.Added) - Number(a.Added);
        if (addedDiff !== 0) return addedDiff;
        // Alphabetical by TableHeader
        return (a.TableHeader ?? a.QueryName).localeCompare(b.TableHeader ?? b.QueryName);
      });
  }, [itemsWithAdded, searchQuery, showUnavailable]);

  // --- Log 5: Final list after search filter and sort ---
  useEffect(() => {
    console.group(`[useUserQuery] ${isChartMode ? 'Charts' : 'Tables'} — final rendered list (${filteredItems.length} items)`);
    console.log('searchQuery:', searchQuery || '(none)');
    console.log('showUnavailable:', showUnavailable);
    console.table(filteredItems.map((i, idx) => ({
      '#': idx + 1,
      QueryName: i.QueryName,
      TableHeader: i.TableHeader,
      HasData: i.HasData,
      Added: i.Added,
      Description: stripXmlDescription(i.Description).slice(0, 60) || '(none)',
    })));
    console.groupEnd();
  }, [filteredItems, searchQuery, showUnavailable, isChartMode]);

  const unavailableCount = useMemo(
    () => queryTypeItems.filter((i) => i.HasData === false).length,
    [queryTypeItems]
  );

  return {
    isChartMode,
    isFetching,
    itemsToRender: filteredItems,
    searchQuery,
    setSearchQuery,
    unavailableCount,
    showUnavailable,
    setShowUnavailable,
    isNonCorporate,
    defaultCorpID,
    defaultCorpName,
    effectiveCorpID,
    effectiveModel,
  };
};

export default useUserQuery;
