import React from 'react';
import { Box, Flex } from 'theme-ui';
import Icon from '../../elements/Icon';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { getFinalSlug } from '../../../core/navutils';
import { fontWeights } from '../../../themes/baseTheme';
import shareIcon from '../../../core/icons/shareIcon.svg';
import viewIcon from '../../../core/icons/viewIcon.svg';
import colorPalette from '../../../themes/colorPalette';
import SettingsRoundedIcon from '@material-ui/icons/SettingsRounded';
import SupervisedUserCircleRoundedIcon from '@material-ui/icons/SupervisedUserCircleRounded';

const TITLE_STATE = {
  PRIVATE_WORKSPACE: 'PRIVATE_WORKSPACE',
  ACCOUNT_SETTINGS: 'ACCOUNT_SETTINGS',
  WELCOME: 'WELCOME', // TODO: make exception for welcome
  DEVICES: 'DEVICES',
  SUMMARY_STATS: 'SUMMARY_STATS',
  SHARE: 'SHARE',
};

const getTitleState = (pathname, chartType) => {
  const finalSlug = getFinalSlug(pathname);

  if (finalSlug === '/profile') return TITLE_STATE.ACCOUNT_SETTINGS;
  if (finalSlug === '/patients') return TITLE_STATE.PRIVATE_WORKSPACE;
  if (finalSlug === '/share') return TITLE_STATE.SHARE;

  if (finalSlug === '/data' && chartType === 'settings') return TITLE_STATE.DEVICES;

  // Insert option for 'welcome' when blank data

  if (finalSlug === '/data') return TITLE_STATE.SUMMARY_STATS;

  return TITLE_STATE.DEFAULT;
};

const BoldTitle = ({ icon, label, iconSrc }) => {
  const color = colorPalette.primary.purpleDark;

  return (
    <Flex sx={{ alignItems: 'center' }}>
      <Icon tabIndex={-1} className="icon" mr={2} color={color} variant="static" icon={icon} iconSrc={iconSrc} label={label} />
      <Box sx={{ color, fontSize: 2, fontWeight: fontWeights.bold }}>{label}</Box>
    </Flex>
  );
};

const LightTitle = ({ label, icon, iconSrc }) => {
  const color = colorPalette.primary.blueGreyDark;

  return (
    <Flex sx={{ alignItems: 'center' }}>
      <Icon tabIndex={-1} className="icon" mr={2} color={color} variant="static" icon={icon} iconSrc={iconSrc} label={label} />
      <Box sx={{ color }}>{label}</Box>
    </Flex>
  );
};

const Header = () => {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const navbarChartTypeForTitle = useSelector(state => state.blip.navbarChartTypeForTitle);

  const titleState = getTitleState(pathname, navbarChartTypeForTitle);

  switch(titleState) {
    case TITLE_STATE.PRIVATE_WORKSPACE:
      return <LightTitle label={t('Private Workspace')} icon={SupervisedUserCircleRoundedIcon} />;
    case TITLE_STATE.ACCOUNT_SETTINGS:
      return <LightTitle label={t('Account Settings')} icon={SettingsRoundedIcon} />;
    // case TITLE_STATE.WELCOME:
    //   return 'Welcome';
    case TITLE_STATE.DEVICES:
      return <BoldTitle label={t('Devices')} icon={SettingsRoundedIcon} />;
    case TITLE_STATE.SUMMARY_STATS:
      return <BoldTitle label={t('Summary Stats')} iconSrc={viewIcon} />;
    case TITLE_STATE.SHARE:
      return <BoldTitle label={t('Share')} iconSrc={shareIcon} />;
    default:
      return null;
  }
};

export default Header;