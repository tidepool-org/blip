import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { CATEGORY } from './FilterByCategory';

import {
  AvgGlucoseCell,
  CGMUseCell,
  ChangeTIRCell,
  GMICell,
  PatientCell,
  TimeInRangePercentBarChartCell,
  TimeInVeryLowPercentCell,
  TimeInAnyLowPercentCell,
  TimeInTargetPercentCell,
} from './Cells';

import TagListCell from '../components/TagListCell';

const getColumnTypes = (t) => ({
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
    title: t('% Time < 54'),
    field: 'timeInVeryLow',
    align: 'center',
    render: patient => <TimeInVeryLowPercentCell patient={patient} />,
  },
  timeInAnyLow: {
    title: t('% Time < 70'),
    field: 'timeInAnyLow',
    align: 'center',
    render: patient => <TimeInAnyLowPercentCell patient={patient} />,
  },
  timeInTarget: {
    title: t('% TIR 70-180'),
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

const useTableColumns = (category) => {
  const { t } = useTranslation();

  const columns = useMemo(() => {
    const columnTypes = getColumnTypes(t);

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
      // columnTypes.timeInVeryLow, // TODO: Implement "high" columns
      // columnTypes.timeInAnyLow,
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
      case CATEGORY.LOW: return lowColumnSet;
      case CATEGORY.DROP_IN_TIR: return standardColumnSet;
      case CATEGORY.HIGH: return highColumnSet;
      case CATEGORY.VERY_HIGH: return highColumnSet;
      case CATEGORY.LOW_CGM_WEAR: return standardColumnSet;
      case CATEGORY.TARGET: return standardColumnSet;
      default: return standardColumnSet;
    }
  }, [category]);

  return columns;
};

export default useTableColumns;
