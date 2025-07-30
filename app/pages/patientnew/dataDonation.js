import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { Trans, useTranslation } from 'react-i18next';
import * as yup from 'yup';
import forEach from 'lodash/forEach';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import keys from 'lodash/keys';
import { useFormik } from 'formik';
import { Box, Flex, Link } from 'theme-ui';

import { Paragraph1 } from '../../components/elements/FontStyles';
import MultiSelect from '../../components/elements/MultiSelect';
import Checkbox from '../../components/elements/Checkbox';
import Container from '../../components/elements/Container';
import * as actions from '../../redux/actions';
import { usePrevious } from '../../core/hooks';
import { getCommonFormikFieldProps, fieldsAreValid } from '../../core/forms';
import { useToasts } from '../../providers/ToastProvider';
import { push } from 'connected-react-router';
import { colors } from '../../themes/baseTheme';
import { DataDonationSlideShow } from '../../components/elements/SlideShow';
import personUtils from '../../core/personutils';

import {
  DATA_DONATION_NONPROFITS,
  TIDEPOOL_DATA_DONATION_ACCOUNT_EMAIL,
  URL_BIG_DATA_DONATION_INFO,
} from '../../core/constants';

const dataDonateDestinationOptions = DATA_DONATION_NONPROFITS(); // eslint-disable-line new-cap

const dataDonationConsentSchema = yup.object().shape({
  dataDonate: yup.boolean(),
});

const dataDonationDestinationSchema = yup.object().shape({
  dataDonateDestination: yup.string(),
});

const formSteps = {
  dataDonationConsent: 'dataDonationConsent',
  dataDonationDestination: 'dataDonationDestination',
}

const schemas = {
  dataDonationConsent: dataDonationConsentSchema,
  dataDonationDestination: dataDonationDestinationSchema,
};

export const PatientNewDataDonation = (props) => {
  const { api, trackMetric } = props;
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
  const [submitting, setSubmitting] = useState(false);
  const [currentForm, setCurrentForm] = useState(formSteps.dataDonationConsent);
  // const [currentForm, setCurrentForm] = useState(formSteps.dataDonationDestination);

  console.log('user', user);

  function redirectToPatientData() {
    dispatch(push(`/patients/${loggedInUserId}/data`));
  }

  useEffect(() => {
    const {
      inProgress,
      completed,
      notification,
    } = working.updatingUser;

    const prevInProgress = get(
      previousWorking,
      'updatingUser.inProgress'
    );

    if (!inProgress && completed !== null && prevInProgress) {
      setSubmitting(false);

      if (notification) {
        setToast({
          message: notification.message,
          variant: 'danger',
        });
      } else {
        setToast({
          message: t('Profile updated'),
          variant: 'success',
        });

        // Redirect to patients page
        dispatch(push('/patients?justLoggedIn=true'));
      }
    }
  }, [working.updatingUser]);

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

  const { values, submitForm, setFieldValue, setFieldTouched } = formikContext;
  const accountType = personUtils.patientIsOtherPerson(user) ? 'personal' : 'caregiver';

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

  const formStepsText = {
    dataDonationConsent: {
      title: t('Consider Donating Your Anonymized Data!'),
    },
    dataDonationDestination: {
      title: t('Thank You for Donating Your Data!'),
    }
  }

  const formActions = [{
    id: 'submit',
    children: t('Next'),
    processing: submitting,
    disabled: !fieldsAreValid(
      keys(schemas[currentForm].fields),
      schemas[currentForm],
      values
    ),
    onClick: () => {
      if ((currentForm === formSteps.accountDetails && accountType === 'viewOnly') || currentForm === formSteps.dataDonation) {
        submitForm();
      } else {
        setCurrentForm(currentForm === formSteps.accountDetails ? formSteps.patientDetails : formSteps.dataDonation);
      }
    },
  }];

  if (currentForm === formSteps.dataDonationConsent) formActions.unshift({
    id: 'back',
    variant: 'secondary',
    children: t('No, Thanks'),
    onClick: () => redirectToPatientData(),
  });

  return (
    <Container
      title={formStepsText[currentForm]?.title}
      subtitle={formStepsText[currentForm]?.subtitle}
      variant="mediumBordered"
      actions={formActions}
      p={4}
      pt={3}
    >

      <Box id="new-patient-data-donation-form">
        <DataDonationSlideShow />

        {currentForm === formSteps.dataDonationConsent && (
          <Box id="data-donation-consent-form">

            <Box>
              <Paragraph1 sx={{ fontWeight: 'medium', textAlign: 'center' }}>
                <Trans i18nKey="html.data-donation-details">
                  {accountTypeText[accountType]?.dataDonateTitle}&nbsp;
                  <Link className="data-donation-details-link" href={URL_BIG_DATA_DONATION_INFO} target="_blank">Learn more</Link>.
                </Trans>
              </Paragraph1>
            </Box>

            <Flex mb={3} sx={{ textAlign: 'center'}}>
              <Checkbox
                {...getCommonFormikFieldProps('dataDonate', formikContext, 'checked')}
                bg="white"
                themeProps={{ sx: { bg: 'transparent' } }}
                label={accountTypeText[accountType]?.dataDonateConsentLabel}
                // disabled={!isEmpty(values.dataDonateDestination)}
                sx={{
                  boxShadow: `0 0 0 2px ${colors.lightestGrey} inset`,
                }}
              />
            </Flex>
          </Box>
        )}

        {currentForm === formSteps.dataDonationDestination && (
          <Box id="data-donation-destination-form">
            <MultiSelect
              {...getCommonFormikFieldProps('dataDonateDestination', formikContext, 'value', false)}
              label={accountTypeText[accountType]?.dataDonateOrganizationsLabel}
              onChange={value => {
                // Ensure that the donate checkbox is checked if there are nonprofits selected
                if (!isEmpty(value) && !values.dataDonate) {
                  setFieldValue('dataDonate', true);
                }
              }}
              setFieldValue={setFieldValue}
              isDisabled={!values.dataDonate}
              options={dataDonateDestinationOptions}
              themeProps={{
                width: '100%',
              }}
            />
          </Box>
        )}
      </Box>
    </Container>
  );
};

PatientNewDataDonation.propTypes = {
  api: PropTypes.object.isRequired,
  trackMetric: PropTypes.func.isRequired,
};

export default PatientNewDataDonation;
