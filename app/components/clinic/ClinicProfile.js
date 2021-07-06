import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import map from 'lodash/map'
import { Box, Flex } from 'rebass/styled-components';

import {
  Title,
} from '../../components/elements/FontStyles';

import Button from '../../components/elements/Button';
import TextInput from '../../components/elements/TextInput';
import baseTheme from '../../themes/baseTheme';

export const ClinicProfile = (props) => {
  const { t, clinic, clinicActions = [], ...boxProps } = props;

  if (!clinic) return null;

  return (
    <Box
      mx="auto"
      my={2}
      bg="white"
      width={[1, 0.75, 0.75, 0.5]}
      sx={{
        border: baseTheme.borders.default,
        borderRadius: baseTheme.radii.default,
      }}
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
                px: 2,
                pb: 2,
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
                px: 2,
                pb: 2,
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
                px: 2,
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
                px: 2,
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

      {!!clinicActions.length && (
        <Flex
          id="clinic-actions"
          justifyContent="flex-end"
          px={4}
          py={3}
          sx={{
            borderTop: baseTheme.borders.divider,
          }}
        >
          {map(clinicActions, (action, key) => (
            <Button key={key} variant={action.variant || 'primary'} onClick={action.action}>
              {t('Manage Clinic')}
            </Button>
          ))}
        </Flex>
      )}
    </Box>
  );
};

ClinicProfile.propTypes = {
  api: PropTypes.object.isRequired,
  clinic: PropTypes.object.isRequired,
  clinicActions: PropTypes.arrayOf(PropTypes.shape({
    label: PropTypes.string.isRequired,
    action: PropTypes.func.isRequired,
    variant: PropTypes.string,
  })),
};

export default translate()(ClinicProfile);
