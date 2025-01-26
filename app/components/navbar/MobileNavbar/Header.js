import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getFinalSlug } from '../../../core/navutils';

const TITLE_STATE = {
  PRIVATE_WORKSPACE: 'PRIVATE_WORKSPACE',
  ACCOUNT_SETTINGS: 'ACCOUNT_SETTINGS',
  WELCOME: 'WELCOME', // TODO: make exception for welcome
  DEVICES: 'DEVICES',
  SUMMARY_STATS: 'SUMMARY_STATS',
  SHARE: 'SHARE',
  DEFAULT: 'DEFAULT',
};

const getTitleState = (pathname, chartType) => {
  const finalSlug = getFinalSlug(pathname);

  if (finalSlug === '/profile') return TITLE_STATE.ACCOUNT_SETTINGS;
  if (finalSlug === '/patients') return TITLE_STATE.PRIVATE_WORKSPACE;
  if (finalSlug === '/share') return TITLE_STATE.SHARE;

  if (finalSlug === '/data' && chartType === 'settings') return TITLE_STATE.DEVICES;
  if (finalSlug === '/data') return TITLE_STATE.SUMMARY_STATS;

  return TITLE_STATE.DEFAULT;
};

const Header = () => {
  const { t } = useTranslation();

  const { pathname } = useLocation();
  const navbarChartTypeForTitle = useSelector(state => state.blip.navbarChartTypeForTitle);

  const titleState = getTitleState(pathname, navbarChartTypeForTitle);

  switch(titleState) {
    case TITLE_STATE.PRIVATE_WORKSPACE:
      return 'Private Workspace';
    case TITLE_STATE.ACCOUNT_SETTINGS:
      return 'Account Settings';
    // case TITLE_STATE.WELCOME:
    //   return 'Welcome';
    case TITLE_STATE.DEVICES:
      return 'Devices';
    case TITLE_STATE.SUMMARY_STATS:
      return 'Summary Stats';
    case TITLE_STATE.SHARE:
      return 'Share';
    case TITLE_STATE.DEFAULT:
      return null;
  }
};

export default Header;