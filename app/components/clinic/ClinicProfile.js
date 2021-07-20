import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { push } from 'connected-react-router';
import get from 'lodash/get'
import includes from 'lodash/includes'
import map from 'lodash/map'
import { Box, Flex, BoxProps } from 'rebass/styled-components';

import {
  Title,
} from '../../components/elements/FontStyles';

import Button from '../../components/elements/Button';
import TextInput from '../../components/elements/TextInput';
import baseTheme from '../../themes/baseTheme';
import config from '../../config';

export const ClinicProfile = (props) => {
  const { t, ...boxProps } = props;
  const dispatch = useDispatch();
  const { pathname } = useLocation();
  const clinics = useSelector((state) => state.blip.clinics);
  const loggedInUserId = useSelector((state) => state.blip.loggedInUserId);
  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);
  const clinic = get(clinics, selectedClinicId);

  const clinicActions = [
    {
      label: t('View Patients'),
      action: () => {
        if (pathname !== '/patients') {
          dispatch(push('/patients'));
        }
      },
      selected: pathname === '/patients',
    },
  ];

  if (config.RX_ENABLED) {
    clinicActions.push({
      label: t('View Prescriptions'),
      action: () => {
        if (pathname !== '/prescriptions') {
          dispatch(push('/prescriptions'));
        }
      },
      selected: pathname === '/prescriptions',
    });
  }

  clinicActions.push({
    label: t('Manage Clinic'),
    action: () => {
      if (pathname !== '/clinic-admin') {
        dispatch(push('/clinic-admin'));
      }
    },
    selected: pathname === '/clinic-admin',
  });

  if (!clinic) return null;

  return (
    <Box
      variant="containers.largeBordered"
      mb={4}
      {...boxProps}
    >
      <Flex p={4} alignItems="flex-start" flexWrap="wrap" flexDirection={['column', null, 'row']} sx={{
        display: ['block', 'flex'],
      }}>
        <Box>
          <Title py={4} pr={4}>
            {t('Clinic Profile')}
          </Title>
        </Box>
        <Box flex={1} width="100%" flexDirection={['row', null, 'column']}  flexWrap={['wrap', 'nowrap']} sx={{
          display: ['block', null, 'flex'],
        }}>
          <Flex flex={1} flexDirection={['column', 'row']}>
            <TextInput
              name="clinic_name"
              label={t('Clinic name')}
              disabled={true}
              value={clinic.name}
              width="100%"
              themeProps={{
                mr: [0, 4],
                mb: 2,
                sx: {
                  '&& input:disabled': {
                    color: baseTheme.colors.text.primary,
                    bg: 'white',
                  },
                },
              }}
            ></TextInput>

            <TextInput
              name="clinic_sharecode"
              label={t('Clinic share code')}
              disabled={true}
              value={clinic.shareCode}
              width="100%"
              themeProps={{
                mb: 2,
                sx: {
                  '&& input:disabled': {
                    color: baseTheme.colors.text.primary,
                    bg: 'white',
                  },
                },
              }}
            ></TextInput>
          </Flex>

          <Flex flex={1} flexDirection={['column', 'row']}>
            <TextInput
              name="clinic_address"
              label={t('Clinic address')}
              disabled={true}
              value={clinic.address}
              width="100%"
              color={baseTheme.colors.text.primary}
              bg="white"
              themeProps={{
                mr: [0, 4],
                mb: 2,
                sx: {
                  '&& input:disabled': {
                    color: baseTheme.colors.text.primary,
                    bg: 'white',
                  },
                },
              }}
            ></TextInput>

            <TextInput
              name="clinic_cityzip"
              label={t('City, State, Zipcode')}
              disabled={true}
              value={`${clinic.city}, ${clinic.state}, ${clinic.postalCode}`}
              width="100%"
              themeProps={{
                mb: 2,
                sx: {
                  '&& input:disabled': {
                    color: baseTheme.colors.text.primary,
                    bg: 'white',
                  },
                },
              }}
            ></TextInput>
          </Flex>
        </Box>
      </Flex>

      {(clinicActions.length > 1) && (
        <Flex
          id="clinic-actions"
          justifyContent={['center', null, 'flex-end']}
          flexDirection={['column', 'row']}
          px={4}
          py={3}
          sx={{
            borderTop: baseTheme.borders.divider,
          }}
        >
          {map(clinicActions, (action, key) => (
            <Button
              ml={[0, 3]}
              mb={[3, 0]}
              sx={{
                '&:first-child': {
                  ml: 0,
                },
                '&:last-child': {
                  mb: 0,
                },
              }}
              key={key}
              variant={action.variant || 'primary'}
              selected={action.selected}
              disabled={action.disabled}
              onClick={action.action}
            >
              {action.label}
            </Button>
          ))}
        </Flex>
      )}
    </Box>
  );
};

ClinicProfile.propTypes = {
  ...BoxProps,
  t: PropTypes.func.isRequired,
};

export default translate()(ClinicProfile);
