/**
 * Copyright (c) 2014, Tidepool Project
 *
 * This program is free software; you can redistribute it and/or modify it under
 * the terms of the associated License, which is identical to the BSD 2-Clause
 * License as published by the Open Source Initiative at opensource.org.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the License for more details.
 *
 * You should have received a copy of the License along with this program; if
 * not, you can obtain one from Tidepool Project at tidepool.org.
 */

import PropTypes from 'prop-types';
import React from 'react';
import { Link } from 'react-router-dom';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { translate, Trans } from 'react-i18next';
import update from 'immutability-helper';
import { Box } from 'rebass/styled-components';

import * as actions from '../../redux/actions';
import utils from '../../core/utils';

import _ from 'lodash';
import cx from 'classnames';

import personUtils from '../../core/personutils';
import PeopleList from '../../components/peoplelist';
import PeopleTable from '../../components/peopletable';
import Invitation from '../../components/invitation';
import BrowserWarning from '../../components/browserwarning';

import { components as vizComponents } from '@tidepool/viz';
import ClinicProfile from '../../components/clinic/ClinicProfile';
import baseTheme from '../../themes/baseTheme';
const { Loader } = vizComponents;

export let Patients = translate()(class extends React.Component {
  static propTypes = {
    clinic: PropTypes.object,
    clearPatientInView: PropTypes.func.isRequired,
    currentPatientInViewId: PropTypes.string,
    fetchers: PropTypes.array.isRequired,
    fetchingUser: PropTypes.bool.isRequired,
    fetchingPendingReceivedInvites: PropTypes.object.isRequired,
    fetchingAssociatedAccounts: PropTypes.object.isRequired,
    invites: PropTypes.array.isRequired,
    loading: PropTypes.bool.isRequired,
    location: PropTypes.object.isRequired,
    loggedInUserId: PropTypes.string,
    selectedClinicId: PropTypes.string,
    onAcceptInvitation: PropTypes.func.isRequired,
    onDismissInvitation: PropTypes.func.isRequired,
    onHideWelcomeSetup: PropTypes.func.isRequired,
    onRemovePatient: PropTypes.func.isRequired,
    patients: PropTypes.array.isRequired,
    showWelcomeMessage: PropTypes.func.isRequired,
    showingWelcomeMessage: PropTypes.bool,
    trackMetric: PropTypes.func.isRequired,
    uploadUrl: PropTypes.string.isRequired,
    user: PropTypes.object,
  };

  render() {
    var welcomeTitle = this.renderWelcomeTitle();
    var welcomeSetup = this.renderWelcomeSetup();
    var noPatientsOrInvites = this.renderNoPatientsOrInvitationsMessage();
    var invites = this.renderInvitations();
    var noPatientsSetupStorage = this.renderNoPatientsSetupStorageLink();
    var patients = this.renderPatients();

    var backgroundClasses = cx({
      'patients js-patients-page': !this.props.selectedClinicId,
      'patients-welcome js-patients-page': this.isShowingWelcomeTitle()
    });

    return (
      <div className="container-box-outer">
        <div className={backgroundClasses}>
          {!this.props.selectedClinicId && (
            <>
            {welcomeTitle}
            {welcomeSetup}
            {noPatientsOrInvites}
            {invites}
            {noPatientsSetupStorage}
            </>
          )}
          {patients}
          <Loader show={this.props.loading} overlay={true} />
        </div>
      </div>
    );
  }

  renderWelcomeSetup = () => {
    const { t } = this.props;
    if (!this.isShowingWelcomeSetup()) {
      return null;
    }

    var self = this;
    var handleClickYes = function(e) {
      e.preventDefault();
      self.props.onHideWelcomeSetup();
      self.props.history.push('/patients/new');
    };
    var handleClickNo = function(e) {
      e.preventDefault();
      self.props.onHideWelcomeSetup();
    };

    return (
      <div className="patients-message">
        <div>
          {t('Tidepool provides free, secure data storage for diabetes data.')}
          <br />
          {t('Would you like to set up data storage for someone’s diabetes data?')}
        </div>
        <div className="patients-welcomesetup-actions">
          <button className="btn btn-tertiary" onClick={handleClickNo}>{t('No, not now')}</button>
          <button className="btn btn-primary" onClick={handleClickYes}>{t('Yes, let\'s set it up')}</button>
        </div>
      </div>
    );
  };

  renderInvitation = (invitation, index) => {
    return (
      <Invitation
        key={invitation.key}
        invitation={invitation}
        onAcceptInvitation={this.props.onAcceptInvitation}
        onDismissInvitation={this.props.onDismissInvitation}
        trackMetric={this.props.trackMetric}>
      </Invitation>
    );
  };

  renderInvitations = () => {
    if (!this.hasInvites()) {
      return null;
    }
    var invitations = _.map(this.props.invites, this.renderInvitation);

    return (
      <ul className='invitations'>
        {invitations}
      </ul>
    );
  };

  renderNoPatientsOrInvitationsMessage = () => {
    if (this.isShowingWelcomeSetup() || this.hasPatients() || this.hasInvites()) {
      return null;
    }
    return (
      <Box textAlign="center">
        <Trans className="patients-message" i18nKey="html.patients-no-data">
          Looks like you don’t have access to any data yet.
          <br />
          Please ask someone to invite you to see their data.
        </Trans>

        {!personUtils.isPatient(this.props.user) && (
          <Box mb={6}>
            {this.renderAddDataStorage({ position: 'relative' })}
          </Box>
        )}
      </Box>
    );
  };

  renderNoPatientsSetupStorageLink = () => {
    if (this.isShowingWelcomeSetup() || this.hasPatients() || personUtils.isClinicianAccount(this.props.user)) {
      return null;
    }
    return (
      <Trans className="patients-message" i18nKey="html.patients-setup-data-storage">
        You can also <Link to="/patients/new">setup data storage</Link> for someone’s diabetes data.
      </Trans>
    );
  };

  renderPatients = () => {
    const { t } = this.props;
    if (!this.hasPatients() && !this.props.selectedClinicId) {
      return null;
    }

    if (!utils.isChrome()) {
      return <BrowserWarning
        trackMetric={this.props.trackMetric} />;
    }

    var patients = this.props.patients;
    patients = this.addLinkToPatients(patients);

    if (personUtils.isClinicianAccount(this.props.user) && this.props.selectedClinicId) {
      const clinicActions = [];
      const isClinicAdmin = _.includes(_.get(this.props.clinic, ['clinicians', this.props.loggedInUserId, 'roles'], []), 'CLINIC_ADMIN');

      if (isClinicAdmin) {
        clinicActions.push({
          label: t('Manage Clinic'),
          action: () => {
            this.props.history.push('/clinic-admin');
          },
        });
      }

      return (
        <Box>
          {this.props.selectedClinicId && (
            <ClinicProfile
              width="100%"
              mt={0}
              mb={4}
              clinic={this.props.clinic}
              clinicActions={clinicActions}
            />
          )}

          <Box
            mx="auto"
            px={4}
            py={0}
            bg="white"
            width="100%"
            mt={0}
            mb={6}
            sx={{
              border: baseTheme.borders.default,
              borderRadius: baseTheme.radii.default,
            }}
          >
            <PeopleTable
              people={patients}
              trackMetric={this.props.trackMetric}
              onRemovePatient={this.props.onRemovePatient}
            />
          </Box>
        </Box>
      );
    }

    return (
      <div className="container-box-inner patients-section js-patients-shared">
        <div className="patients-section-title-wrapper">
          <div className="patients-section-title">{t('View data for:')}</div>
        </div>
        <div className="patients-section-content">
          {this.renderAddDataStorage()}
          <div className='clear'></div>
          <PeopleList
            people={patients}
            trackMetric={this.props.trackMetric}
            uploadUrl={this.props.uploadUrl}
            onClickPerson={this.handleClickPatient}
            onRemovePatient={this.props.onRemovePatient}
          />
        </div>
      </div>
    );
  };

  renderAddDataStorage = ({ position } = {}) => {
    const { t } = this.props;
    // Until the "child accounts" feature,
    // don't allow additional data accounts once the primary one has been setup
    if (personUtils.isPatient(this.props.user)) {
      return null;
    }

    var classNames = cx({
      'patients-new-account': true,
      'relative': position === 'relative',
    });

    return (
      <Link
        className={classNames}
        to="/patients/new"
        onClick={this.handleClickCreateProfile}>
        { t('Set up data storage') }
        <i className="icon-add"></i>
      </Link>
    );
  };

  renderWelcomeTitle = () => {
    const { t } = this.props;
    if (!this.isShowingWelcomeTitle()) {
      return null;
    }

    return (
      <div className="patients-welcome-title">
        {t('Welcome!')}
      </div>
    );
  };

  handleClickCreateProfile = () => {
    this.props.trackMetric('Clicked Create Profile');
  };

  addLinkToPatients = (patients) => {
    return _.map(patients, function(patient) {
      patient = _.cloneDeep(patient);
      if (patient.userid) {
        patient.link = '/patients/' + patient.userid + '/data';
      }
      return patient;
    });
  };

  handleClickPatient = (patient) => {
    if (personUtils.isSame(this.props.user, patient)) {
      this.props.trackMetric('Clicked Own Care Team');
    }
    else {
      this.props.trackMetric('Clicked Other Care Team');
    }
  };

  isShowingWelcomeTitle = () => {
    return this.props.showingWelcomeMessage;
  };

  hasInvites = () => {
    return !_.isEmpty(this.props.invites);
  };

  isShowingWelcomeSetup = () => {
    return this.props.showingWelcomeMessage && !this.hasInvites();
  };

  hasPatients = () => {
    return !_.isEmpty(this.props.patients) || personUtils.isPatient(this.props.user);
  };

  doFetching = (nextProps) => {
    if (!nextProps.fetchers) {
      return
    }
    _.forEach(nextProps.fetchers, fetcher => {
      fetcher();
    });
  };

  UNSAFE_componentWillMount() {
    this.props.dataWorkerRemoveDataRequest(null, this.props.currentPatientInViewId);

    if (this.props.clearPatientInView) {
      this.props.clearPatientInView();
    }
  }

  /**
   * After rendering for first time
   * begin fetching any required data
   */
  componentDidMount() {
    if (this.props.trackMetric) {
      this.props.trackMetric('Viewed Care Team List');
    }

    this.doFetching(this.props);
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    let { loading, loggedInUserId, patients, invites, location, showingWelcomeMessage, user } = nextProps;

    if (!loading && loggedInUserId && location.query.justLoggedIn) {
      if (!personUtils.isClinicianAccount(user) && patients.length === 1 && invites.length === 0) {
        let patient = patients[0];
        this.props.history.push(`/patients/${patient.userid}/data`);
      } else if (patients.length === 0 && invites.length === 0 && showingWelcomeMessage === null) {
        this.props.showWelcomeMessage();
      }
    }
  }
});

/**
 * Expose "Smart" Component that is connect-ed to Redux
 */

export function getFetchers(dispatchProps, stateProps, api) {
  const fetchers = [];

  if (!stateProps.fetchingPendingReceivedInvites.inProgress && !stateProps.fetchingPendingReceivedInvites.completed) {
    fetchers.push(dispatchProps.fetchPendingReceivedInvites.bind(null, api));
  }

  if (!stateProps.fetchingAssociatedAccounts.inProgress && !stateProps.fetchingAssociatedAccounts.completed) {
    fetchers.push(dispatchProps.fetchAssociatedAccounts.bind(null, api));
  }

  return fetchers;
}


export function mapStateToProps(state) {
  var user = null;
  let patientMap = {};
  let clinic = null

  if (state.blip.selectedClinicId) {
    clinic = _.get(state.blip, ['clinics', state.blip.selectedClinicId]);

    patientMap = _.reduce(
      _.values(_.get(clinic, 'patients', {})),
      (newSet, patient) => {
        newSet[patient.id] = {
          emails: [patient.email],
          permissions: patient.permissions,
          profile: {
            fullName: patient.fullName,
            patient: {
              birthday: patient.birthDate,
            },
          },
          userid: patient.id,
          username: patient.email,
        };
        return newSet;
      },
      {}
    );
  }

  if (state.blip.allUsersMap) {
    if (state.blip.loggedInUserId) {
      user = state.blip.allUsersMap[state.blip.loggedInUserId];
    }

    if (!state.blip.selectedClinicId) {
      if (state.blip.targetUserId) {
        patientMap[state.blip.targetUserId] = state.blip.allUsersMap[state.blip.targetUserId];
        // to pass through the permissions of the logged-in user on the target (usually self)
        if (state.blip.permissionsOfMembersInTargetCareTeam[state.blip.targetUserId]) {
          patientMap = update(patientMap, {
            [state.blip.targetUserId]: { $merge: { permissions: state.blip.permissionsOfMembersInTargetCareTeam[state.blip.targetUserId] } }
          });
        }
      }

      if (state.blip.membershipInOtherCareTeams) {
        _.forEach(state.blip.membershipInOtherCareTeams, (key) => {
          patientMap[key] = state.blip.allUsersMap[key];
        });
      }

      if (state.blip.membershipPermissionsInOtherCareTeams) {
        const permissions = state.blip.membershipPermissionsInOtherCareTeams;
        const keys = _.keys(state.blip.membershipPermissionsInOtherCareTeams);
        _.forEach(keys, (key) => {
          if (!patientMap[key]) {
            patientMap[key] = state.blip.allUsersMap[key];
          }
          patientMap = update(patientMap, {
            [key]: { $merge: { permissions: permissions[key] } }
          });
        });
      }
    }
  }

  let {
    fetchingUser: { inProgress: fetchingUser },
    fetchingAssociatedAccounts,
    fetchingPendingReceivedInvites,
  } = state.blip.working;

  return {
    clinic,
    currentPatientInViewId: state.blip.currentPatientInViewId,
    invites: state.blip.pendingReceivedInvites,
    fetchingUser: fetchingUser,
    fetchingPendingReceivedInvites,
    fetchingAssociatedAccounts,
    loading: fetchingUser || fetchingAssociatedAccounts.inProgress || fetchingPendingReceivedInvites.inProgress,
    loggedInUserId: state.blip.loggedInUserId,
    selectedClinicId: state.blip.selectedClinicId,
    patients: _.values(patientMap),
    showingWelcomeMessage: state.blip.showingWelcomeMessage,
    user,
  }
}

let mapDispatchToProps = dispatch => bindActionCreators({
  acceptReceivedInvite: actions.async.acceptReceivedInvite,
  rejectReceivedInvite: actions.async.rejectReceivedInvite,
  removePatient: actions.async.removeMembershipInOtherCareTeam,
  fetchPendingReceivedInvites: actions.async.fetchPendingReceivedInvites,
  fetchAssociatedAccounts: actions.async.fetchAssociatedAccounts,
  dataWorkerRemoveDataRequest: actions.worker.dataWorkerRemoveDataRequest,
  clearPatientInView: actions.sync.clearPatientInView,
  showWelcomeMessage: actions.sync.showWelcomeMessage,
  onHideWelcomeSetup: actions.sync.hideWelcomeMessage
}, dispatch);

let mergeProps = (stateProps, dispatchProps, ownProps) => {
  var api = ownProps.api;
  return _.assign(
    {},
    _.pick(dispatchProps, [
      'dataWorkerRemoveDataRequest',
      'clearPatientInView',
      'showWelcomeMessage',
      'onHideWelcomeSetup',
    ]),
    stateProps,
    {
      fetchers: getFetchers(dispatchProps, stateProps, api),
      location: ownProps.location,
      uploadUrl: api.getUploadUrl(),
      onAcceptInvitation: dispatchProps.acceptReceivedInvite.bind(null, api),
      onDismissInvitation: dispatchProps.rejectReceivedInvite.bind(null, api),
      onRemovePatient: stateProps.selectedClinicId ? () => {console.log('Placeholder for removePatientFromClinic')} : dispatchProps.removePatient.bind(null, api),
      trackMetric: ownProps.trackMetric,
      history: ownProps.history,
    }
  );
};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(Patients);
