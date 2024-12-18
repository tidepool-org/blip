import React from 'react';
import colorPalette from '../../../themes/colorPalette';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { Flex, Box, Text } from 'theme-ui';
import moment from 'moment';
import { utils as vizUtils } from '@tidepool/viz';
import utils from '../../../core/utils';
import { MGDL_UNITS } from '../../../core/constants';

const formatDateRange = (startEndpoint, endEndpoint, timezoneName) => {
  const startDate = moment.utc(startEndpoint).tz(timezoneName);
  const endDate   = moment.utc(endEndpoint).tz(timezoneName);
  const startYear = startDate.year();
  const endYear   = endDate.year();

  if (startYear !== endYear) {
    return `${startDate.format("MMMM D, YYYY")} - ${endDate.format("MMMM D, YYYY")}`;
  }

  return `${startDate.format("MMMM D")} - ${endDate.format("MMMM D")}, ${endDate.format("YYYY")}`;
}

const TableRow = ({ label, sublabel, value, units }) => {
  return (
    <Flex sx={{ 
      justifyContent: 'space-between', 
      margin: '0 16px', 
      padding: '8px 0',  
      borderBottom: `1px solid ${colorPalette.extended.grays[1]}`,
      '&:last-of-type': { borderBottom: 'none' }
    }}>
      <Flex sx={{ flexDirection: 'column', maxWidth: '260px' }}>
        <Text sx={{ color: '#707070' }}>{label}</Text>
        {sublabel && (
          <Text sx={{ color: '#707070', fontSize: 0, fontStyle: 'italic' }}>{sublabel}</Text>
        )}
      </Flex>
      <Box>
        <Text sx={{ fontWeight: 'bold', fontSize: 2 }}>{value}</Text>
        {units && <Text sx={{ fontWeight: 'medium', fontSize: 0 }}>{units}</Text>}
      </Box>
    </Flex>
  )
}

const CGMStatistics = () => {
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
        <TableRow 
          label={t(`${daySpan} days:`)}
          value={dateRange}
        />
        <TableRow 
          label={t('Time CGM Active')}
          value={`${cgmActive}`}
          units="%"
        />
        <TableRow 
          label={t('Average Glucose')}
          sublabel={t('(Goal <154 mg/dL)')} // TODO: variable targets?
          value={`${avgGlucose}`}
          units={` ${bgUnits}`}
        />
        <TableRow 
          label={t('Glucose Management Indicator')}
          sublabel={t('(Goal <7%)')} // TODO: variable targets?
          value={`${gmi}`}
          units="%"
        />
        <TableRow 
          label={t('Glucose Variability')}
          sublabel={t('(Defined as a percent coefficient of variation. Goal <= 36%)')} // TODO: variable targets?
          value={`${cov}`}
          units="%"
        />
    </Box>
  )
}

export default CGMStatistics;