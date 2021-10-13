import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { translate, Trans } from 'react-i18next';
import { push } from 'connected-react-router';
import filter from 'lodash/filter';
import forEach from 'lodash/forEach';
import get from 'lodash/get'
import has from 'lodash/has';
import includes from 'lodash/includes';
import isEmpty from 'lodash/isEmpty';
import map from 'lodash/map';
import reject from 'lodash/reject';
import values from 'lodash/values';
import { Box, Flex, Text } from 'rebass/styled-components';
import InputIcon from '@material-ui/icons/Input';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import PublishRoundedIcon from '@material-ui/icons/PublishRounded';
import CircularProgress from '@material-ui/core/CircularProgress';
import sundial from 'sundial';

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
import baseTheme, { colors } from '../../themes/baseTheme';
import * as actions from '../../redux/actions';
import { useIsFirstRender } from '../../core/hooks';
import config from '../../config';

export const AccessManagement = (props) => {
  const { t, api, trackMetric } = props;
  const isFirstRender = useIsFirstRender();
  const dispatch = useDispatch();
  const { set: setToast } = useToasts();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showResendInviteDialog, setShowResendInviteDialog] = useState(false);
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
  const timePrefs = useSelector((state) => state.timePrefs);

  const {
    cancellingSentInvite,
    deletingPatientInvitation,
    deletingPatientFromClinic,
    fetchingAssociatedAccounts,
    fetchingClinicsByIds,
    fetchingClinicsForPatient,
    fetchingPatient,
    fetchingPendingSentInvites,
    removingMemberFromTargetCareTeam,
    settingMemberPermissions,
    resendingInvite,
    updatingPatientPermissions,
  } = useSelector((state) => state.blip.working);

  function handleAsyncResult(workingState, successMessage) {
    const { inProgress, completed, notification } = workingState;

    if (!isFirstRender && !inProgress) {
      if (completed) {
        popupState?.close();
        setShowDeleteDialog(false);
        setShowResendInviteDialog(false);

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
    handleAsyncResult(updatingPatientPermissions, t('Upload permission for {{name}} has been {{uploadPermission}}.', {
      name: selectedSharedAccount?.name,
      uploadPermission: get(clinics, [selectedSharedAccount?.id, 'patients', loggedInUserId, 'permissions', 'upload']) ? 'enabled' : 'disabled',
    }));
  }, [updatingPatientPermissions]);

  useEffect(() => {
    handleAsyncResult(resendingInvite, t('Share invitation to {{email}} has been re-sent.', {
      email: selectedSharedAccount?.email,
    }));
  }, [resendingInvite]);

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
    handleAsyncResult(deletingPatientFromClinic, t('Share access for {{name}} has been revoked.', {
      name: selectedSharedAccount?.name,
    }));
  }, [deletingPatientFromClinic]);

  useEffect(() => {
    handleAsyncResult(deletingPatientInvitation, t('Share invitation to {{name}} has been revoked.', {
      name: selectedSharedAccount?.name,
    }));
  }, [deletingPatientInvitation]);

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
          action: actions.async.fetchAssociatedAccounts.bind(null, api),
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
    const patientClinics = filter(values(clinics), ({ patients }) => has(patients, loggedInUserId));
    const clinicInvites = filter(pendingInvites, ({ clinicId }) => !isEmpty(clinicId));
    setPendingClinicInvites(clinicInvites);

    const accounts = [
      ...(map(patientClinics, clinic => ({
        id: clinic.id,
        name: clinic.name,
        nameOrderable: clinic.name.toLowerCase(),
        permissions: get(clinic, ['patients', loggedInUserId, 'permissions']),
        role: 'clinic',
        type: 'clinic',
        uploadPermission: !!get(clinic, ['patients', loggedInUserId, 'permissions', 'upload']),
      }))),
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
        created: invite.created,
      }))),
      ...(map(clinicInvites, invite => ({
        id: invite.clinicId,
        key: invite.key,
        name: get(clinics, [invite.clinicId, 'name'], ''),
        nameOrderable: get(clinics, [invite.clinicId, 'name'], '').toLowerCase(),
        permissions: invite.context,
        role: 'clinic',
        status: invite.status,
        type: invite.type,
        uploadPermission: !!get(invite, ['context', 'upload']),
      }))),
    ];

    setSharedAccounts(accounts);
  }, [
    clinics,
    membersOfTargetCareTeam,
    pendingSentInvites,
    dataDonationAccounts,
    permissionsOfMembersInTargetCareTeam,
  ]);

  useEffect(() => {
    if (selectedSharedAccount) {
      let title, submitText, body;

      if (selectedSharedAccount.type === 'clinic') {
        title = t('Leave {{name}}', { name: selectedSharedAccount.name });
        submitText = t('Leave Clinic');
        body = t('{{name}} will lose all access to your data. Are you sure you want to leave this clinic?', { name: selectedSharedAccount.name });
      }

      if (selectedSharedAccount.type === 'account') {
        title = t('Remove {{name}}', { name: selectedSharedAccount.name });
        submitText = t('Remove User');
        body = t('{{name}} will lose all access to your data. Are you sure you want to remove this user from your care team?', { name: selectedSharedAccount.name });
      }

      if (selectedSharedAccount.type === 'careteam_invitation') {
        title = t('Revoke invitation?');
        submitText = t('Revoke Invitation');
        body = (<Trans>
          Are you sure you want to revoke this share invitation to <Text as='span' fontWeight='bold'>{{member: selectedSharedAccount.email || selectedSharedAccount.name }}</Text>?
        </Trans>)
      }

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
      ...member.permissions,
      upload: member.uploadPermission ? undefined : {},
    };

    const action = member.type === 'clinic'
      ? actions.async.updatePatientPermissions(api, member.id, loggedInUserId, permissions)
      : actions.async.setMemberPermissions(api, loggedInUserId, member.id, permissions);

    dispatch(action);
  }

  function handleDelete(member) {
    if (member.type === 'clinic') {
      trackMetric('Patient - Remove clinic', {
        type: member.role,
      });

      dispatch(
        actions.async.deletePatientFromClinic(
          api,
          member.id,
          loggedInUserId
        )
      );
    } else if (member.type === 'account') {
      trackMetric('Patient - Remove shared account', {
        type: member.role,
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
        type: member.role,
      });

      const action = member.role === 'clinic'
        ? actions.async.deletePatientInvitation(api, member.id, member.key)
        : actions.async.cancelSentInvite(api, member.email);

      dispatch(action);
    }
  }

  function handleResendInvite(member) {
    trackMetric('Patient - Resend Invite', {
      type: member.role,
    });

    dispatch(
      actions.async.resendInvite(api, member.key)
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
          label={status === 'pending' ? t('invite sent') : t('invite declined')}
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

    if (includes(['account', 'clinic'], member.type)) {
      const uploadPermissionLabel = member.uploadPermission
      ? t('Remove upload permission')
      : t('Allow upload permission');

      const removeLabel = t('Remove {{memberType}}', {
        memberType: member.type,
      });

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
        iconLabel: removeLabel,
        iconPosition: 'left',
        id: `delete-${member.id}`,
        onClick: _popupState => {
          _popupState.close();
          setSelectedSharedAccount(member);
          setShowDeleteDialog(true);
        },
        text: removeLabel,
        variant: 'actionListItemDanger',
      });
    }

    if (member.type === 'careteam_invitation') {
      if (member.role === 'member') items.push({
        disabled: resendingInvite.inProgress,
        icon: InputIcon,
        iconLabel: t('Resend invitation'),
        iconPosition: 'left',
        id: `resendInvite-${member.inviteId}`,
        onClick: _popupState => {
          _popupState.close();
          setSelectedSharedAccount(member);
          setShowResendInviteDialog(true);
        },
        processing: resendingInvite.inProgress,
        text: t('Resend invitation'),
        variant: 'actionListItem',
      });

      items.push({
        icon: DeleteForeverIcon,
        iconLabel: t('Revoke invitation'),
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

  const formattedInviteDate =
    selectedSharedAccount?.created &&
    sundial.formatInTimezone(
      selectedSharedAccount?.created,
      timePrefs?.timezoneName ||
        new Intl.DateTimeFormat().resolvedOptions().timeZone,
      'MM/DD/YYYY [at] h:mm a'
    );

  return (
    <>
      <Box variant="containers.largeBordered">
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
              id="invite-member"
              variant="primary"
              onClick={() => {
                dispatch(push(`/patients/${loggedInUserId}/share/member`));
              }}
            >
              {t('Invite New Member')}
            </Button>
            {/* Clinic invite button is hidden during clinic LMR */}
            {/* {config.CLINICS_ENABLED && (
              <Button
                ml={3}
                id="invite-clinic"
                variant="secondary"
                className="active"
                onClick={() => {
                  dispatch(push(`/patients/${loggedInUserId}/share/clinic`));
                }}
              >
                {t('Invite New Clinic')}
              </Button>
            )} */}
          </Flex>
        </Flex>

        <Body2 id="member-invites-label" px={[3, 4, 5, 6]} py={[4, 5]}>{sharedAccounts.length
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
            className="remove-account-access"
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
      <Dialog
        id="resendInvite"
        aria-labelledBy="dialog-title"
        open={showResendInviteDialog}
        onClose={() => setShowResendInviteDialog(false)}
      >
        <DialogTitle onClose={() => setShowResendInviteDialog(false)}>
          <MediumTitle id="dialog-title">{t('Confirm Resending Invitation')}</MediumTitle>
        </DialogTitle>
        <DialogContent>
          <Body1>
            <Trans>
              <Text>
                You invited <Text as='span' fontWeight='bold'>{{inviteName: selectedSharedAccount?.name || selectedSharedAccount?.email}}</Text> to view your data on <Text as='span' fontWeight='bold'>{{inviteDate: formattedInviteDate}}</Text>.
              </Text>
              <Text>
                Are you sure you want to resend this invitation?
              </Text>
            </Trans>
          </Body1>
        </DialogContent>
        <DialogActions>
          <Button variant="secondary" onClick={() => setShowResendInviteDialog(false)}>
            {t('Cancel')}
          </Button>
          <Button
            className="resend-invitation"
            variant="primary"
            processing={resendingInvite.inProgress}
            onClick={() => {
              handleResendInvite(selectedSharedAccount);
            }}
          >
            {t('Resend Invitation')}
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
