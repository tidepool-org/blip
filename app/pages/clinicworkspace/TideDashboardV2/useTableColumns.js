import React from 'react';
import { useTranslation } from 'react-i18next';

import {
  PatientCell,
} from './Cells';

const getColumnTypes = (t, category) => ({
  patientDetails: {
    title: t('Patient Details'),
    field: 'fullName',
    align: 'left',
    render: patient => <PatientCell patient={patient} />,
  },
  placeholder: {
    title: t('Placeholder'),
    field: 'placeholder',
    align: 'center',
    render: patient => null,
  },
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
