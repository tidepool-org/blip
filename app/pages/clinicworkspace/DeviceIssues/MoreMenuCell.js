import React from 'react';
import { useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';

import {
  setEditPatientDialogIsOpen,
  setEditPatientDialogPatientId,
  setDataConnectionsModalIsOpen,
  setDataConnectionsModalPatientId,
} from './deviceIssuesSlice';

import PopoverMenu from '../../../components/elements/PopoverMenu';
import EditIcon from '@material-ui/icons/EditRounded';
import DataInIcon from '../../../core/icons/DataInIcon.svg'
import VisibilityOffIcon from '@material-ui/icons/VisibilityOff';
import VisibilityIcon from '@material-ui/icons/Visibility';

const MoreMenuCell = ({ patient }) => {
  const { t } = useTranslation();
  const dispatch = useDispatch();

  const handleOpenEditPatientDialog = () => {
    dispatch(setEditPatientDialogIsOpen(true));
    dispatch(setEditPatientDialogPatientId(patient.id));
  };

  const handleOpenDataConnectionsModal = () => {
    dispatch(setDataConnectionsModalIsOpen(true));
    dispatch(setDataConnectionsModalPatientId(patient.id));
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
          handleOpenEditPatientDialog();
        },
        text: t('Edit Patient Details'),
      }, {
        iconSrc: DataInIcon,
        iconLabel: t('Bring Data into Tidepool'),
        iconPosition: 'left',
        id: `edit-data-connections-${patient?.id}`,
        variant: 'actionListItem',
        onClick: (_popupState) => {
          _popupState.close();
          handleOpenDataConnectionsModal();
        },
        text: t('Bring Data into Tidepool'),
      }]}
      sx={{ position: 'relative', left: '-2px' }}
    />
  );
};

export default MoreMenuCell;
