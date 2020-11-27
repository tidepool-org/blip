
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
import createReactClass from 'create-react-class';
import { connect } from 'react-redux';
import { translate, Trans } from 'react-i18next';
import { bindActionCreators } from 'redux';

import * as actions from '../../redux/actions';

import _ from 'lodash';

import personUtils from '../../core/personutils';
import ModalOverlay from '../../components/modaloverlay';
import PatientInfo from './patientinfo';
import { PatientTeam } from './patientteam';
import config from '../../config';

const Patient = translate()(createReactClass({
  displayName: 'Patient',

  // many things *not* required here because they aren't needed for
  // /patients/:id/profile although they are for /patients/:id/share (or vice-versa)
  propTypes: {
    acknowledgeNotification: PropTypes.func.isRequired,
    cancellingInvite: PropTypes.bool,
    dataDonationAccounts: PropTypes.array,
    dataDonationAccountsFetched: PropTypes.bool,
    changingMemberPermissions: PropTypes.bool,
    fetchers: PropTypes.array.isRequired,
    fetchingPatient: PropTypes.bool.isRequired,
    fetchingUser: PropTypes.bool.isRequired,
    invitingMemberInfo: PropTypes.object,
    onCancelInvite: PropTypes.func,
    onChangeMemberPermissions: PropTypes.func,
    onInviteMember: PropTypes.func,
    onRemoveMember: PropTypes.func,
    onUpdateDataDonationAccounts: PropTypes.func,
    onUpdatePatient: PropTypes.func,
    onUpdatePatientSettings: PropTypes.func,
    patient: PropTypes.object,
    pendingSentInvites: PropTypes.array,
    removingMember: PropTypes.bool,
    shareOnly: PropTypes.bool,
    trackMetric: PropTypes.func.isRequired,
    updatingDataDonationAccounts: PropTypes.bool,
    updatingPatientBgUnits: PropTypes.bool,
    user: PropTypes.object,
    dataSources: PropTypes.array,
    fetchDataSources: PropTypes.func,
    connectDataSource: PropTypes.func,
    disconnectDataSource: PropTypes.func,
    authorizedDataSource: PropTypes.object,
    queryParams: PropTypes.object,
    api: PropTypes.object,
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
          dataDonationAccountsFetched={this.props.dataDonationAccountsFetched}
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
    const mailto = `mailto:${config.SUPPORT_EMAIL_ADDRESS}?Subject=Delete%20my%20account`;
    return (
      <Trans i18nKey="html.patient-delete-account">If you are sure you want to delete your account, please <a href={mailto} target="_blank">send an email</a> and we take care of it for you.</Trans>
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
  UNSAFE_componentWillMount: function() {
    this.doFetching(this.props);
  },
}));

export default Patient;
