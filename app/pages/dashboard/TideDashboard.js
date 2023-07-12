import React, { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { push } from 'connected-react-router';
import { translate } from 'react-i18next';
import find from 'lodash/find';
import get from 'lodash/get';
import includes from 'lodash/includes';
import isEqual from 'lodash/isEqual';
import keys from 'lodash/keys';
import keyBy from 'lodash/keyBy';
import map from 'lodash/map';
import reject from 'lodash/reject';
import { Box, Flex, Text } from 'rebass/styled-components';
import ArrowUpwardIcon from '@material-ui/icons/ArrowUpward';
import MoreVertRoundedIcon from '@material-ui/icons/MoreVertRounded';
import KeyboardArrowDownRoundedIcon from '@material-ui/icons/KeyboardArrowDownRounded';
import EditIcon from '@material-ui/icons/EditRounded';
import { components as vizComponents, utils as vizUtils } from '@tidepool/viz';
import ScrollToTop from 'react-scroll-to-top';
import styled from 'styled-components';
import { useFlags, useLDClient } from 'launchdarkly-react-client-sdk';

import {
  bindPopover,
  bindTrigger,
  usePopupState,
} from 'material-ui-popup-state/hooks';

import {
  MediumTitle,
  Title,
} from '../../components/elements/FontStyles';

import Button from '../../components/elements/Button';
import Table from '../../components/elements/Table';
import { TagList } from '../../components/elements/Tag';
import PatientForm from '../../components/clinic/PatientForm';
import TideDashboardConfigForm from '../../components/clinic/TideDashboardConfigForm';
import BgSummaryCell from '../../components/clinic/BgSummaryCell';
import Popover from '../../components/elements/Popover';
import PopoverMenu from '../../components/elements/PopoverMenu';
import RadioGroup from '../../components/elements/RadioGroup';
import DeltaBar from '../../components/elements/DeltaBar';
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
} from '../../core/clinicUtils';

import { MGDL_UNITS } from '../../core/constants';
import { colors, radii } from '../../themes/baseTheme';

const { Loader } = vizComponents;
const { formatBgValue } = vizUtils.bg;
const { formatDateRange } = vizUtils.datetime;

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
    id: `edit-${patient.id}`,
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

  return <PopoverMenu id={`action-menu-${patient.id}`} items={items} icon={MoreVertRoundedIcon} />;
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
        flexShrink={0}
      >
        <Button
          variant="textSecondary"
          id={`${id}-popup-trigger`}
          selected={sortPopupFilterState.isOpen}
          {...bindTrigger(sortPopupFilterState)}
          icon={KeyboardArrowDownRoundedIcon}
          iconLabel="Update sort order"
          fontSize={0}
          fontWeight="medium"
          lineHeight={1.3}
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
    clinicBgUnits,
    config,
    dispatch,
    patients,
    patientTags,
    section,
    sections,
    selectedClinicId,
    setSections,
    setSelectedPatient,
    setShowEditPatientDialog,
    t,
    trackMetric,
  } = props;

  const statEmptyText = '--';

  const handleClickPatient = useCallback(patient => {
    return () => {
      trackMetric('Selected PwD');
      dispatch(push(`/patients/${patient.id}/data`));
    }
  }, [dispatch, trackMetric]);

  const renderPatientName = useCallback(({ patient }) => (
    <Box onClick={handleClickPatient(patient)} sx={{ cursor: 'pointer' }}>
      <Text fontSize={[1, null, 0]} fontWeight="medium"  sx={{
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}>
        {patient.fullName}
      </Text>
    </Box>
  ), [handleClickPatient]);

  const renderAverageGlucose = useCallback(summary => {
    const averageGlucose = summary?.averageGlucose;
    const bgPrefs = { bgUnits: clinicBgUnits };

    const formattedAverageGlucose = clinicBgUnits === averageGlucose?.units
      ? formatBgValue(averageGlucose?.value, bgPrefs)
      : formatBgValue(utils.translateBg(averageGlucose?.value, clinicBgUnits), bgPrefs);

    return averageGlucose ? (
      <Box className="patient-average-glucose">
        <Text as="span" fontWeight="medium">{formattedAverageGlucose}</Text>
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
        <Text as="span" fontWeight="medium">{formattedGMI}</Text>
        {formattedGMI !== statEmptyText && <Text as="span" fontSize="10px"> %</Text>}
      </Box>
    );
  }, [config?.period]);

  const renderTimeInPercent = useCallback((summaryKey, summary) => {
    const formattingKeyMap = {
      timeCGMUsePercent: 'target',
      timeInVeryLowPercent: 'veryLow',
      timeInLowPercent: 'low',
      timeInTargetPercent: 'target',
    }

    const rawValue = (summary?.[summaryKey]);
    let formattedValue = rawValue ? utils.customRoundedPercentage(rawValue, formattingKeyMap[summaryKey]) : statEmptyText;

    return (
      <Box classname={`patient-${summaryKey}`}>
        <Text as="span" fontWeight="medium">{formattedValue}</Text>
        {formattedValue !== statEmptyText && <Text as="span" fontSize="10px"> %</Text>}
      </Box>
    );
  }, []);

  const renderPatientTags = useCallback(({ patient }) => {
    const filteredPatientTags = reject(patient?.tags || [], tagId => !patientTags[tagId]);

    return (
      <TagList
          maxCharactersVisible={12}
          popupId={`tags-overflow-${patient?.id}`}
          tagProps={{ variant: 'compact' }}
          tags={map(filteredPatientTags, tagId => patientTags?.[tagId])}
      />
    );
  }, [patientTags]);

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
      <DeltaBar fontWeight="medium" delta={timeInTargetPercentDelta * 100} max={30} />
    ) : (
      <Text as="span" fontWeight="medium">{statEmptyText}</Text>
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

  const veryLowGlucoseThreshold = clinicBgUnits === MGDL_UNITS
    ? utils.translateBg(config?.veryLowGlucoseThreshold, MGDL_UNITS)
    : utils.formatDecimal(config?.veryLowGlucoseThreshold, 1);

  const lowGlucoseThreshold = clinicBgUnits === MGDL_UNITS
    ? utils.translateBg(config?.lowGlucoseThreshold, MGDL_UNITS)
    : utils.formatDecimal(config?.lowGlucoseThreshold, 1);

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
        field: 'averageGlucose',
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
        title: t(`Time below ${veryLowGlucoseThreshold}`),
        field: 'timeInVeryLowPercent',
        align: 'center',
        render: renderTimeInPercent.bind(null, 'timeInVeryLowPercent'),
      },
      {
        title: t(`Time below ${lowGlucoseThreshold}`),
        field: 'timeInLowPercent',
        align: 'center',
        render: renderTimeInPercent.bind(null, 'timeInLowPercent'),
      },
      {
        title: t('Time in Range'),
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

    return cols;
  }, [
    lowGlucoseThreshold,
    renderAverageGlucose,
    renderBgRangeSummary,
    renderGMI,
    renderMore,
    renderPatientName,
    renderPatientTags,
    renderTimeInPercent,
    renderTimeInTargetPercentDelta,
    t,
    veryLowGlucoseThreshold,
  ]);

  const sectionLabelsMap = {
    timeInVeryLowPercent: t('> 1% below {{veryLowGlucoseThreshold}} {{clinicBgUnits}}', {
      veryLowGlucoseThreshold,
      clinicBgUnits,
    }),
    timeInLowPercent: t('> 4% below {{lowGlucoseThreshold}} {{clinicBgUnits}}', {
      lowGlucoseThreshold,
      clinicBgUnits,
    }),
    dropInTimeInTargetPercent: t('Drop in Time in Range > 15%'),
    timeInTargetPercent: t('Time in Range < 70%'),
    timeCGMUsePercent: t('CGM Wear Time < 70%'),
    meetingTargets: t('Meeting Targets'),
  };

  return (
    <Box id={`dashboard-section-${section.groupKey}`} mb={4}>
      <Flex justifyContent="space-between" alignItems="center">
        <Text
          color="purples.9"
          fontSize={1}
          fontWeight="medium"
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
        id={`dashboard-table-${section}`}
        variant="tableGroup"
        label={'peopletablelabel'}
        columns={columns}
        data={patients}
        style={{ fontSize: '12px' }}
        order={section.sortDirection}
        orderBy={section.sortKey}
      />
    </Box>
  );
}, ((prevProps, nextProps) => (prevProps.section.sortDirection === nextProps.section.sortDirection)));

export const TideDashboard = (props) => {
  const { t, api, trackMetric } = props;
  const isFirstRender = useIsFirstRender();
  const dispatch = useDispatch();
  const { set: setToast } = useToasts();
  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);
  const loggedInUserId = useSelector((state) => state.blip.loggedInUserId);
  const clinic = useSelector(state => state.blip.clinics?.[selectedClinicId]);
  const { config, results: patientGroups } = useSelector((state) => state.blip.tideDashboardPatients);
  const [showTideDashboardConfigDialog, setShowTideDashboardConfigDialog] = useState(false);
  const [showEditPatientDialog, setShowEditPatientDialog] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState(null);
  const [loading, setLoading] = useState(false);
  const [patientFormContext, setPatientFormContext] = useState();
  const [tideDashboardFormContext, setTideDashboardFormContext] = useState();
  const [clinicBgUnits, setClinicBgUnits] = useState(MGDL_UNITS);
  const [localConfig] = useLocalStorage('tideDashboardConfig', {});
  const localConfigKey = [loggedInUserId, selectedClinicId].join('|');
  const patientTags = useMemo(() => keyBy(clinic?.patientTags, 'id'), [clinic?.patientTags]);
  const { showTideDashboard } = useFlags();
  const ldClient = useLDClient();
  const ldContext = ldClient.getContext();

  const {
    fetchingPatientFromClinic,
    updatingClinicPatient,
    fetchingTideDashboardPatients,
  } = useSelector((state) => state.blip.working);

  const previousUpdatingClinicPatient = usePrevious(updatingClinicPatient);
  const previousFetchingTideDashboardPatients = usePrevious(fetchingTideDashboardPatients);

  const defaultSections = [
    { groupKey: 'timeInVeryLowPercent', sortDirection: 'desc', sortKey: 'timeInVeryLowPercent' },
    { groupKey: 'timeInLowPercent', sortDirection: 'desc', sortKey: 'timeInLowPercent' },
    { groupKey: 'dropInTimeInTargetPercent', sortDirection: 'asc', sortKey: 'timeInTargetPercentDelta' },
    { groupKey: 'timeInTargetPercent', sortDirection: 'asc', sortKey: 'timeInTargetPercent' },
    { groupKey: 'timeCGMUsePercent', sortDirection: 'asc', sortKey: 'timeCGMUsePercent' },
    { groupKey: 'meetingTargets', sortDirection: 'desc', sortKey: 'timeInVeryLowPercent' },
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

  const fetchDashboardPatients = useCallback((config) => {
    const options = config || localConfig?.[localConfigKey];
    if (options) {
      options.mockData = true; // TODO: delete temp mocked data response
      setLoading(true);
      dispatch(actions.async.fetchTideDashboardPatients(api, selectedClinicId, options));
    }
  }, [api, dispatch, localConfig, localConfigKey, selectedClinicId])

  useEffect(() => {
    setClinicBgUnits((clinic?.preferredBgUnits || MGDL_UNITS));
  }, [clinic]);

  useEffect(() => {
    const tier = ldContext?.clinic?.tier;

    if (tier && (!showTideDashboard || tier < 'tier0300')) {
      dispatch(push('/clinic-workspace'));
    }
  }, [ldContext, showTideDashboard, dispatch]);

  useEffect(() => {
    handleAsyncResult({ ...fetchingTideDashboardPatients, prevInProgress: previousFetchingTideDashboardPatients?.inProgress }, null, handleCloseOverlays);
  }, [fetchingTideDashboardPatients, handleAsyncResult, previousFetchingTideDashboardPatients?.inProgress]);

  function handlePatientFormChange(formikContext) {
    setPatientFormContext({...formikContext});
  }

  useEffect(() => {
    if (localConfig?.[localConfigKey]) {
      fetchDashboardPatients();
    } else {
      setShowTideDashboardConfigDialog(true);
    }
  }, []);

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
    trackMetric('Clinic - Show Tide Dashboard config dialog confirmed', { clinicId: selectedClinicId });
    tideDashboardFormContext?.handleSubmit();
    fetchDashboardPatients(tideDashboardFormContext?.values);
  }, [fetchDashboardPatients, tideDashboardFormContext, selectedClinicId, trackMetric]);

  function handleTideDashboardConfigFormChange(formikContext) {
    setTideDashboardFormContext({...formikContext});
  }

  const renderHeader = () => (
    <Flex
      mb={3}
      justifyContent="space-between"
      alignItems="center"
      flexWrap="wrap"
      sx={{ rowGap: 2, columnGap: 3 }}
    >
      <Flex sx={{ gap: 3 }}>
        <Title fontWeight="medium" fontSize="18px">{t('TIDE Dashboard')}</Title>

        <Text
          as={Flex}
          fontSize={0}
          fontWeight="medium"
          height="24px"
          bg="white"
          color={loading ? 'white' : 'text.primary'}
          alignContent="center"
          flexWrap="wrap"
          px={2}
          sx={{ borderRadius: radii.medium }}
        >
          {formatDateRange(config?.lastUploadDateFrom, config?.lastUploadDateTo, null, 'MMMM')}
        </Text>
      </Flex>

      <Button
        variant="filter"
        icon={KeyboardArrowDownRoundedIcon}
        iconLabel="Open dashboard config"
        onClick={handleConfigureTideDashboard}
        fontSize={1}
        lineHeight={5}
        px={3}
        sx= {{ border: 'none' }}
      >
          {t('Filter Patients')}
      </Button>
    </Flex>
  )

  const renderTideDashboardConfigDialog = useCallback(() => {
    return (
      <Dialog
        id="addPatient"
        aria-labelledby="dialog-title"
        open={showTideDashboardConfigDialog}
        onClose={handleCloseOverlays}
        maxWidth="sm"
      >
        <DialogTitle onClose={handleCloseOverlays}>
          <MediumTitle fontSize={2} id="dialog-title">{t('Add patients from your clinic to view in your TIDE Dashboard')}</MediumTitle>
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

  function handleCloseOverlays() {
    setShowTideDashboardConfigDialog(false);
    setShowEditPatientDialog(false);

    setTimeout(() => {
      setSelectedPatient(null);
    });
  }

  const renderPatientGroups = useCallback(() => {
    const sectionProps = {
      clinicBgUnits,
      config,
      dispatch,
      patientTags,
      sections,
      selectedClinicId,
      setSections,
      setSelectedPatient,
      setShowEditPatientDialog,
      t,
      trackMetric,
    };

    return (
      <Box id="tide-dashboard-patient-groups">
        {map(sections, section => (
          <TideDashboardSection
            key={section.groupKey}
            section={section}
            patients={patientGroups[section.groupKey]}
            {...sectionProps}
          />
        ))}
      </Box>
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
    t,
    trackMetric,
  ]);

  return (
    <Box
      id="tide-dashboard"
      alignItems="center"
      variant="containers.large"
      bg="transparent"
      minHeight="80vh"
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

export default translate()(TideDashboard);
