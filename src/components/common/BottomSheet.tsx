import React, { useEffect, useRef } from 'react';
import {
  makeStyles,
  tokens,
  Text,
  Button,
  mergeClasses,
} from '@fluentui/react-components';
import { Dismiss24Regular } from '@fluentui/react-icons';

export const useBottomSheetStyles = makeStyles({
  footerButton: {
    flex: 1,
    minWidth: '100px',
  },
});

const useStyles = makeStyles({
  overlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    zIndex: 1000,
    opacity: 0,
    visibility: 'hidden',
    transition: 'opacity 0.3s ease, visibility 0.3s ease',
    pointerEvents: 'none',
  },
  overlayOpen: {
    opacity: 1,
    visibility: 'visible',
    pointerEvents: 'auto',
  },
  sheet: {
    position: 'fixed',
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: tokens.colorNeutralBackground1,
    borderTopLeftRadius: '16px',
    borderTopRightRadius: '16px',
    boxShadow: tokens.shadow64,
    transform: 'translateY(100%)',
    visibility: 'hidden',
    transition: 'transform 0.3s ease, visibility 0.3s ease',
    zIndex: 1001,
    display: 'flex',
    flexDirection: 'column',
    maxHeight: '85vh',
  },
  sheetOpen: {
    transform: 'translateY(0)',
    visibility: 'visible',
  },
  dragHandle: {
    width: '40px',
    height: '4px',
    backgroundColor: tokens.colorNeutralStroke2,
    borderRadius: '2px',
    margin: '8px auto',
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '4px 16px 12px 16px',
    borderBottom: `1px solid ${tokens.colorNeutralStroke2}`,
  },
  headerLeft: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    flex: 1,
    minWidth: 0,
  },
  headerIcon: {
    color: tokens.colorBrandForeground1,
    flexShrink: 0,
  },
  headerTextContainer: {
    minWidth: 0,
  },
  headerTitle: {
    fontSize: '16px',
    fontWeight: 600,
    lineHeight: '22px',
  },
  headerSubtitle: {
    fontSize: '12px',
    color: tokens.colorNeutralForeground3,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  content: {
    flex: 1,
    overflowY: 'auto',
    padding: '16px',
  },
  footer: {
    padding: '12px 16px',
    borderTop: `1px solid ${tokens.colorNeutralStroke2}`,
    display: 'flex',
    gap: '8px',
    justifyContent: 'flex-end',
  },
});

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  footer?: React.ReactNode;
  maxHeight?: string;
}

export const BottomSheet: React.FC<BottomSheetProps> = ({
  open,
  onClose,
  title,
  subtitle,
  icon,
  children,
  footer,
  maxHeight,
}) => {
  const styles = useStyles();
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && open) {
        onClose();
      }
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [open, onClose]);

  return (
    <>
      {/* Overlay */}
      <div
        className={mergeClasses(styles.overlay, open && styles.overlayOpen)}
        onClick={onClose}
      />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className={mergeClasses(styles.sheet, open && styles.sheetOpen)}
        style={maxHeight ? { maxHeight } : undefined}
      >
        {/* Drag Handle */}
        <div className={styles.dragHandle} />

        {/* Header */}
        <div className={styles.header}>
          <div className={styles.headerLeft}>
            {icon && <span className={styles.headerIcon}>{icon}</span>}
            <div className={styles.headerTextContainer}>
              <Text className={styles.headerTitle}>{title}</Text>
              {subtitle && (
                <div className={styles.headerSubtitle}>{subtitle}</div>
              )}
            </div>
          </div>
          <Button
            appearance="subtle"
            icon={<Dismiss24Regular />}
            onClick={onClose}
            size="small"
          />
        </div>

        {/* Content */}
        <div className={styles.content}>{children}</div>

        {/* Footer */}
        {footer && <div className={styles.footer}>{footer}</div>}
      </div>
    </>
  );
};
