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
import { translate } from 'react-i18next';
import _ from 'lodash';
import cx from 'classnames';
import config from '../../config';

import InputGroup from '../../components/inputgroup';
var ModalOverlay = require('../../components/modaloverlay');
var personUtils = require('../../core/personutils');
var utils = require('../../core/utils');

var PermissionInputGroup = translate()(class PermissionInputGroup extends React.Component {
  static propTypes = {
    value: PropTypes.bool,
    working: PropTypes.bool,
    onChange: PropTypes.func
  };

  static defaultProps = {
    value: true,
    working: false,
  };

  state = {
    name: 'permission' + parseInt(Math.random() * 10000)
  };

  handleChange = (obj) => {
    if(this.props.onChange) {
      this.props.onChange(obj.value);
    } else {
      this.setState({value: obj.value});
    }
  };

  getValue = () => {
    return this.props.value;
  };

  render() {
    const { t } = this.props;
    return (
      <InputGroup
        name={this.state.name}
        type="checkbox"
        label={t('Allow uploading')}
        disabled={this.props.working}
        value={this.props.value}
        onChange={this.handleChange}/>
    );
  }
});

var MemberInviteForm = translate()(class MemberInviteForm extends React.Component {
  static propTypes = {
    onSubmit: PropTypes.func,
    onCancel: PropTypes.func,
    working: PropTypes.bool.isRequired,
    error: PropTypes.string,
    trackMetric: PropTypes.func.isRequired
  };

  state = {
    // By default uploads are allowed when enabled
    allowUpload: !config.HIDE_UPLOAD_LINK,
    error: null
  };

  onAllowUploadClick = (value) => {
    this.setState({allowUpload: value});
  };

  componentDidMount() {
    // When invite form appears, automatically focus so user can start
    // typing email without clicking a second time
    this.refs.email.focus();
  }

  render() {
    const { t } = this.props;
    var upload = config.HIDE_UPLOAD_LINK ? null : this.renderUpload();
    return (
      <li className="PatientTeam-member PatientTeam-member--first">
        <div className="PatientInfo-head">
          <div className="PatientTeam-picture PatientInfo-picture PatientTeam-picture--newMember"></div>
          <div className="PatientTeam-memberContent PatientTeam-blocks">
            <div className="">
              <input className="PatientInfo-input" id="email" ref="email" placeholder={t('Email')} />
              {upload}
              <div className="PatientTeam-buttonHolder">
                <button className="PatientInfo-button PatientInfo-button--secondary" type="button"
                  onClick={this.props.onCancel}
                  disabled={this.props.working}>{t('Cancel')}</button>
                <button className="PatientInfo-button PatientInfo-button--primary" type="submit"
                  onClick={this.handleSubmit}
                  disabled={this.props.working}>
                  {this.props.working ? t('Sending...') : t('Invite')}
                </button>
              </div>
              <div className="PatientTeam-validationError">{this.props.error || this.state.error}</div>
              <div className="clear"></div>
            </div>
          </div>
          <div className="clear"></div>
        </div>
      </li>
    );
  }

  renderUpload = () => {
    return (
      <div className="PatientTeam-permissionSelection">
        <PermissionInputGroup ref="allowUpload" value={this.state.allowUpload} onChange={this.onAllowUploadClick}/>
      </div>
    );
  };

  handleSubmit = (e) => {
    const { t } = this.props;
    if (e) {
      e.preventDefault();
    }

    var self = this;
    var email = _.get(self, 'refs.email.value', '').trim();
    var allowUpload = !config.HIDE_UPLOAD_LINK;

    var validateEmail = function(email) {
      var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(email);
    };

    if (!validateEmail(email)) {
      self.setState({error: t('Invalid email address.')});
      return;
    } else {
      self.setState({error: null});
    }

    var permissions = {
      view: {},
      note: {}
    };

    if (allowUpload) {
      allowUpload = self.refs.allowUpload.getWrappedInstance().getValue();
      if (allowUpload) {
        self.props.trackMetric('invitation with upload on');
        permissions.upload = {};
      } else {
        self.props.trackMetric('invitation with upload off');
      }
    }

    self.setState({ allowUpload });
    self.props.onSubmit(email, permissions);
    self.props.trackMetric('Clicked Invite');
  };
});

var ConfirmDialog = translate()(class ConfirmDialog extends React.Component {
  static propTypes = {
    buttonText: PropTypes.string,
    dismissText: PropTypes.string,
    message: PropTypes.node,
    onCancel: PropTypes.func,
    onSubmit: PropTypes.func,
  };

  render() {
    const { t } = this.props;
    return (
      <div>
        <div className="ModalOverlay-content">
          <div className="ModalOverlay-content">{this.props.message}</div>
        </div>
        <div className="ModalOverlay-controls">
          <button className="PatientInfo-button PatientInfo-button--secondary" type="button"
            onClick={this.props.onCancel}>{this.props.dismissText || t('Cancel')}</button>
          <button className="PatientInfo-button PatientInfo-button--warning PatientInfo-button--primary" type="submit"
            onClick={this.handleSubmit}>
            {this.props.buttonText}
          </button>
        </div>
      </div>
    );
  }

  handleSubmit = (e) => {
    if (e) {
      e.preventDefault();
    }

    this.props.onSubmit();
  };
});

var PatientTeam = translate()(class extends React.Component {
  static propTypes = {
    acknowledgeNotification: PropTypes.func.isRequired,
    cancellingInvite: PropTypes.bool.isRequired,
    changingMemberPermissions: PropTypes.bool.isRequired,
    invitingMemberInfo: PropTypes.object.isRequired,
    onCancelInvite: PropTypes.func.isRequired,
    onChangeMemberPermissions: PropTypes.func.isRequired,
    onInviteMember: PropTypes.func.isRequired,
    onRemoveMember: PropTypes.func.isRequired,
    patient: PropTypes.object.isRequired,
    pendingSentInvites: PropTypes.array.isRequired,
    removingMember: PropTypes.bool.isRequired,
    trackMetric: PropTypes.func.isRequired,
    user: PropTypes.object.isRequired,
    t: PropTypes.func.isRequired,
  };

  state = {
    showModalOverlay: false,
    invite: false,
    dialog: '',
    editing: false
  };

  renderRemoveTeamMemberDialog = (member) => {
    const { t } = this.props;
    var self = this;

    var handleCancel = this.overlayClickHandler;
    var handleSubmit = function() {
      self.props.onRemoveMember(self.props.user.userid, member.userid);
      self.setState({
        showModalOverlay: false,
      });
    };

    return (
      <ConfirmDialog
        buttonText={t("I'm sure, remove them")}
        message={t('Are you sure you want to remove this person? They will no longer be able to see or comment on your data.')}
        onCancel={handleCancel}
        onSubmit={handleSubmit} />
    );
  };

  handleRemoveTeamMember = (member) => {
    var self = this;

    return function(e) {
      if (e) {
        e.preventDefault();
      }
      self.setState({
        showModalOverlay: true,
        dialog: self.renderRemoveTeamMemberDialog(member)
      });
    };
  };

  handlePermissionChange = (member) => {
    var self = this;

    return function(allowUpload) {
      var permissions = {
        view: {},
        note: {}
      };

      if (allowUpload) {
        self.props.trackMetric('upload permission turned on');
        permissions.upload = {};
      } else {
        self.props.trackMetric('upload permission turned off');
      }

      self.props.onChangeMemberPermissions(self.props.user.userid, member.userid, permissions);

      self.setState({ showModalOverlay: false });
    };
  };

  renderTeamMember = (member) => {
    if (_.isEmpty(member.permissions) || !(member.permissions.upload || member.permissions.view)) {
      return null;
    }

    const { t } = this.props;
    var upload = config.HIDE_UPLOAD_LINK ? null : this.renderUpload(member);

    return (
      <li key={member.userid} className="PatientTeam-member">
        <div className="PatientInfo-head">
          <div className="PatientTeam-picture PatientInfo-picture"></div>
          <div className="PatientTeam-blocks PatientInfo-blocks">
            <div className="PatientInfo-blockRow">
              <div className="PatientInfo-block PatientInfo-block--withArrow"><div>{member.profile.fullName}</div></div>
              <a href="" className="PatientTeam-icon PatientTeam-icon--remove" title={t('Remove member')} onClick={this.handleRemoveTeamMember(member)}><i className="icon-delete"></i></a>
              <div className="clear"></div>
              {upload}
            </div>
          </div>
        </div>
      </li>
    );
  };

  renderUpload = (member) => {
    const { changingMemberPermissions } = this.props;
    let allowUpload = false;

    if (member.permissions.upload) {
      allowUpload = true;
    }

    return (
      <PermissionInputGroup
        onChange={this.handlePermissionChange(member)}
        value={allowUpload}
        working={changingMemberPermissions}
      />);
  };

  renderCancelInviteDialog = (invite) => {
    const { t } = this.props;
    var self = this;

    var handleCancel = this.overlayClickHandler;
    var handleSubmit = function() {
      self.props.onCancelInvite(invite.email);
      self.setState({
        showModalOverlay: false,
      });
    };

    return (
      <ConfirmDialog
        buttonText={t('Yes')}
        dismissText={t('No')}
        message={t('Are you sure you want to cancel your invitation to {{email}}?', {email: invite.email})}
        onCancel={handleCancel}
        onSubmit={handleSubmit} />
    );
  };

  handleCancelInvite = (invite) => {
    var self = this;

    return function(e) {
      if (e) {
        e.preventDefault();
      }
      self.setState({
        showModalOverlay: true,
        dialog: self.renderCancelInviteDialog(invite)
      });
    };
  };

  renderPendingInvite = (invite) => {
    const { t } = this.props;
    return (
      <li key={invite.key} className="PatientTeam-member--fadeNew  PatientTeam-member">
        <div className="PatientInfo-head">
          <div className="PatientTeam-picture PatientInfo-picture"></div>
          <div className="PatientTeam-blocks PatientInfo-blocks">
            <div className="PatientInfo-blockRow">
              <div className="PatientInfo-block PatientInfo-block--withArrow" title={invite.email}><div>{invite.email}</div></div>
              <a href="" className="PatientTeam-icon PatientTeam-icon--remove" title='Dismiss invitation' onClick={this.handleCancelInvite(invite)}><i className="icon-delete"></i></a>
              <div className="clear"></div>
              <div className="PatientInfo-waiting">{t('Waiting for confirmation')}</div>
            </div>
          </div>
        </div>
      </li>
    );
  };

  renderInviteForm = () => {
    var self = this;

    var handleSubmit = function(email, permissions) {
      self.props.onInviteMember(email, permissions);

      self.setState({
        invite: false
      });
    };

    var handleCancel = function() {
      self.setState({
        invite: false
      });
      self.props.acknowledgeNotification('sendingInvite');
    };

    var error = null;
    var notification = _.get(this.props.invitingMemberInfo, 'notification');

    if (notification && notification.type === 'error') {
      error = notification.message;
    }

    return(
      <MemberInviteForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        trackMetric={this.props.trackMetric}
        working={_.get(this.props.invitingMemberInfo, 'inProgress')}
        error={error}
      />
    );

  };

  renderInvite = () => {
    const { t } = this.props;
    var isTeamEmpty = false;
    if (utils.getIn(this.props, ['patient', 'team'])) {
      isTeamEmpty = this.props.patient.team.length === 0;
    }
    var self = this;
    var classes = {
      'PatientTeam-member': true,
      'PatientTeam-member--emptyNew': isTeamEmpty,
      'PatientTeam-member--new': !isTeamEmpty
    };

    classes = cx(classes);

    var handleClick = function(e) {
      e.preventDefault();
      self.props.trackMetric('Clicked Invite New Member');
      self.setState({
        invite: true
      });
    };

    return (
      <li className={classes}>
        <div className="PatientInfo-head">
          <div className="PatientTeam-picture PatientInfo-picture PatientTeam-picture--newMember"></div>
          <div className="PatientTeam-blocks PatientInfo-blocks">
            <div className="PatientInfo-blockRow" onClick={handleClick}>
              <a href="" onClick={handleClick} className="PatientInfo-block PatientInfo-block--withArrow">{t('Invite new member')}</a>
            </div>
          </div>
        </div>
      </li>
    );
  };

  overlayClickHandler = () => {
    this.setState({
      showModalOverlay: false
    });
  };

  renderModalOverlay = () => {
    return (
      <ModalOverlay
        show={this.state.showModalOverlay}
        dialog={this.state.dialog}
        overlayClickHandler={this.overlayClickHandler}/>
    );
  };

  renderEditControls = () => {
    const { t } = this.props;
    var key = 'edit';
    var text = t('Remove People');
    if (this.state.editing) {
      key = 'cancel';
      text = t('Done');
    }

    return (
      <div className="PatientInfo-controls">
        <button key={key} onClick={this.toggleEdit} className="PatientInfo-button PatientInfo-button--secondary" type="button">{text}</button>
      </div>
    );
  };

  toggleEdit = () => {
    this.setState({
      editing: !this.state.editing,
    });
  };

  render() {
    const { t } = this.props;
    var classes = cx({
      'PatientTeam': true,
      'isEditing': this.state.editing
    });

    var members = [];
    if (utils.getIn(this.props, ['patient', 'team'])) {
      members = _.map(this.props.patient.team, this.renderTeamMember);
    }

    var editControls = _.isEmpty(members) ? null : this.renderEditControls();

    var pendingSentInvites = [];
    if (utils.getIn(this.props, ['pendingSentInvites'])) {
      // We don't want to render data donation accounts here, as they are managed in the settings page
      const filteredInvites = _.reject(this.props.pendingSentInvites, personUtils.isDataDonationAccount);
      pendingSentInvites = _.map(filteredInvites, this.renderPendingInvite);
    }

    var inviteInProgress = _.get(this.props.invitingMemberInfo, 'inProgress', false);
    var inviteError = _.get(this.props.invitingMemberInfo, 'notification', false);

    var invite = (this.state.invite || inviteInProgress || inviteError)
      ? this.renderInviteForm() : this.renderInvite();

    var emptyList = !(members || pendingSentInvites);
    var listClass = cx({
      'PatientTeam-list': true,
      'PatientTeam-list--single': emptyList,
    });

    var patientName = personUtils.patientFullName(this.props.patient);

    return (
      <div className={classes}>
        <div className="PatientPage-sectionTitle">
          {t('Share')}
          <span className="PatientPage-sectionTitleMessage">
            {t('These people can view {{patientName}}\'s data', {patientName})}
          </span>
        </div>
        <div className="clear"></div>
        <ul className={listClass}>
          {members}
          {pendingSentInvites}
          {invite}
          <div className="clear"></div>
        </ul>
        {editControls}
        {this.renderModalOverlay()}
      </div>
    );
  }
});

export {
  PatientTeam,
  MemberInviteForm
};
