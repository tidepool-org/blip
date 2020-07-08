import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import bows from 'bows';
import { FastField, withFormik, useFormikContext } from 'formik';
import { Persist } from 'formik-persist';
import get from 'lodash/get';
import map from 'lodash/map';
import noop from 'lodash/noop';
import cloneDeep from 'lodash/cloneDeep';
import isUndefined from 'lodash/isUndefined';
import isInteger from 'lodash/isInteger';

import { fieldsAreValid, getFieldsMeta } from '../../core/forms';
import prescriptionSchema from './prescriptionSchema';
import accountFormSteps from './accountFormSteps';
import profileFormSteps from './profileFormSteps';
import therapySettingsFormStep from './therapySettingsFormStep';
import reviewFormStep from './reviewFormStep';
import withPrescriptions from './withPrescriptions';
import Stepper from '../../components/elements/Stepper';

import {
  defaultUnits,
  defaultValues,
  stepValidationFields,
  validCountryCodes,
} from './prescriptionFormConstants';


/* global crypto, Uint8Array, Promise */

const log = bows('PrescriptionForm');

const prescriptionForm = (bgUnits = defaultUnits.bloodGlucose) => ({
  mapPropsToValues: props => ({
    id: get(props, 'prescription.id', ''),
    state: get(props, 'prescription.latestRevision.attributes.state', 'draft'),
    // type: get(props, 'prescription.latestRevision.attributes.type', ''),
    firstName: get(props, 'prescription.latestRevision.attributes.firstName', ''),
    lastName: get(props, 'prescription.latestRevision.attributes.lastName', ''),
    birthday: get(props, 'prescription.latestRevision.attributes.birthday', ''),
    email: get(props, 'prescription.latestRevision.attributes.email', ''),
    emailConfirm: get(props, 'prescription.latestRevision.attributes.email', ''),
    phoneNumber: {
      countryCode: get(props, 'prescription.latestRevision.attributes.phoneNumber.countryCode', validCountryCodes[0]),
      number: get(props, 'prescription.latestRevision.attributes.phoneNumber.number', ''),
    },
    mrn: get(props, 'prescription.latestRevision.attributes.mrn', ''),
    sex: get(props, 'prescription.latestRevision.attributes.sex', ''),
    initialSettings: {
      bloodGlucoseUnits: get(props, 'prescription.latestRevision.attributes.initialSettings.bloodGlucoseUnits', defaultUnits.bloodGlucose),
      pumpId: get(props, 'prescription.latestRevision.attributes.initialSettings.pumpId', ''),
      cgmId: get(props, 'prescription.latestRevision.attributes.initialSettings.cgmId', ''),
      insulinModel: get(props, 'prescription.latestRevision.attributes.initialSettings.insulinModel', ''),
      suspendThreshold: {
        value: get(props, 'prescription.latestRevision.attributes.initialSettings.suspendThreshold.value', defaultValues(bgUnits).suspendThreshold),
        units: defaultUnits.suspendThreshold,
      },
      basalRateMaximum: {
        value: get(props, 'prescription.latestRevision.attributes.initialSettings.basalRateMaximum.value', defaultValues(bgUnits).basalRateMaximum),
        units: defaultUnits.basalRate,
      },
      bolusAmountMaximum: {
        value: get(props, 'prescription.latestRevision.attributes.initialSettings.bolusAmountMaximum.value', defaultValues(bgUnits).bolusAmountMaximum),
        units: defaultUnits.bolusAmount,
      },
      bloodGlucoseTargetSchedule: get(props, 'prescription.latestRevision.attributes.initialSettings.bloodGlucoseTargetSchedule', [{
        high: defaultValues(bgUnits).bloodGlucoseTarget.high,
        low: defaultValues(bgUnits).bloodGlucoseTarget.low,
        start: 0,
      }]),
      basalRateSchedule: get(props, 'prescription.latestRevision.attributes.initialSettings.basalRateSchedule', [{
        rate: defaultValues(bgUnits).basalRate,
        start: 0,
      }]),
      carbohydrateRatioSchedule: get(props, 'prescription.latestRevision.attributes.initialSettings.carbohydrateRatioSchedule', [{
        amount: defaultValues(bgUnits).carbRatio,
        start: 0,
      }]),
      insulinSensitivitySchedule: get(props, 'prescription.latestRevision.attributes.initialSettings.insulinSensitivitySchedule', [{
        amount: defaultValues(bgUnits).insulinSensitivityFactor,
        start: 0,
      }]),
    },
    training: get(props, 'prescription.latestRevision.attributes.training', ''),
    therapySettingsReviewed: get(props, 'prescription.therapySettingsReviewed', false),
  }),
  validationSchema: props => prescriptionSchema(
    get(props, 'prescription.initialSettings.pumpId'),
    bgUnits
  ),
  displayName: 'PrescriptionForm',
});

const PrescriptionForm = props => {
  const {
    t,
    createPrescription,
    createPrescriptionRevision,
    creatingPrescription,
    creatingPrescriptionRevision,
    prescription,
  } = props;

  const {
    getFieldMeta,
    handleSubmit,
    resetForm,
    values,
  } = useFormikContext();

  const bgUnits = get(values, 'initialSettings.bloodGlucoseUnits', defaultUnits.bloodGlucose);
  const pumpId = get(values, 'initialSettings.pumpId');
  const meta = getFieldsMeta(prescriptionSchema(pumpId, bgUnits), getFieldMeta);

  const asyncStates = {
    initial: { pending: false, complete: false },
    pending: { pending: true, complete: false },
    completed: { pending: false, complete: true },
  };

  const [stepAsyncState, setStepAsyncState] = React.useState(asyncStates.initial);

  const handleStepSubmit = async () => {
    const prescriptionAttributes = { ...values };
    delete prescriptionAttributes.emailConfirm;
    delete prescriptionAttributes.id;
    delete prescriptionAttributes.therapySettingsReviewed;

    prescriptionAttributes.state = 'draft';

    if (values.id) {
      createPrescriptionRevision(prescriptionAttributes, values.id);
    } else {
      createPrescription(prescriptionAttributes)
    }
  };

  const [activeStep, setActiveStep] = React.useState();
  const [activeSubStep, setActiveSubStep] = React.useState();
  const [pendingStep, setPendingStep] = React.useState([]);
  const isSingleStepEdit = !!pendingStep.length;

  // Determine the latest incomplete step, and default to starting there
  React.useEffect(() => {
    let firstInvalidStep;
    let firstInvalidSubStep;
    let currentStep = 0;
    let currentSubStep = 0;

    while (isUndefined(firstInvalidStep) && currentStep < stepValidationFields.length) {
      while (currentSubStep < stepValidationFields[currentStep].length) {
        if (!fieldsAreValid(stepValidationFields[currentStep][currentSubStep], meta)) {
          firstInvalidStep = currentStep;
          firstInvalidSubStep = currentSubStep;
          break;
        }
        currentSubStep++
      }

      currentStep++;
      currentSubStep = 0;
    }

    setActiveStep(isInteger(firstInvalidStep) ? firstInvalidStep : 3);
    setActiveSubStep(isInteger(firstInvalidSubStep) ? firstInvalidSubStep : 0);
  }, []);

  // Handle changes to working state for prescription creation and revision updates
  React.useEffect(() => {
    if (get(prescription, 'id')) {
      if (get(creatingPrescriptionRevision, 'inProgress')) {
        setStepAsyncState(asyncStates.pending);
      } else if (get(creatingPrescriptionRevision, 'completed')) {
        setStepAsyncState(asyncStates.completed);
      }
    } else {
      if (get(creatingPrescription, 'inProgress')) {
        setStepAsyncState(asyncStates.pending);
      } else if (get(creatingPrescription, 'completed')) {
        setStepAsyncState(asyncStates.completed);
      }
    }
  }, [creatingPrescription, creatingPrescriptionRevision])

  const handlers = {
    activeStepUpdate: ([step, subStep], fromStep = []) => {
      setActiveStep(step);
      setActiveSubStep(subStep);
      setPendingStep(fromStep);
    },

    singleStepEditComplete: (cancelFieldUpdates) => {
      if (cancelFieldUpdates) {
        resetForm();
      } else {
        resetForm({ values: cloneDeep(values) });
      }

      handlers.activeStepUpdate(pendingStep);
    },
  };

  const accountFormStepsProps = accountFormSteps(meta);
  const profileFormStepsProps = profileFormSteps(meta);
  const therapySettingsFormStepProps = therapySettingsFormStep(meta);
  const reviewFormStepProps = reviewFormStep(meta, handlers);

  const stepProps = step => ({
    ...step,
    completeText: isSingleStepEdit ? t('Update and Review') : step.completeText,
    backText: isSingleStepEdit ? t('Cancel Update') : step.backText,
    hideBack: isSingleStepEdit ? false : step.hideBack,
    disableBack: isSingleStepEdit ? false : step.disableBack,
    onComplete: isSingleStepEdit ? handlers.singleStepEditComplete : step.onComplete,
    onBack: isSingleStepEdit ? handlers.singleStepEditComplete.bind(null, true) : step.onBack,
  });

  const subStepProps = subSteps => map(subSteps, subStep => stepProps(subStep));

  const stepperProps = {
    activeStep,
    activeSubStep,
    'aria-label': t('New Prescription Form'),
    backText: t('Previous Step'),
    completeText: t('Save and Continue'),
    id: 'prescription-form-steps',
    onStepChange: (newStep) => {
      setStepAsyncState(asyncStates.initial);
      log('Step to', newStep.join(','));
    },
    steps: [
      {
        ...accountFormStepsProps,
        onComplete: isSingleStepEdit ? noop : handleStepSubmit,
        asyncState: isSingleStepEdit ? null : stepAsyncState,
        subSteps: subStepProps(accountFormStepsProps.subSteps),
      },
      {
        ...profileFormStepsProps,
        onComplete: isSingleStepEdit ? noop : handleStepSubmit,
        asyncState: isSingleStepEdit ? null : stepAsyncState,
        subSteps: subStepProps(profileFormStepsProps.subSteps),
      },
      {
        ...stepProps(therapySettingsFormStepProps),
        onComplete: isSingleStepEdit ? handlers.singleStepEditComplete : handleStepSubmit,
        asyncState: isSingleStepEdit ? null : stepAsyncState,
      },
      {
        ...reviewFormStepProps,
        onComplete: handleStepSubmit,
        asyncState: stepAsyncState,
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
      actions: {
        justifyContent: 'center',
      }
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
  if (prescription || (get(localStorage, storageKey) && activeStepsParam === null)) delete localStorage[storageKey];

  return (
    <form id="prescription-form" onSubmit={handleSubmit}>
      <FastField type="hidden" name="id" />
      {!isUndefined(activeStep) && <Stepper {...stepperProps} />}
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

export default withPrescriptions(withFormik(prescriptionForm())(translate()(PrescriptionForm)));
