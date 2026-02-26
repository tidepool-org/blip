import React from 'react';
import { useTranslation } from 'react-i18next';

import PopoverMenu from '../../../components/elements/PopoverMenu';
import EditIcon from '@material-ui/icons/EditRounded';
import MoreVertRoundedIcon from '@material-ui/icons/MoreVertRounded';
import { useDispatch } from 'react-redux';
import { setEditPatientDialogIsOpen, setEditPatientDialogPatientId } from './deviceIssuesSlice';

const MoreMenuCell = ({ patient }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  // const handleEditPatient = useCallback(() => {
  //   editPatient(patient, setSelectedPatient, selectedClinicId, trackMetric, setShowEditPatientDialog, 'action menu');
  // }, [patient, setSelectedPatient, selectedClinicId, trackMetric, setShowEditPatientDialog]);

  const handleEditPatient = () => {
    dispatch(setEditPatientDialogIsOpen(true));
    dispatch(setEditPatientDialogPatientId(patient.id));
  };

  return (
    <PopoverMenu
      id={`action-menu-${patient?.id}`}
      items={[{
        icon: EditIcon,
        iconLabel: t('Edit Patient Details'),
        iconPosition: 'left',
        id: `edit-${patient?.id}`,
        variant: 'actionListItem',
        onClick: (_popupState) => {
          _popupState.close();
          handleEditPatient(patient);
        },
        text: t('Edit Patient Details'),
      }]}
      icon={MoreVertRoundedIcon}
      sx={{ position: 'relative', left: '-2px' }}
    />
  );
};

export default MoreMenuCell;
