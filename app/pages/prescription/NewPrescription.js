import React from 'react';
import { translate } from 'react-i18next';
import bows from 'bows';
import { Box } from 'rebass/styled-components';

import Checkbox from '../../components/elements/Checkbox';
import Stepper from '../../components/elements/Stepper';

import { accountSteps, AccountType } from './NewPrescriptionAccount';

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
      // {
      //   label: 'Create Patient Account',
      //   onComplete: log('Patient Account Created'),
      //   subSteps: [
      //     {
      //       label: 'Step One',
      //       onComplete: log('Account Step One Complete'),
      //       panelContent: <AccountType />,
      //       disableComplete: !accountValid,
      //     },
      //     {
      //       label: 'Step Two',
      //       onComplete: log('Account Step Two Complete'),
      //       panelContent: renderStepContent('Patient Account Step Two'),
      //     },
      //     {
      //       label: 'Step Three',
      //       onComplete: async () => {
      //         setAccountAsyncState({ pending: true, complete: false });
      //         await sleep(2000);
      //         setAccountAsyncState({ pending: false, complete: true });
      //       },
      //       disableComplete: !accountValid,
      //       asyncState: accountAsyncState,
      //       panelContent: renderStepConfirmation(
      //         'account-checkbox',
      //         'The account details are correct',
      //         accountValid,
      //         (e) => setAccountValid(e.target.checked),
      //       ),
      //     },
      //   ],
      // },
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

  return <Stepper {...stepperProps} />;
};

export default translate()(NewPrescription);
