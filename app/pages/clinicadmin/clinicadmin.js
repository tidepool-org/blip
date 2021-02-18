import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { translate } from 'react-i18next';
import { push } from 'connected-react-router';
import _ from 'lodash';
import {
  usePopupState,
  bindPopover,
  bindTrigger,
  bindToggle,
} from 'material-ui-popup-state/hooks';
import { Box, Flex, Text } from 'rebass/styled-components';
import SearchIcon from '@material-ui/icons/Search';
import MoreHorizRoundedIcon from '@material-ui/icons/MoreHorizRounded';
import InputIcon from '@material-ui/icons/Input';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import {
  Title,
  MediumTitle,
  Body1,
} from '../../components/elements/FontStyles';
import TextInput from '../../components/elements/TextInput';
import Button from '../../components/elements/Button';
import Table from '../../components/elements/Table';
import Icon from '../../components/elements/Icon';
import Popover from '../../components/elements/Popover';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '../../components/elements/Dialog';
import personUtils from '../../core/personutils';
import baseTheme from '../../themes/baseTheme';
import * as actions from '../../redux/actions';

const MoreMenu = (props) => {
  const popupState = usePopupState({
    variant: 'popover',
    popupId: `user-${props.userid}`,
  });
  const [showDialog, setShowDialog] = useState(false);
  const { onClick: togglePopup } = bindToggle(popupState);

  function closeDialog() {
    setShowDialog(false);
  }

  return (
    <React.Fragment>
      <Text color="text.primary">
        <Icon
          label="more"
          icon={MoreHorizRoundedIcon}
          variant="button"
          {...bindTrigger(popupState)}
        />
      </Text>

      <Popover
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        {...bindPopover(popupState)}
      >
        <Flex
          p={'10px'}
          pr={4}
          sx={{ borderBottom: baseTheme.borders.divider, cursor: 'pointer' }}
          onClick={props.handleResendInvite}
        >
          <Icon label="send" icon={InputIcon} mr={1} />
          <Text color="text.primary">Resend Invitation</Text>
        </Flex>
        <Flex
          p={'10px'}
          pr={4}
          color="feedback.danger"
          sx={{ cursor: 'pointer' }}
          onClick={() => {
            setShowDialog(true);
            togglePopup();
          }}
        >
          <Icon
            label="delete"
            icon={DeleteForeverIcon}
            mr={1}
            color="feedback.danger"
          />
          <Text>Remove User</Text>
        </Flex>
      </Popover>
      <Dialog
        id={`${props.userid}delete`}
        aria-labelledBy="dialog-title"
        open={showDialog}
        onClose={closeDialog}
      >
        <DialogTitle onClose={closeDialog}>
          <MediumTitle id="dialog-title">Remove {props.fullName}</MediumTitle>
        </DialogTitle>
        <DialogContent>
          <Body1>
            {props.fullName} will lose all access to this clinic workspace and
            its patient list. Are you sure you want to remove this user?
          </Body1>
        </DialogContent>
        <DialogActions>
          <Button variant="secondary" onClick={closeDialog}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={() => {
              props.handleDelete();
              closeDialog();
            }}
          >
            Remove User
          </Button>
        </DialogActions>
      </Dialog>
    </React.Fragment>
  );
};

export const ClinicAdmin = (props) => {
  const { t, api, trackMetric } = props;
  const dispatch = useDispatch();
  const [searchText, setSearchText] = useState('');
  const [selectedClinic, setSelectedClinic] = useState('');

  useEffect(() => {
    if (trackMetric) {
      trackMetric('Web - Clinic Admin');
    }
  }, []);

  const loggedInUserId = useSelector((state) => state.blip.loggedInUserId);
  const clinics = useSelector((state) => state.blip.clinics);
  const fetchingClinics = useSelector(
    (state) => state.blip.working.fetchingClinics
  );
  const fetchingCliniciansFromClinic = useSelector(
    (state) => state.blip.working.fetchingCliniciansFromClinic
  );
  const allUsers = useSelector((state) => state.blip.allUsersMap);
  const pendingSentInvites = useSelector(
    (state) => state.blip.pendingSentInvites
  );
  const clinicians = _.get(clinics, selectedClinic, 'clinicians', []);

  // NB: this will change heavily as the clinics API gets updated
  // TODO: dispatch fetching clinics if not inProgress or completed
  useEffect(() => {
    if (
      !fetchingClinics.inProgress &&
      !fetchingClinics.completed &&
      !fetchingClinics.notification
    ) {
      dispatch(
        actions.async.getAllClinics(api, { clinicianId: loggedInUserId })
      );
    } else {
      if (_.keys(clinics).length === 1) {
        setSelectedClinic(_.keys(clinics)[0]);
      }
      if (
        !fetchingCliniciansFromClinic.inProgress &&
        !fetchingCliniciansFromClinic.completed &&
        !fetchingCliniciansFromClinic.notification
      ) {
        _.forEach(clinics, (clinic) => {
          dispatch(actions.async.fetchCliniciansFromClinic(api, clinic.id));
        });
      }
    }
  }, [loggedInUserId, fetchingClinics, fetchingCliniciansFromClinic]);

  const clinicianArray = _.map(
    _.get(clinics, [selectedClinic, 'clinicians'], {}),
    (clinician, clinicianId) => {
      const { permissions } = clinician;
      const user = _.get(allUsers, clinicianId, {});
      const role = _.includes(permissions, 'CLINIC_ADMIN')
        ? 'Clinic Admin'
        : _.includes(permissions, 'CLINIC_MEMBER')
        ? 'Clinic Member'
        : '';
      return {
        fullName: personUtils.fullName(user),
        fullNameOrderable: (personUtils.fullName(user) || '').toLowerCase(),
        role,
        prescriberPermission: _.includes(permissions, 'CLINIC_PRESCRIBER'),
        userid: clinicianId,
        inviteSent: _.includes(pendingSentInvites, clinicianId),
        email: _.get(user, 'emails[0]'),
        permissions,
      };
    }
  );

  const userPermissionsInClinic = _.get(
    _.find(clinicianArray, { userid: loggedInUserId }),
    'permissions',
    []
  );

  function handleSearchChange(event) {
    setSearchText(event.target.value);
  }

  function handleEdit(userid) {
    dispatch(
      push('/clinician-edit', {
        clinicianId: userid,
        clinicId: selectedClinic,
      })
    );
  }

  function handleDelete(selectedClinicianId) {
    // TODO: dispatch(actions.async.deleteClinicianFromClinic(api,selectedClinic,selectedClinicianId))
    console.log(
      'deleteClinicianFromClinic',
      selectedClinic,
      selectedClinicianId
    );
  }

  function handleResendInvite(selectedClinicianId) {
    // TODO: API is not finalized for clinician invite send/resend
    console.log('handleResendInvite', selectedClinicianId);
  }

  const renderClinician = ({ fullName, email }) => (
    <Box>
      <Text fontWeight="medium">{fullName}</Text>
      <Text>{email || '\u00A0'}</Text>
    </Box>
  );

  const renderStatus = ({ inviteSent }) => (
    <Box>
      <Text fontWeight="medium">
        {inviteSent ? 'Pending' : 'No Pending Invite'}
      </Text>
    </Box>
  );

  const renderPermission = ({ prescriberPermission }) => (
    <Box>
      <Text fontWeight="medium">
        {prescriberPermission ? 'Prescriber' : 'Nonprescriber'}
      </Text>
    </Box>
  );

  const renderRole = ({ role }) => (
    <Box>
      <Text fontWeight="medium">{role}</Text>
    </Box>
  );

  const renderEdit = ({ userid }) => (
    <Button
      p={0}
      fontSize="inherit"
      variant="textPrimary"
      onClick={() => handleEdit(userid)}
    >
      Edit
    </Button>
  );

  const renderMore = ({ ...props }) => (
    <MoreMenu
      handleDelete={() => handleDelete(props.userid)}
      handleResendInvite={() => handleResendInvite(props.userid)}
      {...props}
    ></MoreMenu>
  );

  const columns = [
    {
      title: 'Name',
      field: 'fullName',
      align: 'left',
      sortable: true,
      sortBy: 'fullNameOrderable',
      render: renderClinician,
      searchable: true,
      searchBy: ['fullName'],
    },
    {
      title: 'Status',
      field: 'inviteSent',
      align: 'left',
      sortable: true,
      sortBy: 'inviteSent',
      render: renderStatus,
    },
    {
      title: 'Permission',
      field: 'prescriberPermission',
      align: 'left',
      sortable: true,
      sortBy: 'prescriberPermission',
      render: renderPermission,
    },
    {
      title: 'Role',
      field: 'role',
      align: 'left',
      sortable: true,
      sortBy: 'role',
      render: renderRole,
    },
  ];

  if (_.includes(userPermissionsInClinic, 'CLINIC_ADMIN')) {
    columns.push(
      {
        title: '',
        field: 'edit',
        render: renderEdit,
        align: 'left',
      },
      {
        title: '',
        field: 'more',
        render: renderMore,
        align: 'left',
      }
    );
  }

  return (
    <Box
      mx={'auto'}
      my={2}
      bg="white"
      width={[1, 0.75, 0.75, 0.5]}
      sx={{
        border: baseTheme.borders.default,
        borderRadius: baseTheme.radii.default,
      }}
    >
      <Flex
        sx={{ borderBottom: baseTheme.borders.default }}
        alignItems={'center'}
      >
        <Title p={4} flexGrow={1}>
          Access Management
        </Title>
        <Box>
          <Button
            mr={4}
            variant="primary"
            onClick={() => {
              dispatch(push('/clinic-invite', { clinicId: selectedClinic }));
            }}
          >
            Invite new clinic team member
          </Button>
        </Box>
      </Flex>

      <Box mx={4}>
        <TextInput
          themeProps={{
            minWidth: '250px',
            py: 3,
          }}
          placeholder={t('search')}
          icon={SearchIcon}
          name="search-members"
          onChange={handleSearchChange}
          variant="condensed"
        />
        <Table
          id={'clinicianTable'}
          lablel={'cliniciantablelabel'}
          columns={columns}
          data={clinicianArray}
          orderBy="fullNameOrderable"
          order="asc"
          searchText={searchText}
          rowsPerPage={8}
          pagination={true}
          style={{ fontSize: '14px' }}
          label=""
        />
      </Box>
    </Box>
  );
};

ClinicAdmin.propTypes = {
  api: PropTypes.object.isRequired,
  trackMetric: PropTypes.func.isRequired,
};

export default translate()(ClinicAdmin);
