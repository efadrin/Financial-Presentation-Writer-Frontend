import React from 'react';
import { useTranslation } from 'react-i18next';

const Welcome: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div style={{ textAlign: 'center', padding: '20px' }}>
      <h1>{t('welcome')}</h1>
      <p>{t('loginWait')}</p>
    </div>
  );
};

export default Welcome;
