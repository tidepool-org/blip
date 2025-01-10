import React from 'react';
import colorPalette from '../../../../themes/colorPalette';
import { useTranslation } from 'react-i18next';
import { Flex, Box, Text } from 'theme-ui';
import { utils as vizUtils } from '@tidepool/viz';
const { formatDatum, bankersRound } = vizUtils.stat;
import { MGDL_UNITS } from '../../../../core/constants';
import getReportDaysText from './getReportDaysText';

const TableRow = ({ label, sublabel, value, units, id }) => {
  return (
    <Flex 
      id={id}
      sx={{ 
        justifyContent: 'space-between', 
        margin: '0 16px', 
        padding: '16px 0',  
        borderBottom: `1px solid ${colorPalette.extended.grays[1]}`,
        '&:last-of-type': { borderBottom: 'none' }
      }}
    >
      <Flex sx={{ flexDirection: 'column', maxWidth: '260px' }}>
        <Text sx={{ color: colorPalette.extended.grays[10], fontSize: 0 }}>{label}</Text>
        {sublabel && (
          <Text sx={{ color: colorPalette.extended.grays[10], fontSize: 0, fontStyle: 'italic' }}>
            {sublabel}
          </Text>
        )}
      </Flex>
      <Box>
        <Text sx={{ fontWeight: 'bold', fontSize: 1 }}>{value}</Text>
        {units && <Text sx={{ fontWeight: 'medium', fontSize: 0 }}>{units}</Text>}
      </Box>
    </Flex>
  )
}

const CGMStatistics = ({ agpCGM }) => {
  const { t } = useTranslation();

  if (!agpCGM) return null;

  const {
    timePrefs,
    bgPrefs,
    data: {
      current: {
        endpoints: { days: endpointDays },
        stats: {
          bgExtents: { newestDatum, oldestDatum, bgDaysWorn },
          sensorUsage: { sensorUsageAGP },
          averageGlucose: { averageGlucose },
          glucoseManagementIndicator: { glucoseManagementIndicatorAGP },
          coefficientOfVariation: { coefficientOfVariation }
        },
      }
    }
  } = agpCGM;

  const { bgUnits } = bgPrefs;

  const timezoneName = vizUtils.datetime.getTimezoneFromTimePrefs(timePrefs);

  const avgGlucoseTarget = bgUnits === MGDL_UNITS ? '154' : '8.6';

  const daySpan    = endpointDays;

  const formattingOpts = { bgPrefs, useAGPFormat: true }

  const dateRange  = getReportDaysText(newestDatum, oldestDatum, bgDaysWorn, timezoneName);
  const cgmActive  = bankersRound(sensorUsageAGP, 1);
  const avgGlucose = formatDatum({ value: averageGlucose }, 'bgValue', formattingOpts);
  const gmi        = formatDatum({ value: glucoseManagementIndicatorAGP }, 'gmi', formattingOpts);
  const cov        = formatDatum({ value: coefficientOfVariation }, 'cv', formattingOpts);

  return (
    <Flex sx={{ alignItems: 'center', width: '100%', height: '100%' }} id='agp-cgm-statistics'>
      <Box sx={{ width: '100%' }}>
          <TableRow
            id="agp-table-time-range"
            label={t('Time Range')}
            value={t('{{dateRange}} ({{daySpan}} days)', { dateRange, daySpan })}
          />
          <TableRow
            id="agp-table-cgm-active"
            label={t('Time CGM Active')}
            value={`${cgmActive}`}
            units="%"
          />
          <TableRow 
            id="agp-table-avg-glucose"
            label={t('Average Glucose')}
            sublabel={t('(Goal <{{avgGlucoseTarget}} {{bgUnits}})', { avgGlucoseTarget, bgUnits })}
            value={avgGlucose.value}
            units={` ${bgUnits}`}
          />
          <TableRow
            id="agp-table-gmi"
            label={t('Glucose Management Indicator')}
            sublabel={t('(Goal <7%)')}
            value={gmi?.value}
            units={gmi?.suffix}
          />
          <TableRow
            id="agp-table-cov"
            label={t('Glucose Variability')}
            sublabel={t('(Defined as a percent coefficient of variation. Goal <= 36%)')}
            value={cov?.value}
            units={cov?.suffix}
          />
      </Box>
    </Flex>
  )
}

export default CGMStatistics;