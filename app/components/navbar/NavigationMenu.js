import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { withTranslation } from 'react-i18next';
import { push } from 'connected-react-router';
import filter from 'lodash/filter';
import has from 'lodash/has';
import includes from 'lodash/includes';
import map from 'lodash/map';
import sortBy from 'lodash/sortBy';
import values from 'lodash/values';
import DashboardRoundedIcon from '@material-ui/icons/DashboardRounded';
import SupervisedUserCircleRoundedIcon from '@material-ui/icons/SupervisedUserCircleRounded';
import ExitToAppRoundedIcon from '@material-ui/icons/ExitToAppRounded';
import KeyboardArrowDownRoundedIcon from '@material-ui/icons/KeyboardArrowDownRounded';
import SettingsRoundedIcon from '@material-ui/icons/SettingsRounded';
import ViewListRoundedIcon from '@material-ui/icons/ViewListRounded';
import { Flex , Box } from 'theme-ui';

import {
  usePopupState,
  bindPopover,
  bindTrigger,
} from 'material-ui-popup-state/hooks';

import * as actions from '../../redux/actions';
import Button from '../elements/Button';
import Popover from '../elements/Popover';
import NotificationIcon from '../elements/NotificationIcon';
import personUtils from '../../core/personutils';
import { borders, colors, space } from '../../themes/baseTheme';

export const NavigationMenu = props => {
  const { t, api, trackMetric } = props;
  const dispatch = useDispatch();
  const { pathname } = useLocation();
  const [isClinicProfileFormPath, setIsClinicProfileFormPath] = useState();
  const loggedInUserId = useSelector((state) => state.blip.loggedInUserId);
  const allUsersMap = useSelector((state) => state.blip.allUsersMap);
  const clinics = useSelector((state) => state.blip.clinics);
  const clinicFlowActive = useSelector((state) => state.blip.clinicFlowActive);
  const pendingReceivedClinicianInvites = useSelector((state) => state.blip.pendingReceivedClinicianInvites);

  const popupState = usePopupState({
    variant: 'popover',
    popupId: 'navigationMenu',
  });

  const privateWorkspaceOption = {
    action: handleSelectWorkspace.bind(null, null),
    icon: SupervisedUserCircleRoundedIcon,
    label: t('Private Workspace'),
    metric: ['Clinic - Menu - Go to private workspace'],
  };

  const accountSettingsOption = {
    action: () => dispatch(push('/profile')),
    icon: SettingsRoundedIcon,
    label: t('Account Settings'),
  };

  const manageWorkspacesOption = () => ({
    action: () => dispatch(push('/workspaces')),
    icon: ViewListRoundedIcon,
    label: t('Manage Workspaces'),
    metric: ['Clinic - Menu - Manage workspaces'],
    notification: pendingReceivedClinicianInvites.length > 0,
  });

  const logoutOption = {
    action: () => dispatch(actions.async.logout(api)),
    icon: ExitToAppRoundedIcon,
    label: t('Logout'),
  };

  const defaultMenuOptions = [
    privateWorkspaceOption,
    accountSettingsOption,
    logoutOption,
  ];

  const [menuOptions, setMenuOptions] = useState(defaultMenuOptions);

  useEffect(() => {
    const userClinics = filter(values(clinics), ({ clinicians }) => has(clinicians, loggedInUserId));

    if (isClinicProfileFormPath) {
      setMenuOptions([logoutOption]);
    } else if (clinicFlowActive) {
      const options = [
        ...map(sortBy(userClinics, clinic => clinic.name.toLowerCase()), clinic => ({
          action: handleSelectWorkspace.bind(null, clinic.id),
          icon: DashboardRoundedIcon,
          label: t('{{name}} Workspace', { name: clinic.name }),
          metric: ['Clinic - Menu - Go to clinic workspace', { clinicId: clinic.id }],
        })),
        manageWorkspacesOption(),
        privateWorkspaceOption,
        accountSettingsOption,
        logoutOption,
      ];

      setMenuOptions(options);
    } else {
      setMenuOptions(defaultMenuOptions)
    }
  }, [clinics, pendingReceivedClinicianInvites, isClinicProfileFormPath]);

  useEffect(() => {
    setIsClinicProfileFormPath(includes(['/clinic-details/profile', '/clinic-details/migrate'], pathname));
  }, [pathname]);

  function handleSelectWorkspace(clinicId) {
    dispatch(actions.async.selectClinic(api, clinicId));
    dispatch(actions.sync.setPatientListSearchTextInput(''));
    dispatch(actions.sync.setIsPatientListVisible(false));
    dispatch(push(clinicId ? '/clinic-workspace' : '/patients', { selectedClinicId: clinicId }));
  }

  function handleMenuAction(menuOption) {
    if (menuOption.metric?.length) trackMetric(...menuOption.metric);
    menuOption.action();
    popupState.close();
  }

  return (
    <Flex id="navigation-menu" width="auto" sx={{ justifyContent: ['center', 'flex-end'] }}>
      <Button
        id="navigation-menu-trigger"
        variant="textPrimary"
        {...bindTrigger(popupState)}
        icon={KeyboardArrowDownRoundedIcon}
        iconLabel={t('Choose workspace')}
        sx={{
          color: 'text.primary',
          fontSize: 2,
          '&:hover': {
            color: colors.purpleDark,
          },
        }}
      >
        <Flex sx={{ alignItems: 'center' }}>
          {personUtils.fullName(allUsersMap?.[loggedInUserId]) || t('Account')}
          {pendingReceivedClinicianInvites.length > 0 && <NotificationIcon sx={{ flexShrink: 0 }} />}
        </Flex>
      </Button>

      <Popover
        sx={{ minWidth: '15em' }}
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
              key={key}
              icon={option.icon}
              iconLabel={option.label}
              iconPosition="left"
              onClick={() => handleMenuAction(option)}
              sx={{
                color: 'text.primary',
                width: `calc(100% - ${space[3]}px)`,
                py: 3,
                pr: 3,
                ml: 3,
                fontSize: 2,
                justifyContent: 'flex-end',
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
              <Flex sx={{ alignItems: 'center' }}>
                {option.label}
                {option.notification && <NotificationIcon sx={{ flexShrink: 0 }} />}
              </Flex>
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

export default withTranslation()(NavigationMenu);
