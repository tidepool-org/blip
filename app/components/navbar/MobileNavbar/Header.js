import React from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

const Header = () => {
  const { t } = useTranslation();
  const { pathname } = useLocation();

  return (
    <>{t('Welcome')}</>
  );
};

export default Header;