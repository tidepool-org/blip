import React from 'react';
import { translate } from 'react-i18next';
import bows from 'bows';
import { Box } from 'rebass/styled-components';
import { withFormik, useFormikContext } from 'formik';

import Checkbox from '../../components/elements/Checkbox';
import Stepper from '../../components/elements/Stepper';

import accountSteps from './NewPrescriptionAccount';
import prescriptionForm from './prescriptionForm';

/* global Promise */
const log = bows('NewPrescription');
const sleep = m => new Promise(r => setTimeout(r, m));

const NewPrescription = () => {
  const initialAsyncState = () => ({ pending: false, complete: false });
  const [accountAsyncState, setAccountAsyncState] = React.useState(initialAsyncState());
  const [finalAsyncState, setFinalAsyncState] = React.useState(initialAsyncState());

  const [accountValid, setAccountValid] = React.useState(false);
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

  const stepperProps = {
    'aria-label': 'New Prescription Form',
    backText: 'Previous Step',
    completeText: 'Save and Continue',
    id: 'new-prescription',
    onStepChange: () => {
      setPrescriptionReviewed(false);
      setFinalAsyncState(initialAsyncState());
    },
    steps: [
      accountSteps(),
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

  const { handleSubmit } = useFormikContext();

  return (
    <form onSubmit={handleSubmit}>
      <Stepper {...stepperProps} />
    </form>
  );
};

export default translate()(withFormik(prescriptionForm)(NewPrescription));
