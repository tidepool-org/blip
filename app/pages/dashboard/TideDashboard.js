import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { push } from 'connected-react-router';
import { withTranslation, Trans } from 'react-i18next';
import moment from 'moment-timezone';
import compact from 'lodash/compact';
import each from 'lodash/each';
import find from 'lodash/find';
import flatten from 'lodash/flatten';
import get from 'lodash/get';
import includes from 'lodash/includes';
import isEqual from 'lodash/isEqual';
import isFinite from 'lodash/isFinite';
import keys from 'lodash/keys';
import keyBy from 'lodash/keyBy';
import map from 'lodash/map';
import reject from 'lodash/reject';
import values from 'lodash/values';
import { Box, Flex, Text } from 'theme-ui';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import ErrorRoundedIcon from '@material-ui/icons/ErrorRounded';
import MoreVertRoundedIcon from '@material-ui/icons/MoreVertRounded';
import KeyboardArrowDownRoundedIcon from '@material-ui/icons/KeyboardArrowDownRounded';
import EditIcon from '@material-ui/icons/EditRounded';
import { components as vizComponents, utils as vizUtils } from '@tidepool/viz';
import ScrollToTop from 'react-scroll-to-top';
import styled from '@emotion/styled';
import { useFlags, useLDClient } from 'launchdarkly-react-client-sdk';

import {
  bindPopover,
  bindTrigger,
  usePopupState,
} from 'material-ui-popup-state/hooks';

import {
  MediumTitle,
  Title,
  Body1,
} from '../../components/elements/FontStyles';

import Button from '../../components/elements/Button';
import HoverButton from '../../components/elements/HoverButton';
import Table from '../../components/elements/Table';
import { TagList } from '../../components/elements/Tag';
import PatientForm from '../../components/clinic/PatientForm';
import TideDashboardConfigForm, { validateTideConfig } from '../../components/clinic/TideDashboardConfigForm';
import BgSummaryCell from '../../components/clinic/BgSummaryCell';
import Popover from '../../components/elements/Popover';
import PopoverMenu from '../../components/elements/PopoverMenu';
import RadioGroup from '../../components/elements/RadioGroup';
import DeltaBar from '../../components/elements/DeltaBar';
import Pill from '../../components/elements/Pill';
import utils from '../../core/utils';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '../../components/elements/Dialog';

import * as actions from '../../redux/actions';
import { useToasts } from '../../providers/ToastProvider';
import { useIsFirstRender, useLocalStorage, usePrevious } from '../../core/hooks';
import { fieldsAreValid } from '../../core/forms';

import {
  patientSchema as validationSchema,
  tideDashboardConfigSchema,
  lastDataFilterOptions,
  summaryPeriodOptions,
} from '../../core/clinicUtils';

import { DEFAULT_FILTER_THRESHOLDS, MGDL_UNITS, MMOLL_UNITS } from '../../core/constants';
import { colors, fontWeights, radii } from '../../themes/baseTheme';
import PatientLastReviewed from '../../components/clinic/PatientLastReviewed';

const { Loader } = vizComponents;
const { formatBgValue } = vizUtils.bg;

const {
  formatDateRange,
  getLocalizedCeiling,
  getOffset,
  getTimezoneFromTimePrefs
} = vizUtils.datetime;

const StyledScrollToTop = styled(ScrollToTop)`
  background-color: ${colors.purpleMedium};
  right: 20px;
  bottom: 70px;
  border-radius: 20px;
  padding-top: 4px;
`;

const prefixTideDashboardMetric = metric => `Clinic - Tide Dashboard - ${metric}`;

const editPatient = (patient, setSelectedPatient, selectedClinicId, trackMetric, setShowEditPatientDialog, source) => {
  trackMetric('Clinic - Edit patient', { clinicId: selectedClinicId, source });
  setSelectedPatient(patient);
  setShowEditPatientDialog(true);
};

const MoreMenu = React.memo(({
  patient,
  selectedClinicId,
  t,
  trackMetric,
  setSelectedPatient,
  setShowEditPatientDialog,
}) => {
  const handleEditPatient = useCallback(() => {
    editPatient(patient, setSelectedPatient, selectedClinicId, trackMetric, setShowEditPatientDialog, 'action menu');
  }, [patient, setSelectedPatient, selectedClinicId, trackMetric, setShowEditPatientDialog]);

  const items = useMemo(() => ([{
    icon: EditIcon,
    iconLabel: t('Edit Patient Information'),
    iconPosition: 'left',
    id: `edit-${patient?.id}`,
    variant: 'actionListItem',
    onClick: (_popupState) => {
      _popupState.close();
      handleEditPatient(patient);
    },
    text: t('Edit Patient Information'),
  }]), [
    handleEditPatient,
    patient,
    t,
  ]);

  return <PopoverMenu id={`action-menu-${patient?.id}`} items={items} icon={MoreVertRoundedIcon} />;
});

const SortPopover = React.memo(props => {
  const {
    section,
    sections,
    selectedClinicId,
    setSections,
    trackMetric,
    t,
  } = props;

  const id = `sort-${section.groupKey}`;
  const invertSortLabels = section.groupKey === 'dropInTimeInTargetPercent';

  const sortOptions = [
    { value: invertSortLabels ? 'desc' : 'asc', label: t('Low → High') },
    { value: invertSortLabels ? 'asc' : 'desc', label: t('High → Low') },
  ];

  if (invertSortLabels) sortOptions.reverse();

  const sortPopupFilterState = usePopupState({
    variant: 'popover',
    popupId: `${id}-popup`,
  });

  return (
    <Flex>
      <Box
        onClick={() => {
          if (!sortPopupFilterState.isOpen) trackMetric(prefixTideDashboardMetric('Sort popover opened'), { clinicId: selectedClinicId, section: section.groupKey });
        }}
        sx={{ flexShrink: 0 }}
      >
        <Button
          variant="textSecondary"
          id={`${id}-popup-trigger`}
          selected={sortPopupFilterState.isOpen}
          {...bindTrigger(sortPopupFilterState)}
          icon={KeyboardArrowDownRoundedIcon}
          iconLabel="Update sort order"
          sx={{ fontSize: 0, fontWeight: 'medium', lineHeight: 1.3 }}
        >
          {t('Sort')} {find(sortOptions, { value: section.sortDirection })?.label}
        </Button>
      </Box>

      <Popover
        // minWidth="10em"
        closeIcon
        {...bindPopover(sortPopupFilterState)}
        onClickCloseIcon={() => {
          trackMetric(prefixTideDashboardMetric('Sort popover closed'), {
            clinicId: selectedClinicId,
            section: section.groupKey,
          });
        }}
        onClose={() => {
          sortPopupFilterState.close();
        }}
      >
        <DialogContent px={2} py={3} dividers>
          <RadioGroup
            id={`${id}-options`}
            name={`${id}-options`}
            options={sortOptions}
            variant="vertical"
            fontSize={0}
            value={section.sortDirection}
            onChange={event => {
              trackMetric(prefixTideDashboardMetric('Sort popover updated'), {
                clinicId: selectedClinicId,
                section: section.groupKey,
                sort: event.target.value,
              });

              const updatedSections = map(sections, sectionState => (sectionState.groupKey === section.groupKey
                ? {...sectionState, sortDirection: event.target.value}
                : sectionState
              ));

              setSections(updatedSections);
              sortPopupFilterState.close();
            }}
          />
        </DialogContent>
      </Popover>
    </Flex>
  )
})


const TideDashboardSection = React.memo(props => {
  const {
    api,
    clinicBgUnits,
    config,
    dispatch,
    emptyContentNode,
    emptyText,
    patients,
    patientTags,
    section,
    sections,
    selectedClinicId,
    setSections,
    setSelectedPatient,
    setShowEditPatientDialog,
    showTideDashboardLastReviewed,
    t,
    trackMetric,
  } = props;

  const statEmptyText = '--';

  const dexcomConnectStateUI = React.useMemo(() => ({
    noPendingConnections: {
      colorPalette: 'neutral',
      icon: null,
      text: t('No Pending Connections'),
    },
    pending: {
      colorPalette: 'primaryText',
      icon: null,
      text: t('Invite Sent'),
    },
    pendingReconnect: {
      colorPalette: 'primaryText',
      icon: null,
      text: t('Invite Sent'),
    },
    pendingExpired: {
      colorPalette: 'warning',
      icon: ErrorRoundedIcon,
      text: t('Invite Expired'),
    },
    connected: {
      colorPalette: 'primaryText',
      icon: null,
      text: t('Connected'),
    },
    disconnected: {
      colorPalette: 'warning',
      icon: ErrorRoundedIcon,
      text: t('Patient Disconnected'),
    },
    error: {
      colorPalette: 'warning',
      icon: ErrorRoundedIcon,
      text: t('Error Connecting'),
    },
    unknown: {
      colorPalette: 'warning',
      icon: ErrorRoundedIcon,
      text: t('Unknown Status'),
    },
  }), []);

  const handleClickPatient = useCallback(patient => {
    return () => {
      trackMetric('Selected PwD');
      dispatch(push(`/patients/${patient?.id}/data?chart=trends&dashboard=tide`));
    }
  }, [dispatch, trackMetric]);

  const renderPatientName = useCallback(({ patient }) => (
    <Box onClick={handleClickPatient(patient)} sx={{ cursor: 'pointer' }}>
      <Text
        sx={{
          fontSize: [1, null, 0],
          fontWeight: 'medium',
          overflow: 'hidden',
          textOverflow: 'ellipsis',
        }}
      >
        {patient?.fullName}
      </Text>
    </Box>
  ), [handleClickPatient]);

  const renderAverageGlucose = useCallback(summary => {
    const averageGlucose = summary?.averageGlucoseMmol;
    const bgPrefs = { bgUnits: clinicBgUnits };

    const formattedAverageGlucose = clinicBgUnits === MMOLL_UNITS
      ? formatBgValue(averageGlucose, bgPrefs)
      : formatBgValue(utils.translateBg(averageGlucose, clinicBgUnits), bgPrefs);

    return averageGlucose ? (
      <Box className="patient-average-glucose">
        <Text sx={{ fontWeight: 'medium' }}>{formattedAverageGlucose}</Text>
      </Box>
    ) : null;
  }, [clinicBgUnits]);

  const renderGMI = useCallback(summary => {
    const cgmUsePercent = (summary?.timeCGMUsePercent || 0);
    const cgmHours = (summary?.timeCGMUseMinutes || 0) / 60;
    const gmi = summary?.glucoseManagementIndicator;
    const minCgmHours = 24;
    const minCgmPercent = 0.7;
    let formattedGMI = gmi ? utils.formatDecimal(gmi, 1) : statEmptyText;

    if (includes(['1d', '7d'], config?.period)
      || cgmUsePercent < minCgmPercent
      || cgmHours < minCgmHours
    ) formattedGMI = statEmptyText;

    return (
      <Box classname="patient-gmi">
        <Text sx={{ fontWeight: 'medium' }}>{formattedGMI}</Text>
        {formattedGMI !== statEmptyText && <Text sx={{ fontSize: '10px' }}> %</Text>}
      </Box>
    );
  }, [config?.period]);

  const renderTimeInPercent = useCallback((summaryKey, summary) => {
    const formattingKeyMap = {
      timeCGMUsePercent: 'cgmUse',
      timeInAnyLowPercent: 'low',
      timeInLowPercent: 'low',
      timeInVeryLowPercent: 'veryLow',
      timeInTargetPercent: 'target',
    }

    const rawValue = (summary?.[summaryKey]);

    let formattedValue = isFinite(rawValue)
      ? utils.formatThresholdPercentage(rawValue, ...DEFAULT_FILTER_THRESHOLDS[formattingKeyMap[summaryKey]])
      : statEmptyText;

    return (
      <Box classname={`patient-${summaryKey}`}>
        <Text sx={{ fontWeight: 'medium' }}>{formattedValue}</Text>
        {formattedValue !== statEmptyText && <Text sx={{ fontSize: '10px' }}> %</Text>}
      </Box>
    );
  }, []);

  const renderPatientTags = useCallback(({ patient }) => {
    const filteredPatientTags = reject(patient?.tags || [], tagId => !patientTags[tagId]);

    return (
      <TagList
          maxTagsVisible={4}
          maxCharactersVisible={12}
          popupId={`tags-overflow-${patient?.id}`}
          tagProps={{ variant: 'compact' }}
          tags={map(filteredPatientTags, tagId => patientTags?.[tagId])}
      />
    );
  }, [patientTags]);

  const renderLastReviewed = useCallback(({ patient }) => {
    return <PatientLastReviewed api={api} trackMetric={trackMetric} metricSource="TIDE dashboard" patientId={patient.id} recentlyReviewedThresholdDate={moment().startOf('isoWeek').toISOString()} />
  }, [api, trackMetric]);

  const renderBgRangeSummary = useCallback(summary => {
    return <BgSummaryCell
    summary={summary}
    config={config}
    clinicBgUnits={clinicBgUnits}
    activeSummaryPeriod={config?.period}
  />
  }, [clinicBgUnits, config]);

  const renderTimeInTargetPercentDelta = useCallback(summary => {
    const timeInTargetPercentDelta = (summary?.timeInTargetPercentDelta);

    return timeInTargetPercentDelta ? (
      <DeltaBar
        sx={{ fontWeight: 'medium' }}
        delta={timeInTargetPercentDelta * 100}
        max={30}
        threshold={DEFAULT_FILTER_THRESHOLDS.timeInTargetPercentDelta}
      />
    ) : (
      <Text sx={{ fontWeight: 'medium' }}>{statEmptyText}</Text>
    );
  }, []);

  const renderMore = useCallback(({ patient }) => {
    return <MoreMenu
      patient={patient}
      selectedClinicId={selectedClinicId}
      t={t}
      trackMetric={trackMetric}
      setSelectedPatient={setSelectedPatient}
      setShowEditPatientDialog={setShowEditPatientDialog}
      prefixTideDashboardMetric={prefixTideDashboardMetric}
    />;
  }, [
    selectedClinicId,
    t,
    trackMetric,
    setSelectedPatient,
    setShowEditPatientDialog,
  ]);

  const renderDexcomConnectionStatus = useCallback(({ patient }) => {
    const dexcomDataSource = find(patient?.dataSources, { providerName: 'dexcom' });
    let dexcomConnectState;

    if (dexcomDataSource) {
      dexcomConnectState = includes(keys(dexcomConnectStateUI), dexcomDataSource?.state)
        ? dexcomDataSource.state
        : 'unknown';
    } else {
      dexcomConnectState = 'noPendingConnections';
    }

    const showViewButton = includes([
      'disconnected',
      'error',
      'noPendingConnections',
      'pendingExpired',
      'unknown',
    ], dexcomConnectState);

    const StatusBadge = () => (
      <Pill
        className="patient-dexcom-connection-status"
        icon={dexcomConnectStateUI[dexcomConnectState].icon}
        text={dexcomConnectStateUI[dexcomConnectState].text}
        label={t('dexcom connection stauts')}
        colorPalette={dexcomConnectStateUI[dexcomConnectState].colorPalette}
        condensed
      />
    );

    return dexcomConnectState ? (
      <>
      {showViewButton ? (
        <HoverButton
          buttonText={t('View')}
          buttonProps={{
            onClick: () => editPatient(patient, setSelectedPatient, selectedClinicId, trackMetric, setShowEditPatientDialog, 'dexcom connection status'),
            variant: 'textSecondary',
            ml: -2,
            sx: {
              fontSize: 0,
              fontWeight: fontWeights.medium,
              textDecoration: 'underline',
              color: colors.purpleMedium,
              ':hover': {
                color: colors.purpleMedium,
                textDecoration: 'underline',
              }
            }
          }}
        >
          <Box sx={{ whiteSpace: 'nowrap' }}>
            <StatusBadge />
          </Box>
        </HoverButton>
      ) : <StatusBadge />
    }
      </>
    ) : null;
  }, [dexcomConnectStateUI, t]);

  const renderDaysSinceLastData = useCallback(({ daysSinceLastData }) => {
    return daysSinceLastData ? (
      <Box className="patient-dexcom-connection-status">
        <Text sx={{ fontWeight: 'medium' }}>{daysSinceLastData}</Text>
      </Box>
    ) : (
      <Text sx={{ fontWeight: 'medium' }}>-</Text>
    );
  }, []);

  const veryLowGlucoseThreshold = clinicBgUnits === MGDL_UNITS
    ? utils.translateBg(config?.veryLowGlucoseThreshold, MGDL_UNITS)
    : utils.formatDecimal(config?.veryLowGlucoseThreshold, 1);

  const lowGlucoseThreshold = clinicBgUnits === MGDL_UNITS
    ? utils.translateBg(config?.lowGlucoseThreshold, MGDL_UNITS)
    : utils.formatDecimal(config?.lowGlucoseThreshold, 1);

  const highGlucoseThreshold = clinicBgUnits === MGDL_UNITS
    ? utils.translateBg(config?.highGlucoseThreshold, MGDL_UNITS)
    : utils.formatDecimal(config?.highGlucoseThreshold, 1);

  const columns = useMemo(() => {
    const cols = [
      {
        title: t('Patient Name'),
        field: 'patient.fullName',
        align: 'left',
        render: renderPatientName,
        width: 160,
      },
      {
        title: t('Avg. Glucose'),
        field: 'averageGlucoseMmol',
        align: 'center',
        render: renderAverageGlucose,
      },
      {
        title: t('GMI'),
        field: 'glucoseManagementIndicator',
        align: 'center',
        render: renderGMI,
      },
      {
        title: t('CGM Use'),
        field: 'timeCGMUsePercent',
        align: 'center',
        render: renderTimeInPercent.bind(null, 'timeCGMUsePercent'),
      },
      {
        title: t('% Time < {{threshold}}', { threshold: veryLowGlucoseThreshold }),
        field: 'timeInVeryLowPercent',
        align: 'center',
        render: renderTimeInPercent.bind(null, 'timeInVeryLowPercent'),
      },
      {
        title: t('% Time {{lower}}-{{upper}}', { lower: veryLowGlucoseThreshold, upper: lowGlucoseThreshold }),
        field: 'timeInLowPercent',
        align: 'center',
        render: renderTimeInPercent.bind(null, 'timeInLowPercent'),
      },
      {
        title: t('% TIR {{lower}}-{{upper}}', { lower: lowGlucoseThreshold, upper: highGlucoseThreshold }),
        field: 'timeInTargetPercent',
        align: 'center',
        render: renderTimeInPercent.bind(null, 'timeInTargetPercent'),
      },
      {
        title: t('% Time in Range'),
        field: 'bgRangeSummary',
        align: 'center',
        render: renderBgRangeSummary,
        width: 207,
      },
      {
        title: t('% Change in TIR'),
        field: 'timeInTargetPercentDelta',
        align: 'center',
        render: renderTimeInTargetPercentDelta,
        width: 140,
      },
      {
        title: t('Tags'),
        field: 'patient.tags',
        align: 'left',
        render: renderPatientTags,
        width: 170,
      },
      {
        title: '',
        field: 'more',
        render: renderMore,
        align: 'right',
        width: 28,
        className: 'action-menu no-padding',
      },
    ];

    if (showTideDashboardLastReviewed) {
      cols.splice(10, 0, {
        title: t('Last Reviewed'),
        field: 'lastReviewed',
        align: 'left',
        render: renderLastReviewed,
        width: 140,
      })
    }

    if (section.groupKey === 'noData') {
      cols.splice(1, 8, ...[
        {
          title: t('Dexcom Connection Status'),
          field: 'patient.dataSources',
          align: 'left',
          render: renderDexcomConnectionStatus,
        },
        {
          title: t('Days Since Last Data '),
          field: 'lastData',
          align: 'center',
          render: renderDaysSinceLastData,
        },
        {
          field: 'spacer',
          className: 'group-spacer',
        },
      ]);
    }

    return cols;
  }, [
    highGlucoseThreshold,
    lowGlucoseThreshold,
    renderAverageGlucose,
    renderBgRangeSummary,
    renderGMI,
    renderLastReviewed,
    renderMore,
    renderPatientName,
    renderPatientTags,
    renderTimeInPercent,
    renderTimeInTargetPercentDelta,
    showTideDashboardLastReviewed,
    t,
    veryLowGlucoseThreshold,
  ]);

  const sectionLabelsMap = {
    timeInVeryLowPercent: t('Time below {{veryLowGlucoseThreshold}} {{clinicBgUnits}} > 1%', {
      veryLowGlucoseThreshold,
      clinicBgUnits,
    }),
    timeInAnyLowPercent: t('Time below {{lowGlucoseThreshold}} {{clinicBgUnits}} > 4%', {
      lowGlucoseThreshold,
      clinicBgUnits,
    }),
    dropInTimeInTargetPercent: t('Drop in Time in Range > 15%'),
    timeInTargetPercent: t('Time in Range < 70%'),
    timeCGMUsePercent: t('CGM Wear Time < 70%'),
    meetingTargets: t('Meeting Targets'),
    noData: t('Data Issues'),
  };

  return (
    <Box className='dashboard-section' id={`dashboard-section-${section.groupKey}`} mb={4}>
      <Flex sx={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <Text
          className='dashboard-section-label'
          sx={{
            color: 'purples.9',
            fontSize: 1,
            fontWeight: 'medium',
          }}
          mb={2}
        >
          {sectionLabelsMap[section.groupKey]}
        </Text>

        {/* Commenting out sort functionality for now */}
        {/* <SortPopover
          section={section}
          sections={sections}
          selectedClinicId={selectedClinicId}
          setSections={setSections}
          trackMetric={trackMetric}
          t={t}
        /> */}
      </Flex>

      <Table
        className='dashboard-table'
        id={`dashboard-table-${section.groupKey}`}
        variant="tableGroup"
        label={'peopletablelabel'}
        columns={columns}
        data={patients}
        sx={{ fontSize: 0 }}
        order={section.sortDirection}
        orderBy={section.sortKey}
        emptyContentNode={emptyContentNode}
        emptyText={emptyText}
        containerProps={{
          sx: {
            '.table-empty-text': {
              backgroundColor: 'white',
              borderBottomLeftRadius: radii.medium,
              borderBottomRightRadius: radii.medium,
            },
          }
        }}
      />
    </Box>
  );
}, ((prevProps, nextProps) => (
  prevProps.section.sortDirection === nextProps.section.sortDirection &&
  prevProps.config === nextProps.config &&
  prevProps.patients === nextProps.patients
)));

export const TideDashboard = (props) => {
  const { t, api, trackMetric } = props;
  const isFirstRender = useIsFirstRender();
  const dispatch = useDispatch();
  const { set: setToast } = useToasts();
  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);
  const loggedInUserId = useSelector((state) => state.blip.loggedInUserId);
  const currentPatientInViewId = useSelector((state) => state.blip.currentPatientInViewId);
  const clinic = useSelector(state => state.blip.clinics?.[selectedClinicId]);
  const mrnSettings = clinic?.mrnSettings ?? {};
  const { config, results: patientGroups } = useSelector((state) => state.blip.tideDashboardPatients);
  const timePrefs = useSelector((state) => state.blip.timePrefs);
  const [showTideDashboardConfigDialog, setShowTideDashboardConfigDialog] = useState(false);
  const [showEditPatientDialog, setShowEditPatientDialog] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [patientFormContext, setPatientFormContext] = useState();
  const [tideDashboardFormContext, setTideDashboardFormContext] = useState();
  const [clinicBgUnits, setClinicBgUnits] = useState(clinic?.preferredBgUnits || MGDL_UNITS);
  const [localConfig] = useLocalStorage('tideDashboardConfig', {});
  const localConfigKey = [loggedInUserId, selectedClinicId].join('|');
  const patientTags = useMemo(() => keyBy(clinic?.patientTags, 'id'), [clinic?.patientTags]);
  const { showTideDashboard, showTideDashboardLastReviewed } = useFlags();
  const ldClient = useLDClient();
  const ldContext = ldClient.getContext();

  const existingMRNs = useMemo(
    () => compact(map(reject(clinic?.patients, { id: selectedPatient?.id }), 'mrn')),
    [clinic?.patients, selectedPatient?.id]
  );

  const {
    fetchingPatientFromClinic,
    updatingClinicPatient,
    fetchingTideDashboardPatients,
  } = useSelector((state) => state.blip.working);

  const previousUpdatingClinicPatient = usePrevious(updatingClinicPatient);
  const previousFetchingTideDashboardPatients = usePrevious(fetchingTideDashboardPatients);

  const defaultSections = [
    { groupKey: 'timeInVeryLowPercent', sortDirection: 'desc', sortKey: 'timeInVeryLowPercent' },
    { groupKey: 'timeInAnyLowPercent', sortDirection: 'desc', sortKey: 'timeInAnyLowPercent' },
    { groupKey: 'dropInTimeInTargetPercent', sortDirection: 'asc', sortKey: 'timeInTargetPercentDelta' },
    { groupKey: 'timeInTargetPercent', sortDirection: 'asc', sortKey: 'timeInTargetPercent' },
    { groupKey: 'timeCGMUsePercent', sortDirection: 'asc', sortKey: 'timeCGMUsePercent' },
    { groupKey: 'meetingTargets', sortDirection: 'desc', sortKey: 'timeInVeryLowPercent' },
    { groupKey: 'noData', sortDirection: 'desc', sortKey: 'daysSinceLastData' },
  ];

  const [sections, setSections] = useState(defaultSections);

  const handleAsyncResult = useCallback((workingState, successMessage, onComplete = handleCloseOverlays) => {
    const { inProgress, completed, notification, prevInProgress } = workingState;

    if (!isFirstRender && !inProgress && prevInProgress !== false) {
      if (completed) {
        onComplete();
        successMessage && setToast({
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

  // Provide latest patient state for the edit form upon fetch
  useEffect(() => {
    const fetchedClinicPatient = clinic?.patients?.[selectedPatient?.id];
    if (fetchingPatientFromClinic.completed && selectedPatient?.id && fetchedClinicPatient) {
      setSelectedPatient(fetchedClinicPatient);
    }
  }, [fetchingPatientFromClinic, selectedPatient?.id, clinic?.patients]);

  const fetchDashboardPatients = useCallback((config) => {
    const options = { ...(config || localConfig?.[localConfigKey]) };
    if (options) {
      const lastData = Number(options.lastData);
      const queryOptions = { period: options.period, lastData };
      queryOptions['tags'] = reject(options.tags || [], tagId => !patientTags?.[tagId]);
      queryOptions['lastDataCutoff'] = moment(getLocalizedCeiling(new Date().toISOString(), timePrefs)).subtract(lastData, 'days').toISOString();
      setLoading(true);
      dispatch(actions.async.fetchTideDashboardPatients(api, selectedClinicId, queryOptions));
    }
  }, [api, dispatch, localConfig, localConfigKey, selectedClinicId]);

  useEffect(() => {
    dispatch(actions.worker.dataWorkerRemoveDataRequest(null, currentPatientInViewId));
    dispatch(actions.sync.clearPatientInView());
    setClinicBgUnits((clinic?.preferredBgUnits || MGDL_UNITS));
  }, [clinic]);

  useEffect(() => {
    if (clinic) {
      setClinicBgUnits((clinic.preferredBgUnits || MGDL_UNITS));
    }
  }, [
    clinic,
    ldContext,
    ldClient,
    dispatch,
    localConfig,
    localConfigKey,
    showTideDashboard,
    fetchDashboardPatients,
  ]);

  useEffect(() => {
    // Redirect to the workspace if the LD clinic context is set and showTideDashboard flag is false
    // and the clinic does not have the tideDashboard entitlement
    if ((clinic?.entitlements && !clinic.entitlements.tideDashboard) && (ldContext?.clinic?.tier && !showTideDashboard)) dispatch(push('/clinic-workspace'));
  }, [ldContext, showTideDashboard, selectedClinicId, clinic?.entitlements, dispatch]);

  useEffect(() => {
    handleAsyncResult({ ...fetchingTideDashboardPatients, prevInProgress: previousFetchingTideDashboardPatients?.inProgress }, null, handleCloseOverlays);
  }, [fetchingTideDashboardPatients, handleAsyncResult, previousFetchingTideDashboardPatients?.inProgress]);

  function handlePatientFormChange(formikContext) {
    setPatientFormContext({...formikContext});
  }

  useEffect(() => {
    if (validateTideConfig(localConfig?.[localConfigKey], patientTags)) {
      fetchDashboardPatients();
    } else {
      setShowTideDashboardConfigDialog(true);
    }

    // Always clear stored dashboard results upon unmount to avoid flashing stale results upon remount
    return () => {
      dispatch(actions.sync.clearTideDashboardPatients());
    }
  }, [showTideDashboard]);

  const handleEditPatientConfirm = useCallback(() => {
    trackMetric('Clinic - Edit patient confirmed', { clinicId: selectedClinicId });
    const updatedTags = [...(patientFormContext?.values?.tags || [])];
    const existingTags = [...(selectedPatient?.tags || [])];

    if (!isEqual(updatedTags.sort(), existingTags.sort())) {
      trackMetric(prefixTideDashboardMetric('Edit patient tags confirm'), { clinicId: selectedClinicId });
    }
    patientFormContext?.handleSubmit();
  }, [patientFormContext, selectedClinicId, trackMetric, selectedPatient?.tags]);

  function handleConfigureTideDashboard() {
    trackMetric('Clinic - Show Tide Dashboard config dialog', { clinicId: selectedClinicId, source: 'Tide dashboard' });
    setShowTideDashboardConfigDialog(true);
  }

  const handleConfigureTideDashboardConfirm = useCallback(() => {
    trackMetric('Clinic - Show Tide Dashboard config dialog confirmed', { clinicId: selectedClinicId, source: 'Tide dashboard' });
    tideDashboardFormContext?.handleSubmit();
    fetchDashboardPatients(tideDashboardFormContext?.values);
  }, [fetchDashboardPatients, tideDashboardFormContext, selectedClinicId, trackMetric]);

  function handleTideDashboardConfigFormChange(formikContext) {
    setTideDashboardFormContext({...formikContext});
  }

  const renderHeader = () => {
    const periodDaysText = keyBy(summaryPeriodOptions, 'value')?.[config?.period]?.label
    const lastDataDaysText = keyBy(lastDataFilterOptions, 'value')?.[config?.lastData]?.label

    return (
      <Flex
        mb={3}
        sx={{ rowGap: 2, columnGap: 3, justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}
      >
        <Flex sx={{ gap: 3, alignItems: 'center' }}>
          <Title id="tide-dashboard-header" sx={{ fontWeight: 'medium', fontSize: '18px' }}>{t('TIDE Dashboard')}</Title>

          <Flex sx={{ gap: 2, position: 'relative', top: '2px', alignItems: 'center' }}>
            <Text
              sx={{
                fontSize: 0,
                fontWeight: 'medium',
                color: 'text.primaryGrey',
              }}
              ml={2}
            >
              {t('Summarizing')}
            </Text>

            <Text
              id="tide-dashboard-summary-period"
              as={Flex}
              px={3}
              sx={{
                borderRadius: radii.medium,
                alignContent: 'center',
                flexWrap: 'wrap',
                fontSize: 0,
                fontWeight: 'medium',
                height: '24px',
                bg: 'white',
                color: loading ? 'white' : 'text.primary',
              }}
            >
              {periodDaysText} {t('of data')}
            </Text>
          </Flex>

          <Flex sx={{ gap: 2, position: 'relative', top: '2px', alignItems: 'center' }}>
            <Text
              sx={{
                fontSize: 0,
                fontWeight: 'medium',
                color: 'text.primaryGrey',
              }}
              ml={2}
            >
              {t('Data recency')}
            </Text>

            <Text
              id="tide-dashboard-last-data"
              as={Flex}
              px={3}
              sx={{
                borderRadius: radii.medium,
                alignContent: 'center',
                flexWrap: 'wrap',
                fontSize: 0,
                fontWeight: 'medium',
                height: '24px',
                bg: 'white',
                color: loading ? 'white' : 'text.primary',
              }}
            >
              {lastDataDaysText}
            </Text>
          </Flex>
        </Flex>

        <Button
          id="update-dashboard-config"
          variant="filter"
          icon={KeyboardArrowDownRoundedIcon}
          iconLabel="Open dashboard config"
          onClick={handleConfigureTideDashboard}
          px={3}
          sx={{ fontSize: 1, lineHeight: 5, border: 'none' }}
        >
          {t('Filter Patients')}
        </Button>
      </Flex>
    )
  };

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
            {t('Apply')}
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
          <PatientForm api={api} trackMetric={trackMetric} onFormChange={handlePatientFormChange} patient={selectedPatient} action="edit" />
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
    existingMRNs,
    handleEditPatientConfirm,
    mrnSettings,
    patientFormContext?.values,
    selectedClinicId,
    selectedPatient,
    showEditPatientDialog,
    t,
    trackMetric,
    updatingClinicPatient.inProgress
  ]);

  function handleCloseOverlays() {
    setShowTideDashboardConfigDialog(false);
    setShowEditPatientDialog(false);

    setTimeout(() => {
      setSelectedPatient(null);
    });
  }

  const renderPatientGroups = useCallback(() => {
    const sectionProps = {
      api,
      clinicBgUnits,
      config,
      dispatch,
      patientTags,
      sections,
      selectedClinicId,
      setSections,
      setSelectedPatient,
      setShowEditPatientDialog,
      showTideDashboardLastReviewed,
      t,
      trackMetric,
    };

    const hasResults = flatten(values(patientGroups)).length > 0;

    const handleClickClinicWorkspace = () => {
      trackMetric('Clinic - View patient list', {
        clinicId: selectedClinicId,
        source: 'Empty Dashboard Results',
      });

      dispatch(push('/clinic-workspace/patients'));
    };

    each(patientGroups.noData, record => {
      record.daysSinceLastData = moment.utc().diff(record.lastData, 'days');
    })

    return hasResults ? (
      <Box id="tide-dashboard-patient-groups">
        {map(sections, section => (
          <TideDashboardSection
            key={section.groupKey}
            section={section}
            patients={patientGroups[section.groupKey]}
            emptyText={t('There are no patients that match your filter criteria.')}
            {...sectionProps}
          />
        ))}
      </Box>
    ) : (
      <TideDashboardSection
        {...sectionProps}
        section={{}}
        patients={[]}
        emptyContentNode={(
          <Box id="no-tide-results" px={3} py={8} variant="containers.fluidRounded" sx={{ fontSize: 1, color: 'text.primary', textAlign: 'center', a: { color: 'text.link', cursor: 'pointer' } }}>
            <Text mb={3} sx={{ display: 'inline-block', fontWeight: 'bold' }}>
              {t('There are no patients that match your filter criteria.')}
            </Text>

            <Trans i18nKey='html.empty-tide-dashboard-instructions'>
              To make sure your patients are tagged and you have set the correct patient filters, go to your <a className="empty-tide-workspace-link" onClick={handleClickClinicWorkspace}>Clinic Workspace</a>.
            </Trans>
          </Box>
        )}
      />
    );
  }, [
    clinicBgUnits,
    config,
    dispatch,
    patientGroups,
    patientTags,
    sections,
    selectedClinicId,
    setSelectedPatient,
    setShowEditPatientDialog,
    showTideDashboardLastReviewed,
    t,
    trackMetric,
  ]);

  return (
    <Box
      id="tide-dashboard"
      sx={{
        alignItems: 'center',
        bg: 'transparent',
        minHeight: '80vh',
      }}
      variant="containers.large"
      mb={8}
      px={3}
    >
      <Loader show={loading} overlay={!!patientGroups} />
      {renderHeader()}
      {patientGroups && renderPatientGroups()}
      {showTideDashboardConfigDialog && renderTideDashboardConfigDialog()}
      {showEditPatientDialog && renderEditPatientDialog()}

      <StyledScrollToTop
        smooth
        top={600}
        component={<ArrowUpwardIcon />}
      />
    </Box>
  );
};

TideDashboard.propTypes = {
  api: PropTypes.object.isRequired,
  trackMetric: PropTypes.func.isRequired,
  searchDebounceMs: PropTypes.number.isRequired,
};

TideDashboard.defaultProps = {
  searchDebounceMs: 1000,
};

export default withTranslation()(TideDashboard);
