import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../../../../components/elements/Button';
import utils from '../../../../core/utils';
import { MGDL_UNITS, MS_IN_HOUR } from '../../../../core/constants';
import { utils as vizUtils } from '@tidepool/viz';
const { TextUtil } = vizUtils.text;
const { formatPercentage, formatDatum } = vizUtils.stat;
import { Box } from 'theme-ui';
import moment from 'moment';

const formatDateRange = (startEndpoint, endEndpoint, timezoneName) => {
  const startDate = moment.utc(startEndpoint).tz(timezoneName);
  const endDate   = moment.utc(endEndpoint).tz(timezoneName);
  const startYear = startDate.year();
  const endYear   = endDate.year();

  if (startYear !== endYear) {
    return `${startDate.format('MMMM D, YYYY')} - ${endDate.format('MMMM D, YYYY')}`;
  }

  return `${startDate.format('MMMM D')} - ${endDate.format('MMMM D')}, ${endDate.format('YYYY')}`;
};

const getCGMClipboardText = (patient, agpCGM, t) => {
  if (!agpCGM || !patient) return '';

  const { fullName, birthDate } = patient;

  const {
    timePrefs,
    bgPrefs,
    data: {
      current: {
        stats: {
          bgExtents: { newestDatum, oldestDatum },
          averageGlucose: { averageGlucose },
          timeInRange: { counts },
        },
      },
    },
  } = agpCGM;

  const { bgUnits, bgBounds } = bgPrefs || {};
  const { targetUpperBound, targetLowerBound, veryLowThreshold } = bgBounds || {};

  const timezoneName = vizUtils.datetime.getTimezoneFromTimePrefs(timePrefs);

  const currentDate = moment().format('MMMM Do, YYYY');

  const dateRange = formatDateRange(oldestDatum?.time, newestDatum?.time, timezoneName);

  const targetRange  = `${targetLowerBound}-${targetUpperBound}`;
  const lowRange     = `${veryLowThreshold}-${targetLowerBound}`;
  const veryLowRange = `<${veryLowThreshold}`;
  
  const percentInTarget  = formatPercentage(counts.target / counts.total, 0, true);
  const percentInLow     = formatPercentage(counts.low / counts.total, 0, true);
  const percentInVeryLow = formatPercentage(counts.veryLow / counts.total, 0, true);

  const avgGlucose = formatDatum({ value: averageGlucose }, 'bgValue', { bgPrefs, useAGPFormat: true });

  const textUtil = new TextUtil();
  let clipboardText = '';

  clipboardText += textUtil.buildTextLine(fullName);
  clipboardText += textUtil.buildTextLine(t('Date of birth: {{birthDate}}', { birthDate }));
  clipboardText += textUtil.buildTextLine(t('Exported from Tidepool TIDE: {{currentDate}}', { currentDate }));
  clipboardText += textUtil.buildTextLine('');
  clipboardText += textUtil.buildTextLine(t('Reporting Period: {{dateRange}}', { dateRange }));
  clipboardText += textUtil.buildTextLine('');
  clipboardText += textUtil.buildTextLine(t('Avg. Daily Time In Range ({{bgUnits}})', { bgUnits }));
  clipboardText += textUtil.buildTextLine(t('{{targetRange}}   {{percentInTarget}}%', { targetRange, percentInTarget }));
  clipboardText += textUtil.buildTextLine(t('{{lowRange}}   {{percentInLow}}%', { lowRange, percentInLow }));
  clipboardText += textUtil.buildTextLine(t('{{veryLowRange}}   {{percentInVeryLow}}%', { veryLowRange, percentInVeryLow }));
  clipboardText += textUtil.buildTextLine('');
  clipboardText += textUtil.buildTextLine(t('Avg. Glucose (CGM): {{avgGlucose}} {{bgUnits}}', { avgGlucose, bgUnits }));

  return clipboardText;
};

const STATE = {
  DEFAULT: 'DEFAULT',
  CLICKED: 'CLICKED',
};

const CGMClipboardButton = ({ patient, agpCGM }) => {
  const { t } = useTranslation();
  const [buttonState, setButtonState] = useState(STATE.DEFAULT);
  const clipboardText = useMemo(() => getCGMClipboardText(patient, agpCGM, t), [patient, agpCGM, t]);

  useEffect(() => {
    let buttonTextEffect = setTimeout(() => {
      setButtonState(STATE.DEFAULT);
    }, 1000);

    return () => {
      clearTimeout(buttonTextEffect);
    };
  }, [buttonState]);

  const { count, sampleFrequency } = agpCGM?.data?.current?.stats?.sensorUsage || {};

  const hoursOfCGMData = count * sampleFrequency;

  const isDataInsufficient = !hoursOfCGMData || ((hoursOfCGMData / MS_IN_HOUR) < 24); // minimum 24 hours

  const handleCopy = () => {
    navigator?.clipboard?.writeText(clipboardText);
    setButtonState(STATE.CLICKED);
  };

  return (
    <Button disabled={isDataInsufficient} onClick={handleCopy} variant="secondary">
      {buttonState === STATE.CLICKED 
        ? <Box>{t('Copied ✓')}</Box> 
        : <Box>{t('Copy as Text')}</Box>
      }
    </Button>
  );
};

export default CGMClipboardButton;