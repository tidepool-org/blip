import React, { useEffect, useState, useMemo, useCallback, useRef } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import compact from 'lodash/compact';
import debounce from 'lodash/debounce';
import get from 'lodash/get';
import includes from 'lodash/includes';
import isEmpty from 'lodash/isEmpty';
import keyBy from 'lodash/keyBy';
import map from 'lodash/map';
import omitBy from 'lodash/omitBy';
import pick from 'lodash/pick';
import reject from 'lodash/reject';
import { useFormik } from 'formik';
import InputMask from 'react-input-mask';
import { Box, BoxProps } from 'theme-ui';

import * as actions from '../../../redux/actions';
import TextInput from '../../../components/elements/TextInput';
import { getCommonFormikFieldProps } from '../../../core/forms';
import { useInitialFocusedInput, usePrevious } from '../../../core/hooks';
import { dateRegex, patientSchema as validationSchema } from '../../../core/clinicUtils';
import { accountInfoFromClinicPatient } from '../../../core/personutils';
import { Body0 } from '../../../components/elements/FontStyles';
import { MediumTitle } from '../../../components/elements/FontStyles';

import { utils as vizUtils } from '@tidepool/viz';
const { GLYCEMIC_RANGES_PRESET } = vizUtils.constants;

import SelectDiabetesType from './SelectDiabetesType';
import SelectGlycemicRanges from './SelectGlycemicRanges';
import SelectTags from './SelectTags';
import SelectSites from './SelectSites';

export function getFormValues(source, clinicPatientTags, clinicSites) {
  return {
    birthDate: source?.birthDate || '',
    email: source?.email || '',
    fullName: source?.fullName || '',
    mrn: source?.mrn || '',
    tags: reject(source?.tags || [], tagId => !clinicPatientTags?.[tagId]),
    dataSources: source?.dataSources || [],
    sites: source?.sites?.filter(site => !!clinicSites[site.id]) || [],
    diagnosisType: source?.diagnosisType || null,
    glycemicRanges: source?.glycemicRanges || GLYCEMIC_RANGES_PRESET.ADA_STANDARD,
  };
}

export function emptyValuesFilter(value, key) {
  // We want to allow sending an empty `tags` and `sites` arrays. Otherwise, strip empty fields from payload.
  return !includes(['tags', 'sites'], key) && isEmpty(value);
}

export const PatientForm = (props) => {
  const {
    t,
    action,
    api,
    invite,
    onFormChange,
    patient,
    trackMetric,
    searchDebounceMs,
    initialFocusedInput = 'fullName',
    ...boxProps
  } = props;

  const dispatch = useDispatch();
  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);
  const clinic = useSelector(state => state.blip.clinics?.[selectedClinicId]);
  const mrnSettings = clinic?.mrnSettings ?? {};

  const existingMRNs = useSelector(state => state.blip.clinicMRNsForPatientFormValidation)?.filter(mrn => mrn !== patient?.mrn) || [];

  const dateInputFormat = 'MM/DD/YYYY';
  const dateMaskFormat = dateInputFormat.replace(/[A-Z]/g, '9');
  const [initialValues, setInitialValues] = useState({});

  const hasSummaryDashboard = clinic?.entitlements?.summaryDashboard;
  const showTags = clinic?.entitlements?.patientTags && !!clinic?.patientTags?.length;
  const showSites = clinic?.entitlements?.clinicSites && !!clinic?.sites?.length;
  const showDiabetesType = !!selectedClinicId; // hide in private workspace
  const showGlycemicRanges = !!selectedClinicId; // hide in private workspace

  const clinicPatientTags = useMemo(() => keyBy(clinic?.patientTags, 'id'), [clinic?.patientTags]);
  const clinicSites = useMemo(() => keyBy(clinic?.sites, 'id'), [clinic?.sites]);
  const showEmail = action !== 'acceptInvite';
  const { fetchingClinicMRNsForPatientFormValidation } = useSelector((state) => state.blip.working);
  const [patientFetchOptions, setPatientFetchOptions] = useState({});
  const loggedInUserId = useSelector((state) => state.blip.loggedInUserId);
  const previousFetchingClinicMRNsForPatientFormValidation = usePrevious(fetchingClinicMRNsForPatientFormValidation);
  const previousFetchOptions = usePrevious(patientFetchOptions);
  const initialFocusedInputRef = useInitialFocusedInput();
  const tagSectionRef = useRef(null);
  const siteSectionRef = useRef(null);
  const diagnosisTypeSectionRef = useRef(null);
  const targetRangePresetSectionRef = useRef(null);

  const formikContext = useFormik({
    initialValues: getFormValues(patient, clinicPatientTags, clinicSites),
    initialStatus: { showDataConnectionsModalNext: false },
    onSubmit: (values, formikHelpers) => {
      const context = selectedClinicId ? 'clinic' : 'vca';

      const actionMap = {
        edit: {
          clinic: {
            handler: 'updateClinicPatient',
            args: () => [selectedClinicId, patient.id, omitBy({ ...patient, ...getFormValues(values, clinicPatientTags, clinicSites) }, emptyValuesFilter)],
          },
          vca: {
            handler: 'updatePatient',
            args: () => [accountInfoFromClinicPatient(omitBy({ ...patient, ...getFormValues(values, clinicPatientTags, clinicSites) }, emptyValuesFilter))],
          },
        },
        create: {
          clinic: {
            handler: 'createClinicCustodialAccount',
            args: () => [selectedClinicId, omitBy(getFormValues(values, clinicPatientTags, clinicSites), emptyValuesFilter)],
          },
          vca: {
            handler: 'createVCACustodialAccount',
            args: () => [accountInfoFromClinicPatient(omitBy(values, emptyValuesFilter)).profile],
          },
        },
        acceptInvite: {
          clinic: {
            handler: 'acceptPatientInvitation',
            args: () => [selectedClinicId, invite.key, invite.creatorId, omitBy(
              pick(getFormValues(values, clinicPatientTags, clinicSites), ['mrn', 'birthDate', 'fullName', 'tags', 'sites', 'diagnosisType', 'glycemicRanges']),
              emptyValuesFilter
            )],
          },
        }
      }

      if (!initialValues.email && values.email) {
        trackMetric(`${selectedClinicId ? 'Clinic' : 'Clinician'} - add patient email saved`);
      }

      const handlerArgs = actionMap[action][context].args();

      if (context === 'clinic' && action === 'create' && clinic?.country === 'US') {
        formikHelpers.setStatus({ showDataConnectionsModalNext: true, newPatient: handlerArgs[1] });
      }

      dispatch(actions.async[actionMap[action][context].handler](api, ...handlerArgs));
    },
    validationSchema: validationSchema({mrnSettings, existingMRNs}),
  });

  const {
    setFieldValue,
    setValues,
    status,
    values,
  } = formikContext;

  // Fetchers
  useEffect(() => {
    if (
      loggedInUserId &&
      clinic?.id &&
      !fetchingClinicMRNsForPatientFormValidation.inProgress &&
      !isEmpty(patientFetchOptions) &&
      !(patientFetchOptions === previousFetchOptions)
    ) {
      const fetchOptions = { ...patientFetchOptions };
      if (isEmpty(fetchOptions.search)) {
        delete fetchOptions.search;
      }
      dispatch(
        actions.async.fetchClinicMRNsForPatientFormValidation(api, clinic.id, fetchOptions)
      );
    }
  }, [
    api,
    clinic,
    dispatch,
    fetchingClinicMRNsForPatientFormValidation,
    loggedInUserId,
    patientFetchOptions,
    previousFetchOptions
  ]);

  // revalidate form on patient fetch complete
  useEffect(() => {
    if (
      previousFetchingClinicMRNsForPatientFormValidation?.inProgress &&
      !fetchingClinicMRNsForPatientFormValidation.inProgress
    ) {
      formikContext.validateForm();
    }
  }, [
    fetchingClinicMRNsForPatientFormValidation.inProgress,
    formikContext,
    previousFetchingClinicMRNsForPatientFormValidation?.inProgress,
  ]);

  useEffect(() => {
    // set form field values and store initial patient values on patient load
    const patientValues = getFormValues(patient, clinicPatientTags, clinicSites);
    setValues(patientValues);
    setInitialValues(patientValues);
  }, [patient, clinicPatientTags]);

  useEffect(() => {
    onFormChange(formikContext);
  }, [values, clinicPatientTags, status]);

  // Pull the patient on load to ensure the most recent dexcom connection state is made available
  useEffect(() => {
    if ((action === 'edit') && selectedClinicId && patient?.id) fetchPatientDetails();
  }, []);

  function fetchPatientDetails() {
    dispatch(actions.async.fetchPatientFromClinic(api, selectedClinicId, patient.id));
  }

  const debounceSearch = useCallback(
    debounce((search) => {
      setPatientFetchOptions({
        ...patientFetchOptions,
        offset: 0,
        search,
      });
    }, searchDebounceMs),
    [patientFetchOptions]
  );

  function handleSearchChange(event) {
    debounceSearch(event.target.value);
  }

  function handleScrollToRef(ref) {
    // Wait for height modal to expand via CSS, then scroll down to enhance dropdown visibility
    setTimeout(() => ref?.current?.scrollIntoView(), 50);
  }

  return (
    <Box
      as="form"
      id="clinic-patient-form"
      sx={{
        minWidth: [null, '320px'],

        // When the select Tags or Sites dropdowns are open, expand the modal to give extra room
        '&:has(.PatientFormSelectDiabetesType__control--menu-is-open)': { paddingBottom: '24px' },
        '&:has(.PatientFormSelectGlycemicRanges__control--menu-is-open)': { paddingBottom: '24px' },
        '&:has(.PatientFormSelectTags__control--menu-is-open)': { paddingBottom: '162px' },
        '&:has(.PatientFormSelectSites__control--menu-is-open)': { paddingBottom: '242px' },
      }}
      {...boxProps}
    >
      <Box mb={2}>
        <MediumTitle sx={{ fontWeight: 'bold', fontSize: 2 }}>{t('Patient Details')}</MediumTitle>
      </Box>

      <Box mb={3}>
        <TextInput
          {...getCommonFormikFieldProps('fullName', formikContext)}
          innerRef={initialFocusedInput === 'fullName' ? initialFocusedInputRef : undefined}
          label={t('Full Name')}
          placeholder={t('Full Name')}
          variant="condensed"
          sx={{ width: '100%' }}
        />
      </Box>

      <Box mb={3}>
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
            innerRef={initialFocusedInput === 'birthDate' ? initialFocusedInputRef : undefined}
            label={t('Birthdate')}
            placeholder={dateInputFormat.toLowerCase()}
            variant="condensed"
            sx={{ width: '100%' }}
          />
        </InputMask>
      </Box>

      <Box mb={3}>
        <TextInput
          {...getCommonFormikFieldProps('mrn', formikContext)}
          innerRef={initialFocusedInput === 'mrn' ? initialFocusedInputRef : undefined}
          label={mrnSettings?.required ? t('MRN') : t('MRN (optional)')}
          placeholder={t('MRN')}
          variant="condensed"
          sx={{ width: '100%' }}
          width="100%"
          onChange={(e) => {
            handleSearchChange(e);
            formikContext.setFieldValue('mrn', e.target.value.toUpperCase());
          }}
          onBlur={(e) => {
            formikContext.setFieldTouched('mrn');
            formikContext.setFieldValue('mrn', e.target.value.toUpperCase());
          }}
        />
      </Box>

      {showEmail && (
        <>
          <Box mb={1}>
            <TextInput
              {...getCommonFormikFieldProps('email', formikContext)}
              innerRef={initialFocusedInput === 'email' ? initialFocusedInputRef : undefined}
              label={t('Email (optional)')}
              placeholder={t('Email')}
              variant="condensed"
              sx={{ width: '100%' }}
              disabled={patient?.id && !patient?.permissions?.custodian}
              />
          </Box>

          <Body0 mb={3}>
            {t('If you want your patients to upload their data from home, you must include their email address.')}
          </Body0>
        </>
      )}

      {showDiabetesType && (
        <Box ref={diagnosisTypeSectionRef} mb={3}>
          <SelectDiabetesType
            value={values.diagnosisType || ''}
            onChange={diagnosisType => setFieldValue('diagnosisType', diagnosisType)}
            onMenuOpen={() => handleScrollToRef(diagnosisTypeSectionRef)}
          />
        </Box>
      )}

      {showGlycemicRanges && (
        <Box ref={targetRangePresetSectionRef} mb={3}>
          <SelectGlycemicRanges
            value={values.glycemicRanges}
            onChange={glycemicRanges => setFieldValue('glycemicRanges', glycemicRanges)}
            onMenuOpen={() => handleScrollToRef(targetRangePresetSectionRef)}
          />

          <Body0 mb={3} mt={1}>
            { hasSummaryDashboard
              ? t('Target ranges follow ADA guidelines. Setting a non-standard range will be used when viewing patient data, but will not be available in the dashboard view.')
              : t('Target ranges follow ADA guidelines and will be used when viewing patient data.')
            }
          </Body0>
        </Box>
      )}

      {showTags && (
        <Box ref={tagSectionRef} mb={3}>
          <MediumTitle mb={2} sx={{ fontWeight: 'bold', fontSize: 2 }}>{t('Tags')}</MediumTitle>

          <SelectTags
            currentTagIds={values.tags || []}
            onChange={tagIds => setFieldValue('tags', tagIds)}
            onMenuOpen={() => handleScrollToRef(tagSectionRef)}
          />
        </Box>
      )}

      {showSites && (
        <Box ref={siteSectionRef} mb={3}>
          <MediumTitle mb={2} sx={{ fontWeight: 'bold', fontSize: 2 }}>{t('Sites')}</MediumTitle>

          <SelectSites
            currentSites={values.sites || []}
            onChange={sites => setFieldValue('sites', sites)}
            onMenuOpen={() => handleScrollToRef(siteSectionRef)}
          />
        </Box>
      )}
    </Box>
  );
};

PatientForm.propTypes = {
  ...BoxProps,
  api: PropTypes.object.isRequired,
  invite: PropTypes.object,
  onFormChange: PropTypes.func.isRequired,
  patient: PropTypes.object,
  t: PropTypes.func.isRequired,
  trackMetric: PropTypes.func.isRequired,
  searchDebounceMs: PropTypes.number.isRequired,
  initialFocusedInput: PropTypes.string,
  action: PropTypes.oneOf(['create', 'edit', 'acceptInvite']).isRequired,
};

PatientForm.defaultProps = {
  searchDebounceMs: 1000,
};

export default withTranslation()(PatientForm);
