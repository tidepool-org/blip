import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { push } from 'connected-react-router';
import bows from 'bows';
import moment from 'moment';
import { FastField, withFormik, useFormikContext } from 'formik';
import { PersistFormikValues } from 'formik-persist-values';
import each from 'lodash/each';
import filter from 'lodash/filter';
import forEach from 'lodash/forEach';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import map from 'lodash/map';
import keyBy from 'lodash/keyBy';
import keys from 'lodash/keys';
import noop from 'lodash/noop';
import omit from 'lodash/omit';
import reduce from 'lodash/reduce';
import remove from 'lodash/remove';
import flattenDeep from 'lodash/flattenDeep';
import cloneDeep from 'lodash/cloneDeep';
import isUndefined from 'lodash/isUndefined';
import isInteger from 'lodash/isInteger';
import isArray from 'lodash/isArray';
import { default as _values } from 'lodash/values';
import includes from 'lodash/includes';
import last from 'lodash/last';
import { utils as vizUtils } from '@tidepool/viz';
import { Box, Flex, Text } from 'theme-ui';
import canonicalize from 'canonicalize';
import { sha512 } from 'crypto-hash';
import { useFlags, useLDClient } from 'launchdarkly-react-client-sdk';

import { fieldsAreValid, getFieldError } from '../../core/forms';
import prescriptionSchema from './prescriptionSchema';
import ClinicWorkspaceHeader from '../../components/clinic/ClinicWorkspaceHeader';
import Button from '../../components/elements/Button';
import Pill from '../../components/elements/Pill';
import Stepper from '../../components/elements/Stepper';
import i18next from '../../core/language';
import { useToasts } from '../../providers/ToastProvider';
import { Headline } from '../../components/elements/FontStyles';
import { borders } from '../../themes/baseTheme';
import { useIsFirstRender, useLocalStorage } from '../../core/hooks';
import * as actions from '../../redux/actions';
import { components as vizComponents } from '@tidepool/viz';

import {
  cgmDeviceOptions,
  defaultUnits,
  deviceIdMap,
  getFormSteps,
  prescriptionStateOptions,
  pumpDeviceOptions,
  validCountryCodes,
} from './prescriptionFormConstants';

const { TextUtil } = vizUtils.text;
const { Loader } = vizComponents;
const t = i18next.t.bind(i18next);
const log = bows('PrescriptionForm');

let schema;

const prescriptionFormWrapper = Component => props => {
  const { api, trackMetric } = props;
  const dispatch = useDispatch();
  const loggedInUserId = useSelector((state) => state.blip.loggedInUserId);
  const devices = useSelector((state) => state.blip.devices);
  const prescriptions = useSelector((state) => state.blip.prescriptions);
  const clinics = useSelector((state) => state.blip.clinics);
  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);
  const clinic = get(clinics, selectedClinicId);
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

  return (
    <>
      <ClinicWorkspaceHeader api={api} trackMetric={trackMetric} />

      <Box id="clinic-workspace" sx={{ alignItems: 'center', minHeight: '10em' }} variant="containers.largeBordered" mb={9}>
        {fetchingDevices.completed && fetchingClinicPrescriptions.completed
          ? <Component prescription={prescription} devices={devices} clinic={clinic} {...props} />
          : <Loader />}
      </Box>
    </>
  );
}

export const prescriptionForm = () => {
  const getBgUnits = props => get(props, 'prescription.latestRevision.attributes.initialSettings.bloodGlucoseUnits', props.clinic?.preferredBgUnits || defaultUnits.bloodGlucose)

  return {
    mapPropsToStatus: props => ({
      hydratedValues: null,
      isPrescriptionEditFlow: !!props.prescription,
    }),
    mapPropsToValues: props => {
      const selectedPumpId = get(props, 'prescription.latestRevision.attributes.initialSettings.pumpId');

      return {
        id: get(props, 'prescription.id'),
        accessCode: get(props, 'prescription.accessCode'),
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
          recommendedBasalRate: get(props, 'prescription.latestRevision.attributes.calculator.recommendedBasalRate'),
          recommendedInsulinSensitivity: get(props, 'prescription.latestRevision.attributes.calculator.recommendedInsulinSensitivity'),
          recommendedCarbohydrateRatio: get(props, 'prescription.latestRevision.attributes.calculator.recommendedCarbohydrateRatio'),
        },
        initialSettings: {
          bloodGlucoseUnits: getBgUnits(props),
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
        getBgUnits(props),
        get(props, 'prescription.latestRevision.attributes')
      );

      return schema;
    },
    displayName: 'PrescriptionForm',
  };
};

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
    clinic,
    devices,
    location,
    prescription,
    trackMetric,
    skippedFields: skippedFieldsProp
  } = props;

  const dispatch = useDispatch();
  const formikContext = useFormikContext();
  const { id } = useParams();
  const isNewPrescriptionFlow = () => isEmpty(id);

  const {
    handleSubmit,
    resetForm,
    setFieldValue,
    setValues,
    setStatus,
    status,
    values,
  } = formikContext;

  const isFirstRender = useIsFirstRender();
  const storageKey = 'prescriptionForm';
  const [storedValues, setStoredValues] = useLocalStorage(storageKey);
  const { set: setToast } = useToasts();
  const loggedInUserId = useSelector((state) => state.blip.loggedInUserId);
  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);
  const stepperId = 'prescription-form-steps';
  const bgUnits = get(values, 'initialSettings.bloodGlucoseUnits', clinic?.preferredBgUnits || defaultUnits.bloodGlucose);
  const pumpId = get(values, 'initialSettings.pumpId', deviceIdMap.palmtree);
  const prescriptionState = get(prescription, 'state', 'draft');
  const prescriptionStates = keyBy(prescriptionStateOptions, 'value');
  const isEditable = includes(['draft', 'pending'], prescriptionState);
  const isPrescriber = includes(get(clinic, ['clinicians', loggedInUserId, 'roles'], []), 'PRESCRIBER');
  const { showPrescriptions } = useFlags();
  const ldClient = useLDClient();
  const ldContext = ldClient.getContext();

  const {
    creatingPrescription,
    creatingPrescriptionRevision,
  } = useSelector((state) => state.blip.working);

  useEffect(() => {
    // Redirect to the base workspace if the LD clinic context is set and showPrescriptions flag is false
    // and the clinic does not have the prescriptions entitlement
    if ((clinic?.entitlements && !clinic.entitlements.prescriptions) && (ldContext?.clinic?.tier && !showPrescriptions)) dispatch(push('/clinic-workspace'));
  }, [ldContext, showPrescriptions, selectedClinicId, clinic?.entitlements, dispatch]);

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

  const [formPersistReady, setFormPersistReady] = useState(false);
  const [formSteps, setFormSteps] = useState([]);
  const [skippedFields, setSkippedFields] = useState(skippedFieldsProp);
  const [stepAsyncState, setStepAsyncState] = useState(asyncStates.initial);
  const [activeStep, setActiveStep] = useState(activeStepsParam ? parseInt(activeStepsParam.split(',')[0], 10) : undefined);
  const [activeSubStep, setActiveSubStep] = useState(activeStepsParam ? parseInt(activeStepsParam.split(',')[1], 10) : undefined);
  const [pendingStep, setPendingStep] = useState([]);
  const [initialFocusedInput, setInitialFocusedInput] = useState();
  const [singleStepEditValues, setSingleStepEditValues] = useState(values);
  const isSingleStepEdit = !!pendingStep.length;
  const isLastStep = () => activeStep === formSteps.length - 1;
  const [pdfCallback, setPDFCallback] = useState();
  const pdf = useSelector((state) => state.blip.pdf);

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

    handlePrintTherapySettingsClicked: (patientRows, therapySettingsRows, onReady) => {
      trackMetric('Clicked Print Therapy Settings Order');
      setPDFCallback(() => onReady);
      dispatch(actions.worker.generatePDFRequest('prescription', null, {}, values.id, { prescription: { patientRows, therapySettingsRows } }));
    },

    singleStepEditComplete: cancelFieldUpdates => {
      // We need the short timeout below when setting values upon single step edit completions as a
      // result of having to skip rendering the <PersistFormikValues> component while in single step
      // edit mode. When navigating back to the review step, the re-enabling of the async <PersistFormikValues>
      // hydration overrides these values if the form reset isn't done in a subsequent render
      if (cancelFieldUpdates) {
        setTimeout(() => resetForm({values: cloneDeep(singleStepEditValues) }), 100);
      } else {
        setTimeout(() => resetForm({ values: cloneDeep(values) }), 100);
      }

      handlers.activeStepUpdate(pendingStep);
    },

    stepSubmit: async () => {
      setStepAsyncState(asyncStates.pending);
      // Delete fields that we never want to send to the backend
      const fieldsToDelete = [
        'accessCode',
        'emailConfirm',
        'id',
        'therapySettingsReviewed',
      ];

      // Delete fields that are intentionally skipped for the selected pump
      if (skippedFields.length) {
        fieldsToDelete.push(...(filter(skippedFields, fieldPath => {
          const pathParts = fieldPath.split('.');
          const value = get(values, pathParts);

          // Skipped top-level fields can always be deleted from the payload
          // Only delete nested skipped fields if they are empty.
          return pathParts.length > 1 ? isEmpty(value) : true;
        })));
      }

      // Also delete any fields from future form steps if empty
      // We can't simply delete all future steps, as the clinician may have returned to the current
      // step via 'Back' button navigation and we don't want to lose existing data previously
      // entered in the later steps.

      // We should, however, remove any future fields that don't pass field validation, since they
      // would result in an error anyhow if submitted, and prevent forward navigation
      if (!isLastStep()) {
        const fieldsInFutureSteps = reduce(formSteps, (fields, step, index) => {
          if (index <= activeStep) return fields;

          fields.push(...map(step.subSteps, 'fields'));
          return fields;
        }, []);

        const emptyOrInvalidFieldsInFutureSteps = remove(
          flattenDeep(fieldsInFutureSteps),
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
              return keys(value[0]).length === 1;
            }

            // Return undefined fields, or invalid non-array fields if they contain values
            return isUndefined(value) || getFieldError(fieldPath, formikContext, true);
          }
        );

        // Add empty future fields to the array of fieldpaths to delete.
        // N.B. There are some fieldpaths we check that end in '.value' or '.number'. If those keys
        // are empty, we exclude the parent object.
        fieldsToDelete.push(...map(
          emptyOrInvalidFieldsInFutureSteps,
          fieldPath => fieldPath.replace(/\.(value|number)$/, '')
        ));
      }

      const prescriptionAttributes = omit({ ...values }, fieldsToDelete);
      prescriptionAttributes.createdUserId = loggedInUserId;
      prescriptionAttributes.prescriberTermsAccepted = isPrescriber && get(values, 'therapySettingsReviewed');

      if (isLastStep()) prescriptionAttributes.state = isPrescriber ? 'submitted' : 'pending';
      setFieldValue('state', prescriptionAttributes.state);

      prescriptionAttributes.revisionHash = await sha512(
        canonicalize(omit(prescriptionAttributes, 'createdUserId')),
        { outputFormat: 'hex' }
      );

      if (values.id) {
        dispatch(actions.async.createPrescriptionRevision(api, selectedClinicId, prescriptionAttributes, values.id));
      } else {
        dispatch(actions.async.createPrescription(api, selectedClinicId, prescriptionAttributes));
      }
    },
  };

  useEffect(() => {
    if (!isEmpty(pdf) && pdfCallback) pdfCallback(pdf);
  }, [pdf, pdfCallback]);

  useEffect(() => {
    const pumpDevices = pumpDeviceOptions(devices);
    const cgmDevices = cgmDeviceOptions(devices);
    const newSkippedFields = [...skippedFields];

    // Skip device selection substep and set default pump and cgm IDs if there aren't multiple choices available
    const skipDeviceSelection = cgmDevices.length === 1 && pumpDevices.length === 1;
    if (skipDeviceSelection) {
      if (!values.initialSettings?.cgmId) setFieldValue('initialSettings.cgmId', cgmDevices[0].value);
      if (!values.initialSettings?.pumpId) setFieldValue('initialSettings.pumpId', pumpDevices[0].value);
      newSkippedFields.push('initialSettings.pumpId', 'initialSettings.cgmId');
    }

    const newFormSteps = getFormSteps(schema, devices, values, handlers, {
      skippedFields: newSkippedFields,
      initialFocusedInput,
      isEditable,
      isPrescriber,
      isSingleStepEdit,
      stepAsyncState,
    });

    setFormSteps(newFormSteps);
    setSkippedFields(newSkippedFields);
  }, [values, devices, initialFocusedInput, isEditable, isPrescriber, isSingleStepEdit, stepAsyncState])

  useEffect(() => {
    if (formSteps.length && !formPersistReady) {
      let initialValues = { ...values }

      // Hydrate the locally stored values only in the following cases, allowing us to persist data
      // entered in form substeps but not yet saved to the database
      // 1. It's a new prescription and there is no locally stored id, and there are step and substep query params
      // 2. We're editing an existing prescription, and the locally stored id matches the id in the url param, and it's not the review step
      if (
        (isNewPrescriptionFlow() && !storedValues?.id && !isUndefined(activeStep) && !isUndefined(activeSubStep)) ||
        (id && id === storedValues?.id && !isLastStep())
      ) {
        initialValues = { ...values, ...storedValues };
        setValues(initialValues);
      }

      // After hydrating any relevant values, we delete the localStorage values so formikPersist has a clean start
      delete localStorage[storageKey];

      // Determine the latest incomplete step, and default to starting there
      if (isEditable) {
        let firstInvalidStep;
        let firstInvalidSubStep;
        let currentStep = 0;
        let currentSubStep = 0;

        while (isUndefined(firstInvalidStep) && currentStep < formSteps.length) {
          while (currentSubStep < formSteps[currentStep].subSteps.length) {
            if (!fieldsAreValid(formSteps[currentStep].subSteps[currentSubStep].fields, schema, initialValues)) {
              firstInvalidStep = currentStep;
              firstInvalidSubStep = currentSubStep;
              break;
            }
            currentSubStep++
          }

          currentStep++;
          currentSubStep = 0;
        }

        setActiveStep(isInteger(firstInvalidStep) ? firstInvalidStep : formSteps.length - 1);
        setActiveSubStep(isInteger(firstInvalidSubStep) ? firstInvalidSubStep : 0);
      }

      // Now that any hydration is complete and we've cleared locally stored values,
      // we're ready for formikPersist to take over form persistence
      setFormPersistReady(true);
    }
  }, [formSteps.length]);

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
    const { inProgress, completed, notification, prescriptionId } = isRevision ? creatingPrescriptionRevision : creatingPrescription;

    if (!isFirstRender && !inProgress) {
      if (completed) {
        setStepAsyncState(asyncStates.completed);
        if (prescriptionId) setFieldValue('id', prescriptionId);

        if (isLastStep()) {
          let messageAction = isRevision ? t('updated') : t('created');
          if (isPrescriber) messageAction = t('finalized and sent');

          setToast({
            message: t('You have successfully {{messageAction}} a Tidepool Loop prescription.', { messageAction }),
            variant: 'success',
          });

          if (values.state !== 'submitted') {
            dispatch(push('/clinic-workspace/prescriptions', { reloadPrescriptions: true }));
          }
        } else {
          if (prescriptionId && isNewPrescriptionFlow()) {
            // Redirect to normal prescription edit flow once we have a prescription ID
            setStoredValues({ ...values, id: prescriptionId });
            dispatch(push(`/prescriptions/${prescriptionId}`));
          }
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
        setTimeout(() => {
          formikContext.validateForm();
          if (isLastStep()) delete localStorage[storageKey];
        }, 0);
      }

      log('Step to', newStep.join(','));
    },
    steps: formSteps,
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

  const title = isNewPrescriptionFlow() ? t('Create New Tidepool Loop Start Order') : t('Tidepool Loop Start Order: {{name}}', {
    name: [values.firstName, values.lastName].join(' '),
  });

  const prescriptionStateLabel = get(prescriptionStates, [prescriptionState, 'label'], '');
  const prescriptionStateColorPalette = get(prescriptionStates, [prescriptionState, 'colorPalette'])

  return (
    <Box
      as='form'
      id="prescription-form"
      onSubmit={isEditable ? handleSubmit : noop}
      bg="white"
    >
      <Flex
        id="prescription-form-header"
        mb={3}
        px={4}
        py={3}
        sx={{ justifyContent: 'space-between', alignItems: 'center', borderBottom: borders.dividerDark }}
      >
        <Button
          id="back-to-prescriptions"
          variant="primary"
          onClick={() => {
            delete localStorage[storageKey];
            dispatch(push('/clinic-workspace/prescriptions', { reloadPrescriptions: true }));
          }}
          mr={5}
        >
          {t('Back To Tidepool Loop Start Orders')}
        </Button>

        <Text as={Headline} sx={{ textAlign: 'center' }}>{title}</Text>
        <Pill label="prescription status" colorPalette={prescriptionStateColorPalette} text={prescriptionStateLabel} />
      </Flex>

      {formSteps.length && isEditable && !isUndefined(activeStep) && <Stepper {...stepperProps} />}

      {formSteps.length && !isEditable && (
        <Box px={4}>
          {last(formSteps).subSteps[0].panelContent}
        </Box>
      )}

      <FastField type="hidden" name="id" />
      {formPersistReady && !isSingleStepEdit && <PersistFormikValues persistInvalid name={storageKey} />}
    </Box>
  );
};

PrescriptionForm.propTypes = {
  location: PropTypes.shape({
    pathname: PropTypes.string,
    search: PropTypes.string,
  }),
  skippedFields: PropTypes.arrayOf(PropTypes.string),
};

PrescriptionForm.defaultProps = {
  location: window.location,
  skippedFields: [
    'calculator',
    'mrn',
    'phoneNumber',
    'training',
  ],
};

export default prescriptionFormWrapper(withFormik(prescriptionForm())(withTranslation()(PrescriptionForm)));
