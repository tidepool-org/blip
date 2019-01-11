
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

import React from 'react';
import { connect } from 'react-redux';
import { translate, Trans } from 'react-i18next';
import { bindActionCreators } from 'redux';

import * as actions from '../../redux/actions';

import _ from 'lodash';

import personUtils from '../../core/personutils';
import ModalOverlay from '../../components/modaloverlay';
import PatientInfo from './patientinfo';
import { PatientTeam } from './patientteam';

const Patient = translate()(React.createClass({
  // many things *not* required here because they aren't needed for
  // /patients/:id/profile although they are for /patients/:id/share (or vice-versa)
  propTypes: {
    acknowledgeNotification: React.PropTypes.func.isRequired,
    cancellingInvite: React.PropTypes.bool,
    dataDonationAccounts: React.PropTypes.array,
    changingMemberPermissions: React.PropTypes.bool,
    fetchers: React.PropTypes.array.isRequired,
    fetchingPatient: React.PropTypes.bool.isRequired,
    fetchingUser: React.PropTypes.bool.isRequired,
    invitingMemberInfo: React.PropTypes.object,
    onCancelInvite: React.PropTypes.func,
    onChangeMemberPermissions: React.PropTypes.func,
    onInviteMember: React.PropTypes.func,
    onRemoveMember: React.PropTypes.func,
    onUpdateDataDonationAccounts: React.PropTypes.func,
    onUpdatePatient: React.PropTypes.func,
    onUpdatePatientSettings: React.PropTypes.func,
    patient: React.PropTypes.object,
    pendingSentInvites: React.PropTypes.array,
    removingMember: React.PropTypes.bool,
    shareOnly: React.PropTypes.bool,
    trackMetric: React.PropTypes.func.isRequired,
    updatingDataDonationAccounts: React.PropTypes.bool,
    updatingPatientBgUnits: React.PropTypes.bool,
    user: React.PropTypes.object,
    dataSources: React.PropTypes.array,
    fetchDataSources: React.PropTypes.func,
    connectDataSource: React.PropTypes.func,
    disconnectDataSource: React.PropTypes.func,
    authorizedDataSource: React.PropTypes.object,
    queryParams: React.PropTypes.object,
    api: React.PropTypes.object,
  },

  getInitialState: function() {
    return {
      showModalOverlay: false,
      dialog: ''
    };
  },

  render: function() {
    return (
      <div className="PatientPage js-patient-page">
        <div className="PatientPage-layer">
          {this.renderSubnav()}
          {this.renderContent()}
          {this.renderFooter()}
        </div>
      </div>
    );
  },

  renderSubnav: function() {
    return (
      <div className="PatientPage-subnav grid">
      </div>
    );
  },

  renderContent: function() {
    var share;
    var modal;
    var profile = this.renderInfo();

    if (this.props.shareOnly) {
      share = this.renderAccess();
      modal = this.renderModalOverlay();
      profile = null;
    }

    return (
      <div className="PatientPage-content">
        {profile}
        {share}
        {modal}
      </div>
    );
  },

  renderFooter: function() {
    return <div className="PatientPage-footer"></div>;
  },

  renderInfo: function() {
    return (
      <div className="PatientPage-infoSection">
        <PatientInfo
          api={this.props.api}
          user={this.props.user}
          fetchingUser={this.props.fetchingUser}
          patient={this.props.patient}
          fetchingPatient={this.props.fetchingPatient}
          onUpdatePatient={this.props.onUpdatePatient}
          onUpdatePatientSettings={this.props.onUpdatePatientSettings}
          onUpdateDataDonationAccounts={this.props.onUpdateDataDonationAccounts}
          permsOfLoggedInUser={this.props.permsOfLoggedInUser}
          dataDonationAccounts={this.props.dataDonationAccounts || []}
          updatingDataDonationAccounts={this.props.updatingDataDonationAccounts}
          updatingPatientBgUnits={this.props.updatingPatientBgUnits}
          dataSources={this.props.dataSources}
          fetchDataSources={this.props.fetchDataSources}
          connectDataSource={this.props.connectDataSource}
          disconnectDataSource={this.props.disconnectDataSource}
          authorizedDataSource={this.props.authorizedDataSource}
          queryParams={this.props.queryParams}
          trackMetric={this.props.trackMetric} />
      </div>
    );
  },

  isSamePersonUserAndPatient: function() {
    return personUtils.isSame(this.props.user, this.props.patient);
  },

  renderDeleteDialog: function() {
    return (
      <Trans i18nKey="html.patient-delete-account">If you are sure you want to delete your account, <a href="mailto:support@tidepool.org?Subject=Delete%20my%20account" target="_blank">send an email</a> to support@tidepool.org and we take care of it for you.</Trans>
    );
  },

  renderDelete: function() {
    const { t } = this.props;
    var self = this;

    if (!this.isSamePersonUserAndPatient()) {
      return null;
    }

    var handleClick = function() {
      self.setState({
        showModalOverlay: true,
        dialog: self.renderDeleteDialog()
      });
    };

    return (
      <div className="PatientPage-deleteSection">
        <div onClick={handleClick}>{t('Delete my account')}</div>
      </div>
    );
  },

  overlayClickHandler: function() {
    this.setState(this.getInitialState());
  },

  renderModalOverlay: function() {
    return (
      <ModalOverlay
        show={this.state.showModalOverlay}
        dialog={this.state.dialog}
        overlayClickHandler={this.overlayClickHandler}/>
    );
  },

  renderAccess: function() {
    if (!this.isSamePersonUserAndPatient()) {
      return null;
    }

    return (
      <div className="PatientPage-teamSection">
        {this.renderPatientTeam()}
      </div>
    );
  },

  renderPatientTeam: function() {
    return (
      <PatientTeam
        acknowledgeNotification={this.props.acknowledgeNotification}
        cancellingInvite={this.props.cancellingInvite}
        changingMemberPermissions={this.props.changingMemberPermissions}
        invitingMemberInfo={this.props.invitingMemberInfo}
        onCancelInvite={this.props.onCancelInvite}
        onChangeMemberPermissions={this.props.onChangeMemberPermissions}
        onInviteMember={this.props.onInviteMember}
        onRemoveMember={this.props.onRemoveMember}
        patient={this.props.patient}
        pendingSentInvites={this.props.pendingSentInvites}
        removingMember={this.props.removingMember}
        trackMetric={this.props.trackMetric}
        user={this.props.user}
      />
    );
  },

  componentDidMount: function() {
    if (this.props.trackMetric) {
      if (this.props.shareOnly) {
        this.props.trackMetric('Viewed Share');
      } else {
        this.props.trackMetric('Viewed Profile')
      }
    }
  },

  doFetching: function(nextProps) {
    if (!nextProps.fetchers) {
      return
    }

    nextProps.fetchers.forEach(fetcher => {
      fetcher();
    });
  },

  /**
   * Before rendering for first time
   * begin fetching any required data
   */
  componentWillMount: function() {
    this.doFetching(this.props);
  }
}));

export default Patient;
