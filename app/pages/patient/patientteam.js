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
    value: React.PropTypes.string
  },
  getDefaultProps: function() {
    return {
      value: false
    };
  },
  getInitialState: function() {
    return {
      value: this.props.value
    };
  },
  componentWillReceiveProps: function(nextProps) {
    this.setState({value: nextProps.value});
  },
  handleChange: function(obj) {
    this.setState({value: obj.value});
  },
  // Doesn't feel very React-y, but handy in this case
  getValue: function() {
    return this.state.value;
  },
  render: function() {
    return (
      /* jshint ignore:start */
      <InputGroup
        name="upload"
        type="checkbox"
        label="Allow this person to upload data for you"
        value={this.state.value}
        onChange={this.handleChange}/>
        /* jshint ignore:end */
    );
  }
});

var MemberInviteForm = React.createClass({
  propTypes: {
    onSubmit: React.PropTypes.func,
    onCancel: React.PropTypes.func
  },
  getInitialState: function() {
    return {
      working: false,
      allowUpload: false,
      error: null
    };
  },
  componentDidMount: function() {
    // When invite form appears, automatically focus so user can start
    // typing email without clicking a second time
    this.refs.email.getDOMNode().focus();
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
                  disabled={this.state.working}>Cancel</button>
                <button className="PatientInfo-button PatientInfo-button--primary" type="submit"
                  onClick={this.handleSubmit}
                  disabled={this.state.working}>
                  {this.state.working ? 'Sending...' : 'Invite'}
                </button>
              </div>
              <div className="PatientTeam-validationError">{this.state.error}</div>
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

    var email = this.refs.email.getDOMNode().value;
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
      this.setState({
        validationError: false
      });
    }

    var permissions = {
      view: {},
      note: {}
    };

    if (allowUpload) {
      permissions.upload = {};
    }

    this.setState({
      working: true,
      allowUpload: allowUpload,
      error: null
    });
    var self = this;
    this.props.onSubmit(email, permissions, function(err) {
      if (err) {
        if (err.status === 409) {
          return self.setState({
            working: false,
            error: 'Looks like you\'ve already sent an invitation to that email'
          });
        }

        return self.setState({
          working: false,
          error: 'Sorry! Something went wrong...'
        });
      }
      self.setState({working: false});
    });
  }
});

var ChangePermissionsForm = React.createClass({
  propTypes: {
    member: React.PropTypes.object,
    onSubmit: React.PropTypes.func,
    onCancel: React.PropTypes.func
  },

  getInitialState: function() {
    return this.initialStateFromProps(this.props);
  },

  componentDidMount: function() {
  },

  componentWillReceiveProps: function(nextProps) {
    this.setState(this.initialStateFromProps(nextProps));
  },

  initialStateFromProps: function(props) {
    return {
      allowUpload: this.isMemberAllowedToUpload(props.member),
      working: false,
      error: null
    };
  },

  isMemberAllowedToUpload: function(member) {
    return ((_.isEmpty(member.permissions) === false && member.permissions.admin) ||
            (_.isEmpty(member.permissions) === false && member.permissions.upload));
  },

  render: function() {
    var member = this.props.member;

    return (
      <div>
        <div className="ModalOverlay-content">
          <div className="PatientTeam-changePermissionsFormText">
            {member.profile.fullName + ' is allowed to view your data. '}
            {'You can set or unset additional permissions below:'}
          </div>
          <div className="PatientTeam-changePermissionsFormInput">
            <PermissionInputGroup ref="allowUpload" value={this.state.allowUpload} />
          </div>
        </div>
        <div className="ModalOverlay-controls">
          <button className="PatientInfo-button PatientInfo-button--secondary" type="button"
            onClick={this.props.onCancel}
            disabled={this.state.working}>Cancel</button>
          <button className="PatientInfo-button PatientInfo-button--primary" type="submit"
            onClick={this.handleSave}
            disabled={this.state.working}>
            {this.state.working ? 'Saving...' : 'Save'}</button>
        </div>
        <div className="PatientTeam-validationError">{this.state.error}</div>
      </div>
    );
  },

  handleSave: function(e) {
    if (e) {
      e.preventDefault();
    }

    var permissions = {
      view: {},
      note: {}
    };

    var allowUpload = this.refs.allowUpload.getValue();
    if (allowUpload) {
      permissions.upload = {};
    }

    this.setState({
      allowUpload: allowUpload,
      working: true,
      error: null
    });
    var self = this;
    this.props.onSubmit(permissions, function(err) {
      if (err) {
        self.setState({
          working: false,
          error: 'Sorry! Something went wrong...'
        });
        return;
      }
      self.setState({working: false});
    });
  }
});

var ConfirmDialog = React.createClass({
  propTypes: {
    message: React.PropTypes.renderable,
    buttonText: React.PropTypes.string,
    dismissText: React.PropTypes.string,
    buttonTextWorking: React.PropTypes.string,
    onSubmit: React.PropTypes.func,
    onCancel: React.PropTypes.func
  },

  getInitialState: function() {
    return {
      working: false,
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
            disabled={this.state.working}>{this.props.dismissText || 'Cancel'}</button>
          <button className="PatientInfo-button PatientInfo-button--primary" type="submit"
            onClick={this.handleSubmit}
            disabled={this.state.working}>
            {this.state.working ? this.props.buttonTextWorking : this.props.buttonText}
          </button>
        </div>
        <div className="PatientTeam-validationError">{this.state.error}</div>
      </div>
    );
  },

  handleSubmit: function(e) {
    if (e) {
      e.preventDefault();
    }

    this.setState({
      working: true,
      error: null
    });
    var self = this;
    this.props.onSubmit(function(err) {
      if (err) {
        self.setState({
          working: false,
          error: 'Sorry! Something went wrong...'
        });
        return;
      }
      self.setState({working: false});
    });
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
      invite: false,
      dialog: null,
      editing: false
    };
  },

  renderChangeTeamMemberPermissionsDialog: function(member) {
    var self = this;

    var handleCancel = this.overlayClickHandler;
    var handleSubmit = function(permissions, cb) {
      self.props.onChangeMemberPermissions(self.props.user.userid, member.userid, permissions, function(err) {
        if (err) {
          return cb(err);
        }
        cb();
        self.setState({
          showModalOverlay: false,
        });
      });
    };

    return (
      <ChangePermissionsForm
        member={member}
        onSubmit={handleSubmit}
        onCancel={handleCancel} />
    );
  },

  handleChangeTeamMemberPermissions: function(member) {
    var self = this;

    return function(e) {
      if (e) {
        e.preventDefault();
      }
      self.setState({
        showModalOverlay: true,
        dialog: self.renderChangeTeamMemberPermissionsDialog(member)
      });
    };
  },

  renderRemoveTeamMemberDialog: function(member) {
    var self = this;

    var handleCancel = this.overlayClickHandler;
    var handleSubmit = function(cb) {
      self.props.onRemoveMember(self.props.user.userid, member.userid, function(err) {
        if (err) {
          return cb(err);
        }
        cb();
        self.setState({
          showModalOverlay: false,
        });
      });
    };

    return (
      <ConfirmDialog
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
              <a href="" className="PatientTeam-icon PatientTeam-icon--permission" title='Change permissions' onClick={this.handleChangeTeamMemberPermissions(member)}><i className={iconClasses}></i></a>
              <a href="" className="PatientTeam-icon PatientTeam-icon--remove" title='Remove member' onClick={this.handleRemoveTeamMember(member)}><i className="icon-remove"></i></a>
              <div className="clear"></div>
            </div>
          </div>
        </div>
      </li>
      /* jshint ignore:end */
    );

  },

  renderCancelInviteDialog: function(invite) {
    var self = this;

    var handleCancel = this.overlayClickHandler;
    var handleSubmit = function(cb) {
      self.props.onCancelInvite(invite.email, function(err) {
        if (err) {
          return cb(err);
        }
        cb();
        self.setState({
          showModalOverlay: false,
        });
      });
    };

    return (
      <ConfirmDialog
        message={'Are you sure you want to cancel your invitation to ' + invite.email + '?'}
        buttonText={'Yes'}
        dismissText={'No'}
        buttonTextWorking={'Canceling invitation...'}
        onSubmit={handleSubmit}
        onCancel={handleCancel} />
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
      /* jshint ignore:start */
      <li key={invite.key} className="PatientTeam-member--fadeNew  PatientTeam-member">
        <div className="PatientInfo-head">
          <div className="PatientTeam-picture PatientInfo-picture"></div>
          <div className="PatientTeam-blocks PatientInfo-blocks">
            <div className="PatientInfo-blockRow">
              <div className="PatientInfo-block PatientInfo-block--withArrow" title={invite.email}><div>{invite.email}</div></div>
              <div className="PatientInfo-waiting">Waiting for confirmation</div>
              <a href="" className="PatientTeam-icon PatientTeam-icon--remove" title='Dismiss invitation' onClick={this.handleCancelInvite(invite)}><i className="icon-remove"></i></a>
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

    var handleSubmit = function(email, permissions, cb) {
      self.props.onInviteMember(email, permissions, function(err) {
        if (err) {
          return cb(err);
        }
        cb();
        self.setState({
          invite: false,
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
        onCancel={handleCancel} />
      /* jshint ignore:end */
    );

  },

  renderInvite: function() {
    var isTeamEmpty = this.props.patient.team.length === 0;
    var self = this;
    var classes = {
      'PatientTeam-member': true,
      'PatientTeam-member--emptyNew': isTeamEmpty,
      'PatientTeam-member--new': !isTeamEmpty
    };

    classes = cx(classes);

    var handleClick = function(e) {
      e.preventDefault();
      self.setState({
        invite: true
      });
    };

    return (
      /* jshint ignore:start */
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

  renderEditControls: function() {
    var key = 'edit';
    var text = 'Show controls';
    if (this.state.editing) {
      key = 'cancel';
      text = 'Hide controls';
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

    var editControls = this.renderEditControls();
    var members = _.map(this.props.patient.team, this.renderTeamMember);
    var pendingInvites = _.map(this.props.pendingInvites, this.renderPendingInvite);
    var invite = this.state && this.state.invite ? this.renderInviteForm() : this.renderInvite();

    var emptyList = !(members || pendingInvites);
    var listClass = cx({
      'PatientTeam-list': true,
      'PatientTeam-list--single': emptyList,
    });

    return (
      <div className={classes}>
        {editControls}
        <ul className={listClass}>
          {members}
          {pendingInvites}
          {invite}
          <div className="clear"></div>
        </ul>
        {this.renderModalOverlay()}
      </div>
    );
  }
});

module.exports = PatientTeam;
