import React, { useCallback, useEffect, useState } from 'react';
import moment from 'moment';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { Trans, useTranslation } from 'react-i18next';
import * as yup from 'yup';
import { forEach, get, isEmpty, noop, values } from 'lodash';
import { useFormik } from 'formik';
import { Box, Flex, Link } from 'theme-ui';
import CheckCircleRoundedIcon from '@material-ui/icons/CheckCircleRounded';
import EditRoundedIcon from '@material-ui/icons/EditRounded';

import { Paragraph1 } from '../../components/elements/FontStyles';
import MultiSelect from '../../components/elements/MultiSelect';
import * as actions from '../../redux/actions';
import { useIsFirstRender, usePrevious } from '../../core/hooks';
import { getCommonFormikFieldProps } from '../../core/forms';
import { useToasts } from '../../providers/ToastProvider';
import { push } from 'connected-react-router';
import { DataDonationSlideShow } from '../../components/elements/SlideShow';
import personUtils from '../../core/personutils';
import Pill from '../../components/elements/Pill';

import {
  DATA_DONATION_CONSENT_TYPE,
  DATA_DONATION_NONPROFITS,
  TIDEPOOL_DATA_DONATION_ACCOUNT_EMAIL,
  URL_BIG_DATA_DONATION_INFO,
} from '../../core/constants';

import Button from '../../components/elements/Button';
import DataDonationRevokeConsentDialog from '../patient/DataDonationRevokeConsentDialog';
import DataDonationConsentDialog from '../patient/DataDonationConsentDialog';
import { getConsentText } from '../patient/DataDonationConsentDialog';

const dataDonateDestinationOptions = DATA_DONATION_NONPROFITS(); // eslint-disable-line new-cap

const dataDonationConsentSchema = yup.object().shape({
  dataDonate: yup.boolean(),
});

const dataDonationDestinationSchema = yup.object().shape({
  dataDonateDestination: yup.string(),
});

export const formSteps = {
  dataDonationConsent: 'dataDonationConsent',
  dataDonationDestination: 'dataDonationDestination',
}

export const schemas = {
  dataDonationConsent: dataDonationConsentSchema,
  dataDonationDestination: dataDonationDestinationSchema,
};

export const formContexts = {
  newPatient: 'newPatient',
  profileNonDonor: 'profileNonDonor',
  profileDonor: 'profileDonor',
};

export const DataDonationForm = (props) => {
  const { api, trackMetric, onFormChange, context } = props;
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
  const [currentForm, setCurrentForm] = useState(context === formContexts.profileDonor ? formSteps.dataDonationDestination : formSteps.dataDonationConsent);
  const [showConsentDialog, setShowConsentDialog] = useState(false);
  const [showRevokeConsentDialog, setShowRevokeConsentDialog] = useState(false);
  const patientAge = moment().diff(moment(user?.profile?.patient?.birthday, 'YYYY-MM-DD'), 'years', true);
  const isYouth = patientAge < 18;
  const isChild = patientAge < 13;
  const accountType = personUtils.patientIsOtherPerson(user) ? 'caregiver' : 'personal';
  const patientAgeGroup = isChild ? 'child' : (isYouth ? 'youth' : 'adult');
  const patientName = personUtils.patientFullName(user);
  const consentSuccessMessage = getConsentText(accountType, patientAgeGroup, patientName).consentSuccessMessage;
  const showConsentDialogTrigger = context === formContexts.profileNonDonor;

  // Fetchers
  useEffect(() => {
    if (loggedInUserId) {
      dispatch(
        actions.async.fetchLatestConsentByType(api, DATA_DONATION_CONSENT_TYPE)
      );
    }
  }, [loggedInUserId]); // eslint-disable-line react-hooks/exhaustive-deps

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
    providingDataDonationConsent,
    revokingDataDonationConsent,
    updatingUser,
  } = useSelector((state) => state.blip.working);

  function handleCloseOverlays() {
      setShowRevokeConsentDialog(false);
      setShowConsentDialog(false);
  };

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
    handleAsyncResult({ ...updatingUser, prevInProgress: previousWorking?.updatingUser }, t('Profile updated'), () => {
      // Redirect to patients page
      dispatch(push('/patients?justLoggedIn=true'));
    });
  }, [updatingUser]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    handleAsyncResult({ ...providingDataDonationConsent, prevInProgress: previousWorking?.providingDataDonationConsent }, t('You have consented to sharing your data'));
  }, [providingDataDonationConsent]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    handleAsyncResult({ ...revokingDataDonationConsent, prevInProgress: previousWorking?.revokingDataDonationConsent }, t('You have stopped sharing your data'));
  }, [revokingDataDonationConsent]); // eslint-disable-line react-hooks/exhaustive-deps

  const formikContext = useFormik({
    initialValues: {
      dataDonate: false,
      dataDonateDestination: '',
    },
    validationSchema: schemas[currentForm],
    onSubmit: values => {
      // TODO: Handle form submission based on the current form step
      if (values.dataDonate) {
        setSubmitting(true);
        setTimeout(() => {
          setSubmitting(false);
        }, 1000);

        // dispatch(actions.async.updateDataDonationAccounts(api, [ TIDEPOOL_DATA_DONATION_ACCOUNT_EMAIL ]));
        console.log('Updating data donation accounts:', [ TIDEPOOL_DATA_DONATION_ACCOUNT_EMAIL ]);

        if (trackMetric) {
          trackMetric('web - big data sign up', { source: 'none', location: 'sign-up' });
        }
      } else if (!isEmpty(values.dataDonateDestination)) {
        setSubmitting(true);
        setTimeout(() => {
          setSubmitting(false);
        }, 1000);

        const addAccounts = [];
        const selectedAccounts = values.dataDonateDestination.split(',');

        forEach(selectedAccounts, accountId => {
          if (accountId) {
            addAccounts.push(`bigdata+${accountId}@tidepool.org`);
            if (trackMetric) trackMetric('web - big data sign up', { source: accountId, location: 'sign-up' });
          }
        });

        // dispatch(actions.async.updateDataDonationAccounts(api, addAccounts));
        console.log('Updating data donation accounts:', addAccounts);
      }
    },
  });

  const { setFieldValue, values } = formikContext;

  useEffect(() => {
    onFormChange(formikContext, currentForm, submitting, initializeConsent);
  }, [values, submitting]); // eslint-disable-line react-hooks/exhaustive-deps

  function initializeConsent() {
    setShowConsentDialog(true);
  }

  function handleConsentDialogConfirm() {
    trackMetric('Data Donation - Provide Consent', { location: 'new patient data donation page' });
  }

  function handleRevokeConsentDialogConfirm() {
    trackMetric('Data Donation - Revoke Consent', { location: 'new patient data donation page' });
  }

  return (
    <Box id="dataDonationForm">
      <DataDonationSlideShow />

      {currentForm === formSteps.dataDonationConsent && (
        <Flex
          id="dataDonationConsentDetails"
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
              caregiverName={personUtils.patientIsOtherPerson(user) ? personUtils.fullName(user) : undefined}
            />
          )}
        </Flex>
      )}

      {currentForm === formSteps.dataDonationDestination && (
        <>
          <Flex
            id="dataDonationDestinationDetails"
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
              {...getCommonFormikFieldProps('dataDonateDestination', formikContext, 'value', false)}
              label={accountTypeText[accountType]?.dataDonateOrganizationsLabel}
              setFieldValue={setFieldValue}
              options={dataDonateDestinationOptions}
            />
          </Box>

          {showRevokeConsentDialog && (
            <DataDonationRevokeConsentDialog
              open={true}
              onClose={() => setShowRevokeConsentDialog(false)}
              onConfirm={handleRevokeConsentDialogConfirm}
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
  context: PropTypes.oneOf(values(formContexts)).isRequired,
};

DataDonationForm.defaultProps = {
  onFormChange: noop,
};

export default DataDonationForm;
