import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { translate } from 'react-i18next';
import { push } from 'connected-react-router';
import filter from 'lodash/filter';
import forEach from 'lodash/forEach';
import has from 'lodash/has';
import map from 'lodash/map';
import values from 'lodash/values';
import DashboardRoundedIcon from '@material-ui/icons/DashboardRounded';
import SupervisedUserCircleRoundedIcon from '@material-ui/icons/SupervisedUserCircleRounded';
import ExitToAppRoundedIcon from '@material-ui/icons/ExitToAppRounded';
import KeyboardArrowDownRoundedIcon from '@material-ui/icons/KeyboardArrowDownRounded';
import SettingsRoundedIcon from '@material-ui/icons/SettingsRounded';
import ViewListRoundedIcon from '@material-ui/icons/ViewListRounded';
import { Flex , Box } from 'rebass/styled-components';

import {
  usePopupState,
  bindPopover,
  bindTrigger,
} from 'material-ui-popup-state/hooks';

import * as actions from '../../redux/actions';
import Button from '../elements/Button';
import Popover from '../elements/Popover';
import personUtils from '../../core/personutils';
import { borders, colors, space } from '../../themes/baseTheme';

export const NavigationMenu = props => {
  const { t, api } = props;
  const dispatch = useDispatch();
  const loggedInUserId = useSelector((state) => state.blip.loggedInUserId);
  const allUsersMap = useSelector((state) => state.blip.allUsersMap);
  const clinics = useSelector((state) => state.blip.clinics);
  const { fetchingClinicsForClinician } = useSelector((state) => state.blip.working);

  const popupState = usePopupState({
    variant: 'popover',
    popupId: 'navigationMenu',
  });

  const personalWorkspaceOption = {
    action: handleSelectWorkspace.bind(null, null),
    icon: SupervisedUserCircleRoundedIcon,
    label: t('Personal Workspace'),
  };

  const accountSettingsOption = {
    action: () => dispatch(push('/profile')),
    icon: SettingsRoundedIcon,
    label: t('Account Settings'),
  };

  const manageWorkspacesOption = {
    action: () => dispatch(push('/workspaces')),
    icon: ViewListRoundedIcon,
    label: t('Manage Workspaces'),
  };

  const logoutOption = {
    action: () => dispatch(actions.async.logout(api)),
    icon: ExitToAppRoundedIcon,
    label: t('Logout'),
  };

  const [menuOptions, setMenuOptions] = useState([
    personalWorkspaceOption,
    accountSettingsOption,
    logoutOption,
  ]);

  useEffect(() => {
    const userClinics = filter(values(clinics), ({ clinicians }) => has(clinicians, loggedInUserId));

    if (userClinics.length) {
      setMenuOptions([
        ...map(userClinics, clinic => ({
          action: handleSelectWorkspace.bind(null, clinic.id),
          icon: DashboardRoundedIcon,
          label: t('{{name}} Workspace', { name: clinic.name }),
        })),
        manageWorkspacesOption,
        personalWorkspaceOption,
        accountSettingsOption,
        logoutOption,
      ]);
    }
  }, [clinics]);

  function handleSelectWorkspace(clinicId) {
    dispatch(actions.sync.selectClinic(clinicId));
    dispatch(push('/patients'));
  }

  function handleMenuAction(menuOption) {
    menuOption.action();
    popupState.close();
  }

  return (
    <Flex id="navigation-menu" width="auto" justifyContent="flex-end">
      <Button
        id="navigation-menu-trigger"
        variant="textPrimary"
        color="text.primary"
        fontSize={2}
        {...bindTrigger(popupState)}
        icon={KeyboardArrowDownRoundedIcon}
        iconLabel={t('Choose workspace')}
        sx={{
          '&:hover': {
            color: colors.purpleDark,
          },
        }}
      >
        {personUtils.patientFullName(allUsersMap?.[loggedInUserId]) || t('Account')}
      </Button>

      <Popover
        width="15em"
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        {...bindPopover(popupState)}
      >
        <Box py={2}>
          {map(menuOptions, (option, key) => (
            <Button
              className="navigation-menu-option"
              variant="textPrimary"
              color="text.primary"
              width={`calc(100% - ${space[3]}px)`}
              py={3}
              pr={3}
              ml={3}
              justifyContent="flex-end"
              key={key}
              fontSize={2}
              icon={option.icon}
              iconLabel={option.label}
              iconPosition="left"
              onClick={() => handleMenuAction(option)}
              sx={{
                borderBottom: borders.divider,
                '&:hover': {
                  color: colors.purpleDark,
                },
                '&:last-child': {
                  borderBottom: 'none',
                },
                '> div': {
                  textAlign: 'left',
                },
              }}
            >
              {option.label}
            </Button>
          ))}
        </Box>
      </Popover>
    </Flex>
  );
};

NavigationMenu.propTypes = {
  api: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
};

export default translate()(NavigationMenu);
