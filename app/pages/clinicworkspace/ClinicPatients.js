import React, { useCallback, useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { push } from 'connected-react-router';
import { translate, Trans } from 'react-i18next';
import { format } from 'd3-format';
import moment from 'moment';
import debounce from 'lodash/debounce';
import forEach from 'lodash/forEach';
import find from 'lodash/find';
import get from 'lodash/get';
import includes from 'lodash/includes';
import isEmpty from 'lodash/isEmpty';
import keys from 'lodash/keys';
import map from 'lodash/map';
import random from 'lodash/random';
import round from 'lodash/round';
import sample from 'lodash/sample';
import sum from 'lodash/sum';
import values from 'lodash/values';
import without from 'lodash/without';
import { Box, Flex, Text } from 'rebass/styled-components';
import CloseRoundedIcon from '@material-ui/icons/CloseRounded';
import DeleteIcon from '@material-ui/icons/DeleteRounded';
import DoubleArrowIcon from '@material-ui/icons/DoubleArrow';
import EditIcon from '@material-ui/icons/EditRounded';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';
import KeyboardArrowDownRoundedIcon from '@material-ui/icons/KeyboardArrowDownRounded';
import RefreshRoundedIcon from '@material-ui/icons/RefreshRounded';
import SearchIcon from '@material-ui/icons/Search';
import VisibilityOffOutlinedIcon from '@material-ui/icons/VisibilityOffOutlined';
import VisibilityOutlinedIcon from '@material-ui/icons/VisibilityOutlined';
import { components as vizComponents, utils as vizUtils } from '@tidepool/viz';

import {
  bindPopover,
  bindTrigger,
  usePopupState,
} from 'material-ui-popup-state/hooks';

import {
  MediumTitle,
  Body1,
} from '../../components/elements/FontStyles';

import Button from '../../components/elements/Button';
import Icon from '../../components/elements/Icon';
import Table from '../../components/elements/Table';
import Pagination from '../../components/elements/Pagination';
import TextInput from '../../components/elements/TextInput';
import BgRangeSummary from '../../components/clinic/BgRangeSummary';
import PatientForm from '../../components/clinic/PatientForm';
import Pill from '../../components/elements/Pill';
import PopoverMenu from '../../components/elements/PopoverMenu';
import PopoverLabel from '../../components/elements/PopoverLabel';
import Popover from '../../components/elements/Popover';
import RadioGroup from '../../components/elements/RadioGroup';
import Checkbox from '../../components/elements/Checkbox';
import FilterIcon from '../../core/icons/FilterIcon.svg';
import SendEmailIcon from '../../core/icons/SendEmailIcon.svg';

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
import { default as baseTheme, borders, radii } from '../../themes/baseTheme';

const { Loader } = vizComponents;
const { reshapeBgClassesToBgBounds, generateBgRangeLabels } = vizUtils.bg;

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
  const [showTimeInRangeDialog, setShowTimeInRangeDialog] = useState(false);
  const [showSendUploadReminderDialog, setShowSendUploadReminderDialog] = useState(false);
  const [showNames, setShowNames] = useState(false);
  const [showSummaryData, setShowSummaryData] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [patientFormContext, setPatientFormContext] = useState();
  const [patientFetchOptions, setPatientFetchOptions] = useState({ limit: 8, search: '', offset: 0, sort: '+fullName' });
  const [patientFetchMinutesAgo, setPatientFetchMinutesAgo] = useState();
  const statEmptyText = '--';

  const defaultFilterState = {
    lastUpload: null,
    timeInRange: [],
    meetsCriteria: true,
  };

  const defaultBgPrefs = {
    bgUntis: MGDL_UNITS,
    bgBounds: reshapeBgClassesToBgBounds({ bgUnits: MGDL_UNITS }),
  };

  const defaultBgLabels = generateBgRangeLabels(defaultBgPrefs, { condensed: true });

  const [activeFilters, setActiveFilters] = useState(defaultFilterState);
  const [pendingFilters, setPendingFilters] = useState(defaultFilterState);

  const lastUploadFilterOptions = [
    { value: 1, label: t('Today') },
    { value: 14, label: t('Last 14 days') },
    { value: 30, label: t('Last 30 days') },
  ];

  const timeInRangeFilterOptions = [
    { value: t('timeVeryBelowRange'), label: t('<1% Time below Range'), tag: t('Severe Hypoglycemia'), rangeName: 'veryLow' },
    { value: t('timeBelowRange'), label: t('<4% Time below Range'), tag: t('Low'), rangeName: 'low' },
    { value: t('timeInRange'), label: t('>70% Time in Range'), tag: t('Normal'), rangeName: 'target' },
    { value: t('timeAboveRange'), label: t('<25% Time above Range'), tag: t('High'), rangeName: 'high' },
    { value: t('timeVeryAboveRange'), label: t('<5% Time above Range'), tag: t('Severe Hyperglycemia'), rangeName: 'veryHigh' },
  ];

  const lastUploadPopupFilterState = usePopupState({
    variant: 'popover',
    popupId: 'lastUploadFilters',
  });

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
        handleCloseOverlays();

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

  React.useEffect(() => {
    const patientFetchMoment = moment.utc(clinic?.lastPatientFetchTime);

    // update patientFetchMinutesAgo upon new fetch
    setPatientFetchMinutesAgo(moment.utc().diff(patientFetchMoment, 'minutes'));

    // update patientFetchMinutesAgo every minute thereafter
    const fetchTimeInterval = setInterval(() => {
      setPatientFetchMinutesAgo(moment.utc().diff(patientFetchMoment, 'minutes'));
    }, 1000 * 60);

    return () => clearInterval(fetchTimeInterval);
  }, [clinic?.lastPatientFetchTime]);

  // Fetchers
  useEffect(() => {
    if (
      loggedInUserId
      && clinic?.id
      && !fetchingPatientsForClinic.inProgress
    ) {
      const fetchOptions = { ...patientFetchOptions };
      if (isEmpty(fetchOptions.search)) delete fetchOptions.search;
      dispatch(actions.async.fetchPatientsForClinic.bind(null, api, clinic.id, fetchOptions)());
    }
  }, [loggedInUserId, clinic?.id, patientFetchOptions]);

  /* BEGIN TEMPORARY MOCK SUMMARY DATA */
  const [patientSummaries, setPatientSummaries] = useState({});

  function randomDate(start = moment().subtract(random(0, 80), 'days').toDate(), end = new Date()) {
    return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
  }

  function randomSummaryData(patient) {
    const bgUnits = sample([MGDL_UNITS, MMOLL_UNITS]);
    const lastUpload = randomDate();
    const lastData = randomDate(moment(lastUpload).subtract(random(0, 40), 'days').toDate(), lastUpload);
    const firstData = randomDate(moment(lastData).subtract(random(1, 30), 'days').toDate(), lastData);
    const timeInRange = random(3, 10, true);
    const timeAboveRange = random(1, 2.5, true);
    const timeVeryAboveRange = random(0, 1, true);
    const timeBelowRange = random(0.5, 1.5, true);
    const timeVeryBelowRange = random(0, 0.5, true);
    const rangeSum = sum([timeInRange, timeAboveRange, timeVeryAboveRange, timeBelowRange, timeVeryBelowRange]);
    const avgGlucose = rangeSum * (bgUnits === MMOLL_UNITS ? .7 : (.7 * MGDL_PER_MMOLL));
    const timeCGMUse = round(random(0.6, 0.95, true), 2);
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
      hyperGlycemicEvents: round(random(0, timeVeryAboveRange * 4.5)),
      hypoGlycemicEvents: round(random(0, timeVeryBelowRange * 3.5)),
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
    }
  }, [clinic?.patients]);

  useEffect(() => {
    if (showSummaryData) {
      setPatientFetchOptions({ ...patientFetchOptions, limit: 10 });
    }
  }, [showSummaryData])

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
    const activeFiltersCount = without([activeFilters.lastUpload, activeFilters.timeInRange.length], null, 0).length;
    const VisibilityIcon = showNames ? VisibilityOffOutlinedIcon : VisibilityOutlinedIcon;
    const hoursAgo = Math.floor(patientFetchMinutesAgo / 60);
    let timeAgoUnits = hoursAgo === 0 ? t('hour') : t('hours');
    let timeAgo = hoursAgo === 0 ? t('less than an') : hoursAgo;

    if (hoursAgo >= 24) {
      timeAgo = hoursAgo < 24 ? hoursAgo : t('over 24');
    }

    const timeAgoMessage = t('Last updated {{timeAgo}} {{timeAgoUnits}} ago', { timeAgo, timeAgoUnits });

    return (
      <>
        <Box sx={{ position: 'absolute', top: '8px', right: 4 }}>
          <TextInput
            themeProps={{
              width: 'auto',
              minWidth: '250px',
            }}
            fontSize="12px"
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
        </Box>

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
              sx={{ gap: 2 }}
            >
              <Button
                id="add-patient"
                variant="primary"
                onClick={handleAddPatient}
                fontSize={0}
                mr={1}
              >
                {t('Add New Patient')}
              </Button>

              {showSummaryData && (
                <>
                  <Flex
                    alignItems="center"
                    color={activeFiltersCount > 0 ? 'purpleMedium' : 'grays.4'}
                    pl={2}
                    py={1}
                    sx={{ gap: 1, borderLeft: borders.divider }}
                  >
                    {activeFiltersCount > 0 ? (
                      <Pill
                        label="filter count"
                        round
                        width="14px"
                        lineHeight="15px"
                        fontSize="9px"
                        colorPalette={['purpleMedium', 'white']}
                        text={`${activeFiltersCount}`}
                      />
                    ) : (
                      <Icon
                        id="filter-icon"
                        variant="static"
                        iconSrc={FilterIcon}
                        label={t('Filter')}
                        fontSize={1}
                        width="14px"
                        color={'grays.4'}
                      />
                    )}
                    <Text fontSize={0}>{t('Filter By')}</Text>
                  </Flex>

                  <Button
                    variant="filter"
                    selected={!!activeFilters.lastUpload}
                    {...bindTrigger(lastUploadPopupFilterState)}
                    icon={KeyboardArrowDownRoundedIcon}
                    iconLabel="Filter by last upload"
                    ml={2}
                    fontSize={0}
                    lineHeight={1.3}
                  >
                    {activeFilters.lastUpload ? find(lastUploadFilterOptions, { value: activeFilters.lastUpload })?.label : t('Last Upload')}
                  </Button>

                  <Popover minWidth="11em" closeIcon {...bindPopover(lastUploadPopupFilterState)}>
                    <DialogContent px={2} py={3} dividers>
                      <RadioGroup
                        id="last-upload-filters"
                        name="last-upload-filters"
                        options={lastUploadFilterOptions}
                        variant="vertical"
                        fontSize={0}
                        value={pendingFilters.lastUpload || activeFilters.lastUpload}
                        onChange={event => { // TODO: Move to dedicated event handler function
                          setPendingFilters({ ...pendingFilters, lastUpload: parseInt(event.target.value) || null });
                        }}
                      />
                    </DialogContent>

                    <DialogActions justifyContent="space-between" p={1}>
                      <Button
                        fontSize={1}
                        variant="textSecondary"
                        onClick={() => {
                          setPendingFilters({ ...activeFilters, lastUpload: defaultFilterState.lastUpload });
                          setActiveFilters({ ...activeFilters, lastUpload: defaultFilterState.lastUpload });
                          lastUploadPopupFilterState.close();
                        }}
                      >
                        {t('Clear')}
                      </Button>

                      <Button fontSize={1} variant="textPrimary" onClick={() => {
                        setActiveFilters(pendingFilters);
                        lastUploadPopupFilterState.close();
                      }}>
                        {t('Apply')}
                      </Button>
                    </DialogActions>
                  </Popover>

                  <Button
                    variant="filter"
                    selected={!!activeFilters.timeInRange.length}
                    onClick={handleOpenTimeInRangeFilter}
                    ml={2}
                    fontSize={0}
                    lineHeight={1.3}
                  >
                    {t('% Time in Range')}
                    {!!activeFilters.timeInRange.length && (
                      <Pill
                        label="filter count"
                        round
                        width="14px"
                        fontSize="9px"
                        lineHeight="15px"
                        ml={1}
                        sx={{
                          textAlign: 'center',
                          display: 'inline-block',
                        }}
                        colorPalette={['purpleMedium', 'white']}
                        text={`${activeFilters.timeInRange.length}`}
                      />
                    )}
                  </Button>

                  {activeFiltersCount > 0 && (
                    <Button
                      id="profileEditButton"
                      variant="textSecondary"
                      onClick={handleResetFilters}
                      fontSize={0}
                      color="grays.4"
                    >
                      {t('Reset Filters')}
                    </Button>
                  )}
                </>
              )}
            </Flex>

            <Flex
              alignItems="center"
              justifyContent="flex-end"
            >
              {showSummaryData && showNames && (
                <Flex pr={3} py={1} mr={2} alignItems="center" sx={{ borderRight: borders.divider }}>
                  <Icon
                    mr={2}
                    id="refresh-patients"
                    variant="default"
                    icon={RefreshRoundedIcon}
                    color={loading ? 'text.primaryDisabled' : 'inherit'}
                    disabled={loading}
                    label={t('Refresh patients list')}
                    onClick={handleRefreshPatients}
                  />

                  <Text fontSize={0}>{timeAgoMessage}</Text>
                </Flex>
              )}

              <Icon
                id="patients-view-toggle"
                variant="default"
                color="grays.4"
                ml={1}
                icon={VisibilityIcon}
                label={t('Toggle visibility')}
                onClick={handleToggleShowNames}
              />

              {showSummaryData && (
                <Icon
                  id="patients-info-trigger"
                  variant="default"
                  color="grays.4"
                  ml={2}
                  icon={InfoOutlinedIcon}
                  label={t('Extra info')}
                  onClick={() => {}}
                />
              )}
            </Flex>
          </Flex>
        </Flex>
      </>
    );
  };

  function handleRefreshPatients() {
    dispatch(actions.async.fetchPatientsForClinic.bind(null, api, clinic.id, { ...patientFetchOptions })());
  }

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
      <Text fontSize={1} py={4} mb={4} textAlign="center" sx={{ a: { color: 'text.link', cursor: 'pointer' } }}>
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
        onClose={handleCloseOverlays}
      >
        <DialogTitle onClose={handleCloseOverlays}>
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
          <Button id="patientRemoveCancel" variant="secondary" onClick={handleCloseOverlays}>
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
        onClose={handleCloseOverlays}
      >
        <DialogTitle onClose={handleCloseOverlays}>
          <MediumTitle id="dialog-title">{t('Add New Patient Account')}</MediumTitle>
        </DialogTitle>

        <DialogContent>
          <PatientForm api={api} trackMetric={trackMetric} onFormChange={handlePatientFormChange} />
        </DialogContent>

        <DialogActions>
          <Button id="addPatientCancel" variant="secondary" onClick={handleCloseOverlays}>
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
        aria-labelledby="dialog-title"
        open={showEditPatientDialog}
        onClose={handleCloseOverlays}
      >
        <DialogTitle onClose={handleCloseOverlays}>
          <MediumTitle id="dialog-title">{t('Edit Patient Details')}</MediumTitle>
        </DialogTitle>

        <DialogContent>
          <PatientForm api={api} trackMetric={trackMetric} onFormChange={handlePatientFormChange} patient={selectedPatient} />
        </DialogContent>

        <DialogActions>
          <Button id="editPatientCancel" variant="secondary" onClick={handleCloseOverlays}>
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

  const renderSendUploadReminderDialog = () => {
    return (
      <Dialog
        id="resendInvite"
        aria-labelledby="dialog-title"
        open={showSendUploadReminderDialog}
        onClose={handleCloseOverlays}
      >
        <DialogTitle onClose={handleCloseOverlays}>
          <MediumTitle id="dialog-title">{t('Send Upload Reminder')}</MediumTitle>
        </DialogTitle>
        <DialogContent>
          <Body1>
            <Text>
              {t('Are you sure you want to send an upload reminder email to {{name}}?', { name: selectedPatient?.fullName })}
            </Text>
          </Body1>
        </DialogContent>
        <DialogActions>
          <Button variant="secondary" onClick={handleCloseOverlays}>
            {t('Cancel')}
          </Button>
          <Button
            className="resend-invitation"
            variant="primary"
            // processing={sendingUploadReminder.inProgress} // TODO: API not implemented yet
            onClick={() => {
              handleSendUploadReminderConfirm(selectedPatient);
            }}
          >
            {t('Send ')}
          </Button>
        </DialogActions>
      </Dialog>
    );
  };

  const renderTimeInRangeDialog = () => {
    return (
      <Dialog
        id="timeInRangeDialog"
        aria-label="Time in range filters"
        open={showTimeInRangeDialog}
        onClose={handleCloseOverlays}
        maxWidth='lg'
      >
        <DialogTitle
          p={0}
          sx={{
            border: 'none',
            button: { position: 'absolute !important', top: 1, right: 1 },
          }}
          onClose={handleCloseOverlays}
        />

        <DialogContent color="text.primary" pl={5} pr={6} pb={4}>
          <Flex alignItems="center" mb={4} fontSize={1} fontWeight="medium">
            <Text mr={2} sx={{ whiteSpace: 'nowrap' }}>{t('View all patients that')}</Text>

            <Button
              variant={pendingFilters.meetsCriteria ? 'primary' : 'secondary'}
              color={pendingFilters.meetsCriteria ? 'white' : 'grays.4'}
              sx={{
                borderColor: pendingFilters.meetsCriteria ? 'purpleMedium' : 'grays.1',
                whiteSpace: 'nowrap',
                borderRight: 0,
                borderTopRightRadius: 0,
                borderBottomRightRadius: 0,
              }}
              onClick={() => setPendingFilters({ ...pendingFilters, meetsCriteria: true })}
            >
              {t('meet')}
            </Button>

            <Button
              variant={!pendingFilters.meetsCriteria ? 'primary' : 'secondary'}
              color={!pendingFilters.meetsCriteria ? 'white' : 'grays.4'}
              sx={{
                borderColor: !pendingFilters.meetsCriteria ? 'purpleMedium' : 'grays.1',
                whiteSpace: 'nowrap',
                borderLeft: 0,
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0,
              }}
              onClick={() => setPendingFilters({ ...pendingFilters, meetsCriteria: false })}
            >
              {t('do NOT meet')}
            </Button>

            <Text ml={2} sx={{ whiteSpace: 'nowrap' }}>{t('the checked glycemic targets:')}</Text>
          </Flex>

          {map(timeInRangeFilterOptions, ({ value, label, rangeName, tag }) => (
            <Flex mb={3} alignItems="center" sx={{ gap: 2 }}>
              <Checkbox
                id={`range-${value}-filter`}
                name={`range-${value}-filter`}
                variant="inputs.checkboxGroup.vertical"
                theme={baseTheme}
                key={value}
                checked={includes([...pendingFilters.timeInRange], value)}
                onChange={event => {
                  setPendingFilters(event.target.checked
                    ? { ...pendingFilters, timeInRange: [...pendingFilters.timeInRange, value] }
                    : { ...pendingFilters, timeInRange: without(pendingFilters.timeInRange, value) }
                  );
                }}
              />

              <Box fontWeight="medium">
                <Flex alignItems="center">
                  <Text fontSize={0} mr={2}>{label}</Text>
                  <Pill fontSize="10px" lineHeight="1" py="2px" sx={{ border: '1px solid', borderColor: 'grays.1', textTransform: 'none' }} colorPalette={['white', 'grays.4']} text={`${defaultBgLabels[rangeName]} ${MGDL_UNITS}`} />
                </Flex>

                <Pill fontSize="9px" py="2px" sx={{ borderRadius: radii.input, textTransform: 'none' }} colorPalette={[`bg.${rangeName}`, 'white']} text={tag} />
              </Box>
            </Flex>
          ))}

          <Button
            variant="textSecondary"
            px={0}
            fontSize={0}
            onClick={() => {
              setPendingFilters({ ...pendingFilters, timeInRange: defaultFilterState.timeInRange });
            }}
          >
            {t('Unselect all')}
          </Button>

          <Text fontSize={0} color="grays.4">
            {t('Filter is set to view all patients that {{criteria}} meeting all clinical target ranges.', { criteria: pendingFilters.meetsCriteria ? t('are') : t('are NOT') })}
          </Text>
        </DialogContent>

        <DialogActions justifyContent="space-between">
          <Button
            id="timeInRangeFilterClear"
            variant="secondary"
            onClick={() => {
              setPendingFilters({ ...activeFilters, timeInRange: defaultFilterState.timeInRange });
              setActiveFilters({ ...activeFilters, timeInRange: defaultFilterState.timeInRange });
              handleCloseOverlays();
            }}
          >
            {t('Clear')}
          </Button>

          <Button
            id="timeInRangeFilterConfirm"
            variant="primary"
            onClick={handleFilterTimeInRange}
            processing={updatingClinicPatient.inProgress}
            disabled={!fieldsAreValid(keys(patientFormContext?.values), validationSchema, patientFormContext?.values)}
          >
            {t('Apply Filter')}
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

  function handleCloseOverlays() {
    setShowDeleteDialog(false);
    setShowAddPatientDialog(false);
    setShowEditPatientDialog(false);
    setShowTimeInRangeDialog(false);
    setShowSendUploadReminderDialog(false);
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

  function handleSendUploadReminder(patient) {
    trackMetric('Clinic - Send upload reminder', { clinicId: selectedClinicId });
    setSelectedPatient(patient);
    setShowSendUploadReminderDialog(true);
  }

  function handleSendUploadReminderConfirm() {
    trackMetric('Clinic - Send upload reminder confirmed', { clinicId: selectedClinicId });
    // dispatch(actions.async.sendUploadReminder(api, selectedClinicId, selectedPatient?.id)); // TODO: API not implemented yet
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

  function handleClearSearch() {
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

  function handleResetFilters() {
    setActiveFilters(defaultFilterState);
    setPendingFilters(defaultFilterState);
  }

  function handleOpenTimeInRangeFilter() {
    trackMetric('Clinic - Filter by time in range', { clinicId: selectedClinicId });
    setShowTimeInRangeDialog(true);
  }

  function handleFilterTimeInRange() {
    setActiveFilters({
      ...activeFilters,
      timeInRange: pendingFilters.timeInRange,
    })
    setShowTimeInRangeDialog(false);
  }

  const renderPatient = patient => (
    <Box onClick={handleClickPatient(patient)} sx={{ cursor: 'pointer' }}>
      <Text fontWeight="medium">{patient.fullName}</Text>
      {patient.email && <Text fontSize=".85em">{patient.email}</Text>}
    </Box>
  );

  const renderPatientSecondaryInfo = patient => (
    <Box classname="patient-secondary-info" onClick={handleClickPatient(patient)} fontSize="10px" sx={{ cursor: 'pointer' }}>
      <Text>{t('DOB:')} {patient.birthDate}</Text>
      {patient.mrn && <Text>{t('MRN: {{mrn}}', { mrn: patient.mrn })}</Text>}
    </Box>
  );

  const renderLastUpload = ({ summary }) => {
    let formattedLastUpload = statEmptyText;
    let color = 'inherit';
    let fontWeight = 'regular';

    if (summary?.lastUpload) {
      const lastUploadMoment = moment(summary.lastUpload);
      const daysAgo = moment().diff(lastUploadMoment, 'days');
      formattedLastUpload = lastUploadMoment.format(dateFormat);

      if (daysAgo <= 1) {
        formattedLastUpload = (daysAgo === 1) ? t('Yesterday') : t('Today');
        fontWeight = 'medium';
        color = 'greens.9';
      } else if (daysAgo <=30) {
        formattedLastUpload = t('{{days}} days ago', { days: daysAgo });
        fontWeight = 'medium';
        color = '#E29147';
      }
    }

    return (
      <Box classname="patient-last-upload">
        <Text color={color} fontWeight={fontWeight}>{formattedLastUpload}</Text>
      </Box>
    );
  };

  const renderCGMUsage = ({ summary }) => (
    <Box classname="patient-cgm-usage">
      <Text fontWeight="medium">{summary?.timeCGMUse ? formatPercentage(summary.timeCGMUse) : statEmptyText}</Text>
    </Box>
  );

  const renderGMI = ({ summary }) => (
    <Box classname="patient-gmi">
      <Text fontWeight="medium">{summary?.glucoseMgmtIndicator ? formatPercentage(summary.glucoseMgmtIndicator) : statEmptyText}</Text>
    </Box>
  );

  const renderBgRangeSummary = ({ summary }) => {
    const bgUnits = summary?.avgGlucose.units;
    const targetRange = [summary?.lowGlucoseThreshold, summary?.highGlucoseThreshold];
    const hoursInRange = moment(summary?.lastData).diff(moment(summary?.firstData), 'hours');
    const cgmHours = hoursInRange * summary?.timeCGMUse;

    const data = {
      veryLow: summary?.timeVeryBelowRange,
      low: summary?.timeBelowRange,
      target: summary?.timeInRange,
      high: summary?.timeAboveRange,
      veryHigh: summary?.timeVeryAboveRange,
    };

    return (
      <Flex justifyContent="center">
        {cgmHours >= 24
          ? <BgRangeSummary striped={summary?.timeCGMUse < 0.7} data={data} targetRange={targetRange} bgUnits={bgUnits} />
          : (
            <Flex alignItems="center" justifyContent="center" bg="lightestGrey" width="200px" height="20px">
              <Text fontSize="10px" fontWeight="medium" color="grays.4">{t('CGM Use <24 hours')}</Text>
            </Flex>
          )
        }
      </Flex>
    );
  };


  const renderGlycemicEvent = (type, value) => {
    const rotation = type === 'low' ? 90 : -90;
    const color = type === 'low' ? 'bg.veryLow' : 'bg.veryHigh';
    const visibility = value > 0 ? 'visible' : 'hidden';

    return (
      <Flex alignItems="center" sx={{ visibility, gap: '2px' }}>
        <Icon
          fontSize={1}
          sx={{ transform: `rotate(${rotation}deg)` }}
          icon={DoubleArrowIcon}
          color={color}
          label={type}
          variant="static"
        />
        <Text fontWeight="medium" fontSize="10px">{value}</Text>
      </Flex>
    );
  };

  const renderGlycemicEvents = ({ summary }) => (
    <Flex alignContent="center" justifyContent="center" sx={{ gap: 3 }}>
      {renderGlycemicEvent('low', summary?.hypoGlycemicEvents)}
      {renderGlycemicEvent('high', summary?.hyperGlycemicEvents)}
    </Flex>
  );

  const renderGlycemicEventsPopover = () => (
    <Box p={1}>
      <Flex alignItems="center" sx={{ gap: '2px' }}>
        <Icon
          fontSize={1}
          sx={{ transform: 'rotate(90deg)' }}
          icon={DoubleArrowIcon}
          color="bg.veryLow"
          label="low"
          variant="static"
        />
        <Text color="text.primary" fontSize="10px">{t('(Hypo event description)')}</Text>
      </Flex>
      <Flex alignItems="center" sx={{ gap: '2px' }}>
        <Icon
          fontSize={1}
          sx={{ transform: 'rotate(-90deg)' }}
          icon={DoubleArrowIcon}
          color="bg.veryHigh"
          label="high"
          variant="static"
        />
        <Text color="text.primary" fontSize="10px">{t('(Hyper event description)')}</Text>
      </Flex>
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

    if (showSummaryData && patient.email) items.push({
      iconSrc: SendEmailIcon,
      iconLabel: t('Send Upload Reminder'),
      iconPosition: 'left',
      id: `send-upload-reminder-${patient.id}`,
      variant: 'actionListItem',
      onClick: _popupState => {
        _popupState.close();
        handleSendUploadReminder(patient);
      },
      text: t('Send Upload Reminder')
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
        title: t('Patient Details'),
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
          sortBy: 'summary.lastUpload',
          render: renderLastUpload,
        },
        {
          title: t('% CGM Use'),
          field: 'cgmUse',
          align: 'center',
          render: renderCGMUsage,
        },
        {
          title: t('GMI'),
          field: 'glucoseMgmtIndicator',
          align: 'center',
          render: renderGMI,
        },
        {
          title: t('% Time In Range'),
          field: 'bgRangeSummary',
          align: 'center',
          render: renderBgRangeSummary,
        },
        // Commented out for the time being. Glycemic events will be part of a future version
        // {
        //   titleComponent: () => (
        //     <PopoverLabel
        //       label={t('Glycemic Events')}
        //       icon={InfoOutlinedIcon}
        //       iconFontSize="12px"
        //       popoverContent={renderGlycemicEventsPopover()}
        //       popoverProps={{
        //         anchorOrigin: {
        //           vertical: 'bottom',
        //           horizontal: 'center',
        //         },
        //         transformOrigin: {
        //           vertical: 'top',
        //           horizontal: 'center',
        //         },
        //         width: 'auto',
        //       }}
        //       triggerOnHover
        //     />
        //   ),
        //   field: 'hypoEvents',
        //   align: 'center',
        //   render: renderGlycemicEvents,
        // },
      ]);
    }

    const pageCount = Math.ceil(clinic.patientCount / patientFetchOptions.limit);

    return (
      <Box sx={{ position: 'relative' }}>
        <Loader show={loading} overlay={true} />
        <Table
          id={'peopleTable'}
          variant={showSummaryData ? 'condensed' : 'default'}
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
            px="5%"
            sx={{ position: 'absolute', bottom: '-50px' }}
            width="100%"
            id="clinic-patients-pagination"
            count={pageCount}
            disabled={pageCount < 2}
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
      {showAddPatientDialog && renderAddPatientDialog()}
      {showEditPatientDialog && renderEditPatientDialog()}
      {showTimeInRangeDialog && renderTimeInRangeDialog()}
      {showSendUploadReminderDialog && renderSendUploadReminderDialog()}
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
