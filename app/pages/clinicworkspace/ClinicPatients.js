import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { push } from 'connected-react-router';
import { translate, Trans } from 'react-i18next';
import debounce from 'lodash/debounce';
import filter from 'lodash/filter';
import get from 'lodash/get'
import includes from 'lodash/includes';
import isEmpty from 'lodash/isEmpty';
import map from 'lodash/map';
import values from 'lodash/values';
import sundial from 'sundial';
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
import Icon from '../../components/elements/Icon';
import Table from '../../components/elements/Table';
import Pagination from '../../components/elements/Pagination';
import TextInput from '../../components/elements/TextInput';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '../../components/elements/Dialog';

import { useToasts } from '../../providers/ToastProvider';
import * as actions from '../../redux/actions';
import { useIsFirstRender } from '../../core/hooks';

const { Loader } = vizComponents;

export const ClinicPatients = (props) => {
  const { t, api, trackMetric, searchDebounceMs } = props;
  const isFirstRender = useIsFirstRender();
  const dispatch = useDispatch();
  const { set: setToast } = useToasts();
  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);
  const loggedInUserId = useSelector((state) => state.blip.loggedInUserId);
  const clinics = useSelector((state) => state.blip.clinics);
  const clinic = get(clinics, selectedClinicId);
  const isClinicAdmin = includes(get(clinic, ['clinicians', loggedInUserId, 'roles'], []), 'CLINIC_ADMIN');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showNames, setShowNames] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(false);
  const [loading, setLoading] = useState(false);
  const [patientFetchOptions, setPatientFetchOptions] = useState({ limit: 8, search: '', offset: 0, sort: '+fullName' });

  const debounceSearch = useCallback(debounce(search => {
    setPatientFetchOptions({
      ...patientFetchOptions,
      offset: 0,
      search,
    });
  }, searchDebounceMs), []);

  const {
    fetchingPatientsForClinic,
    deletingPatientFromClinic,
  } = useSelector((state) => state.blip.working);

  function handleAsyncResult(workingState, successMessage) {
    const { inProgress, completed, notification } = workingState;

    if (!isFirstRender && !inProgress) {
      if (completed) {
        setShowDeleteDialog(false);

        setToast({
          message: successMessage,
          variant: 'success',
        });

        setSelectedPatient(null);
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
    handleAsyncResult(deletingPatientFromClinic, t('{{name}} has been removed from the clinic.', {
      name: get(selectedPatient, 'fullName', t('This patient')),
    }));
  }, [deletingPatientFromClinic]);

  useEffect(() => {
    setLoading(fetchingPatientsForClinic.inProgress);
  }, [fetchingPatientsForClinic.inProgress]);

  // Fetchers
  useEffect(() => {
    if (
      loggedInUserId
      && clinic?.id
      && !fetchingPatientsForClinic.inProgress
      && !fetchingPatientsForClinic.notification
    ) {
      const fetchOptions = { ...patientFetchOptions };
      if (isEmpty(fetchOptions.search)) delete fetchOptions.search;
      dispatch(actions.async.fetchPatientsForClinic.bind(null, api, clinic.id, fetchOptions)());
    }
  }, [loggedInUserId, clinic?.id, patientFetchOptions]);

  function clinicPatients() {
    return clinic?.patients || [];
  }

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
            variant="primary"
            disabled={!isEmpty(search)}
            onClick={handleToggleShowNames}
            mr={0}
          >
            {toggleLabel}
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
      <Trans className="peopletable-instructions" i18nKey="html.peopletable-instructions">
        Type a patient name in the search box or click <a className="peopletable-names-showall" onClick={handleToggleShowNames}>Show All</a> to display all patients.
      </Trans>
    );
  };

  const renderRemoveDialog = () => {
    const { t } = props;
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

  function handleRemove(patient) {
    return () => {
      if (props.selectedClinicId) {
        trackMetric('Clinic - Remove patient', { clinicId: props.selectedClinicId });
      }

      setSelectedPatient(patient);
      setShowDeleteDialog(true);
    };
  }

  function handleRemovePatient() {
    dispatch(actions.async.deletePatientFromClinic(api, selectedClinicId, selectedPatient?.id));
  }

  function handleCloseOverlay() {
    setShowDeleteDialog(false);
  }

  function handleClickPatient(patient) {
    return () => {
      trackMetric('Selected PwD');
      dispatch(push(`/patients/${patient.id}/data`));
    }
  }

  function handleClickEdit(patient) {
    return () => {
      const metric = selectedClinicId
        ? ['Clinic - Edit patient info', { clinicId: selectedClinicId }]
        : ['Clicked Edit PwD'];

      trackMetric(...metric);
      dispatch(push(`/patients/${patient.id}/profile#edit`));
    }
  }

  function handleSearchChange(event) {
    setSearch(event.target.value);
    setLoading(true);
    debounceSearch(event.target.value);
  }

  function handleSortChange(newOrderBy) {
    const currentOrder = patientFetchOptions.sort[0];
    const currentOrderBy = patientFetchOptions.sort.substring(1);
    const newOrder = newOrderBy === currentOrderBy && currentOrder === '+' ? '-' : '+';

    setPatientFetchOptions({
      ...patientFetchOptions,
      offSet: 0,
      sort: `${newOrder}${newOrderBy}`,
    });
  }

  function handleClearSearch(event) {
    setSearch('');
    setLoading(true);
    debounceSearch('');
  }

  function handlePageChange(event, page) {
    setPatientFetchOptions({
      ...patientFetchOptions,
      offset: (page - 1) * patientFetchOptions.limit,
    });
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

  const renderEdit = patient => (
    <Icon className="edit-clinic-patient" icon={EditIcon} label={'Edit'} variant={'button'} onClick={handleClickEdit(patient)} />
  );

  const renderRemove = patient => (
    <Icon className="remove-clinic-patient" icon={DeleteIcon} label={'Remove'} variant={'button'} onClick={handleRemove(patient)} />
  );

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
        title: t('Edit'),
        field: 'edit',
        render: renderEdit,
        align: 'center',
        size: 'small',
        padding: 'checkbox',
      },
    ];

    if (isClinicAdmin) columns.push({
      title: t('Remove'),
      field: 'remove',
      render: renderRemove,
      align: 'center',
      size: 'small',
      padding: 'checkbox',
    });

    return (
      <Box sx={{ position: 'relative' }}>
        <Loader show={loading} overlay={true} />
        <Table
          id={'peopleTable'}
          label={'peopletablelabel'}
          columns={columns}
          data={clinicPatients()}
          style={{fontSize:'14px'}}
          onSort={handleSortChange}
          order={patientFetchOptions.sort.substring(0, 1) === '+' ? 'asc' : 'desc'}
          orderBy={patientFetchOptions.sort.substring(1)}
        />

        {clinic?.patientCount > patientFetchOptions.limit && (
          <Pagination
            mt={4}
            id="clinic-patients-pagination"
            count={Math.ceil(clinic.patientCount / patientFetchOptions.limit)}
            onChange={handlePageChange}
            showFirstButton={false}
            showLastButton={false}
          />
        )}
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
    <div>
      {renderHeader()}
      {renderPeopleArea()}
      {renderRemoveDialog()}
    </div>
  );
};

ClinicPatients.propTypes = {
  api: PropTypes.object.isRequired,
  trackMetric: PropTypes.func.isRequired,
  searchDebounceMs: PropTypes.number.isRequired,
};

ClinicPatients.defaultProps = {
  searchDebounceMs: 1000,
};

export default translate()(ClinicPatients);
