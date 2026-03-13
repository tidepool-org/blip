import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { CATEGORY } from './FilterByCategory';
import { MGDL_UNITS } from '../../../core/constants';
import mapValues from 'lodash/mapValues';
import { utils as vizUtils } from '@tidepool/viz';
const { DEFAULT_BG_BOUNDS } = vizUtils.constants;

import {
  AvgGlucoseCell,
  CGMUseCell,
  ChangeTIRCell,
  GMICell,
  PatientCell,
  TimeInRangePercentBarChartCell,
  TimeInVeryLowPercentCell,
  TimeInAnyLowPercentCell,
  TimeInVeryHighPercentCell,
  TimeInAnyHighPercentCell,
  TimeInTargetPercentCell,
} from './Cells';

import TagListCell from '../components/TagListCell';

const getColumnTypes = (t, thresholds) => ({
  patientDetails: {
    title: t('Patient Details'),
    field: 'fullName',
    align: 'left',
    render: patient => <PatientCell patient={patient} />,
  },
  flag: {
    title: t('Flag'),
    field: 'flag',
    align: 'center',
  },
  avgGlucose: {
    title: t('Avg Glucose'),
    field: 'avgGlucose',
    align: 'center',
    render: patient => <AvgGlucoseCell patient={patient} />,
  },
  timeInRangeBarChart: {
    title: t('Time in Range'),
    field: 'timeInRangeBarChart',
    align: 'center',
    render: patient => <TimeInRangePercentBarChartCell patient={patient} />,
  },
  changeInTIR: {
    title: t('% Change in TIR'),
    field: 'changeInTIR',
    align: 'center',
    render: patient => <ChangeTIRCell patient={patient} />,
  },
  timeInVeryLow: {
    title: `${t('% Time')} < ${thresholds.veryLowThreshold}`,
    field: 'timeInVeryLow',
    align: 'center',
    render: patient => <TimeInVeryLowPercentCell patient={patient} />,
  },
  timeInAnyLow: {
    title: `${t('% Time')} < ${thresholds.targetLowerBound}`,
    field: 'timeInAnyLow',
    align: 'center',
    render: patient => <TimeInAnyLowPercentCell patient={patient} />,
  },
  timeInVeryHigh: {
    title: `${t('% Time')} > ${thresholds.veryHighThreshold}`,
    field: 'timeInVeryHigh',
    align: 'center',
    render: patient => <TimeInVeryHighPercentCell patient={patient} />,
  },
  timeInAnyHigh: {
    title: `${t('% Time')} > ${thresholds.targetUpperBound}`,
    field: 'timeInAnyHigh',
    align: 'center',
    render: patient => <TimeInAnyHighPercentCell patient={patient} />,
  },
  timeInTarget: {
    title: `${t('% TIR')} ${thresholds.targetLowerBound}-${thresholds.targetUpperBound}`,
    field: 'timeInTarget',
    align: 'center',
    render: patient => <TimeInTargetPercentCell patient={patient} />,
  },
  gmi: {
    title: t('GMI'),
    field: 'gmi',
    align: 'center',
    render: patient => <GMICell patient={patient} />,
  },
  cgmUse: {
    title: t('CGM Use'),
    field: 'cgmUse',
    align: 'center',
    render: patient => <CGMUseCell patient={patient} />,
  },
  tags: {
    title: t('Tags'),
    field: 'tags',
    align: 'center',
    render: patient => <TagListCell patient={patient} />,
  },
  lastReviewed: {
    title: t('Last Reviewed'),
    field: 'lastReviewed',
    align: 'center',
  },
  moreMenu: {
    title: t(''),
    field: 'moreMenu',
    align: 'center',
  }, // More
});

const getFormattedThresholds = (clinicBgUnits) => {
  const thresholds = DEFAULT_BG_BOUNDS[clinicBgUnits];
  const precision = clinicBgUnits === MGDL_UNITS ? 0 : 1;

  return mapValues(thresholds, value => value.toFixed(precision));
};

const useTableColumns = (category) => {
  const { t } = useTranslation();
  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);
  const clinic = useSelector(state => state.blip.clinics?.[selectedClinicId]);
  const clinicBgUnits = clinic?.preferredBgUnits || MGDL_UNITS;

  const columns = useMemo(() => {
    const thresholds = getFormattedThresholds(clinicBgUnits);
    const columnTypes = getColumnTypes(t, thresholds);

    const standardColumnSet = [
      columnTypes.patientDetails,
      columnTypes.flag,
      columnTypes.avgGlucose,
      columnTypes.timeInTarget,
      columnTypes.timeInRangeBarChart,
      columnTypes.changeInTIR,
      columnTypes.gmi,
      columnTypes.cgmUse,
      columnTypes.tags,
      columnTypes.lastReviewed,
      columnTypes.moreMenu,
    ];

    const lowColumnSet = [
      columnTypes.patientDetails,
      columnTypes.flag,
      columnTypes.avgGlucose,
      columnTypes.timeInVeryLow,
      columnTypes.timeInAnyLow,
      columnTypes.timeInTarget,
      columnTypes.timeInRangeBarChart,
      columnTypes.changeInTIR,
      columnTypes.gmi,
      columnTypes.tags,
      columnTypes.lastReviewed,
      columnTypes.moreMenu,
    ];

    const highColumnSet = [
      columnTypes.patientDetails,
      columnTypes.flag,
      columnTypes.avgGlucose,
      columnTypes.timeInVeryHigh,
      columnTypes.timeInAnyHigh,
      columnTypes.timeInTarget,
      columnTypes.timeInRangeBarChart,
      columnTypes.changeInTIR,
      columnTypes.gmi,
      columnTypes.tags,
      columnTypes.lastReviewed,
      columnTypes.moreMenu,
    ];

    switch(category) {
      case CATEGORY.DEFAULT: return standardColumnSet;
      case CATEGORY.VERY_LOW: return lowColumnSet;
      case CATEGORY.ANY_LOW: return lowColumnSet;
      case CATEGORY.DROP_IN_TIR: return standardColumnSet;
      case CATEGORY.ANY_HIGH: return highColumnSet;
      case CATEGORY.VERY_HIGH: return highColumnSet;
      case CATEGORY.LOW_CGM_WEAR: return standardColumnSet;
      case CATEGORY.TARGET: return standardColumnSet;
      default: return standardColumnSet;
    }
  }, [category, clinicBgUnits]);

  return columns;
};

export default useTableColumns;
