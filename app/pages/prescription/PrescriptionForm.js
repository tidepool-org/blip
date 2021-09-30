import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import bows from 'bows';
import moment from 'moment';
import { FastField, withFormik, useFormikContext } from 'formik';
import { PersistFormikValues } from 'formik-persist-values';
import each from 'lodash/each';
import find from 'lodash/find';
import forEach from 'lodash/forEach';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import map from 'lodash/map';
import keyBy from 'lodash/keyBy';
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
import canonicalize from 'canonicalize';
import { sha512 } from 'crypto-hash';

import { fieldsAreValid } from '../../core/forms';
import prescriptionSchema from './prescriptionSchema';
import accountFormSteps from './accountFormSteps';
import profileFormSteps from './profileFormSteps';
import settingsCalculatorFormSteps from './settingsCalculatorFormSteps';
import therapySettingsFormStep from './therapySettingsFormStep';
import reviewFormStep from './reviewFormStep';
import Button from '../../components/elements/Button';
import Pill from '../../components/elements/Pill';
import Stepper from '../../components/elements/Stepper';
import i18next from '../../core/language';
import { useToasts } from '../../providers/ToastProvider';
import { Headline } from '../../components/elements/FontStyles';
import { borders } from '../../themes/baseTheme';
import { useIsFirstRender } from '../../core/hooks';
import * as actions from '../../redux/actions';
import { components as vizComponents } from '@tidepool/viz';

import {
  defaultUnits,
  deviceIdMap,
  prescriptionStateOptions,
  stepValidationFields,
  validCountryCodes,
} from './prescriptionFormConstants';

const { TextUtil } = vizUtils.text;
const { Loader } = vizComponents;
const t = i18next.t.bind(i18next);
const log = bows('PrescriptionForm');

let schema;

const prescriptionFormWrapper = Component => props => {
  const { api } = props;
  const dispatch = useDispatch();
  const loggedInUserId = useSelector((state) => state.blip.loggedInUserId);
  const devices = useSelector((state) => state.blip.devices);
  const prescriptions = useSelector((state) => state.blip.prescriptions);
  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);
  const prescriptionId = props.match?.params?.id;
  const prescription = get(keyBy(prescriptions, 'id'), prescriptionId);

  const {
    fetchingDevices,
    fetchingClinicPrescriptions,
  } = useSelector((state) => state.blip.working);

   // Fetchers
   useEffect(() => {
    if (loggedInUserId && selectedClinicId) {
      forEach([
        {
          workingState: fetchingDevices,
          action: actions.async.fetchDevices.bind(null, api),
        },
        {
          workingState: fetchingClinicPrescriptions,
          action: actions.async.fetchClinicPrescriptions.bind(null, api, selectedClinicId),
        },
      ], ({ workingState, action }) => {
        if (
          !workingState.inProgress &&
          !workingState.completed &&
          !workingState.notification
        ) {
          dispatch(action());
        }
      });
    }
  }, [loggedInUserId, selectedClinicId]);

  return fetchingDevices.completed && fetchingClinicPrescriptions.completed
    ? <Component prescription={prescription} devices={devices} {...props} />
    : <Loader />;
}

export const prescriptionForm = (bgUnits = defaultUnits.bloodGlucose) => ({
  mapPropsToStatus: props => ({
    hydratedValues: null,
    isPrescriptionEditFlow: !!props.prescription,
  }),
  mapPropsToValues: props => {
    const selectedPumpId = get(props, 'prescription.latestRevision.attributes.initialSettings.pumpId');

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
          value: get(props, 'prescription.latestRevision.attributes.initialSettings.bolusAmountMaximum.value'),
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

export const clearCalculatorInputs = formikContext => {
  formikContext.setFieldValue('calculator.totalDailyDose', undefined, false);
  formikContext.setFieldTouched('calculator.totalDailyDose', false);
  formikContext.setFieldValue('calculator.totalDailyDoseScaleFactor', 1, false);
  formikContext.setFieldTouched('calculator.totalDailyDoseScaleFactor', false);
  formikContext.setFieldValue('calculator.weight', undefined, false);
  formikContext.setFieldTouched('calculator.weight', false);
  formikContext.setFieldValue('calculator.weightUnits', defaultUnits.weight, false);
  formikContext.setFieldTouched('calculator.weightUnits', false);
};

export const clearCalculatorResults = formikContext => {
  formikContext.setFieldValue('calculator.recommendedBasalRate', undefined, false);
  formikContext.setFieldTouched('calculator.recommendedBasalRate', false);
  formikContext.setFieldValue('calculator.recommendedInsulinSensitivity', undefined, false);
  formikContext.setFieldTouched('calculator.recommendedInsulinSensitivity', false);
  formikContext.setFieldValue('calculator.recommendedCarbohydrateRatio', undefined, false);
  formikContext.setFieldTouched('calculator.recommendedCarbohydrateRatio', false);
};

export const clearCalculator = formikContext => {
  formikContext.setFieldValue('calculator.method', undefined, false);
  formikContext.setFieldTouched('calculator.method', false);
  clearCalculatorInputs(formikContext);
  clearCalculatorResults(formikContext);
};

export const PrescriptionForm = props => {
  const {
    t,
    api,
    devices,
    history,
    location,
    prescription,
    trackMetric,
  } = props;

  const dispatch = useDispatch();
  const formikContext = useFormikContext();

  const {
    handleSubmit,
    resetForm,
    setFieldValue,
    setStatus,
    status,
    values,
  } = formikContext;

  const isFirstRender = useIsFirstRender();
  const { set: setToast } = useToasts();
  const loggedInUserId = useSelector((state) => state.blip.loggedInUserId);
  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);
  const stepperId = 'prescription-form-steps';
  const bgUnits = get(values, 'initialSettings.bloodGlucoseUnits', defaultUnits.bloodGlucose);
  const pumpId = get(values, 'initialSettings.pumpId', deviceIdMap.omnipodHorizon);
  const pump = find(devices.pumps, { id: pumpId });
  const prescriptionState = get(prescription, 'state', 'draft');
  const prescriptionStates = keyBy(prescriptionStateOptions, 'value');
  const isEditable = includes(['draft', 'pending'], prescriptionState);
  const clinics = useSelector((state) => state.blip.clinics);
  const clinic = get(clinics, selectedClinicId);
  const isPrescriber = includes(get(clinic, ['clinicians', loggedInUserId, 'roles'], []), 'PRESCRIBER');

  const {
    creatingPrescription,
    creatingPrescriptionRevision,
  } = useSelector((state) => state.blip.working);

  useEffect(() => {
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

  const [formPersistReady, setFormPersistReady] = useState(false);
  const [stepAsyncState, setStepAsyncState] = useState(asyncStates.initial);
  const [activeStep, setActiveStep] = useState(activeStepsParam ? parseInt(activeStepsParam.split(',')[0], 10) : undefined);
  const [activeSubStep, setActiveSubStep] = useState(activeStepsParam ? parseInt(activeStepsParam.split(',')[1], 10) : undefined);
  const [pendingStep, setPendingStep] = useState([]);
  const [initialFocusedInput, setInitialFocusedInput] = useState();
  const [singleStepEditValues, setSingleStepEditValues] = useState(values);
  const isSingleStepEdit = !!pendingStep.length;
  const isLastStep = activeStep === stepValidationFields.length - 1;
  const isNewPrescription = isEmpty(get(values, 'id'));

  useEffect(() => {
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
  useEffect(() => {
    setStatus({
      ...status,
      isSingleStepEdit,
    });
  }, [isSingleStepEdit])

  // Save the hydrated localStorage values to the formik form status for easy reference
  useEffect(() => {
    if (formPersistReady) setStatus({
      ...status,
      hydratedValues: JSON.parse(get(localStorage, storageKey, JSON.stringify(status.hydratedValues))),
    });
  }, [formPersistReady]);

  // Handle changes to stepper async state for completed prescription creation and revision updates
  useEffect(() => {
    const isRevision = !!get(values, 'id');
    const isDraft = get(values, 'state') === 'draft';
    const { inProgress, completed, notification, prescriptionId } = isRevision ? creatingPrescriptionRevision : creatingPrescription;

    if (prescriptionId) setFieldValue('id', prescriptionId);

    if (!isFirstRender && !inProgress) {
      if (completed) {
        setStepAsyncState(asyncStates.completed);
        if (isLastStep) {
          let messageAction = 'sent';
          if (isDraft) messageAction = isRevision ? 'updated' : 'created';

          setToast({
            message: t('You have successfully {{messageAction}} a Tidepool Loop prescription.', { messageAction }),
            variant: 'success',
          });

          history.push('/clinic-workspace/prescriptions');
        }
      }

      if (completed === false) {
        setToast({
          message: get(notification, 'message'),
          variant: 'danger',
        });

        setStepAsyncState(asyncStates.failed);
      }
    }
  }, [creatingPrescription, creatingPrescriptionRevision]);

  useEffect(() => {
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

    clearCalculator: clearCalculator.bind(null, formikContext),
    clearCalculatorInputs: clearCalculatorInputs.bind(null, formikContext),
    clearCalculatorResults: clearCalculatorResults.bind(null, formikContext),
    generateTherapySettingsOrderText,
    goToFirstSubStep: () => setActiveSubStep(0),

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

    stepSubmit: async () => {
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
      prescriptionAttributes.createdUserId = loggedInUserId;

      prescriptionAttributes.revisionHash = await sha512(
        canonicalize(prescriptionAttributes),
        { outputFormat: 'hex' }
      );

      if (isNewPrescription) {
        dispatch(actions.async.createPrescription(api, selectedClinicId, prescriptionAttributes));
      } else {
        dispatch(actions.async.createPrescriptionRevision(api, selectedClinicId, prescriptionAttributes, values.id));
      }
    },
  };

  const accountFormStepsProps = accountFormSteps(schema, initialFocusedInput, values);
  const profileFormStepsProps = profileFormSteps(schema, devices, values);
  const settingsCalculatorFormStepsProps = settingsCalculatorFormSteps(schema, handlers, values);
  const therapySettingsFormStepProps = therapySettingsFormStep(schema, pump, values);
  const reviewFormStepProps = reviewFormStep(schema, pump, handlers, values, isEditable, isPrescriber);

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

  const prescriptionStateLabel = get(prescriptionStates, [prescriptionState, 'label'], '');
  const prescriptionStateColorPalette = get(prescriptionStates, [prescriptionState, 'colorPalette'])

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
          onClick={() => props.history.push('/clinic-workspace/prescriptions')}
          mr={5}
        >
          {t('Back To Prescriptions')}
        </Button>

        <Text as={Headline} textAlign="center">{title}</Text>
        <Pill label="prescription status" colorPalette={prescriptionStateColorPalette} text={prescriptionStateLabel} />
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

export default prescriptionFormWrapper(withFormik(prescriptionForm())(translate()(PrescriptionForm)));
