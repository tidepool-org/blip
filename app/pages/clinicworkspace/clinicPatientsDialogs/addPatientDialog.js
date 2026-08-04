import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { trackMetric } from '../../../core/metricUtils';

import keys from 'lodash/keys';
import noop from 'lodash/noop';
import { fieldsAreValid } from '../../../core/forms';
import { patientSchema as validationSchema } from '../../../core/clinicUtils';

import Button from '../../../components/elements/Button';
import { Dialog, DialogContent, DialogTitle, DialogActions } from '../../../components/elements/Dialog';
import { MediumTitle } from '../../../components/elements/FontStyles';
import PatientForm from '../../../components/clinic/PatientForm';

const SEARCH_DEBOUNCE_MS = 1000;

const AddPatientDialog = ({
  api,
  onClose = noop,
}) => {
  const { t } = useTranslation();
  const creatingClinicCustodialAccount = useSelector(state => state.blip.working.creatingClinicCustodialAccount);
  const selectedClinicId = useSelector(state => state.blip.selectedClinicId);

  const clinic = useSelector(state => state.blip.clinics?.[selectedClinicId]);
  const mrnSettings = clinic?.mrnSettings ?? {};

  const clinicMRNsForPatientFormValidation = useSelector(state => state.blip.clinicMRNsForPatientFormValidation);
  const existingMRNs = clinicMRNsForPatientFormValidation || [];

  const [formContext, setFormContext] = useState(null);

  const handleFormChange = (formikContext) => setFormContext({ ...formikContext });

  const handleClose = () => onClose();

  const handleConfirm = () => {
    trackMetric('Clinic - Add patient confirmed', { clinicId: selectedClinicId });
    formContext?.handleSubmit();
  };

  return (
    <Dialog
      id="addPatient"
      aria-labelledby="dialog-title"
      open={true}
      onClose={handleClose}
    >
      <DialogTitle onClose={handleClose}>
        <MediumTitle id="dialog-title">{t('Add New Patient Account')}</MediumTitle>
      </DialogTitle>

      <DialogContent>
        <PatientForm
          api={api}
          trackMetric={trackMetric}
          onFormChange={handleFormChange}
          searchDebounceMs={SEARCH_DEBOUNCE_MS}
          action="create"
        />
      </DialogContent>

      <DialogActions>
        <Button id="addPatientCancel" variant="secondary" onClick={handleClose}>
          {t('Cancel')}
        </Button>
        <Button
          id="addPatientConfirm"
          variant="primary"
          onClick={handleConfirm}
          processing={creatingClinicCustodialAccount.inProgress}
          disabled={!fieldsAreValid(keys(formContext?.values), validationSchema({mrnSettings, existingMRNs}), formContext?.values)}
        >
          {t('Add Patient')}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default AddPatientDialog;
