import React from 'react';
import { useSelector } from 'react-redux';
import _ from 'lodash';
import styled from '@emotion/styled';
import { Box } from 'theme-ui';
import { useTranslation } from 'react-i18next';
import { usePopupState, bindPopover, bindTrigger } from 'material-ui-popup-state/hooks';
import { colors as vizColors } from '@tidepool/viz';
import personUtils from '../../../core/personutils';

import Popover from '../../elements/Popover';
import Button from '../../elements/Button';
import Icon from '../../elements/Icon';

import SupervisedUserCircleRoundedIcon from '@material-ui/icons/SupervisedUserCircleRounded';
import SettingsRoundedIcon from '@material-ui/icons/SettingsRounded';
import CloseRoundedIcon from '@material-ui/icons/CloseRounded';
import ExitToAppRoundedIcon from '@material-ui/icons/ExitToAppRounded';
import MenuRoundedIcon from '@material-ui/icons/MenuRounded';
import viewIcon from '../../../core/icons/viewIcon.svg';
import shareIcon from '../../../core/icons/shareIcon.svg';
import devicesIcon from '../../../core/icons/devicesIcon.svg';

import { getDemographicInfo, getPermissions, useNavigation } from '../../../core/navutils';
import { selectClinicPatient, selectPatient, selectUser, selectPermsOfLoggedInUser } from '../../../core/selectors';

const StyledMenuDropdownButton = styled(Button)`
  background: none;
  padding: 4px;
  border: none;
  font-size: 24px;

  &:focus:not(:focus-visible) {
    box-shadow: none;
  }

  &[data-is-open="true"] {
    z-index: 1310;
    background: ${vizColors.white};
  }
`;

const MenuOption = styled.div`
  padding: 8px 0;
  width: 100%;
  justify-content: flex-end;
  border-top: 1px solid ${vizColors.gray10};

  :first-child {
    border-top: none;
  }

  // HACK: This adjusts the icon color to purpleDark from its hardcoded value defined in the SVG file.
  // We will need to figure out a way to allow dynamic coloring of Icons in the future.
  .icon-custom-svg {
    filter: brightness(0) saturate(100%) invert(13%) sepia(47%) saturate(861%) hue-rotate(216deg) brightness(93%) contrast(101%);
  }
`;

const StyledPopover = styled(Popover)`
  .MuiPopover-paper {
    width: 100%;
    padding: 0;
  }
`;

const Menu = ({ api, trackMetric }) => {
  const { t } = useTranslation();

  const patient = useSelector(state => selectPatient(state));
  const user = useSelector(state => selectUser(state));
  const clinicPatient = useSelector(state => selectClinicPatient(state));
  const permsOfLoggedInUser = useSelector(state => selectPermsOfLoggedInUser(state));
  const selectedClinicId = useSelector(state => state.blip.selectedClinicId);

  const popupState = usePopupState({ variant: 'popover', popupId: 'mobileNavigationMenu' });

  const {
    handleViewData,
    handleViewSettingsChart,
    handleShare,
    handleSelectWorkspace,
    handleViewAccountSettings,
    handleLogout,
  } = useNavigation(api, trackMetric);

  const closeDropdownOnClick = (handleEvent) => () => {
    handleEvent();
    popupState.close();
  };

  const { name: patientName } = getDemographicInfo(patient, clinicPatient);
  const { canShare } = getPermissions(patient, permsOfLoggedInUser);

  const isClinicContext = !!selectedClinicId;
  const isUserPatient = personUtils.isSame(user, patient);
  const canViewDevices = isClinicContext || isUserPatient;

  const menuOptions = [
    {
      id: 'mobileNavbar_viewDataButton',
      onClick: handleViewData,
      iconSrc: viewIcon,
      label: t('Summary Stats'),
    },
    (canViewDevices && {
      id: 'mobileNavbar_settingsChartButton',
      onClick: handleViewSettingsChart,
      iconSrc: devicesIcon,
      label: t('Devices'),
    }),
    (canShare && {
      id: 'mobileNavbar_shareButton',
      onClick: handleShare,
      iconSrc: shareIcon,
      label: t('Share'),
    }),
  ].filter(Boolean);

  // TODO: Missing clinician-specific options. To be implemented along with clinician mobile navbar.
  const accountOptions = [
    {
      id: 'mobileNavbar_workspaceButton',
      onClick: () => handleSelectWorkspace(null),
      icon: SupervisedUserCircleRoundedIcon,
      label: 'Private Workspace',
    },
    {
      id: 'mobileNavbar_accountSettingsButton',
      onClick: handleViewAccountSettings,
      icon: SettingsRoundedIcon,
      label: 'Account Settings',
    },
    {
      id: 'mobileNavbar_logoutButton',
      onClick: handleLogout,
      icon: ExitToAppRoundedIcon,
      label: 'Logout',
    },
  ];

  return (
    <Box sx={{ gridColumn: '3/4' }}>
      <StyledMenuDropdownButton
        id='mobile-navigation-menu-trigger'
        {...bindTrigger(popupState)}
        onClick={popupState.isOpen ? popupState.close : bindTrigger(popupState).onClick}
        data-is-open={popupState.isOpen}
      >
        <Icon
          icon={popupState.isOpen ? CloseRoundedIcon : MenuRoundedIcon}
          color="blueGreyMedium"
          variant="static"
          label='Menu'
          tabIndex='-1'
        />
      </StyledMenuDropdownButton>
      <StyledPopover
        classes={{ root: 'Navbar-mobileBackdrop' }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        {...bindPopover(popupState)}
      >
        {!!patient &&
          <Box id="mobile-navbar-data-options" px={4}>
            { patientName &&
              <Box pt={4} pb={3} sx={{ color: 'grays.5', fontWeight: 'medium', fontSize: 2 }}>
                {patientName}
              </Box>
            }
            { menuOptions.map(({ id, onClick, iconSrc, label }) => (
                <MenuOption>
                  <Button
                    id={id}
                    onClick={closeDropdownOnClick(onClick)}
                    iconSrc={iconSrc}
                    iconLabel={label}
                    variant='textSecondary'
                    iconPosition='left'
                    iconFontSize='1.25em'
                    sx={{ fontSize: 1, fontWeight: 'medium', color: vizColors.purple90 }}
                    pl={0}
                  >
                    {label}
                  </Button>
                </MenuOption>
              ))}
          </Box>
        }
        <Box id="mobile-navbar-account-options" px={4} py={4} sx={{ background: vizColors.blue00 }}>
          {accountOptions.map(({ id, onClick, icon, label }) => (
            <Button
              id={id}
              onClick={closeDropdownOnClick(onClick)}
              icon={icon}
              iconLabel={label}
              variant='textSecondary'
              iconPosition='left'
              iconFontSize='1.25em'
              sx={{ fontSize: 1, fontWeight: 'medium', color: vizColors.blue50 }}
              pl={0}
            >
              {label}
            </Button>
          ))}
        </Box>
      </StyledPopover>
    </Box>
  );
};

export default Menu;
