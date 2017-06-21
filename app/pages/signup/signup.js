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
import { bindActionCreators } from 'redux';
import { browserHistory } from 'react-router'

import * as actions from '../../redux/actions';

import _ from 'lodash';
import config from '../../config';
import { validateForm } from '../../core/validation';

import utils from '../../core/utils';
import LoginNav from '../../components/loginnav';
import LoginLogo from '../../components/loginlogo';
import SimpleForm from '../../components/simpleform';

import check from './images/check.svg';

export let Signup = React.createClass({
  propTypes: {
    acknowledgeNotification: React.PropTypes.func.isRequired,
    api: React.PropTypes.object.isRequired,
    configuredInviteKey: React.PropTypes.string.isRequired,
    inviteEmail: React.PropTypes.string,
    inviteKey: React.PropTypes.string,
    roles: React.PropTypes.array,
    notification: React.PropTypes.object,
    onSubmit: React.PropTypes.func.isRequired,
    trackMetric: React.PropTypes.func.isRequired,
    working: React.PropTypes.bool.isRequired
  },

  formInputs: function() {
    return [
      {
        name: 'fullName',
        label: 'Full name',
        type: 'text'
      },
      {
        name: 'username',
        label: 'Email',
        type: 'email',
        placeholder: '',
        disabled: !!this.props.inviteEmail
      },
      {
        name: 'password',
        label: 'Password',
        type: 'password'
      },
      {
        name: 'passwordConfirm',
        label: 'Confirm password',
        type: 'password'
      }
    ];
  },

  componentWillMount: function() {
    this.setState({loading: false});
  },

  componentWillReceiveProps: function(nextProps){
    if(nextProps.location.pathname === '/signup'){
      this.setState({madeSelection:false});
    }
  },

  getInitialState: function() {
    var formValues = {};

    if (this.props.inviteEmail) {
      formValues.username = this.props.inviteEmail;
    }

    return {
      loading: true,
      formValues: formValues,
      validationErrors: {},
      notification: null,
      selected: null,
      madeSelection: false
    };
  },

  handleSelectionClick: function(option){
    this.setState({selected: option})
  },

  render: function() {
    let form = this.renderForm();
    let inviteIntro = this.renderInviteIntroduction();
    let typeSelection = this.renderTypeSelection();
    if (!this.state.loading) {
      return (
        <div className="signup">
          <LoginNav
            page="signup"
            hideLinks={Boolean(this.props.inviteEmail)}
            trackMetric={this.props.trackMetric} />
          <LoginLogo />
          {inviteIntro}
          {typeSelection}
          {form}
        </div>
      );
    }
  },

  renderInviteIntroduction: function() {
    if (!this.props.inviteEmail) {
      return null;
    }

    return (
      <div className='signup-inviteIntro'>
        <p>{'You\'ve been invited to Blip.'}</p><p>{'Sign up to view the invitation.'}</p>
      </div>
    );
  },

  renderForm: function() {
    var submitButtonText = 'Sign up';
    if (this.props.working) {
      submitButtonText = 'Signing up...';
    }
    if(!this.state.madeSelection){
      return null;
    }

    return (
      <div className="container-small-outer signup-form">
        <div className="container-small-inner signup-form-box">
          <SimpleForm
            inputs={this.formInputs()}
            formValues={this.state.formValues}
            validationErrors={this.state.validationErrors}
            submitButtonText={submitButtonText}
            submitDisabled={this.props.working}
            onSubmit={this.handleSubmit}
            notification={this.state.notification || this.props.notification}/>
        </div>
      </div>
    );

  },

  renderTypeSelection: function() {
    if(this.state.madeSelection){
      return null;
    }
    let personalClass = 'signup-selection' + (this.state.selected === 'personal' ? ' selected' : '');
    let clinicanClass = 'signup-selection' + (this.state.selected === 'clinician' ? ' selected' : '');
    return (
      <div className="signup-container container-small-outer">
        <div className="signup-title">Sign Up for Tidepool</div>
        <div className="signup-subtitle">Which kind of account do you need?</div>
        <div className={personalClass} onClick={_.partial(this.handleSelectionClick, 'personal')}>
          <div className="signup-selectionHeader">
            <div className="signup-selectionTitle">Personal Account</div>
            <div className="signup-selectionCheck">
              <img src={check} />
            </div>
          </div>
          <div className="signup-selectionDescription">You want to manage
            your diabetes data. You are caring for or supporting someone
            with diabetes.
          </div>
        </div>
        <div className={clinicanClass} onClick={_.partial(this.handleSelectionClick, 'clinician')}>
          <div className="signup-selectionHeader">
            <div className="signup-selectionTitle">Clinician Account</div>
            <div className="signup-selectionCheck">
              <img src={check} />
            </div>
          </div>
          <div className="signup-selectionDescription">You are a doctor, a
            clinic or other healthcare provider that wants to use Tidepool to
            help people in your care.
          </div>
        </div>
        <div className="signup-continue">
          <button className="btn btn-primary" disabled={!this.state.selected} onClick={this.handleContinueClick}>Continue</button>
        </div>
      </div>
    );
  },

  handleContinueClick: function(e){
    this.setState({madeSelection:true});
    browserHistory.push(`/signup/${this.state.selected}`);
  },

  handleSubmit: function(formValues) {
    var self = this;

    if (this.props.working) {
      return;
    }

    this.resetFormStateBeforeSubmit(formValues);

    formValues = _.clone(formValues);

    var validationErrors = this.validateFormValues(formValues);
    if (!_.isEmpty(validationErrors)) {
      return;
    }

    formValues = this.prepareFormValuesForSubmit(formValues);

    this.props.onSubmit(this.props.api, formValues);
  },

  resetFormStateBeforeSubmit: function(formValues) {
    this.props.acknowledgeNotification('signingUp');
    this.setState({
      formValues: formValues,
      validationErrors: {},
      notification: null
    });
  },

  validateFormValues: function(formValues) {
    var form = [
      { type: 'name', name: 'fullName', label: 'full name', value: formValues.fullName },
      { type: 'email', name: 'username', label: 'email address', value: formValues.username },
      { type: 'password', name: 'password', label: 'password', value: formValues.password },
      { type: 'confirmPassword', name: 'passwordConfirm', label: 'confirm password', value: formValues.passwordConfirm, prerequisites: { password: formValues.password }  }
    ];

    var validationErrors = validateForm(form);

    if (!_.isEmpty(validationErrors)) {
      this.setState({
        validationErrors: validationErrors,
        notification: {
          type: 'error',
          message:'Some entries are invalid.'
        }
      });
    }

    return validationErrors;
  },

  prepareFormValuesForSubmit: function(formValues) {
    let roles = this.props.roles ? this.props.roles : [];
    if(this.state.selected === 'clinician' && _.indexOf(roles, 'clinic') === -1){
      roles.push('clinic');
    }
    return {
      username: formValues.username,
      emails: [formValues.username],
      password: formValues.password,
      roles: roles,
      profile: {
        fullName: formValues.fullName
      }
    };
  }
});
/**
 * Expose "Smart" Component that is connect-ed to Redux
 */

export function mapStateToProps(state) {
  return {
    notification: state.blip.working.signingUp.notification,
    working: state.blip.working.signingUp.inProgress,
  };
}

let mapDispatchToProps = dispatch => bindActionCreators({
  onSubmit: actions.async.signup,
  acknowledgeNotification: actions.sync.acknowledgeNotification
}, dispatch);

let mergeProps = (stateProps, dispatchProps, ownProps) => {
  return Object.assign({}, stateProps, dispatchProps, {
    configuredInviteKey: config.INVITE_KEY,
    inviteKey: utils.getInviteKey(ownProps.location),
    inviteEmail: utils.getInviteEmail(ownProps.location),
    roles: utils.getRoles(ownProps.location),
    trackMetric: ownProps.routes[0].trackMetric,
    api: ownProps.routes[0].api,
    location: ownProps.location
  });
};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(Signup);
