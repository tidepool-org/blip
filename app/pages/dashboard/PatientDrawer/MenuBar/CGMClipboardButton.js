import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../../../../components/elements/Button';
import utils from '../../../../core/utils';
import { MGDL_UNITS } from '../../../../core/constants';
import { utils as vizUtils } from '@tidepool/viz';
const { TextUtil } = vizUtils.text;
import { Box } from 'theme-ui'
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
}

const getCGMClipboardText = (patient, agpCGM, t) => {
  if (!agpCGM || !patient) return '';

  const { fullName, birthDate } = patient;

  const {
    timePrefs,
    bgPrefs: { bgUnits },
    data: {
      current: {
        stats: {
          bgExtents: { newestDatum, oldestDatum },
          averageGlucose: { averageGlucose },
          timeInRange: { counts },
        },
      }
    }
  } = agpCGM;

  const timezoneName = vizUtils.datetime.getTimezoneFromTimePrefs(timePrefs);

  const currentDate = moment().format('MMMM Do, YYYY');

  // TODO: Add test for no data scenario
  const dateRange = formatDateRange(oldestDatum?.time, newestDatum?.time, timezoneName);

  const targetRange  = bgUnits === MGDL_UNITS ? '70-180' : '3.9-10.0';
  const lowRange     = bgUnits === MGDL_UNITS ? '54-70' : '3.0-3.9';
  const veryLowRange = bgUnits === MGDL_UNITS ? '<54' : '<3.0';
  
  const countsInTarget  = utils.roundToPrecision((counts.target / counts.total) * 100, 0);
  const countsInLow     = utils.roundToPrecision((counts.low * 100 ) / counts.total, 0);
  const countsInVeryLow = utils.roundToPrecision((counts.veryLow * 100 ) / counts.total, 0);

  const avgGlucose   = utils.roundToPrecision(averageGlucose, bgUnits === MGDL_UNITS ? 0 : 1);

  const textUtil = new TextUtil();
  let clipboardText = '';

  clipboardText += textUtil.buildTextLine(fullName);
  clipboardText += textUtil.buildTextLine(t('Date of birth: {{birthDate}}', { birthDate }));
  clipboardText += textUtil.buildTextLine(t('Exported from Tidepool TIDE: {{currentDate}}', { currentDate }));
  clipboardText += textUtil.buildTextLine('');
  clipboardText += textUtil.buildTextLine(t('Reporting Period: {{dateRange}}', { dateRange }));
  clipboardText += textUtil.buildTextLine('');
  clipboardText += textUtil.buildTextLine(t('Avg. Daily Time In Range ({{bgUnits}})', { bgUnits }));
  clipboardText += textUtil.buildTextLine(t('{{targetRange}} {{countsInTarget}}%', { targetRange, countsInTarget }));
  clipboardText += textUtil.buildTextLine(t('{{lowRange}} {{countsInLow}}%', { lowRange, countsInLow }));
  clipboardText += textUtil.buildTextLine(t('{{veryLowRange}} {{countsInVeryLow}}%', { veryLowRange, countsInVeryLow }));
  clipboardText += textUtil.buildTextLine('');
  clipboardText += textUtil.buildTextLine(t('Avg. Glucose (CGM): {{avgGlucose}} {{bgUnits}}', { avgGlucose, bgUnits }));

  return clipboardText;
}

const STATE = {
  DEFAULT: 'DEFAULT',
  CLICKED: 'CLICKED',
}

const CGMClipboardButton = ({ patient, agpCGM }) => {
  const { t } = useTranslation();
  const [buttonState, setButtonState] = useState(STATE.DEFAULT);

  useEffect(() => {
    let buttonTextEffect = setTimeout(() => {
      setButtonState(STATE.DEFAULT)
    }, 1000);

    return () => {
      clearTimeout(buttonTextEffect);
    }
  }, [buttonState])

  const sensorUsage = agpCGM?.data?.current?.stats?.sensorUsage?.sensorUsage || 0;

  const isDisabled = !agpCGM || sensorUsage < 86400000; // minimum 24 hours

  const clipboardText = useMemo(() => getCGMClipboardText(patient, agpCGM, t), [patient, agpCGM, t]);

  const handleCopy = () => {
    navigator?.clipboard?.writeText(clipboardText);
    setButtonState(STATE.CLICKED);
  }

  return (
    <Button disabled={isDisabled} onClick={handleCopy} variant="secondary">
      {buttonState === STATE.CLICKED 
        ? <Box>{t('Copied ✓')}</Box> 
        : <Box>{t('Copy as Text')}</Box>
      }
    </Button>
  )
}

export default CGMClipboardButton;