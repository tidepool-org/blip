import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { push } from 'connected-react-router';
import { translate, Trans } from 'react-i18next';
import get from 'lodash/get'
import isEmpty from 'lodash/isEmpty';
import keys from 'lodash/keys';
import map from 'lodash/map';
import { Box, Flex, Text } from 'rebass/styled-components';
import SearchIcon from '@material-ui/icons/Search';
import CloseRoundedIcon from '@material-ui/icons/CloseRounded';
import EditIcon from '@material-ui/icons/EditRounded';
import DeleteIcon from '@material-ui/icons/DeleteRounded';
import { components as vizComponents } from '@tidepool/viz';

import {
  MediumTitle,
  Body1,
} from '../../components/elements/FontStyles';

import Button from '../../components/elements/Button';
import Table from '../../components/elements/Table';
import TextInput from '../../components/elements/TextInput';
import PatientForm from '../../components/clinic/PatientForm';
import PopoverMenu from '../../components/elements/PopoverMenu';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '../../components/elements/Dialog';

import { useToasts } from '../../providers/ToastProvider';
import * as actions from '../../redux/actions';
import { useIsFirstRender } from '../../core/hooks';
import { fieldsAreValid } from '../../core/forms';
import { patientSchema as validationSchema } from '../../core/clinicUtils';
import { clinicPatientFromAccountInfo } from '../../core/personutils';

const { Loader } = vizComponents;

export const ClinicianPatients = (props) => {
  const { t, api, patients, trackMetric } = props;
  const isFirstRender = useIsFirstRender();
  const dispatch = useDispatch();
  const { set: setToast } = useToasts();
  const loggedInUserId = useSelector((state) => state.blip.loggedInUserId);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAddPatientDialog, setShowAddPatientDialog] = useState(false);
  const [showEditPatientDialog, setShowEditPatientDialog] = useState(false);
  const [showNames, setShowNames] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [patientFormContext, setPatientFormContext] = useState();

  const {
    fetchingAssociatedAccounts,
    removingMembershipInOtherCareTeam,
    updatingPatient,
    creatingVCACustodialAccount,
  } = useSelector((state) => state.blip.working);

  function handleAsyncResult(workingState, successMessage) {
    const { inProgress, completed, notification } = workingState;

    if (!isFirstRender && !inProgress) {
      if (completed) {
        handleCloseOverlay();

        setToast({
          message: successMessage,
          variant: 'success',
        });
      }

      if (completed === false) {
        setToast({
          message: get(notification, 'message'),
          variant: 'danger',
        });
      }

      setLoading(false);
    }
  }

  useEffect(() => {
    handleAsyncResult(updatingPatient, t('You have successfully updated a patient.'));
  }, [updatingPatient]);

  useEffect(() => {
    handleAsyncResult(creatingVCACustodialAccount, t('You have successfully added a new patient.'));
  }, [creatingVCACustodialAccount]);

  useEffect(() => {
    handleAsyncResult(removingMembershipInOtherCareTeam, t('{{name}} has been removed.', {
      name: get(selectedPatient, 'fullName', t('This patient')),
    }));
  }, [removingMembershipInOtherCareTeam]);

  useEffect(() => {
    setLoading(fetchingAssociatedAccounts.inProgress);
  }, [fetchingAssociatedAccounts.inProgress]);

  const renderHeader = () => {
    const toggleLabel = showNames ? t('Hide All') : t('Show All');

    return (
      <Flex mb={4} alignItems="center" justifyContent="space-between">
        <Flex
          alignItems="center"
          justifyContent="space-between"
          flexGrow={1}
          pt={0}
        >
          <Flex
            alignItems="center"
            justifyContent="flex-start"
          >
            <TextInput
              themeProps={{
                width: 'auto',
                minWidth: '250px',
              }}
              id="patients-search"
              placeholder={t('Search')}
              icon={!isEmpty(search) ? CloseRoundedIcon : SearchIcon}
              iconLabel={t('Search')}
              onClickIcon={!isEmpty(search) ? handleClearSearch : null}
              name="search-patients"
              onChange={handleSearchChange}
              value={search}
              variant="condensed"
            />
            <Button
              id="patients-view-toggle"
              variant="textSecondary"
              disabled={!isEmpty(search)}
              onClick={handleToggleShowNames}
              mr={0}
              ml={2}
            >
              {toggleLabel}
            </Button>
          </Flex>

          <Button
            id="add-patient"
            variant="primary"
            onClick={handleAddPatient}
            mr={0}
          >
            {t('Add a New Patient')}
          </Button>
        </Flex>
      </Flex>
    );
  };

  function handleToggleShowNames() {
    let toggleLabel = 'Clicked Hide All';
    if ( !showNames ){
      toggleLabel = 'Clicked Show All';
    }

    trackMetric(toggleLabel);
    setShowNames(!showNames);
  }

  const renderPeopleInstructions = () => {
    return (
      <Text fontSize={1} py={4} textAlign="center" sx={{ a: { color: 'text.link', cursor: 'pointer' } }}>
        <Trans className="peopletable-instructions" i18nKey="html.peopletable-instructions">
          Type a patient name in the search box or click <a className="peopletable-names-showall" onClick={handleToggleShowNames}>Show All</a> to display all patients.
        </Trans>
      </Text>
    );
  };

  const renderRemoveDialog = () => {
    const fullName = selectedPatient?.fullName;

    return (
      <Dialog
        id="deleteUser"
        aria-labelledBy="dialog-title"
        open={showDeleteDialog}
        onClose={handleCloseOverlay}
      >
        <DialogTitle onClose={handleCloseOverlay}>
          <MediumTitle id="dialog-title">{t('Remove {{name}}', { name: fullName })}</MediumTitle>
        </DialogTitle>

        <DialogContent>
          <Trans className="ModalOverlay-content" i18nKey="html.peopletable-remove-patient-confirm">
            <Body1>
              Are you sure you want to remove patient: {{fullName}} from your list?
            </Body1>
            <Body1>
              You will no longer be able to see or comment on their data.
            </Body1>
          </Trans>
        </DialogContent>

        <DialogActions>
          <Button id="patientRemoveCancel" variant="secondary" onClick={handleCloseOverlay}>
            {t('Cancel')}
          </Button>
          <Button
            id="patientRemoveConfirm"
            variant="danger"
            onClick={handleRemovePatient}
          >
            {t('Remove')}
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  const renderAddPatientDialog = () => {
    return (
      <Dialog
        id="addPatient"
        aria-labelledBy="dialog-title"
        open={showAddPatientDialog}
        onClose={handleCloseOverlay}
      >
        <DialogTitle onClose={handleCloseOverlay}>
          <MediumTitle id="dialog-title">{t('Add New Patient Account')}</MediumTitle>
        </DialogTitle>

        <DialogContent>
          <PatientForm api={api} trackMetric={trackMetric} onFormChange={handlePatientFormChange} />
        </DialogContent>

        <DialogActions>
          <Button id="addPatientCancel" variant="secondary" onClick={handleCloseOverlay}>
            {t('Cancel')}
          </Button>
          <Button
            id="addPatientConfirm"
            variant="primary"
            onClick={handleAddPatientConfirm}
            processing={creatingVCACustodialAccount.inProgress}
            disabled={!fieldsAreValid(keys(patientFormContext?.values), validationSchema, patientFormContext?.values)}
          >
            {t('Add Patient')}
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  const renderEditPatientDialog = () => {
    return (
      <Dialog
        id="editPatient"
        aria-labelledBy="dialog-title"
        open={showEditPatientDialog}
        onClose={handleCloseOverlay}
      >
        <DialogTitle onClose={handleCloseOverlay}>
          <MediumTitle id="dialog-title">{t('Edit Patient Details')}</MediumTitle>
        </DialogTitle>

        <DialogContent>
          <PatientForm api={api} trackMetric={trackMetric} onFormChange={handlePatientFormChange} patient={selectedPatient} />
        </DialogContent>

        <DialogActions>
          <Button id="editPatientCancel" variant="secondary" onClick={handleCloseOverlay}>
            {t('Cancel')}
          </Button>

          <Button
            id="editPatientConfirm"
            variant="primary"
            onClick={handleEditPatientConfirm}
            processing={updatingPatient.inProgress}
            disabled={!fieldsAreValid(keys(patientFormContext?.values), validationSchema, patientFormContext?.values)}
          >
            {t('Save Changes')}
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  function handleRemove(patient) {
    trackMetric('Clinician - Remove patient');
    setSelectedPatient(patient);
    setShowDeleteDialog(true);
  }

  function handleRemovePatient() {
    trackMetric('Clinician - Remove patient confirmed');
    dispatch(actions.async.removeMembershipInOtherCareTeam(api, selectedPatient?.id));
  }

  function handleCloseOverlay() {
    setShowDeleteDialog(false);
    setShowAddPatientDialog(false);
    setShowEditPatientDialog(false);
    setTimeout(() => {
      setSelectedPatient(null);
    })
  }

  function handleClickPatient(patient) {
    return () => {
      trackMetric('Selected PwD');
      dispatch(push(`/patients/${patient.id}/data`));
    }
  }

  function handleAddPatient() {
    trackMetric('Clinician - Add patient');
    setShowAddPatientDialog(true);
  }

  function handleAddPatientConfirm() {
    trackMetric('Clinician - Add patient confirmed');
    patientFormContext?.handleSubmit();
  }

  function handleEditPatient(patient) {
    trackMetric('Clinician - Edit patient');
    setSelectedPatient(patient);
    setShowEditPatientDialog(true);
  }

  function handleEditPatientConfirm() {
    trackMetric('Clinician - Edit patient confirmed');
    patientFormContext?.handleSubmit();
  }

  function handlePatientFormChange(formikContext) {
    setPatientFormContext({...formikContext});
  }

  function handleSearchChange(event) {
    setSearch(event.target.value);
  }

  function handleClearSearch(event) {
    setSearch('');
  }

  const renderPatient = patient => (
    <Box onClick={handleClickPatient(patient)} sx={{ cursor: 'pointer' }}>
      <Text fontWeight="medium">{patient.fullName}</Text>
      <Text>{patient.email || '\u00A0'}</Text>
    </Box>
  );

  const renderLinkedField = (field, patient) => (
    <Box classname={`patient-${field}`} onClick={handleClickPatient(patient)} sx={{ cursor: 'pointer' }}>
      <Text fontWeight="medium">{patient[field]}</Text>
    </Box>
  );

  const renderMore = patient => {
    const items = [];

    items.push({
      icon: EditIcon,
      iconLabel: t('Edit Patient Information'),
      iconPosition: 'left',
      id: `edit-${patient.id}`,
      variant: 'actionListItem',
      onClick: _popupState => {
        _popupState.close();
        handleEditPatient(patient);
      },
      text: t('Edit Patient Information'),
    });

    if (patient.id !== loggedInUserId) items.push({
      icon: DeleteIcon,
      iconLabel: t('Remove Patient'),
      iconPosition: 'left',
      id: `delete-${patient.id}`,
      variant: 'actionListItemDanger',
      onClick: _popupState => {
        _popupState.close();
        handleRemove(patient);
      },
      text: t('Remove Patient')
    });

    return <PopoverMenu id={`action-menu-${patient.id}`} items={items} />
  };

  const renderPeopleTable = () => {
    const { t } = props;
    const columns = [
      {
        title: t('Patient'),
        field: 'fullName',
        align: 'left',
        sortable: true,
        render: renderPatient,
      },
      {
        title: t('Birthday'),
        field: 'birthDate',
        align: 'left',
        sortable: true,
        render: renderLinkedField.bind(null, 'birthDate'),
      },
      {
        title: t('MRN'),
        field: 'mrn',
        align: 'left',
        render: renderLinkedField.bind(null, 'mrn'),
      },
      {
        title: '',
        field: 'more',
        render: renderMore,
        align: 'right',
      },
    ];

    return (
      <Box sx={{ position: 'relative' }}>
        <Loader show={loading} overlay={true} />
        <Table
          id={'peopleTable'}
          label={'peopletablelabel'}
          columns={columns}
          data={map(patients, clinicPatientFromAccountInfo)}
          style={{ fontSize:'14px' }}
          orderBy="fullNameOrderable"
          order="asc"
          rowsPerPage={8}
          pagination={patients.length > 8}
        />
      </Box>
    );
  }

  const renderPeopleArea = () => {
    if (!showNames && !search) {
      return renderPeopleInstructions();
    } else {
      return renderPeopleTable();
    }
  }

  return (
    <Box pt={4}>
      {renderHeader()}
      {renderPeopleArea()}
      {renderRemoveDialog()}
      {renderAddPatientDialog()}
      {renderEditPatientDialog()}
    </Box>
  );
};

ClinicianPatients.propTypes = {
  api: PropTypes.object.isRequired,
  patients: PropTypes.array.isRequired,
  trackMetric: PropTypes.func.isRequired,
};

export default translate()(ClinicianPatients);
