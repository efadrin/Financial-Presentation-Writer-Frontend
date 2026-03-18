import React from 'react';
import { makeStyles, tokens, Spinner } from '@fluentui/react-components';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    gap: '12px',
    padding: '20px',
  },
  text: {
    color: tokens.colorNeutralForeground3,
    fontSize: '13px',
  },
});

interface LoadingFallbackProps {
  message?: string;
}

const LoadingFallback: React.FC<LoadingFallbackProps> = ({ message = 'Loading...' }) => {
  const styles = useStyles();

  return (
    <div className={styles.container}>
      <Spinner size="small" />
      <span className={styles.text}>{message}</span>
    </div>
  );
};

export default LoadingFallback;
