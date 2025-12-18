import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import values from 'lodash/values';
import * as actions from '../../../redux/actions';
import { radii, colors } from '../../../themes/baseTheme';
import Table from '../../../components/elements/Table';
import { Box, Text, Flex } from 'theme-ui';
import { MGDL_UNITS } from '../../../core/constants';
import BgSummaryCell from '../../../components/clinic/BgSummaryCell';
import DeltaBar from '../../../components/elements/DeltaBar';
import CategorySelector, { CATEGORY } from './CategorySelector';
import Pagination from './Pagination';

import { utils as vizUtils, colors as vizColors } from '@tidepool/viz';
const { bankersRound } = vizUtils.stat;

import keyBy from 'lodash/keyBy';

const TMP_SUMMARY_PERIOD = '14d';
const TMP_UNITS = MGDL_UNITS;
const TMP_EXTREME_HIGH = false;
const TMP_STAT_EMPTY_TXT = '';

const PATIENT_ROWS_PER_PAGE = 16;

const renderBgRangeSummary = ({ id, summary, glycemicRanges }) => {
  return (
    <BgSummaryCell
      id={id}
      summary={summary?.cgmStats?.periods?.[TMP_SUMMARY_PERIOD]}
      config={summary?.cgmStats?.config}
      clinicBgUnits={TMP_UNITS}
      activeSummaryPeriod={TMP_SUMMARY_PERIOD}
      glycemicRanges={glycemicRanges}
      showExtremeHigh={TMP_EXTREME_HIGH}
    />
);
};

const renderTimeInTargetPercentDelta = ({ summary }) => {
  const timeInTargetPercentDelta = (summary?.cgmStats?.periods?.[TMP_SUMMARY_PERIOD]?.timeInTargetPercentDelta);

  return timeInTargetPercentDelta ? (
    <DeltaBar
      sx={{ fontWeight: 'medium' }}
      delta={timeInTargetPercentDelta * 100}
      max={30}
    />
  ) : (
    <Text sx={{ fontWeight: 'medium' }}>{TMP_STAT_EMPTY_TXT}</Text>
  );
};

const fetchPatients = (api, clinicId, options) => {
  return new Promise((resolve, reject) => {
    api.clinics.getPatientsForClinic(clinicId, options, (err, results) => {
      if (err) {
        reject(results);
        return;
      }

      resolve(results);
    });
  });
};

const getOpts = (category, offset) => {
  const opts = { offset, limit: PATIENT_ROWS_PER_PAGE };

  switch(category) {
    case CATEGORY.DEFAULT: return opts;

    case CATEGORY.VERY_LOW: return {...opts, 'cgm.timeInVeryLowPercent': '>=0.01' };

    case CATEGORY.ANY_LOW: return {...opts, 'cgm.timeInAnyLowPercent': '>=0.04' };

    case CATEGORY.VERY_HIGH: return {...opts, 'cgm.timeInVeryHighPercent': '>=0.05' };

    case CATEGORY.ANY_HIGH: return {...opts, 'cgm.timeInAnyHighPercent': '>=0.25' };

    // TODO: These two are not quite possible yet without BE modifications to allowed parameters.
    case CATEGORY.OTHER: return opts;
    case CATEGORY.TARGET: return opts;
  }
};

const fetchPatientsWrapper = async (api, selectedClinicId, category, offset, onSuccess) => {
  const options = getOpts(category, offset);
  const response = await fetchPatients(api, selectedClinicId, options);

  const patients = keyBy((response?.data || []), 'id');
  const count = response?.meta?.count || 0;

  onSuccess(patients, count);
};

const Flag = ({ summary }) => {
  const period = summary?.cgmStats?.periods?.[TMP_SUMMARY_PERIOD];

  if (!period) return null;

  let value;
  let rangeName;
  let title;
  let text;

  // TODO: Fix text to be bgUnit-sensitive
  switch(true) {
    case period.timeInVeryLowPercent > 0.01:
      value = 'timeInVeryLowPercent';
      rangeName = 'veryLow';
      title = 'Very Low';
      text = 'Greater than 1% time <54 mg/dL';
      break;
    case period.timeInAnyLowPercent > 0.04:
      value = 'timeInAnyLowPercent';
      rangeName = 'anyLow';
      title = 'Low';
      text = 'Greater than 4% time <70 mg/dL';
      break;
    case period.timeInVeryHighPercent > 0.05:
      value = 'timeInVeryHighPercent';
      rangeName = 'veryHigh';
      title = 'Very High';
      text = 'Greater than 5% time >250 mg/dL';
      break;
    case period.timeInAnyHighPercent > 0.25:
      value = 'timeInAnyHighPercent';
      rangeName = 'anyHigh';
      title = 'High';
      text = 'Greater than 25% time >180 mg/dL';
      break;
  }

  if (!value) return null;

  return (
    <Box px={1} py={1} ml={-2} sx={{
      backgroundColor: `${colors.bg[rangeName]}1A`, // Adding '1A' reduces opacity to 0.1
      borderRadius: 4,
    }}>
      <Flex as="label" htmlFor={`range-${value}-filter`} sx={{ alignItems: 'center' }}>
        <Box
          id={`range-${value}-filter-option-color-indicator`}
          sx={{
            position: 'relative',
            borderRadius: 4,
            backgroundColor: colors.bg[rangeName],
            width: '12px',
            height: '12px',

            // The styles within the :after pseudo-class below create a diagonal line

            border: value === 'timeInTargetPercent' && `1.5px solid ${colors.blueGreyDark}`,
            '&::after': value === 'timeInTargetPercent' && {
              content: '""',
              height: '1.5px',
              width: '141.421%',
              backgroundColor: colors.blueGreyDark,
              position: 'absolute',
              bottom: '0px',
              transform: 'rotate(-45deg)',
              transformOrigin: '1px 1px',
            },
          }}
          mr={2}
        >
        </Box>
        <Text id={`range-${value}-filter-option-title`} sx={{ fontSize: 0, color: vizColors.black }} mr={2}>
          {title}
        </Text>
        <Text id={`range-${value}-filter-option-text`} sx={{ fontSize: 0, color: vizColors.blue50 }} mr={2}>
          {' - '}{text}
        </Text>
      </Flex>
    </Box>
  );
};

const TideDashboardV2 = ({
  api,
}) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);

  const [category, setCategory] = useState(CATEGORY.DEFAULT);
  const [clinicPatients, setClinicPatients] = useState({});

  const [count, setCount] = useState(0);
  const [offset, setOffset] = useState(0);

  useEffect(() => {
    const onSuccess = ( patients, count ) => {
      setClinicPatients(patients);
      setCount(count);
    };

    fetchPatientsWrapper(api, selectedClinicId, category, offset, onSuccess);
  }, [api, dispatch, selectedClinicId, category, offset]);

  // Define columns for Table component
  const columns = useMemo(() => [
    {
      title: t('Patient Name'),
      field: 'fullName',
      align: 'left',
      render: ({ fullName }) => (
        <Text sx={{ display: 'block', width: '240px', overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>
          {fullName}
        </Text>
      ),
      width: 320,
    },
    {
      title: t('Flag'),
      field: '',
      align: 'left',
      render: Flag,
      width: 320,
    },
    {
      title: t('Average Glucose'),
      field: 'summary.cgmStats.periods.14d.averageGlucoseMmol',
      align: 'left',
      render: ({ summary }) => {
        const averageGlucoseMmol = summary?.cgmStats?.periods?.[TMP_SUMMARY_PERIOD]?.averageGlucoseMmol;
        return averageGlucoseMmol ? <span>{bankersRound(averageGlucoseMmol, 1)}</span> : null;
      },
    },
    {
      title: t('GMI'),
      field: 'summary.cgmStats.periods.14d.glucoseManagementIndicator',
      align: 'left',
      render: renderBgRangeSummary,
    },
    {
      title: t('% Change in TIR'),
      field: 'timeInTargetPercentDelta',
      align: 'left',
      render: renderTimeInTargetPercentDelta,
    },
    {
      title: t('Tags'),
      field: '',
      align: 'left',
    },
    {
      title: t('Last Reviewed'),
      field: '',
      align: 'left',
    },
  ], [t]);

  return (
    <Box px={4}>
      <CategorySelector value={category} onChange={setCategory} />

      <Table
        className='dashboard-table'
        id='dashboard-table-v2'
        variant="tableGroup"
        label={t('Patients Table')}
        columns={columns}
        data={clinicPatients}
        sx={{
          fontSize: 1,
          'tr': { height: [null, null, '40px', '40px'] },
          'thead': { fontSize: 0 },
          'thead th': { fontWeight: 'normal' },
          'th div': { display: 'flex', alignItems: 'center' },
        }}
        emptyText={t('No patients found.')}
        containerProps={{
          sx: {
            '.table-empty-text': {
              backgroundColor: 'white',
              borderBottomLeftRadius: radii.medium,
              borderBottomRightRadius: radii.medium,
            },
          },
        }}
      />

      <Pagination
        limit={PATIENT_ROWS_PER_PAGE}
        offset={offset}
        count={count}
        onChange={(newOffset) => setOffset(newOffset)}
      />
    </Box>
  );
};

export default TideDashboardV2;
