import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import {
  PatientCell,
  ConnectionStatusCell,
  DeviceNameCell,
  StatusDescriptionCell,
  LastContactCell,
  MoreMenuCell,
} from './Cells';

import TagListCell from '../components/TagListCell';

const useTableColumns = () => {
  const { t } = useTranslation();
  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);
  const clinic = useSelector(state => state.blip.clinics?.[selectedClinicId]);

  const showTags = clinic?.entitlements?.patientTags;

  const columns = useMemo(() => {
    return [
      {
        title: t('Patient Details'),
        field: 'fullName',
        align: 'left',
        render: patient => <PatientCell patient={patient} />,
      },
      (showTags && {
        title: t('Tags'),
        field: 'tags',
        align: 'left',
        render: patient => <TagListCell patient={patient} /> }
      ),
      {
        title: t('Device'),
        field: 'device',
        render: patient => <DeviceNameCell patient={patient} />,
      },
      {
        title: t('Connection Status'),
        field: 'connectionStatus',
        render: patient => <ConnectionStatusCell patient={patient} />,
      },
      {
        title: t('Status Description'),
        field: 'statusDescription',
        align: 'left',
        render: patient => <StatusDescriptionCell patient={patient} />,
      },
      {
        title: t('Last Contact'),
        field: 'lastContact',
        align: 'left',
        render: patient => <LastContactCell patient={patient} />,
      },
      {
        title: t(''),
        field: 'more',
        align: 'left',
        render: patient => <MoreMenuCell patient={patient} />,
      }, // More
    ].filter(column => !!column);
  }, [showTags]);

  return columns;
};

export default useTableColumns;
