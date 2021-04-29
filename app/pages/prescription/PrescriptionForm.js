import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import bows from 'bows';
import moment from 'moment';
import { FastField, withFormik, useFormikContext } from 'formik';
import { PersistFormikValues } from 'formik-persist-values';
import each from 'lodash/each';
import find from 'lodash/find';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import map from 'lodash/map';
import keys from 'lodash/keys';
import noop from 'lodash/noop';
import omit from 'lodash/omit';
import remove from 'lodash/remove';
import slice from 'lodash/slice';
import flattenDeep from 'lodash/flattenDeep';
import cloneDeep from 'lodash/cloneDeep';
import isUndefined from 'lodash/isUndefined';
import isInteger from 'lodash/isInteger';
import isArray from 'lodash/isArray';
import { default as _values } from 'lodash/values';
import includes from 'lodash/includes';
import { utils as vizUtils } from '@tidepool/viz';
import { Box, Flex, Text } from 'rebass/styled-components';

import { fieldsAreValid } from '../../core/forms';
import prescriptionSchema from './prescriptionSchema';
import accountFormSteps from './accountFormSteps';
import profileFormSteps from './profileFormSteps';
import settingsCalculatorFormSteps from './settingsCalculatorFormSteps';
import therapySettingsFormStep from './therapySettingsFormStep';
import reviewFormStep from './reviewFormStep';
import withPrescriptions from './withPrescriptions';
import withDevices from './withDevices';
import Button from '../../components/elements/Button';
import Stepper from '../../components/elements/Stepper';
import i18next from '../../core/language';
import { useToasts } from '../../providers/ToastProvider';
import { Headline } from '../../components/elements/FontStyles';
import { borders } from '../../themes/baseTheme';

import {
  defaultUnits,
  deviceIdMap,
  getPumpGuardrail,
  stepValidationFields,
  validCountryCodes,
} from './prescriptionFormConstants';

const { TextUtil } = vizUtils.text;
const t = i18next.t.bind(i18next);
const log = bows('PrescriptionForm');

let schema;

export const prescriptionForm = (bgUnits = defaultUnits.bloodGlucose) => ({
  mapPropsToStatus: props => ({
    hydratedValues: null,
    isPrescriptionEditFlow: !!props.prescription,
  }),
  mapPropsToValues: props => {
    const selectedPumpId = get(props, 'prescription.latestRevision.attributes.initialSettings.pumpId');
    const pumpId = selectedPumpId || deviceIdMap.omnipodHorizon;
    const pump = find(props.devices.pumps, { id: pumpId });

    return {
      id: get(props, 'prescription.id'),
      state: get(props, 'prescription.latestRevision.attributes.state', 'draft'),
      accountType: get(props, 'prescription.latestRevision.attributes.accountType'),
      firstName: get(props, 'prescription.latestRevision.attributes.firstName'),
      caregiverFirstName: get(props, 'prescription.latestRevision.attributes.caregiverFirstName'),
      caregiverLastName: get(props, 'prescription.latestRevision.attributes.caregiverLastName'),
      lastName: get(props, 'prescription.latestRevision.attributes.lastName'),
      birthday: get(props, 'prescription.latestRevision.attributes.birthday'),
      email: get(props, 'prescription.latestRevision.attributes.email'),
      emailConfirm: get(props, 'prescription.latestRevision.attributes.email'),
      phoneNumber: {
        countryCode: get(props, 'prescription.latestRevision.attributes.phoneNumber.countryCode', validCountryCodes[0]),
        number: get(props, 'prescription.latestRevision.attributes.phoneNumber.number'),
      },
      mrn: get(props, 'prescription.latestRevision.attributes.mrn'),
      sex: get(props, 'prescription.latestRevision.attributes.sex'),
      calculator: {
        method: get(props, 'prescription.latestRevision.attributes.calculator.method'),
        weight: get(props, 'prescription.latestRevision.attributes.calculator.weight'),
        weightUnits: get(props, 'prescription.latestRevision.attributes.calculator.weightUnits', defaultUnits.weight),
        totalDailyDose: get(props, 'prescription.latestRevision.attributes.calculator.totalDailyDose'),
        totalDailyDoseScaleFactor: get(props, 'prescription.latestRevision.attributes.calculator.totalDailyDoseScaleFactor', 1),
      },
      initialSettings: {
        bloodGlucoseUnits: get(props, 'prescription.latestRevision.attributes.initialSettings.bloodGlucoseUnits', defaultUnits.bloodGlucose),
        pumpId: selectedPumpId,
        cgmId: get(props, 'prescription.latestRevision.attributes.initialSettings.cgmId'),
        insulinModel: get(props, 'prescription.latestRevision.attributes.initialSettings.insulinModel'),
        glucoseSafetyLimit: get(props, 'prescription.latestRevision.attributes.initialSettings.glucoseSafetyLimit'),
        basalRateMaximum: {
          value: get(props, 'prescription.latestRevision.attributes.initialSettings.basalRateMaximum.value'),
          units: defaultUnits.basalRate,
        },
        bolusAmountMaximum: {
          value: get(props, 'prescription.latestRevision.attributes.initialSettings.bolusAmountMaximum.value', getPumpGuardrail(pump, 'bolusAmountMaximum.defaultValue', 0)),
          units: defaultUnits.bolusAmount,
        },
        bloodGlucoseTargetSchedule: get(props, 'prescription.latestRevision.attributes.initialSettings.bloodGlucoseTargetSchedule', [{
          start: 0,
        }]),
        bloodGlucoseTargetPhysicalActivity: get(props, 'prescription.latestRevision.attributes.initialSettings.bloodGlucoseTargetPhysicalActivity'),
        bloodGlucoseTargetPreprandial: get(props, 'prescription.latestRevision.attributes.initialSettings.bloodGlucoseTargetPreprandial'),
        basalRateSchedule: get(props, 'prescription.latestRevision.attributes.initialSettings.basalRateSchedule', [{
          start: 0,
        }]),
        carbohydrateRatioSchedule: get(props, 'prescription.latestRevision.attributes.initialSettings.carbohydrateRatioSchedule', [{
          start: 0,
        }]),
        insulinSensitivitySchedule: get(props, 'prescription.latestRevision.attributes.initialSettings.insulinSensitivitySchedule', [{
          start: 0,
        }]),
      },
      training: get(props, 'prescription.latestRevision.attributes.training'),
      therapySettings: get(props, 'prescription.latestRevision.attributes.therapySettings', 'initial'),
      therapySettingsReviewed: get(props, 'prescription.therapySettingsReviewed', false),
    };
  },
  validationSchema: props => {
    if (!schema) schema = prescriptionSchema(
      props.devices,
      get(props, 'prescription.latestRevision.attributes.initialSettings.pumpId'),
      bgUnits,
      get(props, 'prescription.latestRevision.attributes')
    );

    return schema;
  },
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

export const clearCalculator = setFieldValue => {
  setFieldValue('calculator.method', undefined, false)
  setFieldValue('calculator.totalDailyDose', undefined, false)
  setFieldValue('calculator.totalDailyDoseScaleFactor', undefined, false)
  setFieldValue('calculator.weight', undefined, false)
  setFieldValue('calculator.weightUnits', undefined, false)
  setFieldValue('calculator.recommendedBasalRate', undefined, false)
  setFieldValue('calculator.recommendedInsulinSensitivity', undefined, false)
  setFieldValue('calculator.recommendedCarbohydrateRatio', undefined, false)
};

export const PrescriptionForm = props => {
  const {
    t,
    createPrescription,
    createPrescriptionRevision,
    creatingPrescription,
    creatingPrescriptionRevision,
    devices,
    history,
    location,
    prescription,
    trackMetric,
  } = props;

  const {
    handleSubmit,
    resetForm,
    setFieldValue,
    setStatus,
    status,
    values,
  } = useFormikContext();

  const { set: setToast } = useToasts();

  const stepperId = 'prescription-form-steps';
  const bgUnits = get(values, 'initialSettings.bloodGlucoseUnits', defaultUnits.bloodGlucose);
  const pumpId = get(values, 'initialSettings.pumpId', deviceIdMap.omnipodHorizon);
  const pump = find(devices.pumps, { id: pumpId });
  const prescriptionState = get(prescription, 'state', 'draft');
  const isEditable = includes(['draft', 'pending'], prescriptionState);

  React.useEffect(() => {
    // Schema needs to be recreated to account for conditional mins and maxes as values update
    schema = prescriptionSchema(devices, pumpId, bgUnits, values);
  }, [values]);

  const asyncStates = {
    initial: { pending: false, complete: null },
    pending: { pending: true, complete: null },
    completed: { pending: false, complete: true },
    failed: { pending: false, complete: false },
  };

  const params = () => new URLSearchParams(location.search);
  const activeStepParamKey = `${stepperId}-step`;
  const activeStepsParam = params().get(activeStepParamKey);
  const storageKey = 'prescriptionForm';

  const [formPersistReady, setFormPersistReady] = React.useState(false);
  const [stepAsyncState, setStepAsyncState] = React.useState(asyncStates.initial);
  const [activeStep, setActiveStep] = React.useState(activeStepsParam ? parseInt(activeStepsParam.split(',')[0], 10) : undefined);
  const [activeSubStep, setActiveSubStep] = React.useState(activeStepsParam ? parseInt(activeStepsParam.split(',')[1], 10) : undefined);
  const [pendingStep, setPendingStep] = React.useState([]);
  const [initialFocusedInput, setInitialFocusedInput] = React.useState();
  const [singleStepEditValues, setSingleStepEditValues] = React.useState(values);
  const isSingleStepEdit = !!pendingStep.length;
  const isLastStep = activeStep === stepValidationFields.length - 1;
  const isNewPrescription = isEmpty(get(prescription, 'id'));

  React.useEffect(() => {
    // Determine the latest incomplete step, and default to starting there
    if (isEditable && (isUndefined(activeStep) || isUndefined(activeSubStep))) {
      let firstInvalidStep;
      let firstInvalidSubStep;
      let currentStep = 0;
      let currentSubStep = 0;

      while (isUndefined(firstInvalidStep) && currentStep < stepValidationFields.length) {
        while (currentSubStep < stepValidationFields[currentStep].length) {
          if (!fieldsAreValid(stepValidationFields[currentStep][currentSubStep], schema, values)) {
            firstInvalidStep = currentStep;
            firstInvalidSubStep = currentSubStep;
            break;
          }
          currentSubStep++
        }

        currentStep++;
        currentSubStep = 0;
      }

      setActiveStep(isInteger(firstInvalidStep) ? firstInvalidStep : 4);
      setActiveSubStep(isInteger(firstInvalidSubStep) ? firstInvalidSubStep : 0);
    }

    // When a user comes to this component initially, without the active step and subStep set by the
    // Stepper component in the url, or when editing an existing prescription,
    // we delete any persisted state from localStorage.
    if (status.isPrescriptionEditFlow || (get(localStorage, storageKey) && activeStepsParam === null)) {
      delete localStorage[storageKey];
    }

    // Only use the localStorage persistence for new prescriptions - not while editing an existing one.
    setFormPersistReady(!prescription);
  }, []);

  // Save whether or not we are editing a single step to the formik form status for easy reference
  React.useEffect(() => {
    setStatus({
      ...status,
      isSingleStepEdit,
    });
  }, [isSingleStepEdit])

  // Save the hydrated localStorage values to the formik form status for easy reference
  React.useEffect(() => {
    if (formPersistReady) setStatus({
      ...status,
      hydratedValues: JSON.parse(get(localStorage, storageKey, JSON.stringify(status.hydratedValues))),
    });
  }, [formPersistReady]);

  // Handle changes to stepper async state for completed prescription creation and revision updates
  React.useEffect(() => {
    const isRevision = !!get(values, 'id');
    const isDraft = get(values, 'state') === 'draft';
    const { inProgress, completed, notification, prescriptionId } = isRevision ? creatingPrescriptionRevision : creatingPrescription;

    if (prescriptionId) setFieldValue('id', prescriptionId);

    if (!inProgress && completed) {
      setStepAsyncState(asyncStates.completed);
      if (isLastStep) {
        let messageAction = 'sent';
        if (isDraft) messageAction = isRevision ? 'updated' : 'created';

        setToast({
          message: t('You have successfully {{messageAction}} a Tidepool Loop prescription.', { messageAction }),
          variant: 'success',
        });

        history.push('/prescriptions');
      }
    }

    if (!inProgress && completed === false) {
      setToast({
        message: get(notification, 'message'),
        variant: 'danger',
      });

      setStepAsyncState(asyncStates.failed);
    }
  }, [creatingPrescription, creatingPrescriptionRevision]);

  React.useEffect(() => {
    if (stepAsyncState.complete === false) {
      // Allow resubmission of form after a second
      setTimeout(() => {
        setStepAsyncState(asyncStates.initial);
      }, 1000);
    }
  }, [stepAsyncState.complete]);

  const handlers = {
    activeStepUpdate: ([step, subStep], fromStep = [], initialFocusedInput) => {
      setActiveStep(step);
      setActiveSubStep(subStep);
      setPendingStep(fromStep);
      setInitialFocusedInput(initialFocusedInput);
    },

    clearCalculator: clearCalculator.bind(null, setFieldValue),

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
      const fieldsToDelete = [
        'emailConfirm',
        'id',
        'therapySettingsReviewed',
      ];

      // Also delete any fields from future form steps if empty
      // We can't simply delete all future steps, as the clinician may have returned to the current
      // step via 'Back' button navigation and we don't want to lose existing data previously
      // entered in the later steps.
      if (!isLastStep) {
        const emptyFieldsInFutureSteps = remove(
          flattenDeep(slice(stepValidationFields, activeStep + 1)),
          fieldPath => {
            const value = get(values, fieldPath);

            // Return schedule field arrays that are set to the initial values with only a start time
            const scheduleArrays = [
              'initialSettings.bloodGlucoseTargetSchedule',
              'initialSettings.basalRateSchedule',
              'initialSettings.carbohydrateRatioSchedule',
              'initialSettings.insulinSensitivitySchedule',
            ];

            if (includes(scheduleArrays, fieldPath) && value.length === 1) {
              return keys(value[0]).length = 1;
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

      if (isNewPrescription) {
        createPrescription(prescriptionAttributes);
      } else {
        createPrescriptionRevision(prescriptionAttributes, values.id);
      }
    },
  };

  const accountFormStepsProps = accountFormSteps(schema, initialFocusedInput, values);
  const profileFormStepsProps = profileFormSteps(schema, devices, values);
  const settingsCalculatorFormStepsProps = settingsCalculatorFormSteps(schema, handlers, values);
  const therapySettingsFormStepProps = therapySettingsFormStep(schema, pump, values);
  const reviewFormStepProps = reviewFormStep(schema, pump, handlers, values, isEditable);

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
        ...settingsCalculatorFormStepsProps,
        onComplete: handlers.stepSubmit,
        asyncState: stepAsyncState,
        subSteps: subStepProps(settingsCalculatorFormStepsProps.subSteps),
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
        padding: 4,
      },
      panel: {
        padding: 3,
      },
      actions: {
        justifyContent: 'center',
      }
    },
  };

  const title = isNewPrescription ? t('Create New Prescription') : t('Prescription: {{name}}', {
    name: [values.firstName, values.lastName].join(' '),
  });

  return (
    <Box
      as='form'
      id="prescription-form"
      onSubmit={isEditable ? handleSubmit : noop}
      mb={5}
      mx={3}
      bg="white"
    >
      <Flex
        id="prescription-form-header"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
        px={4}
        py={3}
        sx={{
          borderBottom: borders.divider
        }}
      >
        <Button
          id="back-to-prescriptions"
          variant="primary"
          onClick={() => props.history.push('/prescriptions')}
          mr={5}
        >
          {t('Back To Prescriptions')}
        </Button>

        <Text as={Headline} textAlign="center">{title}</Text>

        <Text sx={{ textTransform: 'capitalize' }}>
          {t('Status: {{state}}', { state: prescriptionState })}
        </Text>
      </Flex>

      {isEditable && !isUndefined(activeStep) && <Stepper {...stepperProps} />}

      {!isEditable && (
        <Box px={4}>
          {reviewFormStepProps.panelContent}
        </Box>
      )}

      <FastField type="hidden" name="id" />
      {formPersistReady && <PersistFormikValues persistInvalid name={storageKey} />}
    </Box>
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
