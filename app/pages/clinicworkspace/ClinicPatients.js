import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { push } from 'connected-react-router';
import { translate, Trans } from 'react-i18next';
import { format } from 'd3-format';
import moment from 'moment';
import debounce from 'lodash/debounce';
import forEach from 'lodash/forEach';
import get from 'lodash/get'
import includes from 'lodash/includes';
import isEmpty from 'lodash/isEmpty';
import keys from 'lodash/keys';
import map from 'lodash/map';
import random from 'lodash/random';
import round from 'lodash/round';
import sample from 'lodash/sample';
import sum from 'lodash/sum';
import values from 'lodash/values';
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
import Pagination from '../../components/elements/Pagination';
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
import { dateFormat, patientSchema as validationSchema } from '../../core/clinicUtils';
import config from '../../config';
import { MGDL_PER_MMOLL, MGDL_UNITS, MMOLL_UNITS } from '../../core/constants';

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
  const [showAddPatientDialog, setShowAddPatientDialog] = useState(false);
  const [showEditPatientDialog, setShowEditPatientDialog] = useState(false);
  const [showNames, setShowNames] = useState(false);
  const [showSummaryData, setShowSummaryData] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [patientFormContext, setPatientFormContext] = useState();
  const [patientFetchOptions, setPatientFetchOptions] = useState({ limit: 8, search: '', offset: 0, sort: '+fullName' });
  const statEmptyText = '--';

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
    updatingClinicPatient,
    creatingClinicCustodialAccount,
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
    handleAsyncResult(updatingClinicPatient, t('You have successfully updated a patient.'));
  }, [updatingClinicPatient]);

  useEffect(() => {
    handleAsyncResult(creatingClinicCustodialAccount, t('You have successfully added a new patient.'));
  }, [creatingClinicCustodialAccount]);

  useEffect(() => {
    handleAsyncResult(deletingPatientFromClinic, t('{{name}} has been removed from the clinic.', {
      name: get(selectedPatient, 'fullName', t('This patient')),
    }));
  }, [deletingPatientFromClinic]);

  useEffect(() => {
    setLoading(fetchingPatientsForClinic.inProgress);
  }, [fetchingPatientsForClinic.inProgress]);

  useEffect(() => {
    const { inProgress, completed, notification } = fetchingPatientsForClinic;

    if (!isFirstRender && !inProgress) {
      if (completed === false) {
        setToast({
          message: get(notification, 'message'),
          variant: 'danger',
        });
      }
    }
  }, [fetchingPatientsForClinic]);

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

  /* BEGIN TEMPORARY MOCK SUMMARY DATA */
  const [patientSummaries, setPatientSummaries] = useState({});

  function randomDate(start = moment().subtract(40, 'days').toDate(), end = new Date()) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  }

  function randomSummaryData(patient) {
    const bgUnits = sample([MGDL_UNITS, MMOLL_UNITS]);
    const lastUpload = randomDate();
    const lastData = randomDate(moment(lastUpload).subtract(random(0, 40), 'days').toDate(), lastUpload);
    const firstData = randomDate(moment(lastData).subtract(random(0, 100), 'days').toDate(), lastData);
    const timeInRange = random(3, 8, true);
    const timeAboveRange = random(1, 4, true);
    const timeVeryAboveRange = random(0, 2, true);
    const timeBelowRange = random(1, 4, true);
    const timeVeryBelowRange = random(0, 2, true);
    const rangeSum = sum([timeInRange, timeAboveRange, timeVeryAboveRange, timeBelowRange, timeVeryBelowRange]);
    const avgGlucose = rangeSum * (bgUnits === MMOLL_UNITS ? .7 : (.7 * MGDL_PER_MMOLL));
    const timeCGMUse = round(random(0.6, 1, true), 2);
    const meanInMGDL = bgUnits === MGDL_UNITS ? avgGlucose : avgGlucose * MGDL_PER_MMOLL;
    const glucoseMgmtIndicator = timeCGMUse >= 0.7 ? (3.31 + 0.02392 * meanInMGDL) / 100 : undefined;

    return {
      userId: patient.id,
      lastUpdated: new Date().toISOString(),
      firstData: firstData.toISOString(),
      lastData: lastData.toISOString(),
      lastUpload: lastUpload.toISOString(),
      outdatedSince: new Date().toISOString(),
      avgGlucose: { units: bgUnits, value: avgGlucose },
      glucoseMgmtIndicator,
      timeInRange: round(timeInRange / rangeSum, 2),
      timeAboveRange: round(timeAboveRange / rangeSum, 2),
      timeVeryAboveRange: round(timeVeryAboveRange / rangeSum, 2),
      timeBelowRange: round(timeBelowRange / rangeSum, 2),
      timeVeryBelowRange: round(timeVeryBelowRange / rangeSum, 2),
      timeCGMUse,
      highGlucoseThreshold: bgUnits === MMOLL_UNITS ? 10.0 : 180,
      lowGlucoseThreshold: bgUnits === MMOLL_UNITS ? 3.9 : 70,
    };
  }

  useEffect(() => {
    if (config.PATIENT_SUMMARIES_ENABLED && clinic?.patients) {
      setShowSummaryData(true); // TODO: at some point this will be enabled via backend authorization

      const summaries = { ...patientSummaries };

      forEach(clinic?.patients, (patient, patientId) => {
        if (!summaries[patientId]) {
          summaries[patientId] = randomSummaryData(patient);
        }
      });

      setPatientSummaries(summaries);
      console.log('summaries', summaries);
    }
  }, [clinic?.patients]);
  /* END TEMPORARY MOCK SUMMARY DATA */

  function formatPercentage(val, precision = 0) {
    if (!val || Number.isNaN(val)) {
      return statEmptyText
    }
    return format(`.${precision}%`)(val);
  }

  function clinicPatients() {
    return map(values(clinic?.patients), patient => (showSummaryData
      ? { ...patient, summary: patientSummaries[patient.id] }
      : patient
    ));
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
            processing={creatingClinicCustodialAccount.inProgress}
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
            processing={updatingClinicPatient.inProgress}
            disabled={!fieldsAreValid(keys(patientFormContext?.values), validationSchema, patientFormContext?.values)}
          >
            {t('Save Changes')}
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  function handleRemove(patient) {
    trackMetric('Clinic - Remove patient', { clinicId: selectedClinicId });
    setSelectedPatient(patient);
    setShowDeleteDialog(true);
  }

  function handleRemovePatient() {
    trackMetric('Clinic - Remove patient confirmed', { clinicId: selectedClinicId });
    dispatch(actions.async.deletePatientFromClinic(api, selectedClinicId, selectedPatient?.id));
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
    trackMetric('Clinic - Add patient', { clinicId: selectedClinicId });
    setShowAddPatientDialog(true);
  }

  function handleAddPatientConfirm() {
    trackMetric('Clinic - Add patient confirmed', { clinicId: selectedClinicId });
    patientFormContext?.handleSubmit();
  }

  function handleEditPatient(patient) {
    trackMetric('Clinic - Edit patient', { clinicId: selectedClinicId });
    setSelectedPatient(patient);
    setShowEditPatientDialog(true);
  }

  function handleEditPatientConfirm() {
    trackMetric('Clinic - Edit patient confirmed', { clinicId: selectedClinicId });
    patientFormContext?.handleSubmit();
  }

  function handlePatientFormChange(formikContext) {
    setPatientFormContext({...formikContext});
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
      {patient.email && <Text>{patient.email}</Text>}
    </Box>
  );

  const renderPatientSecondaryInfo = patient => (
    <Box classname="patient-secondary-info" onClick={handleClickPatient(patient)} sx={{ cursor: 'pointer' }}>
      <Text>{t('DOB:')} {patient.birthDate}</Text>
      {patient.mrn && <Text>{t('MRN: {{mrn}}', { mrn: patient.mrn })}</Text>}
    </Box>
  );

  const renderLastUpload = ({ summary }) => {
    let formattedLastUpload = statEmptyText;

    if (summary?.lastUpload) {
      const lastUploadMoment = moment(summary.lastUpload);
      const daysAgo = moment().diff(lastUploadMoment, 'days');
      formattedLastUpload = lastUploadMoment.format(dateFormat);

      if (daysAgo <= 1) {
        formattedLastUpload = (daysAgo === 1) ? t('Yesterday') : t('Today');
      } else if (daysAgo <=30) {
        formattedLastUpload = t('{{days}} days ago', { days: daysAgo });
      }
    }

    return (
      <Box classname="patient-last-upload">
        <Text>{formattedLastUpload}</Text>
      </Box>
    );
  };

  const renderCGMUsage = ({ summary }) => (
    <Box classname="patient-cgm-usage">
      <Text>{summary?.timeCGMUse ? formatPercentage(summary.timeCGMUse) : statEmptyText}</Text>
    </Box>
  );

  const renderGMI = ({ summary }) => (
    <Box classname="patient-gmi">
      <Text>{summary?.glucoseMgmtIndicator ? formatPercentage(summary.glucoseMgmtIndicator) : statEmptyText}</Text>
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

    if (isClinicAdmin) items.push({
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

    if (showSummaryData) {
      columns.splice(1, 2, ...[
        {
          title: '',
          field: 'patientSecondary',
          align: 'left',
          sortable: true,
          sortBy: 'birthDate',
          render: renderPatientSecondaryInfo,
        },
        {
          title: t('Last Upload (CGM)'),
          field: 'lastUpload',
          align: 'left',
          sortable: true,
          sortBy: 'summary.lastUpload',
          render: renderLastUpload,
        },
        {
          title: t('% CGM Use'),
          field: 'lastUpload',
          align: 'center',
          render: renderCGMUsage,
        },
        {
          title: t('GMI'),
          field: 'glucoseMgmtIndicator',
          align: 'center',
          render: renderGMI,
        },
      ]);
    }

    return (
      <Box sx={{ position: 'relative' }}>
        <Loader show={loading} overlay={true} />
        <Table
          id={'peopleTable'}
          label={'peopletablelabel'}
          columns={columns}
          data={clinicPatients()}
          style={{fontSize: showSummaryData ? '12px' : '14px'}}
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
      {renderAddPatientDialog()}
      {renderEditPatientDialog()}
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
