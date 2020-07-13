import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { browserHistory } from 'react-router';
import bows from 'bows';
import { FastField, withFormik, useFormikContext } from 'formik';
import { Persist } from 'formik-persist';
import get from 'lodash/get';
import map from 'lodash/map';
import noop from 'lodash/noop';
import omit from 'lodash/omit';
import remove from 'lodash/remove';
import slice from 'lodash/slice';
import isEmpty from 'lodash/isEmpty';
import flattenDeep from 'lodash/flattenDeep';
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

const log = bows('PrescriptionForm');

export const prescriptionForm = (bgUnits = defaultUnits.bloodGlucose) => ({
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
      // insulinModel: get(props, 'prescription.latestRevision.attributes.initialSettings.insulinModel', ''),
      // suspendThreshold: {
      //   value: get(props, 'prescription.latestRevision.attributes.initialSettings.suspendThreshold.value', defaultValues(bgUnits).suspendThreshold),
      //   units: defaultUnits.suspendThreshold,
      // },
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

export const PrescriptionForm = props => {
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
    setFieldValue,
    values,
  } = useFormikContext();

  const stepperId = 'prescription-form-steps';
  const bgUnits = get(values, 'initialSettings.bloodGlucoseUnits', defaultUnits.bloodGlucose);
  const pumpId = get(values, 'initialSettings.pumpId');
  const meta = getFieldsMeta(prescriptionSchema(pumpId, bgUnits), getFieldMeta);

  const asyncStates = {
    initial: { pending: false, complete: false },
    pending: { pending: true, complete: false },
    completed: { pending: false, complete: true },
  };

  const params = () => new URLSearchParams(location.search);
  const activeStepParamKey = `${stepperId}-step`;
  const activeStepsParam = params().get(activeStepParamKey);
  const storageKey = 'prescriptionForm';

  const [stepAsyncState, setStepAsyncState] = React.useState(asyncStates.initial);
  const [activeStep, setActiveStep] = React.useState(activeStepsParam ? activeStepsParam[0] : undefined);
  const [activeSubStep, setActiveSubStep] = React.useState(activeStepsParam ? activeStepsParam[1] : undefined);
  const [pendingStep, setPendingStep] = React.useState([]);
  const isSingleStepEdit = !!pendingStep.length;
  let isLastStep = activeStep === stepValidationFields.length - 1;

  // Determine the latest incomplete step, and default to starting there
  React.useEffect(() => {
    if (isUndefined(activeStep) || isUndefined(activeSubStep)) {
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
    }
  }, []);

  // Handle changes to stepper async state for completed prescription creation and revision updates
  React.useEffect(() => {
    const { inProgress, completed, prescriptionId } = get(values, 'id') ? creatingPrescriptionRevision : creatingPrescription;

    if (prescriptionId) setFieldValue('id', prescriptionId);

    if (!inProgress && completed) {
      setStepAsyncState(asyncStates.completed);
      if (isLastStep) {
        // TODO: Set a message to display as a toast on the prescriptions page
        browserHistory.push('/prescriptions');
      }
    }
  }, [creatingPrescription, creatingPrescriptionRevision]);

  const handlers = {
    activeStepUpdate: ([step, subStep], fromStep = []) => {
      setActiveStep(step);
      setActiveSubStep(subStep);
      setPendingStep(fromStep);
    },

    singleStepEditComplete: (cancelFieldUpdates) => {
      const advanceStep = false;

      if (cancelFieldUpdates) {
        resetForm();
      } else {
        resetForm({ values: cloneDeep(values) });
      }

      handlers.activeStepUpdate(pendingStep);

      return advanceStep;
    },

    stepSubmit: () => {
      setStepAsyncState(asyncStates.pending);
      // Delete fields that we never want to send to the backend
      const fieldsToDelete = ['emailConfirm', 'id', 'therapySettingsReviewed'];

      // Also delete any fields from future form steps if empty
      // We can't simply delete all future steps, as the clinician may have returned to the current
      // step via 'Back' button navigation and we don't want to lose existing data previously
      // entered in the later steps.
      if (!isLastStep) {
        const emptyFieldsInFutureSteps = remove(
          flattenDeep(slice(stepValidationFields, activeStep + 1)),
          fieldPath => isEmpty(get(values, fieldPath))
        );

        // Add empty future fields to the array of fieldpaths to delete.
        // N.B. There are some fieldpaths we check that end in '.value' or '.number'. If those keys
        // are empty, we exclude the parent object.
        fieldsToDelete.push(...map(
          emptyFieldsInFutureSteps,
          fieldPath => fieldPath.replace(/\.(value|number)$/, '')
        ));
      }

      const prescriptionAttributes = omit({ ...values }, fieldsToDelete);
      prescriptionAttributes.state = 'draft';

      if (values.id) {
        createPrescriptionRevision(prescriptionAttributes, values.id);
      } else {
        createPrescription(prescriptionAttributes);
      }
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
    id: stepperId,
    onStepChange: (newStep) => {
      setStepAsyncState(asyncStates.initial);
      if (!isSingleStepEdit) handlers.activeStepUpdate(newStep);
      log('Step to', newStep.join(','));
    },
    steps: [
      {
        ...accountFormStepsProps,
        onComplete: isSingleStepEdit ? noop : handlers.stepSubmit,
        asyncState: isSingleStepEdit ? null : stepAsyncState,
        subSteps: subStepProps(accountFormStepsProps.subSteps),
      },
      {
        ...profileFormStepsProps,
        onComplete: isSingleStepEdit ? noop : handlers.stepSubmit,
        asyncState: isSingleStepEdit ? null : stepAsyncState,
        subSteps: subStepProps(profileFormStepsProps.subSteps),
      },
      {
        ...stepProps(therapySettingsFormStepProps),
        onComplete: isSingleStepEdit ? handlers.singleStepEditComplete : handlers.stepSubmit,
        asyncState: isSingleStepEdit ? null : stepAsyncState,
      },
      {
        ...reviewFormStepProps,
        onComplete: handlers.stepSubmit,
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
