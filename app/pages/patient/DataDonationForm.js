import React, { useCallback, useEffect, useState } from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { Trans, useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { add, compact, forEach, get, includes, invert, isEmpty, isEqual, isNil, keyBy, map, noop, omitBy, reject, sortBy, values } from 'lodash';
import { useFormik } from 'formik';
import { Box, Flex, Link } from 'theme-ui';
import CheckCircleRoundedIcon from '@material-ui/icons/CheckCircleRounded';
import EditRoundedIcon from '@material-ui/icons/EditRounded';
import { push } from 'connected-react-router';

import { Paragraph1 } from '../../components/elements/FontStyles';
import MultiSelect from '../../components/elements/MultiSelect';
import * as actions from '../../redux/actions';
import { useIsFirstRender, usePrevious } from '../../core/hooks';
import { getCommonFormikFieldProps } from '../../core/forms';
import { useToasts } from '../../providers/ToastProvider';
import { DataDonationSlideShow } from '../../components/elements/SlideShow';
import personUtils from '../../core/personutils';
import Pill from '../../components/elements/Pill';

import {
  DATA_DONATION_CONSENT_TYPE,
  NONPROFIT_CODES_TO_SUPPORTED_ORGANIZATIONS_NAMES,
  SUPPORTED_ORGANIZATIONS_OPTIONS,
  TIDEPOOL_DATA_DONATION_ACCOUNT_EMAIL,
  URL_BIG_DATA_DONATION_INFO,
} from '../../core/constants';

import Button from '../../components/elements/Button';
import DataDonationRevokeConsentDialog from '../patient/DataDonationRevokeConsentDialog';
import DataDonationConsentDialog from '../patient/DataDonationConsentDialog';
import { getConsentText } from '../patient/DataDonationConsentDialog';
import { selectDataDonationConsent } from '../../core/selectors';

const supportedOrganizationsOptions = SUPPORTED_ORGANIZATIONS_OPTIONS; // eslint-disable-line new-cap

const dataDonationConsentSchema = yup.object().shape({
  dataDonate: yup.boolean(),
});

const supportedOrganizationsSchema = yup.object().shape({
  supportedOrganizations: yup.string(),
});

export const formSteps = {
  dataDonationConsent: 'dataDonationConsent',
  supportedOrganizations: 'supportedOrganizations',
}

export const schemas = {
  dataDonationConsent: dataDonationConsentSchema,
  supportedOrganizations: supportedOrganizationsSchema,
};

export const formContexts = {
  newPatient: 'newPatient',
  profile: 'profile',
};

export const DataDonationForm = (props) => {
  const { api, trackMetric, onFormChange, onRevokeConsent, formContext } = props;
  const { t } = useTranslation();
  const dispatch = useDispatch();
  const { set: setToast } = useToasts();

  useEffect(() => {
    if (trackMetric) {
      trackMetric('Viewed Profile Create');
    }
  }, []);

  const loggedInUserId = useSelector((state) => state.blip.loggedInUserId);
  const allUsersMap = useSelector((state) => state.blip.allUsersMap);
  const user = get(allUsersMap, loggedInUserId);
  const working = useSelector((state) => state.blip.working);
  const previousWorking = usePrevious(working);
  const isFirstRender = useIsFirstRender();
  const [submitting, setSubmitting] = useState(false);
  const [showConsentDialog, setShowConsentDialog] = useState(false);
  const [showRevokeConsentDialog, setShowRevokeConsentDialog] = useState(false);
  const patientAge = moment().diff(moment(user?.profile?.patient?.birthday, 'YYYY-MM-DD'), 'years', true);
  const isYouth = patientAge < 18;
  const isChild = patientAge < 13;
  const accountType = personUtils.patientIsOtherPerson(user) ? 'caregiver' : 'personal';
  const patientAgeGroup = isChild ? 'child' : (isYouth ? 'youth' : 'adult');
  const patientName = personUtils.patientFullName(user);
  const caregiverName = accountType === 'caregiver' ? personUtils.fullName(user) : undefined;
  const { [DATA_DONATION_CONSENT_TYPE]: consentDocument } = useSelector((state) => state.blip.consents);
  const currentConsent = useSelector(state => selectDataDonationConsent(state));
  const isLegacyConsent = currentConsent?.version === 0;
  const legacyDataDonationAccounts = useSelector(state => state.blip.dataDonationAccounts);
  const fallbackConsentDate = formContext === formContexts.newPatient ? moment().format('MMMM D, YYYY') : null;
  const consentDate = currentConsent?.grantTime ? moment(currentConsent.grantTime).format('MMMM D, YYYY') : fallbackConsentDate;
  const [currentForm, setCurrentForm] = useState(currentConsent?.status === 'active' ? formSteps.supportedOrganizations : formSteps.dataDonationConsent);
  const showConsentDialogTrigger = formContext === formContexts.profile;

  let consentSuccessMessage = getConsentText(accountType, patientAgeGroup, patientName, caregiverName, consentDate).consentSuccessMessage;
  if (!consentDate) consentSuccessMessage = t('You are currently sharing your data.');

  const consentRecordAgeGroupMap = {
    child: '<13',
    youth: '13-17',
    adult: '>=18',
  };

  // Fetchers
  useEffect(() => {
    if (loggedInUserId) {
      dispatch(
        actions.async.fetchLatestConsentByType(api, DATA_DONATION_CONSENT_TYPE) // TODO: Fetch at the patientInfo level?
      );
    }
  }, [loggedInUserId]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (currentConsent?.status === 'active' && currentForm === formSteps.dataDonationConsent) {
      setCurrentForm(formSteps.supportedOrganizations);
    }
    if (currentConsent?.status !== 'active' && currentForm === formSteps.supportedOrganizations) {
      setCurrentForm(formSteps.dataDonationConsent);
    }
  }, [currentConsent]); // eslint-disable-line react-hooks/exhaustive-deps

  const accountTypeText = {
    personal: {
      dataDonatePrompt: t('Would you like to donate your anonymized data?'),
      dataDonateOwnership: t('You own your data.'),
      dataDonateConsentLabel: t('Yes - I have read this form and give my consent by checking this box and clicking submit.'),
      dataDonateOrganizationsLabel: t('Tidepool will share 10% of the proceeds with the diabetes organization(s) of your choice.'),
    },
    caregiver: {
      dataDonatePrompt: t('Would they like to donate their anonymized data?'),
      dataDonateOwnership: t('People with diabetes own their data.'),
      dataDonateConsentLabel: t('Yes - I have read this form and give my consent by checking this box and clicking submit.'),
      dataDonateOrganizationsLabel: t('Tidepool will share 10% of the proceeds with the diabetes organization(s) of their choice.'),
    },
  };

  const {
    creatingUserConsentRecord,
    updatingDataDonationAccounts,
    updatingUserConsentRecord,
    revokingUserConsentRecord,
  } = useSelector((state) => state.blip.working);

  function handleCloseOverlays() {
      setShowRevokeConsentDialog(false);
      setShowConsentDialog(false);
  };

  function redirectToPatientData() {
    dispatch(push(`/patients/${loggedInUserId}/data`));
  }

  const handleAsyncResult = useCallback((workingState, successMessage, onComplete = handleCloseOverlays) => {
    const { inProgress, completed, notification, prevInProgress } = workingState;

    if (!isFirstRender && !inProgress && prevInProgress !== false) {
      if (completed) {
        onComplete();
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

      if (submitting) setSubmitting(false);
    }
  }, [isFirstRender, setToast, submitting]);

  useEffect(() => {
    handleAsyncResult({ ...creatingUserConsentRecord, prevInProgress: previousWorking?.creatingUserConsentRecord }, consentSuccessMessage);
  }, [creatingUserConsentRecord]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    handleAsyncResult({ ...updatingUserConsentRecord, prevInProgress: previousWorking?.updatingUserConsentRecord }, t('You have updated your data donation preferences'), () => {
      if (formContext === formContexts.newPatient) redirectToPatientData();
    });
  }, [updatingUserConsentRecord]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    handleAsyncResult({ ...updatingDataDonationAccounts, prevInProgress: previousWorking?.updatingDataDonationAccounts }, t('You have updated your data donation preferences'));
  }, [updatingDataDonationAccounts]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    handleAsyncResult({ ...revokingUserConsentRecord, prevInProgress: previousWorking?.revokingUserConsentRecord }, t('You have stopped sharing your data'), onRevokeConsent);
  }, [revokingUserConsentRecord]); // eslint-disable-line react-hooks/exhaustive-deps

  const formikContext = useFormik({
    initialValues: {
      dataDonate: false,
      supportedOrganizations: '',
    },
    validationSchema: schemas[currentForm],
    onSubmit: () => handleUpdateSupportedOrganizations(),
  });

  useEffect(() => {
    if (!formikContext.touched.supportedOrganizations && currentConsent?.metadata?.supportedOrganizations) {
      console.log('formikContext', formikContext);
      const supportedOrganizations = currentConsent?.metadata?.supportedOrganizations.join(',');

      if (isEmpty(formikContext.values.supportedOrganizations) && !isEmpty(supportedOrganizations)) {
        formikContext.setFieldValue('supportedOrganizations', supportedOrganizations);
        formikContext.setFieldTouched('supportedOrganizations', true);
      }
    }
  }, [currentConsent?.metadata?.supportedOrganizations]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    onFormChange(formikContext, currentForm, submitting, initializeConsent);
  }, [formikContext.values, currentForm, submitting]); // eslint-disable-line react-hooks/exhaustive-deps

  function initializeConsent() {
    setShowConsentDialog(true);
  }

  function handleConsentDialogConfirm(values) {
    const createdRecord = {
      type: consentDocument?.type,
      version: consentDocument?.version,
      ageGroup: consentRecordAgeGroupMap[patientAgeGroup],
      ownerName: patientName,
      grantorType: isChild || isYouth ? 'parent/guardian' : 'owner',
      parentGuardianName: isChild || isYouth ? values.name : undefined,
      metadata: { supportedOrganizations: [] },
    };

    setSubmitting(true);
    dispatch(actions.async.createUserConsentRecord(api, omitBy(createdRecord, isNil)));

    trackMetric('Create Consent Record', {
      formContext: formContexts[formContext],
      type: createdRecord.type,
      version: createdRecord.version,
      grantorType: createdRecord.grantorType,
      ageGroup: createdRecord.ageGroup
    });
  }

  function handleRevokeConsentDialogConfirm() {
    setSubmitting(true);

    if (isLegacyConsent) {
      dispatch(actions.async.updateDataDonationAccounts(api, [], legacyDataDonationAccounts));
    } else {
      dispatch(actions.async.revokeUserConsentRecord(api, currentConsent.type, currentConsent.id));
    }

    trackMetric('Revoke Consent Record', {
      formContext: formContexts[formContext],
      type: currentConsent.type,
      version: currentConsent.version,
      grantorType: currentConsent.grantorType,
      ageGroup: currentConsent.ageGroup,
    });
  }

  function handleUpdateSupportedOrganizations() {
    const updatedSupportedOrganizations = compact(formikContext.values.supportedOrganizations.split(','));

    // Return early if there are no changes to the currently-supported organizations
    if (isEqual(sortBy(updatedSupportedOrganizations), sortBy(currentConsent.metadata.supportedOrganizations))) return;

    if (isLegacyConsent) {
      const nameToCodeMap = invert(NONPROFIT_CODES_TO_SUPPORTED_ORGANIZATIONS_NAMES);
      const addAccounts = map(updatedSupportedOrganizations, name => `bigdata+${nameToCodeMap[name]}@tidepool.org`);
      const existingAccounts = keyBy(legacyDataDonationAccounts, 'email');

      // Filter out any accounts that are already shared with
      const filteredAddAccounts = reject(addAccounts, account => { return get(existingAccounts, account) });

      const removeAccounts = [];
      // Remove any existing shared accounts that have been removed
      forEach(existingAccounts, account => {
        if (account.email === TIDEPOOL_DATA_DONATION_ACCOUNT_EMAIL) return;

        if (!includes(addAccounts, account.email)) {
          removeAccounts.push(account);
        }
      });

      dispatch(actions.async.updateDataDonationAccounts(api, filteredAddAccounts, removeAccounts));
    } else {
      dispatch(actions.async.updateUserConsentRecord(api, currentConsent.id, { metadata: { supportedOrganizations: updatedSupportedOrganizations } }));
    }

    trackMetric('Update Consent Record', {
      formContext: formContexts[formContext],
      type: currentConsent.type,
      version: currentConsent.version,
      grantorType: currentConsent.grantorType,
      ageGroup: currentConsent.ageGroup,
    });
  }

  return (
    <Box id="dataDonationForm">
      <DataDonationSlideShow />

      {currentForm === formSteps.dataDonationConsent && (
        <Flex
          id="dataDonationConsent"
          mb={3}
          sx={{
            justifyContent: showConsentDialogTrigger ? 'space-between' : 'center',
            alignItems: 'center',
            flexDirection: ['column', 'row'],
            gap: 2,
          }}
        >
          <Box>
            <Trans i18nKey="html.data-donation-details">
              <Paragraph1 sx={{ fontWeight: 'medium', textAlign: 'center' }}>
                {accountTypeText[accountType]?.dataDonatePrompt}&nbsp;
                <Link className="data-donation-details-link" href={URL_BIG_DATA_DONATION_INFO} target="_blank">Learn more</Link>.
              </Paragraph1>
            </Trans>
          </Box>

          {showConsentDialogTrigger && (
            <Button
              variant="primary"
              onClick={initializeConsent}
            >
              {t('Yes, I\'m Interested')}
            </Button>
          )}

          {showConsentDialog && (
            <DataDonationConsentDialog
              open={true}
              onClose={() => setShowConsentDialog(false)}
              onConfirm={handleConsentDialogConfirm}
              accountType={accountType}
              patientAgeGroup={patientAgeGroup}
              patientName={patientName}
              caregiverName={caregiverName}
              consentDate={consentDate}
            />
          )}
        </Flex>
      )}

      {currentForm === formSteps.supportedOrganizations && (
        <>
          <Flex
            id="dataDonationDetails"
            mb={3}
            sx={{
              justifyContent: 'space-between',
              alignItems: 'center',
              flexDirection: ['column', 'row'],
              gap: 2,
            }}
          >
            <Pill
              id="consentSuccessMessage"
              sx={{ fontSize: 1 }}
              text={consentSuccessMessage}
              icon={CheckCircleRoundedIcon}
              label={t('Consent date')}
              colorPalette="success"
            />

            <Button
              variant="textSecondary"
              icon={EditRoundedIcon}
              iconPosition="left"
              onClick={() => setShowRevokeConsentDialog(true)}
            >
              {t('Stop Sharing Data')}
            </Button>
          </Flex>

          <Box id="data-donation-destination-form">
            <MultiSelect
              {...getCommonFormikFieldProps('supportedOrganizations', formikContext, 'value', false)}
              label={accountTypeText[accountType]?.dataDonateOrganizationsLabel}
              setFieldValue={formikContext.setFieldValue}
              options={supportedOrganizationsOptions}
              onMenuClose={formContext === formContexts.profile ? handleUpdateSupportedOrganizations : undefined}
            />
          </Box>

          {showRevokeConsentDialog && (
            <DataDonationRevokeConsentDialog
              open={true}
              onClose={() => setShowRevokeConsentDialog(false)}
              onConfirm={handleRevokeConsentDialogConfirm}
              processing={submitting}
            />
          )}
        </>
      )}
    </Box>
  );
};

DataDonationForm.propTypes = {
  api: PropTypes.object.isRequired,
  trackMetric: PropTypes.func.isRequired,
  onFormChange: PropTypes.func.isRequired,
  onRevokeConsent: PropTypes.func.isRequired,
  formContext: PropTypes.oneOf(values(formContexts)).isRequired,
};

DataDonationForm.defaultProps = {
  onFormChange: noop,
  onRevokeConsent: noop,
};

export default DataDonationForm;
