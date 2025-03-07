import _ from 'lodash';
import bows from 'bows';
import PropTypes from 'prop-types';
import React, { useState, useCallback, useEffect } from 'react';
import { Trans, withTranslation } from 'react-i18next';
import { Flex, Box, Text, Divider, Link } from 'theme-ui';
import moment from 'moment-timezone';
import KeyboardArrowDownRoundedIcon from '@material-ui/icons/KeyboardArrowDownRounded';
import DateRangeRoundedIcon from '@material-ui/icons/DateRangeRounded';
import AddRoundedIcon from '@material-ui/icons/AddRounded';
import launchCustomProtocol from 'custom-protocol-detection';
import { DesktopOnly } from '../mediaqueries';
import { MS_IN_DAY } from '../../core/constants';

import {
  bindPopover,
  bindTrigger,
  usePopupState,
} from 'material-ui-popup-state/hooks';

import {
  DialogContent,
  DialogActions,
} from '../../components/elements/Dialog';

import * as viz from '@tidepool/viz';
const PumpSettingsContainer = viz.containers.PumpSettingsContainer;
const deviceName = viz.utils.settings.deviceName;

import Header from './header';
import Button from '../elements/Button';
import Popover from '../elements/Popover';
import RadioGroup from '../../components/elements/RadioGroup';
import { usePrevious } from '../../core/hooks';
import { clinicPatientFromAccountInfo } from '../../core/personutils';
import Icon from '../elements/Icon';
import { useSelector } from 'react-redux';
import DataConnections, { activeProviders } from '../../components/datasources/DataConnections';
import DataConnectionsBanner from '../../components/elements/Card/Banners/DataConnections.png';
import DataConnectionsModal from '../../components/datasources/DataConnectionsModal';
import Card from '../elements/Card';
import { Body1, MediumTitle } from '../elements/FontStyles';
import Uploadlaunchoverlay from '../uploadlaunchoverlay';

const log = bows('Settings View');

function formatDuration(milliseconds) {
  const days = Math.round(milliseconds / (1000 * 60 * 60 * 24));

  if (days === 0) {
    return '<1 day';
  }
  if (days <= 31) {
    return `${days} day${days === 1 ? '' : 's'}`;
  }
  if (days <= 365) {
    const months = Math.floor(days / 30);
    return `>${months} month${months === 1 ? '' : 's'}`;
  }
  const years = Math.floor(days / 365);
  return `>${years} year${years === 1 ? '' : 's'}`;
}

const getLatestDatumTime = (latestDatumByType) => {
  const relevantTypes = ['cbg', 'smbg', 'basal', 'bolus', 'pumpSettings'];
  const timestamps = Object.values(latestDatumByType)
                           .filter(datum => relevantTypes.includes(datum.type))
                           .map(datum => datum.normalTime);

  return _.max(timestamps);
};

const Settings = ({
  chartPrefs,
  data,
  onClickRefresh,
  onClickNoDataRefresh,
  onSwitchToBasics,
  onSwitchToDaily,
  onSwitchToTrends,
  onSwitchToBgLog,
  onClickPrint,
  patient,
  clinicPatient,
  isUserPatient,
  trackMetric,
  updateChartPrefs,
  uploadUrl,
  pdf,
  currentPatientInViewId,
  t
}) => {
  const [atMostRecent, setAtMostRecent] = useState(true);
  const [inTransition, setInTransition] = useState(false);
  const [title, setTitle] = useState('');
  const [pendingDevice, setPendingDevice] = useState(null);
  const [pendingSettings, setPendingSettings] = useState(null);
  const [selectedDevice, setSelectedDevice] = useState(null);
  const [selectedSettingsId, setSelectedSettingsId] = useState(null);
  const [settingsOptions, setSettingsOptions] = useState([]);
  const [devices, setDevices] = useState([]);
  const [groupedData, setGroupedData] = useState([]);
  const previousSelectedDevice = usePrevious(selectedDevice);
  const selectedClinicId = useSelector(state => state.blip.selectedClinicId);
  const isClinicContext = !!selectedClinicId;
  const [showDataConnectionsModal, setShowDataConnectionsModal] = useState(false);
  const [showUploadOverlay, setShowUploadOverlay] = useState(false);
  const dataSources = useSelector(state => state.blip.dataSources);
  const latestDatumByType = useSelector(state => state.blip.data?.metaData?.latestDatumByType);

  const patientData = clinicPatient || {
    ...clinicPatientFromAccountInfo(patient),
    dataSources,
  };

  const deviceSelectionPopupState = usePopupState({
    variant: 'popover',
    popupId: 'deviceSelection'
  });

  const settingsSelectionPopupState = usePopupState({
    variant: 'popover',
    popupId: 'settingsSelection'
  });

  const prefixSettingsMetric = useCallback(metric => `Settings - ${metric}`, []);

  const timezoneName = _.get(data, 'timePrefs.timezoneName', 'UTC');

  useEffect(() => {
    const sortedData = _.sortBy(_.filter(_.cloneDeep(data?.data?.combined), { type: 'pumpSettings' }), 'normalTime');

    let groupedBySource = _.groupBy(sortedData, 'source');

    if (_.has(groupedBySource, 'Unspecified Data Source')) {
      groupedBySource = _.omit(groupedBySource, 'Unspecified Data Source');
    }

    const groupedData = _.mapValues(groupedBySource, (sourceGroup) => {
      const dateGroups = _.groupBy(sourceGroup, (obj) => {
        return moment.utc(obj.normalTime).tz(timezoneName).format('YYYY-MM-DD');
      });

      const filteredDateGroups = _.mapValues(dateGroups, (group) => {
        return _.last(group);
      });

      return _.values(filteredDateGroups);
    });

    _.forEach(groupedData, (group, source) => {
       _.sortBy(group, 'normalTime');
      group.reverse();

      group.forEach((obj, index) => {
        const previousObj = index > 0 ? group[index - 1] : { normalTime: getLatestDatumTime(latestDatumByType) };
        obj.previousNormalTime = previousObj.normalTime;
        obj.elapsedTime = previousObj.normalTime - obj.normalTime;
        obj.durationString = formatDuration(obj.elapsedTime);
      });
    });

    /**
     * array of arrays, each containing a source and its settings objects
     * sorted by most recent settings
     * @type {Array<[string, Array<Object>]>}
     * @example
     * [
     *   ['medtronic', [{settings}, {settings}]],
     *   ['tandem', [{settings}]]
     * ]
     */
    const sortedGroupedData = _.sortBy(_.toPairs(groupedData), (pair) => { return -pair[1][0].normalTime; });

    setGroupedData(sortedGroupedData);

    if (!selectedDevice && sortedGroupedData.length > 0) {
      // find the source with the most recent settings across all sources
      const mostRecentSource = sortedGroupedData[0][0];

      setSelectedDevice(mostRecentSource);
      setSelectedSettingsId(sortedGroupedData[0][1][0].id);
    }

    if(selectedDevice && !selectedSettingsId) {
      setSelectedSettingsId(_.find(sortedGroupedData, { 0: selectedDevice })[1][0].id);
    }

  }, [data, selectedDevice, selectedSettingsId, timezoneName]);

  useEffect(() => {
    setDevices(_.map(groupedData, (group, i) => {
      const source = group[0];
      const serial = group[1][0]?.deviceSerialNumber || '';
      const serialText = serial === 'Unknown' ? '' : `(Serial #: ${serial})`;
      const sourceName = deviceName(_.toLower(source));
      return {
        value: source,
        label: (
          <span>
            <span style={{ fontWeight: 'bold' }}>
              {sourceName}
            </span>
            {serial && (<>
              {' '}
              <span style={{ fontSize: '0.8em', fontWeight: 'normal' }}>
                {serialText}
              </span></>
            )}
          </span>
        ),
      }
    }));
  }, [groupedData]);

  useEffect(() => {
    const selectedDevicePair = _.find(groupedData, { 0: selectedDevice });
    if(selectedDevice && selectedDevicePair) {
      setSettingsOptions(_.map(selectedDevicePair[1], (setting, index) => {
        const isSameDayAsLastUpload = index === 0 && setting.previousNormalTime - setting.normalTime < (MS_IN_DAY / 1000);
        let labelTimeRange;

        if (isSameDayAsLastUpload) {
          labelTimeRange = moment(setting.normalTime).tz(timezoneName).format('MMM DD, YYYY')
                           + ' '
                           + t('(Last Upload Date)');
        } else {
          labelTimeRange = moment(setting.normalTime).tz(timezoneName).format('MMM DD, YYYY')
                           + ' - '
                           + moment(setting.previousNormalTime).tz(timezoneName).format('MMM DD, YYYY')
                           + ' : ';
        }

        return {
          value: setting.id,
          label: (
            <span>
              {labelTimeRange}
              {!isSameDayAsLastUpload &&
                <span style={{ fontWeight: 'bold' }}>
                  Active for {setting.durationString}
                </span>
              }
            </span>
          ),
        };
      }));
    } else {
      setSettingsOptions([]);
    }
  }, [selectedDevice, groupedData, timezoneName]);

  useEffect(() => {
    if(previousSelectedDevice && previousSelectedDevice !== selectedDevice && _.find(groupedData, { 0: selectedDevice })) {
      setSelectedSettingsId(_.find(groupedData, { 0: selectedDevice })[1][0].id);
    }
  }, [groupedData, previousSelectedDevice, selectedDevice]);

  const manufacturer = _.find(groupedData, { 0: selectedDevice })?.[1][0]?.source || '';

  const handleCopySettingsClicked = useCallback(() => {
    trackMetric('Clicked Copy Settings', { source: 'Device Settings' });
  }, [trackMetric]);

  const handleClickTrends = useCallback((e) => {
    if (e) {
      e.preventDefault();
    }
    onSwitchToTrends();
  }, [onSwitchToTrends]);

  const handleClickMostRecent = useCallback((e) => {
    if (e) {
      e.preventDefault();
    }
  }, []);

  const handleClickOneDay = useCallback((e) => {
    if (e) {
      e.preventDefault();
    }
    onSwitchToDaily();
  }, [onSwitchToDaily]);

  const handleClickSettings = useCallback((e) => {
    if (e) {
      e.preventDefault();
    }
  }, []);

  const handleClickPrint = useCallback((e) => {
    if (e) {
      e.preventDefault();
    }
    onClickPrint(pdf);
  }, [onClickPrint, pdf]);

  const handleClickBgLog = useCallback((e) => {
    if (e) {
      e.preventDefault();
    }
    onSwitchToBgLog();
  }, [onSwitchToBgLog]);

  const handleClickDataConnections = function(source) {
    const properties = { patientID: currentPatientInViewId, source };
    if (selectedClinicId) properties.clinicId = selectedClinicId;
    trackMetric('Clicked Settings Add Data Connections', properties);
    setShowDataConnectionsModal(true);
  };

  const toggleSettingsSection = useCallback((deviceKey, scheduleOrProfileKey) => {
    const prefs = _.cloneDeep(chartPrefs);

    if (!prefs.settings[deviceKey]) {
      prefs.settings[deviceKey] = { [scheduleOrProfileKey]: true };
    } else {
      prefs.settings[deviceKey][scheduleOrProfileKey] = !prefs.settings[deviceKey][scheduleOrProfileKey];
    }

    prefs.settings.touched = true;

    updateChartPrefs(prefs, false);
  }, [chartPrefs, updateChartPrefs]);

  const renderDeviceSettingsSelectionUI = () => (
  <Flex
    id="device-settings-selection"
    mt={3}
    mb={5}
    sx={{
      flexWrap: ['wrap', null, null, 'nowrap'],
      gap: 2,
    }}
  >
      <Box
        onClick={() => {
          if (!deviceSelectionPopupState.isOpen)
            trackMetric(prefixSettingsMetric('Device selection open'));
        }}
        sx={{ flexShrink: 0 }}
      >
        <Button
          variant="filter"
          id="device-selection"
          {...bindTrigger(deviceSelectionPopupState)}
          icon={KeyboardArrowDownRoundedIcon}
          iconLabel="Select Device"
          disabled={!devices.length}
          sx={{
            fontSize: 2,
            lineHeight: 1.3,
            fontWeight: 'bold',
            px: 3,
            py: 2,
          }}
        >
          {_.find(devices, { value: selectedDevice })?.label ||
            t('Select Device')}
        </Button>
      </Box>

      <Popover
        minWidth="11em"
        closeIcon
        {...bindPopover(deviceSelectionPopupState)}
        onClickCloseIcon={() => {
          trackMetric(prefixSettingsMetric('Device selection close'));
        }}
        onClose={() => {
          deviceSelectionPopupState.close();
        }}
      >
        <DialogContent px={2} py={3} dividers>
          <RadioGroup
            id="device"
            name="device"
            options={devices}
            variant="vertical"
            sx={{ fontSize: 0 }}
            value={pendingDevice || selectedDevice}
            onChange={(event) => {
              setPendingDevice(event.target.value || null);
            }}
          />
        </DialogContent>

        <DialogActions sx={{ justifyContent: 'space-between' }} p={1}>
          <Button
            id="cancel-device-selection"
            sx={{ fontSize: 1 }}
            variant="textSecondary"
            onClick={() => {
              trackMetric(
                prefixSettingsMetric('Device selection cancel')
              );
              setPendingDevice(null);
              deviceSelectionPopupState.close();
            }}
          >
            {t('Cancel')}
          </Button>

          <Button
            id="apply-device-selection"
            disabled={!pendingDevice}
            sx={{ fontSize: 1 }}
            variant="textPrimary"
            onClick={() => {
              trackMetric(
                prefixSettingsMetric('Device selection apply')
              );
              setSelectedDevice(pendingDevice);
              deviceSelectionPopupState.close();
            }}
          >
            {t('Apply')}
          </Button>
        </DialogActions>
      </Popover>

      <Box sx={{ fontSize: 1, alignSelf: 'center', flexShrink: 0 }}>
        &mdash; View settings from
      </Box>

      <Box
        onClick={() => {
          if (!settingsSelectionPopupState.isOpen)
            trackMetric(
              prefixSettingsMetric('Settings selection open')
            );
        }}
        sx={{ flexShrink: 0, alignItems: 'center' }}
      >
        <Button
          variant="filter"
          id="settings-selection"
          {...bindTrigger(settingsSelectionPopupState)}
          icon={KeyboardArrowDownRoundedIcon}
          iconLabel="Select Settings"
          disabled={!settingsOptions.length}
          sx={{
            fontSize: 1,
            lineHeight: 1.2,
            px: 3,
            py: 2,
          }}
        >
          <Icon
            variant="default"
            sx={{
              mr: 2,
            }}
            label="Select Settings"
            icon={DateRangeRoundedIcon}
          />
          <span style={{ alignSelf: 'end'}}>
            {_.find(settingsOptions, { value: selectedSettingsId })
              ?.label || t('Select Settings')}
          </span>
        </Button>
      </Box>

      <Popover
        minWidth="11em"
        closeIcon
        {...bindPopover(settingsSelectionPopupState)}
        onClickCloseIcon={() => {
          trackMetric(prefixSettingsMetric('Settings selection close'));
        }}
        onClose={() => {
          settingsSelectionPopupState.close();
        }}
      >
        <DialogContent px={2} py={3} dividers>
          <Box sx={{ alignItems: 'center' }} mb={2}>
            <Text
              sx={{
                color: 'grays.4',
                fontWeight: 'medium',
                fontSize: 0,
                whiteSpace: 'nowrap',
              }}
            >
              {t('Past therapy settings')}
            </Text>
          </Box>

          <RadioGroup
            id="settings"
            name="settings"
            options={settingsOptions}
            variant="vertical"
            sx={{ fontSize: 0 }}
            value={pendingSettings || selectedSettingsId}
            onChange={(event) => {
              setPendingSettings(event.target.value || null);
            }}
          />
        </DialogContent>

        <DialogActions sx={{ justifyContent: 'space-between' }} p={1}>
          <Button
            id="cancel-settings-selection"
            sx={{ fontSize: 1 }}
            variant="textSecondary"
            onClick={() => {
              trackMetric(
                prefixSettingsMetric('Settings selection cancel')
              );
              setPendingSettings(null);
              settingsSelectionPopupState.close();
            }}
          >
            {t('Cancel')}
          </Button>

          <Button
            id="apply-settings-selection"
            disabled={!pendingSettings}
            sx={{ fontSize: 1 }}
            variant="textPrimary"
            onClick={() => {
              trackMetric(
                prefixSettingsMetric('Settings selection apply')
              );
              setSelectedSettingsId(pendingSettings);
              settingsSelectionPopupState.close();
            }}
          >
            {t('Apply')}
          </Button>
        </DialogActions>
      </Popover>
    </Flex>
  );

  const renderChart = () => {
    const pumpSettings = _.find(groupedData, { 0: selectedDevice })?.[1];
    const selectedSettings = _.find(pumpSettings, { id: selectedSettingsId });
    const manufacturer = _.toLower(selectedSettings?.source);

    return (
      <PumpSettingsContainer
        currentPatientInViewId={currentPatientInViewId}
        copySettingsClicked={handleCopySettingsClicked}
        bgUnits={_.get(data, 'bgPrefs.bgUnits', {})}
        manufacturerKey={manufacturer}
        toggleSettingsSection={toggleSettingsSection}
        settingsState={_.get(chartPrefs, 'settings')}
        pumpSettings={selectedSettings}
        timePrefs={_.get(data, 'timePrefs', {})}
        view='display'
      />
    );
  };

  const renderMissingSettingsMessage = () => {
    const handleClickUpload = function(e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      const properties = { patientID: currentPatientInViewId };
      if (selectedClinicId) properties.clinicId = selectedClinicId;
      trackMetric('Clicked Partial Data Upload, No Settings', properties);
      setShowUploadOverlay(true);
      launchCustomProtocol('tidepoolupload://open');
    };

    return (
      <Trans i18nKey="html.setting-no-uploaded-data">
        <Body1 sx={{ fontWeight: 'medium' }}>
          This section shows basal rates, carb ratios, sensitivity factors, and more. To see Therapy Settings, <Link
            href={uploadUrl}
            target="_blank"
            rel="noreferrer noopener"
            onClick={handleClickUpload}
          >upload</Link> data from a pump. If you just uploaded try <Link href="" onClick={onClickNoDataRefresh}>refreshing</Link>.
        </Body1>
      </Trans>
    );
  };

  const renderDeviceConnectionCard = () => {
    const cardProps = {
      id: 'data-connections-card',
      title: isUserPatient
        ? t('Connect an Account')
        : t('Connect a Device Account'),
      subtitle: isUserPatient
        ? t('Do you have a Dexcom or FreeStyle Libre device? When you connect a device account, data can flow into Tidepool without any extra effort.')
        : t('Does your patient use a Dexcom or FreeStyle Libre device? Automatically sync data from those devices with the patient\'s permission.'),
      bannerImage: DataConnectionsBanner,
      onClick: handleClickDataConnections.bind(null, 'card'),
      variant: 'containers.cardHorizontal',
    };

    return (
      <Card {...cardProps} />
    );
  };

  const renderDataConnectionsModal = () => (
    <DataConnectionsModal
      open
      patient={clinicPatient || patient}
      onClose={() => setShowDataConnectionsModal(false)}
    />
  );

  const renderDataConnections = () => {
    const shownProviders = _.map(patientData?.dataSources, 'providerName');

    let showAddDevicesButton = false;
    _.each(activeProviders, providerName => {
      if (!_.find(patientData?.dataSources, { providerName })) showAddDevicesButton = true;
    });

    return (
      <Box>
        <Flex mb={3} sx={{ justifyContent: 'space-between', flexWrap: ['wrap', 'nowrap'] }}>
          <DesktopOnly>
            <MediumTitle sx={{ color: 'black' }}>{t('Devices')}</MediumTitle>
          </DesktopOnly>
          {showAddDevicesButton && (
            <Button
              id="add-data-connections"
              variant="primaryCondensed"
              icon={AddRoundedIcon}
              iconPosition="left"
              onClick={handleClickDataConnections.bind(null, 'button')}
              sx={{ fontSize: 1, '.icon': { fontSize: '1.25em' }, flex: ['initial'], width: ['100%', '100%', 'auto'] }}
            >
              {t('Add a Device')}
            </Button>
            )}
        </Flex>

        <DataConnections mb={4} patient={patientData} shownProviders={shownProviders} trackMetric={trackMetric} />
      </Box>
    );
  };

  const renderUploadOverlay = () => (
    <Uploadlaunchoverlay modalDismissHandler={() => setShowUploadOverlay(false)}/>
  );

  return (
    <div id="tidelineMain" className="settings">
      <Box variant="containers.patientData">
        <Header
          chartType="settings"
          patient={patient}
          atMostRecent={atMostRecent}
          inTransition={inTransition}
          title={title}
          onClickMostRecent={handleClickMostRecent}
          onClickBasics={onSwitchToBasics}
          onClickOneDay={handleClickOneDay}
          onClickTrends={handleClickTrends}
          onClickRefresh={onClickRefresh}
          onClickSettings={handleClickSettings}
          onClickBgLog={handleClickBgLog}
          onClickPrint={handleClickPrint}
        />

        <Box variant="containers.patientDataInner">
          <Box className="patient-data-content" variant="containers.patientDataContent">
            <Flex
              sx={{
                flexDirection: 'column',
                justifyContent: ['flex-start', 'space-between'],
                height: ['auto', '100%'],
              }}
            >
              <Box>
                {(isClinicContext || isUserPatient) && (
                  <Box id="data-connections-wrapper">
                    {patientData?.dataSources?.length > 0 ? renderDataConnections() : renderDeviceConnectionCard()}
                  </Box>
                )}

                <DesktopOnly>
                  <Divider my={4} />
                  <MediumTitle mb={2} sx={{ color: 'black' }}>{t('Therapy Settings')}</MediumTitle>

                  {selectedSettingsId ? (
                    <>
                      {renderDeviceSettingsSelectionUI()}
                      {renderChart()}
                    </>
                  ) : renderMissingSettingsMessage()}
                </DesktopOnly>
              </Box>

              <Button
                className="btn-refresh"
                variant="secondaryCondensed"
                onClick={onClickRefresh}
                mt={4}
                sx={{ width: 'fit-content', alignSelf: ['center', null, 'flex-start'] }}
              >
                {t('Refresh')}
              </Button>
            </Flex>
          </Box>
        </Box>

        {showDataConnectionsModal && renderDataConnectionsModal()}
        {showUploadOverlay && renderUploadOverlay()}
      </Box>
    </div>
  );
};

Settings.propTypes = {
  chartPrefs: PropTypes.object.isRequired,
  data: PropTypes.object.isRequired,
  onClickRefresh: PropTypes.func.isRequired,
  onClickNoDataRefresh: PropTypes.func.isRequired,
  onSwitchToBasics: PropTypes.func.isRequired,
  onSwitchToDaily: PropTypes.func.isRequired,
  onSwitchToTrends: PropTypes.func.isRequired,
  onSwitchToSettings: PropTypes.func.isRequired,
  onSwitchToBgLog: PropTypes.func.isRequired,
  onClickPrint: PropTypes.func.isRequired,
  patient: PropTypes.object,
  trackMetric: PropTypes.func.isRequired,
  updateChartPrefs: PropTypes.func.isRequired,
  uploadUrl: PropTypes.string.isRequired,
  pdf: PropTypes.object,
  currentPatientInViewId: PropTypes.string.isRequired,
  t: PropTypes.func.isRequired,
};

export default withTranslation()(Settings);
