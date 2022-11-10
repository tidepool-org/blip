import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { push } from 'connected-react-router';
import { translate, Trans } from 'react-i18next';
import { format } from 'd3-format';
import moment from 'moment';
import debounce from 'lodash/debounce';
import difference from 'lodash/difference';
import forEach from 'lodash/forEach';
import find from 'lodash/find';
import get from 'lodash/get';
import includes from 'lodash/includes';
import isEmpty from 'lodash/isEmpty';
import isEqual from 'lodash/isEqual';
import keys from 'lodash/keys';
import keyBy from 'lodash/keyBy';
import map from 'lodash/map';
import omit from 'lodash/omit';
import reject from 'lodash/reject';
import values from 'lodash/values';
import without from 'lodash/without';
import { Box, Flex, Text } from 'rebass/styled-components';
import AddIcon from '@material-ui/icons/Add';
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
import styled from 'styled-components';
import { scroller } from 'react-scroll';
import { Formik, Form } from 'formik';

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
import { TagList } from '../../components/elements/Tag';
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
import { useIsFirstRender, useLocalStorage, usePrevious } from '../../core/hooks';
import { fieldsAreValid, getCommonFormikFieldProps } from '../../core/forms';
import { dateFormat, patientSchema as validationSchema, clinicPatientTagSchema } from '../../core/clinicUtils';
import { MGDL_PER_MMOLL, MGDL_UNITS } from '../../core/constants';
import { borders, radii, colors } from '../../themes/baseTheme';

const { Loader } = vizComponents;
const { reshapeBgClassesToBgBounds, generateBgRangeLabels } = vizUtils.bg;
const { getLocalizedCeiling } = vizUtils.datetime;

const StyledScrollToTop = styled(ScrollToTop)`
  background-color: ${colors.purpleMedium};
  right: 20px;
  bottom: 70px;
  border-radius: 20px;
  padding-top: 4px;
`;

const defaultFilterState = {
  lastUploadDate: null,
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
};

const BgSummaryCell = ({ summary, clinicBgUnits, summaryPeriod, t }) => {
  const targetRange = useMemo(
    () =>
      map(
        [summary?.lowGlucoseThreshold, summary?.highGlucoseThreshold],
        (value) =>
          clinicBgUnits === MGDL_UNITS ? value * MGDL_PER_MMOLL : value
      ),
    [clinicBgUnits, summary?.highGlucoseThreshold, summary?.lowGlucoseThreshold]
  );

  const cgmHours =
    (summary?.periods?.[summaryPeriod]?.timeCGMUseMinutes || 0) / 60;

  const data = useMemo(
    () => ({
      veryLow: summary?.periods?.[summaryPeriod]?.timeInVeryLowPercent,
      low: summary?.periods?.[summaryPeriod]?.timeInLowPercent,
      target: summary?.periods?.[summaryPeriod]?.timeInTargetPercent,
      high: summary?.periods?.[summaryPeriod]?.timeInHighPercent,
      veryHigh: summary?.periods?.[summaryPeriod]?.timeInVeryHighPercent,
    }),
    [summary?.periods, summaryPeriod]
  );

  const cgmUsePercent = (summary?.periods?.[summaryPeriod]?.timeCGMUsePercent || 0);
  const minCgmHours = 24;
  const minCgmePercent = 0.7;

  const insufficientDataText = useMemo(
    () =>
      summaryPeriod === '1d'
        ? t('CGM Use <{{minCgmePercent}}%', { minCgmePercent: minCgmePercent * 100 })
        : t('CGM Use <{{minCgmHours}} hours', { minCgmHours }),
    [summaryPeriod, t]
  );

  return (
    <Flex justifyContent="center">
      {(summaryPeriod === '1d' && cgmUsePercent >= minCgmePercent) || (cgmHours >= minCgmHours)
        ? (
        <BgRangeSummary
          striped={summary?.periods?.[summaryPeriod]?.timeCGMUsePercent < 0.7}
          data={data}
          targetRange={targetRange}
          bgUnits={clinicBgUnits}
        />
      ) : (
        <Flex
          alignItems="center"
          justifyContent="center"
          bg="lightestGrey"
          width={['155px', '200px']}
          height="20px"
        >
          <Text fontSize="10px" fontWeight="medium" color="grays.4">
            {insufficientDataText}
          </Text>
        </Flex>
      )}
    </Flex>
  );
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
      maxCharactersVisible={20}
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
          color="grays.4"
          fontWeight="medium"
          fontSize="10px"
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
            <Box alignItems="center" mb={3} fontSize={1} fontWeight="medium">
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
                    color: 'white',
                    backgroundColor: 'purpleMedium',
                  }}
                />
              </Box>
            )}

            {pendingPatientTags?.length < patientTagsFilterOptions.length && (
              <Box className='available-tags' alignItems="center" mt={2} mb={1} fontSize={0} fontWeight="medium" >
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

        <DialogActions justifyContent="space-between" p={1}>
          <Button
            id="clear-patient-tags-dialog"
            fontSize={1}
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

          <Button id="apply-patient-tags-dialog" disabled={!pendingPatientTags.length} fontSize={1} variant="textPrimary" onClick={() => {
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
          justifyContent="space-between"
          sx={{ borderTop: borders.divider }}
        >
          <Button
            id="show-edit-clinic-patient-tags-dialog"
            icon={EditIcon}
            iconPosition="left"
            fontSize={1}
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
  const timePrefs = useSelector((state) => state.blip.timePrefs);
  const isClinicAdmin = includes(get(clinic, ['clinicians', loggedInUserId, 'roles'], []), 'CLINIC_ADMIN');
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showDeleteClinicPatientTagDialog, setShowDeleteClinicPatientTagDialog] = useState(false);
  const [showUpdateClinicPatientTagDialog, setShowUpdateClinicPatientTagDialog] = useState(false);
  const [showAddPatientDialog, setShowAddPatientDialog] = useState(false);
  const [showEditPatientDialog, setShowEditPatientDialog] = useState(false);
  const [showClinicPatientTagsDialog, setShowClinicPatientTagsDialog] = useState(false);
  const [showTimeInRangeDialog, setShowTimeInRangeDialog] = useState(false);
  const [showSendUploadReminderDialog, setShowSendUploadReminderDialog] = useState(false);
  const [showNames, setShowNames] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [selectedPatientTag, setSelectedPatientTag] = useState(null);
  const [loading, setLoading] = useState(false);
  const [patientFormContext, setPatientFormContext] = useState();
  const [clinicPatientTagFormContext, setClinicPatientTagFormContext] = useState();
  const [patientFetchMinutesAgo, setPatientFetchMinutesAgo] = useState();
  const statEmptyText = '--';
  const [showSummaryData, setShowSummaryData] = useState(clinic?.tier >= 'tier0200');
  const [clinicBgUnits, setClinicBgUnits] = useState(MGDL_UNITS);
  const [patientFetchOptions, setPatientFetchOptions] = useState({});
  const [patientFetchCount, setPatientFetchCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const previousClinic = usePrevious(clinic);
  const previousFetchOptions = usePrevious(patientFetchOptions);

  const defaultPatientFetchOptions = useMemo(
    () => ({
      search: '',
      offset: 0,
      sort: showSummaryData ? '-summary.lastUploadDate' : '+fullName',
    }),
    [showSummaryData]
  );

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

  const lastUploadDateFilterOptions = [
    { value: 1, label: t('Today') },
    { value: 2, label: t('Last 2 days') },
    { value: 14, label: t('Last 14 days') },
    { value: 30, label: t('Last 30 days') },
  ];

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

  const [summaryPeriod, setSummaryPeriod] = useState('14d');
  const [pendingSummaryPeriod, setPendingSummaryPeriod] = useState(summaryPeriod);
  const previousSummaryPeriod = usePrevious(summaryPeriod);

  const summaryPeriodPopupFilterState = usePopupState({
    variant: 'popover',
    popupId: 'summaryPeriodFilters',
  });

  const lastUploadDatePopupFilterState = usePopupState({
    variant: 'popover',
    popupId: 'lastUploadDateFilters',
  });

  const patientTagsPopupFilterState = usePopupState({
    variant: 'popover',
    popupId: 'patientTagFilters',
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
    fetchingPatientFromClinic,
    fetchingPatientsForClinic,
    deletingPatientFromClinic,
    updatingClinicPatient,
    creatingClinicCustodialAccount,
    sendingPatientUploadReminder,
    creatingClinicPatientTag,
    updatingClinicPatientTag,
    deletingClinicPatientTag,
  } = useSelector((state) => state.blip.working);

  // TODO: remove this when upgraded to React 18
  // force another render when fetching patients state changes
  const [forceUpdate, setForceUpdate] = useState();
  if(!isEqual(forceUpdate, fetchingPatientsForClinic)){
    setForceUpdate(fetchingPatientsForClinic);
  }

  const previousFetchingPatientsForClinic = usePrevious(fetchingPatientsForClinic);

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
    const { inProgress, completed, notification } = workingState;

    if (!isFirstRender && !inProgress) {
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
    handleAsyncResult(updatingClinicPatient, t('You have successfully updated a patient.'));
  }, [handleAsyncResult, t, updatingClinicPatient]);

  useEffect(() => {
    handleAsyncResult(creatingClinicCustodialAccount, t('You have successfully added a new patient.'));
  }, [creatingClinicCustodialAccount, handleAsyncResult, t]);

  useEffect(() => {
    handleAsyncResult(deletingPatientFromClinic, t('{{name}} has been removed from the clinic.', {
      name: get(selectedPatient, 'fullName', t('This patient')),
    }));
  }, [deletingPatientFromClinic, handleAsyncResult, selectedPatient, t]);

  useEffect(() => {
    handleAsyncResult(creatingClinicPatientTag, t('Tag created.'), () => clinicPatientTagFormContext?.resetForm());
  }, [clinicPatientTagFormContext, creatingClinicPatientTag, handleAsyncResult, t]);

  useEffect(() => {
    handleAsyncResult(updatingClinicPatientTag, t('Tag updated.'), handleCloseClinicPatientTagUpdateDialog);
  }, [updatingClinicPatientTag, handleAsyncResult, handleCloseClinicPatientTagUpdateDialog, t]);

  useEffect(() => {
    handleAsyncResult(deletingClinicPatientTag, t('Tag removed.'), handleCloseClinicPatientTagUpdateDialog);
  }, [deletingClinicPatientTag, handleAsyncResult, handleCloseClinicPatientTagUpdateDialog, t]);

  useEffect(() => {
    // If a tag is deleted or otherwise missing, and is still present in an active filter, remove it from the filters
    const missingTagsInFilter = difference(activeFilters.patientTags, map(patientTags, 'id'));
    if (missingTagsInFilter.length) {
      setActiveFilters({ ...activeFilters, patientTags: without(activeFilters.patientTags, ...missingTagsInFilter) });
      setPendingFilters({ ...pendingFilters, patientTags: without(activeFilters.patientTags, ...missingTagsInFilter) });
    }
  }, [patientTags]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    handleAsyncResult(sendingPatientUploadReminder, t('Uploader reminder email for {{name}} has been sent.', {
      name: get(selectedPatient, 'fullName', t('this patient')),
    }));
  }, [handleAsyncResult, selectedPatient, sendingPatientUploadReminder, t]);

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
      !fetchingPatientsForClinic.inProgress &&
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
    previousFetchOptions
  ]);

  useEffect(() => {
    if(!(isEqual(clinic?.id, previousClinic?.id) && isEqual(activeFilters, previousActiveFilters) && !isFirstRender && isEqual(summaryPeriod, previousSummaryPeriod))) {
      const filterOptions = {
        offset: 0,
        sort: patientFetchOptions.sort || defaultPatientFetchOptions.sort,
        limit: 50,
        search: patientFetchOptions.search,
      }

      if (isEmpty(filterOptions.search)) delete filterOptions.search;

      const isPremiumTier = clinic?.tier >= 'tier0200';

      if (isPremiumTier) {
        if (activeFilters.lastUploadDate) {
          filterOptions['summary.lastUploadDateTo'] = getLocalizedCeiling(new Date().toISOString(), timePrefs).toISOString();
          filterOptions['summary.lastUploadDateFrom'] = moment(filterOptions['summary.lastUploadDateTo']).subtract(activeFilters.lastUploadDate, 'days').toISOString();
        }

        if (activeFilters.patientTags.length) {
          filterOptions['tags'] = activeFilters.patientTags;
        }

        forEach(activeFilters.timeInRange, filter => {
          let { comparator, value } = glycemicTargetThresholds[filter];
          value = value / 100;

          if (activeFilters.meetsGlycemicTargets) {
            comparator = comparator === '<' ? '<=' : '>=';
          }

          filterOptions[`summary.periods.${summaryPeriod}.${filter}`] = comparator + value;
        });
      }

      const newPatientFetchOptions = {
        ...omit(patientFetchOptions, [
          'summary.lastUploadDateFrom',
          'summary.lastUploadDateTo',
          'tags',
          `summary.periods.${summaryPeriod}.timeInVeryLowPercent`,
          `summary.periods.${summaryPeriod}.timeInLowPercent`,
          `summary.periods.${summaryPeriod}.timeInTargetPercent`,
          `summary.periods.${summaryPeriod}.timeInHighPercent`,
          `summary.periods.${summaryPeriod}.timeInVeryHighPercent`,
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
        setShowSummaryData(isPremiumTier);
        setPatientFetchOptions(newPatientFetchOptions);
        setCurrentPage(1);
      }
    }
  }, [
    activeFilters,
    clinic?.id,
    clinic?.tier,
    defaultPatientFetchOptions.sort,
    isFirstRender,
    patientFetchOptions,
    previousActiveFilters,
    previousClinic?.id,
    previousSummaryPeriod,
    summaryPeriod,
    timePrefs,
  ]);

  // Provide latest patient state for the edit form upon fetch
  useEffect(() => {
    if (fetchingPatientFromClinic.completed && selectedPatient?.id) setSelectedPatient(clinic.patients[selectedPatient.id]);
  }, [fetchingPatientFromClinic]);

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
    setPatientFormContext({...formikContext});
  }

  function handleSearchChange(event) {
    setSearch(event.target.value);
    setLoading(true);
    debounceSearch(event.target.value);
  }

  const handleSortChange = useCallback((newOrderBy) => {
    const sort = patientFetchOptions.sort || defaultPatientFetchOptions.sort;
    const currentOrder = sort[0];
    const currentOrderBy = sort.substring(1);
    const newOrder = newOrderBy === currentOrderBy && currentOrder === '+' ? '-' : '+';
    setPatientFetchOptions(fetchOptions => ({
      ...fetchOptions,
      offset: 0,
      sort: `${newOrder}${newOrderBy}`,
    }));

    if (showSummaryData) {
      const order = newOrder === '+' ? 'ascending' : 'descending';

      const sortColumnLabels = {
        fullName: 'Patient details',
        'summary.lastUploadDate': 'Last upload',
        [`summary.periods.${summaryPeriod}.timeCGMUsePercent`]: 'CGM use',
        [`summary.periods.${summaryPeriod}.glucoseManagementIndicator`]: 'GMI',
      };

      trackMetric(prefixPopHealthMetric(`${sortColumnLabels[newOrderBy]} sort ${order}`), { clinicId: selectedClinicId });
    }
  }, [defaultPatientFetchOptions.sort, patientFetchOptions.sort, prefixPopHealthMetric, selectedClinicId, showSummaryData, summaryPeriod, trackMetric]);

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
      activeFilters.lastUploadDate,
      activeFilters.timeInRange.length,
      activeFilters.patientTags.length,
    ], null, 0).length;

    const VisibilityIcon = showNames ? VisibilityOffOutlinedIcon : VisibilityOutlinedIcon;
    const hoursAgo = Math.floor(patientFetchMinutesAgo / 60);
    let timeAgoUnits = hoursAgo < 2 ? t('hour') : t('hours');
    let timeAgo = hoursAgo === 0 ? t('less than an') : t('over {{hoursAgo}}', { hoursAgo });
    if (hoursAgo >= 24) timeAgo = t('over 24');
    const timeAgoMessage = t('Last updated {{timeAgo}} {{timeAgoUnits}} ago', { timeAgo, timeAgoUnits });
    return (
      <>
        <Flex mb={4} alignItems="center" justifyContent="space-between" flexWrap="wrap" sx={{ gap: 3 }}>
          {/* Flex Group 1: Search Box and Add Patient button */}
          <Flex
            alignItems="center"
            justifyContent="space-between"
            width="auto"
            flexGrow={[1, null, 0]}
            sx={{ gap: 2 }}
          >
            <Button
              id="add-patient"
              variant="primary"
              onClick={handleAddPatient}
              fontSize={0}
              px={[2, 3]}
              lineHeight={['inherit', null, 1]}
            >
              {t('Add New Patient')}
            </Button>

            <Box flex={1} sx={{ position: ['static', null, 'absolute'], top: '8px', right: 4 }}>
              <TextInput
                themeProps={{
                  width: ['100%', null, '250px'],
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
          </Flex>

          {/* Flex Group 2: Filters and Info Icons */}
          <Flex
            alignItems="center"
            flexGrow={showSummaryData ? 1 : 0}
            flexShrink={1}
            flexWrap="wrap"
            pt={0}
            sx={{ gap: 3 }}
          >
            {/* Flex Group 2a: Results Filters */}
            {showSummaryData && (
              <Flex
                alignItems="center"
                justifyContent="flex-start"
                sx={{ gap: 2 }}
                flexWrap="wrap"
              >
                <Flex
                  alignItems="center"
                  color={activeFiltersCount > 0 ? 'purpleMedium' : 'grays.4'}
                  pl={[0, 0, 2]}
                  py={1}
                  sx={{ gap: 1, borderLeft: ['none', null, borders.divider] }}
                  flexShrink={0}
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

                <Flex flexShrink={0} sx={{ gap: 2 }}>
                  <Box
                    onClick={() => {
                      if (!lastUploadDatePopupFilterState.isOpen) trackMetric(prefixPopHealthMetric('Last upload filter open'), { clinicId: selectedClinicId });
                    }}
                    flexShrink={0}
                  >
                    <Button
                      variant="filter"
                      id="last-upload-filter-trigger"
                      selected={!!activeFilters.lastUploadDate}
                      {...bindTrigger(lastUploadDatePopupFilterState)}
                      icon={KeyboardArrowDownRoundedIcon}
                      iconLabel="Filter by last upload"
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
                    onClose={() => {
                      lastUploadDatePopupFilterState.close();
                      setPendingFilters(activeFilters);
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
                    fontSize={0}
                    lineHeight={1.3}
                    flexShrink={0}
                  >
                    <Flex sx={{ gap: 1 }}>
                      {t('% Time in Range')}
                      {!!activeFilters.timeInRange.length && (
                        <Pill
                          id="time-in-range-filter-count"
                          label="filter count"
                          round
                          width="14px"
                          fontSize="9px"
                          lineHeight="15px"
                          sx={{
                            textAlign: 'center',
                            display: 'inline-block',
                          }}
                          colorPalette={['purpleMedium', 'white']}
                          text={`${activeFilters.timeInRange.length}`}
                        />
                      )}
                      </Flex>
                  </Button>

                  <Box
                    onClick={() => {
                      if (!patientTagsPopupFilterState.isOpen) trackMetric(prefixPopHealthMetric('patient tags filter open'), { clinicId: selectedClinicId });
                    }}
                    flexShrink={0}
                  >
                    <Button
                      variant="filter"
                      id="patient-tags-filter-trigger"
                      selected={activeFilters.patientTags.length > 0}
                      {...bindTrigger(patientTagsPopupFilterState)}
                      icon={KeyboardArrowDownRoundedIcon}
                      iconLabel="Filter by patient tags"
                      fontSize={0}
                      lineHeight={1.3}
                    >
                      <Flex sx={{ gap: 1 }}>
                        {t('Patient Tags')}
                        {!!activeFilters.patientTags.length && (
                          <Pill
                            id="patient-tags-filter-count"
                            label="filter count"
                            round
                            width="14px"
                            fontSize="9px"
                            lineHeight="15px"
                            sx={{
                              textAlign: 'center',
                              display: 'inline-block',
                            }}
                            colorPalette={['purpleMedium', 'white']}
                            text={`${activeFilters.patientTags.length}`}
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
                    <DialogContent px={2} py={3} dividers>
                      <Box variant="containers.extraSmall">
                        <Box alignItems="center" mb={3} fontSize={1} fontWeight="medium">
                          <Text color="text.primary" sx={{ whiteSpace: 'nowrap' }}>
                            {t('Filter by Patient Tags')}
                          </Text>
                        </Box>

                        {!!pendingFilters.patientTags.length && (
                          <Box id="selected-tag-filters" mb={1} fontSize={0} fontWeight="medium">
                            <Text fontSize="10px" color="grays.4">{t('Selected Tags')}</Text>

                            <TagList
                              tags={map(pendingFilters.patientTags, tagId => patientTags?.[tagId])}
                              tagProps={{
                                onClickIcon: tagId => {
                                  setPendingFilters({ ...pendingFilters, patientTags: without(pendingFilters.patientTags, tagId) });
                                },
                                icon: CloseRoundedIcon,
                                iconColor: 'white',
                                iconFontSize: 1,
                                color: 'white',
                                backgroundColor: 'purpleMedium',
                              }}
                            />
                          </Box>
                        )}

                        {pendingFilters.patientTags.length < patientTagsFilterOptions.length && (
                          <Box id="available-tag-filters" alignItems="center" mt={2} mb={1} fontSize={0} fontWeight="medium" >
                            {!!pendingFilters.patientTags.length && <Text fontSize="10px" color="grays.4">{t('Available Tags')}</Text>}

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

                    <DialogActions justifyContent="space-between" p={1}>
                      <Button
                        id="clear-patient-tags-filter"
                        fontSize={1}
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

                      <Button id="apply-patient-tags-filter" disabled={!pendingFilters.patientTags?.length} fontSize={1} variant="textPrimary" onClick={() => {
                        trackMetric(prefixPopHealthMetric('Patient tag filter apply'), { clinicId: selectedClinicId });
                        setActiveFilters(pendingFilters);
                        patientTagsPopupFilterState.close();
                      }}>
                        {t('Apply')}
                      </Button>
                    </DialogActions>

                    <DialogActions
                      p={1}
                      justifyContent="space-between"
                      sx={{ borderTop: borders.divider }}
                    >
                      <Button
                        id="show-edit-clinic-patient-tags-dialog"
                        icon={EditIcon}
                        iconPosition="left"
                        fontSize={1}
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
                </Flex>

                {activeFiltersCount > 0 && (
                  <Button
                    id="reset-all-active-filters"
                    variant="textSecondary"
                    onClick={handleResetFilters}
                    fontSize={0}
                    color="grays.4"
                    flexShrink={0}
                    px={0}
                  >
                    {t('Reset Filters')}
                  </Button>
                )}
              </Flex>
            )}

            {/* Flex Group 2b: Range select and Info/Visibility Icons */}
            <Flex flexGrow={1} justifyContent="space-between" sx={{ gap: 3 }}>

              {/* Range select */}
              {/* {showSummaryData && ( */}
              {false && ( // temporarily disable the summary period dropdown until backend is deployed.
                <Flex
                  justifyContent="flex-start"
                  alignItems="center"
                  pt={0}
                  sx={{ gap: 3 }}
                  flexShrink={0}
                >
                  <Flex
                  alignItems="center"
                  color="grays.4"
                  py={1}
                  pl={[0, 0, 3]}
                  sx={{ borderLeft: ['none', null, borders.divider] }}
                >
                  <Text fontSize={0}>{t('View data from')}</Text>
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
                    fontSize={0}
                    lineHeight={1.3}
                  >
                    {find(summaryPeriodOptions, { value: summaryPeriod }).label}
                  </Button>
                </Box>

                <Popover
                  minWidth="11em"
                  closeIcon
                  {...bindPopover(summaryPeriodPopupFilterState)}
                  onClickCloseIcon={() => {
                    trackMetric(prefixPopHealthMetric('Summary period filter close'), { clinicId: selectedClinicId });
                  }}
                  onClose={() => {
                    summaryPeriodPopupFilterState.close();
                    setPendingSummaryPeriod(summaryPeriod);
                  }}
                >
                  <DialogContent px={2} py={3} dividers>
                    <RadioGroup
                      id="summary-period-filters"
                      name="summary-period-filters"
                      options={summaryPeriodOptions}
                      variant="vertical"
                      fontSize={0}
                      value={pendingSummaryPeriod || summaryPeriod}
                      onChange={event => setPendingSummaryPeriod(event.target.value)}
                    />
                  </DialogContent>

                  <DialogActions justifyContent="space-between" p={1}>
                    <Button
                      id="cancel-summary-period-filter"
                      fontSize={1}
                      variant="textSecondary"
                      onClick={() => {
                        trackMetric(prefixPopHealthMetric('Summary period filter cancel'), { clinicId: selectedClinicId });
                        setPendingSummaryPeriod(summaryPeriod);
                        summaryPeriodPopupFilterState.close();
                      }}
                    >
                      {t('Cancel')}
                    </Button>

                    <Button
                      id="apply-summary-period-filter"
                      fontSize={1}
                      variant="textPrimary"
                      disabled={pendingSummaryPeriod === summaryPeriod}
                      onClick={() => {
                        const dateRange = find(summaryPeriodOptions, { value: pendingSummaryPeriod }).label;

                        trackMetric(prefixPopHealthMetric('Summary period apply filter'), {
                          clinicId: selectedClinicId,
                          dateRange,
                        });

                        setSummaryPeriod(pendingSummaryPeriod);
                        summaryPeriodPopupFilterState.close();
                      }}
                    >
                      {t('Apply')}
                    </Button>
                  </DialogActions>
                </Popover>
              </Flex>
            )}

            {/* Info/Visibility Icons */}
            <Flex
              alignItems="center"
              justifyContent="flex-end"
              flexGrow={1}
              flexShrink={0}
              sx={{ gap: 2 }}
            >
              {showSummaryData && showNames && (
                <>
                  <PopoverLabel
                    id="patient-fetch-time-ago"
                    icon={RefreshRoundedIcon}
                    iconLabel={t('Refresh patients list')}
                    iconProps={{
                      color: fetchingPatientsForClinic.inProgress ? 'text.primaryDisabled' : 'inherit',
                      disabled: fetchingPatientsForClinic.inProgress,
                      iconFontSize: '18px',
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

                  <PopoverLabel
                    id="summary-stat-info"
                    iconLabel={t('Summary stat info')}
                    icon={InfoOutlinedIcon}
                    iconProps={{
                      id: 'summary-stat-info-trigger',
                      iconFontSize: '18px',
                    }}
                    popoverContent={renderInfoPopover()}
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
                color="grays.4"
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
      <Text fontSize={1} py={4} mb={4} textAlign="center" sx={{ a: { color: 'text.link', cursor: 'pointer' } }}>
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
                    }}
                    fontSize="12px"
                    maxLength={20}
                    placeholder={t('Add a new tag...')}
                    description={t('You can add up to 10 tags per clinic')}
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
  }, [
    api,
    creatingClinicCustodialAccount.inProgress,
    handleAddPatientConfirm,
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
          <PatientForm api={api} trackMetric={trackMetric} onFormChange={handlePatientFormChange} patient={selectedPatient} />
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
            disabled={!fieldsAreValid(keys(patientFormContext?.values), validationSchema, patientFormContext?.values)}
          >
            {t('Save Changes')}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }, [
    api,
    handleEditPatientConfirm,
    patientFormContext?.values,
    selectedClinicId,
    selectedPatient,
    showEditPatientDialog,
    t,
    trackMetric,
    updatingClinicPatient.inProgress
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
        <Box variant="containers.extraSmall" mb={0} width={['100%', '100%']}>
          <DialogTitle
            divider={false}
            onClose={() => {
              trackMetric(prefixPopHealthMetric('Edit clinic tags close'), { clinicId: selectedClinicId });
              handleCloseOverlays();
            }}
          >
            <Body1 fontWeight="medium">{t('Available Patient Tags')}</Body1>
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
                      }}
                      disabled={clinic?.patientTags?.length >= 10}
                      fontSize="12px"
                      maxLength={20}
                      placeholder={t('Add a new tag...')}
                      description={t('You can add up to 10 tags per clinic')}
                      captionProps={{ mt: 0, fontSize: '10px', color: colors.grays[4] }}
                      variant="condensed"
                      {...getCommonFormikFieldProps('name', patientTagFormikContext)}
                    />

                    <Button
                      disabled={!patientTagFormikContext.values.name.trim().length || clinic?.patientTags?.length >= 10 || !patientTagFormikContext.isValid}
                      type="submit"
                      height="24px"
                      alignSelf="flex-start"
                    >
                      {t('Add')}
                    </Button>
                  </Flex>
                </Form>
              )}
            </Formik>

            <Text mb={2} color="text.primary" fontWeight="medium" fontSize={0}>
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
          <Flex alignItems="center" mb={3} fontSize={1} fontWeight="medium">
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
                alignItems="center"
                sx={{ gap: 2 }}
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
                <Flex as="label" htmlFor={`range-${value}-filter`} alignItems="center">
                  <Text fontSize={1} mr={2}>
                    {prefix}{' '}
                    <Text as="span" fontSize={2} fontWeight="bold">
                      {threshold}
                    </Text>
                    % {t('Time')} {t(bgPrefix)}{' '}
                    <Text as="span" fontSize={2} fontWeight="bold">
                      {glucoseTargetValue}
                    </Text>{' '}
                    {suffix}
                  </Text>
                  <Pill
                    label={tag}
                    fontSize="12px"
                    fontWeight="normal"
                    py="2px"
                    sx={{ borderRadius: radii.input, textTransform: 'none' }}
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
            fontSize={0}
            onClick={() => {
              trackMetric(prefixPopHealthMetric('Time in range unselect all'), { clinicId: selectedClinicId });
              setPendingFilters({ ...pendingFilters, timeInRange: defaultFilterState.timeInRange });
            }}
          >
            {t('Unselect all')}
          </Button>
        </DialogContent>

        <DialogActions justifyContent="space-between" p={2}>
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

  function handleCloseOverlays() {
    setShowDeleteDialog(false);
    setShowAddPatientDialog(false);
    setShowEditPatientDialog(false);
    setShowClinicPatientTagsDialog(false);
    setShowTimeInRangeDialog(false);
    setShowSendUploadReminderDialog(false);

    setTimeout(() => {
      setSelectedPatient(null);
    });
  }

  const renderPatient = useCallback(patient => (
    <Box onClick={handleClickPatient(patient)} sx={{ cursor: 'pointer' }}>
      <Text fontSize={[1, null, 0]} fontWeight="medium">{patient.fullName}</Text>
      {patient.email && <Text fontSize={[0, null, '10px']}>{patient.email}</Text>}
    </Box>
  ), [handleClickPatient]);

  const renderPatientSecondaryInfo = useCallback(patient => (
    <Box classname="patient-secondary-info" onClick={handleClickPatient(patient)} fontSize={[0, null, '10px']} sx={{ cursor: 'pointer' }}>
      <Text sx={{ whiteSpace: 'nowrap' }}>{t('DOB:')} {patient.birthDate}</Text>
      {patient.mrn && <Text sx={{ whiteSpace: 'nowrap' }}>{t('MRN: {{mrn}}', { mrn: patient.mrn })}</Text>}
    </Box>
  ), [handleClickPatient, t]);

  const renderLastUploadDate = useCallback(({ summary }) => {
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
  }, [t, timePrefs]);

  const renderCGMUsage = useCallback(({ summary }) => (
    <Box classname="patient-cgm-usage">
      <Text as="span" fontWeight="medium">{summary?.periods?.[summaryPeriod]?.timeCGMUsePercent ? formatDecimal(summary?.periods?.[summaryPeriod]?.timeCGMUsePercent * 100) : statEmptyText}</Text>
      {summary?.periods?.[summaryPeriod]?.timeCGMUsePercent && <Text as="span" fontSize="10px"> %</Text>}
    </Box>
  ), [summaryPeriod]);

  const renderGMI = useCallback(({ summary }) => (
    <Box classname="patient-gmi">
      <Text as="span" fontWeight="medium">{summary?.periods?.[summaryPeriod]?.timeCGMUsePercent >= 0.7 ? formatDecimal(summary.periods[summaryPeriod].glucoseManagementIndicator, 1) : statEmptyText}</Text>
      {summary?.periods?.[summaryPeriod]?.timeCGMUsePercent >= 0.7 && <Text as="span" fontSize="10px"> %</Text>}
    </Box>
  ), [summaryPeriod]);

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
      summary={summary}
      clinicBgUnits={clinicBgUnits}
      summaryPeriod={summaryPeriod}
      t={t} />
  }, [clinicBgUnits, summaryPeriod, t]);

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

  const renderLinkedField = useCallback((field, patient) => (
      <Box
        classname={`patient-${field}`}
        onClick={handleClickPatient(patient)}
        sx={{ cursor: 'pointer' }}
      >
        <Text fontWeight="medium">{patient[field]}</Text>
      </Box>
    ), [handleClickPatient]);

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
        render: renderPatient,
        className: showSummaryData ? 'no-margin' : null,
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
    if (showSummaryData) {
      cols.splice(1, 2,
        ...[
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
            field: `summary.periods.${summaryPeriod}.timeCGMUsePercent`,
            sortable: true,
            sortBy: `summary.periods.${summaryPeriod}.timeCGMUsePercent`,
            align: 'center',
            render: renderCGMUsage,
          },
          {
            title: t('% GMI'),
            field: `summary.periods.${summaryPeriod}.glucoseManagementIndicator`,
            align: 'center',
            sortable: true,
            sortBy: `summary.periods.${summaryPeriod}.glucoseManagementIndicator`,
            render: renderGMI,
          },
          {
            title: t('Patient Tags'),
            field: 'tags',
            align: 'left',
            render: renderPatientTags,
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
        ]
      );
    }
    return cols;
  }, [
    renderBgRangeSummary,
    renderCGMUsage,
    renderGMI,
    renderLastUploadDate,
    renderLinkedField,
    renderMore,
    renderPatient,
    renderPatientSecondaryInfo,
    renderPatientTags,
    showSummaryData,
    summaryPeriod,
    t,
  ]);

  const data = useMemo(() => values(clinic?.patients), [clinic?.patients]);
  const tableStyle = useMemo(() => ({ fontSize: showSummaryData ? '12px' : '14px' }), [showSummaryData]);

  const renderPeopleTable = useCallback(() => {
    const pageCount = Math.ceil(clinic?.patientCount / patientFetchOptions.limit);
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
          style={tableStyle}
          onSort={handleSortChange}
          order={sort.substring(0, 1) === '+' ? 'asc' : 'desc'}
          orderBy={sort.substring(1)}
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
  }, [
    clinic?.patientCount,
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

export default translate()(ClinicPatients);
