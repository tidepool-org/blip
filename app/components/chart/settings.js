import _ from 'lodash';
import bows from 'bows';
import PropTypes from 'prop-types';
import React, { useState, useCallback, useEffect } from 'react';
import { Trans, withTranslation } from 'react-i18next';
import { Flex, Box, Text } from 'theme-ui';
import moment from 'moment-timezone';
import KeyboardArrowDownRoundedIcon from '@material-ui/icons/KeyboardArrowDownRounded';
import DateRangeRoundedIcon from '@material-ui/icons/DateRangeRounded';

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
import Icon from '../elements/Icon';

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
        const previousObj = index > 0 ? group[index - 1] : { normalTime: new Date().getTime() };
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
        return {
          value: setting.id,
          label: (
            <span>
              {moment(setting.normalTime)
                .tz(timezoneName)
                .format('MMM DD, YYYY')}
              {' '}-{' '}
              {moment(setting.previousNormalTime)
                .tz(timezoneName)
                .format('MMM DD, YYYY')}
              {' '}:{' '}
              <span style={{ fontWeight: 'bold' }}>
                Active for {setting.durationString}
              </span>
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
    const handleClickUpload = () => {
      trackMetric('Clicked Partial Data Upload, No Settings');
    };

    return (
      <Trans className="patient-data-message patient-data-message-loading" i18nKey="html.setting-no-uploaded-data">
        <p>The Device Settings view shows your basal rates, carb ratios, sensitivity factors and more, but it looks like you haven't uploaded pump data yet.</p>
        <p>To see your Device Settings, <a
            href={uploadUrl}
            target="_blank"
            rel="noreferrer noopener"
            onClick={handleClickUpload}>upload</a> your pump.</p>
        <p>
          If you just uploaded, try <a href="" onClick={onClickNoDataRefresh}>refreshing</a>.
        </p>
      </Trans>
    );
  };

  return (
    <div id="tidelineMain">
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
      <div className="container-box-outer patient-data-content-outer">
        <div className="container-box-inner patient-data-content-inner">
          <div className="patient-data-content">
            <Flex mt={4} mb={5} pl={manufacturer === 'tandem' ? '20px' : 0}>
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
                    ml: 2,
                    mr: 2,
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

              <Box sx={{ fontSize: 1, alignSelf: 'center' }}>
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
                    ml: 2,
                    mr: 2,
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

            {selectedSettingsId ? renderChart() : renderMissingSettingsMessage()}

            <Box mt={4} mb={5} pl={manufacturer === 'tandem' ? '20px' : 0} sx={{ float: 'left', clear: 'both' }}>
              <Button
                className="btn-refresh"
                variant="secondary"
                onClick={onClickRefresh}
              >
                {t('Refresh')}
              </Button>
            </Box>
          </div>
        </div>
      </div>
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
