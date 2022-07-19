import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import get from 'lodash/get'
import map from 'lodash/map';
import sortBy from 'lodash/sortBy';
import countries from 'i18n-iso-countries';
import InputMask from 'react-input-mask';
import { Box, Flex, Text, BoxProps } from 'rebass/styled-components';

import {
  Body2,
} from '../../components/elements/FontStyles';

import TextInput from '../../components/elements/TextInput';
import RadioGroup from '../../components/elements/RadioGroup';
import Select from '../../components/elements/Select';
import { addEmptyOption, getCommonFormikFieldProps } from '../../core/forms';
import { clinicSizes, clinicTypes, preferredBgUnits } from '../../core/clinicUtils';
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

  const selectStates = sortBy(
    map(get(states, values.country, []), (val, key) => ({
      value: key,
      label: t(val),
    })),
    'label'
  );

  return (
    <Box {...BoxProps}>
      <Flex flexWrap="wrap" flexDirection={['column', 'row']}>
        <Box pr={[0,3]} mb={4} flexBasis={['100%', '50%']}>
          <TextInput
            {...getCommonFormikFieldProps('name', formikContext)}
            label={t('Clinic Name')}
            placeholder={t('Clinic Name')}
            variant="condensed"
            width="100%"
          />
        </Box>

        <Box pl={[0,3]} mb={4} flexBasis={['100%', '50%']}>
          <InputMask
            mask="(999) 999-9999"
            {...getCommonFormikFieldProps('phoneNumbers.0.number', formikContext)}
            defaultValue={get(values, 'phoneNumbers.0.number')}
            onChange={e => {
              formikContext.setFieldValue('phoneNumbers.0.number', e.target.value.toUpperCase(), e.target.value.length === 14);
            }}
            onBlur={e => {
              formikContext.setFieldTouched('phoneNumbers.0.number');
              formikContext.setFieldValue('phoneNumbers.0.number', e.target.value.toUpperCase());
            }}
          >
            <TextInput
              name="phoneNumbers.0.number"
              label={t('Phone Number')}
              variant="condensed"
              width="100%"
            />
          </InputMask>
        </Box>

        <Box pr={[0,3]} mb={4} flexBasis={['100%', '50%']}>
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

        <Box pl={[0,3]} mb={4} flexBasis={['100%', '50%']}>
          { selectStates.length ? (
            <Select
              {...getCommonFormikFieldProps('state', formikContext)}
              options={addEmptyOption(selectStates)}
              label={t('State/Province')}
              placeholder={t('State/Province')}
              variant="condensed"
              themeProps={{
                width: '100%',
              }}
            />
          ) : (
            <TextInput
              {...getCommonFormikFieldProps('state', formikContext)}
              label={t('State/Province')}
              placeholder={t('State/Province')}
              variant="condensed"
              width="100%"
            />
          )}
        </Box>

        <Box pl={[0,3]} mb={4} flexBasis={['100%', '50%']}>
          <TextInput
            {...getCommonFormikFieldProps('address', formikContext)}
            label={t('Clinic Address')}
            placeholder={t('Clinic Address')}
            variant="condensed"
            width="100%"
          />
        </Box>

        <Box pr={[0,3]} mb={4} flexBasis={['100%', '50%']}>
          <TextInput
            {...getCommonFormikFieldProps('city', formikContext)}
            label={t('City')}
            placeholder={t('City')}
            variant="condensed"
            width="100%"
          />
        </Box>

        <Box pr={[0,3]} mb={4} flexBasis={['100%', '50%']}>
          <TextInput
            {...getCommonFormikFieldProps('postalCode', formikContext)}
            label={t('Zip/Postal Code')}
            placeholder={t('Zip/Postal Code')}
            variant="condensed"
            width="100%"
          />
        </Box>

        <Box pl={[0,3]} mb={4} flexBasis={['100%', '50%']}>
          <TextInput
            {...getCommonFormikFieldProps('website', formikContext)}
            label={t('Website')}
            placeholder={t('Website')}
            variant="condensed"
            width="100%"
          />
        </Box>

        <Box pr={[0,3]} mb={4} flexBasis={['100%', '50%']}>
          <Text as={Body2} mb={3}>
            {t('What is the type of organization you are a part of?')}
          </Text>
          <RadioGroup
            id="clinic-type"
            options={clinicTypes}
            {...getCommonFormikFieldProps('clinicType', formikContext)}
            variant="vertical"
          />
        </Box>

        <Box pl={[0,3]} mb={4} flexBasis={['100%', '50%']}>
          <Text as={Body2} mb={3}>
            {t('How many patients does your clinic practice see?')}
          </Text>
          <RadioGroup
            id="clinic-size"
            options={clinicSizes}
            {...getCommonFormikFieldProps('clinicSize', formikContext)}
            variant="vertical"
          />
        </Box>

        <Box pr={[0,3]} mb={4} flexBasis={['100%', '50%']}>
          <Text as={Body2} mb={3}>
            {t('Preferred blood glucose units')}
          </Text>
          <RadioGroup
            id="preferred-bg-units"
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

export default translate()(ClinicProfileFields);
