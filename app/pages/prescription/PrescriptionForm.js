import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import bows from 'bows';
import moment from 'moment';
import { FastField, withFormik, useFormikContext } from 'formik';
import { Persist } from 'formik-persist';
import each from 'lodash/each';
import find from 'lodash/find';
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
import isArray from 'lodash/isArray';
import { default as _values } from 'lodash/values';
import includes from 'lodash/includes';
import { utils as vizUtils } from '@tidepool/viz';

import { fieldsAreValid, getFieldsMeta } from '../../core/forms';
import prescriptionSchema from './prescriptionSchema';
import accountFormSteps from './accountFormSteps';
import profileFormSteps from './profileFormSteps';
import therapySettingsFormStep from './therapySettingsFormStep';
import reviewFormStep from './reviewFormStep';
import withPrescriptions from './withPrescriptions';
import withDevices from './withDevices';
import Stepper from '../../components/elements/Stepper';
import i18next from '../../core/language';

import {
  defaultUnits,
  deviceIdMap,
  getPumpGuardrail,
  pumpRanges,
  stepValidationFields,
  validCountryCodes,
} from './prescriptionFormConstants';

const { TextUtil } = vizUtils.text;
const t = i18next.t.bind(i18next);
const log = bows('PrescriptionForm');

export const prescriptionForm = (bgUnits = defaultUnits.bloodGlucose) => ({
  mapPropsToValues: props => {
    const selectedPumpId = get(props, 'prescription.latestRevision.attributes.initialSettings.pumpId');
    const pumpId = selectedPumpId || deviceIdMap.omnipodHorizon;
    const pump = find(props.devices.pumps, { id: pumpId });
    const ranges = pumpRanges(pump);

    return {
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
        pumpId: selectedPumpId || '',
        cgmId: get(props, 'prescription.latestRevision.attributes.initialSettings.cgmId', ''),
        // insulinModel: get(props, 'prescription.latestRevision.attributes.initialSettings.insulinModel', ''),
        suspendThreshold: {
          value: get(props, 'prescription.latestRevision.attributes.initialSettings.suspendThreshold.value', ''),
          units: defaultUnits.suspendThreshold,
        },
        basalRateMaximum: {
          value: getPumpGuardrail(pump, 'basalRateMaximum.defaultValue', 0),
          units: defaultUnits.basalRate,
        },
        bolusAmountMaximum: {
          value: getPumpGuardrail(pump, 'bolusAmountMaximum.defaultValue', 0),
          units: defaultUnits.bolusAmount,
        },
        bloodGlucoseTargetSchedule: get(props, 'prescription.latestRevision.attributes.initialSettings.bloodGlucoseTargetSchedule', [{
          context: {
            min: get(props, 'prescription.latestRevision.attributes.initialSettings.suspendThreshold.value', ranges.bloodGlucoseTarget.min),
          },
          high: '',
          low: '',
          start: 0,
        }]),
        basalRateSchedule: get(props, 'prescription.latestRevision.attributes.initialSettings.basalRateSchedule', [{
          rate: getPumpGuardrail(pump, 'basalRates.defaultValue', 0.05),
          start: 0,
        }]),
        carbohydrateRatioSchedule: get(props, 'prescription.latestRevision.attributes.initialSettings.carbohydrateRatioSchedule', [{
          amount: '',
          start: 0,
        }]),
        insulinSensitivitySchedule: get(props, 'prescription.latestRevision.attributes.initialSettings.insulinSensitivitySchedule', [{
          amount: '',
          start: 0,
        }]),
      },
      training: get(props, 'prescription.latestRevision.attributes.training'),
      therapySettingsReviewed: get(props, 'prescription.therapySettingsReviewed', false),
    };
  },
  validationSchema: props => prescriptionSchema(
    props.devices,
    get(props, 'prescription.initialSettings.pumpId'),
    bgUnits
  ),
  displayName: 'PrescriptionForm',
});

export const generateTherapySettingsOrderText = (patientRows = [], therapySettingsRows = []) => {
  const textUtil = new TextUtil();

  let textString = textUtil.buildTextLine(t('Tidepool Loop therapy settings order'));

  textString += textUtil.buildTextLine(t('Exported from Tidepool: {{today}}', {
    today: moment().format('MMM D, YYYY'),
  }));

  textString += textUtil.buildTextLine('');

  textString += textUtil.buildTextLine(t('Patient Profile'));
  each(patientRows, row => textString += textUtil.buildTextLine(row));

  each(therapySettingsRows, (row, index) => {
    textString += textUtil.buildTextLine('');

    if (isArray(row.value)) {
      textString += textUtil.buildTextLine(row.label);
      each(row.value, value => textString += textUtil.buildTextLine(value));
    } else {
      textString += textUtil.buildTextLine(row);
    }
  });

  return textString;
};

export const PrescriptionForm = props => {
  const {
    t,
    createPrescription,
    createPrescriptionRevision,
    creatingPrescription,
    creatingPrescriptionRevision,
    devices,
    location,
    prescription,
    trackMetric,
    history,
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
  const pumpId = get(values, 'initialSettings.pumpId', deviceIdMap.omnipodHorizon);
  const pump = find(devices.pumps, { id: pumpId });
  const meta = getFieldsMeta(prescriptionSchema(devices, pumpId, bgUnits), getFieldMeta);

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
  const [activeStep, setActiveStep] = React.useState(activeStepsParam ? parseInt(activeStepsParam[0], 10) : undefined);
  const [activeSubStep, setActiveSubStep] = React.useState(activeStepsParam ? parseInt(activeStepsParam[1], 10) : undefined);
  const [pendingStep, setPendingStep] = React.useState([]);
  const [singleStepEditValues, setSingleStepEditValues] = React.useState(values);
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
        history.push('/prescriptions');
      }
    }
  }, [creatingPrescription, creatingPrescriptionRevision]);

  // Update minimum blood glucose target values when suspendThreshold changes
  const suspendThreshold = get(meta, 'initialSettings.suspendThreshold.value.value');
  const bloodGlucoseTargetSchedule = get(meta, 'initialSettings.bloodGlucoseTargetSchedule.value');
  React.useEffect(() => {
    each(bloodGlucoseTargetSchedule, (schedule, i) => {
      setFieldValue(`initialSettings.bloodGlucoseTargetSchedule.${i}.context.min`, suspendThreshold);
    });
  }, [suspendThreshold]);

  const handlers = {
    activeStepUpdate: ([step, subStep], fromStep = []) => {
      setActiveStep(step);
      setActiveSubStep(subStep);
      setPendingStep(fromStep);
    },

    generateTherapySettingsOrderText,

    handleCopyTherapySettingsClicked: () => {
      trackMetric('Clicked Copy Therapy Settings Order');
    },

    singleStepEditComplete: (cancelFieldUpdates) => {
      if (cancelFieldUpdates) {
        resetForm({values: cloneDeep(singleStepEditValues) });
      } else {
        resetForm({ values: cloneDeep(values) });
      }

      handlers.activeStepUpdate(pendingStep);
    },

    stepSubmit: () => {
      setStepAsyncState(asyncStates.pending);
      // Delete fields that we never want to send to the backend
      const fieldsToDelete = ['emailConfirm', 'id', 'therapySettingsReviewed'];

      for (let i = 0; i < values.initialSettings.bloodGlucoseTargetSchedule.length; i++) {
        fieldsToDelete.push(`initialSettings.bloodGlucoseTargetSchedule.${i}.context`);
      }

      // Also delete any fields from future form steps if empty
      // We can't simply delete all future steps, as the clinician may have returned to the current
      // step via 'Back' button navigation and we don't want to lose existing data previously
      // entered in the later steps.
      if (!isLastStep) {
        const emptyFieldsInFutureSteps = remove(
          flattenDeep(slice(stepValidationFields, activeStep + 1)),
          fieldPath => {
            const value = get(values, fieldPath);
            // Return schedule field arrays that are set to the default initial empty string values
            if (isArray(value) && value.length === 1) {
              return includes(_values(value[0]), '');
            }
            // Return empty values for non-array fields
            return isEmpty(value);
          }
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
  const profileFormStepsProps = profileFormSteps(meta, devices);
  const therapySettingsFormStepProps = therapySettingsFormStep(meta, pump);
  const reviewFormStepProps = reviewFormStep(meta, pump, handlers);

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
    disableDefaultStepHandlers: isSingleStepEdit,
    id: stepperId,
    location: get(window, 'location', location),
    onStepChange: (newStep) => {
      setStepAsyncState(asyncStates.initial);
      if (isSingleStepEdit) {
        setSingleStepEditValues(values)
      } else {
        handlers.activeStepUpdate(newStep);
      }

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

export default withPrescriptions(withDevices(withFormik(prescriptionForm())(translate()(PrescriptionForm))));
