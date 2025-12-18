import React, { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import values from 'lodash/values';
import * as actions from '../../../redux/actions';
import { radii } from '../../../themes/baseTheme';
import Table from '../../../components/elements/Table';
import { Box, Text } from 'theme-ui';
import { MGDL_UNITS } from '../../../core/constants';
import BgSummaryCell from '../../../components/clinic/BgSummaryCell';
import DeltaBar from '../../../components/elements/DeltaBar';
import CategorySelector from './CategorySelector';
import { CATEGORY } from './CategorySelector';

import { utils as vizUtils } from '@tidepool/viz';
const { bankersRound } = vizUtils.stat;

import keyBy from 'lodash/keyBy';
import uniqBy from 'lodash/uniqBy';

const TMP_SUMMARY_PERIOD = '14d';
const TMP_UNITS = MGDL_UNITS;
const TMP_EXTREME_HIGH = false;
const TMP_STAT_EMPTY_TXT = '';

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

const getFetchers = (category, api, selectedClinicId) => {
  const opts = { offset: 0, limit: 16 };

  switch(category) {
    case CATEGORY.DEFAULT:
      return [
        fetchPatients(api, selectedClinicId, opts),
      ];

    case CATEGORY.LOWS:
      return [
        fetchPatients(api, selectedClinicId, {...opts, 'cgm.timeInVeryLowPercent': '>=0.02' }),
        fetchPatients(api, selectedClinicId, {...opts, 'cgm.timeInAnyLowPercent': '>=0.04' }),
      ];

    case CATEGORY.HIGHS:
      return [
        fetchPatients(api, selectedClinicId, {...opts, 'cgm.timeInVeryHighPercent': '>=0.05' }),
        fetchPatients(api, selectedClinicId, {...opts, 'cgm.timeInAnyHighPercent': '>=0.25' }),
      ];

    // TODO: These two are not quite possible yet without BE modifications to allowed parameters.
    case CATEGORY.OTHER:
    case CATEGORY.TARGET:
      return [
        fetchPatients(api, selectedClinicId, opts),
      ];
  }
};

const TideDashboardV2 = ({
  api,
}) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);

  const [category, setCategory] = useState(CATEGORY.DEFAULT);
  const [clinicPatients, setClinicPatients] = useState({});

  const fetchPatientsWrapper = async (api, selectedClinicId, category) => {
    const fetchers = getFetchers(category, api, selectedClinicId);

    const patientGroups = await Promise.all(fetchers);

    const allPatients = patientGroups.reduce((acc, group) => [...acc, ...(group?.data || [])], []);
    const uniquePatients = uniqBy(allPatients, 'id');
    const patients = keyBy(uniquePatients, 'id');

    setClinicPatients(patients);
  };

  useEffect(() => {
    fetchPatientsWrapper(api, selectedClinicId, category);
  }, [api, dispatch, selectedClinicId, category]);

  // Define columns for Table component
  const columns = useMemo(() => [
    {
      title: t('Patient Name'),
      field: 'fullName',
      align: 'left',
    },
    {
      title: t('Flag'),
      field: '',
      align: 'left',
    },
    {
      title: t('Average Glucose 14d'),
      field: 'summary.cgmStats.periods.14d.averageGlucoseMmol',
      align: 'left',
      render: ({ summary }) => {
        const averageGlucoseMmol = summary?.cgmStats?.periods?.[TMP_SUMMARY_PERIOD]?.averageGlucoseMmol;
        return averageGlucoseMmol ? <span>{bankersRound(averageGlucoseMmol, 1)}</span> : null;
      },
    },
    {
      title: t('GMI 14d'),
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
    </Box>
  );
};

export default TideDashboardV2;
