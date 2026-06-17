import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useIsFirstRender, usePrevious } from '../../core/hooks';
import { useTranslation } from 'react-i18next';
import { selectClinicPatient, selectIsSmartOnFhirMode } from '../../core/selectors';
import { Dialog, DialogActions, DialogContent, DialogTitle } from '../elements/Dialog';
import { MediumTitle } from '../elements/FontStyles';
import Button from '../elements/Button';
import PatientForm from '../clinic/PatientForm';
import noop from 'lodash/noop';
import keys from 'lodash/keys';
import get from 'lodash/get';
import isEqual from 'lodash/isEqual';
import { fieldsAreValid } from '../../core/forms';
import { patientSchema as validationSchema } from '../../core/clinicUtils';
import { DEFAULT_GLYCEMIC_RANGES } from '../../core/glycemicRangesUtils';
import { useToasts } from '../../providers/ToastProvider';
import * as actions from '../../redux/actions';

const useUpdatingClinicPatientWorkingState = ({ onUpdateSuccess = noop }) => {
  const { t } = useTranslation();
  const updatingClinicPatient = useSelector((state) => state.blip.working.updatingClinicPatient);
  const { set: setToast } = useToasts();
  const { inProgress, completed, notification } = updatingClinicPatient;
  const prevInProgress = usePrevious(inProgress);
  const isFirstRender = useIsFirstRender();

  useEffect(() => {
    if (!isFirstRender && !inProgress && prevInProgress !== false) {
      if (completed) {
        onUpdateSuccess();
        setToast({
          message: t('You have successfully updated a patient.'),
          variant: 'success',
        });
      }

      if (completed === false) {
        setToast({
          message: get(notification, 'message'),
          variant: 'danger',
        });
      }
    }
  }, [isFirstRender, inProgress, prevInProgress, completed]);

  return updatingClinicPatient;
};

const PATIENT_FORM_SEARCH_DEBOUNCE_MS = 600;

const EditPatientDialog = ({
  api,
  trackMetric,
  isOpen,
  onClose = noop,
}) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);
  const currentPatientInViewId = useSelector(state => state.blip.currentPatientInViewId);
  const clinicPatient = useSelector(state => selectClinicPatient(state));
  const clinic = useSelector(state => state.blip.clinics?.[selectedClinicId]);
  const isSmartOnFhir = useSelector(selectIsSmartOnFhirMode);

  const mrnSettings = useMemo(() => clinic?.mrnSettings ?? {}, [clinic?.mrnSettings]);
  const existingMRNs = useSelector(state => state.blip.clinicMRNsForPatientFormValidation)?.filter(mrn => mrn !== clinicPatient?.mrn) || [];

  const hasChartData = useSelector(state => (state.blip.data?.metaData?.size || 0) > 0);

  // Captured at submit time: whether this edit needs the chart data reprocessed.
  const shouldClearDataRef = useRef(false);

  const onUpdateSuccess = () => {
    // updatingClinicPatient is global working state, so this fires for any clinic-patient update while
    // the header is mounted. Only react to updates this dialog drove; a foreign update (e.g. adding a
    // data source) would otherwise clear the data worker cache and strand the data view on the loader.
    if (!isOpen) return;

    onClose();

    if (shouldClearDataRef.current) {
      dispatch(actions.worker.dataWorkerRemoveDataRequest(null, currentPatientInViewId));
      shouldClearDataRef.current = false;
    }
  };

  const updatingClinicPatient = useUpdatingClinicPatientWorkingState({ onUpdateSuccess });

  const [patientFormContext, setPatientFormContext] = useState();

  const handleEditPatientConfirm = () => {
    // Clear the data worker (forcing a reprocess) only when Target Range (glycemicRanges, the only
    // data-affecting field here) changed AND there is chart data to reprocess. Compare against the
    // patient's saved range, not the form's initialValues (frozen at mount, blind to prior saves);
    // fall back to the default range so a patient without one — for whom the form injects the default —
    // doesn't read as a change.
    const savedRange = clinicPatient?.glycemicRanges || DEFAULT_GLYCEMIC_RANGES;
    const targetRangeChanged = !isEqual(patientFormContext?.values?.glycemicRanges, savedRange);
    shouldClearDataRef.current = targetRangeChanged && hasChartData;
    patientFormContext?.handleSubmit();
  };

  const handlePatientFormChange = (formikContext) => {
    setPatientFormContext({ ...formikContext });
  };

  if (!currentPatientInViewId || !selectedClinicId) return null;

  return (
    <Dialog
      id="editPatient"
      aria-labelledby="dialog-title"
      open={isOpen}
      onClose={onClose}
    >
      <DialogTitle onClose={() => {
        trackMetric('Clinic - Edit patient close', { clinicId: selectedClinicId });
        onClose();
      }}>
        <MediumTitle id="dialog-title">{t('Edit Patient Details')}</MediumTitle>
      </DialogTitle>

      <DialogContent>
        <PatientForm
          api={api}
          trackMetric={trackMetric}
          onFormChange={handlePatientFormChange}
          patient={clinicPatient}
          searchDebounceMs={PATIENT_FORM_SEARCH_DEBOUNCE_MS}
          action="edit"
          isReadOnly={isSmartOnFhir}
        />
      </DialogContent>

      <DialogActions>
        <Button id="editPatientCancel" variant="secondary" onClick={() => {
          trackMetric('Clinic - Edit patient cancel', { clinicId: selectedClinicId, source: 'Patients list' });
          onClose();
        }}>
          {t('Cancel')}
        </Button>

        <Button
          id="editPatientConfirm"
          variant="primary"
          onClick={handleEditPatientConfirm}
          processing={updatingClinicPatient.inProgress}
          disabled={isSmartOnFhir || !fieldsAreValid(keys(patientFormContext?.values), validationSchema({ mrnSettings, existingMRNs }), patientFormContext?.values)}
        >
          {t('Save Changes')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditPatientDialog;
