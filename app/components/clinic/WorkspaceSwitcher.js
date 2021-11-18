import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { push } from 'connected-react-router';
import { translate } from 'react-i18next';
import get from 'lodash/get';
import filter from 'lodash/filter';
import find from 'lodash/find';
import has from 'lodash/has';
import map from 'lodash/map';
import values from 'lodash/values';
import KeyboardArrowDownRoundedIcon from '@material-ui/icons/KeyboardArrowDownRounded';
import CheckRoundedIcon from '@material-ui/icons/CheckRounded';
import { Flex, Box, Text } from 'rebass/styled-components';

import {
  usePopupState,
  bindPopover,
  bindTrigger,
} from 'material-ui-popup-state/hooks';

import * as actions from '../../redux/actions';
import Button from '../elements/Button';
import Popover from '../elements/Popover';
import { colors } from '../../themes/baseTheme';

export const WorkspaceSwitcher = props => {
  const { t, trackMetric } = props;
  const dispatch = useDispatch();
  const loggedInUserId = useSelector((state) => state.blip.loggedInUserId);
  const allUsersMap = useSelector((state) => state.blip.allUsersMap);
  const clinics = useSelector((state) => state.blip.clinics);
  const membershipInOtherCareTeams = useSelector((state) => state.blip.membershipInOtherCareTeams);
  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);
  const hasPatientProfile = !!get(allUsersMap, [loggedInUserId, 'profile', 'patient'], false);

  const popupState = usePopupState({
    variant: 'popover',
    popupId: 'jumpMenu',
  });


  const [menuOptions, setMenuOptions] = useState([])
  const [selectedClinic, setSelectedClinic] = useState(menuOptions[0]);

  useEffect(() => {
    const selected = find(menuOptions, {id: selectedClinicId});
    if (selected) setSelectedClinic(selected);
  }, [menuOptions.length, selectedClinicId]);

  useEffect(() => {
    const userClinics = filter(values(clinics), ({ clinicians }) => has(clinicians, loggedInUserId));

    if (userClinics.length) {
      const privateWorkspaceOption = {
        id: null,
        label: t('Private Workspace'),
        metric: ['Clinic - Workspace Switcher - Go to private workspace'],
      };

      const hidePrivateWorkspaceOption = !hasPatientProfile && !membershipInOtherCareTeams.length;

      const options = [
        ...map(userClinics, clinic => ({
          id: clinic.id,
          label: t('{{name}} Workspace', { name: clinic.name }),
          metric: ['Clinic - Workspace Switcher - Go to clinic workspace', { clinicId: clinic.id }],
        })),
      ];

      if (!hidePrivateWorkspaceOption) options.push(privateWorkspaceOption);

      setMenuOptions(options);
    }
  }, [clinics, membershipInOtherCareTeams, hasPatientProfile]);

  const handleSelect = option => {
    trackMetric(...option.metric);
    dispatch(actions.sync.selectClinic(option.id));
    dispatch(push(option.id ? '/clinic-workspace' : '/patients'));
    popupState.close();
  };

  return menuOptions.length ? (
    <Flex id="workspace-switcher" width="400px" justifyContent="center">
      {menuOptions.length > 1 && (
        <>
          <Button
            id="workspace-switcher-current"
            variant="textPrimary"
            color="text.primary"
            fontSize={2}
            {...bindTrigger(popupState)}
            icon={KeyboardArrowDownRoundedIcon}
            iconLabel={t('Open navigation menu')}
            sx={{
              '&:hover': {
                color: colors.purpleDark,
              },
            }}
          >
            {selectedClinic?.label}
          </Button>

          <Popover
            minWidth="15em"
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
                  className="workspace-option"
                  variant="textPrimary"
                  color="text.primary"
                  width="100%"
                  pt={2}
                  pb={3}
                  px={3}
                  justifyContent="space-between"
                  key={key}
                  fontSize={2}
                  icon={option.id === selectedClinic?.id ? CheckRoundedIcon : null}
                  iconLabel={t('Selected')}
                  onClick={() => handleSelect(option)}
                  sx={{
                    '&:hover': {
                      color: colors.purpleDark,
                    },
                    '&:last-child': {
                      pb: 2,
                    },
                  }}
                >
                  {option.label}
                </Button>
              ))}
            </Box>
          </Popover>
        </>
      )}

      {menuOptions.length === 1 && (
        <Text fontSize={2} color="text.primary">{selectedClinic?.label}</Text>
      )}
    </Flex>
  ) : null;
};

WorkspaceSwitcher.propTypes = {
  api: PropTypes.object.isRequired,
  trackMetric: PropTypes.func.isRequired,
};

export default translate()(WorkspaceSwitcher);
