import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { translate } from 'react-i18next';
import { push } from 'connected-react-router';
import get from 'lodash/get'
import values from 'lodash/values';
import map from 'lodash/map';
import has from 'lodash/has';
import reject from 'lodash/reject';
import forEach from 'lodash/forEach';
import filter from 'lodash/filter';
import isEmpty from 'lodash/isEmpty';
import { Box, Flex, Text } from 'rebass/styled-components';
import InputIcon from '@material-ui/icons/Input';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import PublishRoundedIcon from '@material-ui/icons/PublishRounded';
import CircularProgress from '@material-ui/core/CircularProgress';

import {
  Title,
  MediumTitle,
  Body1,
  Body2,
} from '../../components/elements/FontStyles';

import Button from '../../components/elements/Button';
import Table from '../../components/elements/Table';
import PopoverMenu from '../../components/elements/PopoverMenu';
import Pill from '../../components/elements/Pill';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '../../components/elements/Dialog';

import { useToasts } from '../../providers/ToastProvider';
import personUtils from '../../core/personutils';
import baseTheme from '../../themes/baseTheme';
import * as actions from '../../redux/actions';
import { useIsFirstRender } from '../../core/hooks';
import { colors } from '../../themes/baseTheme';

export const AccessManagement = (props) => {
  const { t, api, trackMetric } = props;
  const isFirstRender = useIsFirstRender();
  const dispatch = useDispatch();
  const { set: setToast } = useToasts();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [sharedAccounts, setSharedAccounts] = useState([]);
  const [pendingClinicInvites, setPendingClinicInvites] = useState([]);
  const [selectedSharedAccount, setSelectedSharedAccount] = useState(null);
  const [deleteDialogContent, setDeleteDialogContent] = useState(null);
  const [popupState, setPopupState] = useState(null);

  useEffect(() => {
    if (trackMetric) {
      trackMetric('Viewed Share');
    }
  }, []);

  const allUsers = useSelector((state) => state.blip.allUsersMap);
  const clinics = useSelector((state) => state.blip.clinics);
  const dataDonationAccounts = useSelector((state) => state.blip.dataDonationAccounts);
  const loggedInUserId = useSelector((state) => state.blip.loggedInUserId);
  const membersOfTargetCareTeam = useSelector((state) => state.blip.membersOfTargetCareTeam);
  const pendingSentInvites = useSelector((state) => state.blip.pendingSentInvites);
  const permissionsOfMembersInTargetCareTeam = useSelector((state) => state.blip.permissionsOfMembersInTargetCareTeam);

  const {
    fetchingPatient,
    fetchingClinicsByIds,
    fetchingClinicsForPatient,
    fetchingPendingSentInvites,
    fetchingAssociatedAccounts,
    settingMemberPermissions,
    sendingInvite,
    cancellingSentInvite,
    removingMemberFromTargetCareTeam,
  } = useSelector((state) => state.blip.working);

  function handleAsyncResult(workingState, successMessage) {
    const { inProgress, completed, notification } = workingState;

    if (!isFirstRender && !inProgress) {
      if (completed) {
        popupState?.close();
        setShowDeleteDialog(false);

        setToast({
          message: successMessage,
          variant: 'success',
        });

        setSelectedSharedAccount(null);
        setPopupState(null);
      }

      if (completed === false) {
        setToast({
          message: get(notification, 'message'),
          variant: 'danger',
        });
      }
    }
  }

  useEffect(() => {
    handleAsyncResult(settingMemberPermissions, t('Upload permission for {{name}} has been {{uploadPermission}}.', {
      name: selectedSharedAccount?.name,
      uploadPermission: get(permissionsOfMembersInTargetCareTeam, [selectedSharedAccount?.id, 'upload']) ? 'enabled' : 'disabled',
    }));
  }, [settingMemberPermissions]);

  useEffect(() => {
    handleAsyncResult(sendingInvite, t('Share invitation to {{email}} has been re-sent.', {
      email: selectedSharedAccount?.email,
    }));
  }, [sendingInvite]);

  useEffect(() => {
    handleAsyncResult(cancellingSentInvite, t('Share invitation to {{email}} has been revoked.', {
      email: selectedSharedAccount?.email,
    }));
  }, [cancellingSentInvite]);

  useEffect(() => {
    handleAsyncResult(removingMemberFromTargetCareTeam, t('Share access for {{name}} has been revoked.', {
      name: selectedSharedAccount?.name,
    }));
  }, [removingMemberFromTargetCareTeam]);

  useEffect(() => {
    const { inProgress, completed, notification } = fetchingClinicsByIds;

    if (!isFirstRender && !inProgress && completed === false) {
      setToast({
        message: get(notification, 'message'),
        variant: 'danger',
      });
    }
  }, [fetchingClinicsByIds]);

  // Fetchers
  useEffect(() => {
    if (loggedInUserId) {
      forEach([
        {
          workingState: fetchingPatient,
          action: actions.async.fetchPatient.bind(null, api, loggedInUserId),
        },
        {
          workingState: fetchingClinicsForPatient,
          action: actions.async.fetchClinicsForPatient.bind(null, api, loggedInUserId),
        },
        {
          workingState: fetchingPendingSentInvites,
          action: actions.async.fetchPendingSentInvites.bind(null, api, loggedInUserId),
        },
        {
          workingState: fetchingAssociatedAccounts,
          action: actions.async.fetchAssociatedAccounts.bind(null, api, loggedInUserId),
        },
      ], ({ workingState, action }) => {
        if (
          !workingState.inProgress &&
          !workingState.completed &&
          !workingState.notification
        ) {
          dispatch(action());
        }
      });
    }
  }, [loggedInUserId]);

  // Fetcher for clinics with pending invites
  useEffect(() => {
    const clinicIds = map(filter(pendingClinicInvites, ({ clinicId }) => !clinics[clinicId]), 'clinicId');

    if (
      clinicIds.length &&
      !fetchingClinicsByIds.inProgress &&
      !fetchingClinicsByIds.completed &&
      !fetchingClinicsByIds.notification
    ) {
      dispatch(actions.async.fetchClinicsByIds(api, clinicIds));
    }
  }, [pendingClinicInvites]);

  useEffect(() => {
    const pendingInvites = reject(pendingSentInvites, personUtils.isDataDonationAccount);
    const pendingMemberInvites = filter(pendingInvites, ({ email }) => !isEmpty(email));
    const clinicInvites = filter(pendingInvites, ({ clinicId }) => !isEmpty(clinicId));
    setPendingClinicInvites(clinicInvites);

    const sharedAccounts = [
      ...(filter(values(clinics), ({ patients }) => has(patients, loggedInUserId))),
      ...(map(membersOfTargetCareTeam, memberId => ({
        email: get(allUsers, [memberId, 'emails', '0']),
        id: get(allUsers, [memberId, 'userid']),
        name: personUtils.fullName(allUsers[memberId]),
        nameOrderable: (personUtils.fullName(allUsers[memberId]) || '').toLowerCase(),
        permissions: get(permissionsOfMembersInTargetCareTeam, [memberId]),
        role: 'member',
        type: 'account',
        uploadPermission: !!get(permissionsOfMembersInTargetCareTeam, [memberId, 'upload']),
      }))),
      ...(map(pendingMemberInvites, invite => ({
        email: invite.email,
        key: invite.key,
        nameOrderable: invite.email,
        permissions: invite.context,
        role: 'member',
        status: invite.status,
        type: invite.type,
        uploadPermission: !!get(invite, ['context', 'upload']),
      }))),
      ...(map(clinicInvites, invite => ({
        id: invite.clinicId,
        key: invite.key,
        name: get(clinics, [invite.clinicId, 'name'], ''),
        nameOrderable: get(clinics, [invite.clinicId, 'name'], ''),
        permissions: invite.context,
        role: 'clinic',
        status: invite.status,
        type: invite.type,
        uploadPermission: !!get(invite, ['context', 'upload']),
      }))),
    ];

    setSharedAccounts(sharedAccounts);
  }, [
    clinics,
    membersOfTargetCareTeam,
    pendingSentInvites,
    dataDonationAccounts,
    permissionsOfMembersInTargetCareTeam,
  ]);

  useEffect(() => {
    if (selectedSharedAccount) {
      const title = selectedSharedAccount?.type === 'account'
      ? t('Remove {{name}}', { name: selectedSharedAccount?.name })
      : t('Revoke invitation?');

      const submitText = selectedSharedAccount?.type === 'account'
        ? t('Remove User')
        : t('Revoke Invitation');

      const body = selectedSharedAccount?.type === 'account'
        ? t('{{name}} will lose all access to your data. Are you sure you want to remove this user?', { name: selectedSharedAccount?.name })
        : t('Are you sure you want to revoke this share invitation to {{member}}?', { member: selectedSharedAccount?.email || selectedSharedAccount?.name });

      setDeleteDialogContent({
        title,
        body,
        submitText,
      })
    }
  }, [selectedSharedAccount]);

  function handleUploadPermissionsToggle(member) {
    trackMetric(`upload permission turned ${member.uploadPermission ? 'off' : 'on'}`);

    const permissions = {
      view: {},
      note: {},
      upload: member.uploadPermission ? undefined : {},
    };

    dispatch(
      actions.async.setMemberPermissions(api, loggedInUserId, member.id, permissions)
    );
  }

  function handleDelete(member) {
    // TODO: does remove clinic exist on backend?
    if (member.type === 'account') {
      trackMetric('Patient - Remove shared account', {
        type: member.clinicId ? 'clinic' : 'member',
      });

      dispatch(
        actions.async.removeMemberFromTargetCareTeam(
          api,
          loggedInUserId,
          member.id
        )
      );
    } else if (member.type === 'careteam_invitation') {
      trackMetric('Patient - Cancel Invite', {
        type: member.clinicId ? 'clinic' : 'member',
      });

      dispatch(
        actions.async.cancelSentInvite(api, member.email)
      );
    }
  }

  function handleResendInvite(member) {
    trackMetric('Patient - Resend Invite', {
      type: member.clinicId ? 'clinic' : 'member',
    });

    dispatch(
      actions.async.sendInvite(api, member.email, member.permissions, member.key)
    );
  }

  const renderMember = ({ email, name }) => (
    email ? (
      <Box>
        <Text>{name}</Text>
        <Text>{email}</Text>
      </Box>
    ) : (
      <Box>
        <Text>{name}</Text>
      </Box>
    )
  );

  const renderStatus = ({ status }) => (
    <Box>
      {status ? (
        <Pill
          text={status === 'pending' ? t('invite sent') : t('invite declined')}
          colorPalette={status === 'pending' ? colors.status.pending : colors.status.declined}
        />
      ) : ''}
    </Box>
  );

  const renderUploadPermission = ({ uploadPermission }) => (
    <Box>
      <Text>
        {uploadPermission ? t('Yes') : ''}
      </Text>
    </Box>
  );

  const renderRole = ({ role }) => (
    <Box>
      <Text sx={{ textTransform: 'capitalize' }}>{role}</Text>
    </Box>
  );

  const renderMore = member => {
    const items = [];

    if (member.type === 'account') {
      const uploadPermissionLabel = !!get(member.permissions, 'upload')
      ? t('Remove upload permission')
      : t('Allow upload permission');

      items.push({
        disabled: settingMemberPermissions.inProgress,
        icon: settingMemberPermissions.inProgress ? CircularProgress : PublishRoundedIcon,
        iconLabel: uploadPermissionLabel,
        iconPosition: 'left',
        id: `upload-permission-${member.userId}`,
        onClick: _popupState => {
          setPopupState(_popupState);
          setSelectedSharedAccount(member);
          handleUploadPermissionsToggle(member);
        },
        processing: settingMemberPermissions.inProgress,
        text: uploadPermissionLabel,
        variant: 'actionListItem',
      });

      items.push({
        icon: DeleteForeverIcon,
        iconLabel: t('Remove Member'),
        iconPosition: 'left',
        id: `delete-${member.userId}`,
        onClick: _popupState => {
          _popupState.close();
          setSelectedSharedAccount(member);
          setShowDeleteDialog(true);
        },
        text: t('Remove Member'),
        variant: 'actionListItemDanger',
      });
    }

    if (member.type === 'careteam_invitation') {
      if (member.role === 'member') items.push({
        disabled: sendingInvite.inProgress,
        icon: InputIcon,
        iconLabel: t('Resend Invitation'),
        iconPosition: 'left',
        id: `resendInvite-${member.inviteId}`,
        onClick: _popupState => {
          setPopupState(_popupState);
          setSelectedSharedAccount(member);
          handleResendInvite(member);
        },
        processing: sendingInvite.inProgress,
        text: t('Resend invitation'),
        variant: 'actionListItem',
      });

      items.push({
        icon: DeleteForeverIcon,
        iconLabel: t('Delete Invitation'),
        iconPosition: 'left',
        id: `deleteInvite-${member.inviteId}`,
        onClick: _popupState => {
          _popupState.close();
          setSelectedSharedAccount(member);
          setShowDeleteDialog(true);
        },
        text: t('Revoke invitation'),
        variant: 'actionListItemDanger',
      });
    }

    return (
      <Box onClick={e => {
        // Prevent clicks from propogating up to the table row click handlers
        e.stopPropagation();
      }}>
        <PopoverMenu
          id="access-management-actions"
          label="Access Management actions"
          items={items}
        />
      </Box>
    );
  };

  const columns = [
    {
      title: t('Name'),
      field: 'nameOrderable',
      align: 'left',
      sortable: true,
      sortBy: 'nameOrderable',
      render: renderMember,
    },
    {
      title: t('Status'),
      field: 'status',
      align: 'left',
      sortable: true,
      sortBy: 'status',
      render: renderStatus,
    },
    {
      title: t('Upload Permission'),
      field: 'uploadPermission',
      align: 'left',
      sortable: true,
      sortBy: 'uploadPermission',
      render: renderUploadPermission,
    },
    {
      title: t('Role'),
      field: 'role',
      align: 'left',
      sortable: true,
      sortBy: 'role',
      render: renderRole,
    },
    {
      title: '',
      field: 'more',
      render: renderMore,
      align: 'left',
    },
  ];

  return (
    <>
      <Box
        mx="auto"
        mt={2}
        mb={6}
        bg="white"
        width={[1, 0.85]}
        sx={{
          border: baseTheme.borders.default,
          borderLeft: ['none', baseTheme.borders.default],
          borderRight: ['none', baseTheme.borders.default],
          borderRadius: ['none', baseTheme.radii.default],
          maxWidth: '1280px',
        }}
      >
        <Flex
          sx={{ borderBottom: baseTheme.borders.default }}
          alignItems={'center'}
          flexWrap={['wrap', 'nowrap']}
          px={[3, 4, 5, 6]}
        >
          <Title flexGrow={1} pr={[0, 3]} py={[3, 4]} textAlign={['center', 'left']}>
            {t('Access Management')}
          </Title>
          <Flex width={['100%', 'auto']} justifyContent='center' pb={[3, 0]}>
            <Button
              variant="primary"
              onClick={() => {
                dispatch(push(`/patients/${loggedInUserId}/share/member`));
              }}
            >
              {t('Invite new member')}
            </Button>
            <Button
              ml={3}
              variant="secondary"
              className="active"
              onClick={() => {
                dispatch(push(`/patients/${loggedInUserId}/share/clinic`));
              }}
            >
              {t('Invite new clinic')}
            </Button>
          </Flex>
        </Flex>

        <Body2 px={[3, 4, 5, 6]} py={[4, 5]}>{sharedAccounts.length
          ? t('You have invited the following members to view your data:')
          : t('You have not invited any other members to view your data.')}
        </Body2>

        {!!sharedAccounts.length && (
          <Box px={[0, 0, 5, 6] } pb={[0, 0, 7, 8]}>
            <Table
              id="clinicianTable"
              label={t('Clinician Table')}
              columns={columns}
              data={sharedAccounts}
              orderBy="nameOrderable"
              order="asc"
              rowsPerPage={10}
              pagination={sharedAccounts.length > 10}
              fontSize={1}
            />
          </Box>
        )}
      </Box>
      <Dialog
        id="deleteUser"
        aria-labelledBy="dialog-title"
        open={showDeleteDialog}
        onClose={() => setShowDeleteDialog(false)}
        zIndex="1301"
      >
        <DialogTitle onClose={() => setShowDeleteDialog(false)}>
          <MediumTitle id="dialog-title">{deleteDialogContent?.title}</MediumTitle>
        </DialogTitle>
        <DialogContent>
          <Body1>
            {deleteDialogContent?.body}
          </Body1>
        </DialogContent>
        <DialogActions>
          <Button variant="secondary" onClick={() => setShowDeleteDialog(false)}>
            {t('Cancel')}
          </Button>
          <Button
            variant="danger"
            processing={cancellingSentInvite.inProgress || removingMemberFromTargetCareTeam.inProgress}
            onClick={() => {
              handleDelete(selectedSharedAccount);
            }}
          >
            {deleteDialogContent?.submitText}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

AccessManagement.propTypes = {
  api: PropTypes.object.isRequired,
  trackMetric: PropTypes.func.isRequired,
};

export default translate()(AccessManagement);
