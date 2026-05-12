import React, { useState } from 'react';
import {
  makeStyles,
  useId,
  Button,
  Popover,
  PopoverTrigger,
  PopoverSurface,
  ButtonProps,
  Divider,
  Checkbox,
  CheckboxOnChangeData,
  PopoverProps,
  mergeClasses,
  tokens,
} from '@fluentui/react-components';
import { Filter24Filled } from '@fluentui/react-icons';
import { AuthorMap } from '@/interfaces/UserQuery';

const useStyles = makeStyles({
  contentHeader: {
    marginTop: '0',
    marginBottom: '12px',
  },
  content: {
    padding: '0 12px',
  },
  author: {
    padding: '4px 8px',
    ':hover': {
      backgroundColor: tokens.colorNeutralBackground2,
    },
  },
  popoverOpen: {
    backgroundColor: tokens.colorNeutralBackground3,
  },
  button: {
    padding: '0 4px',
    minWidth: 'unset',
  },
  popoverWrapper: {
    padding: '10px 0px 0px',
    maxHeight: '80svh',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  },
  authorList: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: 1,
    overflowY: 'auto',
    minHeight: 0,
  },
  noData: {
    padding: '12px',
    fontSize: '14px',
    color: tokens.colorNeutralForeground3,
  },
});

type AuthorFilterPopoverProps = ButtonProps & {
  authors: string[];
  selectedAuthorMap: AuthorMap;
  onAuthorClick?: (
    event: React.ChangeEvent<HTMLInputElement>,
    data: CheckboxOnChangeData
  ) => void;
};

const AuthorFilterPopover: React.FC<AuthorFilterPopoverProps> = ({
  authors,
  selectedAuthorMap,
  onAuthorClick,
  className,
  ...props
}) => {
  const styles = useStyles();
  const id = useId();
  const [open, setOpen] = useState<boolean>(false);

  const handleOpenChange: PopoverProps['onOpenChange'] = (_, data) =>
    setOpen(data.open || false);

  return (
    <Popover
      open={open}
      onOpenChange={handleOpenChange}
      positioning="below-end"
      trapFocus
    >
      <PopoverTrigger disableButtonEnhancement>
        <Button
          {...props}
          className={mergeClasses(className, styles.button, open && styles.popoverOpen)}
          appearance="subtle"
        >
          <Filter24Filled />
        </Button>
      </PopoverTrigger>

      <PopoverSurface className={styles.popoverWrapper} aria-labelledby={id}>
        <h3 id={id} className={mergeClasses(styles.contentHeader, styles.content)}>
          Filter by Author
        </h3>
        <div className={styles.content}>
          <Divider />
        </div>
        <div className={styles.authorList}>
          {authors.length === 0 && (
            <div className={styles.noData}>No authors available</div>
          )}
          {authors.map((author) => (
            <Checkbox
              className={styles.author}
              key={author}
              checked={selectedAuthorMap[author] ?? true}
              onChange={onAuthorClick}
              label={author}
              value={author}
            />
          ))}
        </div>
      </PopoverSurface>
    </Popover>
  );
};

export default AuthorFilterPopover;
