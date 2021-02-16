import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { useLocation } from 'react-router-dom';
import { translate } from 'react-i18next';
import { push } from 'connected-react-router';
import _ from 'lodash';
import { Box, Flex, Text } from 'rebass/styled-components';
import { Title, MediumTitle } from '../../components/elements/FontStyles';
import RadioGroup from '../../components/elements/RadioGroup';
import Button from '../../components/elements/Button';
import Checkbox from '../../components/elements/Checkbox';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '../../components/elements/Dialog';
import * as actions from '../../redux/actions';
import baseTheme from '../../themes/baseTheme';
import personUtils from '../../core/personutils';

export const ClinicianEdit = (props) => {
  const { t, api, trackMetric } = props;
  const dispatch = useDispatch();

  const [formTouched, setFormTouched] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const location = useLocation();
  const selectedClinicianId = _.get(location, 'state.clinicianId', false);

  if (!selectedClinicianId) {
    dispatch(push('/clinic-admin'));
  }

  const selectedClinician = useSelector((state) =>
    _.get(state, ['blip', 'allUsersMap', selectedClinicianId])
  );
  const selectedClinic = _.get(location, 'state.clinicId', false);
  const selectedClinicianPermissions = useSelector((state) =>
    _.get(state, [
      'blip',
      'clinics',
      selectedClinic,
      'clinicians',
      selectedClinicianId,
      'permissions',
    ])
  );
  const [prescriberPermission, setPrescriberPermission] = useState(
    _.includes(selectedClinicianPermissions, 'PRESCRIBER' ? true : false)
  );
  const [selectedType, setSelectedType] = useState(
    _.includes(selectedClinicianPermissions, 'CLINIC_ADMIN')
      ? 'CLINIC_ADMIN'
      : 'CLINIC_MEMBER'
  );
  const fullName = personUtils.fullName(selectedClinician);

  useEffect(() => {
    if (trackMetric) {
      trackMetric('Web - Clinician Edit');
    }
  }, []);

  function handleClickDelete() {
    setDeleteDialogOpen(true);
  }

  function handleSelectType(event) {
    setSelectedType(event.target.value);
    setFormTouched(true);
  }

  function handleTogglePrescriberPermission(event) {
    setPrescriberPermission(event.target.checked);
    setFormTouched(true);
  }

  function handleBack() {
    if (formTouched) {
      setConfirmDialogOpen(true);
    } else {
      dispatch(push('/clinic-admin'));
    }
  }

  function handleCloseDeleteDialog() {
    setDeleteDialogOpen(false);
  }

  function handleConfirmDeleteDialog() {
    // TODO: dispatch(actions.async.deleteClinicianFromClinic(api,selectedClinic,selectedClinicianId))
    console.log('deleteClinicianFromClinic',selectedClinic,selectedClinicianId);
    dispatch(push('/clinic-admin'));
  }

  function handleCloseConfirmDialog() {
    setConfirmDialogOpen(false);
  }

  function handleExitConfirmDialog() {
    dispatch(push('/clinic-admin'));
  }

  function handleSave() {
    const updatedPermissions = [];
    updatedPermissions.push(selectedType)
    if(prescriberPermission) updatedPermissions.push('PRESCRIBER');
    const updates = {permissions: updatedPermissions}
    // TODO: dispatch(actions.async.updateClinician(api,selectedClinic,selectedClinician,updates));
    console.log('updateClinician',selectedClinic,selectedClinician,updates);
    dispatch(push('/clinic-admin'));
  }

  const clinicAdminDesc = (
    <>
      <Title>Clinic Admin</Title>
      <Text>
        Clinic administrators have full read and edit access to access. Clinic
        administrators have full read and edit access to access{' '}
      </Text>
    </>
  );

  const clinicMemberDesc = (
    <>
      <Title>Clinic Member</Title>
      <Text>
        Clinic members have read access to access management. More details are
        described here.{' '}
      </Text>
    </>
  );

  return (
    <Box
      mx={'auto'}
      my={2}
      bg="white"
      width={[1, 0.75, 0.75, 0.5]}
      sx={{ border: baseTheme.borders.default }}
    >
      <Flex
        sx={{ borderBottom: baseTheme.borders.default }}
        alignItems={'center'}
        p={4}
        mb={4}
        px={6}
      >
        <Box flexGrow={1}>
          <Text fontWeight="medium">{fullName}</Text>
          <Text>{_.get(selectedClinician, 'emails[0]') || '\u00A0'}</Text>
        </Box>
        <Text color="feedback.danger" onClick={() => handleClickDelete()}>
          Remove User
        </Text>
      </Flex>
      <Box px={6}>
        <RadioGroup
          id="clinician-type"
          options={[
            { value: 'CLINIC_ADMIN', label: clinicAdminDesc },
            { value: 'CLINIC_MEMBER', label: clinicMemberDesc },
          ]}
          required={true}
          value={selectedType}
          onChange={handleSelectType}
          variant={'verticalBordered'}
        />
        <Box p={4} my={4} bg="lightestGrey">
          <Checkbox
            label={'Prescribing access'}
            checked={prescriberPermission}
            onChange={handleTogglePrescriberPermission}
            themeProps={{ bg: 'lightestGrey' }}
          />
        </Box>
        <Flex p={4} justifyContent="flex-end">
          <Button variant="secondary" m={2} onClick={handleBack}>
            Back
          </Button>
          <Button variant="primary" m={2} onClick={handleSave}>
            Save
          </Button>
        </Flex>
      </Box>
      <Dialog
        id="deleteDialog"
        aria-labelledBy="dialog-title"
        open={deleteDialogOpen}
        onClose={handleCloseDeleteDialog}
      >
        <DialogTitle onClose={handleCloseDeleteDialog}>
          <MediumTitle id="dialog-title">
            Remove {fullName}
          </MediumTitle>
        </DialogTitle>
        <DialogContent>
          {fullName} will lose all access to this
          clinic workspace and its patient list. Are you sure you want to remove
          this user?
        </DialogContent>
        <DialogActions>
          <Button variant="secondary" onClick={handleCloseDeleteDialog}>
            Cancel
          </Button>
          <Button bg="feedback.danger" onClick={handleConfirmDeleteDialog}>
            Remove User
          </Button>
        </DialogActions>
      </Dialog>
      <Dialog
        id="confirmDialog"
        aria-labelledBy="dialog-title"
        open={confirmDialogOpen}
        onClose={handleCloseConfirmDialog}>
        <DialogTitle onClose={handleCloseConfirmDialog}>
          <MediumTitle id="dialog-title">Unsaved changes</MediumTitle>
        </DialogTitle>
        <DialogContent>
          You have a unsaved changes to this clinician which will be lost if you navigate away. Are you sure you wish to discard these changes?
        </DialogContent>
        <DialogActions>
          <Button variant="secondary" onClick={handleCloseConfirmDialog}>
            Cancel
          </Button>
          <Button bg="feedback.danger" onClick={handleExitConfirmDialog}>
            Exit
          </Button>
          </DialogActions>
      </Dialog>
    </Box>
  );
};

ClinicianEdit.propTypes = {
  api: PropTypes.object.isRequired,
  trackMetric: PropTypes.func.isRequired,
};

export default translate()(ClinicianEdit);
