import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { push } from 'connected-react-router';
import { withTranslation, Trans } from 'react-i18next';
import moment from 'moment';
import compact from 'lodash/compact';
import debounce from 'lodash/debounce';
import difference from 'lodash/difference';
import forEach from 'lodash/forEach';
import find from 'lodash/find';
import get from 'lodash/get';
import includes from 'lodash/includes';
import indexOf from 'lodash/indexOf';
import isBoolean from 'lodash/isBoolean';
import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';
import keys from 'lodash/keys';
import keyBy from 'lodash/keyBy';
import map from 'lodash/map';
import omit from 'lodash/omit';
import orderBy from 'lodash/orderBy';
import pick from 'lodash/pick';
import reject from 'lodash/reject';
import values from 'lodash/values';
import without from 'lodash/without';
import { Box, Flex, Link, Text } from 'theme-ui';
import AddIcon from '@material-ui/icons/Add';
import CheckRoundedIcon from '@material-ui/icons/CheckRounded';
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
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import { components as vizComponents, utils as vizUtils } from '@tidepool/viz';
import sundial from 'sundial';
import ScrollToTop from 'react-scroll-to-top';
import styled from '@emotion/styled';
import { scroller } from 'react-scroll';
import { Formik, Form } from 'formik';
import { useFlags, useLDClient } from 'launchdarkly-react-client-sdk';

import {
  bindPopover,
  bindTrigger,
  usePopupState,
} from 'material-ui-popup-state/hooks';

import {
  MediumTitle,
  Body1,
  Paragraph1,
  Body0,
} from '../../components/elements/FontStyles';

import Button from '../../components/elements/Button';
import Icon from '../../components/elements/Icon';
import Table from '../../components/elements/Table';
import { TagList } from '../../components/elements/Tag';
import Pagination from '../../components/elements/Pagination';
import TextInput from '../../components/elements/TextInput';
import BgSummaryCell from '../../components/clinic/BgSummaryCell';
import PatientForm from '../../components/clinic/PatientForm';
import PatientLastReviewed from '../../components/clinic/PatientLastReviewed';
import TideDashboardConfigForm, { validateTideConfig } from '../../components/clinic/TideDashboardConfigForm';
import RpmReportConfigForm, { exportRpmReport } from '../../components/clinic/RpmReportConfigForm';
import Pill from '../../components/elements/Pill';
import PopoverMenu from '../../components/elements/PopoverMenu';
import PopoverLabel from '../../components/elements/PopoverLabel';
import Popover from '../../components/elements/Popover';
import RadioGroup from '../../components/elements/RadioGroup';
import Checkbox from '../../components/elements/Checkbox';
import FilterIcon from '../../core/icons/FilterIcon.svg';
import SendEmailIcon from '../../core/icons/SendEmailIcon.svg';
import TabularReportIcon from '../../core/icons/TabularReportIcon.svg';
import utils from '../../core/utils';
import LimitReached from './images/LimitReached.svg';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '../../components/elements/Dialog';

import { useToasts } from '../../providers/ToastProvider';
import * as actions from '../../redux/actions';
import { useIsFirstRender, useLocalStorage, usePrevious } from '../../core/hooks';
import { fieldsAreValid, getCommonFormikFieldProps } from '../../core/forms';

import {
  patientSchema as validationSchema,
  clinicPatientTagSchema,
  lastDataFilterOptions,
  tideDashboardConfigSchema,
  rpmReportConfigSchema,
  maxClinicPatientTags,
} from '../../core/clinicUtils';

import { MGDL_UNITS, MMOLL_UNITS, URL_TIDEPOOL_PLUS_PLANS } from '../../core/constants';
import { borders, radii, colors, space, fontWeights } from '../../themes/baseTheme';
import PopoverElement from '../../components/elements/PopoverElement';

const { Loader } = vizComponents;
const { reshapeBgClassesToBgBounds, generateBgRangeLabels, formatBgValue } = vizUtils.bg;
const { getLocalizedCeiling, getTimezoneFromTimePrefs, formatTimeAgo } = vizUtils.datetime;

const StyledScrollToTop = styled(ScrollToTop)`
  background-color: ${colors.purpleMedium};
  right: 20px;
  bottom: 70px;
  border-radius: 20px;
  padding-top: 4px;
`;

const defaultFilterState = {
  timeCGMUsePercent: null,
  lastData: null,
  lastDataType: null,
  timeInRange: [],
  meetsGlycemicTargets: true,
  patientTags: [],
};

const glycemicTargetThresholds = {
  timeInVeryLowPercent: { value: 1, comparator: '>' },
  timeInLowPercent: { value: 4, comparator: '>' },
  timeInTargetPercent: { value: 70, comparator: '<' },
  timeInHighPercent: { value: 25, comparator: '>' },
  timeInVeryHighPercent: { value: 5, comparator: '>' },
  timeInExtremeHighPercent: { value: 1, comparator: '>' },
};

const editPatient = (patient, setSelectedPatient, selectedClinicId, trackMetric, setShowEditPatientDialog, source) => {
  trackMetric('Clinic - Edit patient', { clinicId: selectedClinicId, source });
  setSelectedPatient(patient);
  setShowEditPatientDialog(true);
};

const MoreMenu = ({
  patient,
  isClinicAdmin,
  selectedClinicId,
  showSummaryData,
  t,
  trackMetric,
  setSelectedPatient,
  setShowEditPatientDialog,
  prefixPopHealthMetric,
  setShowSendUploadReminderDialog,
  setShowDeleteDialog,
}) => {
  const handleEditPatient = useCallback(() => {
    editPatient(patient, setSelectedPatient, selectedClinicId, trackMetric, setShowEditPatientDialog, 'action menu');
  }, [patient, setSelectedPatient, selectedClinicId, trackMetric, setShowEditPatientDialog]);

  const handleSendUploadReminder = useCallback(
    (patient) => {
      trackMetric(prefixPopHealthMetric('Send upload reminder'), {
        clinicId: selectedClinicId,
      });
      setSelectedPatient(patient);
      setShowSendUploadReminderDialog(true);
    },
    [
      prefixPopHealthMetric,
      selectedClinicId,
      setSelectedPatient,
      setShowSendUploadReminderDialog,
      trackMetric,
    ]
  );

  const handleRemove = useCallback(
    (patient) => {
      trackMetric('Clinic - Remove patient', { clinicId: selectedClinicId });
      setSelectedPatient(patient);
      setShowDeleteDialog(true);
    },
    [selectedClinicId, setSelectedPatient, setShowDeleteDialog, trackMetric]
  );

  const items = useMemo(() => {
    let arr = [];
    arr.push({
      icon: EditIcon,
      iconLabel: t('Edit Patient Information'),
      iconPosition: 'left',
      id: `edit-${patient.id}`,
      variant: 'actionListItem',
      onClick: (_popupState) => {
        _popupState.close();
        handleEditPatient(patient);
      },
      text: t('Edit Patient Information'),
    });

    if (showSummaryData && patient.email && !patient.permissions?.custodian) {
      arr.push({
        iconSrc: SendEmailIcon,
        iconLabel: t('Send Upload Reminder'),
        iconPosition: 'left',
        id: `send-upload-reminder-${patient.id}`,
        variant: 'actionListItem',
        onClick: (_popupState) => {
          _popupState.close();
          handleSendUploadReminder(patient);
        },
        text: t('Send Upload Reminder'),
      });
    }

    if (isClinicAdmin) {
      arr.push({
        icon: DeleteIcon,
        iconLabel: t('Remove Patient'),
        iconPosition: 'left',
        id: `delete-${patient.id}`,
        variant: 'actionListItemDanger',
        onClick: (_popupState) => {
          _popupState.close();
          handleRemove(patient);
        },
        text: t('Remove Patient'),
      });
    }
    return arr;
  }, [
    handleEditPatient,
    handleRemove,
    handleSendUploadReminder,
    isClinicAdmin,
    patient,
    showSummaryData,
    t,
  ]);

  return <PopoverMenu id={`action-menu-${patient.id}`} items={items} />;
};

const PatientTags = ({
  api,
  patient,
  patientTags,
  patientTagsFilterOptions,
  prefixPopHealthMetric,
  selectedClinicId,
  selectedPatient,
  setSelectedPatient,
  setShowClinicPatientTagsDialog,
  setShowEditPatientDialog,
  t,
  trackMetric,
}) => {
  const dispatch = useDispatch();
  const defaultPatientTags = reject(patient?.tags || [], tagId => !patientTags[tagId]);
  const [pendingPatientTags, setPendingPatientTags] = useState(defaultPatientTags)

  useEffect(() => {
    setPendingPatientTags(reject(patient?.tags || [], tagId => !patientTags[tagId]));
  }, [patient?.tags, patientTags]);

  const addPatientTagsPopupState = usePopupState({
    variant: 'popover',
    popupId: `add-patient-tags-${patient.id}`,
  });

  const anchorOrigin = useMemo(() => ({
    vertical: 'bottom',
    horizontal: 'center',
  }), []);

  const transformOrigin = useMemo(() => ({
    vertical: 'top',
    horizontal: 'center',
  }), []);

  const filteredPatientTags = reject(patient?.tags || [], tagId => !patientTags[tagId]);

  const handleEditPatient = useCallback(() => {
    editPatient(patient, setSelectedPatient, selectedClinicId, trackMetric, setShowEditPatientDialog, 'tag list');
  }, [patient, setSelectedPatient, selectedClinicId, trackMetric, setShowEditPatientDialog]);

  return !!filteredPatientTags.length ? (
    <TagList
      maxTagsVisible={4}
      maxCharactersVisible={12}
      popupId={`tags-overflow-${patient?.id}`}
      onClickEdit={handleEditPatient}
      tagProps={{ variant: 'compact' }}
      tags={map(filteredPatientTags, tagId => patientTags?.[tagId])}
    />
  ) : (
    <React.Fragment>
      <Box {...bindTrigger(addPatientTagsPopupState)}>
        <Button
          id="add-tags-to-patient-trigger"
          variant="textPrimary"
          px={0}
          sx={{ color: 'grays.4', fontWeight: 'medium', fontSize: '10px' }}
          icon={AddIcon}
          iconLabel={t('Add')}
          iconPosition="left"
          iconFontSize="16px"
          selected={addPatientTagsPopupState.isOpen && selectedPatient?.id === patient?.id}
          onClick={() => {
            trackMetric(prefixPopHealthMetric('Assign patient tag open'), { clinicId: selectedClinicId });
            setSelectedPatient(patient);
            addPatientTagsPopupState.open();
          }}
        >
          {t('Add')}
        </Button>
      </Box>

      <Popover
        minWidth="11em"
        closeIcon
        {...bindPopover(addPatientTagsPopupState)}
        onClickCloseIcon={() => {
          trackMetric(prefixPopHealthMetric('Assign patient tag close'), { clinicId: selectedClinicId });
        }}
        onClose={() => {
          addPatientTagsPopupState.close();
          setPendingPatientTags(defaultPatientTags);
          setSelectedPatient(null);
        }}
        anchorOrigin={anchorOrigin}
        transformOrigin={transformOrigin}
      >
        <DialogContent px={2} py={3} dividers>
          <Box variant="containers.extraSmall">
            <Box sx={{ alignItems: 'center' }} mb={3} fontSize={1} fontWeight="medium">
              <Text color="text.primary" sx={{ whiteSpace: 'nowrap' }}>
                {t('Assign Patient Tags')}
              </Text>
            </Box>

            {!!pendingPatientTags?.length && (
              <Box className='selected-tags' mb={1} fontSize={0} fontWeight="medium">
                <Text fontSize="10px" color="grays.4">{t('Selected Tags')}</Text>

                <TagList
                  tags={map(pendingPatientTags, tagId => patientTags?.[tagId])}
                  tagProps={{
                    onClickIcon: tagId => {
                      setPendingPatientTags(without(pendingPatientTags, tagId));
                    },
                    icon: CloseRoundedIcon,
                    iconColor: 'white',
                    iconFontSize: 1,
                    sx: {
                      color: 'white',
                      backgroundColor: 'purpleMedium',
                    },
                  }}
                />
              </Box>
            )}

            {pendingPatientTags?.length < patientTagsFilterOptions.length && (
              <Box className='available-tags' sx={{ alignItems: 'center' }} mt={2} mb={1} fontSize={0} fontWeight="medium" >
                {!!pendingPatientTags?.length && <Text fontSize="10px" color="grays.4">{t('Available Tags')}</Text>}

                <TagList
                  tags={map(reject(patientTagsFilterOptions, ({ id }) => includes(pendingPatientTags, id)), ({ id }) => patientTags?.[id])}
                  tagProps={{
                    onClick: tagId => {
                      setPendingPatientTags([...pendingPatientTags, tagId]);
                    },
                  }}
                />
              </Box>
            )}
          </Box>
        </DialogContent>

        <DialogActions sx={{ justifyContent: 'space-between' }} p={1}>
          <Button
            id="clear-patient-tags-dialog"
            sx={{ fontSize: 1 }}
            variant="textSecondary"
            onClick={() => {
              trackMetric(prefixPopHealthMetric('Assign patient tag cancel'), { clinicId: selectedClinicId });
              setPendingPatientTags(defaultPatientTags);
              setSelectedPatient(null);
              addPatientTagsPopupState.close();
            }}
          >
            {t('Cancel')}
          </Button>

          <Button id="apply-patient-tags-dialog" disabled={!pendingPatientTags.length} sx={{ fontSize: 1 }} variant="textPrimary" onClick={() => {
            trackMetric(prefixPopHealthMetric('Assign patient tag confirm'), { clinicId: selectedClinicId });

            dispatch(
              actions.async.updateClinicPatient(api, selectedClinicId, patient.id, { ...patient, tags: pendingPatientTags })
            );

            addPatientTagsPopupState.close();
          }}>
            {t('Apply')}
          </Button>
        </DialogActions>

        <DialogActions
          p={1}
          sx={{ borderTop: borders.divider, justifyContent: 'space-between' }}
        >
          <Button
            id="show-edit-clinic-patient-tags-dialog"
            icon={EditIcon}
            iconPosition="left"
            sx={{ fontSize: 1 }}
            variant="textPrimary"
            onClick={() => {
              trackMetric(prefixPopHealthMetric('Edit clinic tags open'), { clinicId: selectedClinicId, source: 'Assign tag menu' });
              setShowClinicPatientTagsDialog(true);
            }}
          >
            {t('Edit Available Patient Tags')}
          </Button>
        </DialogActions>
      </Popover>
    </React.Fragment>
  );
};

export const ClinicPatients = (props) => {
  const { t, api, trackMetric, searchDebounceMs } = props;
  const isFirstRender = useIsFirstRender();
  const dispatch = useDispatch();
  const { set: setToast } = useToasts();
  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);
  const loggedInUserId = useSelector((state) => state.blip.loggedInUserId);
  const clinic = useSelector(state => state.blip.clinics?.[selectedClinicId]);
  const mrnSettings = useMemo(() => clinic?.mrnSettings ?? {}, [clinic?.mrnSettings]);
  const timePrefs = useSelector((state) => state.blip.timePrefs);
  const rpmReportPatients = useSelector(state => state.blip.rpmReportPatients);
  const isClinicAdmin = includes(get(clinic, ['clinicians', loggedInUserId, 'roles'], []), 'CLINIC_ADMIN');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDeleteClinicPatientTagDialog, setShowDeleteClinicPatientTagDialog] = useState(false);
  const [showUpdateClinicPatientTagDialog, setShowUpdateClinicPatientTagDialog] = useState(false);
  const [showAddPatientDialog, setShowAddPatientDialog] = useState(false);
  const [showRpmReportConfigDialog, setShowRpmReportConfigDialog] = useState(false);
  const [showRpmReportLimitDialog, setShowRpmReportLimitDialog] = useState(false);
  const [showTideDashboardConfigDialog, setShowTideDashboardConfigDialog] = useState(false);
  const [showEditPatientDialog, setShowEditPatientDialog] = useState(false);
  const [showClinicPatientTagsDialog, setShowClinicPatientTagsDialog] = useState(false);
  const [showTimeInRangeDialog, setShowTimeInRangeDialog] = useState(false);
  const [showSendUploadReminderDialog, setShowSendUploadReminderDialog] = useState(false);
  const [showNames, setShowNames] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const existingMRNs = useMemo(
    () => compact(map(reject(clinic?.patients, { id: selectedPatient?.id }), 'mrn')),
    [clinic?.patients, selectedPatient?.id]
  );
  const [selectedPatientTag, setSelectedPatientTag] = useState(null);
  const [loading, setLoading] = useState(false);
  const [patientFormContext, setPatientFormContext] = useState();
  const [rpmReportFormContext, setRpmReportFormContext] = useState();
  const [tideDashboardFormContext, setTideDashboardFormContext] = useState();
  const [clinicPatientTagFormContext, setClinicPatientTagFormContext] = useState();
  const [patientFetchMinutesAgo, setPatientFetchMinutesAgo] = useState();
  const statEmptyText = '--';
  const [clinicBgUnits, setClinicBgUnits] = useState(MGDL_UNITS);
  const [patientFetchOptions, setPatientFetchOptions] = useState({});
  const [patientFetchCount, setPatientFetchCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const previousClinic = usePrevious(clinic);
  const previousFetchOptions = usePrevious(patientFetchOptions);
  const [tideDashboardConfig] = useLocalStorage('tideDashboardConfig', {});
  const localConfigKey = [loggedInUserId, selectedClinicId].join('|');
  const { showExtremeHigh, showSummaryDashboard, showSummaryDashboardLastReviewed, showTideDashboard, showRpmReport } = useFlags();
  const [showSummaryData, setShowSummaryData] = useState();
  const previousShowSummaryData = usePrevious(showSummaryData)
  const showRpmReportUI = showSummaryData && (showRpmReport || clinic?.entitlements?.rpmReport);
  const showTideDashboardUI = showSummaryData && (showTideDashboard || clinic?.entitlements?.tideDashboard);
  const ldClient = useLDClient();
  const ldContext = ldClient.getContext();

  const defaultPatientFetchOptions = useMemo(
    () => {
      const options = {
        search: '',
        offset: 0,
      };

      // We hold off setting the sort on initial render to allow us to properly detect what to sort
      // by (unless we already have the showDashboard entitlements figured out).
      // This prevents the a premature patient fetch to begin with an incorrect default sort.
      if (!isFirstRender || (isBoolean(showSummaryDashboard) && isBoolean(clinic?.entitlements?.summaryDashboard))) {
        options.sort = showSummaryData || showSummaryDashboard || clinic?.entitlements?.summaryDashboard ? '-lastData' : '+fullName';
        options.sortType = 'cgm';
      }

      return options;
    },
    [showSummaryData]
  );

  const [activeSort, setActiveSort] = useLocalStorage('activePatientSort', pick(defaultPatientFetchOptions, ['sort', 'sortType']), true);

  const defaultSortOrders = useMemo(() => ({
    fullName: 'asc',
    birthDate: 'asc',
    glucoseManagementIndicator: 'desc',
    averageGlucoseMmol: 'desc',
    lastData: 'desc',
    lastReviewed: 'asc',
    timeInVeryLowRecords: 'desc',
    timeInVeryHighRecords: 'desc',
  }), []);

  const bgLabels = useMemo(
    () =>
      generateBgRangeLabels(
        {
          bgUnits: clinicBgUnits,
          bgBounds: reshapeBgClassesToBgBounds({ bgUnits: clinicBgUnits }),
        },
        { segmented: true }
      ),
    [clinicBgUnits]
  );

  const [activeFilters, setActiveFilters] = useLocalStorage('activePatientFilters', defaultFilterState, true);
  const [pendingFilters, setPendingFilters] = useState({ ...defaultFilterState, ...activeFilters });
  const previousActiveFilters = usePrevious(activeFilters);

  const cgmUseFilterOptions = [
    { value: '<0.7', label: t('Less than 70%') },
    { value: '>=0.7', label: t('70% or more') },
  ];

  const lastDataTypeFilterOptions = [
    { value: 'cgm', label: t('CGM') },
    { value: 'bgm', label: t('BGM') },
  ];

  const customLastDataFilterOptions = reject(lastDataFilterOptions, { value: 7 });

  const summaryPeriodOptions = [
    { value: '1d', label: t('24 hours') },
    { value: '7d', label: t('7 days') },
    { value: '14d', label: t('14 days') },
    { value: '30d', label: t('30 days') },
  ];

  const patientTags = useMemo(() => keyBy(clinic?.patientTags, 'id'), [clinic?.patientTags]);

  const patientTagsFilterOptions = useMemo(
    () => map(clinic?.patientTags, ({ id, name }) => ({ id, label: name })),
    [clinic?.patientTags]
  );

  const defaultSummaryPeriod = '14d';
  const [activeSummaryPeriod, setActiveSummaryPeriod] = useLocalStorage('activePatientSummaryPeriod', defaultSummaryPeriod);
  const [pendingSummaryPeriod, setPendingSummaryPeriod] = useState(activeSummaryPeriod);
  const previousSummaryPeriod = usePrevious(activeSummaryPeriod);

  const summaryPeriodPopupFilterState = usePopupState({
    variant: 'popover',
    popupId: 'summaryPeriodFilters',
  });

  const lastDataPopupFilterState = usePopupState({
    variant: 'popover',
    popupId: 'lastDataFilters',
  });

  const patientTagsPopupFilterState = usePopupState({
    variant: 'popover',
    popupId: 'patientTagFilters',
  });

  const cgmUsePopupFilterState = usePopupState({
    variant: 'popover',
    popupId: 'cgmUseFilters',
  });

  const debounceSearch = useCallback(debounce(search => {
    // Prevent a premature update to patientFetchOptions, which would trigger an initial patient
    // fetch with potentially incorrect sorting.
    if (isFirstRender) return;

    setPatientFetchOptions({
      ...patientFetchOptions,
      offset: 0,
      sort: '+fullName',
      search,
    });
  }, searchDebounceMs), [patientFetchOptions, searchDebounceMs]);

  const {
    fetchingPatientFromClinic,
    fetchingPatientsForClinic,
    deletingPatientFromClinic,
    updatingClinicPatient,
    creatingClinicCustodialAccount,
    sendingPatientUploadReminder,
    creatingClinicPatientTag,
    updatingClinicPatientTag,
    deletingClinicPatientTag,
    fetchingTideDashboardPatients,
    fetchingRpmReportPatients,
  } = useSelector((state) => state.blip.working);

  // TODO: remove this when upgraded to React 18
  // force another render when fetching patients state changes
  const [forceUpdate, setForceUpdate] = useState();
  if(!isEqual(forceUpdate, fetchingPatientsForClinic)){
    setForceUpdate(fetchingPatientsForClinic);
  }

  const previousFetchingPatientsForClinic = usePrevious(fetchingPatientsForClinic);
  const previousDeletingPatientFromClinic = usePrevious(deletingPatientFromClinic);
  const previousSendingPatientUploadReminder = usePrevious(sendingPatientUploadReminder);
  const previousUpdatingClinicPatient = usePrevious(updatingClinicPatient);
  const previousCreatingClinicCustodialAccount = usePrevious(creatingClinicCustodialAccount);
  const previousCreatingClinicPatientTag = usePrevious(creatingClinicPatientTag);
  const previousUpdatingClinicPatientTag = usePrevious(updatingClinicPatientTag);
  const previousDeletingClinicPatientTag = usePrevious(deletingClinicPatientTag);
  const previousFetchingRpmReportPatients = usePrevious(fetchingRpmReportPatients);

  const prefixPopHealthMetric = useCallback(metric => `Clinic - Population Health - ${metric}`, []);

  const handleCloseClinicPatientTagUpdateDialog = useCallback(metric => {
    if (metric) trackMetric(prefixPopHealthMetric(metric, { clinicId: selectedClinicId }));
    setShowDeleteClinicPatientTagDialog(false);
    setShowUpdateClinicPatientTagDialog(false);

    setTimeout(() => {
      clinicPatientTagFormContext?.resetForm()
      setSelectedPatientTag(null);
    });
  }, [clinicPatientTagFormContext, prefixPopHealthMetric, selectedClinicId, trackMetric]);

  const handleAsyncResult = useCallback((workingState, successMessage, onComplete = handleCloseOverlays) => {
    const { inProgress, completed, notification, prevInProgress } = workingState;

    if (!isFirstRender && !inProgress && prevInProgress !== false) {
      if (completed) {
        onComplete();
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
  }, [isFirstRender, setToast]);

  useEffect(() => {
    handleAsyncResult({ ...updatingClinicPatient, prevInProgress: previousUpdatingClinicPatient?.inProgress }, t('You have successfully updated a patient.'), () => {
      handleCloseOverlays();

      if (patientFormContext?.status === 'sendingDexcomConnectRequest') {
        dispatch(actions.async.sendPatientDexcomConnectRequest(api, selectedClinicId, updatingClinicPatient.patientId));
      }
    });
  }, [
    api,
    dispatch,
    selectedClinicId,
    handleAsyncResult,
    t,
    updatingClinicPatient,
    patientFormContext?.status,
    previousUpdatingClinicPatient?.inProgress,
  ]);

  useEffect(() => {
    handleAsyncResult({ ...creatingClinicCustodialAccount, prevInProgress: previousCreatingClinicCustodialAccount?.inProgress }, t('You have successfully added a new patient.'), () => {
      handleCloseOverlays();

      if (patientFormContext?.status === 'sendingDexcomConnectRequest') {
        dispatch(actions.async.sendPatientDexcomConnectRequest(api, selectedClinicId, creatingClinicCustodialAccount.patientId));
      }
    });
  }, [
    api,
    dispatch,
    selectedClinicId,
    handleAsyncResult,
    t,
    creatingClinicCustodialAccount,
    patientFormContext?.status,
    previousCreatingClinicCustodialAccount?.inProgress,
  ]);

  useEffect(() => {
    handleAsyncResult({ ...fetchingRpmReportPatients, prevInProgress: previousFetchingRpmReportPatients?.inProgress }, t('Your RPM Report will download shortly'), () => {
      exportRpmReport(rpmReportPatients);
      handleCloseOverlays();
    });
  }, [fetchingRpmReportPatients, rpmReportPatients, handleAsyncResult, handleCloseOverlays, previousFetchingRpmReportPatients?.inProgress, t]);

  useEffect(() => {
    handleAsyncResult({ ...creatingClinicPatientTag, prevInProgress: previousCreatingClinicPatientTag?.inProgress }, t('Tag created.'), () => clinicPatientTagFormContext?.resetForm());
  }, [clinicPatientTagFormContext, creatingClinicPatientTag, handleAsyncResult, previousCreatingClinicPatientTag?.inProgress, t]);

  useEffect(() => {
    handleAsyncResult({ ...updatingClinicPatientTag, prevInProgress: previousUpdatingClinicPatientTag?.inProgress }, t('Tag updated.'), handleCloseClinicPatientTagUpdateDialog);
  }, [updatingClinicPatientTag, handleAsyncResult, handleCloseClinicPatientTagUpdateDialog, previousUpdatingClinicPatientTag?.inProgress, t]);

  useEffect(() => {
    handleAsyncResult({ ...deletingClinicPatientTag, prevInProgress: previousDeletingClinicPatientTag?.inProgress }, t('Tag removed.'), handleCloseClinicPatientTagUpdateDialog);
  }, [deletingClinicPatientTag, handleAsyncResult, handleCloseClinicPatientTagUpdateDialog, previousDeletingClinicPatientTag?.inProgress, t]);

  useEffect(() => {
    // If a tag is deleted or otherwise missing, and is still present in an active filter, remove it from the filters
    const missingTagsInFilter = difference(activeFilters.patientTags, map(patientTags, 'id'));
    if (missingTagsInFilter.length) {
      setActiveFilters({ ...activeFilters, patientTags: without(activeFilters.patientTags, ...missingTagsInFilter) });
      setPendingFilters({ ...pendingFilters, patientTags: without(activeFilters.patientTags, ...missingTagsInFilter) });
    }
  }, [patientTags]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    const successMessage = t('{{name}} has been removed from the clinic.', {
      name: get(selectedPatient, 'fullName', t('This patient')),
    });

    handleAsyncResult({ ...deletingPatientFromClinic, prevInProgress: previousDeletingPatientFromClinic?.inProgress }, successMessage);
  }, [handleAsyncResult, selectedPatient, deletingPatientFromClinic, previousDeletingPatientFromClinic?.inProgress, t]);


  useEffect(() => {
    const successMessage = t('Uploader reminder email for {{name}} has been sent.', {
      name: get(selectedPatient, 'fullName', t('this patient')),
    });

    handleAsyncResult({ ...sendingPatientUploadReminder, prevInProgress: previousSendingPatientUploadReminder?.inProgress }, successMessage);
  }, [handleAsyncResult, selectedPatient, sendingPatientUploadReminder, previousSendingPatientUploadReminder?.inProgress, t]);

  useEffect(() => {
    const { inProgress, completed, notification } = fetchingPatientsForClinic;

    if (
      !(isFirstRender || inProgress) &&
      previousFetchingPatientsForClinic?.inProgress
    ) {
      if (completed === false) {
        setToast({
          message: get(notification, 'message'),
          variant: 'danger',
        });
      }

      // For subsequent patient fetches, such as When filtering or searching, we can assume that
      // the user would like to see the results
      if (!showNames && patientFetchCount > 0) {
        setShowNames(true);
      }
      setPatientFetchCount(patientFetchCount+1);
      let newPage = patientFetchOptions.offset / patientFetchOptions.limit + 1;
      if (newPage !== currentPage) {
        scroller.scrollTo('workspaceTabsTop');
        setCurrentPage(newPage);
      }
    }

    setLoading(inProgress);
  }, [
    currentPage,
    fetchingPatientsForClinic,
    isFirstRender,
    patientFetchCount,
    patientFetchOptions.limit,
    patientFetchOptions.offset,
    previousFetchingPatientsForClinic?.inProgress,
    setToast,
    showNames,
  ]);

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
    setClinicBgUnits((clinic?.preferredBgUnits || MGDL_UNITS));
  }, [clinic]);

  // Fetchers
  useEffect(() => {
    if (
      loggedInUserId &&
      clinic?.id &&
      (!fetchingPatientsForClinic.inProgress || fetchingPatientsForClinic.completed === null) &&
      !isEmpty(patientFetchOptions) &&
      !(patientFetchOptions === previousFetchOptions)
    ) {
      const fetchOptions = { ...patientFetchOptions };
      if (isEmpty(fetchOptions.search)) {
        delete fetchOptions.search;
      }
      dispatch(
        actions.async.fetchPatientsForClinic(api, clinic.id, fetchOptions)
      );
    }
  }, [
    api,
    clinic,
    dispatch,
    fetchingPatientsForClinic,
    loggedInUserId,
    patientFetchOptions,
    previousClinic?.id,
    previousFetchOptions,
  ]);

  useEffect(() => {
    setShowSummaryData(showSummaryDashboard || clinic?.entitlements?.summaryDashboard)
  }, [showSummaryDashboard, clinic?.entitlements]);

  useEffect(() => {
    // Hold off on generating the fetch options until we know if we need to include summary filters
    if (!isBoolean(showSummaryData)) return;

    if(
      // We always want to run this on first render if we have the showSummaryData entitlement available
      isFirstRender ||
      // On subsequent renders, we only update the fetch data if any of the following change
      !isEqual(clinic?.id, previousClinic?.id) ||
      !isEqual(showSummaryData, previousShowSummaryData) ||
      !isEqual(activeFilters, previousActiveFilters) ||
      !isEqual(activeSummaryPeriod, previousSummaryPeriod)
    ) {
      const filterOptions = {
        offset: 0,
        sort: showSummaryData && activeSort?.sort ? activeSort.sort : defaultPatientFetchOptions.sort,
        sortType: showSummaryData && activeSort?.sortType ? activeSort.sortType : defaultPatientFetchOptions.sortType,
        period: activeSummaryPeriod,
        limit: 50,
        search: patientFetchOptions.search,
      }

      if (isEmpty(filterOptions.search)) delete filterOptions.search;

      if (showSummaryData) {
        // If we are currently sorting by lastData date, ensure the sortType matches the filter
        // type if available, or falls back to the default sortType
        if (filterOptions.sort?.indexOf('lastData') === 1) {
          filterOptions.sortType = activeFilters.lastDataType || defaultPatientFetchOptions.sortType;
        }

        if (activeFilters.lastData && activeFilters.lastDataType) {
          filterOptions[`${activeFilters.lastDataType}.lastDataTo`] = getLocalizedCeiling(new Date().toISOString(), timePrefs).toISOString();
          filterOptions[`${activeFilters.lastDataType}.lastDataFrom`] = moment(filterOptions[`${activeFilters.lastDataType}.lastDataTo`]).subtract(activeFilters.lastData, 'days').toISOString();
        }

        if (activeFilters.patientTags?.length) {
          filterOptions['tags'] = activeFilters.patientTags;
        }

        forEach(activeFilters.timeInRange, filter => {
          let { comparator, value } = glycemicTargetThresholds[filter];
          value = value / 100;

          if (activeFilters.meetsGlycemicTargets) {
            comparator = comparator === '<' ? '<=' : '>=';
          }

          filterOptions[`cgm.${filter}`] = comparator + value;
        });

        if (activeFilters.timeCGMUsePercent) {
          filterOptions['cgm.timeCGMUsePercent'] = activeFilters.timeCGMUsePercent;
        }
      }

      const newPatientFetchOptions = {
        ...omit(patientFetchOptions, [
          'bgm.lastDataFrom',
          'bgm.lastDataTo',
          'cgm.lastDataFrom',
          'cgm.lastDataTo',
          'tags',
          'cgm.timeCGMUsePercent',
          'cgm.timeInVeryLowPercent',
          'cgm.timeInLowPercent',
          'cgm.timeInTargetPercent',
          'cgm.timeInHighPercent',
          'cgm.timeInVeryHighPercent',
          'cgm.timeInExtremeHighPercent',
        ]),
        ...filterOptions,
      };

      // set options pulled from localStorage
      if (isFirstRender) {
        setPatientFetchOptions(newPatientFetchOptions);
        return;
      }

      if (isEqual(clinic?.id, previousClinic?.id)) {
        if (!isEqual(patientFetchOptions, newPatientFetchOptions)) {
          setPatientFetchOptions(newPatientFetchOptions);
        }
      } else {
        setPatientFetchOptions(newPatientFetchOptions);
        setCurrentPage(1);
      }
    }
  }, [
    activeSort,
    activeFilters,
    clinic?.id,
    clinic?.tier,
    defaultPatientFetchOptions.sort,
    defaultPatientFetchOptions.sortType,
    isFirstRender,
    patientFetchOptions,
    previousActiveFilters,
    previousClinic?.id,
    previousSummaryPeriod,
    activeSummaryPeriod,
    showSummaryData,
    timePrefs,
  ]);

  // Provide latest patient state for the edit form upon fetch
  useEffect(() => {
    if (fetchingPatientFromClinic.completed && selectedPatient?.id) setSelectedPatient(clinic.patients[selectedPatient.id]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchingPatientFromClinic, selectedPatient?.id]);

  useEffect(() => {
    // If the ld context is ready, and the currently selected clinic doesn't have access to the
    // extreme high bg range, we should remove it from the activeFilters.timeInRange, otherwise, the
    // filter count will be incorrect.
    if (ldContext?.clinic?.tier && !showExtremeHigh && !!activeFilters?.timeInRange?.length) {
      if (indexOf(activeFilters?.timeInRange, 'timeInExtremeHighPercent') !== -1) {
        setActiveFilters({
          ...activeFilters,
          timeInRange: without(activeFilters.timeInRange, 'timeInExtremeHighPercent'),
        });
      }
    }
  }, [ldContext, showExtremeHigh, activeFilters]);

  const handleRefreshPatients = useCallback(() => {
    trackMetric(prefixPopHealthMetric('Refresh data'), { clinicId: selectedClinicId });
    let fetchOptions = { ...patientFetchOptions };
    if (isEmpty(fetchOptions.search)) delete fetchOptions.search;
    dispatch(actions.async.fetchPatientsForClinic(api, clinic?.id, fetchOptions));
  }, [api, clinic?.id, dispatch, patientFetchOptions, prefixPopHealthMetric, selectedClinicId, trackMetric]);

  const handleToggleShowNames = useCallback(() => {
    const metric = showSummaryData
      ? prefixPopHealthMetric(`${showNames ? 'Hide' : 'Show'} all icon`)
      : `Clicked ${showNames ? 'Hide' : 'Show'} All`;

    trackMetric(metric, { clinicId: selectedClinicId });
    setShowNames(!showNames);
  }, [prefixPopHealthMetric, selectedClinicId, showNames, showSummaryData, trackMetric]);

  const handleClickPatient = useCallback(patient => {
    return () => {
      trackMetric('Selected PwD');
      dispatch(push(`/patients/${patient.id}/data`));
    }
  }, [dispatch, trackMetric]);

  function handleAddPatient() {
    trackMetric('Clinic - Add patient', { clinicId: selectedClinicId });
    setShowAddPatientDialog(true);
  }

  const handleAddPatientConfirm = useCallback(() => {
    trackMetric('Clinic - Add patient confirmed', { clinicId: selectedClinicId });
    patientFormContext?.handleSubmit();
  }, [patientFormContext, selectedClinicId, trackMetric]);

  const handleEditPatientConfirm = useCallback(() => {
    trackMetric('Clinic - Edit patient confirmed', { clinicId: selectedClinicId });
    const updatedTags = [...(patientFormContext?.values?.tags || [])];
    const existingTags = [...(selectedPatient?.tags || [])];

    if (!isEqual(updatedTags.sort(), existingTags.sort())) {
      trackMetric(prefixPopHealthMetric('Edit patient tags confirm'), { clinicId: selectedClinicId });
    }
    patientFormContext?.handleSubmit();
  }, [patientFormContext, selectedClinicId, trackMetric, selectedPatient?.tags, prefixPopHealthMetric]);

  function handleConfigureTideDashboard() {
    if (validateTideConfig(tideDashboardConfig[localConfigKey], patientTags)) {
      trackMetric('Clinic - Navigate to Tide Dashboard', { clinicId: selectedClinicId, source: 'Patients list' });
      dispatch(push('/dashboard/tide'));
    } else {
      trackMetric('Clinic - Show Tide Dashboard config dialog', { clinicId: selectedClinicId, source: 'Patients list' });
      setShowTideDashboardConfigDialog(true);
    }
  }

  const handleConfigureTideDashboardConfirm = useCallback(() => {
    trackMetric('Clinic - Show Tide Dashboard config dialog confirmed', { clinicId: selectedClinicId, source: 'Patients list' });
    tideDashboardFormContext?.handleSubmit();
  }, [tideDashboardFormContext, selectedClinicId, trackMetric]);

  function handleConfigureRpmReport() {
    if (clinic?.fetchedPatientCount > 1000) {
      trackMetric('Clinic - Show RPM Report limit dialog', { clinicId: selectedClinicId, source: 'Patients list' });
      setShowRpmReportLimitDialog(true);
    } else {
      trackMetric('Clinic - Show RPM Report config dialog', { clinicId: selectedClinicId, source: 'Patients list' });
      setShowRpmReportConfigDialog(true);
    }
  }

  const handleConfigureRpmReportConfirm = useCallback(() => {
    trackMetric('Clinic - Show RPM Report config dialog confirmed', { clinicId: selectedClinicId, source: 'Patients list' });
    rpmReportFormContext?.handleSubmit();
  }, [rpmReportFormContext, selectedClinicId, trackMetric]);

  const handleCreateClinicPatientTag = useCallback(tag => {
    trackMetric('Clinic - Create patient tag', { clinicId: selectedClinicId });
    dispatch(actions.async.createClinicPatientTag(api, selectedClinicId, tag));
  }, [api, dispatch, selectedClinicId, trackMetric]);

  const handleUpdateClinicPatientTag = useCallback(tagId => {
    trackMetric(prefixPopHealthMetric('Edit clinic tags update'), { clinicId: selectedClinicId });
    setSelectedPatientTag(patientTags[tagId]);
    setShowUpdateClinicPatientTagDialog(true);
  }, [selectedClinicId, patientTags, trackMetric, prefixPopHealthMetric]);

  const handleUpdateClinicPatientTagConfirm = useCallback(tag => {
    trackMetric(prefixPopHealthMetric('Edit clinic tags confirm update tag'), { clinicId: selectedClinicId });
    dispatch(actions.async.updateClinicPatientTag(api, selectedClinicId, selectedPatientTag?.id, tag));
  }, [api, dispatch, selectedClinicId, selectedPatientTag?.id, trackMetric, prefixPopHealthMetric]);

  const handleDeleteClinicPatientTag = useCallback(tagId => {
    trackMetric(prefixPopHealthMetric('Edit clinic tags delete'), { clinicId: selectedClinicId });
    setSelectedPatientTag(patientTags[tagId]);
    setShowDeleteClinicPatientTagDialog(true);
  }, [selectedClinicId, patientTags, trackMetric, prefixPopHealthMetric])

  const handleDeleteClinicPatientTagConfirm = useCallback(() => {
    trackMetric(prefixPopHealthMetric('Edit clinic tags confirm delete tag'), { clinicId: selectedClinicId });
    dispatch(actions.async.deleteClinicPatientTag(api, selectedClinicId, selectedPatientTag?.id));
  }, [api, dispatch, selectedClinicId, selectedPatientTag?.id, trackMetric, prefixPopHealthMetric]);

  const handleSendUploadReminderConfirm = useCallback(() => {
    trackMetric(prefixPopHealthMetric('Send upload reminder confirmed'), { clinicId: selectedClinicId });
    dispatch(actions.async.sendPatientUploadReminder(api, selectedClinicId, selectedPatient?.id));
  }, [api, dispatch, prefixPopHealthMetric, selectedClinicId, selectedPatient?.id, trackMetric]);

  function handlePatientFormChange(formikContext) {
    setPatientFormContext({ ...formikContext });
  }

  function handleTideDashboardConfigFormChange(formikContext) {
    setTideDashboardFormContext({ ...formikContext });
  }

  function handleRpmReporConfigFormChange(formikContext, utcDayShift) {
    setRpmReportFormContext({ ...formikContext, utcDayShift });
  }

  function handleSearchChange(event) {
    setSearch(event.target.value);
    setLoading(true);
    debounceSearch(event.target.value);
  }

  const handleSortChange = useCallback((newOrderBy, field) => {
    const sort = patientFetchOptions.sort || defaultPatientFetchOptions.sort;
    const [fieldKey, sortType = 'cgm'] = field.split('.').reverse();
    const currentOrder = sort[0];
    const currentOrderBy = sort.substring(1);
    let newOrder = defaultSortOrders[fieldKey] === 'desc' ? '-' : '+';
    if (newOrderBy === currentOrderBy) newOrder = currentOrder === '+' ? '-' : '+';
    const newSort = `${newOrder}${newOrderBy}`;

    setPatientFetchOptions(fetchOptions => ({
      ...fetchOptions,
      offset: 0,
      sort: newSort,
      sortType,
    }));

    if (showSummaryData) {
      const order = newOrder === '+' ? 'ascending' : 'descending';

      const sortColumnLabels = {
        fullName: 'Patient details',
        'summary.lastData': 'Data recency',
        [`summary.periods.${activeSummaryPeriod}.timeCGMUsePercent`]: 'CGM use',
        [`summary.periods.${activeSummaryPeriod}.glucoseManagementIndicator`]: 'GMI',
      };

      trackMetric(prefixPopHealthMetric(`${sortColumnLabels[newOrderBy]} sort ${order}`), { clinicId: selectedClinicId });
      setActiveSort({ sort: newSort, sortType });
    }
  }, [
    defaultPatientFetchOptions.sort,
    defaultSortOrders,
    patientFetchOptions.sort,
    prefixPopHealthMetric,
    selectedClinicId,
    showSummaryData,
    activeSummaryPeriod,
    trackMetric,
    setActiveSort,
  ]);

  function handleClearSearch() {
    setSearch('');
    setLoading(true);
    debounceSearch('');
  }

  const handlePageChange = useCallback((event, page) => {
    setPatientFetchOptions({
      ...patientFetchOptions,
      offset: (page - 1) * patientFetchOptions.limit,
    });
  }, [patientFetchOptions]);

  function handleResetFilters() {
    trackMetric(prefixPopHealthMetric('Clear all filters'), { clinicId: selectedClinicId });
    setActiveFilters(defaultFilterState);
    setPendingFilters(defaultFilterState);
  }

  function handleOpenTimeInRangeFilter() {
    trackMetric(prefixPopHealthMetric('Time in range filter open'), { clinicId: selectedClinicId });
    setShowTimeInRangeDialog(true);
  }

  const handleFilterTimeInRange = useCallback(() => {
    trackMetric(prefixPopHealthMetric('Time in range apply filter'), {
      clinicId: selectedClinicId,
      meetsCriteria: pendingFilters.meetsGlycemicTargets,
      severeHypo: includes(pendingFilters.timeInRange, 'timeInVeryLowPercent'),
      hypo: includes(pendingFilters.timeInRange, 'timeInLowPercent'),
      inRange: includes(pendingFilters.timeInRange, 'timeInTargetPercent'),
      hyper: includes(pendingFilters.timeInRange, 'timeInHighPercent'),
      severeHyper: includes(pendingFilters.timeInRange, 'timeInVeryHighPercent'),
      extremeHyper: includes(pendingFilters.timeInRange, 'timeInExtremeHighPercent'),
    });

    setActiveFilters({
      ...activeFilters,
      meetsGlycemicTargets: pendingFilters.meetsGlycemicTargets,
      timeInRange: pendingFilters.timeInRange,
    });

    setShowTimeInRangeDialog(false);
  }, [
    activeFilters,
    pendingFilters.meetsGlycemicTargets,
    pendingFilters.timeInRange,
    prefixPopHealthMetric,
    selectedClinicId,
    setActiveFilters,
    trackMetric
  ]);

  const handleRemovePatient = useCallback(() => {
    trackMetric('Clinic - Remove patient confirmed', { clinicId: selectedClinicId });
    dispatch(actions.async.deletePatientFromClinic(api, selectedClinicId, selectedPatient?.id));
  }, [api, dispatch, selectedClinicId, selectedPatient?.id, trackMetric]);

  const renderHeader = () => {
    const activeFiltersCount = without([
      activeFilters.timeCGMUsePercent,
      activeFilters.lastData,
      activeFilters.timeInRange?.length,
      activeFilters.patientTags?.length,
    ], null, 0, undefined).length;

    const VisibilityIcon = showNames ? VisibilityOffOutlinedIcon : VisibilityOutlinedIcon;
    const hoursAgo = Math.floor(patientFetchMinutesAgo / 60);
    let timeAgoUnits = hoursAgo < 2 ? t('hour') : t('hours');
    let timeAgo = hoursAgo === 0 ? t('less than an') : t('over {{hoursAgo}}', { hoursAgo });
    if (hoursAgo >= 24) timeAgo = t('over 24');
    const timeAgoMessage = t('Last updated {{timeAgo}} {{timeAgoUnits}} ago', { timeAgo, timeAgoUnits });
    return (
      <>
        <Flex mb={4} sx={{ alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 3 }}>
          {/* Flex Group 1: Search Box and Add Patient button */}
          <Flex
            sx={{
              width: 'auto',
              gap: 2,
              alignItems: 'center',
              justifyContent: 'space-between',
              flexGrow: [1, null, 0],
              flexWrap: 'wrap',
            }}
          >
            <PopoverElement
              id="limitReachedPopover"
              triggerOnHover
              keepOpenOnBlur
              disabled={!(clinic?.patientLimitEnforced && !!clinic?.ui?.warnings?.limitReached)}
              popoverProps={{
                padding: `${space[3]}px`,
                anchorOrigin: {
                  vertical: 'bottom',
                  horizontal: 'left',
                },
                transformOrigin: {
                  vertical: 'top',
                  horizontal: 'left',
                },
                borderRadius: radii.input,
              }}
              popoverContent={(
                <>
                  <img alt={t('Patient Limit Reached')} src={LimitReached} />
                  <Box mt={3} sx={{ width: '213px' }}>
                    <Paragraph1 sx={{ fontWeight: 'bold' }}>{t('Your workspace has reached the maximum number of patient accounts supported by our Base Plan.')}</Paragraph1>
                    <Paragraph1>
                      {t('Please reach out to your administrator and')}&nbsp;
                      <Link
                        id="addPatientUnlockPlansLink"
                        href={URL_TIDEPOOL_PLUS_PLANS}
                        target="_blank"
                        rel="noreferrer noopener"
                        sx={{
                          fontSize: 1,
                          fontWeight: 'medium',
                        }}
                        >{t('learn more about our plans.')}</Link>
                    </Paragraph1>
                  </Box>
                </>
              )}
            >
              <Button
                id="add-patient"
                variant="primary"
                onClick={handleAddPatient}
                sx={{ fontSize: 0, lineHeight: ['inherit', null, 1] }}
                px={[2, 3]}
                disabled={clinic?.patientLimitEnforced && !!clinic?.ui?.warnings?.limitReached}
              >
                {t('Add New Patient')}
              </Button>
            </PopoverElement>

              <Box sx={{ flex: 1, flexBasis:'fit-content', position: ['static', null, 'absolute'], top: '8px', right: 4 }}>
                <Flex sx={{ justifyContent: 'space-between', alignContent: 'center', gap: 2 }}>
                  {showTideDashboardUI && (
                    <PopoverElement
                      id="tideDashAddTagsPopover"
                      triggerOnHover
                      disabled={!!clinic?.patientTags?.length}
                      popoverProps={{
                        anchorOrigin: {
                          vertical: 'bottom',
                          horizontal: 'center',
                        },
                        transformOrigin: {
                          vertical: 'top',
                          horizontal: 'center',
                        },
                        backgroundColor: 'rgba(79, 106, 146, 0.85)',
                        border: 'none',
                        borderRadius: radii.input,
                        marginTop: `-${space[2]}px`,
                        padding: `0 ${space[2]}px`,
                        width: 'auto',
                      }}
                      popoverContent={(
                        <Text sx={{ color: 'white', fontSize:'10px', fontWeight: 'medium' }}>{t('Add and apply patient tags to use')}</Text>
                      )}
                    >
                      <Button
                        id="open-tide-dashboard"
                        variant="tertiary"
                        onClick={handleConfigureTideDashboard}
                        tag={t('New')}
                        px={2}
                        sx={{ flexShrink: 0, fontSize: 0 }}
                        disabled={!clinic?.patientTags?.length}
                        tagColorPalette={!clinic?.patientTags?.length ? [colors.lightGrey, colors.text.primaryDisabled] : 'greens'}
                      >
                        {t('TIDE Dashboard View')}
                      </Button>
                    </PopoverElement>
                  )}

                  <TextInput
                    themeProps={{
                      sx: { width: ['100%', null, '250px'] },
                    }}
                    sx={{ fontSize: 0 }}
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
                </Flex>
              </Box>
          </Flex>

          {/* Flex Group 2: Filters and Info Icons */}
          <Flex
            pt={0}
            sx={{ gap: 3, alignItems: 'center', flexGrow: showSummaryData ? 1 : 0, flexShrink: 1, flexWrap: 'wrap' }}
          >
            {/* Flex Group 2a: Results Filters */}
            {showSummaryData && (
              <Flex
                sx={{ alignItems: 'center', gap: 2, justifyContent: 'flex-start', flexWrap: 'wrap' }}
                id='summary-dashboard-filters'
              >
                <Flex
                  pl={[0, 0, 2]}
                  py={1}
                  sx={{
                    color: activeFiltersCount > 0 ? 'purpleMedium' : 'grays.4',
                    alignItems: 'center',
                    gap: 1,
                    borderLeft: ['none', null, borders.divider],
                    flexShrink: 0
                  }}
                >
                  {activeFiltersCount > 0 ? (
                    <Pill
                      id="filter-count"
                      label="filter count"
                      round
                      sx={{ width: '14px', lineHeight: '15px', fontSize: '9px' }}
                      colorPalette={['purpleMedium', 'white']}
                      text={`${activeFiltersCount}`}
                    />
                  ) : (
                    <Icon
                      id="filter-icon"
                      variant="static"
                      iconSrc={FilterIcon}
                      label={t('Filter')}
                      sx={{ fontSize: 1, width: '14px', color: 'grays.4' }}
                    />
                  )}
                  <Text sx={{ fontSize: 0 }}>{t('Filter By')}</Text>
                </Flex>

                <Flex sx={{ flexShrink: 0, gap: 2 }}>
                  <Box
                    onClick={() => {
                      if (!lastDataPopupFilterState.isOpen) trackMetric(prefixPopHealthMetric('Last data filter open'), { clinicId: selectedClinicId });
                    }}
                    sx={{ flexShrink: 0 }}
                  >
                    <Button
                      variant="filter"
                      id="last-data-filter-trigger"
                      selected={!!activeFilters.lastData}
                      {...bindTrigger(lastDataPopupFilterState)}
                      icon={KeyboardArrowDownRoundedIcon}
                      iconLabel="Filter by last upload"
                      sx={{ fontSize: 0, lineHeight: 1.3 }}
                    >
                      {activeFilters.lastData
                        ? t('Data within') + find(customLastDataFilterOptions, { value: activeFilters.lastData })?.label.replace('Within', '')
                        : t('Data Recency')
                      }
                    </Button>
                  </Box>

                  <Popover
                    width="13em"
                    closeIcon
                    {...bindPopover(lastDataPopupFilterState)}
                    onClickCloseIcon={() => {
                      trackMetric(prefixPopHealthMetric('Last upload filter close'), { clinicId: selectedClinicId });
                    }}
                    onClose={() => {
                      lastDataPopupFilterState.close();
                      setPendingFilters(activeFilters);
                    }}
                  >
                    <DialogContent px={2} py={3} dividers>
                      <Box sx={{ alignItems: 'center' }} mb={2}>
                        <Text sx={{ color: 'grays.4', fontWeight: 'medium', fontSize: 0, whiteSpace: 'nowrap' }}>
                          {t('Device Type')}
                        </Text>
                      </Box>

                      <RadioGroup
                        id="last-upload-type"
                        name="last-upload-type"
                        options={lastDataTypeFilterOptions}
                        variant="vertical"
                        sx={{ fontSize: 0 }}
                        value={pendingFilters.lastDataType || activeFilters.lastDataType}
                        onChange={event => {
                          setPendingFilters({ ...pendingFilters, lastDataType: event.target.value || null });
                        }}
                      />

                      <Box
                        mt={3}
                        mb={2}
                        pt={3}
                        sx={{
                          alignItems: 'center',
                          borderTop: borders.divider,
                        }}
                      >
                        <Body0 color="grays.4" sx={{ fontWeight: 'bold' }} mb={0}>{t('Data Recency')}</Body0>
                        <Body0 color="grays.4" sx={{ fontWeight: 'medium' }} mb={2}>{t('Tidepool will only show patients who have data within the selected number of days.')}</Body0>
                      </Box>

                      <RadioGroup
                        id="last-upload-filters"
                        name="last-upload-filters"
                        options={customLastDataFilterOptions}
                        variant="vertical"
                        sx={{ fontSize: 0 }}
                        mb={3}
                        value={pendingFilters.lastData || activeFilters.lastData}
                        onChange={event => {
                          setPendingFilters({ ...pendingFilters, lastData: parseInt(event.target.value) || null });
                        }}
                      />
                    </DialogContent>

                    <DialogActions sx={{ justifyContent: 'space-between' }} p={1}>
                      <Button
                        id="clear-last-upload-filter"
                        sx={{ fontSize: 1 }}
                        variant="textSecondary"
                        onClick={() => {
                          trackMetric(prefixPopHealthMetric('Last upload clear filter'), { clinicId: selectedClinicId });
                          setPendingFilters({ ...activeFilters, lastData: defaultFilterState.lastData, lastDataType: defaultFilterState.lastDataType });
                          setActiveFilters({ ...activeFilters, lastData: defaultFilterState.lastData, lastDataType: defaultFilterState.lastDataType });
                          lastDataPopupFilterState.close();
                        }}
                      >
                        {t('Clear')}
                      </Button>

                      <Button
                        id="apply-last-upload-filter"
                        disabled={!pendingFilters.lastData || !pendingFilters.lastDataType}
                        sx={{ fontSize: 1 }}
                        variant="textPrimary"
                        onClick={() => {
                          const dateRange = pendingFilters.lastData === 1
                            ? 'today'
                            : `${pendingFilters.lastData} days`;

                          trackMetric(prefixPopHealthMetric('Last upload apply filter'), {
                            clinicId: selectedClinicId,
                            dateRange,
                            type: pendingFilters.lastDataType,
                          });

                          setActiveFilters(pendingFilters);
                          lastDataPopupFilterState.close();
                        }}
                      >
                        {t('Apply')}
                      </Button>
                    </DialogActions>
                  </Popover>

                  <Button
                    id="time-in-range-filter-trigger"
                    variant="filter"
                    selected={!!activeFilters.timeInRange?.length}
                    onClick={handleOpenTimeInRangeFilter}
                    icon={KeyboardArrowDownRoundedIcon}
                    iconLabel="Filter by Time In Range"
                    sx={{ fontSize: 0, lineHeight: 1.3, flexShrink: 0 }}
                  >
                    <Flex sx={{ gap: 1 }}>
                      {t('% Time in Range')}
                      {!!activeFilters.timeInRange?.length && (
                        <Pill
                          id="time-in-range-filter-count"
                          label="filter count"
                          round
                          sx={{
                            width: '14px',
                            fontSize: '9px',
                            lineHeight: '15px',
                            textAlign: 'center',
                            display: 'inline-block',
                          }}
                          colorPalette={['purpleMedium', 'white']}
                          text={`${activeFilters.timeInRange?.length}`}
                        />
                      )}
                      </Flex>
                  </Button>

                  <Box
                    onClick={() => {
                      if (!patientTagsPopupFilterState.isOpen) trackMetric(prefixPopHealthMetric('patient tags filter open'), { clinicId: selectedClinicId });
                    }}
                    sx={{ flexShrink: 0 }}
                  >
                    <Button
                      variant="filter"
                      id="patient-tags-filter-trigger"
                      selected={activeFilters.patientTags?.length > 0}
                      {...bindTrigger(patientTagsPopupFilterState)}
                      icon={KeyboardArrowDownRoundedIcon}
                      iconLabel="Filter by patient tags"
                      sx={{ fontSize: 0, lineHeight: 1.3 }}
                    >
                      <Flex sx={{ alignItems: 'center', gap: 1 }}>
                        {showTideDashboard && !clinic?.patientTags?.length && <Icon
                          variant="static"
                          icon={InfoOutlinedIcon}
                          sx={{ fontSize: '14px' }}
                        />}

                        {t('Patient Tags')}

                        {!!activeFilters.patientTags?.length && (
                          <Pill
                            id="patient-tags-filter-count"
                            label="filter count"
                            round
                            sx={{
                              width: '14px',
                              fontSize: '9px',
                              lineHeight: '15px',
                              textAlign: 'center',
                              display: 'inline-block',
                            }}
                            colorPalette={['purpleMedium', 'white']}
                            text={`${activeFilters.patientTags?.length}`}
                          />
                        )}
                      </Flex>
                    </Button>
                  </Box>

                  <Popover
                    minWidth="11em"
                    closeIcon
                    {...bindPopover(patientTagsPopupFilterState)}
                    onClickCloseIcon={() => {
                      trackMetric(prefixPopHealthMetric('Patient tag filter close'), { clinicId: selectedClinicId });
                    }}
                    onClose={() => {
                      patientTagsPopupFilterState.close();
                      setPendingFilters(activeFilters);
                    }}
                  >
                    <DialogContent px={2} pt={1} pb={3} dividers>
                      <Box variant="containers.small">
                        <Box>
                          <Text sx={{ color: 'text.primary', fontSize: 1, fontWeight: 'medium', whiteSpace: 'nowrap' }}>
                            {t('Filter by Patient Tags')}
                          </Text>

                          {showTideDashboard && !clinic?.patientTags?.length && (
                            <Flex mt={3} sx={{ gap: 1, alignItems: 'flex-start' }}>
                              <Icon
                                variant="static"
                                icon={InfoOutlinedIcon}
                                sx={{ color: 'text.primary', fontSize: '14px' }}
                              />

                              <Text sx={{ color: 'text.primary', fontSize: 0, fontWeight: 'medium', lineHeight: 2 }}>
                                {t('To use the TIDE Dashboard, add and apply patient tags.')}
                              </Text>
                            </Flex>
                          )}
                        </Box>

                        {!!pendingFilters.patientTags?.length && (
                          <Box id="selected-tag-filters" mb={1} sx={{ fontSize: 0, fontWeight: 'medium' }}>
                            <Text sx={{ fontSize: '10px', color: 'grays.4' }}>{t('Selected Tags')}</Text>

                            <TagList
                              tags={map(pendingFilters.patientTags, tagId => patientTags?.[tagId])}
                              tagProps={{
                                onClickIcon: tagId => {
                                  setPendingFilters({ ...pendingFilters, patientTags: without(pendingFilters.patientTags, tagId) });
                                },
                                icon: CloseRoundedIcon,
                                iconColor: 'white',
                                iconFontSize: 1,
                                sx: {
                                  color: 'white',
                                  backgroundColor: 'purpleMedium',
                                },
                              }}
                            />
                          </Box>
                        )}

                        {pendingFilters.patientTags?.length < patientTagsFilterOptions?.length && (
                          <Box id="available-tag-filters" sx={{ alignItems: 'center', fontSize:0, fontWeight:'medium' }} mt={2} mb={1}>
                            {!!pendingFilters.patientTags?.length && <Text sx={{ fontSize: '10px', color: 'grays.4' }}>{t('Available Tags')}</Text>}

                            <TagList
                              tags={map(reject(patientTagsFilterOptions, ({ id }) => includes(pendingFilters.patientTags, id)), ({ id }) => patientTags?.[id])}
                              tagProps={{
                                onClick: tagId => {
                                  setPendingFilters({ ...pendingFilters, patientTags: [...pendingFilters.patientTags, tagId] });
                                },
                              }}
                            />
                          </Box>
                        )}
                      </Box>
                    </DialogContent>

                    <DialogActions sx={{ justifyContent: 'space-between' }} p={1}>
                      <Button
                        id="clear-patient-tags-filter"
                        sx={{ fontSize: 1 }}
                        variant="textSecondary"
                        onClick={() => {
                          trackMetric(prefixPopHealthMetric('Patient tag filter clear'), { clinicId: selectedClinicId });
                          setPendingFilters({ ...activeFilters, patientTags: defaultFilterState.patientTags });
                          setActiveFilters({ ...activeFilters, patientTags: defaultFilterState.patientTags });
                          patientTagsPopupFilterState.close();
                        }}
                      >
                        {t('Clear')}
                      </Button>

                      <Button id="apply-patient-tags-filter" disabled={!pendingFilters.patientTags?.length} sx={{ fontSize: 1 }} variant="textPrimary" onClick={() => {
                        trackMetric(prefixPopHealthMetric('Patient tag filter apply'), { clinicId: selectedClinicId });
                        setActiveFilters(pendingFilters);
                        patientTagsPopupFilterState.close();
                      }}>
                        {t('Apply')}
                      </Button>
                    </DialogActions>

                    <DialogActions
                      p={1}
                      sx={{ borderTop: borders.divider, justifyContent: 'space-between' }}
                    >
                      <Button
                        id="show-edit-clinic-patient-tags-dialog"
                        icon={EditIcon}
                        iconPosition="left"
                        sx={{ fontSize: 1 }}
                        variant="textPrimary"
                        onClick={() => {
                          trackMetric(prefixPopHealthMetric('Edit clinic tags open'), { clinicId: selectedClinicId, source: 'Filter menu' });
                          setShowClinicPatientTagsDialog(true);
                        }}
                      >
                        {t('Edit Available Patient Tags')}
                      </Button>

                    </DialogActions>
                  </Popover>

                  <Box
                    onClick={() => {
                      if (!cgmUsePopupFilterState.isOpen) trackMetric(prefixPopHealthMetric('CGM Use filter open'), { clinicId: selectedClinicId });
                    }}
                    sx={{ flexShrink: 0 }}
                  >
                    <Button
                      variant="filter"
                      id="cgm-use-filter-trigger"
                      selected={!!activeFilters.timeCGMUsePercent}
                      {...bindTrigger(cgmUsePopupFilterState)}
                      icon={KeyboardArrowDownRoundedIcon}
                      iconLabel="Filter by cgm use"
                      sx={{ fontSize: 0, lineHeight: 1.3 }}
                    >
                      {activeFilters.timeCGMUsePercent ? find(cgmUseFilterOptions, { value: activeFilters.timeCGMUsePercent })?.label : t('% CGM Use')}
                    </Button>
                  </Box>

                  <Popover
                    minWidth="11em"
                    closeIcon
                    {...bindPopover(cgmUsePopupFilterState)}
                    onClickCloseIcon={() => {
                      trackMetric(prefixPopHealthMetric('CGM Use filter close'), { clinicId: selectedClinicId });
                    }}
                    onClose={() => {
                      cgmUsePopupFilterState.close();
                      setPendingFilters(activeFilters);
                    }}
                  >
                    <DialogContent px={2} py={3} dividers>
                      <Box sx={{ alignItems: 'center' }} mb={2}>
                        <Text sx={{ color: 'grays.4', fontWeight: 'medium', fontSize: 0, whiteSpace: 'nowrap' }}>
                          {t('% CGM Use')}
                        </Text>
                      </Box>

                      <RadioGroup
                        id="cgm-use"
                        name="cgm-use"
                        options={cgmUseFilterOptions}
                        variant="vertical"
                        sx={{ fontSize: 0 }}
                        value={pendingFilters.timeCGMUsePercent || activeFilters.timeCGMUsePercent}
                        onChange={event => {
                          setPendingFilters({ ...pendingFilters, timeCGMUsePercent: event.target.value || null });
                        }}
                      />
                    </DialogContent>

                    <DialogActions sx={{ justifyContent: 'space-between' }} p={1}>
                      <Button
                        id="clear-cgm-use-filter"
                        sx={{ fontSize: 1 }}
                        variant="textSecondary"
                        onClick={() => {
                          trackMetric(prefixPopHealthMetric('CGM use clear filter'), { clinicId: selectedClinicId });
                          setPendingFilters({ ...activeFilters, timeCGMUsePercent: defaultFilterState.timeCGMUsePercent });
                          setActiveFilters({ ...activeFilters, timeCGMUsePercent: defaultFilterState.timeCGMUsePercent });
                          cgmUsePopupFilterState.close();
                        }}
                      >
                        {t('Clear')}
                      </Button>

                      <Button
                        id="apply-cgm-use-filter"
                        disabled={!pendingFilters.timeCGMUsePercent}
                        sx={{ fontSize: 1 }}
                        variant="textPrimary"
                        onClick={() => {
                          trackMetric(prefixPopHealthMetric('CGM use apply filter'), {
                            clinicId: selectedClinicId,
                            filter: pendingFilters.timeCGMUsePercent,
                          });

                          setActiveFilters(pendingFilters);
                          cgmUsePopupFilterState.close();
                        }}
                      >
                        {t('Apply')}
                      </Button>
                    </DialogActions>
                  </Popover>
                </Flex>

                {activeFiltersCount > 0 && (
                  <Button
                    id="reset-all-active-filters"
                    variant="textSecondary"
                    onClick={handleResetFilters}
                    sx={{ fontSize: 0, color: 'grays.4', flexShrink: 0 }}
                    px={0}
                  >
                    {t('Reset Filters')}
                  </Button>
                )}
              </Flex>
            )}

            {/* Flex Group 2b: Range select and Info/Visibility Icons */}
            <Flex sx={{ flexGrow: 1, justifyContent: 'space-between', gap: 3 }}>

              {/* Range select */}
              {showSummaryData && (
                <Flex
                  pt={0}
                  sx={{ gap: 3, justifyContent: 'flex-start', alignItems: 'center', flexShrink: 0 }}
                >
                  <Flex
                    py={1}
                    pl={[0, 0, 3]}
                    sx={{ color: 'grays.4', borderLeft: ['none', null, borders.divider], alignItems: 'center' }}
                  >

                  <Text sx={{ fontSize: 0 }}>{t('Summarizing')}</Text>
                </Flex>

                <Box
                  onClick={() => {
                    if (!summaryPeriodPopupFilterState.isOpen) trackMetric(prefixPopHealthMetric('Summary period filter open'), { clinicId: selectedClinicId });
                  }}
                >
                  <Button
                    variant="filter"
                    id="summary-period-filter-trigger"
                    {...bindTrigger(summaryPeriodPopupFilterState)}
                    icon={KeyboardArrowDownRoundedIcon}
                    iconLabel="Filter by summary period duration"
                    sx={{ fontSize: 0, lineHeight: 1.3 }}
                  >
                    {find(summaryPeriodOptions, { value: activeSummaryPeriod })?.label} {t('of data')}
                  </Button>
                </Box>

                <Popover
                  width="13em"
                  closeIcon
                  {...bindPopover(summaryPeriodPopupFilterState)}
                  onClickCloseIcon={() => {
                    trackMetric(prefixPopHealthMetric('Summary period filter close'), { clinicId: selectedClinicId });
                  }}
                  onClose={() => {
                    summaryPeriodPopupFilterState.close();
                    setPendingSummaryPeriod(activeSummaryPeriod);
                  }}
                >
                  <DialogContent px={2} py={3} dividers>
                    <Body0 color="grays.4" sx={{ fontWeight: 'medium' }} mb={2}>{t('Tidepool will generate health summaries for the selected number of days.')}</Body0>

                    <RadioGroup
                      id="summary-period-filters"
                      name="summary-period-filters"
                      options={summaryPeriodOptions}
                      variant="vertical"
                      sx={{ fontSize: 0 }}
                      value={pendingSummaryPeriod || activeSummaryPeriod}
                      onChange={event => setPendingSummaryPeriod(event.target.value)}
                    />
                  </DialogContent>

                  <DialogActions sx={{ justifyContent: 'space-between' }} p={1}>
                    <Button
                      id="cancel-summary-period-filter"
                      sx={{ fontSize: 1 }}
                      variant="textSecondary"
                      onClick={() => {
                        trackMetric(prefixPopHealthMetric('Summary period filter cancel'), { clinicId: selectedClinicId });
                        setPendingSummaryPeriod(activeSummaryPeriod);
                        summaryPeriodPopupFilterState.close();
                      }}
                    >
                      {t('Cancel')}
                    </Button>

                    <Button
                      id="apply-summary-period-filter"
                      sx={{ fontSize: 1 }}
                      variant="textPrimary"
                      disabled={pendingSummaryPeriod === activeSummaryPeriod}
                      onClick={() => {
                        trackMetric(prefixPopHealthMetric('Summary period apply filter'), {
                          clinicId: selectedClinicId,
                          summaryPeriod: pendingSummaryPeriod,
                        });

                        setActiveSummaryPeriod(pendingSummaryPeriod);
                        summaryPeriodPopupFilterState.close();
                      }}
                    >
                      {t('Apply')}
                    </Button>
                  </DialogActions>
                </Popover>

                {showRpmReportUI && (
                  <Flex
                    alignItems="center"
                    color="grays.4"
                    py="1px"
                    pl={[0, 0, 3]}
                    sx={{ borderLeft: ['none', null, borders.divider] }}
                  >
                    <Button
                      id="open-rpm-report-config"
                      variant="tertiary"
                      onClick={handleConfigureRpmReport}
                      fontSize={0}
                      lineHeight={1.3}
                      px={2}
                      py={1}
                      iconSrc={TabularReportIcon}
                      iconPosition="left"
                    >
                      {t('RPM Report')}
                    </Button>
                  </Flex>
                )}
              </Flex>
            )}

            {/* Info/Visibility Icons */}
            <Flex sx={{ gap: 2, justifyContent: 'flex-end', flexGrow: 1, flexShrink: 0, alignItems: 'center' }}>
              {showSummaryData && showNames && (
                <>
                  <PopoverLabel
                    id="patient-fetch-time-ago"
                    icon={RefreshRoundedIcon}
                    iconLabel={t('Refresh patients list')}
                    iconProps={{
                      color: fetchingPatientsForClinic.inProgress ? 'text.primaryDisabled' : 'inherit',
                      disabled: fetchingPatientsForClinic.inProgress,
                      fontSize: '20px',
                      id: 'refresh-patients',
                      onClick: handleRefreshPatients,
                    }}
                    popoverContent={(
                      <Body1 p={3} id="last-refresh-time-ago" fontSize={1}>{timeAgoMessage}</Body1>
                    )}
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
                </>
              )}

              <Icon
                id="patients-view-toggle"
                variant="default"
                sx={{ color: 'grays.4' }}
                icon={VisibilityIcon}
                label={t('Toggle visibility')}
                onClick={handleToggleShowNames}
              />
            </Flex>
          </Flex>
        </Flex>
      </Flex>
      </>
    );
  };

  const renderPeopleInstructions = useCallback(() => {
    return (
      <Text py={4} mb={4} sx={{ display: 'block', fontSize: 1, textAlign: 'center', a: { color: 'text.link', cursor: 'pointer' } }}>
        <Trans className="peopletable-instructions" i18nKey="html.peopletable-instructions">
          Type a patient name in the search box or click <a className="peopletable-names-showall" onClick={handleToggleShowNames}>Show All</a> to display all patients.
        </Trans>
      </Text>
    );
  }, [handleToggleShowNames]);

  const renderRemoveDialog = useCallback(() => {
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
  }, [handleRemovePatient, selectedPatient?.fullName, showDeleteDialog, t]);

  const renderUpdateClinicPatientTagDialog = useCallback(() => {
    const name = selectedPatientTag?.name || '';

    return (
      <Dialog
        id="updatePatientTag"
        aria-labelledby="dialog-title"
        open={showUpdateClinicPatientTagDialog}
        onClose={handleCloseClinicPatientTagUpdateDialog}
      >
        <DialogTitle onClose={handleCloseClinicPatientTagUpdateDialog}>
          <MediumTitle id="dialog-title">{t('Update "{{name}}"', { name })}</MediumTitle>
        </DialogTitle>

        <Formik
          initialValues={{ name }}
          onSubmit={(tag, context) => {
            setClinicPatientTagFormContext(context);
            handleUpdateClinicPatientTagConfirm(tag);
          }}
          validationSchema={clinicPatientTagSchema}
        >
          {patientTagFormikContext => (
            <Form id="patient-tag-update">
              <DialogContent>
                <Flex mb={3} sx={{ gap: 2 }}>
                  <TextInput
                    themeProps={{
                      width: '100%',
                      sx: { input: { height: '22px', py: '0 !important' } },
                      flex: 1,
                      fontSize: '12px',
                    }}
                    maxLength={20}
                    placeholder={t('Add a new tag...')}
                    description={t('You can add up to {{maxClinicPatientTags}} tags per clinic', { maxClinicPatientTags })}
                    captionProps={{ mt: 0, fontSize: '10px', color: colors.grays[4] }}
                    variant="condensed"
                    {...getCommonFormikFieldProps('name', patientTagFormikContext)}
                  />
                </Flex>

                <Body1>
                  This tag will also be updated for any patients who have been tagged with it.
                </Body1>
              </DialogContent>

              <DialogActions>
                <Button id="patientTagUpdateCancel" variant="secondary" onClick={handleCloseClinicPatientTagUpdateDialog.bind(null, 'Edit clinic tags cancel update tag')}>
                  {t('Cancel')}
                </Button>

                <Button
                  id="patient-tag-update-confirm"
                  disabled={!patientTagFormikContext.values.name.trim().length || !patientTagFormikContext.isValid}
                  type="submit"
                  variant="primary"
                >
                  {t('Update')}
                </Button>
              </DialogActions>
            </Form>
          )}
        </Formik>
      </Dialog>
    );
  }, [handleUpdateClinicPatientTagConfirm, handleCloseClinicPatientTagUpdateDialog, selectedPatientTag?.name, showUpdateClinicPatientTagDialog, t]);

  const renderDeleteClinicPatientTagDialog = useCallback(() => {
    const name = selectedPatientTag?.name;

    return (
      <Dialog
        id="deletePatientTag"
        aria-labelledby="dialog-title"
        open={showDeleteClinicPatientTagDialog}
        onClose={handleCloseClinicPatientTagUpdateDialog}
      >
        <DialogTitle onClose={handleCloseClinicPatientTagUpdateDialog}>
          <MediumTitle id="dialog-title">{t('Remove "{{name}}"', { name })}</MediumTitle>
        </DialogTitle>

        <DialogContent>
          <Trans className="ModalOverlay-content" i18nKey="html.peopletable-remove-patient-tag-confirm">
            <Body1>
              Are you sure you want to remove the tag: <strong>{{name}}</strong> from the clinic?
            </Body1>

            <Body1>
              This tag will also be removed from any patients who have been tagged with it.
            </Body1>
          </Trans>
        </DialogContent>

        <DialogActions>
          <Button id="patientTagRemoveCancel" variant="secondary" onClick={handleCloseClinicPatientTagUpdateDialog.bind(null, 'Edit clinic tags cancel delete tag')}>
            {t('Cancel')}
          </Button>

          <Button
            id="patientTagRemoveConfirm"
            variant="danger"
            onClick={handleDeleteClinicPatientTagConfirm}
          >
            {t('Remove')}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }, [handleDeleteClinicPatientTagConfirm, handleCloseClinicPatientTagUpdateDialog, selectedPatientTag?.name, showDeleteClinicPatientTagDialog, t]);

  const renderAddPatientDialog = useCallback(() => {
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
          <PatientForm api={api} trackMetric={trackMetric} onFormChange={handlePatientFormChange} searchDebounceMs={searchDebounceMs} action="create" />
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
            disabled={!fieldsAreValid(keys(patientFormContext?.values), validationSchema({mrnSettings, existingMRNs}), patientFormContext?.values)}
          >
            {t('Add Patient')}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }, [
    api,
    creatingClinicCustodialAccount.inProgress,
    handleAddPatientConfirm,
    mrnSettings,
    existingMRNs,
    patientFormContext?.values,
    showAddPatientDialog,
    t,
    trackMetric
  ]);

  const renderEditPatientDialog = useCallback(() => {
    return (
      <Dialog
        id="editPatient"
        aria-labelledby="dialog-title"
        open={showEditPatientDialog}
        onClose={handleCloseOverlays}
      >
        <DialogTitle onClose={() => {
          trackMetric('Clinic - Edit patient close', { clinicId: selectedClinicId });
          handleCloseOverlays()
        }}>
          <MediumTitle id="dialog-title">{t('Edit Patient Details')}</MediumTitle>
        </DialogTitle>

        <DialogContent>
          <PatientForm
            api={api}
            trackMetric={trackMetric}
            onFormChange={handlePatientFormChange}
            patient={selectedPatient}
            searchDebounceMs={searchDebounceMs}
            action="edit"
          />
        </DialogContent>

        <DialogActions>
          <Button id="editPatientCancel" variant="secondary" onClick={() => {
            trackMetric('Clinic - Edit patient cancel', { clinicId: selectedClinicId });
            handleCloseOverlays()
          }}>
            {t('Cancel')}
          </Button>

          <Button
            id="editPatientConfirm"
            variant="primary"
            onClick={handleEditPatientConfirm}
            processing={updatingClinicPatient.inProgress}
            disabled={!fieldsAreValid(keys(patientFormContext?.values), validationSchema({mrnSettings, existingMRNs}), patientFormContext?.values)}
          >
            {t('Save Changes')}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }, [
    api,
    handleEditPatientConfirm,
    mrnSettings,
    existingMRNs,
    patientFormContext?.values,
    selectedClinicId,
    selectedPatient,
    showEditPatientDialog,
    t,
    trackMetric,
    updatingClinicPatient.inProgress
  ]);

  const renderTideDashboardConfigDialog = useCallback(() => {
    return (
      <Dialog
        id="tideDashboardConfig"
        aria-labelledby="dialog-title"
        open={showTideDashboardConfigDialog}
        onClose={handleCloseOverlays}
        maxWidth="sm"
      >
        <DialogTitle sx={{ alignItems: 'flex-start' }} onClose={handleCloseOverlays}>
          <Box mr={2}>
            <MediumTitle sx={{ fontSize: 2 }} id="dialog-title">{t('Select Patients to Display in the TIDE Dashboard')}</MediumTitle>
            <Body1 sx={{ fontWeight: 'medium', color: 'grays.4' }}>{t('You must make a selection in each category')}</Body1>
          </Box>
        </DialogTitle>

        <DialogContent>
          <TideDashboardConfigForm api={api} trackMetric={trackMetric} onFormChange={handleTideDashboardConfigFormChange} />
        </DialogContent>

        <DialogActions>
          <Button
            id="configureTideDashboardConfirm"
            variant="primary"
            onClick={handleConfigureTideDashboardConfirm}
            processing={fetchingTideDashboardPatients.inProgress}
            disabled={!fieldsAreValid(keys(tideDashboardFormContext?.values), tideDashboardConfigSchema, tideDashboardFormContext?.values)}
          >
            {t('Next')}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }, [
    api,
    fetchingTideDashboardPatients.inProgress,
    handleConfigureTideDashboardConfirm,
    tideDashboardFormContext?.values,
    showTideDashboardConfigDialog,
    t,
    trackMetric
  ]);

  const renderClinicPatientTagsDialog = useCallback(() => {
    return (
      <Dialog
        id="editClinicPatientTags"
        aria-labelledby="dialog-title"
        open={showClinicPatientTagsDialog}
        onClose={() => {
          handleCloseOverlays();
        }}
      >
        <Box variant="containers.extraSmall" mb={0} sx={{ width: ['100%', '100%'] }}>
          <DialogTitle
            divider={false}
            onClose={() => {
              trackMetric(prefixPopHealthMetric('Edit clinic tags close'), { clinicId: selectedClinicId });
              handleCloseOverlays();
            }}
          >
            <Body1 sx={{ fontWeight: 'medium' }}>{t('Available Patient Tags')}</Body1>
          </DialogTitle>

          <DialogContent pt={0} divider={false}>
            <Formik
              initialValues={{ name: '' }}
              onSubmit={(tag, context) => {
                trackMetric(prefixPopHealthMetric('Edit clinic tags add'), { clinicId: selectedClinicId });
                setClinicPatientTagFormContext(context);
                handleCreateClinicPatientTag(tag);
              }}
              validationSchema={clinicPatientTagSchema}
            >
              {patientTagFormikContext => (
                <Form id="patient-tag-add">
                  <Flex mb={3} sx={{ gap: 2 }}>
                    <TextInput
                      themeProps={{
                        width: '100%',
                        sx: { input: { height: '22px', py: '0 !important' } },
                        flex: 1,
                        fontSize: '12px',
                      }}
                      disabled={clinic?.patientTags?.length >= maxClinicPatientTags}
                      maxLength={20}
                      placeholder={t('Add a new tag...')}
                      description={t('You can add up to {{maxClinicPatientTags}} tags per clinic', { maxClinicPatientTags })}
                      captionProps={{ mt: 0, fontSize: '10px', color: colors.grays[4] }}
                      variant="condensed"
                      {...getCommonFormikFieldProps('name', patientTagFormikContext)}
                    />

                    <Button
                      disabled={!patientTagFormikContext.values.name.trim().length || clinic?.patientTags?.length >= maxClinicPatientTags || !patientTagFormikContext.isValid}
                      type="submit"
                      sx={{ height: '24px', alignSelf: 'flex-start' }}
                    >
                      {t('Add')}
                    </Button>
                  </Flex>
                </Form>
              )}
            </Formik>

            <Text mb={2} sx={{ color: 'text.primary', fontWeight: 'medium', fontSize: 0 }}>
              {isClinicAdmin
                ? t('Click a tag\'s text to rename it, or click the trash can icon to delete it.')
                : t('Click a tag\'s text to rename it.')
              }
            </Text>

            <TagList
              tags={clinic?.patientTags}
              tagProps={{
                icon: isClinicAdmin ? DeleteIcon : undefined,
                onClickIcon: isClinicAdmin ? tagId => handleDeleteClinicPatientTag(tagId) : undefined,
                onClick: tagId => handleUpdateClinicPatientTag(tagId),
              }}
            />
          </DialogContent>
        </Box>
      </Dialog>
    );
  }, [
    clinic?.patientTags,
    handleCreateClinicPatientTag,
    handleUpdateClinicPatientTag,
    handleDeleteClinicPatientTag,
    isClinicAdmin,
    prefixPopHealthMetric,
    selectedClinicId,
    showClinicPatientTagsDialog,
    trackMetric,
    t,
  ]);

  const renderSendUploadReminderDialog = useCallback(() => {
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
                  An upload reminder was last sent to <Text as='span' sx={{ fontWeight: 'bold' }}>{{name: selectedPatient?.fullName}}</Text> on <Text as='span' sx={{ fontWeight: 'bold' }}>{{date: formattedLastUploadReminderTime}}</Text>.
                </Text>

                <Text>
                  Are you sure you want to send an upload reminder email?
                </Text>
              </Trans>
            ) : (
              <Trans>
                <Text>
                  Are you sure you want to send an upload reminder email to <Text as='span' sx={{ fontWeight: 'bold' }}>{{name: selectedPatient?.fullName}}</Text>?
                </Text>
              </Trans>
            )}
          </Body1>
        </DialogContent>
        <DialogActions>
          <Button
            variant="secondary"
            onClick={() => {
              trackMetric(prefixPopHealthMetric('Send upload reminder declined'), { clinicId: selectedClinicId });
              handleCloseOverlays();
            }}
            >
            {t('Cancel')}
          </Button>
          <Button
            id="resend-upload-reminder"
            variant="primary"
            processing={sendingPatientUploadReminder.inProgress}
            onClick={() => {
              handleSendUploadReminderConfirm();
            }}
          >
            {t('Send ')}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }, [
    handleSendUploadReminderConfirm,
    prefixPopHealthMetric,
    selectedClinicId,
    selectedPatient,
    sendingPatientUploadReminder.inProgress,
    showSendUploadReminderDialog,
    t,
    timePrefs?.timezoneName,
    trackMetric,
  ]);

  const renderTimeInRangeDialog = useCallback(() => {
    const timeInRangeFilterOptions = [
      {
        value: 'timeInVeryLowPercent',
        threshold: glycemicTargetThresholds.timeInVeryLowPercent.value,
        prefix: t('Greater than'),
        tag: t('Severe hypoglycemia'),
        rangeName: 'veryLow',
      },
      {
        value: 'timeInLowPercent',
        threshold: glycemicTargetThresholds.timeInLowPercent.value,
        prefix: t('Greater than'),
        tag: t('Hypoglycemia'),
        rangeName: 'low',
      },
      {
        value: 'timeInTargetPercent',
        threshold: glycemicTargetThresholds.timeInTargetPercent.value,
        prefix: t('Less than'),
        tag: t('Normal'),
        rangeName: 'target',
      },
      {
        value: 'timeInHighPercent',
        threshold: glycemicTargetThresholds.timeInHighPercent.value,
        prefix: t('Greater than'),
        tag: t('Hyperglycemia'),
        rangeName: 'high',
      },
      {
        value: 'timeInVeryHighPercent',
        threshold: glycemicTargetThresholds.timeInVeryHighPercent.value,
        prefix: t('Greater than'),
        tag: t('Severe hyperglycemia'),
        rangeName: 'veryHigh',
      },
    ];

    if (showExtremeHigh) timeInRangeFilterOptions.push({
      value: 'timeInExtremeHighPercent',
      threshold: glycemicTargetThresholds.timeInExtremeHighPercent.value,
      prefix: t('Greater than'),
      tag: t('Extreme hyperglycemia'),
      rangeName: 'extremeHigh',
    });

    return (
      <Dialog
        id="timeInRangeDialog"
        aria-label="Time in range filters"
        open={showTimeInRangeDialog}
        onClose={() => {
          setPendingFilters(activeFilters);
          handleCloseOverlays();
        }}
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
            setPendingFilters(activeFilters);
            handleCloseOverlays();
          }}
        />

        <DialogContent color="text.primary" pl={4} pr={6} pb={3}>
          <Flex mb={3} sx={{ alignItems: 'center', fontSize: 1, fontWeight: 'medium' }}>
            <Text mr={2} sx={{ whiteSpace: 'nowrap' }}>
              {t('View Patients that spend:')}
            </Text>
          </Flex>

          {map(timeInRangeFilterOptions, ({ value, rangeName, tag, threshold, prefix }) => {
            const {prefix: bgPrefix, suffix, value:glucoseTargetValue} = bgLabels[rangeName];

            return (
              <Flex
                id={`time-in-range-filter-${rangeName}`}
                key={rangeName}
                mb={3}
                ml={2}
                sx={{ alignItems: 'center', gap: 2 }}
              >
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

              <Box>
                <Flex as="label" htmlFor={`range-${value}-filter`} sx={{ alignItems: 'center' }}>
                  <Text sx={{ fontSize: 1 }} mr={2}>
                    {prefix}{' '}
                    <Text sx={{ fontSize: 2, fontWeight: 'bold' }}>
                      {threshold}
                    </Text>
                    % {t('Time')} {t(bgPrefix)}{' '}
                    <Text sx={{ fontSize: 2, fontWeight: 'bold' }}>
                      {glucoseTargetValue}
                    </Text>{' '}
                    {suffix}
                  </Text>
                  <Pill
                    label={tag}
                    py="2px"
                    sx={{ fontSize: '12px', fontWeight: 'normal', borderRadius: radii.input }}
                    colorPalette={[`bg.${rangeName}`, 'white']}
                    text={tag}
                  />
                </Flex>
              </Box>
            </Flex>
          )})}

          <Button
            variant="textSecondary"
            px={0}
            sx={{ fontSize: 0 }}
            onClick={() => {
              trackMetric(prefixPopHealthMetric('Time in range unselect all'), { clinicId: selectedClinicId });
              setPendingFilters({ ...pendingFilters, timeInRange: defaultFilterState.timeInRange });
            }}
          >
            {t('Unselect all')}
          </Button>
        </DialogContent>

        <DialogActions sx={{ justifyContent: 'space-between' }} p={2}>
          <Button
            id="timeInRangeFilterClear"
            variant="textSecondary"
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
            variant="textPrimary"
            onClick={handleFilterTimeInRange}
          >
            {t('Apply Filter')}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }, [activeFilters, bgLabels, handleFilterTimeInRange, pendingFilters, prefixPopHealthMetric, selectedClinicId, setActiveFilters, showTimeInRangeDialog, t, trackMetric]);

  const renderRpmReportConfigDialog = useCallback(() => {
    return (
      <Dialog
        id="rpmReportConfig"
        aria-labelledby="dialog-title"
        open={showRpmReportConfigDialog}
        onClose={handleCloseOverlays}
        maxWidth="md"
        PaperProps={{ id: 'rpmReportConfigInner'}}
      >
        <DialogTitle onClose={handleCloseOverlays}>
          <Box sx={{ flexGrow: 1 }} mr={2}>
            <MediumTitle sx={{ fontSize: 4, textAlign: 'center' }} id="dialog-title">{t('RPM Report')}</MediumTitle>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ width: '609px' }} divider>
          <RpmReportConfigForm
            api={api}
            patientFetchOptions={patientFetchOptions}
            trackMetric={trackMetric}
            onFormChange={handleRpmReporConfigFormChange}
            open={showRpmReportConfigDialog}
          />
        </DialogContent>

        <DialogActions>
          <Button id="configureRpmReportCancel" variant="secondary" onClick={handleCloseOverlays}>
            {t('Cancel')}
          </Button>
          <Button
            id="configureRpmReportConfirm"
            variant="primary"
            onClick={handleConfigureRpmReportConfirm}
            processing={fetchingRpmReportPatients.inProgress}
            disabled={!fieldsAreValid(keys(rpmReportFormContext?.values), rpmReportConfigSchema(rpmReportFormContext?.utcDayShift), rpmReportFormContext?.values)}
          >
            {t('Generate Report')}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }, [
    api,
    fetchingRpmReportPatients.inProgress,
    handleConfigureRpmReportConfirm,
    patientFetchOptions,
    rpmReportFormContext?.values,
    showRpmReportConfigDialog,
    t,
    trackMetric
  ]);

  const renderRpmReportLimitDialog = useCallback(() => {
    return (
      <Dialog
        id="rpmReportLimit"
        aria-labelledby="dialog-title"
        open={showRpmReportLimitDialog}
        onClose={handleCloseOverlays}
        maxWidth="md"
        PaperProps={{ id: 'rpmReportLimitInner'}}
      >
        <DialogTitle onClose={handleCloseOverlays}>
          <Box sx={{ flexGrow: 1 }} mr={2}>
            <MediumTitle sx={{ fontSize: 4, textAlign: 'center' }} id="dialog-title">{t('RPM Report')}</MediumTitle>
          </Box>
        </DialogTitle>

        <DialogContent sx={{ width: '609px' }} divider>
          <Flex
            px={3}
            py={4}
            sx={{
              borderRadius: radii.default,
              bg: colors.banner.danger.bg,
              border: 'none',
              borderLeft: `3px solid ${colors.feedback.danger}`
            }}
          >
            <Box>
              <Body0 mb={2} sx={{ fontWeight: 'medium' }}>
                <Text sx={{ fontWeight: 'bold', color: 'feedback.danger', fontSize: 1 }}>{t('Unable to create report')}</Text>
                {t(' - The RPM Report can only be generated for up to 1,000 patients')}
              </Body0>

              <Body0 mb={2} sx={{ fontWeight: 'bold' }}>{t('Next Steps')}</Body0>
              <Body0 sx={{ fontWeight: 'medium', 'ul,li': { m: 0 } }}>
                <ul>
                  <li>
                    {t('Please filter your list further until there are fewer than 1,000 patients and try again')}
                  </li>
                </ul>
              </Body0>
            </Box>
          </Flex>
        </DialogContent>

        <DialogActions>
          <Button id="rpmReportLimitClose" variant="secondary" onClick={handleCloseOverlays}>
            {t('Close')}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }, [
    showRpmReportLimitDialog,
    t,
  ]);

  function handleCloseOverlays() {
    const resetList = showAddPatientDialog || showEditPatientDialog;
    setShowDeleteDialog(false);
    setShowAddPatientDialog(false);
    setShowEditPatientDialog(false);
    setShowClinicPatientTagsDialog(false);
    setShowTimeInRangeDialog(false);
    setShowSendUploadReminderDialog(false);
    setShowTideDashboardConfigDialog(false);
    setShowRpmReportConfigDialog(false);
    setShowRpmReportLimitDialog(false);

    if (resetList) {
      setPatientFetchOptions({ ...patientFetchOptions });
    }

    setTimeout(() => {
      setSelectedPatient(null);
    });
  }

  const renderPatient = useCallback(patient => (
    <Box onClick={handleClickPatient(patient)} sx={{ cursor: 'pointer' }}>
      <Text sx={{ display: 'block', fontSize: [1, null, 0], fontWeight: 'medium' }}>{patient.fullName}</Text>
      {showSummaryData && <Text sx={{ fontSize: [0, null, '10px'], whiteSpace: 'nowrap' }}>{t('DOB:')} {patient.birthDate}</Text>}
      {showSummaryData && patient.mrn && <Text sx={{ fontSize: [0, null, '10px'], whiteSpace: 'nowrap' }}>, {t('MRN: {{mrn}}', { mrn: patient.mrn })}</Text>}
      {!showSummaryData && patient.email && <Text sx={{ fontSize: [0, null, '10px'] }}>{patient.email}</Text>}
    </Box>
  ), [handleClickPatient, showSummaryData, t]);

  const renderLastDataDate = useCallback(({ summary }) => {
    let formattedLastDataDateCGM, formattedLastDataDateBGM;

    const defaultStyles = {
      color: 'inherit',
      fontWeight: '400',
    };

    if (summary?.cgmStats?.dates?.lastData) {
      formattedLastDataDateCGM = {
        ...formatTimeAgo(summary.cgmStats.dates.lastData, timePrefs),
        ...defaultStyles,
      };

      if (formattedLastDataDateCGM.daysAgo < 2) {
        formattedLastDataDateCGM.color = 'feedback.success';
        formattedLastDataDateCGM.fontWeight = 'medium';
      } else if (formattedLastDataDateCGM.daysAgo <= 30) {
        formattedLastDataDateCGM.color = 'feedback.warning';
        formattedLastDataDateCGM.fontWeight = 'medium';
      }
    }

    if (summary?.bgmStats?.dates?.lastData) {
      formattedLastDataDateBGM = {
        ...formatTimeAgo(summary.bgmStats.dates.lastData, timePrefs),
        ...defaultStyles,
      };

      if (formattedLastDataDateBGM.daysAgo < 2) {
        formattedLastDataDateBGM.color = 'feedback.success';
        formattedLastDataDateBGM.fontWeight = 'medium';
      } else if (formattedLastDataDateBGM.daysAgo <= 30) {
        formattedLastDataDateBGM.color = 'feedback.warning';
        formattedLastDataDateBGM.fontWeight = 'medium';
      }
    }

    return (
      <Box classname="patient-last-upload">
        {formattedLastDataDateCGM && (
          <Box sx={{ whiteSpace: 'nowrap' }}>
            <Text>{t('CGM: ')}</Text>
            <Text
              sx={{
                color: formattedLastDataDateCGM.color,
                fontWeight: formattedLastDataDateCGM.fontWeight,
                whiteSpace: 'nowrap',
              }}
            >
              {formattedLastDataDateCGM.text}
            </Text>
          </Box>
        )}

        {formattedLastDataDateBGM && (
          <Box sx={{ whiteSpace: 'nowrap' }}>
            <Text>{t('BGM: ')}</Text>
            <Text
              sx={{
                color: formattedLastDataDateBGM.color,
                fontWeight: formattedLastDataDateBGM.fontWeight,
                whiteSpace: 'nowrap',
              }}
            >
              {formattedLastDataDateBGM.text}
            </Text>
          </Box>
        )}

        {!formattedLastDataDateCGM && !formattedLastDataDateBGM && (
          <Text sx={{ color: 'inherit', fontWeight: 'regular' }}>{statEmptyText}</Text>
        )}
      </Box>
    );
  }, [t, timePrefs]);

  const renderGMI = useCallback(({ summary }) => {
    const cgmUsePercent = (summary?.cgmStats?.periods?.[activeSummaryPeriod]?.timeCGMUsePercent || 0);
    const cgmHours = (summary?.cgmStats?.periods?.[activeSummaryPeriod]?.timeCGMUseMinutes || 0) / 60;
    const gmi = summary?.cgmStats?.periods?.[activeSummaryPeriod]?.glucoseManagementIndicator;
    const minCgmHours = 24;
    const minCgmPercent = 0.7;

    let formattedGMI = gmi ? utils.formatDecimal(gmi, 1) : statEmptyText;

    if (includes(['1d', '7d'], activeSummaryPeriod)
      || cgmUsePercent < minCgmPercent
      || cgmHours < minCgmHours
    ) formattedGMI = statEmptyText;

    return (
      <Box classname="patient-gmi">
        <Text sx={{ fontWeight: 'medium' }}>{formattedGMI}</Text>
        {formattedGMI !== statEmptyText && <Text sx={{ fontSize: '10px' }}> %</Text>}
      </Box>
    );
  }, [activeSummaryPeriod]);

  const renderPatientTags = useCallback(patient => (
    <PatientTags
      api={api}
      patient={patient}
      patientTags={patientTags}
      patientTagsFilterOptions={patientTagsFilterOptions}
      prefixPopHealthMetric={prefixPopHealthMetric}
      selectedClinicId={selectedClinicId}
      selectedPatient={selectedPatient}
      setSelectedPatient={setSelectedPatient}
      setShowClinicPatientTagsDialog={setShowClinicPatientTagsDialog}
      setShowEditPatientDialog={setShowEditPatientDialog}
      t={t}
      trackMetric={trackMetric}
    />
  ), [
    api,
    patientTags,
    patientTagsFilterOptions,
    prefixPopHealthMetric,
    selectedClinicId,
    selectedPatient,
    setSelectedPatient,
    setShowClinicPatientTagsDialog,
    t,
    trackMetric,
  ]);

  const renderBgRangeSummary = useCallback(({summary}) => {
    return <BgSummaryCell
      summary={summary?.cgmStats?.periods?.[activeSummaryPeriod]}
      config={summary?.cgmStats?.config}
      clinicBgUnits={clinicBgUnits}
      activeSummaryPeriod={activeSummaryPeriod}
      showExtremeHigh={showExtremeHigh}
    />
  }, [clinicBgUnits, activeSummaryPeriod, showExtremeHigh]);

  const renderAverageGlucose = useCallback(({ summary }) => {
    const averageGlucose = summary?.bgmStats?.periods?.[activeSummaryPeriod]?.averageGlucoseMmol;
    let averageDailyRecords = Math.round(summary?.bgmStats?.periods?.[activeSummaryPeriod]?.averageDailyRecords);
    const averageDailyRecordsUnits = averageDailyRecords > 1 ? 'readings/day' : 'reading/day';
    if (averageDailyRecords === 0) averageDailyRecords = '<1';
    const averageDailyRecordsText = t('{{averageDailyRecords}} {{averageDailyRecordsUnits}}', { averageDailyRecords, averageDailyRecordsUnits });
    const bgPrefs = { bgUnits: clinicBgUnits };

    const formattedAverageGlucose = clinicBgUnits === MMOLL_UNITS
      ? formatBgValue(averageGlucose, bgPrefs)
      : formatBgValue(utils.translateBg(averageGlucose, clinicBgUnits), bgPrefs);

    return averageGlucose ? (
      <Box>
        <Text sx={{ display: 'block', fontSize: [1, null, 0], fontWeight: 'medium' }}>{formattedAverageGlucose}</Text>
        <Text sx={{ display: 'block', fontSize: [0, null, '10px'] }}>{averageDailyRecordsText}</Text>
      </Box>
    ) : null;
  }, [clinicBgUnits, activeSummaryPeriod, t]);

  const renderBGEvent = useCallback((type, { summary }) => {
    const rotation = type === 'low' ? 90 : -90;
    const color = type === 'low' ? 'bg.veryLow' : 'bg.veryHigh';
    const field = type === 'low' ? 'timeInVeryLowRecords' : 'timeInVeryHighRecords';
    const value = summary?.bgmStats?.periods?.[activeSummaryPeriod]?.[field];
    const visibility = value > 0 ? 'visible' : 'hidden';

    return (
      <Flex sx={{ alignItems: 'flex-end', visibility, gap: '1px' }}>
        <Icon
          sx={{ color, fontSize: 1, transform: `rotate(${rotation}deg)`, top: '-2px' }}
          icon={DoubleArrowIcon}
          label={type}
          variant="static"
        />
        <Text sx={{ fontWeight: 'medium', fontSize: 0 }}>{value}</Text>
      </Flex>
    );
  }, [activeSummaryPeriod]);

  const BGEventsInfo = () => (
    <Box p={1}>
      <Flex sx={{ alignItems: 'center', gap: '2px' }}>
        <Icon
          sx={{ transform: 'rotate(90deg)', fontSize: 1, color: 'bg.veryLow' }}
          icon={DoubleArrowIcon}
          label="low"
          variant="static"
        />
        <Text sx={{ color: 'text.primary', fontSize: 0 }}>
          {t('Low Events are a count of any BGM readings that are below {{threshold}}', {
            threshold: clinicBgUnits === MGDL_UNITS ? '54 mg/dL' : '3.0 mmol/L'
          })}
        </Text>
      </Flex>

      <Flex sx={{ alignItems: 'center', gap: '2px' }} mb={2}>
        <Icon
          sx={{ transform: 'rotate(-90deg)', fontSize: 1, color: 'bg.veryHigh' }}
          icon={DoubleArrowIcon}
          label="high"
          variant="static"
        />
        <Text sx={{ color: 'text.primary', fontSize: 0 }}>
          {t('High Events are a count of any BGM readings that are above {{threshold}}', {
            threshold: clinicBgUnits === MGDL_UNITS ? '250 mg/dL' : '13.9 mmol/L'
          })}
        </Text>
      </Flex>

      <Text sx={{ color: 'text.primary', fontSize: 0 }}>{t('Events are summed up over the currently selected time duration')}</Text>
    </Box>
  );

  const renderLinkedField = useCallback((field, patient) => (
    <Box
      classname={`patient-${field}`}
      onClick={handleClickPatient(patient)}
      sx={{ cursor: 'pointer' }}
    >
      <Text sx={{ fontWeight: 'medium' }}>{patient[field]}</Text>
    </Box>
  ), [handleClickPatient]);

  const renderLastReviewed = useCallback((patient) => {
    return <PatientLastReviewed api={api} trackMetric={trackMetric} metricSource="Patients list" patientId={patient.id} recentlyReviewedThresholdDate={moment().startOf('day').toISOString()} />
  }, [api, trackMetric]);

  const renderMore = useCallback((patient) => {
    return <MoreMenu
      patient={patient}
      isClinicAdmin={isClinicAdmin}
      selectedClinicId={selectedClinicId}
      showSummaryData={showSummaryData}
      t={t}
      trackMetric={trackMetric}
      setSelectedPatient={setSelectedPatient}
      setShowEditPatientDialog={setShowEditPatientDialog}
      prefixPopHealthMetric={prefixPopHealthMetric}
      setShowSendUploadReminderDialog={setShowSendUploadReminderDialog}
      setShowDeleteDialog={setShowDeleteDialog}
    />;
  }, [
    isClinicAdmin,
    selectedClinicId,
    showSummaryData,
    t,
    trackMetric,
    setSelectedPatient,
    setShowEditPatientDialog,
    prefixPopHealthMetric,
    setShowSendUploadReminderDialog,
    setShowDeleteDialog,
  ]);

  const columns = useMemo(() => {
    const cols = [
      {
        title: t('Patient Details'),
        field: 'fullName',
        align: 'left',
        sortable: true,
        defaultOrder: defaultSortOrders.fullName,
        render: renderPatient,
        className: showSummaryData ? 'no-margin' : null,
      },
      {
        title: t('Birthday'),
        field: 'birthDate',
        align: 'left',
        sortable: true,
        defaultOrder: defaultSortOrders.birthDate,
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
    if (showSummaryData) {
      cols.splice(1, 2,
        ...[
          {
            title: t('Data Recency'),
            field: `${activeFilters.lastDataType || 'cgm'}.lastData`,
            align: 'left',
            sortable: true,
            defaultOrder: defaultSortOrders.lastData,
            sortBy: 'lastData',
            render: renderLastDataDate,
          },
          {
            title: t('Patient Tags'),
            field: 'tags',
            align: 'left',
            render: renderPatientTags,
          },
          {
            field: 'cgmTag',
            align: 'left',
            className: 'group-tag',
            tag: t('CGM'),
          },
          {
            title: t('GMI'),
            field: 'cgm.glucoseManagementIndicator',
            align: 'left',
            sortable: true,
            defaultOrder: defaultSortOrders.glucoseManagementIndicator,
            sortBy: 'glucoseManagementIndicator',
            render: renderGMI,
            className: 'group-left',
          },
          {
            title: t('% Time in Range'),
            field: 'bgRangeSummary',
            align: 'center',
            render: renderBgRangeSummary,
            className: 'group-right',
          },
          {
            field: 'spacer',
            className: 'group-spacer',
          },
          {
            field: 'bgmTag',
            align: 'left',
            className: 'group-tag',
            tag: t('BGM'),
          },
          {
            title: t('Avg. Glucose ({{bgUnits}})', { bgUnits: clinicBgUnits }),
            field: 'bgm.averageGlucoseMmol',
            align: 'left',
            sortable: true,
            defaultOrder: defaultSortOrders.averageGlucoseMmol,
            sortBy: 'averageGlucoseMmol',
            render: renderAverageGlucose,
            className: 'group-left',
          },
          {
            title: t('Lows'),
            field: 'bgm.timeInVeryLowRecords',
            align: 'left',
            sortable: true,
            defaultOrder: defaultSortOrders.timeInVeryLowRecords,
            sortBy: 'timeInVeryLowRecords',
            render: renderBGEvent.bind(null, 'low'),
            className: 'group-center',
          },
          {
            title: t('Highs'),
            field: 'bgm.timeInVeryHighRecords',
            align: 'left',
            sortable: true,
            defaultOrder: defaultSortOrders.timeInVeryHighRecords,
            sortBy: 'timeInVeryHighRecords',
            render: renderBGEvent.bind(null, 'high'),
            className: 'group-center',
          },
          {
            titleComponent: () => (
              <PopoverLabel
                icon={InfoOutlinedIcon}
                iconProps={{
                  sx: { fontSize: '16px' },
                }}
                popoverContent={<BGEventsInfo />}
                popoverProps={{
                  anchorOrigin: {
                    vertical: 'bottom',
                    horizontal: 'center',
                  },
                  transformOrigin: {
                    vertical: 'top',
                    horizontal: 'center',
                  },
                  sx: { width: 'auto' },
                }}
                triggerOnHover
              />
            ),
            align: 'left',
            className: 'group-right',
          },
        ]
      );

      if (showSummaryDashboardLastReviewed) {
        cols.splice(12, 0, {
          title: t('Last Reviewed'),
          field: 'lastReviewed',
          align: 'left',
          sortable: true,
          defaultOrder: defaultSortOrders.lastReviewed,
          render: renderLastReviewed,
          width: 140,
        })
      }
    }
    return cols;
  }, [
    clinicBgUnits,
    renderAverageGlucose,
    renderBGEvent,
    renderBgRangeSummary,
    renderGMI,
    renderLastReviewed,
    renderLastDataDate,
    renderLinkedField,
    renderMore,
    renderPatient,
    renderPatientTags,
    showSummaryData,
    showSummaryDashboardLastReviewed,
    t,
    activeFilters.lastDataType,
    defaultSortOrders.averageGlucoseMmol,
    defaultSortOrders.birthDate,
    defaultSortOrders.fullName,
    defaultSortOrders.glucoseManagementIndicator,
    defaultSortOrders.lastData,
    defaultSortOrders.timeInVeryHighRecords,
    defaultSortOrders.timeInVeryLowRecords
  ]);

  const data = useMemo(() => orderBy(values(clinic?.patients), 'sortIndex'), [clinic?.patients]);
  const tableStyle = useMemo(() => ({ fontSize: showSummaryData ? 0 : 1 }), [showSummaryData]);

  const renderPeopleTable = useCallback(() => {
    const pageCount = Math.ceil(clinic?.fetchedPatientCount / patientFetchOptions.limit);
    const page = Math.ceil(patientFetchOptions.offset / patientFetchOptions.limit) + 1;
    const sort = patientFetchOptions.sort || defaultPatientFetchOptions.sort;
    return (
      <Box>
        <Loader show={loading} overlay={true} />
        <Table
          id={'peopleTable'}
          variant={showSummaryData ? 'condensed' : 'default'}
          label={'peopletablelabel'}
          columns={columns}
          data={data}
          sx={tableStyle}
          onSort={handleSortChange}
          order={sort?.substring(0, 1) === '+' ? 'asc' : 'desc'}
          orderBy={sort?.substring(1)}
        />

        {pageCount > 1 && (
          <Pagination
            px="5%"
            sx={{ width: '100%', position: 'absolute', bottom: '-50px' }}
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
  }, [
    clinic?.fetchedPatientCount,
    columns,
    data,
    defaultPatientFetchOptions.sort,
    handlePageChange,
    handleSortChange,
    loading,
    patientFetchOptions,
    showSummaryData,
    tableStyle,
  ]);

  const renderPeopleArea = useCallback(() => {
    if (!showNames) {
      return renderPeopleInstructions();
    } else {
      return renderPeopleTable();
    }
  }, [renderPeopleInstructions, renderPeopleTable, showNames]);

  return (
    <div>
      {renderHeader()}
      {clinic && renderPeopleArea()}
      {renderRemoveDialog()}
      {showDeleteClinicPatientTagDialog && renderDeleteClinicPatientTagDialog()}
      {showUpdateClinicPatientTagDialog && renderUpdateClinicPatientTagDialog()}
      {showAddPatientDialog && renderAddPatientDialog()}
      {showEditPatientDialog && renderEditPatientDialog()}
      {showTideDashboardUI && showTideDashboardConfigDialog && renderTideDashboardConfigDialog()}
      {showRpmReportUI && renderRpmReportConfigDialog()}
      {showRpmReportUI && renderRpmReportLimitDialog()}
      {showTimeInRangeDialog && renderTimeInRangeDialog()}
      {showSendUploadReminderDialog && renderSendUploadReminderDialog()}
      {showClinicPatientTagsDialog && renderClinicPatientTagsDialog()}
      <StyledScrollToTop
        smooth
        top={600}
        component={<ArrowUpwardIcon />}
      />
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

export default withTranslation()(ClinicPatients);
