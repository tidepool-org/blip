import React from 'react';
import PropTypes from 'prop-types';
import { useSelector } from 'react-redux';
import { translate } from 'react-i18next';
import get from 'lodash/get'
import { Box, Flex } from 'rebass/styled-components';

import {
  Title,
} from '../../components/elements/FontStyles';

import TextInput from '../../components/elements/TextInput';
import baseTheme from '../../themes/baseTheme';

export const ClinicProfile = (props) => {
  const { t, ...boxProps } = props;
  const clinics = useSelector((state) => state.blip.clinics);
  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);

  return (
    <Box
      mx="auto"
      my={2}
      p={4}
      bg="white"
      width={[1, 0.75, 0.75, 0.5]}
      sx={{
        border: baseTheme.borders.default,
        borderRadius: baseTheme.radii.default,
      }}
      {...boxProps}
    >
      <Flex alignItems="flex-start">
        <Title py={4} pr={4}>
          {t('Clinic Profile')}
        </Title>
        <Box flexDirection="column" flexGrow="1">
          <TextInput
            name="clinic_name"
            label={t('Clinic name')}
            disabled={true}
            value={get(clinics, [selectedClinicId, 'name'])}
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
            name="clinic_address"
            label={t('Clinic address')}
            disabled={true}
            value={get(clinics, [selectedClinicId, 'address'])}
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
        </Box>
        <Box flexDirection="column" flexGrow="1">
          <Box>
            <TextInput
              name="clinic_contact"
              label={t('Clinic contact')}
              disabled={true}
              value={get(clinics, [selectedClinicId, 'email'])}
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
          </Box>
          <Box>
            <TextInput
              name="clinic_cityzip"
              label={t('City, State, Zipcode')}
              disabled={true}
              value={`${get(clinics, [
                selectedClinicId,
                'city',
              ])}, ${get(clinics, [
                selectedClinicId,
                'state',
              ])}, ${get(clinics, [selectedClinicId, 'postalCode'])}`}
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
          </Box>
        </Box>
        <Box flexDirection="column" flexGrow="1">
          <TextInput
            name="clinic_sharecode"
            label={t('Clinic share code')}
            disabled={true}
            value={get(clinics, [selectedClinicId, 'shareCode'])}
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
        </Box>
      </Flex>
    </Box>
  );
};

ClinicProfile.propTypes = {
  api: PropTypes.object.isRequired,
  trackMetric: PropTypes.func.isRequired,
};

export default translate()(ClinicProfile);
