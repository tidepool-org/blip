import React, { useEffect, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import get from 'lodash/get';
import includes from 'lodash/includes';
import isEmpty from 'lodash/isEmpty';
import keyBy from 'lodash/keyBy';
import map from 'lodash/map';
import omitBy from 'lodash/omitBy';
import reject from 'lodash/reject';
import without from 'lodash/without';
import { useFormik } from 'formik';
import InputMask from 'react-input-mask';
import CloseRoundedIcon from '@material-ui/icons/CloseRounded';
import { Box, Text, BoxProps } from 'rebass/styled-components';

import * as actions from '../../redux/actions';
import TextInput from '../../components/elements/TextInput';
import { TagList } from '../../components/elements/Tag';
import { getCommonFormikFieldProps } from '../../core/forms';
import { dateRegex, patientSchema as validationSchema } from '../../core/clinicUtils';
import { accountInfoFromClinicPatient } from '../../core/personutils';
import { Body1 } from '../../components/elements/FontStyles';
import { borders } from '../../themes/baseTheme';

function getFormValues(source) {
  return {
    birthDate: get(source, 'birthDate', ''),
    email: get(source, 'email', ''),
    fullName: get(source, 'fullName', ''),
    mrn: get(source, 'mrn', ''),
    tags: get(source, 'tags', []),
  };
}

function emptyValuesFilter(value, key) {
  // We want to allow sending an empty `tags` array. Otherwise, strip empty fields from payload.
  return key !== 'tags' && isEmpty(value);
}

export const PatientForm = (props) => {
  const { t, api, onFormChange, patient, trackMetric, ...boxProps } = props;
  const dispatch = useDispatch();
  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);
  const clinic = useSelector(state => state.blip.clinics[selectedClinicId]);
  const dateInputFormat = 'MM/DD/YYYY';
  const dateMaskFormat = dateInputFormat.replace(/[A-Z]/g, '9');
  const [initialValues, setInitialValues] = useState({});
  const showTags = clinic?.tier >= 'tier0200' && !!clinic?.patientTags?.length;
  const clinicPatientTags = useMemo(() => keyBy(clinic?.patientTags, 'id'), [clinic?.patientTags]);

  const formikContext = useFormik({
    initialValues: getFormValues(patient),
    onSubmit: values => {
      const action = patient?.id ? 'edit' : 'create';
      const context = selectedClinicId ? 'clinic' : 'vca';

      const actionMap = {
        edit: {
          clinic: {
            handler: 'updateClinicPatient',
            args: () => [selectedClinicId, patient.id, omitBy({ ...patient, ...getFormValues(values) }, emptyValuesFilter)],
          },
          vca: {
            handler: 'updatePatient',
            args: () => [accountInfoFromClinicPatient(omitBy({ ...patient, ...getFormValues(values) }, emptyValuesFilter))],
          },
        },
        create: {
          clinic: {
            handler: 'createClinicCustodialAccount',
            args: () => [selectedClinicId, omitBy(values, emptyValuesFilter)],
          },
          vca: {
            handler: 'createVCACustodialAccount',
            args: () => [accountInfoFromClinicPatient(omitBy(values, emptyValuesFilter)).profile],
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
    setFieldValue,
    setValues,
    values,
  } = formikContext;

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
      {...boxProps}
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
          disabled={patient?.id && !patient?.permissions?.custodian}
        />
      </Box>

      <Body1>
        {t('If you want your patients to upload their data from home, you must include their email address.')}
      </Body1>

      {showTags && (
        <Box
          mt={3}
          pt={3}
          sx={{
            borderTop: borders.divider,
          }}
        >
          <Box mb={1} fontSize={0} fontWeight="medium">
            <Text>{t('Assigned Patient Tags')}</Text>
            <TagList
              tags={map(values.tags, tagId => clinicPatientTags[tagId])}
              tagProps={{
                onClick: tagId => {
                  setFieldValue('tags', without(values.tags, tagId));
                },
                icon: CloseRoundedIcon,
                iconFontSize: 1,
                color: 'white',
                backgroundColor: 'purpleMedium',
              }}
            />
          </Box>

          <Box alignItems="center" mb={1} fontSize={0} fontWeight="medium" >
            <Text>{t('Available Patient Tags')}</Text>
            <TagList
              tags={map(reject(clinic?.patientTags, ({ id }) => includes(values.tags, id)), ({ id }) => clinicPatientTags?.[id])}
              tagProps={{
                onClick: tagId => {
                  setFieldValue('tags', [...values.tags, tagId]);
                },
              }}
            />
          </Box>
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
