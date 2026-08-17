import React from 'react';
import { useTranslation } from 'react-i18next';

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
  FlagCell,
} from './Cells';

import TagListCell from '../components/TagListCell';

const getColumnTypes = (t, category, thresholds) => ({
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
    render: patient => <FlagCell category={category} patient={patient} />,
  },
  avgGlucose: {
    title: t('Avg Glucose'),
    field: 'avgGlucose',
    align: 'center',
    titleComponent: () => <AvgGlucoseHeader />,
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
    titleComponent: () => <ChangeTIRHeader />,
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
    render: patient => null, // TODO: Implement
  },
  moreMenu: {
    title: '',
    field: 'moreMenu',
    align: 'center',
    render: patient => null, // TODO: Implement
  }, // More
});

const useTableColumns = (category) => {
  const { t } = useTranslation();

  const columnTypes = getColumnTypes(t, category);

  return [
    columnTypes.patientDetails,
    columnTypes.placeholder,
    columnTypes.placeholder,
    columnTypes.placeholder,
    columnTypes.placeholder,
    columnTypes.placeholder,
    columnTypes.placeholder,
    columnTypes.placeholder,
  ];
};

export default useTableColumns;
