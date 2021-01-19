import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { translate } from 'react-i18next';
import * as yup from 'yup';
import map from 'lodash/map';
import keys from 'lodash/keys';
import sortBy from 'lodash/sortBy';
import pick from 'lodash/pick';
import { Formik, Form, FastField } from 'formik';
import InputMask from 'react-input-mask';
import { Box, Flex } from 'rebass/styled-components';
import countries from 'i18n-iso-countries';
import { phoneRegex } from '../prescription/prescriptionFormConstants';
import { Body1, Body2, Headline } from '../../components/elements/FontStyles';
import TextInput from '../../components/elements/TextInput';
import RadioGroup from '../../components/elements/RadioGroup';
import Select from '../../components/elements/Select';
import Checkbox from '../../components/elements/Checkbox';
import Button from '../../components/elements/Button';
import * as actions from '../../redux/actions';
import i18next from '../../core/language';

const t = i18next.t.bind(i18next);
countries.registerLocale(require('i18n-iso-countries/langs/en.json'));

const roles = [
  { value: 'clinic_manager', label: t('Clinic Manager') },
  { value: 'diabetes_educator', label: t('Diabetes Educator') },
  { value: 'endocrinologist', label: t('Endocrinologist') },
  { value: 'front_desk', label: t('Front Desk') },
  { value: 'information_technology', label: t('IT/Technology') },
  { value: 'medical_assistant', label: t('Medical Assistant') },
  { value: 'nurse', label: t('Nurse/Nurse Practitioner') },
  { value: 'primary_care_physician', label: t('Primary Care Physician') },
  { value: 'physician_assistant', label: t('Physician Assistant') },
  { value: 'pharmacist', label: t('Pharmacist') },
  { value: 'health_student', label: t('Health Professions Student') },
  { value: 'other', label: t('Other') },
];

const clinicTypes = [
  { value: 'provider_practice', label: t('Provider Practice') },
  { value: 'healthcare_system', label: t('Healthcare System') },
  { value: 'other', label: t('Other') },
];

const clinicSizes = [
  { value: '0', label: t('0-249') },
  { value: '250', label: t('250-499') },
  { value: '500', label: t('500-999') },
  { value: '1000', label: t('1000+') },
];

const selectCountries = sortBy(
  map(countries.getNames('en'), (val, key) => ({
    value: key,
    label: t(val),
  })),
  'label'
);

const clinicSchema = yup.object().shape({
  firstName: yup.string().required(t('First name is required')),
  lastName: yup.string().required(t('Last name is required')),
  role: yup.string().oneOf(map(roles, 'value')).required(),
  npi: yup
    .string()
    .length(10, t('NPI must be 10 digits'))
    .matches(/^\d+$/, t('NPI must be 10 digits')),
  clinicType: yup
    .string()
    .oneOf(map(clinicTypes, 'value'))
    .required(t('Please select a clinic type')),
  clinicSize: yup
    .string()
    .oneOf(map(clinicSizes, 'value'))
    .required(t('Please select an organization size')),
  country: yup
    .string()
    .oneOf(keys(countries.getAlpha2Codes()))
    .required(t('Please enter a country')),
  orgName: yup.string().required(t('Please enter an organization name')),
  phoneNumber: yup
    .string()
    .matches(phoneRegex, t('Please enter a valid phone number'))
    .required(t('Patient phone number is required')),
  // TODO: investigate address autocomplete API
  address1: yup.string().required(t('Please enter an address')),
  address2: yup.string(),
  city: yup.string().required(t('Please enter a city')),
  state: yup.string().required(t('Please enter a state')),
  zip: yup.string().required(t('Please enter a zip code')),
  website: yup.string(),
  adminAcknowledge: yup
    .bool()
    .oneOf([true], t('You must acknowledge admin role')),
});

const inputStyles = {
  themeProps: { width: [1, 0.75, 0.5], py: 2, pr: [0, 0, 4] },
};

export const ClinicDetails = (props) => {
  const { t, api, trackMetric } = props;
  const dispatch = useDispatch();

  useEffect(() => {
    if (trackMetric) {
      trackMetric('Web - Clinic Details Setup');
    }
  }, []);

  return (
    <Box mx={'auto'} my={2} p={4} bg="white" width={[1, 0.75, 0.75, 0.5]}>
      <Formik
        initialValues={{
          firstName: '',
          lastName: '',
          role: roles[0].value,
          npi: '',
          clinicType: '',
          clinicSize: '',
          country: 'US',
          orgName: '',
          phoneNumber: '',
          address1: '',
          address2: '',
          city: '',
          state: '',
          zip: '',
          website: '',
          adminAcknowledge: false,
        }}
        validationSchema={clinicSchema}
        onSubmit={(values) => {
          const address =
            values.address1 + (values.address2 ? ' ' + values.address2 : '');
          const meta = pick(values, ['website']);
          const newClinic = {
            name: values.orgName,
            address,
            postalCode: values.zip,
            city: values.city,
            country: values.country,
            phoneNumbers: [
              {
                type: 'Office',
                number: values.phoneNumber,
              },
            ],
            clinicType: values.clinicType,
            clinicSize: parseInt(values.clinicSize, 10),
            meta,
          };
          const profileUpdates = {
            fullName: `${values.firstName} ${values.lastName}`,
            profile: {
              fullName: `${values.firstName} ${values.lastName}`,
              clinic: {
                role: values.role,
              },
            },
          };
          if (values.npi) {
            profileUpdates.clinic.npi = values.npi;
          }
          dispatch(actions.async.updateUser(api, profileUpdates));
          dispatch(actions.async.createClinic(api, newClinic));
        }}
      >
        {({ errors, touched, setFieldTouched, setFieldValue, values }) => (
          <Form>
            <Flex flexWrap={'wrap'} mb={5}>
              <FastField
                as={TextInput}
                id="firstName"
                name="firstName"
                label={t('First Name')}
                placeholder={t('First Name')}
                error={touched.firstName && errors.firstName}
                {...inputStyles}
              />
              <FastField
                as={TextInput}
                id="lastName"
                name="lastName"
                label={t('Last Name')}
                placeholder={t('Last Name')}
                error={touched.lastName && errors.lastName}
                {...inputStyles}
              />
              <FastField
                as={Select}
                id="role"
                name="role"
                label={t('Role')}
                options={roles}
                error={touched.role && errors.role}
                {...inputStyles}
              />
              <FastField
                as={TextInput}
                id="npi"
                name="npi"
                label={t('NPI (Optional)')}
                placeholder={t('NPI')}
                error={touched.npi && errors.npi}
                {...inputStyles}
              />
            </Flex>
            <Headline mb={4}>More about your clinic</Headline>
            <Body1 mb={4}>
              The information below will be displayed along with your name when
              you invite patients to connect and share their data remotely.
              Please ensure you have the correct clinic information for their
              verification.
            </Body1>
            <Body2 mb={3}>
              {t('What is the type of organization you are a part of?')}
            </Body2>
            <FastField
              mb={3}
              as={RadioGroup}
              variant="vertical"
              id="clinicType"
              name="clinicType"
              options={clinicTypes}
              error={touched.clinicType && errors.clinicType}
            />
            <Body2 mb={3}>
              {t('How many patients does your clinic practice see?')}
            </Body2>
            <FastField
              mb={3}
              as={RadioGroup}
              variant="vertical"
              id="clinicSize"
              name="clinicSize"
              options={clinicSizes}
              error={touched.clinicSize && errors.clinicSize}
            />
            <FastField
              as={Select}
              id="country"
              name="country"
              label={t('Country')}
              error={touched.country && errors.country}
              options={selectCountries}
              {...inputStyles}
            />
            <Flex flexWrap={'wrap'} mb={5}>
              <FastField
                as={TextInput}
                id="orgName"
                name="orgName"
                label={t('Organization Name')}
                placeholder={t('Organization Name')}
                error={touched.orgName && errors.orgName}
                {...inputStyles}
              />
              <FastField
                as={({ innerRef }) => (
                  <InputMask
                    mask="(999) 999-9999"
                    alwaysShowMask
                    defaultValue={values.phoneNumber}
                    onBlur={(e) => {
                      setFieldTouched('phoneNumber', true);
                      setFieldValue('phoneNumber', e.target.value);
                    }}
                  >
                    <TextInput
                      name="phoneNumber"
                      id="phoneNumber"
                      label={t('Phone Number')}
                      error={touched.phoneNumber && errors.phoneNumber}
                      {...inputStyles}
                      innerRef={innerRef}
                    />
                  </InputMask>
                )}
              />
              <FastField
                as={TextInput}
                id="address1"
                name="address1"
                label={t('Address Line 1')}
                placeholder={t('Address Line 1')}
                error={touched.address1 && errors.address1}
                {...inputStyles}
              />
              <FastField
                as={TextInput}
                id="address2"
                name="address2"
                label={t('Address Line 2')}
                placeholder={t('Address Line 2')}
                error={touched.address2 && errors.address2}
                {...inputStyles}
              />
              <FastField
                as={TextInput}
                id="city"
                name="city"
                label={t('City')}
                placeholder={t('City')}
                error={touched.city && errors.city}
                {...inputStyles}
              />
              <FastField
                as={TextInput}
                id="state"
                name="state"
                label={t('State')}
                placeholder={t('State')}
                error={touched.state && errors.state}
                {...inputStyles}
              />
              <FastField
                as={TextInput}
                id="zip"
                name="zip"
                label={t('Zip Code')}
                placeholder={t('Postal Code')}
                error={touched.zip && errors.zip}
                {...inputStyles}
              />
              <FastField
                as={TextInput}
                id="website"
                name="website"
                label={t('Website')}
                error={touched.website && errors.website}
                {...inputStyles}
              />
            </Flex>
            <FastField
              as={Checkbox}
              id="adminAcknowledge"
              name="adminAcknowledge"
              label={t(
                'By creating this clinic, your Tidepool account will become the default administrator. You can invite other healthcare professionals to join the clinic and add or remove privileges for these accounts at any time.'
              )}
              error={touched.adminAcknowledge && errors.adminAcknowledge}
              checked={values.adminAcknowledge}
            />
            <Button type={'submit'} mt={3}>
              Submit
            </Button>
          </Form>
        )}
      </Formik>
    </Box>
  );
};

ClinicDetails.propTypes = {
  api: PropTypes.object.isRequired,
  trackMetric: PropTypes.func.isRequired,
};

export default translate()(ClinicDetails);
