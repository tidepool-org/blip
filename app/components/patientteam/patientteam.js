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

var PatientTeam = React.createClass({
  propTypes: {
    user: React.PropTypes.object,
    fetchingUser: React.PropTypes.bool,
    pendingInvites: React.PropTypes.array,
    fetchingPendingInvites: React.PropTypes.bool,
    onChangeMemberPermissions: React.PropTypes.func,
    changingMemberPermissions: React.PropTypes.bool,
    onRemoveMember: React.PropTypes.func,
    removingMember: React.PropTypes.bool,
    onInviteMember: React.PropTypes.func,
    invitingMember: React.PropTypes.bool,
    onCancelInvite: React.PropTypes.func,
    cancelingInvite: React.PropTypes.bool
  },

  render: function() {
    /* jshint ignore:start */
    return (
      <ul>
        <li className="PatientTeam-member PatientTeam-member--emptyNew  PatientTeam-member--first">
          <div className="PatientInfo-head">
            <div className="PatientTeam-picture PatientInfo-picture"></div>
            <div className="PatientTeam-blocks PatientInfo-blocks">
              <div className="PatientInfo-blockRow">
                <div className="PatientInfo-block PatientInfo-block--withArrow">Invite new member</div>
                <div className="clear"></div>
              </div>
            </div>
          </div>
        </li>
        <li className="PatientTeam-member">
          <div className="PatientInfo-head">
            <div className="PatientTeam-picture PatientInfo-picture"></div>
            <div className="PatientTeam-blocks PatientInfo-blocks">
              <div className="PatientInfo-blockRow">
                <div className="PatientInfo-block PatientInfo-block--withArrow">Peter Jensen</div>
                <div className="PatientTeam-icon PatientTeam-icon--permission" title='upload'><i className="icon-permissions icon-permissions-upload"></i></div>
                <div className="PatientTeam-icon" title='remove'><i className="icon-remove"></i></div>
                <div className="clear"></div>
              </div>
            </div>
          </div>
        </li>
        <li className="PatientTeam-member PatientTeam-member--fadeNew  PatientTeam-member--first">
          <div className="PatientInfo-head">
            <div className="PatientTeam-picture PatientInfo-picture"></div>
            <div className="PatientTeam-blocks PatientInfo-blocks">
              <div className="PatientInfo-blockRow">
                <div className="PatientInfo-block PatientInfo-block--withArrow">Invite new member</div>
                <div className="clear"></div>
              </div>
            </div>
          </div>
        </li>
        <li className="PatientTeam-member--fadeNew  PatientTeam-member">
          <div className="PatientInfo-head">
            <div className="PatientTeam-picture PatientInfo-picture"></div>
            <div className="PatientTeam-blocks PatientInfo-blocks">
              <div className="PatientInfo-blockRow">
                <div className="PatientInfo-block PatientInfo-block--withArrow">Invite new member</div>
                <div className="PatientInfo-waiting">test@mail.com</div>
                <div className="PatientTeam-icon" title='remove'><i className="icon-remove"></i></div>
                <div className="clear"></div>
              </div>
            </div>
          </div>
        </li>
        <li className="PatientTeam-member--fadeNew  PatientTeam-member PatientTeam-member--first">
          <div className="PatientInfo-head">
            <div className="PatientTeam-pending">
              <i className="icon-pending-invite"></i>
            </div>
            <div className="PatientTeam-blocks PatientInfo-blocks">
              <div className="">
                <input className="PatientInfo-input" id="fullName" ref="fullName" placeholder="email" />
                <div className="PatientTeam-permissionSelection">
                  <div>
                    <input type="radio" name="sex" value="view" checked="checked"/>View Only<i className="icon-permissions-view"></i>
                  </div>
                  <div>
                    <input type="radio" name="sex" value="upload"/>View and upload<i className="icon-permissions-upload"></i>
                  </div>
                </div>
                <div className="PatientTeam-buttonHolder">
                  <button className="PatientInfo-button PatientInfo-button--secondary" type="button">Cancel</button>
                  <button className="PatientInfo-button PatientInfo-button--primary" type="submit">Invite</button>
                </div>
                <div className="clear"></div>
              </div>
            </div>
          </div>
        </li>

        <div className="clear"></div>
      </ul>
    );
    /* jshint ignore:end */
  }
});

module.exports = PatientTeam;
