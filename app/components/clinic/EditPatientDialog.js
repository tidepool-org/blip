import React, { useState, useEffect, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useIsFirstRender, usePrevious } from '../../core/hooks';
import { useTranslation } from 'react-i18next';
import { selectIsSmartOnFhirMode } from '../../core/selectors';
import { Dialog, DialogActions, DialogContent, DialogTitle } from '../elements/Dialog';
import { MediumTitle } from '../elements/FontStyles';
import Button from '../elements/Button';
import PatientForm from '../clinic/PatientForm';
import noop from 'lodash/noop';
import keys from 'lodash/keys';
import { fieldsAreValid } from '../../core/forms';
import { patientSchema as validationSchema } from '../../core/clinicUtils';
import { trackMetric } from '../../core/metricUtils';
import useClinicMetricsPageName from '../../pages/clinicworkspace/useClinicMetricsPageName';

const PATIENT_FORM_SEARCH_DEBOUNCE_MS = 600;

const useUpdatingClinicPatientWorkingState = ({
  onEditSuccess = noop,
  onEditFailure = noop,
}) => {
  const updatingClinicPatient = useSelector((state) => state.blip.working.updatingClinicPatient);
  const { inProgress, completed } = updatingClinicPatient;
  const prevInProgress = usePrevious(inProgress);
  const isFirstRender = useIsFirstRender();

  useEffect(() => {
    if (!isFirstRender && !inProgress && prevInProgress !== false) {
      if (completed) {
        onEditSuccess();
      }

      if (completed === false) {
        onEditFailure();
      }
    }
  }, [isFirstRender, inProgress, prevInProgress, completed]);

  return updatingClinicPatient;
};

const EditPatientDialog = ({
  api,
  clinicPatient,
  isOpen = false,
  onClose = noop,
  onEditConfirm = noop,
  onEditSuccess = noop,
  onEditFailure = noop,
}) => {
  const { t } = useTranslation();
  const pageName = useClinicMetricsPageName();
  const selectedClinicId = useSelector(state => state.blip.selectedClinicId);
  const clinic = useSelector(state => state.blip.clinics?.[selectedClinicId]);
  const isSmartOnFhir = useSelector(selectIsSmartOnFhirMode);

  const [patientFormContext, setPatientFormContext] = useState();

  // In smart-on-fhir mode, identity fields are sourced from the EHR and locked.
  const disabledFields = useMemo(
    () => (isSmartOnFhir ? { fullName: true, birthDate: true, mrn: true, email: true } : {}),
    [isSmartOnFhir]
  );

  const mrnSettings = useMemo(() => clinic?.mrnSettings ?? {}, [clinic?.mrnSettings]);
  const existingMRNs = useSelector(state => state.blip.clinicMRNsForPatientFormValidation)?.filter(mrn => mrn !== clinicPatient?.mrn) || [];

  const updatingClinicPatient = useUpdatingClinicPatientWorkingState({ onEditSuccess, onEditFailure });

  const disabled = !patientFormContext || !fieldsAreValid(
    keys(patientFormContext?.values),
    validationSchema({ mrnSettings, existingMRNs }), patientFormContext?.values
  );

  const handlePatientFormChange = (formikContext) => {
    setPatientFormContext({ ...formikContext });
  };

  const handleSubmit = () => {
    onEditConfirm(patientFormContext); // notify parent

    patientFormContext?.handleSubmit();
  };

  return (
    <Dialog
      id="editPatient"
      aria-labelledby="dialog-title"
      open={isOpen}
      onClose={onClose}
    >
      <DialogTitle onClose={() => {
        trackMetric('Clinic - Edit patient close', { clinicId: selectedClinicId, pageName });
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
          disabledFields={disabledFields}
        />
      </DialogContent>

      <DialogActions>
        <Button id="editPatientCancel" variant="secondary" onClick={() => {
          trackMetric('Clinic - Edit patient cancel', { clinicId: selectedClinicId, pageName });
          onClose();
        }}>
          {t('Cancel')}
        </Button>

        <Button
          id="editPatientConfirm"
          variant="primary"
          onClick={handleSubmit}
          processing={updatingClinicPatient.inProgress}
          disabled={disabled}
        >
          {t('Save Changes')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default EditPatientDialog;
