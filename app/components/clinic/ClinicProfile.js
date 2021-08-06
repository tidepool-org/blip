import React, { useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { push } from 'connected-react-router';
import get from 'lodash/get'
import includes from 'lodash/includes'
import keys from 'lodash/keys';
import map from 'lodash/map';
import sortBy from 'lodash/sortBy';
import countries from 'i18n-iso-countries';
import InputMask from 'react-input-mask';
import { useFormik } from 'formik';
import { Box, Flex, Text, BoxProps } from 'rebass/styled-components';
import EditRoundedIcon from '@material-ui/icons/EditRounded';
import FileCopyRoundedIcon from '@material-ui/icons/FileCopyRounded';
import * as yup from 'yup';
import { components as vizComponents } from '@tidepool/viz';

import {
  Caption,
  Title,
  Body2,
} from '../../components/elements/FontStyles';

import * as actions from '../../redux/actions';
import { phoneRegex } from '../../pages/prescription/prescriptionFormConstants';
import Button from '../../components/elements/Button';
import TextInput from '../../components/elements/TextInput';
import RadioGroup from '../../components/elements/RadioGroup';
import Select from '../../components/elements/Select';
import Icon from '../../components/elements/Icon';
import baseTheme from '../../themes/baseTheme';
import { getCommonFormikFieldProps, fieldsAreValid } from '../../core/forms';
import { useIsFirstRender } from '../../core/hooks';
import { useToasts } from '../../providers/ToastProvider';

const { ClipboardButton } = vizComponents;

export const ClinicProfile = (props) => {
  const { t, api, trackMetric, ...boxProps } = props;
  const isFirstRender = useIsFirstRender();
  const { set: setToast } = useToasts();
  const dispatch = useDispatch();
  const { pathname } = useLocation();
  const clinics = useSelector((state) => state.blip.clinics);
  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);
  const loggedInUserId = useSelector((state) => state.blip.loggedInUserId);
  const { updatingClinic } = useSelector((state) => state.blip.working);
  const clinic = get(clinics, selectedClinicId);
  const isClinicAdmin = includes(get(clinic, ['clinicians', loggedInUserId, 'roles'], []), 'CLINIC_ADMIN');
  const isWorkspacePath = pathname.indexOf('/clinic-workspace') === 0;
  const [editing, setEditing] = useState(false);

  const clinicTypes = [
    { value: 'provider_practice', label: t('Provider Practice') },
    { value: 'healthcare_system', label: t('Healthcare System') },
    { value: 'other', label: t('Other') },
  ];

  const clinicSizes = [
    { value: '0-249', label: t('0-249') },
    { value: '250-499', label: t('250-499') },
    { value: '500-999', label: t('500-999') },
    { value: '1000+', label: t('1000+') },
  ];

  const selectCountries = sortBy(
    map(countries.getNames('en'), (val, key) => ({
      value: key,
      label: t(val),
    })),
    'label'
  );

  const validationSchema = yup.object().shape({
    name: yup.string().required(t('Please enter an organization name')),
    address: yup.string().required(t('Please enter an address')),
    city: yup.string().required(t('Please enter a city')),
    state: yup.string().required(t('Please enter a state')),
    postalCode: yup.string().required(t('Please enter a zip code')),
    country: yup
      .string()
      .oneOf(keys(countries.getAlpha2Codes()))
      .required(t('Please enter a country')),
    phoneNumbers: yup.array().of(
      yup.object().shape({
        type: yup.string().required(),
        number: yup
          .string()
          .matches(phoneRegex, t('Please enter a valid phone number'))
          .required(t('Patient phone number is required')),
      }),
    ),
    clinicType: yup
      .string()
      .oneOf(map(clinicTypes, 'value'))
      .required(t('Please select a clinic type')),
    clinicSize: yup
      .string()
      .oneOf(map(clinicSizes, 'value'))
      .required(t('Please select an organization size')),
    website: yup.string(),
  });

  const navigationAction = {
    label: isWorkspacePath ? t('View Clinic Members'): t('View Patient List'),
    action: () => dispatch(push(isWorkspacePath ? '/clinic-admin' : '/clinic-workspace')),
  };

  const clinicValues = () => ({
    name: get(clinic, 'name', ''),
    address: get(clinic, 'address', ''),
    city: get(clinic, 'city', ''),
    state: get(clinic, 'state', ''),
    postalCode: get(clinic, 'postalCode', ''),
    country: get(clinic, 'country', ''),
    phoneNumbers: [
      {
        type: 'Office',
        number: get(clinic, 'phoneNumbers.0.number', ''),
      },
    ],
    clinicType: get(clinic, 'clinicType', ''),
    clinicSize: get(clinic, 'clinicSize', ''),
    website: get(clinic, 'website', ''),
  });

  const formikContext = useFormik({
    initialValues: clinicValues(),
    onSubmit: (values, ctx) => {
      trackMetric('Clinic - Profile updated');
      dispatch(actions.async.updateClinic(api, clinic.id, values));
    },
    validationSchema,
  });

  const {
    handleSubmit,
    isSubmitting,
    setSubmitting,
    setValues,
    values,
  } = formikContext;

  useEffect(() => {
    if (clinic) {
      setValues(clinicValues())
    }
  }, [clinic])

  useEffect(() => {
    const { inProgress, completed, notification } = updatingClinic;

    if (!isFirstRender && !inProgress) {
      if (completed) {
        setToast({
          message: t('Clinic profile updated.'),
          variant: 'success',
        });

        closeClinicEdit()
      }

      if (completed === false) {
        setToast({
          message: get(notification, 'message'),
          variant: 'danger',
        });
      }
    }
  }, [updatingClinic]);

  function closeClinicEdit() {
    setEditing(false);
    setSubmitting(false);
    setValues(clinicValues());
  };

  if (!clinic) return null;

  return (
    <Box
      variant="containers.largeBordered"
      mb={4}
      {...boxProps}
    >
      <Flex
        id="clinic-profile-header"
        sx={{ borderBottom: baseTheme.borders.default }}
        alignItems={'center'}
      >
        <Title p={4} pr={4} flexGrow={1}>
          {t('Clinic Profile')}
        </Title>
        <Box>
          <Button
            mr={4}
            variant="textPrimary"
            onClick={navigationAction.action}
          >
            {navigationAction.label}
          </Button>
        </Box>
      </Flex>

      {!editing && (
        <Flex px={4} py={3} justifyContent="space-between" alignItems="center">
          <Flex>
            <Box mr={6}>
              <Caption color="grays.4">{t('Clinic Name')}</Caption>
              <Title>{clinic.name}</Title>
            </Box>
            <Box>
              <Caption color="grays.4">{t('Clinic Share Code')}</Caption>
              <Flex
                sx={{
                  button: {
                    border: 'none',
                    color: 'text.primary',
                    paddingTop: '.125em',
                    '&:hover,&:active': {
                      border: 'none',
                      color: 'text.primary',
                      backgroundColor: 'transparent',
                    },
                  },
                  '.success': {
                    padding: '.175em 0 0',
                    display: 'block',
                    fontSize: '1.5em',
                    textAlign: 'center',
                    lineHeight: '1.125em',
                  },
                }}
              >
                <Title>{clinic.shareCode}</Title>
                <ClipboardButton
                  buttonTitle={t('Copy Share Code')}
                  buttonText={(
                    <Icon
                      variant="button"
                      icon={FileCopyRoundedIcon}
                      label={t('Copy Share Code')}
                      title={t('Copy Share Code')}
                    />
                  )}
                  successText={<span className="success">{t('✓')}</span>}
                  onClick={() => {
                    trackMetric('Clicked Copy Therapy Settings Order')
                  }}
                  getText={() => clinic.shareCode}
                />
              </Flex>
            </Box>
          </Flex>

          {isClinicAdmin && (
            <Box>
              <Button
                variant="textSecondary"
                onClick={() => setEditing(true)}
                icon={EditRoundedIcon}
                iconPosition='left'
                fontSize={1}
              >
                {t('Edit Clinic Profile')}
              </Button>
            </Box>
          )}
        </Flex>
      )}

      {editing && (
        <Box
          as="form"
          id="clinic-profile-update"
          onSubmit={handleSubmit}
        >
          <Box p={4}>
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
                    name="values.phoneNumbers.0.number"
                    label={t('Phone Number')}
                    variant="condensed"
                    width="100%"
                  />
                </InputMask>
              </Box>

              <Box pr={[0,3]} mb={4} flexBasis={['100%', '50%']}>
                <Select
                  {...getCommonFormikFieldProps('country', formikContext)}
                  options={selectCountries}
                  label={t('Country')}
                  placeholder={t('Country')}
                  variant="condensed"
                  themeProps={{
                    width: '100%',
                  }}
                />
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

              <Box pl={[0,3]} mb={4} flexBasis={['100%', '50%']}>
                <TextInput
                  {...getCommonFormikFieldProps('state', formikContext)}
                  label={t('State')}
                  placeholder={t('State')}
                  variant="condensed"
                  width="100%"
                />
              </Box>

              <Box pr={[0,3]} mb={4} flexBasis={['100%', '50%']}>
                <TextInput
                  {...getCommonFormikFieldProps('postalCode', formikContext)}
                  label={t('Zip Code')}
                  placeholder={t('Zip Code')}
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
            </Flex>
          </Box>
          <Flex
            justifyContent={['center', 'flex-end']}
            id="clinic-profile-footer"
            sx={{ borderTop: baseTheme.borders.default }}
            alignItems={'center'}
            py={4}
          >
            <Button id="cancel" variant="secondary" onClick={closeClinicEdit}>
              {t('Cancel')}
            </Button>

            <Button
              id="submit"
              type="submit"
              variant="primary"
              ml={2}
              mr={[0, 4]}
              processing={isSubmitting}
              disabled={!fieldsAreValid(keys(clinicValues()), validationSchema, values)}
            >
              {t('Save Profile')}
            </Button>
          </Flex>
        </Box>
      )}
    </Box>
  );
};

ClinicProfile.propTypes = {
  ...BoxProps,
  api: PropTypes.object.isRequired,
  t: PropTypes.func.isRequired,
  trackMetric: PropTypes.func.isRequired,
};

export default translate()(ClinicProfile);
