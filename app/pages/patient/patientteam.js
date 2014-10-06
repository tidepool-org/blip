/** @jsx React.DOM */
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
var cx = require('react/lib/cx');
var ModalOverlay = require('../../components/modaloverlay');
var InputGroup = require('../../components/inputgroup');

var PermissionInputGroup = React.createClass({
  propTypes: {
    name: React.PropTypes.string,
    items: React.PropTypes.array,
    value: React.PropTypes.string
  },
  getInitialState: function() {
    return {
      value: this.props.value
    };
  },
  handleChange: function(obj) {
    this.setState({value: obj.value});
  },
  render: function() {
    return (
      /* jshint ignore:start */
      <InputGroup
        name={this.props.name}
        items={this.props.items}
        type={'radios'}
        value={this.state.value}
        onChange={this.handleChange}/>
        /* jshint ignore:end */
    );
  }
});

var MemberInviteForm = React.createClass({
  propTypes: {
    onSubmit: React.PropTypes.func,
    onCancel: React.PropTypes.func,
    inputs: React.PropTypes.renderable
  },
  getInitialState: function() {
    return {
      validationError: false
    };
  },
  render: function() {
    var self = this;

    var handleSubmit = function(obj) {
      var email = self.refs.email.getDOMNode().value;

      var validateEmail = function(email) {
        var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(email);
      };

      if (!validateEmail(email)) {
        self.setState({
          validationError: true
        });
        return;
      } else {
        self.setState({
          validationError: false
        });
      }

      var permissions = {
        view: {},
        note: {}
      };

      if (self.props.inputs.state.value === 'upload') {
        permissions.upload = {};
      }

      self.props.onSubmit(email, permissions);
    };

    var error = null;

    if (this.state.validationError) {
      error = 'Invalid email address';
    }


    return (
      /* jshint ignore:start */
      <li className="PatientTeam-member--fadeNew  PatientTeam-member PatientTeam-member--first">
        <div className="PatientInfo-head">
          <div className="PatientTeam-pending">
            <i className="icon-pending-invite"></i>
          </div>
          <div className="PatientTeam-memberContent PatientTeam-blocks">
            <div className="">
              <input className="PatientInfo-input" id="email" ref="email" placeholder="email" />
              <div className="PatientTeam-permissionSelection">
                {this.props.inputs}
              </div>
              <div className="PatientTeam-buttonHolder">
                <button className="PatientInfo-button PatientInfo-button--secondary" type="button" onClick={this.props.onCancel}>Cancel</button>
                <button className="PatientInfo-button PatientInfo-button--primary" type="submit" onClick={handleSubmit}>Invite</button>
              </div>
              <div className="PatientTeam-validationError">{error}</div>
              <div className="clear"></div>
            </div>
          </div>
          <div className="clear"></div>
        </div>
      </li>
      /* jshint ignore:end */
    );
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
  },

  getInitialState: function() {
    return {
      showModalOverlay: false,
      checked: 'view'
    };
  },

  renderPermissionOptions: function(value, name) {
    var items = [
      {value: 'view', label: 'View only'},
      {value: 'upload', label: 'View and upload'}
    ];

    return (
      /* jshint ignore:start */
      <PermissionInputGroup
        name={name}
        items={items}
        value={value}/>
      /* jshint ignore:end */
    );
  },

  renderChangeTeamMemberPermissionsDialog: function(member) {
    var self = this;
    var value = _.isEmpty(member.permissions) === false && member.permissions.admin || _.isEmpty(member.permissions) === false && member.permissions.upload ? 'upload' : 'view';
    var name = 'permissionOptions'+ member.userid;
    var inputs = this.renderPermissionOptions(value, name);

    var handleChangeMemberPermissions = function() {
      var permissions = {
        view: {},
        note: {}
      };

      if (inputs.state.value === 'upload') {
        permissions.upload = {};
      }

      self.props.onChangeMemberPermissions(self.props.user.userid, member.userid, permissions, function(err) {
        self.setState({
          showModalOverlay: false,
        });
      });
    };

    return (
      /* jshint ignore:start */
      <div>
        <div className="ModalOverlay-content">
          <div>This is what {member.profile.fullName} is allowed to do with your data.</div>
          {inputs}
        </div>
        <div className="ModalOverlay-controls">
          <button className="PatientInfo-button PatientInfo-button--secondary" type="button" onClick={this.overlayClickHandler}>Cancel</button>
          <button className="PatientInfo-button PatientInfo-button--primary" type="submit" onClick={handleChangeMemberPermissions}>Save</button>
        </div>
      </div>
      /* jshint ignore:end */
    );
  },

  handleChangeTeamMemberPermissions: function(member) {
    var self = this;

    return function() {
      self.setState({
        showModalOverlay: true,
        dialog: self.renderChangeTeamMemberPermissionsDialog(member)
      });
    };
  },

  handleRemoveMember: function(member) {
    var self = this;

    return function() {
      self.props.onRemoveMember(self.props.user.userid, member.userid, function(err) {
          self.setState({
            showModalOverlay: false,
          });
        }
      );
    };
  },

  renderRemoveTeamMemberDialog: function(member) {
    return (
      /* jshint ignore:start */
      <div>
        <div className="ModalOverlay-content">{"Are you sure you want to remove this person? They will no longer be able to see or comment on your data."}</div>
        <div className="ModalOverlay-controls">
          <button className="PatientInfo-button PatientInfo-button--secondary" type="button" onClick={this.overlayClickHandler}>Cancel</button>
          <button className="PatientInfo-button PatientInfo-button--primary" type="submit" onClick={this.handleRemoveMember(member)}>{"I'm sure, remove them."}</button>
        </div>
      </div>
      /* jshint ignore:end */
    );
  },

  handleRemoveTeamMember: function(member) {
    var self = this;

    return function() {
      self.setState({
        showModalOverlay: true,
        dialog: self.renderRemoveTeamMemberDialog(member)
      });
    };
  },

  renderTeamMember: function(member) {
    var classes = {
      'icon-permissions': true
    };

    if(_.isEmpty(member.permissions)){
      return null;
    }else {
      if(member.permissions.admin) {
        classes['icon-permissions-own'] = true;
      } else if(member.permissions.upload) {
        classes['icon-permissions-upload'] = true;
      } else if(member.permissions.view) {
        classes['icon-permissions-view'] = true;
      } else {
        return null;
      }
    }

    var iconClasses = cx(classes);

    return (
      /* jshint ignore:start */
      <li key={member.userid} className="PatientTeam-member">
        <div className="PatientInfo-head">
          <div className="PatientTeam-picture PatientInfo-picture"></div>
          <div className="PatientTeam-blocks PatientInfo-blocks">
            <div className="PatientInfo-blockRow">
              <div className="PatientInfo-block PatientInfo-block--withArrow"><div>{member.profile.fullName}</div></div>
              <div className="PatientTeam-icon PatientTeam-icon--permission" title='upload' onClick={this.handleChangeTeamMemberPermissions(member)}><i className={iconClasses}></i></div>
              <div className="PatientTeam-icon" title='remove' onClick={this.handleRemoveTeamMember(member)}><i className="icon-remove"></i></div>
              <div className="clear"></div>
            </div>
          </div>
        </div>
      </li>
      /* jshint ignore:end */
    );

  },

  handleCancelInviteDialog: function(invite) {
    var self = this;

    return function() {
      self.props.onCancelInvite(invite.email, function(err) {
          self.setState({
            showModalOverlay: false,
          });
        }
      );
    };
  },

  renderCancelInviteDialog: function(invite) {
    return (
      /* jshint ignore:start */
      <div>
        <div className="ModalOverlay-content">Are you sure you want to cancel your invitation to {invite.email}?</div>
        <div className="ModalOverlay-controls">
          <button className="PatientInfo-button PatientInfo-button--secondary" type="button" onClick={this.overlayClickHandler}>Cancel</button>
          <button className="PatientInfo-button PatientInfo-button--primary" type="submit" onClick={this.handleCancelInviteDialog(invite)}>{"I'm sure, cancel it."}</button>
        </div>
      </div>
      /* jshint ignore:end */
    );
  },

  handleCancelInvite: function(invite) {
    var self = this;

    return function() {
      self.setState({
        showModalOverlay: true,
        dialog: self.renderCancelInviteDialog(invite)
      });
    };
  },

  renderPendingInvite: function(invite) {

    return (
      /* jshint ignore:start */
      <li key={invite.key} className="PatientTeam-member--fadeNew  PatientTeam-member">
        <div className="PatientInfo-head">
          <div className="PatientTeam-picture PatientInfo-picture"></div>
          <div className="PatientTeam-blocks PatientInfo-blocks">
            <div className="PatientInfo-blockRow">
              <div className="PatientInfo-block PatientInfo-block--withArrow" title={invite.email}><div>{invite.email}</div></div>
              <div className="PatientInfo-waiting">Waiting for confirmation</div>
              <div className="PatientTeam-icon" title='remove' onClick={this.handleCancelInvite(invite)}><i className="icon-remove"></i></div>
              <div className="clear"></div>
            </div>
          </div>
        </div>
      </li>
      /* jshint ignore:end */
    );

  },

  renderInviteForm: function() {
    var self = this;

    var handleSubmit = function(email, permissions) {
      self.props.onInviteMember(self.props.user.userid, email, permissions, function(err) {
        self.setState({
          showModalOverlay: false,
        });
      });
    };

    var handleCancel = function() {
      self.setState({
        invite: false
      });
    };

    return(
      /* jshint ignore:start */
      <MemberInviteForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        inputs={self.renderPermissionOptions('view', 'invitePermissionOptions')}
      />
      /* jshint ignore:end */
    );

  },

  renderInvite: function() {
    var isTeamEmpty = this.props.patient.team.length === 0;
    var self = this;
    var classes = {
      'PatientTeam-member': true,
      'PatientTeam-member--emptyNew': isTeamEmpty,
      'PatientTeam-member--fadeNew': !isTeamEmpty
    };

    classes = cx(classes);

    var handleClick = function() {
      self.setState({
        invite: true
      });
    };

    return (
      /* jshint ignore:start */
      <li className={classes}>
        <div className="PatientInfo-head">
          <div className="PatientTeam-picture PatientInfo-picture"></div>
          <div className="PatientTeam-blocks PatientInfo-blocks">
            <div className="PatientInfo-blockRow" onClick={handleClick}>
              <div className="PatientInfo-block PatientInfo-block--withArrow"><div>Invite new member</div></div>
              <div className="clear"></div>
            </div>
          </div>
        </div>
      </li>
      /* jshint ignore:end */
    );

  },

  overlayClickHandler: function() {
    this.setState({
      showModalOverlay: false
    });
  },

  renderModalOverlay: function() {

    return (
      /* jshint ignore:start */
      <ModalOverlay
        show={this.state.showModalOverlay}
        dialog={this.state.dialog}
        overlayClickHandler={this.overlayClickHandler}/>
      /* jshint ignore:end */
    );

  },

  render: function() {
    var members = _.map(this.props.patient.team, this.renderTeamMember);
    var pendingInvites = _.map(this.props.pendingInvites, this.renderPendingInvite);
    var invite = this.state && this.state.invite ? this.renderInviteForm() : this.renderInvite();

    return (
      /* jshint ignore:start */
      <ul>
        {members}
        {pendingInvites}
        {invite}
        {this.renderModalOverlay()}
        <div className="clear"></div>
      </ul>
      /* jshint ignore:end */
    );

  }
});

module.exports = PatientTeam;
