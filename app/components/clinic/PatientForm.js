import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import get from 'lodash/get'
import isEmpty from 'lodash/isEmpty'
import omitBy from 'lodash/omitBy'
import { useFormik } from 'formik';
import InputMask from 'react-input-mask';
import { Box, BoxProps } from 'rebass/styled-components';

import * as actions from '../../redux/actions';
import TextInput from '../../components/elements/TextInput';
import Checkbox from '../../components/elements/Checkbox';
import { getCommonFormikFieldProps } from '../../core/forms';
import { dateRegex, patientSchema as validationSchema } from '../../core/clinicUtils';
import { accountInfoFromClinicPatient } from '../../core/personutils';
import { Body1 } from '../../components/elements/FontStyles';
import baseTheme from '../../themes/baseTheme';

export const PatientForm = (props) => {
  const { t, api, onFormChange, patient, trackMetric, ...boxProps } = props;
  const dispatch = useDispatch();
  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);
  const dateInputFormat = 'MM/DD/YYYY';
  const dateMaskFormat = dateInputFormat.replace(/[A-Z]/g, '9');
  const [initialValues, setInitialValues] = useState({});

  const formikContext = useFormik({
    initialValues: getFormValues(patient),
    onSubmit: values => {
      const action = patient?.id ? 'edit' : 'create';
      const context = selectedClinicId ? 'clinic' : 'vca';

      const actionMap = {
        edit: {
          clinic: {
            handler: 'updateClinicPatient',
            args: () => [selectedClinicId, patient.id, omitBy({ ...patient, ...getFormValues(values) }, isEmpty)],
          },
          vca: {
            handler: 'updatePatient',
            args: () => [accountInfoFromClinicPatient(omitBy({ ...patient, ...getFormValues(values) }, isEmpty))],
          },
        },
        create: {
          clinic: {
            handler: 'createClinicCustodialAccount',
            args: () => [selectedClinicId, omitBy(values, isEmpty)],
          },
          vca: {
            handler: 'createVCACustodialAccount',
            args: () => [accountInfoFromClinicPatient(omitBy(values, isEmpty)).profile],
          },
        }
      }

      if (!initialValues.email && values.email) {
        trackMetric(`${selectedClinicId ? 'Clinic' : 'Clinician'} - add patient email saved`);
      }

      dispatch(actions.async[actionMap[action][context].handler](api, ...actionMap[action][context].args()));
    },
    validationSchema,
  });

  const {
    values,
    setValues,
  } = formikContext;

  function getFormValues(source) {
    return {
      attestationSubmitted: get(source, 'attestationSubmitted', false),
      birthDate: get(source, 'birthDate', ''),
      email: get(source, 'email', ''),
      fullName: get(source, 'fullName', ''),
      id: get(source, 'id'),
      mrn: get(source, 'mrn', ''),
    };
  }

  useEffect(() => {
    // set form field values and store initial patient values on patient load
    const patientValues = getFormValues(patient);
    setValues(patientValues);
    setInitialValues(patientValues);
  }, [patient]);

  useEffect(() => {
    onFormChange(formikContext);
  }, [values]);

  return (
    <Box
      as="form"
      id="clinic-patient-form"
    >
      <Box mb={4}>
        <TextInput
          {...getCommonFormikFieldProps('fullName', formikContext)}
          label={t('Full Name')}
          placeholder={t('Full Name')}
          variant="condensed"
          width="100%"
        />
      </Box>

      <Box mb={4}>
        <InputMask
          mask={dateMaskFormat}
          maskPlaceholder={dateInputFormat.toLowerCase()}
          {...getCommonFormikFieldProps('birthDate', formikContext)}
          value={get(values, 'birthDate', '').replace(dateRegex, '$2/$3/$1')}
          onChange={e => {
            formikContext.setFieldValue('birthDate', e.target.value.replace(dateRegex, '$3-$1-$2'), e.target.value.length === 10);
          }}
          onBlur={e => {
            formikContext.setFieldTouched('birthDate');
            formikContext.setFieldValue('birthDate', e.target.value.replace(dateRegex, '$3-$1-$2'));
          }}
        >
          <TextInput
            name="birthDate"
            label={t('Birthdate')}
            placeholder={dateInputFormat.toLowerCase()}
            variant="condensed"
            width="100%"
          />
        </InputMask>
      </Box>

      <Box mb={4}>
        <TextInput
          {...getCommonFormikFieldProps('mrn', formikContext)}
          label={t('MRN (optional)')}
          placeholder={t('MRN')}
          variant="condensed"
          width="100%"
        />
      </Box>

      <Box mb={4}>
        <TextInput
          {...getCommonFormikFieldProps('email', formikContext)}
          label={t('Email (optional)')}
          placeholder={t('Email')}
          variant="condensed"
          width="100%"
        />
      </Box>

      <Body1>
        {t('If you want your patients to upload their data from home, you must include their email address.')}
      </Body1>

      {!patient?.id && (
        <Box
          p={2}
          mt={3}
          mb={2}
          bg="lightestGrey"
          sx={{
            border: baseTheme.borders.default,
            borderRadius: `${baseTheme.radii.default}px`,
          }}
        >
          <Checkbox
            {...getCommonFormikFieldProps('attestationSubmitted', formikContext, 'checked')}
            label={t('I attest that I have obtained permission from the patient and/or the patient\'s legal guardian to use Tidepool\'s software to assist in the management of the patient\'s health care.')}
            themeProps={{ bg: 'lightestGrey', lineHeight: 1.4 }}
          />
        </Box>
      )}
    </Box>
  );
};

PatientForm.propTypes = {
  ...BoxProps,
  api: PropTypes.object.isRequired,
  onFormChange: PropTypes.func.isRequired,
  patient: PropTypes.object,
  t: PropTypes.func.isRequired,
  trackMetric: PropTypes.func.isRequired,
};

export default translate()(PatientForm);
