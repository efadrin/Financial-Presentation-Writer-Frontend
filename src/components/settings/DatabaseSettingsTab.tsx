import React, { useEffect, useMemo, useState } from 'react';
import { makeStyles, tokens } from '@fluentui/react-components';
import { useTranslation } from 'react-i18next';
import { useAppDispatch, useAppSelector } from '@/store';
import {
  useGetFinancialDatabasesQuery,
  useGetAccountsQuery,
  AccountData,
} from '@/services/apiSlice';
import {
  setFinancialSource,
  setAccountData,
  FinancialSource,
  Account,
} from '@/services/settingSlice';
import {
  SimpleDropdown,
  DropdownOption,
} from '@/components/common/SimpleDropdown';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '12px 0',
  },
  sectionTitle: {
    fontSize: tokens.fontSizeBase300,
    fontWeight: tokens.fontWeightSemibold,
    color: tokens.colorNeutralForeground1,
    marginBottom: '4px',
  },
});

export const DatabaseSettingsTab: React.FC = () => {
  const styles = useStyles();
  const { t } = useTranslation();
  const dispatch = useAppDispatch();
  const settings = useAppSelector((state) => state.settings);

  const defaultFinancials: FinancialSource = {
    FinancialSourceID: '',
    FinancialSourceKey: '',
    FinancialSourceName: '',
  };

  const [localFinancialSource, setLocalFinancialSource] =
    useState<FinancialSource>(settings.financials ?? defaultFinancials);
  const [localAccount, setLocalAccount] = useState<Account | null>(
    settings.account ?? null
  );

  // Fetch financial databases
  const { data: financialDatabases, isLoading: isLoadingDatabases } =
    useGetFinancialDatabasesQuery();

  // Fetch accounts when a financial source is selected
  const { data: accounts, isFetching: isFetchingAccounts } =
    useGetAccountsQuery(
      {
        FinancialSourceID: localFinancialSource.FinancialSourceID,
        FinancialSourceKey: localFinancialSource.FinancialSourceKey,
      },
      { skip: !localFinancialSource.FinancialSourceID }
    );

  // Auto-select first financial source if none selected
  useEffect(() => {
    if (
      financialDatabases?.Data?.FinancialSources?.length &&
      !localFinancialSource.FinancialSourceID
    ) {
      const first = financialDatabases.Data.FinancialSources[0];
      const source: FinancialSource = {
        FinancialSourceID: first.FinancialSourceID,
        FinancialSourceKey: first.FinancialSourceKey,
        FinancialSourceName: first.FinancialSourceName,
      };
      setLocalFinancialSource(source);
      dispatch(setFinancialSource(source));
    }
  }, [financialDatabases, localFinancialSource.FinancialSourceID, dispatch]);

  // Build dropdown options for financial sources
  const financialSourceOptions: DropdownOption[] = useMemo(() => {
    if (!financialDatabases?.Data?.FinancialSources) return [];
    return financialDatabases.Data.FinancialSources.map((fs) => ({
      key: fs.FinancialSourceID,
      text: fs.FinancialSourceName,
    }));
  }, [financialDatabases]);

  // Build dropdown options for accounts
  const accountOptions: DropdownOption[] = useMemo(() => {
    if (!accounts || !Array.isArray(accounts)) return [];
    return accounts.map((acc: AccountData) => ({
      key: acc.AccountID,
      text: acc.AccountName,
    }));
  }, [accounts]);

  const handleFinancialSourceChange = (key: string) => {
    const selected = financialDatabases?.Data?.FinancialSources?.find(
      (fs) => fs.FinancialSourceID === key
    );
    if (selected) {
      const source: FinancialSource = {
        FinancialSourceID: selected.FinancialSourceID,
        FinancialSourceKey: selected.FinancialSourceKey,
        FinancialSourceName: selected.FinancialSourceName,
      };
      setLocalFinancialSource(source);
      dispatch(setFinancialSource(source));
      // Reset account when financial source changes
      setLocalAccount(null);
      dispatch(setAccountData(null));
    }
  };

  const handleAccountChange = (key: string) => {
    const selected = accounts?.find(
      (acc: AccountData) => acc.AccountID === key
    );
    if (selected) {
      const account: Account = {
        AccountID: selected.AccountID,
        AccountName: selected.AccountName,
        SrvrID: selected.SrvrID,
        UserID: selected.UserID,
        FullName: selected.FullName,
        ServerIPAddress: selected.ServerIPAddress,
      };
      setLocalAccount(account);
      dispatch(setAccountData(account));
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.sectionTitle}>
        {t('settingsPane.database', 'Database')}
      </div>

      <SimpleDropdown
        label={t(
          'settingsPane.selectFinancialDatabase',
          'Financial Database'
        )}
        placeholder={t(
          'settingsPane.chooseDatabase',
          'Choose database'
        )}
        options={financialSourceOptions}
        selectedKey={localFinancialSource.FinancialSourceID || undefined}
        onSelect={handleFinancialSourceChange}
        isLoading={isLoadingDatabases}
        required
      />

      <SimpleDropdown
        label={t('account', 'Account')}
        placeholder={t('selectAccount', 'Select an account ...')}
        options={accountOptions}
        selectedKey={localAccount?.AccountID || undefined}
        onSelect={handleAccountChange}
        isLoading={isFetchingAccounts}
        disabled={!localFinancialSource.FinancialSourceID}
        required
      />
    </div>
  );
};
