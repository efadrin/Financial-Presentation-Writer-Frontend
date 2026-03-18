import React from 'react';
import {
  Dropdown,
  Option,
  Label,
  Spinner,
  makeStyles,
  tokens,
} from '@fluentui/react-components';
import type { DropdownProps } from '@fluentui/react-components';

export interface DropdownOption {
  key: string;
  text: string;
}

interface SimpleDropdownProps {
  label: string;
  placeholder?: string;
  options: DropdownOption[];
  selectedKey?: string;
  onSelect: (key: string) => void;
  isLoading?: boolean;
  disabled?: boolean;
  required?: boolean;
}

const useStyles = makeStyles({
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    marginBottom: '12px',
  },
  label: {
    fontWeight: tokens.fontWeightSemibold,
    fontSize: tokens.fontSizeBase200,
  },
  spinnerOverlay: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
});

export const SimpleDropdown: React.FC<SimpleDropdownProps> = ({
  label,
  placeholder,
  options,
  selectedKey,
  onSelect,
  isLoading = false,
  disabled = false,
  required = false,
}) => {
  const styles = useStyles();

  const selectedOption = options.find((o) => o.key === selectedKey);

  const handleOptionSelect: DropdownProps['onOptionSelect'] = (_, data) => {
    if (data.optionValue) {
      onSelect(data.optionValue);
    }
  };

  return (
    <div className={styles.wrapper}>
      <Label className={styles.label} required={required}>
        {label}
      </Label>
      {isLoading ? (
        <div className={styles.spinnerOverlay}>
          <Spinner size="tiny" />
          <span>Loading...</span>
        </div>
      ) : (
        <Dropdown
          placeholder={placeholder}
          value={selectedOption?.text ?? ''}
          selectedOptions={selectedKey ? [selectedKey] : []}
          onOptionSelect={handleOptionSelect}
          disabled={disabled || options.length === 0}
        >
          {options.map((option) => (
            <Option key={option.key} value={option.key}>
              {option.text}
            </Option>
          ))}
        </Dropdown>
      )}
    </div>
  );
};
