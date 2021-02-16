import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch } from 'react-redux';
import { translate } from 'react-i18next';
import { Box, Flex, Text } from 'rebass/styled-components';
import { push, useLocation } from 'connected-react-router';
import _ from 'lodash';
import { Title, MediumTitle } from '../../components/elements/FontStyles';
import RadioGroup from '../../components/elements/RadioGroup';
import TextInput from '../../components/elements/TextInput';
import Button from '../../components/elements/Button';
import baseTheme from '../../themes/baseTheme';
import * as actions from '../../redux/actions';
import Checkbox from '../../components/elements/Checkbox';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '../../components/elements/Dialog';

export const ClinicInvite = (props) => {
  const { t, api, trackMetric } = props;
  const dispatch = useDispatch();
  const [selectedType, setSelectedType] = useState('');
  const [prescriberPermission, setPrescriberPermission] = useState(false);
  const [email, setEmail] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const location = useLocation();
  const selectedClinic = _.get(location, 'state.clinicId', false);

  if(!selectedClinic){
    dispatch(push('/clinic-admin'));
  }

  useEffect(() => {
    if (trackMetric) {
      trackMetric('Web - Clinic Invite');
    }
  }, []);

  function handleSelectType(event) {
    setSelectedType(event.target.value);
  }

  function handleTogglePrescriberPermission(event) {
    setPrescriberPermission(event.target.checked);
  }

  function handleBack() {
    if (selectedType || prescriberPermission || email) {
      setDialogOpen(true);
    } else {
      dispatch(push('/clinic-admin'));
    }
  }

  function handleDialogClose() {
    setDialogOpen(false);
  }

  function handleDialogConfirm() {
    dispatch(push('/clinic-admin'));
  }

  function handleUpdateEmail(event) {
    setEmail(event.target.value);
  }

  function handleSubmit() {
    // TODO: API is not finalized for clinician invite send/resend
    console.log(
      'handleSubmit',
      selectedClinic,
      email,
      selectedType,
      prescriberPermission
    );
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
        px={6}
      >
        <Title flexGrow={1}>Invite team members</Title>
      </Flex>
      <Box px={6}>
        <TextInput
          id="email"
          themeProps={{
            minWidth: '250px',
            padding: `${baseTheme.space[3]}px`,
          }}
          placeholder={t('')}
          name="email"
          variant="condensed"
          value={email}
          onChange={handleUpdateEmail}
        />
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
          <Button variant="primary" m={2} onClick={handleSubmit}>
            Next
          </Button>
        </Flex>
      </Box>
      <Dialog
        id="confirmDialog"
        aria-labelledBy="dialog-title"
        open={dialogOpen}
        onClose={handleDialogClose}
      >
        <DialogTitle onClose={handleDialogClose}>
          <MediumTitle id="dialog-title">Unsaved invitation</MediumTitle>
        </DialogTitle>
        <DialogContent>
          You have a unsaved changes to this invitation which will be lost if
          you navigate away. Are you sure you wish to discard these changes?
        </DialogContent>
        <DialogActions>
          <Button variant="secondary" onClick={handleDialogClose}>
            Cancel
          </Button>
          <Button bg="feedback.danger" onClick={handleDialogConfirm}>
            Exit
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

ClinicInvite.propTypes = {
  api: PropTypes.object.isRequired,
  trackMetric: PropTypes.func.isRequired,
};

export default translate()(ClinicInvite);
