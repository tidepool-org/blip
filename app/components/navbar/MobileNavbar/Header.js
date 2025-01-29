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
import { clinicPatientFromAccountInfo } from '../../../core/personutils';
import SettingsRoundedIcon from '@material-ui/icons/SettingsRounded';
import SupervisedUserCircleRoundedIcon from '@material-ui/icons/SupervisedUserCircleRounded';

const TITLE_STATE = {
  PRIVATE_WORKSPACE: 'PRIVATE_WORKSPACE',
  ACCOUNT_SETTINGS: 'ACCOUNT_SETTINGS',
  WELCOME: 'WELCOME',
  DEVICES: 'DEVICES',
  SUMMARY_STATS: 'SUMMARY_STATS',
  SHARE: 'SHARE',
};

const getTitleState = (pathname, chartType, patient, clinicPatient) => {
  const finalSlug = getFinalSlug(pathname);

  if (finalSlug === '/profile') return TITLE_STATE.ACCOUNT_SETTINGS;
  if (finalSlug === '/patients') return TITLE_STATE.PRIVATE_WORKSPACE;
  if (finalSlug === '/share') return TITLE_STATE.SHARE;

  const patientData = clinicPatient || (patient ? clinicPatientFromAccountInfo(patient) : null);
  const hasDataSources = patientData?.dataSources?.length > 0;

  if (finalSlug === '/data' && chartType === 'settings' && !hasDataSources) return TITLE_STATE.WELCOME;
  if (finalSlug === '/data' && chartType === 'settings') return TITLE_STATE.DEVICES;
  if (finalSlug === '/data') return TITLE_STATE.SUMMARY_STATS;

  return TITLE_STATE.DEFAULT;
};

const BoldTitle = ({ label, icon = null, iconSrc = null }) => {
  const color = colorPalette.primary.purpleDark;

  return (
    <Flex sx={{ justifyContent: 'center', alignItems: 'center' }}>
      {(icon || iconSrc) && <Icon tabIndex={-1} className="icon" mr={2} color={color} variant="static" icon={icon} iconSrc={iconSrc} label={label} />}
      <Box sx={{ color, fontSize: 2, fontWeight: fontWeights.bold }}>{label}</Box>
    </Flex>
  );
};

const LightTitle = ({ label, icon = null, iconSrc = null }) => {
  const color = colorPalette.primary.blueGreyDark;

  return (
    <Flex sx={{ justifyContent: 'center', alignItems: 'center' }}>
      {(icon || iconSrc) && <Icon tabIndex={-1} className="icon" mr={2} color={color} variant="static" icon={icon} iconSrc={iconSrc} label={label} />}
      <Box sx={{ color }}>{label}</Box>
    </Flex>
  );
};

const Header = ({ patient, clinicPatient }) => {
  const { t } = useTranslation();
  const { pathname } = useLocation();
  const chartType = useSelector(state => state.blip.navbarChartType);

  const titleState = getTitleState(pathname, chartType, patient, clinicPatient);

  switch(titleState) {
    case TITLE_STATE.PRIVATE_WORKSPACE:
      return <LightTitle label={t('Private Workspace')} icon={SupervisedUserCircleRoundedIcon} />;
    case TITLE_STATE.ACCOUNT_SETTINGS:
      return <LightTitle label={t('Account Settings')} icon={SettingsRoundedIcon} />;
    case TITLE_STATE.WELCOME:
      return <BoldTitle label={t('Welcome')} />;
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