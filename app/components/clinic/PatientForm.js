import React, { useEffect, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import compact from 'lodash/compact';
import find from 'lodash/find';
import get from 'lodash/get';
import includes from 'lodash/includes';
import isEmpty from 'lodash/isEmpty';
import keyBy from 'lodash/keyBy';
import keys from 'lodash/keys';
import map from 'lodash/map';
import omitBy from 'lodash/omitBy';
import reject from 'lodash/reject';
import without from 'lodash/without';
import { useFormik } from 'formik';
import InputMask from 'react-input-mask';
import CloseRoundedIcon from '@material-ui/icons/CloseRounded';
import CheckCircleRoundedIcon from '@material-ui/icons/CheckCircleRounded';
import ErrorOutlineRoundedIcon from '@material-ui/icons/ErrorOutlineRounded';
import { Box, Flex, Text, BoxProps } from 'rebass/styled-components';
import moment from 'moment';

import * as actions from '../../redux/actions';
import Checkbox from '../../components/elements/Checkbox';
import TextInput from '../../components/elements/TextInput';
import Button from '../../components/elements/Button';
import { TagList } from '../../components/elements/Tag';
import ResendDexcomConnectRequestDialog from './ResendDexcomConnectRequestDialog';
import { useToasts } from '../../providers/ToastProvider';
import { getCommonFormikFieldProps } from '../../core/forms';
import { useIsFirstRender } from '../../core/hooks';
import { dateRegex, patientSchema as validationSchema } from '../../core/clinicUtils';
import { accountInfoFromClinicPatient } from '../../core/personutils';
import { Body0 } from '../../components/elements/FontStyles';
import { borders, colors } from '../../themes/baseTheme';
import Icon from '../elements/Icon';
import DexcomLogoIcon from '../../core/icons/DexcomLogo.svg';

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
  const { t, api, onFormChange, patient, trackMetric, ...boxProps } = props;
  const dispatch = useDispatch();
  const isFirstRender = useIsFirstRender();
  const { set: setToast } = useToasts();
  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);
  const clinic = useSelector(state => state.blip.clinics?.[selectedClinicId]);
  const mrnSettings = clinic?.mrnSettings ?? {};
  const dateInputFormat = 'MM/DD/YYYY';
  const dateMaskFormat = dateInputFormat.replace(/[A-Z]/g, '9');
  const [initialValues, setInitialValues] = useState({});
  const showTags = clinic?.tier >= 'tier0300' && !!clinic?.patientTags?.length;
  const clinicPatientTags = useMemo(() => keyBy(clinic?.patientTags, 'id'), [clinic?.patientTags]);
  const dexcomDataSource = find(patient?.dataSources, { providerName: 'dexcom' });
  const dexcomAuthInviteExpired = dexcomDataSource?.expirationTime < moment.utc().toISOString();
  const showConnectDexcom = !!selectedClinicId && !dexcomDataSource;
  const [disableConnectDexcom, setDisableConnectDexcom] = useState(false);
  const showDexcomConnectState = !!selectedClinicId && !!dexcomDataSource?.state;
  const [showResendDexcomConnectRequest, setShowResendDexcomConnectRequest] = useState(false);
  const { sendingPatientDexcomConnectRequest } = useSelector((state) => state.blip.working);

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
      const action = patient?.id ? 'edit' : 'create';
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
        });

        formikHelpers.setStatus('sendingDexcomConnectRequest');
      }

      dispatch(actions.async[actionMap[action][context].handler](api, ...actionMap[action][context].args()));
    },
    validationSchema: validationSchema({mrnSettings}),
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
        setShowResendDexcomConnectRequest(false);

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
    const hasValidEmail = !isEmpty(values.email) && !errors.email;
    setDisableConnectDexcom(!hasValidEmail);

    if (values.connectDexcom && !hasValidEmail) {
      setFieldValue('connectDexcom', false);
    }
  }, [values.email, errors.email]);

  // Pull the patient on load to ensure the most recent dexcom connection state is made available
  useEffect(() => {
    if (selectedClinicId && patient?.id) dispatch(actions.async.fetchPatientFromClinic.bind(null, api, selectedClinicId, patient.id)())
  }, []);

  useEffect(() => {
    handleAsyncResult(sendingPatientDexcomConnectRequest, t('Dexcom connection request to {{email}} has been resent.', {
      email: patient?.email,
    }));
  }, [sendingPatientDexcomConnectRequest]);

  function handleResendDexcomConnectEmail() {
    trackMetric('Clinic - Resend Dexcom connect email', { clinicId: selectedClinicId, dexcomConnectState, source: 'patientForm' })
    setShowResendDexcomConnectRequest(true);
  }

  function handleResendDexcomConnectEmailConfirm() {
    trackMetric('Clinic - Resend Dexcom connect email confirm', { clinicId: selectedClinicId, source: 'patientForm' });
    formikContext.setStatus('resendingDexcomConnectRequest');
    dispatch(actions.async.sendPatientDexcomConnectRequest(api, selectedClinicId, patient.id));
  }

  function renderRegionalNote() {
    return (
      <Body0 fontWeight="medium" color={colors.mediumGrey} sx={{ lineHeight: '1.5 !important', fontStyle: 'italic'}}>
        {t('For US Dexcom Users Only')}
      </Body0>
    );
  }

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
         label={mrnSettings?.required ? t('MRN') : t('MRN (optional)')}
          placeholder={t('MRN')}
          variant="condensed"
          width="100%"
        />
      </Box>

      <Box mb={2}>
        <TextInput
          {...getCommonFormikFieldProps('email', formikContext)}
          label={t('Email (optional)')}
          placeholder={t('Email')}
          variant="condensed"
          width="100%"
          disabled={patient?.id && !patient?.permissions?.custodian}
        />
      </Box>

      <Body0 fontWeight="medium">
        {t('If you want your patients to upload their data from home, you must include their email address.')}
      </Body0>

      {showTags && (
        <Box
          mt={3}
          sx={{
            borderTop: borders.default,
          }}
        >
          {!!values.tags.length && (
            <Box className='selected-tags' mt={3} mb={1} fontSize={0}>
              <Text mb={1} fontWeight="medium" color="text.primary">{t('Assigned Patient Tags')}</Text>

              <TagList
                tags={compact(map(values.tags, tagId => clinicPatientTags[tagId]))}
                tagProps={{
                  onClickIcon: tagId => {
                    setFieldValue('tags', without(values.tags, tagId));
                  },
                  icon: CloseRoundedIcon,
                  iconColor: 'white',
                  iconFontSize: 1,
                  color: 'white',
                  backgroundColor: 'purpleMedium',
                }}
              />
            </Box>
          )}

          {values.tags.length < (clinic?.patientTags || []).length && (
            <Box className='available-tags' alignItems="center" mb={1} mt={3} fontSize={0} >
              <Text mb={1} fontWeight="medium" color="text.primary">{t('Available Patient Tags')}</Text>

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

      {showConnectDexcom && (
        <Box
          id="connectDexcomWrapper"
          mt={3}
          pt={3}
          sx={{
            borderTop: borders.default,
          }}
        >
          <Checkbox
            {...getCommonFormikFieldProps('connectDexcom', formikContext, 'checked')}
            disabled={disableConnectDexcom}
            label={(
              <Flex
                alignItems="center"
              >
                <Text mr={1} mt={1} fontSize={0}>
                  {t('Connect with')}
                </Text>

                <Icon
                  variant="static"
                  iconSrc={DexcomLogoIcon}
                  sx={{
                    img: {
                      filter: disableConnectDexcom ? 'saturate(0%) brightness(130%)' : 'none',
                    },
                  }}
                  label="Dexcom"
                />
              </Flex>
            )}
          />

          <Body0 mt={1} fontWeight="medium">
            {t('If this box is checked, patient will receive an email to authorize sharing Dexcom data with Tidepool.')}
          </Body0>

          {renderRegionalNote()}
        </Box>
      )}

      {showDexcomConnectState && (
        <Box
          id="connectDexcomStatusWrapper"
          mt={3}
          pt={3}
          color={dexcomConnectStateUI[dexcomConnectState].color}
          sx={{
            borderTop: borders.default,
          }}
        >
          <Flex
            alignItems="center"
          >
            <Icon
              variant="static"
              icon={dexcomConnectStateUI[dexcomConnectState].icon}
              label={`${dexcomConnectStateUI[dexcomConnectState].label} Dexcom`}
              sx={dexcomConnectStateUI[dexcomConnectState].iconStyles}
            />

            <Text mx={1} mt={1} fontSize={0}>
              {dexcomConnectStateUI[dexcomConnectState].label}
            </Text>

            <Icon
              variant="static"
              iconSrc={DexcomLogoIcon}
              label="Dexcom"
            />
          </Flex>

          {dexcomConnectState === 'pending' && (
            <Body0 mt={2} fontWeight="medium" color={colors.mediumGrey} sx={{ display: 'inline-block', lineHeight: '0.5 !important'}}>
              {t('Patient has received an email to authorize Dexcom data sharing with Tidepool but they have not taken any action yet.')}

              <Button
                id="resendDexcomConnectRequestTrigger"
                variant="textPrimary"
                onClick={handleResendDexcomConnectEmail}
                fontSize={0}
                sx={{ display: 'inline-block !important'}}
              >
                {t('Resend email')}
              </Button>
            </Body0>
          )}

          {dexcomConnectState === 'pendingReconnect' && (
            <Body0 mt={2} fontWeight="medium" color={colors.mediumGrey} sx={{ display: 'inline-block', lineHeight: '0.5 !important'}}>
              {t('Patient has received an email to reconnect their Dexcom data with Tidepool but they have not taken any action yet.')}

              <Button
                id="resendDexcomConnectRequestTrigger"
                variant="textPrimary"
                onClick={handleResendDexcomConnectEmail}
                fontSize={0}
                sx={{ display: 'inline-block !important'}}
              >
                {t('Resend email')}
              </Button>
            </Body0>
          )}

          {dexcomConnectState === 'pendingExpired' && (
            <Body0 mt={2} fontWeight="medium" color={colors.mediumGrey} sx={{ display: 'inline-block', lineHeight: '0.5 !important'}}>
              {t('Patient invitation to authorize Dexcom data sharing with Tidepool has expired. Would you like to send a new connection request?')}

              <Button
                id="resendDexcomConnectRequestTrigger"
                variant="textPrimary"
                onClick={handleResendDexcomConnectEmail}
                fontSize={0}
                sx={{ display: 'inline-block !important'}}
              >
                {t('Resend email')}
              </Button>
            </Body0>
          )}

          {dexcomConnectState === 'disconnected' && (
            <Body0 mt={2} fontWeight="medium" color={colors.mediumGrey} sx={{ display: 'inline-block', lineHeight: '0.5 !important'}}>
              {t('Patient has disconnected their Dexcom data sharing authorization with Tidepool. Would you like to send a new connection request?')}

              <Button
                id="resendDexcomConnectRequestTrigger"
                variant="textPrimary"
                onClick={handleResendDexcomConnectEmail}
                fontSize={0}
                sx={{ display: 'inline-block !important'}}
              >
                {t('Send email')}
              </Button>
            </Body0>
          )}

          {dexcomConnectState === 'error' && (
            <Body0 mt={2} fontWeight="medium" color={colors.mediumGrey} sx={{ display: 'inline-block', lineHeight: '0.5 !important'}}>
              {t('Patient\'s previous Dexcom authorization is no longer valid. Would you like to send a new connection request?')}

              <Button
                id="resendDexcomConnectRequestTrigger"
                variant="textPrimary"
                onClick={handleResendDexcomConnectEmail}
                fontSize={0}
                sx={{ display: 'inline-block !important'}}
              >
                {t('Send email')}
              </Button>
            </Body0>
          )}

          {dexcomConnectStateUI[dexcomConnectState].showRegionalNote && renderRegionalNote()}

          <ResendDexcomConnectRequestDialog
            api={api}
            onClose={() => setShowResendDexcomConnectRequest(false)}
            onConfirm={handleResendDexcomConnectEmailConfirm}
            open={showResendDexcomConnectRequest}
            patient={patient}
            t={t}
            trackMetric={trackMetric}
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
