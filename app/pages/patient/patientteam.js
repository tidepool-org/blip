
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

var React = require('react');
var _ = require('lodash');
var cx = require('classnames');
var ModalOverlay = require('../../components/modaloverlay');
var InputGroup = require('../../components/inputgroup');
var personUtils = require('../../core/personutils');
var utils = require('../../core/utils');

var PermissionInputGroup = React.createClass({
  propTypes: {
    value: React.PropTypes.bool,
    working: React.PropTypes.bool,
    onChange: React.PropTypes.func
  },
  getDefaultProps: function() {
    return {
      value: false,
      working: false,
    };
  },
  getInitialState: function() {
    return {
      name: 'permission' + parseInt(Math.random() * 10000)
    };
  },
  handleChange: function(obj) {
    if(this.props.onChange) {
      var self = this;
      this.props.onChange(obj.value);
    } else {
      this.setState({value: obj.value});
    }
  },
  getValue: function() {
    return this.props.value;
  },
  render: function() {
    return (
      
      <InputGroup
        name={this.state.name}
        type="checkbox"
        label="Allow uploading"
        disabled={this.props.working}
        value={this.props.value}
        onChange={this.handleChange}/>
        
    );
  }
});

var MemberInviteForm = React.createClass({
  propTypes: {
    onSubmit: React.PropTypes.func,
    onCancel: React.PropTypes.func,
    working: React.PropTypes.bool.isRequired,
    error: React.PropTypes.string,
    trackMetric: React.PropTypes.func.isRequired
  },
  getInitialState: function() {
    return {
      allowUpload: false,
      error: null
    };
  },
  componentDidMount: function() {
    // When invite form appears, automatically focus so user can start
    // typing email without clicking a second time
    this.refs.email.focus();
  },
  render: function() {
    return (
      <li className="PatientTeam-member PatientTeam-member--first">
        <div className="PatientInfo-head">
          <div className="PatientTeam-picture PatientInfo-picture PatientTeam-picture--newMember"></div>
          <div className="PatientTeam-memberContent PatientTeam-blocks">
            <div className="">
              <input className="PatientInfo-input" id="email" ref="email" placeholder="Email" />
              <div className="PatientTeam-permissionSelection">
                <PermissionInputGroup ref="allowUpload" value={this.state.allowUpload} />
              </div>
              <div className="PatientTeam-buttonHolder">
                <button className="PatientInfo-button PatientInfo-button--secondary" type="button"
                  onClick={this.props.onCancel}
                  disabled={this.props.working}>Cancel</button>
                <button className="PatientInfo-button PatientInfo-button--primary" type="submit"
                  onClick={this.handleSubmit}
                  disabled={this.props.working}>
                  {this.props.working ? 'Sending...' : 'Invite'}
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
  },

  handleSubmit: function(e) {
    if (e) {
      e.preventDefault();
    }

    var email = this.refs.email.value;
    var allowUpload = this.refs.allowUpload.getValue();

    var validateEmail = function(email) {
      var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
      return re.test(email);
    };

    if (!validateEmail(email)) {
      this.setState({
        error: 'Invalid email address'
      });
      return;
    } else {
      this.setState({error: null});
    }

    var permissions = {
      view: {},
      note: {}
    };

    if (allowUpload) {
      this.props.trackMetric('Clicked Allow Uploading');
      permissions.upload = {};
    }

    this.setState({
      allowUpload: allowUpload,
    });
    var self = this;
    this.props.onSubmit(email, permissions);
    self.props.trackMetric('Clicked Invite');
  }
});

var ConfirmDialog = React.createClass({
  propTypes: {
    working: React.PropTypes.bool.isRequired,
    error: React.PropTypes.string,
    message: React.PropTypes.node,
    buttonText: React.PropTypes.string,
    dismissText: React.PropTypes.string,
    buttonTextWorking: React.PropTypes.string,
    onSubmit: React.PropTypes.func,
    onCancel: React.PropTypes.func
  },

  getInitialState: function() {
    return {
      error: null
    };
  },

  render: function() {
    return (
      <div>
        <div className="ModalOverlay-content">
          <div className="ModalOverlay-content">{this.props.message}</div>
        </div>
        <div className="ModalOverlay-controls">
          <button className="PatientInfo-button PatientInfo-button--secondary" type="button"
            onClick={this.props.onCancel}
            disabled={this.props.working}>{this.props.dismissText || 'Cancel'}</button>
          <button className="PatientInfo-button PatientInfo-button--warning PatientInfo-button--primary" type="submit"
            onClick={this.handleSubmit}
            disabled={this.props.working}>
            {this.props.working ? this.props.buttonTextWorking : this.props.buttonText}
          </button>
        </div>
        <div className="PatientTeam-validationError">{this.props.error || this.state.error}</div>
      </div>
    );
  },

  handleSubmit: function(e) {
    if (e) {
      e.preventDefault();
    }

    this.setState({
      error: null
    });

    this.props.onSubmit();
  }
});

var PatientTeam = React.createClass({
  propTypes: {
    user: React.PropTypes.object,
    patient: React.PropTypes.object,
    pendingInvites: React.PropTypes.array,
    onChangeMemberPermissions: React.PropTypes.func,
    onRemoveMember: React.PropTypes.func,
    onInviteMember: React.PropTypes.func,
    onCancelInvite: React.PropTypes.func,
    trackMetric: React.PropTypes.func.isRequired, 
    changingMemberPermissions: React.PropTypes.object.isRequired,
    removingMember: React.PropTypes.object.isRequired,
    invitingMember: React.PropTypes.object.isRequired,
    cancellingInvite: React.PropTypes.object.isRequired
  },

  getInitialState: function() {
    return {
      showModalOverlay: false,
      invite: false,
      dialog: '',
      editing: false
    };
  },

  renderRemoveTeamMemberDialog: function(member) {
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
        working={self.props.removingMember.inProgress}
        message={'Are you sure you want to remove this person? They will no longer be able to see or comment on your data.'}
        buttonText={'I\'m sure, remove them'}
        buttonTextWorking={'Removing...'}
        onSubmit={handleSubmit}
        onCancel={handleCancel} />
    );
  },

  handleRemoveTeamMember: function(member) {
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
  },

  handlePermissionChange: function(member) {
    var self = this;

    return function(allowUpload) {
      var permissions = {
        view: {},
        note: {}
      };

      if (allowUpload) {
        permissions.upload = {};
      }

      self.props.onChangeMemberPermissions(self.props.user.userid, member.userid, permissions);

      self.setState({
        showModalOverlay: false,
      });
    };
  },

  renderTeamMember: function(member) {
    var classes = {
      'icon-permissions': true
    };
    var allowUpload = false;

    if(_.isEmpty(member.permissions)){
      return null;
    } else {
      if(member.permissions.admin) {
        classes['icon-permissions-own'] = true;
        allowUpload = true;
      } else if(member.permissions.upload) {
        classes['icon-permissions-upload'] = true;
        allowUpload = true;
      } else if(member.permissions.view) {
        classes['icon-permissions-view'] = true;
      } else {
        return null;
      }
    }

    var iconClasses = cx(classes);

    return (
      <li key={member.userid} className="PatientTeam-member">
        <div className="PatientInfo-head">
          <div className="PatientTeam-picture PatientInfo-picture"></div>
          <div className="PatientTeam-blocks PatientInfo-blocks">
            <div className="PatientInfo-blockRow">
              <div className="PatientInfo-block PatientInfo-block--withArrow"><div>{member.profile.fullName}</div></div>
              <a href="" className="PatientTeam-icon PatientTeam-icon--remove" title='Remove member' onClick={this.handleRemoveTeamMember(member)}><i className="icon-delete"></i></a>
              <div className="clear"></div>
              <PermissionInputGroup 
                onChange={this.handlePermissionChange(member)} 
                value={allowUpload} 
                working={this.props.changingMemberPermissions.inProgress}
              />
            </div>
          </div>
        </div>
      </li>
    );

  },

  renderCancelInviteDialog: function(invite) {
    var self = this;

    var handleCancel = this.overlayClickHandler;
    var handleSubmit = function() {
      self.props.onCancelInvite(invite.email);
      self.setState({
        showModalOverlay: false,
      });
    };

    var error = null;
    var notification = this.props.cancellingInvite.notification; 

    if (notification && notification.type === 'error') {
      error = notification.message;
    }

    return (
      <ConfirmDialog
        message={'Are you sure you want to cancel your invitation to ' + invite.email + '?'}
        buttonText={'Yes'}
        dismissText={'No'}
        buttonTextWorking={'Canceling invitation...'}
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        working={this.props.cancellingInvite.inProgress}
        error={error} />
    );
  },

  handleCancelInvite: function(invite) {
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
  },

  renderPendingInvite: function(invite) {

    return (
      <li key={invite.key} className="PatientTeam-member--fadeNew  PatientTeam-member">
        <div className="PatientInfo-head">
          <div className="PatientTeam-picture PatientInfo-picture"></div>
          <div className="PatientTeam-blocks PatientInfo-blocks">
            <div className="PatientInfo-blockRow">
              <div className="PatientInfo-block PatientInfo-block--withArrow" title={invite.email}><div>{invite.email}</div></div>
              <a href="" className="PatientTeam-icon PatientTeam-icon--remove" title='Dismiss invitation' onClick={this.handleCancelInvite(invite)}><i className="icon-delete"></i></a>
              <div className="clear"></div>
              <div className="PatientInfo-waiting">Waiting for confirmation</div>
            </div>
          </div>
        </div>
      </li>
    );
  },

  renderInviteForm: function() {
    var self = this;

    var handleSubmit = function(email, permissions) {
      self.props.onInviteMember(email, permissions);

      self.setState({
        invite: false,
      });
    };

    var handleCancel = function() {
      self.setState({
        invite: false
      });
    };

    var error = null;
    var notification = this.props.cancellingInvite.notification; 

    if (notification && notification.type === 'error') {
      error = notification.message;
    }

    return(
      <MemberInviteForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        trackMetric={this.props.trackMetric}
        working={this.props.invitingMember.inProgress}
        error={error}
      />
    );

  },

  renderInvite: function() {
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
              <a href="" onClick={handleClick} className="PatientInfo-block PatientInfo-block--withArrow">Invite new member</a>
            </div>
          </div>
        </div>
      </li>
      
    );

  },

  overlayClickHandler: function() {
    this.setState({
      showModalOverlay: false
    });
  },

  renderModalOverlay: function() {

    return (
      
      <ModalOverlay
        show={this.state.showModalOverlay}
        dialog={this.state.dialog}
        overlayClickHandler={this.overlayClickHandler}/>
      
    );

  },

  renderEditControls: function() {
    var key = 'edit';
    var text = 'Remove People';
    if (this.state.editing) {
      key = 'cancel';
      text = 'Done';
    }

    return (
      <div className="PatientInfo-controls">
        <button key={key} onClick={this.toggleEdit} className="PatientInfo-button PatientInfo-button--secondary" type="button">{text}</button>
      </div>
    );
  },

  toggleEdit: function() {
    this.setState({
      editing: !this.state.editing,
    });
  },

  render: function() {
    var classes = cx({
      'PatientTeam': true,
      'isEditing': this.state.editing
    });

    var members = [];
    if (utils.getIn(this.props, ['patient', 'team'])) {
      members = _.map(this.props.patient.team, this.renderTeamMember);
    }
    
    var editControls = _.isEmpty(members) ? null : this.renderEditControls();

    var pendingInvites = [];
    if (utils.getIn(this.props, ['pendingInvites'])) {
      pendingInvites = _.map(this.props.pendingInvites, this.renderPendingInvite);
    }

    var invite = this.state && this.state.invite ? this.renderInviteForm() : this.renderInvite();

    var emptyList = !(members || pendingInvites);
    var listClass = cx({
      'PatientTeam-list': true,
      'PatientTeam-list--single': emptyList,
    });
    
    var patientName = personUtils.patientFullName(this.props.patient);

    return (
      <div className={classes}>
        <div className="PatientPage-sectionTitle">
          {'Share'}
          <span className="PatientPage-sectionTitleMessage">
            {'These people can view ' + patientName + '\'s data'}
          </span>
        </div>
        <div className="clear"></div>
        <ul className={listClass}>
          {members}
          {pendingInvites}
          {invite}
          <div className="clear"></div>
        </ul>
        {editControls}
        {this.renderModalOverlay()}
      </div>
    );
  }
});

module.exports = PatientTeam;
