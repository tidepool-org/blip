import React from 'react';
import PropTypes from 'prop-types';
import { browserHistory } from 'react-router';
import { translate } from 'react-i18next';
import bows from 'bows';
import { Box } from 'rebass/styled-components';
import { FastField, withFormik, useFormikContext } from 'formik';
import { Persist } from 'formik-persist';
import get from 'lodash/get';
import cloneDeep from 'lodash/cloneDeep';

import { getFieldsMeta } from '../../core/forms';
import { useLocalStorage } from '../../core/hooks';
import prescriptionSchema from './prescriptionSchema';
import accountFormSteps from './accountFormSteps';
import profileFormSteps from './profileFormSteps';

import Checkbox from '../../components/elements/Checkbox';
import Stepper from '../../components/elements/Stepper';

/* global crypto, Uint8Array, Promise */

const log = bows('PrescriptionForm');

const prescriptionForm = {
  mapPropsToValues: props => ({
    id: get(props, 'routeParams.id', ''),
    state: get(props, 'prescription.state', 'draft'),
    type: get(props, 'prescription.type', ''),
    firstName: get(props, 'prescription.firstName', ''),
    lastName: get(props, 'prescription.lastName', ''),
    birthday: get(props, 'prescription.birthday', ''),
    email: get(props, 'prescription.email', ''),
    emailConfirm: get(props, 'prescription.email', ''),
    phoneNumber: {
      countryCode: get(props, 'prescription.phoneNumber.countryCode', 1),
      number: get(props, 'prescription.phoneNumber.number', ''),
    },
    mrn: get(props, 'prescription.mrn', ''),
    sex: get(props, 'prescription.sex', ''),
    initialSettings: {
      pumpType: get(props, 'prescription.initialSettings.pumpType', ''),
      cgmType: get(props, 'prescription.initialSettings.cgmType', ''),
    },
  }),
  validationSchema: prescriptionSchema,
  displayName: 'PrescriptionForm',
}

const withPrescription = Component => props => {
  // Until backend service is ready, get prescriptions from localStorage
  const [prescriptions] = useLocalStorage('prescriptions', {});

  const id = get(props, 'routeParams.id', '');
  const prescription = get(prescriptions, id);

  return <Component prescription={prescription} {...props} />
};

const PrescriptionForm = props => {
  const { t } = props;

  const {
    getFieldMeta,
    setFieldValue,
    handleSubmit,
    values,
  } = useFormikContext();

  const meta = getFieldsMeta(prescriptionSchema, getFieldMeta);

  /* WIP Scaffolding Start */
  const sleep = m => new Promise(r => setTimeout(r, m));

  // Until backend service is ready, save prescriptions to localStorage
  const [prescriptions, setPrescriptions] = useLocalStorage('prescriptions', {});

  const initialAsyncState = () => ({ pending: false, complete: false });
  const [finalAsyncState, setFinalAsyncState] = React.useState(initialAsyncState());
  const [stepAsyncState, setStepAsyncState] = React.useState(initialAsyncState());
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

  const handleStepSubmit = async () => {
    function uuidv4() {
      return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
        (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16) // eslint-disable-line no-bitwise
      );
    }

    const prescriptionValues = values => {
      const prescription = { ...values };
      delete prescription.emailConfirm;
      prescription.state = 'draft';
      return prescription;
    };

    setStepAsyncState({ pending: true, complete: false });

    const id = values.id || uuidv4();
    if (!values.id) setFieldValue('id', id);

    await sleep(1000);

    setPrescriptions({
      ...prescriptions,
      [id]: {
        ...prescriptionValues(values),
        id,
      },
    });

    setStepAsyncState({ pending: false, complete: true });
  };
  /* WIP Scaffolding End */

  const stepperProps = {
    'aria-label': t('New Prescription Form'),
    backText: t('Previous Step'),
    completeText: t('Save and Continue'),
    id: 'new-prescription',
    onStepChange: (newStep) => {
      setPrescriptionReviewed(false);
      setFinalAsyncState(initialAsyncState());
      setStepAsyncState(initialAsyncState());
      log('Step to', newStep.join(','));
    },
    steps: [
      {
        ...accountFormSteps(meta),
        onComplete: handleStepSubmit,
        asyncState: stepAsyncState,
      },
      {
        ...profileFormSteps(meta, setFieldValue),
        onComplete: handleStepSubmit,
        asyncState: stepAsyncState,
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
        completeText: finalAsyncState.complete ? t('Prescription Sent') : t('Send Prescription'),
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
  const storageKey = 'prescriptionForm';

  // When a user comes to this component initially, without the active step and subStep set by the
  // Stepper component in the url, we delete any persisted state from localStorage.
  // As well, when editing an existing prescription, we delete it so that the current prescription
  // values replace whatever values were previously stored
  if (props.prescription || (get(localStorage, storageKey) && activeStepsParam === null)) delete localStorage[storageKey];

  return (
    <form onSubmit={handleSubmit}>
      <FastField type="hidden" name="id" />
      <Stepper {...stepperProps} />
      <Persist name={storageKey} />
    </form>
  );
};

PrescriptionForm.propTypes = {
  location: PropTypes.shape({
    pathname: PropTypes.string,
    search: PropTypes.string,
  }),
};

PrescriptionForm.defaultProps = {
  location: window.location,
};

export default translate()(withPrescription(withFormik(prescriptionForm)(PrescriptionForm)));
