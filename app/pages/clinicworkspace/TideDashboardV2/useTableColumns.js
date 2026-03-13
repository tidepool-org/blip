import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
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

const useTableColumns = () => {
  const { t } = useTranslation();
  const category = useSelector(state => state.blip.tideDashboard.category);

  const columns = useMemo(() => {
    const columnTypes = getColumnTypes(t);

    switch(category) {
      case CATEGORY.VERY_LOW:
        return [
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

      case CATEGORY.DEFAULT:
      default:
        return [
          columnTypes.patientDetails,
          columnTypes.flag,
          columnTypes.avgGlucose,
          columnTypes.timeInRangeBarChart,
          columnTypes.changeInTIR,
          columnTypes.gmi,
          columnTypes.cgmUse,
          columnTypes.tags,
          columnTypes.lastReviewed,
          columnTypes.moreMenu,
        ];
    }
  }, [category]);

  return columns;
};

export default useTableColumns;
