import React from 'react';
import { useNavbar } from '../../../core/navutils';
import styled from '@emotion/styled';
import { Box, Flex } from 'theme-ui';
import { useTranslation } from 'react-i18next';
import { usePopupState, bindPopover, bindTrigger } from 'material-ui-popup-state/hooks';
import colorPalette from '../../../themes/colorPalette';

import Popover from '../../elements/Popover';
import Button from '../../elements/Button';

import SupervisedUserCircleRoundedIcon from '@material-ui/icons/SupervisedUserCircleRounded';
import SettingsRoundedIcon from '@material-ui/icons/SettingsRounded';
import ExitToAppRoundedIcon from '@material-ui/icons/ExitToAppRounded';
import viewIcon from '../../../core/icons/viewIcon.svg';
import shareIcon from '../../../core/icons/shareIcon.svg';

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
  sx: { fontSize: 1, fontWeight: 'medium' },
  pl: 0,
};

const StyledPopover = styled(Popover)`
  .MuiPopover-paper {
    width: 100%;
    padding: 0;
  }
`;

const Menu = ({ api, trackMetric }) => {
  const popupState = usePopupState({ variant: 'popover', popupId: 'mobileNavigationMenu' });
  const { t } = useTranslation();

  const { patientName, handleViewData, canShare, handleShare } = useNavbar(api, trackMetric);

  return (
    <>
      <button {...bindTrigger(popupState)}>
        { 'Menu' }
      </button>
      <StyledPopover
        classes={{ root: 'Navbar-mobileBackdrop' }}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
        transformOrigin={{ vertical: 'top', horizontal: 'center' }}
        {...bindPopover(popupState)}
      >
        <Box px={4}>
          { patientName && <Box py={3}>{patientName}</Box>}
          <MenuOption>
            <Button
              id="mobileNavbar_viewDataButton"
              onClick={handleViewData}
              iconSrc={viewIcon}
              iconLabel="View"
              {...buttonStyleProps}
            >
              {t('Summary Stats')}
            </Button>
          </MenuOption>
          <MenuOption>
            <Button
              id="mobileNavbar_devicesButton"
              onClick={() => {}}
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
                onClick={handleShare}
                iconSrc={shareIcon}
                iconLabel="Share"
                {...buttonStyleProps}
              >
                {t('Share')}
              </Button>
            </MenuOption>
          }
        </Box>
        <Box px={4} py={3} sx={{ background: colorPalette.primary.bluePrimary00 }}>
          <AccountMenuOption>
            <Button // TODO: Need one for every workspace
              id="mobileNavbar_workspaceButton"
              onClick={() => {}}
              icon={SupervisedUserCircleRoundedIcon}
              iconLabel="Private Workspace"
              {...buttonStyleProps}
            >
              {t('Private Workspace')}
            </Button>
            <Button // TODO: Need one for every workspace
              id="mobileNavbar_accountSettingsButton"
              onClick={() => {}}
              icon={SettingsRoundedIcon}
              iconLabel="Account Settings"
              {...buttonStyleProps}
            >
              {t('Account Settings')}
            </Button>
            <Button // TODO: Need one for every workspace
              id="mobileNavbar_logoutButton"
              onClick={() => {}}
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