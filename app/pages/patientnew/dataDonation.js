import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import isEmpty from 'lodash/isEmpty';

import Container from '../../components/elements/Container';
import { push } from 'connected-react-router';
import { noop } from 'lodash';
import DataDonationForm, { formContexts, formSteps } from '../patient/DataDonationForm';

export const PatientNewDataDonation = (props) => {
  const { api, trackMetric } = props;
  const { t } = useTranslation();
  const dispatch = useDispatch();

  useEffect(() => {
    if (trackMetric) {
      trackMetric('Viewed Profile Create');
    }
  }, []);

  const loggedInUserId = useSelector((state) => state.blip.loggedInUserId);
  const [submitting, setSubmitting] = useState(false);
  const [currentForm, setCurrentForm] = useState(formSteps.dataDonationConsent);
  const [formikContext, setFormikContext] = useState({});
  const [initializeConsent, setInitializeConsent] = useState(noop);

  const formStepsText = {
    dataDonationConsent: {
      title: t('Consider Donating Your Anonymized Data!'),
      submitText: t('Yes, I\'m Interested'),
    },
    supportedOrganizations: {
      title: t('Thank You for Donating Your Data!'),
      submitText: t('Done'),
    }
  };

  function redirectToPatientData() {
    dispatch(push(`/patients/${loggedInUserId}/data`));
  }

  const formActions = [{
    id: 'submit',
    children: formStepsText[currentForm]?.submitText,
    processing: submitting,
    onClick: () => {
      if ((currentForm === formSteps.dataDonationConsent)) {
        initializeConsent();
      } else {
        if (!isEmpty(formikContext.values?.supportedOrganizations)) {
          formikContext.submitForm();
        } else {
          redirectToPatientData();
        }
      }
    },
  }];

  if (currentForm === formSteps.dataDonationConsent) formActions.unshift({
    id: 'declineDataDonation',
    variant: 'secondary',
    children: t('No, Thanks'),
    onClick: () => redirectToPatientData(),
  });

  function handleFormChange(updatedFormikContext, currentForm, isSubmitting, initializeConsentHandler ) {
    setSubmitting(isSubmitting);
    setCurrentForm(currentForm);
    setFormikContext({ ...updatedFormikContext });
    setInitializeConsent(() => initializeConsentHandler) ;
  }

  return (
    <Container
      title={formStepsText[currentForm]?.title}
      subtitle={formStepsText[currentForm]?.subtitle}
      variant="mediumBordered"
      actions={formActions}
      p={4}
      pt={3}
    >
      <DataDonationForm
        api={api}
        trackMetric={trackMetric}
        formContext={formContexts.newPatient}
        onFormChange={handleFormChange}
        onRevokeConsent={redirectToPatientData}
      />
    </Container>
  );
};

PatientNewDataDonation.propTypes = {
  api: PropTypes.object.isRequired,
  trackMetric: PropTypes.func.isRequired,
};

export default PatientNewDataDonation;
