import React from 'react';
import colorPalette from '../../../../themes/colorPalette';
import { colors as vizColors } from '@tidepool/viz';
import { useTranslation } from 'react-i18next';
import { Flex, Box, Text } from 'theme-ui';
import { utils as vizUtils } from '@tidepool/viz';
const { formatDatum, bankersRound } = vizUtils.stat;
const { getTimezoneFromTimePrefs } = vizUtils.datetime;
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
        borderBottom: `1px solid ${vizColors.gray10}`,
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
  );
};

const CGMStatistics = ({ agpCGM }) => {
  const { t } = useTranslation();

  if (!agpCGM) return null;

  const {
    timePrefs,
    bgPrefs,
    data: {
      current: {
        stats: {
          bgExtents: { newestDatum, oldestDatum, bgDaysWorn },
          sensorUsage: { sensorUsageAGP },
          averageGlucose: { averageGlucose },
          glucoseManagementIndicator: { glucoseManagementIndicatorAGP },
          coefficientOfVariation: { coefficientOfVariation },
        },
      },
    },
  } = agpCGM;

  const { bgUnits } = bgPrefs;

  const timezone = getTimezoneFromTimePrefs(timePrefs);

  const avgGlucoseTarget = bgUnits === MGDL_UNITS ? '154' : '8.6';

  const dateRange  = getReportDaysText(newestDatum, oldestDatum, bgDaysWorn, timezone);
  const cgmActive  = bankersRound(sensorUsageAGP, 1);
  const avgGlucose = formatDatum({ value: averageGlucose }, 'bgValue', { bgPrefs, useAGPFormat: true });
  const gmi        = formatDatum({ value: glucoseManagementIndicatorAGP }, 'gmi', { bgPrefs, useAGPFormat: true });
  const cov        = formatDatum({ value: coefficientOfVariation }, 'cv', { bgPrefs, useAGPFormat: true });

  return (
    <Flex sx={{ alignItems: 'center', width: '100%', height: '100%' }} id='agp-cgm-statistics'>
      <Box sx={{ width: '100%' }}>
          <TableRow
            id="agp-table-time-range"
            label={t('Time Range')}
            value={t('{{dateRange}} ({{bgDaysWorn}} days)', { dateRange, bgDaysWorn })}
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
            value={avgGlucose?.value}
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
  );
};

export default CGMStatistics;
