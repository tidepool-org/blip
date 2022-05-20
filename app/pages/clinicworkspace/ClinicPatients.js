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
import omit from 'lodash/omit';
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
import sundial from 'sundial';

import {
  bindPopover,
  bindTrigger,
  usePopupState,
} from 'material-ui-popup-state/hooks';

import {
  MediumTitle,
  Body1,
  Paragraph1,
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
import { useIsFirstRender, useLocalStorage } from '../../core/hooks';
import { fieldsAreValid } from '../../core/forms';
import { dateFormat, patientSchema as validationSchema } from '../../core/clinicUtils';
import { MGDL_PER_MMOLL, MGDL_UNITS } from '../../core/constants';
import { borders, radii } from '../../themes/baseTheme';

const { Loader } = vizComponents;
const { reshapeBgClassesToBgBounds, generateBgRangeLabels } = vizUtils.bg;
const { getLocalizedCeiling } = vizUtils.datetime;

export const ClinicPatients = (props) => {
  const { t, api, trackMetric, searchDebounceMs } = props;
  const isFirstRender = useIsFirstRender();
  const dispatch = useDispatch();
  const { set: setToast } = useToasts();
  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);
  const loggedInUserId = useSelector((state) => state.blip.loggedInUserId);
  const clinics = useSelector((state) => state.blip.clinics);
  const clinic = get(clinics, selectedClinicId);
  const timePrefs = useSelector((state) => state.blip.timePrefs);
  const isClinicAdmin = includes(get(clinic, ['clinicians', loggedInUserId, 'roles'], []), 'CLINIC_ADMIN');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showAddPatientDialog, setShowAddPatientDialog] = useState(false);
  const [showEditPatientDialog, setShowEditPatientDialog] = useState(false);
  const [showTimeInRangeDialog, setShowTimeInRangeDialog] = useState(false);
  const [showSendUploadReminderDialog, setShowSendUploadReminderDialog] = useState(false);
  const [showNames, setShowNames] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [patientFormContext, setPatientFormContext] = useState();
  const [patientFetchMinutesAgo, setPatientFetchMinutesAgo] = useState();
  const statEmptyText = '--';
  const [showSummaryData, setShowSummaryData] = useState(clinic?.tier >= 'tier0200');
  const [clinicBgUnits, setClinicBgUnits] = useState(MGDL_UNITS);
  const [patientFetchOptions, setPatientFetchOptions] = useLocalStorage('patientFetchOptions', {});
  const [patientFetchCount, setPatientFetchCount] = useState(0);

  const defaultFilterState = {
    lastUploadDate: null,
    timeInRange: [],
    meetsGlycemicTargets: true,
  };

  const bgPrefs = () => ({
    bgUnits: clinicBgUnits,
    bgBounds: reshapeBgClassesToBgBounds({ bgUnits: clinicBgUnits }),
  });

  const bgLabels = () => generateBgRangeLabels(bgPrefs(), { condensed: true });
  const [activeFilters, setActiveFilters] = useState(defaultFilterState);
  const [pendingFilters, setPendingFilters] = useState(defaultFilterState);

  const lastUploadDateFilterOptions = [
    { value: 1, label: t('Today') },
    { value: 2, label: t('Last 2 days') },
    { value: 14, label: t('Last 14 days') },
    { value: 30, label: t('Last 30 days') },
  ];

  const glycemicTargetThresholds = {
    percentTimeInVeryLow: { value: 1, comparator: '<' },
    percentTimeInLow: { value: 4, comparator: '<' },
    percentTimeInTarget: { value: 70, comparator: '>' },
    percentTimeInHigh: { value: 25, comparator: '<' },
    percentTimeInVeryHigh: { value: 5, comparator: '<' },
  }

  const timeInRangeFilterOptions = [
    { value: 'percentTimeInVeryLow', label: t('{{comparator}}{{value}}% Time below Range', glycemicTargetThresholds.percentTimeInVeryLow), tag: t('Severe Hypoglycemia'), rangeName: 'veryLow' },
    { value: 'percentTimeInLow', label: t('{{comparator}}{{value}}% Time below Range', glycemicTargetThresholds.percentTimeInLow), tag: t('Low'), rangeName: 'low' },
    { value: 'percentTimeInTarget', label: t('{{comparator}}{{value}}% Time in Range', glycemicTargetThresholds.percentTimeInTarget), tag: t('Normal'), rangeName: 'target' },
    { value: 'percentTimeInHigh', label: t('{{comparator}}{{value}}% Time above Range', glycemicTargetThresholds.percentTimeInHigh), tag: t('High'), rangeName: 'high' },
    { value: 'percentTimeInVeryHigh', label: t('{{comparator}}{{value}}% Time above Range', glycemicTargetThresholds.percentTimeInVeryHigh), tag: t('Severe Hyperglycemia'), rangeName: 'veryHigh' },
  ];

  const lastUploadDatePopupFilterState = usePopupState({
    variant: 'popover',
    popupId: 'lastUploadDateFilters',
  });

  const debounceSearch = useCallback(debounce(search => {
    setPatientFetchOptions({
      ...patientFetchOptions,
      offset: 0,
      sort: '+fullName',
      search,
    });
  }, searchDebounceMs), [patientFetchOptions]);

  const {
    fetchingPatientsForClinic,
    deletingPatientFromClinic,
    updatingClinicPatient,
    creatingClinicCustodialAccount,
    sendingPatientUploadReminder,
  } = useSelector((state) => state.blip.working);

  const prefixPopHealthMetric = metric => `Clinic - Population Health - ${metric}`;

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
    handleAsyncResult(sendingPatientUploadReminder, t('Uploader reminder email for {{name}} has been sent.', {
      name: get(selectedPatient, 'fullName', t('this patient')),
    }));
  }, [sendingPatientUploadReminder]);

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

      // For subsequent patient fetches, such as When filtering or searching, we can assume that
      // the user would like to see the results
      if (!showNames && patientFetchCount > 0) setShowNames(true);
      setPatientFetchCount(patientFetchCount + 1);
    }
  }, [fetchingPatientsForClinic]);

  useEffect(() => {
    const patientFetchMoment = moment.utc(clinic?.lastPatientFetchTime);

    // update patientFetchMinutesAgo upon new fetch
    setPatientFetchMinutesAgo(moment.utc().diff(patientFetchMoment, 'minutes'));

    // update patientFetchMinutesAgo every minute thereafter
    const fetchTimeInterval = setInterval(() => {
      setPatientFetchMinutesAgo(moment.utc().diff(patientFetchMoment, 'minutes'));
    }, 1000 * 60);

    return () => clearInterval(fetchTimeInterval);
  }, [clinic?.lastPatientFetchTime]);

  useEffect(() => {
    setShowSummaryData(clinic?.tier >= 'tier0200');
    setPatientFetchOptions({
      search: '',
      offset: 0,
      sort: '+fullName',
      limit: clinic?.tier >= 'tier0200' ? 10 : 8,
    });
  }, [clinic?.id]);

  useEffect(() => {
    setClinicBgUnits((clinic?.preferredBgUnits || MGDL_UNITS));
  }, [clinic?.preferredBgUnits]);

  // Fetchers
  useEffect(() => {
    if (
      loggedInUserId
      && clinic?.id
      && !fetchingPatientsForClinic.inProgress
      && !isEmpty(patientFetchOptions)
      && !isFirstRender
    ) {
      const fetchOptions = { ...patientFetchOptions };
      if (isEmpty(fetchOptions.search)) delete fetchOptions.search;
      dispatch(actions.async.fetchPatientsForClinic(api, clinic.id, fetchOptions));
    }
  }, [loggedInUserId, patientFetchOptions]);

  useEffect(() => {
    const filterOptions = { offset: 0 }

    if (isFirstRender) return;

    if (activeFilters.lastUploadDate) {
      filterOptions['summary.lastUploadDateTo'] = getLocalizedCeiling(new Date().toISOString(), timePrefs).toISOString();
      filterOptions['summary.lastUploadDateFrom'] = moment(filterOptions['summary.lastUploadDateTo']).subtract(activeFilters.lastUploadDate, 'days').toISOString();
    }

    forEach(activeFilters.timeInRange, filter => {
      let { comparator, value } = glycemicTargetThresholds[filter];
      value = value / 100;

      if (!activeFilters.meetsGlycemicTargets) {
        // Handle 'does NOT meet' criteria case
        comparator = comparator === '<' ? '>=' : '<=';
      }

      filterOptions[`summary.${filter}`] = comparator + value;
    });

    const newPatientFetchOptions = {
      ...omit(patientFetchOptions, [
        'summary.lastUploadDateFrom',
        'summary.lastUploadDateTo',
        'summary.percentTimeInVeryLow',
        'summary.percentTimeInLow',
        'summary.percentTimeInTarget',
        'summary.percentTimeInHigh',
        'summary.percentTimeInVeryHigh',
      ]),
      ...filterOptions,
    };

    setPatientFetchOptions(newPatientFetchOptions);
  }, [activeFilters]);

  function formatDecimal(val, precision) {
    if (precision === null || precision === undefined) {
      return format('d')(val);
    }
    return format(`.${precision}f`)(val);
  }

  const renderInfoPopover = () => (
    <Box px={4} py={3} maxWidth="600px">
      <Trans id="summary-stat-info" i18nKey="html.summary-stat-info">
        <Paragraph1><strong>% CGM Use</strong>, <strong>GMI</strong>, and <strong>% Time in Range</strong> are calculated using the last 2 weeks’ worth of CGM data, where available.</Paragraph1>
        <Paragraph1>A future release will include summary calculations for BGM data.</Paragraph1>
        <Paragraph1><strong>Warning:</strong> % CGM Use, GMI, and % Time in Range may not match the patient profile if older data is added after the summary statistics have already been calculated.</Paragraph1>
      </Trans>
    </Box>
  );

  const renderHeader = () => {
    const activeFiltersCount = without([activeFilters.lastUploadDate, activeFilters.timeInRange.length], null, 0).length;
    const VisibilityIcon = showNames ? VisibilityOffOutlinedIcon : VisibilityOutlinedIcon;
    const hoursAgo = Math.floor(patientFetchMinutesAgo / 60);
    let timeAgoUnits = hoursAgo < 2 ? t('hour') : t('hours');
    let timeAgo = hoursAgo === 0 ? t('less than an') : t('over {{hoursAgo}}', { hoursAgo });
    if (hoursAgo >= 24) timeAgo = t('over 24');
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
                        id="filter-count"
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

                  <Box
                    onClick={() => {
                      if (!lastUploadDatePopupFilterState.isOpen) trackMetric(prefixPopHealthMetric('Last upload filter open'), { clinicId: selectedClinicId });
                    }}
                  >
                    <Button
                      variant="filter"
                      id="last-upload-filter-trigger"
                      selected={!!activeFilters.lastUploadDate}
                      {...bindTrigger(lastUploadDatePopupFilterState)}
                      icon={KeyboardArrowDownRoundedIcon}
                      iconLabel="Filter by last upload"
                      ml={2}
                      fontSize={0}
                      lineHeight={1.3}
                    >
                      {activeFilters.lastUploadDate ? find(lastUploadDateFilterOptions, { value: activeFilters.lastUploadDate })?.label : t('Last Upload')}
                    </Button>
                  </Box>

                  <Popover
                    minWidth="11em"
                    closeIcon
                    {...bindPopover(lastUploadDatePopupFilterState)}
                    onClickCloseIcon={() => {
                      trackMetric(prefixPopHealthMetric('Last upload filter close'), { clinicId: selectedClinicId });
                    }}
                  >
                    <DialogContent px={2} py={3} dividers>
                      <RadioGroup
                        id="last-upload-filters"
                        name="last-upload-filters"
                        options={lastUploadDateFilterOptions}
                        variant="vertical"
                        fontSize={0}
                        value={pendingFilters.lastUploadDate || activeFilters.lastUploadDate}
                        onChange={event => {
                          setPendingFilters({ ...pendingFilters, lastUploadDate: parseInt(event.target.value) || null });
                        }}
                      />
                    </DialogContent>

                    <DialogActions justifyContent="space-between" p={1}>
                      <Button
                        id="clear-last-upload-filter"
                        fontSize={1}
                        variant="textSecondary"
                        onClick={() => {
                          trackMetric(prefixPopHealthMetric('Last upload clear filter'), { clinicId: selectedClinicId });
                          setPendingFilters({ ...activeFilters, lastUploadDate: defaultFilterState.lastUploadDate });
                          setActiveFilters({ ...activeFilters, lastUploadDate: defaultFilterState.lastUploadDate });
                          lastUploadDatePopupFilterState.close();
                        }}
                      >
                        {t('Clear')}
                      </Button>

                      <Button id="apply-last-upload-filter" disabled={!pendingFilters.lastUploadDate} fontSize={1} variant="textPrimary" onClick={() => {
                        const dateRange = pendingFilters.lastUploadDate === 1
                          ? 'today'
                          : `${pendingFilters.lastUploadDate} days`;

                        trackMetric(prefixPopHealthMetric('Last upload apply filter'), {
                          clinicId: selectedClinicId,
                          dateRange,
                        });

                        setActiveFilters(pendingFilters);
                        lastUploadDatePopupFilterState.close();
                      }}>
                        {t('Apply')}
                      </Button>
                    </DialogActions>
                  </Popover>

                  <Button
                    id="time-in-range-filter-trigger"
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
                        id="time-in-range-filter-count"
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
                      id="reset-all-active-filters"
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

                  <Text id="last-refresh-time-ago" fontSize={0}>{timeAgoMessage}</Text>
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

             <PopoverLabel
               id="summary-stat-info-trigger"
               iconLabel={t('Summary stat info')}
               icon={InfoOutlinedIcon}
               iconFontSize="18px"
               popoverContent={renderInfoPopover()}
               ml={2}
               popoverProps={{
                 anchorOrigin: {
                   vertical: 'bottom',
                   horizontal: 'center',
                 },
                 transformOrigin: {
                   vertical: 'top',
                   horizontal: 'center',
                 },
                 width: 'auto',
               }}
               triggerOnHover
             />
            </Flex>
          </Flex>
        </Flex>
      </>
    );
  };

  function handleRefreshPatients() {
    trackMetric(prefixPopHealthMetric('Refresh data'), { clinicId: selectedClinicId });
    let fetchOptions = { ...patientFetchOptions };
    if (isEmpty(fetchOptions.search)) delete fetchOptions.search;
    dispatch(actions.async.fetchPatientsForClinic(api, clinic.id, fetchOptions));
  }

  function handleToggleShowNames() {
    const metric = showSummaryData
      ? prefixPopHealthMetric(`${showNames ? 'Hide' : 'Show'} all icon`)
      : `Clicked ${showNames ? 'Hide' : 'Show'} All`;

    trackMetric(metric, { clinicId: selectedClinicId });
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
    const formattedLastUploadReminderTime = selectedPatient?.lastUploadReminderTime && sundial.formatInTimezone(
      selectedPatient?.lastUploadReminderTime,
      timePrefs?.timezoneName || new Intl.DateTimeFormat().resolvedOptions().timeZone,
      'MM/DD/YYYY [at] h:mm a'
    );

    return (
      <Dialog
        id="sendUploadReminderDialog"
        aria-labelledby="dialog-title"
        open={showSendUploadReminderDialog}
        onClose={handleCloseOverlays}
      >
        <DialogTitle onClose={handleCloseOverlays}>
          <MediumTitle id="dialog-title">{t('Send Upload Reminder')}</MediumTitle>
        </DialogTitle>
        <DialogContent>
          <Body1>
            {formattedLastUploadReminderTime ? (
              <Trans>
                <Text mb={2}>
                  An upload reminder was last sent to <Text as='span' fontWeight='bold'>{{name: selectedPatient?.fullName}}</Text> on <Text as='span' fontWeight='bold'>{{date: formattedLastUploadReminderTime}}</Text>.
                </Text>

                <Text>
                  Are you sure you want to send an upload reminder email?
                </Text>
              </Trans>
            ) : (
              <Trans>
                <Text>
                  Are you sure you want to send an upload reminder email to <Text as='span' fontWeight='bold'>{{name: selectedPatient?.fullName}}</Text>?
                </Text>
              </Trans>
            )}
          </Body1>
        </DialogContent>
        <DialogActions>
          <Button variant="secondary" onClick={() => {
            trackMetric(prefixPopHealthMetric('Send upload reminder declined'), { clinicId: selectedClinicId });
            handleCloseOverlays();
          }}>
            {t('Cancel')}
          </Button>
          <Button
            id="resend-upload-reminder"
            variant="primary"
            processing={sendingPatientUploadReminder.inProgress}
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
          onClose={() => {
            trackMetric(prefixPopHealthMetric('Time in range filter close'), { clinicId: selectedClinicId });
            handleCloseOverlays();
          }}
        />

        <DialogContent color="text.primary" pl={5} pr={6} pb={4}>
          <Flex alignItems="center" mb={4} fontSize={1} fontWeight="medium">
            <Text mr={2} sx={{ whiteSpace: 'nowrap' }}>{t('View all patients that')}</Text>

            <Button
              id="meets-glycemic-targets-filter"
              selected={!!pendingFilters.meetsGlycemicTargets}
              variant={pendingFilters.meetsGlycemicTargets ? 'primary' : 'secondary'}
              color={pendingFilters.meetsGlycemicTargets ? 'white' : 'grays.4'}
              sx={{
                borderColor: pendingFilters.meetsGlycemicTargets ? 'purpleMedium' : 'grays.1',
                whiteSpace: 'nowrap',
                borderRight: 0,
                borderTopRightRadius: 0,
                borderBottomRightRadius: 0,
              }}
              onClick={() => setPendingFilters({ ...pendingFilters, meetsGlycemicTargets: true })}
            >
              {t('meet')}
            </Button>

            <Button
              id="not-meets-glycemic-targets-filter"
              selected={!pendingFilters.meetsGlycemicTargets}
              variant={!pendingFilters.meetsGlycemicTargets ? 'primary' : 'secondary'}
              color={!pendingFilters.meetsGlycemicTargets ? 'white' : 'grays.4'}
              sx={{
                borderColor: !pendingFilters.meetsGlycemicTargets ? 'purpleMedium' : 'grays.1',
                whiteSpace: 'nowrap',
                borderLeft: 0,
                borderTopLeftRadius: 0,
                borderBottomLeftRadius: 0,
              }}
              onClick={() => setPendingFilters({ ...pendingFilters, meetsGlycemicTargets: false })}
            >
              {t('do NOT meet')}
            </Button>

            <Text ml={2} sx={{ whiteSpace: 'nowrap' }}>{t('the checked glycemic targets:')}</Text>
          </Flex>

          {map(timeInRangeFilterOptions, ({ value, label, rangeName, tag }) => (
            <Flex id={`time-in-range-filter-${rangeName}`} key={rangeName} mb={3} alignItems="center" sx={{ gap: 2 }}>
              <Checkbox
                id={`range-${value}-filter`}
                name={`range-${value}-filter`}
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
                  <Pill label={`BG Range - ${tag}`} fontSize="10px" lineHeight="1" py="2px" sx={{ border: '1px solid', borderColor: 'grays.1', textTransform: 'none' }} colorPalette={['white', 'grays.4']} text={`${bgLabels()[rangeName]} ${clinicBgUnits}`} />
                </Flex>

                <Pill label={tag} fontSize="9px" py="2px" sx={{ borderRadius: radii.input, textTransform: 'none' }} colorPalette={[`bg.${rangeName}`, 'white']} text={tag} />
              </Box>
            </Flex>
          ))}

          <Button
            variant="textSecondary"
            px={0}
            fontSize={0}
            onClick={() => {
              trackMetric(prefixPopHealthMetric('Time in range unselect all'), { clinicId: selectedClinicId });
              setPendingFilters({ ...pendingFilters, timeInRange: defaultFilterState.timeInRange });
            }}
          >
            {t('Unselect all')}
          </Button>

          <Text fontSize={0} color="grays.4">
            {t('Filter is set to view all patients that {{criteria}} meeting all selected clinical target ranges.', { criteria: pendingFilters.meetsGlycemicTargets ? t('are') : t('are NOT') })}
          </Text>
        </DialogContent>

        <DialogActions justifyContent="space-between">
          <Button
            id="timeInRangeFilterClear"
            variant="secondary"
            onClick={() => {
              trackMetric(prefixPopHealthMetric('Time in range clear filter'), { clinicId: selectedClinicId });
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
    trackMetric(prefixPopHealthMetric('Send upload reminder'), { clinicId: selectedClinicId });
    setSelectedPatient(patient);
    setShowSendUploadReminderDialog(true);
  }

  function handleSendUploadReminderConfirm() {
    trackMetric(prefixPopHealthMetric('Send upload reminder confirmed'), { clinicId: selectedClinicId });
    dispatch(actions.async.sendPatientUploadReminder(api, selectedClinicId, selectedPatient?.id));
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
      offset: 0,
      sort: `${newOrder}${newOrderBy}`,
    });

    if (showSummaryData) {
      const order = newOrder === '+' ? 'ascending' : 'descending';

      const sortColumnLabels = {
        fullName: 'Patient details',
        'summary.lastUploadDate': 'Last upload',
        'summary.percentTimeCGMUse': 'CGM use',
        'summary.glucoseManagementIndicator': 'GMI',
      };

      trackMetric(prefixPopHealthMetric(`${sortColumnLabels[newOrderBy]} sort ${order}`), { clinicId: selectedClinicId });
    }
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
    trackMetric(prefixPopHealthMetric('Clear all filters'), { clinicId: selectedClinicId });
    setActiveFilters(defaultFilterState);
    setPendingFilters(defaultFilterState);
  }

  function handleOpenTimeInRangeFilter() {
    trackMetric(prefixPopHealthMetric('Time in range filter open'), { clinicId: selectedClinicId });
    setShowTimeInRangeDialog(true);
  }

  function handleFilterTimeInRange() {
    trackMetric(prefixPopHealthMetric('Time in range apply filter'), {
      clinicId: selectedClinicId,
      meetsCriteria: pendingFilters.meetsGlycemicTargets,
      severeHypo: includes(pendingFilters.timeInRange, 'percentTimeInVeryLow'),
      hypo: includes(pendingFilters.timeInRange, 'percentTimeInLow'),
      inRange: includes(pendingFilters.timeInRange, 'percentTimeInTarget'),
      hyper: includes(pendingFilters.timeInRange, 'percentTimeInHigh'),
      severeHyper: includes(pendingFilters.timeInRange, 'percentTimeInVeryHigh'),
    });

    setActiveFilters({
      ...activeFilters,
      meetsGlycemicTargets: pendingFilters.meetsGlycemicTargets,
      timeInRange: pendingFilters.timeInRange,
    });

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

  const renderLastUploadDate = ({ summary }) => {
    let formattedLastUploadDate = statEmptyText;
    let color = 'inherit';
    let fontWeight = 'regular';

    if (summary?.lastUploadDate) {
      const lastUploadDateMoment = moment.utc(summary.lastUploadDate);
      const endOfToday = moment.utc(getLocalizedCeiling(new Date().toISOString(), timePrefs));
      const daysAgo = endOfToday.diff(lastUploadDateMoment, 'days', true);
      formattedLastUploadDate = lastUploadDateMoment.format(dateFormat);

      if (daysAgo < 2) {
        formattedLastUploadDate = (daysAgo > 1) ? t('Yesterday') : t('Today');
        fontWeight = 'medium';
        color = 'greens.9';
      } else if (daysAgo <=30) {
        formattedLastUploadDate = t('{{days}} days ago', { days: Math.ceil(daysAgo) });
        fontWeight = 'medium';
        color = '#E29147';
      }
    }

    return (
      <Box classname="patient-last-upload">
        <Text color={color} fontWeight={fontWeight}>{formattedLastUploadDate}</Text>
      </Box>
    );
  };

  const renderCGMUsage = ({ summary }) => (
    <Box classname="patient-cgm-usage">
      <Text as="span" fontWeight="medium">{summary?.percentTimeCGMUse ? formatDecimal(summary.percentTimeCGMUse * 100) : statEmptyText}</Text>
      {summary?.percentTimeCGMUse && <Text as="span" fontSize="10px"> %</Text>}
    </Box>
  );

  const renderGMI = ({ summary }) => (
    <Box classname="patient-gmi">
      <Text as="span" fontWeight="medium">{summary?.percentTimeCGMUse >= 0.7 ? formatDecimal(summary.glucoseManagementIndicator, 1) : statEmptyText}</Text>
      {summary?.percentTimeCGMUse >= 0.7 && <Text as="span" fontSize="10px"> %</Text>}
    </Box>
  );

  const renderBgRangeSummary = ({ summary }) => {
    const targetRange = map([summary?.lowGlucoseThreshold, summary?.highGlucoseThreshold], value => (
      clinicBgUnits === MGDL_UNITS ? value * MGDL_PER_MMOLL : value
    ));

    const hoursInRange = moment(summary?.lastData).diff(moment(summary?.firstData), 'hours');
    const cgmHours = hoursInRange * summary?.percentTimeCGMUse;

    const data = {
      veryLow: summary?.percentTimeInVeryLow,
      low: summary?.percentTimeInLow,
      target: summary?.percentTimeInTarget,
      high: summary?.percentTimeInHigh,
      veryHigh: summary?.percentTimeInVeryHigh,
    };

    return (
      <Flex justifyContent="center">
        {cgmHours >= 24
          ? <BgRangeSummary striped={summary?.percentTimeCGMUse < 0.7} data={data} targetRange={targetRange} bgUnits={clinicBgUnits} />
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

    if (showSummaryData && patient.email && !patient.permissions?.custodian) items.push({
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
          render: renderPatientSecondaryInfo,
        },
        {
          title: t('Last Upload (CGM)'),
          field: 'summary.lastUploadDate',
          align: 'left',
          sortable: true,
          sortBy: 'summary.lastUploadDate',
          render: renderLastUploadDate,
        },
        {
          title: t('% CGM Use'),
          field: 'summary.percentTimeCGMUse',
          sortable: true,
          sortBy: 'summary.percentTimeCGMUse',
          align: 'center',
          render: renderCGMUsage,
        },
        {
          title: t('% GMI'),
          field: 'summary.glucoseManagementIndicator',
          align: 'center',
          sortable: true,
          sortBy: 'summary.glucoseManagementIndicator',
          render: renderGMI,
        },
        {
          title: t('% Time in Range'),
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
    const page = Math.ceil(patientFetchOptions.offset / patientFetchOptions.limit) + 1;

    return (
      <Box sx={{ position: 'relative' }}>
        <Loader show={loading} overlay={true} />
        <Table
          id={'peopleTable'}
          variant={showSummaryData ? 'condensed' : 'default'}
          label={'peopletablelabel'}
          columns={columns}
          data={values(clinic?.patients)}
          style={{fontSize: showSummaryData ? '12px' : '14px'}}
          onSort={handleSortChange}
          order={patientFetchOptions.sort.substring(0, 1) === '+' ? 'asc' : 'desc'}
          orderBy={patientFetchOptions.sort.substring(1)}
        />

        {pageCount > 1 && (
          <Pagination
            px="5%"
            sx={{ position: 'absolute', bottom: '-50px' }}
            width="100%"
            id="clinic-patients-pagination"
            count={pageCount}
            disabled={pageCount < 2}
            onChange={handlePageChange}
            page={page}
            showFirstButton={false}
            showLastButton={false}
          />
        )}
      </Box>
    );
  }

  const renderPeopleArea = () => {
    if (!showNames) {
      return renderPeopleInstructions();
    } else {
      return renderPeopleTable();
    }
  }

  return (
    <div>
      {renderHeader()}
      {clinic && renderPeopleArea()}
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
