import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { push } from 'connected-react-router';
import { withTranslation, Trans } from 'react-i18next';
import get from 'lodash/get'
import isEmpty from 'lodash/isEmpty';
import keys from 'lodash/keys';
import map from 'lodash/map';
import { Box, Flex, Text } from 'theme-ui';
import SearchIcon from '@material-ui/icons/Search';
import VisibilityOffOutlinedIcon from '@material-ui/icons/VisibilityOffOutlined';
import VisibilityOutlinedIcon from '@material-ui/icons/VisibilityOutlined';
import CloseRoundedIcon from '@material-ui/icons/CloseRounded';
import EditIcon from '@material-ui/icons/EditRounded';
import DeleteIcon from '@material-ui/icons/DeleteRounded';
import PrintRoundedIcon from '@material-ui/icons/PrintRounded';
import { components as vizComponents } from '@tidepool/viz';

import {
  Title,
  MediumTitle,
  Body1,
} from '../../components/elements/FontStyles';

import Button from '../../components/elements/Button';
import Icon from '../../components/elements/Icon';
import Table from '../../components/elements/Table';
import Pagination from '../../components/elements/Pagination';
import TextInput from '../../components/elements/TextInput';
import PatientForm from '../../components/clinic/PatientForm';
import PopoverMenu from '../../components/elements/PopoverMenu';
import PrintDateRangeModal from '../../components/PrintDateRangeModal';

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
import baseTheme from '../../themes/baseTheme';

const { Loader } = vizComponents;

export const ClinicianPatients = (props) => {
  const { t, api, patients, trackMetric } = props;
  const isFirstRender = useIsFirstRender();
  const dispatch = useDispatch();
  const { set: setToast } = useToasts();
  const loggedInUserId = useSelector((state) => state.blip.loggedInUserId);
  const membershipPermissionsInOtherCareTeams = useSelector((state) => state.blip.membershipPermissionsInOtherCareTeams);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAddPatientDialog, setShowAddPatientDialog] = useState(false);
  const [showEditPatientDialog, setShowEditPatientDialog] = useState(false);
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState();
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [patientFormContext, setPatientFormContext] = useState();
  const [printPatient, setPrintPatient] = useState(null);
  const [printMostRecentDates, setPrintMostRecentDates] = useState({});
  const [printDialogOpen, setPrintDialogOpen] = useState(false);
  const [printLoading, setPrintLoading] = useState(false);
  const rowsPerPage = 8;

  const { patientListSearchTextInput, isPatientListVisible } = useSelector(({ blip }) => blip.patientListFilters);

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

  useEffect(() => {
    setPageCount(Math.ceil(patients.length / rowsPerPage));
  }, [patients]);

  const renderHeader = () => {
    const VisibilityIcon = isPatientListVisible ? VisibilityOffOutlinedIcon : VisibilityOutlinedIcon;

    return (
      <>
        <Flex
          mb={4}
          py={2}
          sx={{ borderBottom: baseTheme.borders.default, alignItems: 'center' }}
        >
          <Title sx={{ flexGrow: 1 }}>
            {t('Patients')}
          </Title>
        </Flex>

        <Flex mb={4} sx={{ alignItems: 'center', justifyContent: 'space-between' }}>
          <Flex
            sx={{ width: '100%', gap: 2, alignItems: 'center', justifyContent: 'space-between' }}
          >
            <Button
              id="add-patient"
              variant="primary"
              onClick={handleAddPatient}
              px={[2, 3]}
              sx={{ fontSize: 0, lineHeight: ['inherit', null, 1] }}
            >
              {t('Add New Patient')}
            </Button>

            <Box sx={{ flex: 1, position: ['static', null, 'absolute'], top: '8px', right: 4 }}>
              <TextInput
                themeProps={{
                  sx: {
                    width: ['100%', null, '250px'],
                    fontSize: '12px',
                  },
                }}
                id="patients-search"
                placeholder={t('Search')}
                icon={!isEmpty(patientListSearchTextInput) ? CloseRoundedIcon : SearchIcon}
                iconLabel={t('Search')}
                onClickIcon={!isEmpty(patientListSearchTextInput) ? handleClearSearch : null}
                name="search-patients"
                onChange={handleSearchChange}
                value={patientListSearchTextInput}
                variant="condensed"
              />
            </Box>

            <Icon
              id="patients-view-toggle"
              variant="default"
              sx={{ color: 'grays.4' }}
              ml={1}
              icon={VisibilityIcon}
              label={t('Toggle visibility')}
              disabled={!isEmpty(patientListSearchTextInput)}
              onClick={handleToggleShowNames}
            />
          </Flex>
        </Flex>
      </>
    );
  };

  function handleToggleShowNames() {
    let toggleLabel = 'Clicked Hide All';
    if (!isPatientListVisible){
      toggleLabel = 'Clicked Show All';
    }

    trackMetric(toggleLabel);
    dispatch(actions.sync.setIsPatientListVisible(!isPatientListVisible));
  }

  const renderPeopleInstructions = () => {
    return (
      <Text py={4} mb={6} sx={{ display: 'block', fontSize:1, textAlign: 'center', a: { color: 'text.link', cursor: 'pointer' } }}>
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
        aria-labelledby="dialog-title"
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
        aria-labelledby="dialog-title"
        open={showAddPatientDialog}
        onClose={handleCloseOverlay}
      >
        <DialogTitle onClose={handleCloseOverlay}>
          <MediumTitle id="dialog-title">{t('Add New Patient Account')}</MediumTitle>
        </DialogTitle>

        <DialogContent>
          <PatientForm api={api} trackMetric={trackMetric} onFormChange={handlePatientFormChange} action="create" />
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
            disabled={!fieldsAreValid(keys(patientFormContext?.values), validationSchema(), patientFormContext?.values)}
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
        aria-labelledby="dialog-title"
        open={showEditPatientDialog}
        onClose={handleCloseOverlay}
      >
        <DialogTitle onClose={handleCloseOverlay}>
          <MediumTitle id="dialog-title">{t('Edit Patient Details')}</MediumTitle>
        </DialogTitle>

        <DialogContent>
          <PatientForm api={api} trackMetric={trackMetric} onFormChange={handlePatientFormChange} patient={selectedPatient} action="edit" />
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
            disabled={!fieldsAreValid(keys(patientFormContext?.values), validationSchema(), patientFormContext?.values)}
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

  function handlePrintPatient(patient) {
    trackMetric('Clinician - Print patient PDF');
    setPrintPatient(patient);
    setPrintLoading(true);

    api.patientData.get(
      patient.id,
      { type: 'basal,bolus,cbg,deviceEvent,food,smbg,wizard', latest: 1 },
      (err, latestDatums) => {
        const mostRecentDates = {};
        if (!err && latestDatums?.length) {
          const maxTime = (...types) => {
            const times = latestDatums
              .filter(d => types.includes(d.type))
              .map(d => d.normalEnd || d.normalTime)
              .filter(Boolean);
            return times.length ? times.reduce((a, b) => (a > b ? a : b)) : undefined;
          };
          mostRecentDates.agpBGM = maxTime('smbg');
          mostRecentDates.agpCGM = maxTime('cbg');
          mostRecentDates.basics = maxTime('basal', 'bolus', 'cbg', 'deviceEvent', 'smbg', 'wizard');
          mostRecentDates.bgLog = maxTime('smbg');
          mostRecentDates.daily = maxTime('basal', 'bolus', 'cbg', 'deviceEvent', 'food', 'smbg', 'wizard');
        }
        setPrintMostRecentDates(mostRecentDates);
        setPrintLoading(false);
        setPrintDialogOpen(true);
      }
    );
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
    setPage(1);

    dispatch(actions.sync.setPatientListSearchTextInput(event.target.value));
    dispatch(actions.sync.setIsPatientListVisible(true));

    if (isEmpty(event.target.value)) {
      setPageCount(Math.ceil(patients.length / rowsPerPage));
    }
  }

  function handleClearSearch(event) {
    setPage(1);
    dispatch(actions.sync.setPatientListSearchTextInput(''));
    setPageCount(Math.ceil(patients.length / rowsPerPage));
  }

  const handlePageChange = (event, newValue) => {
    setPage(newValue);
  };

  const handleTableFilter = (data) => {
    setPageCount(Math.ceil(data.length / rowsPerPage));
  };

  const renderPatient = patient => (
    <Box onClick={handleClickPatient(patient)} sx={{ cursor: 'pointer' }}>
      <Text fontWeight="medium">{patient.fullName}</Text>
      {patient.email && <Text>{patient.email}</Text>}
    </Box>
  );

  const renderLinkedField = (field, patient) => (
    patient[field] ? <Box classname={`patient-${field}`} onClick={handleClickPatient(patient)} sx={{ cursor: 'pointer' }}>
      <Text fontWeight="medium">{patient[field]}</Text>
    </Box> : null
  );

  const renderMore = patient => {
    const items = [];
    const isLoggedInUser = patient.id === loggedInUserId;

    if (isLoggedInUser || membershipPermissionsInOtherCareTeams?.[patient.id]?.custodian) {
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
    }

    items.push({
      icon: PrintRoundedIcon,
      iconLabel: t('Print PDF'),
      iconPosition: 'left',
      id: `print-${patient.id}`,
      variant: 'actionListItem',
      onClick: _popupState => {
        _popupState.close();
        handlePrintPatient(patient);
      },
      text: t('Print PDF'),
    });

    if (!isLoggedInUser) items.push({
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
        title: t('Patient Details'),
        field: 'fullName',
        align: 'left',
        sortable: true,
        searchable: true,
        searchBy: ['fullName', 'email'],
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
        hideEmpty: true,
      },
      {
        title: '',
        field: 'more',
        render: renderMore,
        align: 'right',
        className: 'action-menu',
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
          sx={{ fontSize: 1 }}
          orderBy="fullNameOrderable"
          order="asc"
          rowsPerPage={rowsPerPage}
          searchText={patientListSearchTextInput}
          page={page}
          onFilter={handleTableFilter}
        />
      </Box>
    );
  }

  const renderPeopleArea = () => {
    if (!isPatientListVisible && !patientListSearchTextInput) {
      return renderPeopleInstructions();
    } else {
      return renderPeopleTable();
    }
  }

  return (
    <>
      <Box>
        {renderHeader()}
        {renderPeopleArea()}
        {renderRemoveDialog()}
        {showAddPatientDialog && renderAddPatientDialog()}
        {showEditPatientDialog && renderEditPatientDialog()}
        {printPatient && (
          <PrintDateRangeModal
            id="print-dialog"
            loggedInUserId={loggedInUserId}
            mostRecentDatumDates={printMostRecentDates}
            open={printDialogOpen}
            onClose={() => {
              setPrintDialogOpen(false);
              setPrintPatient(null);
              setPrintMostRecentDates({});
            }}
            onClickPrint={opts => {
              setPrintDialogOpen(false);
              dispatch(push(`/patients/${printPatient.id}/data`, { autoPrint: true, printOpts: opts }));
              setPrintPatient(null);
            }}
            processing={printLoading}
            timePrefs={{ timezoneName: 'UTC' }}
            trackMetric={trackMetric}
          />
        )}
      </Box>

      {isPatientListVisible && patients.length > rowsPerPage && (
        <Box variant="containers.large" sx={{ bg: 'transparent', width: ['100%', '100%'] }} mb={0}>
          <Pagination
            px="5%"
            sx={{ position: 'absolute', bottom: '-50px' }}
            width="100%"
            id="clinic-invites-pagination"
            count={pageCount}
            page={page}
            disabled={pageCount < 2}
            onChange={handlePageChange}
            showFirstButton={false}
            showLastButton={false}
          />
        </Box>
      )}
    </>
  );
};

ClinicianPatients.propTypes = {
  api: PropTypes.object.isRequired,
  patients: PropTypes.array.isRequired,
  trackMetric: PropTypes.func.isRequired,
};

export default withTranslation()(ClinicianPatients);
