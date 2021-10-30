import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { push } from 'connected-react-router';
import { translate, Trans } from 'react-i18next';
import filter from 'lodash/filter';
import forEach from 'lodash/forEach';
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

import {
  Title,
  MediumTitle,
  Body1,
} from '../../components/elements/FontStyles';

import Button from '../../components/elements/Button';
import Icon from '../../components/elements/Icon';
import Table from '../../components/elements/Table';
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

export const ClinicPatients = (props) => {
  const { t, api, trackMetric } = props;
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
  const [patientFetchOptions, setPatientFetchOptions] = useState({ limit: 8, search: 'tidepool.org', offset: 0 });

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
    }
  }

  useEffect(() => {
    handleAsyncResult(deletingPatientFromClinic, t('{{name}} has been removed from the clinic.', {
      name: get(selectedPatient, 'fullName', t('This patient')),
    }));
  }, [deletingPatientFromClinic]);

  // Fetchers
  useEffect(() => {
    if (loggedInUserId && clinic) {
      forEach([
        {
          workingState: fetchingPatientsForClinic,
          action: actions.async.fetchPatientsForClinic.bind(null, api, clinic.id, patientFetchOptions),
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
  }, [loggedInUserId, clinic]);

  function clinicPatients() {
    const filteredPatients = filter(values(clinic?.patients), patient => !isEmpty(patient.id));

    return map(filteredPatients, patient => {
      const birthday = (patient.birthDate)
        ? ` ${sundial.translateMask(patient.birthDate, 'YYYY-MM-DD', t('M/D/YYYY'))}`
        : undefined;

      return {
        fullName: patient.fullName,
        fullNameOrderable: (patient.fullName || '').toLowerCase(),
        link: `/patients/${patient.id}/data`,
        birthday,
        birthdayOrderable: new Date(birthday),
        id: patient.id,
        email: patient.email,
      };
    });
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
            placeholder={t('Search by Name')}
            icon={!isEmpty(search) ? CloseRoundedIcon : SearchIcon}
            iconLabel={t('Search by Name')}
            onClickIcon={!isEmpty(search) ? handleClearSearch : null}
            name="search-prescriptions"
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

  function handleClickPatient(link) {
    return () => {
      trackMetric('Selected PwD');

      dispatch(push(link));
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
    if (props.onSearchChange) return props.onSearchChange(event.target.value);
    setSearch(event.target.value);
  }


  function handleSearchChange(search) {
    setPatientFetchOptions({
      limit: patientFetchOptions.limit,
      offset: 0,
      search,
    });
  }

  function handleClearSearch(event) {
    if (props.onSearchChange) return props.onSearchChange('');
    setSearch('');
  }

  const renderPatient = ({fullName, email, link}) => (
    <Box onClick={handleClickPatient(link)} sx={{ cursor: 'pointer' }}>
      <Text fontWeight="medium">{fullName}</Text>
      <Text>{email || '\u00A0'}</Text>
    </Box>
  );

  const renderBirthday = ({birthday, link}) => (
    <Box onClick={handleClickPatient(link)} sx={{ cursor: 'pointer' }}>
      <Text fontWeight="medium">{birthday}</Text>
    </Box>
  );

  const renderEdit = patient => (
    <Icon icon={EditIcon} label={'Edit'} variant={'button'} onClick={handleClickEdit(patient)} />
  );

  const renderRemove = patient => (
    <Icon icon={DeleteIcon} label={'Remove'} variant={'button'} onClick={handleRemove(patient)} />
  );

  const renderPeopleTable = () => {
    const { t } = props;
    const columns = [
      {
        title: t('Patient'),
        field: 'profile',
        align: 'left',
        sortable: true,
        sortBy: 'fullNameOrderable',
        render: renderPatient,
        searchable: true,
        searchBy: ['fullName', 'email'],
      },
      {
        title: t('Birthday'),
        field: 'birthday',
        align: 'left',
        sortable: true,
        sortBy: 'birthdayOrderable',
        render: renderBirthday,
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
      <Table
        id={'peopleTable'}
        label={'peopletablelabel'}
        columns={columns}
        data={clinicPatients()}
        orderBy="fullNameOrderable"
        order="asc"
        searchText={search}
        rowsPerPage={8}
        pagination={true}
        style={{fontSize:'14px'}}
      />
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
};

export default translate()(ClinicPatients);
