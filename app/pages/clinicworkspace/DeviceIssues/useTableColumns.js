import React, { useMemo } from 'react';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';

import PatientCell from './PatientCell';
import TagListCell from '../components/TagListCell';
import MoreMenuCell from './MoreMenuCell';

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
      {
        title: t('Device'),
        field: 'device',
        align: 'left',
      },
      {
        title: t('Connection Status'),
        field: 'connectionStatus',
        align: 'left',
      },
      {
        title: t('Last Update'),
        field: 'lastUpdate',
        align: 'left',
      },
      (showTags && {
        title: t('Tags'),
        field: 'tags',
        align: 'left',
        render: patient => <TagListCell patient={patient} /> }
      ),
      {
        title: t('Last Outreach'),
        field: 'lastOutreach',
        align: 'left',
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
