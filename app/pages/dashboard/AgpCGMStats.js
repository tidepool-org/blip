import React from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Flex, Box, Text } from 'theme-ui';
import moment from 'moment';
import { utils as vizUtils } from '@tidepool/viz';
import utils from '../../core/utils';
import { MGDL_UNITS } from '../../core/constants';

const formatDateRange = (startEndpoint, endEndpoint, timezoneName) => {
  const startDate = moment.utc(startEndpoint).tz(timezoneName);
  const endDate   = moment.utc(endEndpoint).tz(timezoneName);
  const startYear = startDate.year();
  const endYear   = endDate.year();

  if (startYear !== endYear) {
    return `${startDate.format("MMMM Do, YYYY")} - ${endDate.format("MMMM Do, YYYY")}`;
  }

  return `${startDate.format("MMMM Do")} - ${endDate.format("MMMM Do")}, ${endDate.format("YYYY")}`;
}

const AgpCGMStats = () => {
  const { t } = useTranslation();

  // IMPORTANT: Data taken from Redux PDF slice
  const agpCGM = useSelector(state => state.blip.pdf?.data?.agpCGM);

  if (!agpCGM) return null;

  const {
    timePrefs,
    bgPrefs: { bgUnits },
    data: {
      current: {
        endpoints: { 
          days: endpointDays,
          range: [startEndpoint, endEndpoint] 
        },
        stats: {
          sensorUsage: { sensorUsageAGP },
          averageGlucose: { averageGlucose },
          glucoseManagementIndicator: { glucoseManagementIndicatorAGP },
          coefficientOfVariation: { coefficientOfVariation }
        },
      }
    }
  } = agpCGM;

  const timezoneName = vizUtils.datetime.getTimezoneFromTimePrefs(timePrefs);
  const avgGlucosePrecision = bgUnits === MGDL_UNITS ? 0 : 1;

  const dateRange  = formatDateRange(startEndpoint, endEndpoint, timezoneName);
  const daySpan    = endpointDays;
  const cgmActive  = utils.roundToPrecision(sensorUsageAGP, 1);
  const avgGlucose = utils.roundToPrecision(averageGlucose, avgGlucosePrecision);
  const gmi        = utils.roundToPrecision(glucoseManagementIndicatorAGP, 1);
  const cov        = utils.roundToPrecision(coefficientOfVariation, 1);

  return (
    <Box>
      <Box>{ timezoneName }</Box>
      <Box>{ daySpan } days: { dateRange }</Box>
      <Box>Time CGM Active: { cgmActive } %</Box>
      <Box>Average Glucose: { avgGlucose } { bgUnits }</Box>
      <Box>GMI: { gmi } %</Box>
      <Box>Glucose Variability: { cov } %</Box>
    </Box>
  )
}

export default AgpCGMStats;