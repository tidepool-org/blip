import React, { useEffect, useState, useMemo, useCallback } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import compact from 'lodash/compact';
import debounce from 'lodash/debounce';
import find from 'lodash/find';
import get from 'lodash/get';
import includes from 'lodash/includes';
import isEmpty from 'lodash/isEmpty';
import keyBy from 'lodash/keyBy';
import keys from 'lodash/keys';
import map from 'lodash/map';
import omitBy from 'lodash/omitBy';
import pick from 'lodash/pick';
import reject from 'lodash/reject';
import without from 'lodash/without';
import { useFormik } from 'formik';
import InputMask from 'react-input-mask';
import CloseRoundedIcon from '@material-ui/icons/CloseRounded';
import CheckCircleRoundedIcon from '@material-ui/icons/CheckCircleRounded';
import ErrorOutlineRoundedIcon from '@material-ui/icons/ErrorOutlineRounded';
import { Box, Flex, Text, BoxProps } from 'theme-ui';
import moment from 'moment';

import * as actions from '../../redux/actions';
import Checkbox from '../../components/elements/Checkbox';
import TextInput from '../../components/elements/TextInput';
import Button from '../../components/elements/Button';
import { TagList } from '../../components/elements/Tag';
import ResendDexcomConnectRequestDialog from './ResendDexcomConnectRequestDialog';
import { useToasts } from '../../providers/ToastProvider';
import { getCommonFormikFieldProps } from '../../core/forms';
import { useInitialFocusedInput, useIsFirstRender, usePrevious } from '../../core/hooks';
import { dateRegex, patientSchema as validationSchema } from '../../core/clinicUtils';
import { accountInfoFromClinicPatient } from '../../core/personutils';
import { Body0 } from '../../components/elements/FontStyles';
import { borders, colors, radii } from '../../themes/baseTheme';
import Icon from '../elements/Icon';
import DexcomLogoIcon from '../../core/icons/DexcomLogo.svg';
import PatientFormConnectionStatus from './PatientFormConnectionStatus'

function getFormValues(source, clinicPatientTags, disableDexcom) {
  const hasDexcomDataSource = !!find(source?.dataSources, { providerName: 'dexcom' });
  const connectDexcom = (hasDexcomDataSource || (!disableDexcom && source?.connectDexcom)) || false;
  const addDexcomDataSource = connectDexcom && !hasDexcomDataSource;

  return {
    birthDate: source?.birthDate || '',
    email: source?.email || '',
    fullName: source?.fullName || '',
    mrn: source?.mrn || '',
    tags: reject(source?.tags || [], tagId => !clinicPatientTags?.[tagId]),
    connectDexcom,
    dataSources: addDexcomDataSource ? [
      ...source?.dataSources || [],
      { providerName: 'dexcom', state: 'pending' },
    ] : source?.dataSources || [],
  };
}

function emptyValuesFilter(value, key) {
  // We want to allow sending an empty `tags` array. Otherwise, strip empty fields from payload.
  return !includes(['tags', 'connectDexcom'], key) && isEmpty(value);
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
  const isFirstRender = useIsFirstRender();
  const { set: setToast } = useToasts();
  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);
  const clinic = useSelector(state => state.blip.clinics?.[selectedClinicId]);
  const mrnSettings = clinic?.mrnSettings ?? {};
  const existingMRNs = useMemo(
    () => compact(map(reject(clinic?.patients, { id: patient?.id }), 'mrn')),
    [clinic?.patients, patient?.id]
  );
  const dateInputFormat = 'MM/DD/YYYY';
  const dateMaskFormat = dateInputFormat.replace(/[A-Z]/g, '9');
  const [initialValues, setInitialValues] = useState({});
  const showTags = clinic?.entitlements?.patientTags && !!clinic?.patientTags?.length;
  const clinicPatientTags = useMemo(() => keyBy(clinic?.patientTags, 'id'), [clinic?.patientTags]);
  const dexcomDataSource = find(patient?.dataSources, { providerName: 'dexcom' });
  const dexcomAuthInviteExpired = dexcomDataSource?.expirationTime < moment.utc().toISOString();
  const showConnectDexcom = action !== 'acceptInvite' && !!selectedClinicId && !dexcomDataSource;
  const showEmail = action !== 'acceptInvite';
  const [disableConnectDexcom, setDisableConnectDexcom] = useState(false);
  const showDexcomConnectState = !!selectedClinicId && !!dexcomDataSource?.state;
  const [showResendDexcomConnectRequest, setShowResendDexcomConnectRequest] = useState(false);
  const { sendingPatientDexcomConnectRequest, fetchingPatientsForClinic } = useSelector((state) => state.blip.working);
  const [patientFetchOptions, setPatientFetchOptions] = useState({});
  const loggedInUserId = useSelector((state) => state.blip.loggedInUserId);
  const previousFetchingPatientsForClinic = usePrevious(fetchingPatientsForClinic);
  const previousFetchOptions = usePrevious(patientFetchOptions);
  const initialFocusedInputRef = useInitialFocusedInput();

  const dexcomConnectStateUI = {
    pending: {
      color: 'mediumGrey',
      icon: ErrorOutlineRoundedIcon,
      label: t('Pending connection with'),
      showRegionalNote: true,
    },
    pendingReconnect: {
      color: 'mediumGrey',
      icon: ErrorOutlineRoundedIcon,
      label: t('Pending reconnection with'),
    },
    pendingExpired: {
      color: 'mediumGrey',
      icon: ErrorOutlineRoundedIcon,
      label: t('Pending connection expired with'),
      showRegionalNote: true,
    },
    connected: {
      color: 'brand.dexcom',
      icon: CheckCircleRoundedIcon,
      label: t('Connected with'),
    },
    disconnected: {
      color: 'mediumGrey',
      icon: ErrorOutlineRoundedIcon,
      label: t('Disconnected from'),
    },
    error: {
      color: 'feedback.danger',
      icon: ErrorOutlineRoundedIcon,
      label: t('Error connecting to'),
      showRegionalNote: true,
    },
    unknown: {
      color: 'mediumGrey',
      icon: ErrorOutlineRoundedIcon,
      label: t('Unknown connection to'),
      showRegionalNote: true,
    },
  };

  let dexcomConnectState = includes(keys(dexcomConnectStateUI), dexcomDataSource?.state)
    ? dexcomDataSource.state
    : 'unknown';

  if (includes(['pending', 'pendingReconnect'], dexcomConnectState) && dexcomAuthInviteExpired) dexcomConnectState = 'pendingExpired';

  const formikContext = useFormik({
    initialValues: getFormValues(patient, clinicPatientTags),
    onSubmit: (values, formikHelpers) => {
      const context = selectedClinicId ? 'clinic' : 'vca';

      const actionMap = {
        edit: {
          clinic: {
            handler: 'updateClinicPatient',
            args: () => [selectedClinicId, patient.id, omitBy({ ...patient, ...getFormValues(values, clinicPatientTags, disableConnectDexcom) }, emptyValuesFilter)],
          },
          vca: {
            handler: 'updatePatient',
            args: () => [accountInfoFromClinicPatient(omitBy({ ...patient, ...getFormValues(values, clinicPatientTags) }, emptyValuesFilter))],
          },
        },
        create: {
          clinic: {
            handler: 'createClinicCustodialAccount',
            args: () => [selectedClinicId, omitBy(getFormValues(values, clinicPatientTags, disableConnectDexcom), emptyValuesFilter)],
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
              pick(getFormValues(values, clinicPatientTags, disableConnectDexcom), ['mrn', 'birthDate', 'fullName', 'tags']),
              emptyValuesFilter
            )],
          },
        }
      }

      if (!initialValues.email && values.email) {
        trackMetric(`${selectedClinicId ? 'Clinic' : 'Clinician'} - add patient email saved`);
      }

      const emailUpdated = initialValues.email && values.email && (initialValues.email !== values.email);

      if (context === 'clinic' && values.connectDexcom && (!patient?.lastRequestedDexcomConnectTime || emailUpdated)) {
        const reason = emailUpdated ? 'email updated' : 'initial connection request';

        trackMetric('Clinic - Request dexcom connection for patient', {
          clinicId: selectedClinicId,
          reason,
          action,
        });

        formikHelpers.setStatus('sendingDexcomConnectRequest');
      }

      dispatch(actions.async[actionMap[action][context].handler](api, ...actionMap[action][context].args()));
    },
    validationSchema: validationSchema({mrnSettings, existingMRNs}),
  });

  const {
    errors,
    setFieldValue,
    setValues,
    status,
    values,
  } = formikContext;

  function handleAsyncResult(workingState, successMessage) {
    const { inProgress, completed, notification } = workingState;

    if (!isFirstRender && !inProgress) {
      if (completed) {
        // Close the resend email modal and refetch patient details to update the connection status
        setShowResendDexcomConnectRequest(false);
        fetchPatientDetails();

        setToast({
          message: successMessage,
          variant: 'success',
        });
      }

      if (completed === false) {
        setToast({
          message: get(notification, 'message'),
          variant: 'danger',
        });
      }
    }
  }

  // Fetchers
  useEffect(() => {
    if (
      loggedInUserId &&
      clinic?.id &&
      !fetchingPatientsForClinic.inProgress &&
      !isEmpty(patientFetchOptions) &&
      !(patientFetchOptions === previousFetchOptions)
    ) {
      const fetchOptions = { ...patientFetchOptions };
      if (isEmpty(fetchOptions.search)) {
        delete fetchOptions.search;
      }
      dispatch(
        actions.async.fetchPatientsForClinic(api, clinic.id, fetchOptions)
      );
    }
  }, [
    api,
    clinic,
    dispatch,
    fetchingPatientsForClinic,
    loggedInUserId,
    patientFetchOptions,
    previousFetchOptions
  ]);

  // revalidate form on patient fetch complete
  useEffect(() => {
    if (
      previousFetchingPatientsForClinic?.inProgress &&
      !fetchingPatientsForClinic.inProgress
    ) {
      formikContext.validateForm();
    }
  }, [
    fetchingPatientsForClinic.inProgress,
    formikContext,
    previousFetchingPatientsForClinic?.inProgress,
  ]);

  useEffect(() => {
    // set form field values and store initial patient values on patient load
    const patientValues = getFormValues(patient, clinicPatientTags);
    setValues(patientValues);
    setInitialValues(patientValues);
  }, [patient, clinicPatientTags]);

  useEffect(() => {
    onFormChange(formikContext);
  }, [values, clinicPatientTags, status]);

  useEffect(() => {
    if (includes(['create', 'edit'], action)) {
      const hasValidEmail = !isEmpty(values.email) && !errors.email;
      setDisableConnectDexcom(!hasValidEmail);

      if (values.connectDexcom && !hasValidEmail) {
        setFieldValue('connectDexcom', false);
      }
    }
  }, [values.email, errors.email, action]);

  // Pull the patient on load to ensure the most recent dexcom connection state is made available
  useEffect(() => {
    if ((action === 'edit') && selectedClinicId && patient?.id) fetchPatientDetails();
  }, []);

  useEffect(() => {
    handleAsyncResult(sendingPatientDexcomConnectRequest, t('Dexcom connection request to {{email}} has been resent.', {
      email: patient?.email,
    }));
  }, [sendingPatientDexcomConnectRequest]);

  function handleSendDexcomInitialConnectEmail() {
    const hasValidEmail = !isEmpty(values.email) && !errors.email;
    
    if (!hasValidEmail) return;

    trackMetric('Clinic - Send Dexcom connect email', { clinicId: selectedClinicId, dexcomConnectState, source: 'patientForm' });
    formikContext.setFieldValue('connectDexcom', true);
    formikContext.handleSubmit();
  }

  function handleResendDexcomConnectEmail() {
    trackMetric('Clinic - Resend Dexcom connect email', { clinicId: selectedClinicId, dexcomConnectState, source: 'patientForm' })
    setShowResendDexcomConnectRequest(true);
  }

  function handleResendDexcomConnectEmailConfirm() {
    trackMetric('Clinic - Resend Dexcom connect email confirm', { clinicId: selectedClinicId, source: 'patientForm' });
    formikContext.setStatus('resendingDexcomConnectRequest');
    dispatch(actions.async.sendPatientDexcomConnectRequest(api, selectedClinicId, patient.id));
  }

  function fetchPatientDetails() {
    dispatch(actions.async.fetchPatientFromClinic(api, selectedClinicId, patient.id));
  }

  function renderRegionalNote() {
    return (
      <Body0 sx={{ fontWeight: 'medium', color: colors.mediumGrey, lineHeight: '1.5 !important', fontStyle: 'italic'}}>
        {t('For US Dexcom Users Only')}
      </Body0>
    );
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

  return (
    <Box
      as="form"
      id="clinic-patient-form"
      sx={{ minWidth: [null, '320px'] }}
      {...boxProps}
    >
      <Text sx={{ color: colors.text.primary }}>{t('Patient Details')}</Text>

      <Box mb={4} mt={3}>
        <TextInput
          {...getCommonFormikFieldProps('fullName', formikContext)}
          innerRef={initialFocusedInput === 'fullName' ? initialFocusedInputRef : undefined}
          label={t('Full Name')}
          placeholder={t('Full Name')}
          variant="condensed"
          sx={{ width: '100%' }}
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
            innerRef={initialFocusedInput === 'birthDate' ? initialFocusedInputRef : undefined}
            label={t('Birthdate')}
            placeholder={dateInputFormat.toLowerCase()}
            variant="condensed"
            sx={{ width: '100%' }}
          />
        </InputMask>
      </Box>

      <Box mb={4}>
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
          <Box mb={2}>
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

          <Body0 sx={{ fontWeight: 'medium' }}>
            {t('If you want your patients to upload their data from home, you must include their email address.')}
          </Body0>
        </>
      )}

      {showConnectDexcom && action === 'create' && (
        <Box mt={3} pt={3} sx={{ borderTop: borders.default }}>
          <Text sx={{ color: colors.text.primary }}>{t('Connect an Account')}</Text>

          <Flex 
            mt={2}
            px={3} 
            py={3} 
            sx={{ 
              justifyContent: 'space-between', 
              backgroundColor: disableConnectDexcom ? 'lightestGrey' : '#F0F5FF', // TODO: FIX
              borderRadius: radii.default 
            }}
          >
            <Icon
              label="Dexcom"
              variant="static"
              iconSrc={DexcomLogoIcon}
              sx={{ img: { filter: disableConnectDexcom ? 'saturate(0%) brightness(130%)' : 'none' } }}
            />

            <Checkbox
              {...getCommonFormikFieldProps('connectDexcom', formikContext, 'checked')}
              disabled={disableConnectDexcom}
            />
          </Flex>

          <Body0 mt={1} sx={{ fontWeight: 'medium' }}>
            {t('If this box is checked, the patient will receive an email to authorize sharing Dexcom data with Tidepool. An email must be entered above. For US users only.')}
          </Body0>
        </Box>
      )}

      {showConnectDexcom && action === 'edit' && (
        <Box mt={3} pt={3} sx={{ borderTop: borders.default }}>
          <Text sx={{ color: colors.text.primary }}>{t('Connect an Account')}</Text>

          <Flex 
            mt={2}
            px={3} 
            py={3} 
            sx={{ 
              justifyContent: 'space-between', 
              backgroundColor: '#F0F5FF', // TODO: FIX
              borderRadius: radii.default 
            }}
          >
            <Icon
              label="Dexcom"
              variant="static"
              iconSrc={DexcomLogoIcon}
            />

            <Button 
              sx={{ backgroundColor: 'white', color: 'indigos.5', border: 'none' }}
              onClick={handleSendDexcomInitialConnectEmail}
            >
              {t('Email Invite')}
            </Button>
          </Flex>
        </Box>
      )}

      {showDexcomConnectState && (
        <Box mt={3} pt={3} sx={{ borderTop: borders.default }}>
          <Text sx={{ color: colors.text.primary }}>{t('Connect an Account')}</Text>

          <PatientFormConnectionStatus 
            iconLabel="Dexcom"
            iconSrc={DexcomLogoIcon}
            status={dexcomConnectState}
            onResendEmail={handleResendDexcomConnectEmail}
            lastRequestedAt={patient.lastRequestedDexcomConnectTime}
          />
        </Box>
      )}

      <ResendDexcomConnectRequestDialog
        api={api}
        onClose={() => setShowResendDexcomConnectRequest(false)}
        onConfirm={handleResendDexcomConnectEmailConfirm}
        open={showResendDexcomConnectRequest}
        patient={patient}
        t={t}
        trackMetric={trackMetric}
      />

      {showTags && (
        <Box
          mt={3}
          sx={{
            borderTop: borders.default,
          }}
        >
          {!!values.tags.length && (
            <Box className='selected-tags' mt={3} mb={1} sx={{ fontSize: 0 }}>
              <Text mb={1} sx={{ display: 'block', fontWeight: 'medium', color: 'text.primary' }}>{t('Assigned Patient Tags')}</Text>

              <TagList
                tags={compact(map(values.tags, tagId => clinicPatientTags[tagId]))}
                tagProps={{
                  onClickIcon: tagId => {
                    setFieldValue('tags', without(values.tags, tagId));
                  },
                  icon: CloseRoundedIcon,
                  iconColor: 'white',
                  iconFontSize: 1,
                  sx: {
                    color: 'white',
                    backgroundColor: 'purpleMedium',
                  },
                }}
              />
            </Box>
          )}

          {values.tags.length < (clinic?.patientTags || []).length && (
            <Box className='available-tags' mb={1} mt={3} sx={{ alignItems: 'center', fontSize: 0 }}>
              <Text mb={1} sx={{ display: 'block', fontWeight: 'medium', color: 'text.primary' }}>{t('Available Patient Tags')}</Text>

              <TagList
                tags={map(reject(clinic?.patientTags, ({ id }) => includes(values.tags, id)), ({ id }) => clinicPatientTags?.[id])}
                tagProps={{
                  onClick: tagId => {
                    setFieldValue('tags', [...values.tags, tagId]);
                  },
                }}
              />
            </Box>
          )}
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
