import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import get from 'lodash/get'
import includes from 'lodash/includes';
import map from 'lodash/map';
import sortBy from 'lodash/sortBy';
import countries from 'i18n-iso-countries';
import { Box, Flex, BoxProps } from 'theme-ui';

import TextInput from '../../components/elements/TextInput';
import RadioGroup from '../../components/elements/RadioGroup';
import Select from '../../components/elements/Select';
import { addEmptyOption, getCommonFormikFieldProps } from '../../core/forms';
import { clinicTypes, preferredBgUnits } from '../../core/clinicUtils';
import states from '../../core/validation/states';

export const ClinicProfileFields = (props) => {
  const { t, formikContext, ...BoxProps } = props;

  const selectCountries = sortBy(
    map(countries.getNames('en'), (val, key) => ({
      value: key,
      label: t(val),
    })),
    'label'
  );

  const {
    values,
  } = formikContext;

  const formText = {
    state: includes(['US', ''], values.country) ? t('State') : t('Province'),
    postalCode: includes(['US', ''], values.country) ? t('Zip code') : t('Postal code'),
  };

  const selectStates = sortBy(
    map(get(states, values.country, []), (val, key) => ({
      value: key,
      label: t(val),
    })),
    'label'
  );

  return (
    <Box {...BoxProps}>
      <Flex sx={{ flexWrap: 'wrap', flexDirection: ['column', 'row'] }}>
        <Box mb={4} sx={{ flexBasis: '100%' }}>
          <TextInput
            {...getCommonFormikFieldProps('name', formikContext)}
            label={t('Clinic Name')}
            placeholder={t('Clinic Name')}
            variant="condensed"
            width="100%"
          />
        </Box>

        <Box mb={4} sx={{ flexBasis: '100%' }}>
          <Select
            {...getCommonFormikFieldProps('clinicType', formikContext)}
            options={addEmptyOption(clinicTypes)}
            label={t('What best describes your team?')}
            variant="condensed"
            themeProps={{
              width: '100%',
            }}
          />
        </Box>

        <Box pr={[0,3]} mb={4} sx={{ flexBasis: ['100%', '50%'] }}>
          <Select
            {...getCommonFormikFieldProps('country', formikContext)}
            options={addEmptyOption(selectCountries)}
            label={t('Country')}
            placeholder={t('Country')}
            variant="condensed"
            themeProps={{
              width: '100%',
            }}
          />
        </Box>

        <Box pl={[0,3]} mb={4} sx={{ flexBasis: ['100%', '50%'] }}>
          { selectStates.length ? (
            <Select
              {...getCommonFormikFieldProps('state', formikContext)}
              options={addEmptyOption(selectStates)}
              label={formText.state}
              placeholder={formText.state}
              variant="condensed"
              themeProps={{
                width: '100%',
              }}
            />
          ) : (
            <TextInput
              {...getCommonFormikFieldProps('state', formikContext)}
              label={formText.state}
              placeholder={formText.state}
              variant="condensed"
              width="100%"
            />
          )}
        </Box>

        <Box pr={[0,3]} mb={4} sx={{ flexBasis: ['100%', '50%'] }}>
          <TextInput
            {...getCommonFormikFieldProps('address', formikContext)}
            label={t('Address')}
            placeholder={t('Address')}
            variant="condensed"
            width="100%"
          />
        </Box>

        <Box pl={[0,3]} mb={4} sx={{ flexBasis: ['100%', '50%'] }}>
          <TextInput
            {...getCommonFormikFieldProps('city', formikContext)}
            label={t('City')}
            placeholder={t('City')}
            variant="condensed"
            width="100%"
          />
        </Box>

        <Box pr={[0,3]} mb={4} sx={{ flexBasis: ['100%', '50%'] }}>
          <TextInput
            {...getCommonFormikFieldProps('postalCode', formikContext)}
            label={formText.postalCode}
            placeholder={formText.postalCode}
            variant="condensed"
            width="100%"
          />
        </Box>

        <Box pl={[0,3]} mb={4} sx={{ flexBasis: ['100%', '50%'] }}>
          <TextInput
            {...getCommonFormikFieldProps('website', formikContext)}
            label={t('Website (optional)')}
            placeholder={t('Website')}
            variant="condensed"
            width="100%"
          />
        </Box>

        <Box pr={[0,3]} mb={4} sx={{ flexBasis: ['100%', '50%'] }}>
          <RadioGroup
            id="preferred-bg-units"
            label={t('Preferred blood glucose units')}
            options={preferredBgUnits}
            {...getCommonFormikFieldProps('preferredBgUnits', formikContext)}
            variant="vertical"
          />
        </Box>
      </Flex>
    </Box>
  );
};

ClinicProfileFields.propTypes = {
  ...BoxProps,
  formikContext: PropTypes.object,
};

export default withTranslation()(ClinicProfileFields);
