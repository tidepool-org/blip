import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import bows from 'bows';
import { Box } from 'rebass/styled-components';
import { withFormik, useFormikContext } from 'formik';
import { Persist } from 'formik-persist';
import get from 'lodash/get';

import { getFieldsMeta } from '../../core/forms';
import prescriptionSchema from './prescriptionSchema';

import Checkbox from '../../components/elements/Checkbox';
import Stepper from '../../components/elements/Stepper';

import accountFormSteps from './accountFormSteps';
import prescriptionForm from './prescriptionForm';

/* global Promise */
const log = bows('NewPrescription');
const sleep = m => new Promise(r => setTimeout(r, m));

const NewPrescription = () => {
  const {
    errors,
    getFieldMeta,
    handleSubmit,
    touched,
    values,
  } = useFormikContext();

  log('errors', errors);
  log('touched', touched);
  log('values', values);

  const meta = getFieldsMeta(prescriptionSchema, getFieldMeta)
  log('meta', meta);

  /* WIP Scaffolding Start */
  const initialAsyncState = () => ({ pending: false, complete: false });
  const [finalAsyncState, setFinalAsyncState] = React.useState(initialAsyncState());
  const [prescriptionReviewed, setPrescriptionReviewed] = React.useState(false);

  const renderStepContent = text => <Box>{text}</Box>;

  const renderStepConfirmation = (name, label, checked, onChange) => (
    <Checkbox
      checked={checked}
      name={name}
      label={label}
      onChange={onChange}
      required
    />
  );
  /* WIP Scaffolding End */

  const stepperProps = {
    'aria-label': 'New Prescription Form',
    backText: 'Previous Step',
    completeText: 'Save and Continue',
    id: 'new-prescription',
    onStepChange: (newStep) => {
      setPrescriptionReviewed(false);
      setFinalAsyncState(initialAsyncState());
      log('newStep', newStep.join(','));
    },
    steps: [
      accountFormSteps(meta),
      {
        label: 'Complete Patient Profile',
        panelContent: renderStepContent('Patient Profile Form'),
      },
      {
        label: 'Enter Therapy Settings',
        panelContent: renderStepContent('Therapy Settings Form'),
      },
      {
        label: 'Review and Send Prescription',
        onComplete: async () => {
          setFinalAsyncState({ pending: true, complete: false });
          await sleep(2000);
          setFinalAsyncState({ pending: false, complete: true });
        },
        disableComplete: !prescriptionReviewed || finalAsyncState.complete,
        asyncState: finalAsyncState,
        completed: finalAsyncState.complete,
        completeText: 'Send Prescription',
        panelContent: renderStepConfirmation(
          'review-checkbox',
          'The prescription details are correct',
          prescriptionReviewed,
          (e) => setPrescriptionReviewed(e.target.checked),
        ),
      },
    ],
    themeProps: {
      wrapper: {
        mx: 3,
        my: 2,
        px: 2,
        py: 4,
        bg: 'white',
      },
      panel: {
        padding: 3,
      },
    },
  };

  const params = () => new URLSearchParams(location.search);
  const activeStepParamKey = `${stepperProps.id}-step`;
  const activeStepsParam = params().get(activeStepParamKey);
  const localStorageKey = 'prescriptionForm';

  if (get(localStorage, localStorageKey) && activeStepsParam === null) {
    delete localStorage[localStorageKey];
  }

  return (
    <form onSubmit={handleSubmit}>
      <Stepper {...stepperProps} />
      <Persist name={localStorageKey} />
    </form>
  );
};

NewPrescription.propTypes = {
  location: PropTypes.shape({
    pathname: PropTypes.string,
    search: PropTypes.string,
  }),
};

NewPrescription.defaultProps = {
  location: window.location,
};

export default translate()(withFormik(prescriptionForm)(NewPrescription));
