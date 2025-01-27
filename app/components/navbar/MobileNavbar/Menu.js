import React from 'react';
import { getDemographicInfo, getPermissions, useNavigation } from '../../../core/navutils';
import { useSelector } from 'react-redux';
import styled from '@emotion/styled';
import { Box, Flex } from 'theme-ui';
import { useTranslation } from 'react-i18next';
import { usePopupState, bindPopover, bindTrigger } from 'material-ui-popup-state/hooks';
import colorPalette from '../../../themes/colorPalette';

import Popover from '../../elements/Popover';
import Button from '../../elements/Button';
import Icon from '../../elements/Icon';

import SupervisedUserCircleRoundedIcon from '@material-ui/icons/SupervisedUserCircleRounded';
import SettingsRoundedIcon from '@material-ui/icons/SettingsRounded';
import ExitToAppRoundedIcon from '@material-ui/icons/ExitToAppRounded';
import MenuRoundedIcon from '@material-ui/icons/MenuRounded';
import viewIcon from '../../../core/icons/viewIcon.svg';
import shareIcon from '../../../core/icons/shareIcon.svg';

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
    background: ${colorPalette.neutrals.white};
  }
`;

const MenuOption = styled.div`
  padding: 8px 0;
  width: 100%;
  justify-content: flex-end;
  border-top: 1px solid ${colorPalette.primary.gray10};

  :first-child {
    border-top: none;
  }
`;

const AccountMenuOption = styled.div`
  padding: 4px 0;
  width: 100%;
  justify-content: flex-end;
`;

const buttonStyleProps = {
  variant: 'textSecondary',
  iconPosition: 'left',
  iconFontSize: '1.25em',
  sx: { fontSize: 1, fontWeight: 'medium', color: colorPalette.primary.blueGreyDark },
  pl: 0,
};

const StyledPopover = styled(Popover)`
  .MuiPopover-paper {
    width: 100%;
    padding: 0;
  }
`;

const Menu = ({ api, trackMetric, patient, clinicPatient, permsOfLoggedInUser }) => {
  const popupState = usePopupState({ variant: 'popover', popupId: 'mobileNavigationMenu' });
  const { t } = useTranslation();

  const currentPatientInViewId = useSelector(state => state.blip.currentPatientInViewId);
  const { name: patientName } = getDemographicInfo(patient, clinicPatient);
  const { canShare } = getPermissions(patient, permsOfLoggedInUser);

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

  console.log(popupState);

  return (
    <>
      <StyledMenuDropdownButton {...bindTrigger(popupState)} data-is-open={popupState.isOpen}>
        <Icon icon={MenuRoundedIcon} color="blueGreyMedium" variant="static" label='Menu' tabIndex='-1' />
      </StyledMenuDropdownButton>
      <StyledPopover
        classes={{ root: 'Navbar-mobileBackdrop' }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        {...bindPopover(popupState)}
      >
        {!!currentPatientInViewId &&
          <Box px={4}>
            { patientName && <Box py={3}>{patientName}</Box>}
            <MenuOption>
              <Button
                id="mobileNavbar_viewDataButton"
                onClick={closeDropdownOnClick(handleViewData)}
                iconSrc={viewIcon}
                iconLabel="View"
                {...buttonStyleProps}
              >
                {t('Summary Stats')}
              </Button>
            </MenuOption>
            <MenuOption>
              <Button
                id="mobileNavbar_settingsChartButton"
                onClick={closeDropdownOnClick(handleViewSettingsChart)}
                iconSrc={viewIcon}
                iconLabel="Devices"
                {...buttonStyleProps}
              >
                {t('Devices')}
              </Button>
            </MenuOption>
            {
              canShare &&
              <MenuOption>
                <Button
                  id="mobileNavbar_shareButton"
                  onClick={closeDropdownOnClick(handleShare)}
                  iconSrc={shareIcon}
                  iconLabel="Share"
                  {...buttonStyleProps}
                >
                  {t('Share')}
                </Button>
              </MenuOption>
            }
          </Box>
        }
        <Box px={4} py={3} sx={{ background: colorPalette.primary.bluePrimary00 }}>
          <AccountMenuOption>
            <Button // TODO: Need one for every workspace
              id="mobileNavbar_workspaceButton"
              onClick={closeDropdownOnClick(() => handleSelectWorkspace(null))}
              icon={SupervisedUserCircleRoundedIcon}
              iconLabel="Private Workspace"
              {...buttonStyleProps}
            >
              {t('Private Workspace')}
            </Button>
            <Button // TODO: Need one for every workspace
              id="mobileNavbar_accountSettingsButton"
              onClick={closeDropdownOnClick(handleViewAccountSettings)}
              icon={SettingsRoundedIcon}
              iconLabel="Account Settings"
              {...buttonStyleProps}
            >
              {t('Account Settings')}
            </Button>
            <Button // TODO: Need one for every workspace
              id="mobileNavbar_logoutButton"
              onClick={closeDropdownOnClick(handleLogout)}
              icon={ExitToAppRoundedIcon}
              iconLabel="Logout"
              {...buttonStyleProps}
            >
              {t('Logout')}
            </Button>
          </AccountMenuOption>
        </Box>
      </StyledPopover>
    </>
  );
};

export default Menu;