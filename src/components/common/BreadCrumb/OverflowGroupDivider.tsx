import React from 'react';
import { useBreadcrumbStyles } from './styles';

export const OverflowGroupDivider: React.FC = () => {
  const styles = useBreadcrumbStyles();
  return <span className={styles.divider}>/</span>;
};
