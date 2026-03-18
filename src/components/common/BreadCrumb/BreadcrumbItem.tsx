import React from 'react';
import { Button, makeStyles, tokens } from '@fluentui/react-components';
import { Item } from './types';

const useStyles = makeStyles({
  button: {
    minWidth: 'auto',
    padding: '2px 8px',
    fontSize: '13px',
    fontWeight: 400,
    color: tokens.colorNeutralForeground2,
    ':hover': {
      color: tokens.colorBrandForeground1,
    },
  },
  current: {
    fontWeight: 600,
    color: tokens.colorNeutralForeground1,
    cursor: 'default',
  },
});

interface BreadcrumbItemProps {
  item: Item;
  isCurrent: boolean;
}

export const BreadcrumbItem: React.FC<BreadcrumbItemProps> = ({
  item,
  isCurrent,
}) => {
  const styles = useStyles();

  if (isCurrent) {
    return (
      <span className={`${styles.button} ${styles.current}`}>
        {item.text}
      </span>
    );
  }

  return (
    <Button
      appearance="subtle"
      size="small"
      className={styles.button}
      onClick={item.onClick}
    >
      {item.text}
    </Button>
  );
};
