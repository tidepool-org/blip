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

const TideDashboardV2 = ({
  api,
}) => {
  const dispatch = useDispatch();
  const { t } = useTranslation();

  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);
  const clinic = useSelector(state => state.blip.clinics?.[selectedClinicId]);

  const [category, setCategory] = useState(CATEGORY.DEFAULT);

  useEffect(() => {
    dispatch(actions.async.fetchPatientsForClinic(api, selectedClinicId, {
      limit: 16,
      offset: 0,
    }));
  }, [api, dispatch, selectedClinicId]);

  // Convert clinic.patients object to array for Table component
  const patients = useMemo(() => {
    if (!clinic?.patients) return [];

    return values(clinic.patients);
  }, [clinic?.patients]);

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
      title: t('avgGlucose 14d'),
      field: 'summary.cgmStats.periods.14d.averageGlucoseMmol',
      align: 'left',
      render: ({ summary }) => <span>{summary?.cgmStats?.periods?.['14d']?.averageGlucoseMmol}</span>
    },
    {
      title: t('gmi 14d'),
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
        data={patients}
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
