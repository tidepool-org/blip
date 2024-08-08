import React, { useEffect, useState } from 'react';
import PropTypes from 'prop-types';
import { useDispatch, useSelector } from 'react-redux';
import { withTranslation, Trans } from 'react-i18next';
import { push } from 'connected-react-router';
import compact from 'lodash/compact';
import filter from 'lodash/filter';
import find from 'lodash/find';
import get from 'lodash/get'
import has from 'lodash/has';
import includes from 'lodash/includes';
import isEmpty from 'lodash/isEmpty'
import keyBy from 'lodash/keyBy';
import map from 'lodash/map';
import mapValues from 'lodash/mapValues';
import { Box, Flex, Link, Text } from 'theme-ui';
import CloseRoundedIcon from '@material-ui/icons/CloseRounded';
import DeleteForeverIcon from '@material-ui/icons/DeleteForever';
import EditIcon from '@material-ui/icons/EditRounded';
import InputIcon from '@material-ui/icons/Input';
import SearchIcon from '@material-ui/icons/Search';
import sundial from 'sundial';
import { useFormik } from 'formik';
import { useFlags } from 'launchdarkly-react-client-sdk';

import {
  Title,
  MediumTitle,
  Body1,
} from '../../components/elements/FontStyles';

import TextInput from '../../components/elements/TextInput';
import Button from '../../components/elements/Button';
import Table from '../../components/elements/Table';
import Pagination from '../../components/elements/Pagination';
import PopoverMenu from '../../components/elements/PopoverMenu';
import Pill from '../../components/elements/Pill';
import ClinicIcon from '../../core/icons/clinicIcon.svg';
import PlanIcon from '../../core/icons/planIcon.svg';
import { useIsFirstRender } from '../../core/hooks';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '../../components/elements/Dialog';

import ClinicWorkspaceHeader from '../../components/clinic/ClinicWorkspaceHeader';
import ClinicProfileFields from '../../components/clinic/ClinicProfileFields';
import { useToasts } from '../../providers/ToastProvider';
import baseTheme, { borders } from '../../themes/baseTheme';
import * as actions from '../../redux/actions';
import { usePrevious } from '../../core/hooks';

import {
  clinicTypes,
  clinicValuesFromClinic,
  clinicSchema as validationSchema
} from '../../core/clinicUtils';

import config from '../../config';
import Icon from '../../components/elements/Icon';

const clinicTypesLabels = mapValues(keyBy(clinicTypes, 'value'), 'label');

export const ClinicAdmin = (props) => {
  const { t, api, trackMetric } = props;
  const { showPrescriptions } = useFlags();
  const dispatch = useDispatch();
  const isFirstRender = useIsFirstRender();
  const { set: setToast } = useToasts();
  const [searchText, setSearchText] = useState('');
  const [page, setPage] = useState(1);
  const [pageCount, setPageCount] = useState();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showResendInviteDialog, setShowResendInviteDialog] = useState(false);
  const [showRevokeInviteDialog, setShowRevokeInviteDialog] = useState(false);
  const [showEditClinicProfileDialog, setShowEditClinicProfileDialog] = useState(false);
  const [selectedInvite, setSelectedInvite] = useState(null);
  const loggedInUserId = useSelector((state) => state.blip.loggedInUserId);
  const clinics = useSelector((state) => state.blip.clinics);
  const selectedClinicId = useSelector((state) => state.blip.selectedClinicId);
  const working = useSelector((state) => state.blip.working);
  const previousWorking = usePrevious(working);
  const fetchingCliniciansFromClinic = working.fetchingCliniciansFromClinic;
  const clinic = get(clinics, selectedClinicId);
  const pendingSentClinicianInvites = useSelector((state) => state.blip.pendingSentClinicianInvites);
  const timePrefs = useSelector((state) => state.blip.timePrefs);
  const [clinicianArray, setClinicianArray] = useState([]);
  const [userRolesInClinic, setUserRolesInClinic] = useState([]);
  const rowsPerPage = 8;

  const clinicProfileFormContext = useFormik({
    initialValues: clinicValuesFromClinic(clinic),
    onSubmit: values => {
      trackMetric('Clinic - Edit clinic profile saved', { clinicId: selectedClinicId });
      dispatch(actions.async.updateClinic(api, clinic.id, values));
    },
    validationSchema,
  });

  const isClinicAdmin = () => includes(userRolesInClinic, 'CLINIC_ADMIN');
  const isOnlyClinicAdmin = () => filter(clinicianArray, { isAdmin: true, inviteId: undefined }).length === 1;

  useEffect(() => {
    const {
      inProgress,
      completed,
      notification,
    } = working.resendingClinicianInvite;
    const prevInProgress = get(
      previousWorking,
      'resendingClinicianInvite.inProgress'
    );
    if (!inProgress && prevInProgress) {
      if (completed) {
        setToast({
          message: t('Clinician invite resent to {{email}}.', { email: selectedInvite?.email }),
          variant: 'success',
        });
      }
      if (notification) {
        setToast({
          message: notification.message,
          variant: 'danger',
        });
      }
      closeResendInviteDialog();
    }
  }, [working.resendingClinicianInvite]);

  useEffect(() => {
    const {
      inProgress,
      completed,
      notification,
    } = working.deletingClinicianInvite;
    const prevInProgress = get(
      previousWorking,
      'deletingClinicianInvite.inProgress'
    );
    if (!inProgress && prevInProgress) {
      if (completed) {
        setToast({
          message: t('Clinician invite to {{email}} has been revoked.', {
            email: selectedInvite?.email,
          }),
          variant: 'success',
        });
      }
      if (notification) {
        setToast({
          message: notification.message,
          variant: 'danger',
        });
      }
      closeRevokeInviteDialog();
    }
  }, [working.deletingClinicianInvite]);

  useEffect(() => {
    const {
      inProgress,
      completed,
      notification,
    } = working.deletingClinicianFromClinic;
    const prevInProgress = get(
      previousWorking,
      'deletingClinicianFromClinic.inProgress'
    );
    if (!inProgress && prevInProgress) {
      if (completed) {
        setToast({
          message: t('Clinician removed from clinic.'),
          variant: 'success',
        });
      }
      if (notification) {
        setToast({
          message: notification.message,
          variant: 'danger',
        });
      }
    }
  }, [working.deletingClinicianFromClinic]);

  useEffect(() => {
    const { inProgress, notification } = working.fetchingClinicianInvite;
    const prevInProgress = get(
      previousWorking,
      'fetchingClinicianInvite.inProgress'
    );
    if (!inProgress && prevInProgress) {
      if (notification) {
        setToast({
          message: notification.message,
          variant: 'danger',
        });
      }
    }
  }, [working.fetchingClinicianInvite]);

  useEffect(() => {
    const { inProgress, notification } = working.fetchingCliniciansFromClinic;
    const prevInProgress = get(
      previousWorking,
      'fetchingCliniciansFromClinic.inProgress'
    );
    if (!inProgress && prevInProgress) {
      if (notification) {
        setToast({
          message: notification.message,
          variant: 'danger',
        });
      }
    }
  }, [working.fetchingCliniciansFromClinic]);

  useEffect(() => {
    const { inProgress, completed, notification } = working.updatingClinic;

    if (!isFirstRender && !inProgress) {
      if (completed) {
        setToast({
          message: t('Clinic profile updated.'),
          variant: 'success',
        });

        clinicProfileFormContext.setSubmitting(false);
        setShowEditClinicProfileDialog(false);
      }

      if (completed === false) {
        setToast({
          message: get(notification, 'message'),
          variant: 'danger',
        });
      }
    }
  }, [working.updatingClinic]);

  useEffect(() => {
    if (
      loggedInUserId &&
      clinic?.id &&
      !fetchingCliniciansFromClinic.inProgress
    ) {
      dispatch(actions.async.fetchCliniciansFromClinic(api, clinic.id, { limit: 1000, offset: 0 }));
    }
  }, [loggedInUserId, clinic?.id]);

  const getClinicianArray = () => map(
    get(clinics, [selectedClinicId, 'clinicians'], {}),
    (clinician) => {
      const { roles, email, id: clinicianId, inviteId, name = '', createdTime, updatedTime } = clinician;
      let role = '';

      if (includes(roles, 'CLINIC_ADMIN')) {
        role = t('Clinic Admin');
      } else if (includes(roles, 'CLINIC_MEMBER')) {
        role = t('Clinic Member');
      }

      return {
        fullName: name,
        fullNameOrderable: name.toLowerCase(),
        role,
        prescriberPermission: includes(roles, 'PRESCRIBER'),
        isAdmin: includes(roles, 'CLINIC_ADMIN'),
        userId: clinicianId,
        inviteId,
        status: inviteId ? t('invite sent') : '',
        email,
        roles,
        createdTime,
        updatedTime,
      };
    }
  );

  useEffect(() => {
    if (clinic?.clinicians) {
      setClinicianArray(getClinicianArray());
    }
  }, [clinic?.clinicians]);

  useEffect(() => {
    setUserRolesInClinic(get(find(clinicianArray, { userId: loggedInUserId }), 'roles', []));
    setPageCount(Math.ceil(clinicianArray.length / rowsPerPage));
  }, [clinicianArray]);

  function handleExportList() {
    trackMetric('Clinic - clicked export clinic member list', {
      clinicId: selectedClinicId,
    });
    const timeZone =
      timePrefs?.timezoneName ||
      new Intl.DateTimeFormat().resolvedOptions().timeZone;

    const csvRows = [
      [
        t('Name'),
        t('Email'),
        t('Admin?'),
        t('Pending?'),
        t('Created'),
        t('Updated'),
      ],
    ];

    const csvEscape = (val) => {
      if (typeof val === 'string') {
        return `"${val.replace(/"/g, '""')}"`;
      }
      return val;
    };

    clinicianArray.forEach((clinician) => {
      const { fullName, email, isAdmin, inviteId, createdTime, updatedTime } = clinician;

      csvRows.push([
        csvEscape(fullName),
        csvEscape(email),
        isAdmin ? 'True' : 'False',
        inviteId ? 'True' : 'False',
        sundial.formatInTimezone(createdTime, timeZone, 'YYYY-MM-DD HH:mm:ss z'),
        sundial.formatInTimezone(updatedTime, timeZone, 'YYYY-MM-DD HH:mm:ss z'),
      ]);
    });

    const csv = csvRows.map((row) => row.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const downloadFileName = `${clinic.name}-${sundial.formatInTimezone(
      new Date(),
      timeZone,
      'YYYY-MM-DD HH:mm:ss z'
    )}.csv`;

    const a = document.createElement('a');
    a.href = url;
    a.download = downloadFileName;
    a.click();
  };

  function closeDeleteDialog() {
    setShowDeleteDialog(false);
  }

  function clearSelectedUser() {
    setSelectedUser(null);
  }

  function closeResendInviteDialog() {
    setShowResendInviteDialog(false);
  }

  function closeRevokeInviteDialog() {
    setShowRevokeInviteDialog(false);
  }

  function closeEditClinicProfileDialog() {
    setShowEditClinicProfileDialog(false);
  }

  function clearSelectedInvite() {
    setSelectedInvite(null);
  }

  function handleInviteNewMember() {
    trackMetric('Clinic - Invite new clinic team member', { clinicId: selectedClinicId });
    dispatch(push('/clinic-invite'));
  }

  function handleEdit(userId) {
    trackMetric('Clinic - Edit clinic team member', { clinicId: selectedClinicId });

    dispatch(
      push('/clinician-edit', {
        clinicianId: userId,
        clinicId: selectedClinicId,
      })
    );
  }

  function handleDelete(selectedClinician) {
    trackMetric('Clinic - Remove clinic team member', { clinicId: selectedClinicId });
    setSelectedUser(selectedClinician);
    setShowDeleteDialog(true);
  }

  function handleConfirmDelete(selectedClinicianId) {
    trackMetric('Clinic - Remove clinic team member confirmed', { clinicId: selectedClinicId });

    dispatch(
      actions.async.deleteClinicianFromClinic(
        api,
        selectedClinicId,
        selectedClinicianId
      )
    );
  }

  function handleResendInvite(invite) {
    trackMetric('Clinic - Resend clinic team invite', { clinicId: selectedClinicId });
    setSelectedInvite(invite);

    if(!has(pendingSentClinicianInvites, invite.inviteId)){
      dispatch(
        actions.async.fetchClinicianInvite(
          api,
          selectedClinicId,
          invite.inviteId
        )
      );
    }

    setShowResendInviteDialog(true);
  }

  function handleConfirmResendInvite(inviteId) {
    trackMetric('Clinic - Resend clinic team invite confirmed', { clinicId: selectedClinicId });
    dispatch(actions.async.resendClinicianInvite(api, selectedClinicId, inviteId));
  }

  function handleRevokeInvite(invite) {
    trackMetric('Clinic - Remove clinic team invite', { clinicId: selectedClinicId });
    setSelectedInvite(invite);
    setShowRevokeInviteDialog(true);
  }

  function handleConfirmRevokeInvite(inviteId) {
    trackMetric('Clinic - Remove clinic team invite confirmed', { clinicId: selectedClinicId });
    dispatch(actions.async.deleteClinicianInvite(api, selectedClinicId, inviteId));
  }

  function handleEditClinicProfile() {
    trackMetric('Clinic - Edit clinic profile', { clinicId: selectedClinicId });
    clinicProfileFormContext.resetForm();
    clinicProfileFormContext.setValues(clinicValuesFromClinic(clinic));
    setShowEditClinicProfileDialog(true);
  }

  function handleConfirmEditClinicProfile() {
    trackMetric('Clinic - Edit clinic profile saved', { clinicId: selectedClinicId });
    clinicProfileFormContext?.handleSubmit();
  }

  function handleSearchChange(event) {
    setPage(1);
    setSearchText(event.target.value);
    if (isEmpty(event.target.value)) {
      setPageCount(Math.ceil(clinicianArray.length / rowsPerPage));
    }
  }

  function handleClearSearch(event) {
    setPage(1);
    setSearchText('');
    setPageCount(Math.ceil(clinicianArray.length / rowsPerPage));
  }

  const handlePageChange = (event, newValue) => {
    setPage(newValue);
  };

  const renderClinician = ({ fullName, email }) => (
    <Box>
      <Text sx={{ display: 'block', fontWeight: 'medium' }}>{fullName}</Text>
      <Text sx={{ display: 'block' }}>{email || '\u00A0'}</Text>
    </Box>
  );

  const renderStatus = ({ status }) => (
    !isEmpty(status) ? <Box sx={{ whiteSpace: 'nowrap' }}>
      <Pill label={status} text={status} colorPalette="greens" />
    </Box> : null
  );

  const renderPermission = ({ prescriberPermission }) => (
    prescriberPermission ? <Box>
      <Text sx={{ fontWeight: 'medium' }}>
        {t('Prescriber')}
      </Text>
    </Box> : null
  );

  const renderRole = ({ role }) => (
    <Box>
      <Text sx={{ fontWeight: 'medium' }}>{role}</Text>
    </Box>
  );

  const renderMore = props => {
    const items = [];

    if (props.userId) {
      items.push({
        icon: EditIcon,
        iconLabel: t('Edit Clinician Information'),
        iconPosition: 'left',
        id: `edit-${props.userId}`,
        variant: 'actionListItem',
        onClick: _popupState => {
          _popupState.close();
          handleEdit(props.userId);
        },
        text: t('Edit Clinician Information'),
      });

      if (!props.isAdmin || !isOnlyClinicAdmin()) {
        items.push({
          icon: DeleteForeverIcon,
          iconLabel: t('Remove User'),
          iconPosition: 'left',
          id: `delete-${props.userId}`,
          variant: 'actionListItemDanger',
          onClick: _popupState => {
            _popupState.close();
            handleDelete(props);
          },
          text: t('Remove User'),
        });
      }
    }

    if (props.inviteId) {
      items.push(...[
        {
          icon: InputIcon,
          iconLabel: t('Resend Invite'),
          iconPosition: 'left',
          id: `resendInvite-${props.inviteId}`,
          variant: 'actionListItem',
          onClick: _popupState => {
            _popupState.close();
            handleResendInvite(props);
          },
          text: t('Resend Invite'),
        },
        {
          icon: DeleteForeverIcon,
          iconLabel: t('Revoke Invite'),
          iconPosition: 'left',
          id: `deleteInvite-${props.inviteId}`,
          variant: 'actionListItemDanger',
          onClick: _popupState => {
            _popupState.close();
            handleRevokeInvite(props);
          },
          text: t('Revoke Invite'),
        },
      ]);
    }

    return items.length ? (
      <PopoverMenu id="action-menu" items={items} />
    ) : '';
  };

  const columns = [
    {
      title: t('Name'),
      field: 'fullName',
      align: 'left',
      sortable: true,
      sortBy: 'fullNameOrderable',
      render: renderClinician,
      searchable: true,
      searchBy: ['fullName'],
    },
    {
      title: t('Status'),
      field: 'status',
      align: 'left',
      sortable: true,
      sortBy: 'status',
      render: renderStatus,
      hideEmpty: true,
    },
  ];

  if (showPrescriptions) {
    columns.push({
      title: t('Permission'),
      field: 'prescriberPermission',
      align: 'left',
      sortable: true,
      sortBy: 'prescriberPermission',
      render: renderPermission,
      hideEmpty: true,
    });
  }

  columns.push({
    title: t('Role'),
    field: 'role',
    align: 'left',
    sortable: true,
    sortBy: 'role',
    render: renderRole,
  });

  if (((isClinicAdmin()))) {
    columns.push(
      {
        title: '',
        field: 'more',
        render: renderMore,
        align: 'right',
        className: 'action-menu',
      }
    );
  }

  const formattedInviteDate =
    pendingSentClinicianInvites?.[selectedInvite?.inviteId]?.modified &&
    sundial.formatInTimezone(
      pendingSentClinicianInvites?.[selectedInvite?.inviteId]?.modified,
      timePrefs?.timezoneName ||
        new Intl.DateTimeFormat().resolvedOptions().timeZone,
      'MM/DD/YYYY [at] h:mm a'
    );

  return (
    <>
      <ClinicWorkspaceHeader api={api} trackMetric={trackMetric} />

      <Box mb={8}>
        <Box variant="containers.largeBordered" mb={4}>
          <Flex
            px={4}
            py={2}
            sx={{ borderBottom: baseTheme.borders.thick, alignItems: 'center' }}
          >
            <Text py={2} sx={{ display: 'block', color: 'text.primary', fontSize: [1, 2, '18px'], fontWeight: 'medium' }}>
              {t('Workspace Settings')}
            </Text>
          </Flex>

          <Box mx={4} py={4}>
            <Flex
              mb={5}
              p={4}
              variant="containers.well"
              sx={{ flexWrap: ['wrap', null,  'nowrap'], gap: 3 }}
            >
              <Box id="clinicWorkspaceDetails" sx={{ flexBasis: ['100%', null, clinic?.ui?.display?.workspacePlan ? '67%' : '100%'], color: 'darkGrey' }}>
                <Flex mb={2} sx={{ justifyContent: 'space-between', alignItems: 'center', gap: 3, flexWrap: 'wrap' }}>
                  <Flex sx={{ justifyContent: 'flex-start', color: 'grays.4', gap: 2, alignItems: 'center' }}>
                    <Icon variant="static" theme={baseTheme} label="Clinic icon" iconSrc={ClinicIcon} />

                    <Text sx={{ fontSize: 0, fontWeight: 'medium', whiteSpace: 'nowrap' }}>
                      Workspace Details
                    </Text>
                  </Flex>

                  {isClinicAdmin() && (
                    <Button
                      id="clinic-profile-edit-trigger"
                      sx={{ width: ['auto'], flex: 'initial' }}
                      onClick={handleEditClinicProfile}
                      variant="tertiaryCondensed"
                    >
                      {t('Edit')}
                    </Button>
                  )}
                </Flex>

                <Text id="clinicName" sx={{ display: 'block', fontSize: 1, lineHeight: 3, fontWeight: 'bold' }}>
                  {clinic?.name}
                </Text>

                <Text id="clinicType" mb={1} sx={{ display: 'block', fontSize: 0, lineHeight: 1 }}>
                  {t('Type')} : <Text as="span" sx={{ fontWeight: 'medium' }}>{clinicTypesLabels[clinic?.clinicType] || ''}</Text>
                </Text>

                <Text id="clinicAddress" mb={1} sx={{ display: 'block', fontSize: 0, lineHeight: 1 }}>
                  {t('Address')} : <Text as="span" sx={{ fontWeight: 'medium' }}>{compact([
                    clinic?.address,
                    compact([clinic?.city, clinic?.state]).join(' '),
                    clinic?.postalCode,
                    clinic?.country,
                  ]).join(', ')}</Text>
                </Text>

                {clinic?.website && (
                  <Text id="clinicWebsite" mb={1} sx={{ display: 'block', fontSize: 0, lineHeight: 1 }}>
                    {t('Website')} : <Text as="span" sx={{ fontWeight: 'medium' }}>{clinic.website}</Text>
                  </Text>
                )}

                <Text id="clinicPreferredBloodGlucoseUnits" sx={{ display: 'block', fontSize: 0, lineHeight: 1 }}>
                  {t('Preferred blood glucose units')} : <Text as="span" sx={{ fontWeight: 'medium' }}>{clinic?.preferredBgUnits || ''}</Text>
                </Text>
              </Box>

              {clinic?.ui?.display?.workspacePlan && (
                <Box id="clinicWorkspacePlan" pl={[0, null, 3]} sx={{ flexBasis: ['100%', null, '33%'], borderLeft: ['none', null, borders.inputDark] }}>
                  <Flex mb={2} sx={{ justifyContent: 'flex-start', color: 'grays.4', gap: 2, alignItems: 'center' }}>
                    <Icon variant="static" theme={baseTheme} label="Clinic plan icon" iconSrc={PlanIcon} />

                    <Text sx={{ fontSize: 0, fontWeight: 'medium' }}>
                      Workspace Plan
                    </Text>
                  </Flex>

                  <Text id="clinicPlanName" sx={{ display: 'inline-block', fontSize: 1, lineHeight: 3, fontWeight: 'bold' }}>
                    {clinic?.ui?.text?.planDisplayName}
                  </Text>

                  {clinic?.ui?.display?.workspaceLimitDescription && (
                    <Text id="clinicPatientLimitDescription" mb={1} sx={{ display: 'block', fontSize: 0, fontWeight: 'medium', lineHeight: 1 }}>
                      {clinic?.ui?.text?.limitDescription}
                    </Text>
                  )}

                  {clinic?.ui?.display?.workspaceLimitFeedback && (
                    <Box mb={1}>
                      <Pill
                        id="clinicPatientLimitFeedback"
                        text={clinic?.ui?.text?.limitFeedback?.text}
                        label={t('Patient limit feedback')}
                        colorPalette={clinic?.ui?.text?.limitFeedback?.status}
                        condensed
                      />
                    </Box>
                  )}

                  {clinic?.ui?.display?.workspaceLimitResolutionLink && (
                    <Text
                      sx={{
                        fontSize: 0,
                        fontWeight: 'medium',
                        textDecoration: 'underline',
                        color: 'text.link',
                        '&:hover': { textDecoration: 'underline' },
                        lineHeight: 1,
                      }}
                    >
                      <Link
                        id="clinicPatientLimitResolutionLink"
                        href={clinic?.ui?.text?.limitResolutionLink?.url}
                        target="_blank"
                        rel="noreferrer noopener"
                      >
                        {clinic?.ui?.text?.limitResolutionLink?.text}
                      </Link>
                    </Text>
                  )}
                </Box>
              )}
            </Flex>

            <Flex
              pt={4}
              mb={3}
              sx={{
                alignItems: 'center',
                borderTop: borders.divider,
                justifyContent: 'space-between',
                flexWrap: 'wrap',
                gap: 3,
              }}
            >
              <Text py={1} sx={{ display: 'inline-block', color: 'text.primary', fontSize: [1, 2, '18px'], fontWeight: 'medium' }}>
                {t('Clinic Members')}
              </Text>

              <Flex
                sx={{
                  gap: 3,
                  flexWrap: ['wrap', null, 'nowrap'],
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  width: ['100%', null, 'auto'],
                }}
              >
                {isClinicAdmin() && (
                  <Flex sx={{ gap: 3, flex: 1 }}>
                    <Button
                      id="add-clinic-team-member"
                      variant="primary"
                      px={3}
                      sx={{ fontSize: 0, whiteSpace: ['wrap', 'nowrap'], flexBasis: ['50%', 'auto'] }}
                      onClick={handleInviteNewMember}
                    >
                      {t('Invite New Clinic Team Member')}
                    </Button>

                    <Button
                      id="export-clinic-team-list"
                      variant="tertiary"
                      px={3}
                      sx={{ fontSize: 0, whiteSpace: ['wrap', 'nowrap'], flexBasis: ['50%', 'auto'] }}
                      onClick={handleExportList}
                    >
                      {t('Export List')}
                    </Button>
                  </Flex>
                )}
                <TextInput
                  flex={1}
                  themeProps={{
                    sx: {
                      width: ['100%', null, '250px'],
                    },
                  }}
                  sx={{ fontSize: 0 }}
                  id="search-members"
                  placeholder={t('Search by Name')}
                  icon={!isEmpty(searchText) ? CloseRoundedIcon : SearchIcon}
                  iconLabel={t('Search')}
                  onClickIcon={!isEmpty(searchText) ? handleClearSearch : null}
                  name="search-members"
                  onChange={handleSearchChange}
                  value={searchText}
                  variant="ultraCondensed"
                />
              </Flex>
            </Flex>

            <Table
              id="clinicianTable"
              label={t('Clinician Table')}
              columns={columns}
              data={clinicianArray}
              orderBy="fullNameOrderable"
              order="asc"
              rowHover={false}
              rowsPerPage={rowsPerPage}
              searchText={searchText}
              page={page}
              sx={{ fontSize: 0 }}
            />
          </Box>
        </Box>

        {clinicianArray.length > rowsPerPage && (
          <Box variant="containers.large" sx={{ bg: 'transparent' }} mb={0}>
            <Pagination
              px="5%"
              width="100%"
              id="clinic-clinicians-pagination"
              count={pageCount}
              page={page}
              disabled={pageCount < 2}
              onChange={handlePageChange}
              showFirstButton={false}
              showLastButton={false}
            />
          </Box>
        )}
      </Box>

      <Dialog
        id="deleteUser"
        aria-labelledby="dialog-title"
        open={showDeleteDialog}
        onClose={closeDeleteDialog}
        TransitionProps={{onExited:clearSelectedUser}}
      >
        <DialogTitle onClose={closeDeleteDialog}>
          <MediumTitle id="dialog-title">{t('Remove {{name}}', { name: selectedUser?.fullName || selectedUser?.email })}</MediumTitle>
        </DialogTitle>

        <DialogContent>
          <Body1>
            {t('{{name}} will lose all access to this clinic workspace and patient list. Are you sure you want to remove this user?', { name: selectedUser?.fullName || selectedUser?.email })}
          </Body1>
        </DialogContent>

        <DialogActions>
          <Button variant="secondary" onClick={closeDeleteDialog}>
            {t('Cancel')}
          </Button>

          <Button
            variant="danger"
            onClick={() => {
              handleConfirmDelete(selectedUser.userId);
              closeDeleteDialog();
            }}
          >
            {t('Remove User')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        id="resendInvite"
        aria-labelledby="dialog-title"
        open={showResendInviteDialog && !!pendingSentClinicianInvites?.[selectedInvite?.inviteId]?.created}
        onClose={closeResendInviteDialog}
        TransitionProps={{onExited:clearSelectedInvite}}
      >
        <DialogTitle onClose={closeResendInviteDialog}>
          <MediumTitle id="dialog-title">{t('Confirm Resending Invite')}</MediumTitle>
        </DialogTitle>

        <DialogContent>
          <Body1>
          <Trans>
            <Text>
              You invited <Text sx={{ fontWeight: 'bold' }}>{{inviteName: selectedInvite?.name || selectedInvite?.email}}</Text> to your clinic on <Text sx={{ fontWeight: 'bold' }}>{{inviteDate: formattedInviteDate}}</Text>.
            </Text>
            <Text>
              Are you sure you want to resend this invite?
            </Text>
          </Trans>
          </Body1>
        </DialogContent>

        <DialogActions>
          <Button variant="secondary" onClick={closeResendInviteDialog}>
            {t('Cancel')}
          </Button>

          <Button
            variant="primary"
            processing={working.resendingClinicianInvite.inProgress}
            onClick={() => handleConfirmResendInvite(selectedInvite.inviteId)}
          >
            {t('Resend Invite')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        id="revokeInvite"
        aria-labelledby="dialog-title"
        open={showRevokeInviteDialog}
        onClose={closeRevokeInviteDialog}
        TransitionProps={{onExited:clearSelectedInvite}}
      >
        <DialogTitle onClose={closeRevokeInviteDialog}>
          <MediumTitle id="dialog-title">{t('Confirm Revoking Invite')}</MediumTitle>
        </DialogTitle>

        <DialogContent>
          <Body1>
          <Trans>
            <Text>
              Are you sure you want to revoke this invite to <Text sx={{ fontWeight: 'bold' }}>{{inviteName: selectedInvite?.name || selectedInvite?.email}}</Text>?
            </Text>
          </Trans>
          </Body1>
        </DialogContent>

        <DialogActions>
          <Button variant="secondary" onClick={closeRevokeInviteDialog}>
            {t('Cancel')}
          </Button>

          <Button
            variant="danger"
            processing={working.deletingClinicianInvite.inProgress}
            onClick={() => handleConfirmRevokeInvite(selectedInvite.inviteId)}
          >
            {t('Revoke Invite')}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog
        id="editClinicProfile"
        maxWidth="md"
        aria-labelledby="dialog-title"
        open={showEditClinicProfileDialog}
        onClose={closeEditClinicProfileDialog}
      >
        <DialogTitle onClose={closeEditClinicProfileDialog}>
          <MediumTitle id="dialog-title">{t('Edit Workspace Details')}</MediumTitle>
        </DialogTitle>

        <DialogContent>
          <ClinicProfileFields formikContext={clinicProfileFormContext} />
        </DialogContent>

        <DialogActions>
          <Button variant="secondary" onClick={closeEditClinicProfileDialog}>
            {t('Cancel')}
          </Button>

          <Button
            id="editClinicProfileSubmit"
            variant="primary"
            processing={clinicProfileFormContext.isSubmitting}
            onClick={() => handleConfirmEditClinicProfile()}
          >
            {t('Save Changes')}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

ClinicAdmin.propTypes = {
  api: PropTypes.object.isRequired,
  trackMetric: PropTypes.func.isRequired,
};

export default withTranslation()(ClinicAdmin);
