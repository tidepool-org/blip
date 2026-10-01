import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { CATEGORY } from './tideDashboardSlice';
import { MGDL_UNITS } from '../../../core/constants';
import mapValues from 'lodash/mapValues';
import { utils as vizUtils } from '@tidepool/viz';
const { DEFAULT_BG_BOUNDS } = vizUtils.constants;

import {
  PatientCell,
  AvgGlucoseHeader,
  AvgGlucoseCell,
  CGMUseCell,
  ChangeTIRHeader,
  ChangeTIRCell,
  GMICell,
  TimeInRangePercentBarChartCell,
  TimeInVeryLowPercentCell,
  TimeInAnyLowPercentCell,
  TimeInVeryHighPercentCell,
  TimeInAnyHighPercentCell,
  TimeInTargetPercentCell,
  MoreMenuHeader,
  PatientLastReviewedCell,
  MoreMenuCell,
} from './Cells';

import TagListCell from '../components/TagListCell';

const buildColumnTypes = (t, category, summaryPeriod, thresholds) => ({
  patientDetails: {
    title: t('Patient Details'),
    field: 'fullName',
    align: 'left',
    render: patient => <PatientCell patient={patient} />,
  },
  avgGlucose: {
    title: t('Avg Glucose'),
    field: 'avgGlucose',
    align: 'center',
    titleComponent: () => <AvgGlucoseHeader />,
    render: patient => <AvgGlucoseCell patient={patient} summaryPeriod={summaryPeriod} />,
  },
  timeInRangeBarChart: {
    title: t('Time in Range'),
    field: 'timeInRangeBarChart',
    align: 'center',
    render: patient => <TimeInRangePercentBarChartCell patient={patient} summaryPeriod={summaryPeriod} />,
  },
  changeInTIR: {
    title: t('% Change in TIR'),
    field: 'changeInTIR',
    align: 'center',
    titleComponent: () => <ChangeTIRHeader />,
    render: patient => <ChangeTIRCell patient={patient} summaryPeriod={summaryPeriod} />,
  },
  timeInVeryLow: {
    title: `${t('% Time')} < ${thresholds.veryLowThreshold}`,
    field: 'timeInVeryLow',
    align: 'center',
    render: patient => <TimeInVeryLowPercentCell patient={patient} summaryPeriod={summaryPeriod} />,
  },
  timeInAnyLow: {
    title: `${t('% Time')} < ${thresholds.targetLowerBound}`,
    field: 'timeInAnyLow',
    align: 'center',
    render: patient => <TimeInAnyLowPercentCell patient={patient} summaryPeriod={summaryPeriod} />,
  },
  timeInVeryHigh: {
    title: `${t('% Time')} > ${thresholds.veryHighThreshold}`,
    field: 'timeInVeryHigh',
    align: 'center',
    render: patient => <TimeInVeryHighPercentCell patient={patient} summaryPeriod={summaryPeriod} />,
  },
  timeInAnyHigh: {
    title: `${t('% Time')} > ${thresholds.targetUpperBound}`,
    field: 'timeInAnyHigh',
    align: 'center',
    render: patient => <TimeInAnyHighPercentCell patient={patient} summaryPeriod={summaryPeriod} />,
  },
  timeInTarget: {
    title: `${t('% TIR')} ${thresholds.targetLowerBound}-${thresholds.targetUpperBound}`,
    field: 'timeInTarget',
    align: 'center',
    render: patient => <TimeInTargetPercentCell patient={patient} summaryPeriod={summaryPeriod} />,
  },
  gmi: {
    title: t('GMI'),
    field: 'gmi',
    align: 'center',
    render: patient => <GMICell patient={patient} summaryPeriod={summaryPeriod} />,
  },
  cgmUse: {
    title: t('CGM Use'),
    field: 'cgmUse',
    align: 'center',
    render: patient => <CGMUseCell patient={patient} summaryPeriod={summaryPeriod} />,
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
    render: patient => <PatientLastReviewedCell patient={patient} />,
  },
  moreMenu: {
    title: '',
    field: 'moreMenu',
    align: 'center',
    titleComponent: () => <MoreMenuHeader />,
    render: patient => <MoreMenuCell patient={patient} />,
  }, // More
});

const getColumnSet = (columnTypes) => ({
  low: [
    columnTypes.patientDetails,
    columnTypes.avgGlucose,
    columnTypes.timeInVeryLow,
    columnTypes.timeInAnyLow,
    columnTypes.timeInTarget,
    columnTypes.timeInRangeBarChart,
    columnTypes.changeInTIR,
    columnTypes.tags,
    columnTypes.lastReviewed,
    columnTypes.moreMenu,
  ],
  high: [
    columnTypes.patientDetails,
    columnTypes.avgGlucose,
    columnTypes.timeInVeryHigh,
    columnTypes.timeInAnyHigh,
    columnTypes.timeInTarget,
    columnTypes.timeInRangeBarChart,
    columnTypes.changeInTIR,
    columnTypes.tags,
    columnTypes.lastReviewed,
    columnTypes.moreMenu,
  ],
  dropInTIR: [
    columnTypes.patientDetails,
    columnTypes.avgGlucose,
    columnTypes.timeInTarget,
    columnTypes.timeInRangeBarChart,
    columnTypes.changeInTIR,
    columnTypes.gmi,
    columnTypes.cgmUse,
    columnTypes.tags,
    columnTypes.lastReviewed,
    columnTypes.moreMenu,
  ],
  lowCgmWear: [
    columnTypes.patientDetails,
    columnTypes.cgmUse,
    columnTypes.avgGlucose,
    columnTypes.timeInTarget,
    columnTypes.timeInRangeBarChart,
    columnTypes.changeInTIR,
    columnTypes.gmi,
    columnTypes.tags,
    columnTypes.lastReviewed,
    columnTypes.moreMenu,
  ],
  target: [
    columnTypes.patientDetails,
    columnTypes.avgGlucose,
    columnTypes.timeInRangeBarChart,
    columnTypes.changeInTIR,
    columnTypes.gmi,
    columnTypes.cgmUse,
    columnTypes.tags,
    columnTypes.lastReviewed,
    columnTypes.moreMenu,
  ],
});

const getFormattedThresholds = (clinicBgUnits) => {
  const thresholds = DEFAULT_BG_BOUNDS[clinicBgUnits];
  const precision = clinicBgUnits === MGDL_UNITS ? 0 : 1;

  return mapValues(thresholds, value => value.toFixed(precision));
};

const useTableColumns = (category, summaryPeriod) => {
  const { t } = useTranslation();
  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);
  const clinic = useSelector(state => state.blip.clinics?.[selectedClinicId]);
  const clinicBgUnits = clinic?.preferredBgUnits || MGDL_UNITS;

  const columns = useMemo(() => {
    const thresholds = getFormattedThresholds(clinicBgUnits);
    const columnTypes = buildColumnTypes(t, category, summaryPeriod, thresholds);
    const columnSet = getColumnSet(columnTypes);

    switch(category) {
      case CATEGORY.VERY_LOW: return columnSet.low;
      case CATEGORY.ANY_LOW: return columnSet.low;
      case CATEGORY.DROP_IN_TIR: return columnSet.dropInTIR;
      case CATEGORY.ANY_HIGH: return columnSet.high;
      case CATEGORY.VERY_HIGH: return columnSet.high;
      case CATEGORY.LOW_CGM_WEAR: return columnSet.lowCgmWear;
      case CATEGORY.TARGET: return columnSet.target;
      default: return columnSet.target;
    }
  }, [category, summaryPeriod, clinicBgUnits, t]);

  return columns;
};

export default useTableColumns;
