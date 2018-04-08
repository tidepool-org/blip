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
import { translate, Trans} from 'react-i18next';
import { bindActionCreators } from 'redux';
import { browserHistory } from 'react-router';
import sundial from 'sundial';

import * as actions from '../../redux/actions';

import _ from 'lodash';
import config from '../../config';
import { validateForm } from '../../core/validation';
import { URL_TERMS_OF_USE, URL_PRIVACY_POLICY } from '../../core/constants';

import utils from '../../core/utils';
import LoginNav from '../../components/loginnav';
import LoginLogo from '../../components/loginlogo';
import SimpleForm from '../../components/simpleform';

import check from './images/check.svg';

export let Signup = translate()(React.createClass({
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
    working: React.PropTypes.bool.isRequired,
    location: React.PropTypes.object.isRequired,
  },

  formInputs: function() {
    const { t } = this.props;
    let inputs = [
      {
        name: 'username',
        label: t('Email'),
        type: 'email',
        placeholder: '',
        disabled: !!this.props.inviteEmail,
      },
      {
        name: 'password',
        label: t('Password'),
        type: 'password',
      },
      {
        name: 'passwordConfirm',
        label: t('Confirm password'),
        type: 'password',
      },
    ];

    if (this.state.selected === 'personal') {
      inputs.unshift({
        name: 'fullName',
        label: t('Full name'),
        type: 'text',
      });
    }

    if (this.state.selected === 'clinician') {
      inputs.push({
        name: 'termsAccepted',
        label: this.renderAcceptTermsLabel(),
        type: 'checkbox',
      });
    }

    return inputs;
  },

  componentWillMount: function() {
    this.setState({loading: false});
  },

  componentWillReceiveProps: function(nextProps) {
    if (!utils.isOnSamePage(this.props, nextProps)) {
      const state = this.getFormStateFromPath(nextProps.location.pathname)
      this.setState(state);
    }
  },

  getInitialState: function() {
    var formValues = {};

    if (this.props.inviteEmail) {
      formValues.username = this.props.inviteEmail;
    }

    return _.assign({
      loading: true,
      formValues: formValues,
      validationErrors: {},
      notification: null,
      selected: null,
      madeSelection: false
    }, this.getFormStateFromPath(this.props.location.pathname));
  },

  getFormStateFromPath: function(pathname) {
    let state = {}

    switch (utils.stripTrailingSlash(pathname)) {
      case '/signup':
        state = {
          madeSelection: false,
        };
        break;

      case '/signup/personal':
        state = {
          madeSelection: true,
          selected: 'personal',
        };
        break;

      case '/signup/clinician':
        state = {
          madeSelection: true,
          selected: 'clinician',
        };
        break;
    }

    return state;
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
    const { t } = this.props;
    if (!this.props.inviteEmail) {
      return null;
    }

    return (
      <Trans className='signup-inviteIntro' i18nKey="html.signup-invited">
        <p>You've been invited to Tidepool.</p><p>Sign up to view the invitation.</p>
      </Trans>
    );
  },

  renderFormIntroduction: function() {
    const { t } = this.props;
    const type = this.state.selected;

    const heading = {
      personal: t('Create Tidepool Account'),
      clinician: t('Create Clinician Account'),
    };

    const subHeading = {
      personal: t('See all your diabetes data in one place. Finally.'),
      clinician: t('See all your patients and all their device data in one place.')
    };

    return (
      <div className="signup-formIntro">
        <div className="signup-title-condensed">{heading[type]}</div>
        <div className="signup-subtitle">{subHeading[type]}</div>
      </div>
    );
  },

  renderFormTypeSwitch: function() {
    let content, href;

    switch (this.state.selected) {
      case 'personal':
        href = '/signup/clinician';

        content = (
          <Trans parent="p" i18nKey="html.signup-clinician">
            If you are a Healthcare Provider and want to create an account, please <a href={href} className="type-switch" onClick={this.handleTypeSwitchClick.bind(this, 'clinician')}>click here</a>.
          </Trans>
        );
        break;

        case 'clinician':
        href = '/signup/personal';

        content = (
          <Trans parent="p" i18nKey="html.signup-personal">
            If you are a provider who lives with diabetes and wants to track and manage your personal diabetes data,
            please create a separate <a href={href} className="type-switch" onClick={this.handleTypeSwitchClick.bind(this, 'personal')}>personal account</a>.
          </Trans>
        );
        break;
    }

    return (
      <div className="signup-formTypeSwitch">
        {content}
      </div>
    );
  },

  renderForm: function() {
    const { t } = this.props;
    let submitButtonText;
    let submitButtonWorkingText;
    let submitButtonDisabled = false;

    // Disable the submit button if any inputs are empty
    _.forEach(this.formInputs(), input => {
      if (!this.state.formValues[input.name]) {
        submitButtonDisabled = true;
      }
    })

    switch (this.state.selected) {
      case 'personal':
        submitButtonText = t('Create Personal Account');
        submitButtonWorkingText = t('Creating Personal Account...');
        break;

      case 'clinician':
        submitButtonText = t('Create Clinician Account');
        submitButtonWorkingText = t('Creating Clinician Account...');
        break;
    }

    if (this.props.working) {
      submitButtonText = submitButtonWorkingText;
    }

    if(!this.state.madeSelection){
      return null;
    }

    return (
      <div className="container-small-outer signup-form">
        {this.renderFormIntroduction()}

        <div className="container-small-inner signup-form-box">
          <SimpleForm
            inputs={this.formInputs()}
            formValues={this.state.formValues}
            validationErrors={this.state.validationErrors}
            submitButtonText={submitButtonText}
            submitDisabled={this.props.working || submitButtonDisabled}
            onSubmit={this.handleSubmit}
            onChange={this.handleChange}
            notification={this.state.notification || this.props.notification}/>

          {this.renderFormTypeSwitch()}
        </div>
      </div>
    );
  },

  renderTypeSelection: function() {
    const { t } = this.props;
    if(this.state.madeSelection){
      return null;
    }
    let personalClass = 'signup-selection' + (this.state.selected === 'personal' ? ' selected' : '');
    let clinicanClass = 'signup-selection' + (this.state.selected === 'clinician' ? ' selected' : '');
    return (
      <div className="signup-container container-small-outer">
        <div className="signup-title">{t('Sign Up for Tidepool')}</div>
        <div className="signup-subtitle">{t('Which kind of account do you need?')}</div>
        <div className={personalClass} onClick={_.partial(this.handleSelectionClick, 'personal')}>
          <div className="signup-selectionHeader">
            <div className="signup-selectionTitle">{t('Personal Account')}</div>
            <div className="signup-selectionCheck">
              <img src={check} />
            </div>
          </div>
          <div className="signup-selectionDescription">{t('You want to manage your diabetes data. You are caring for or supporting someone with diabetes.')}
          </div>
        </div>
        <div className={clinicanClass} onClick={_.partial(this.handleSelectionClick, 'clinician')}>
          <div className="signup-selectionHeader">
            <div className="signup-selectionTitle">{t('Clinician Account')}</div>
            <div className="signup-selectionCheck">
              <img src={check} />
            </div>
          </div>
          <div className="signup-selectionDescription">{t('You are a doctor, a clinic or other healthcare provider that wants to use Tidepool to help people in your care.')}
          </div>
        </div>
        <div className="signup-continue">
          <button className="btn btn-primary" disabled={!this.state.selected} onClick={this.handleContinueClick}>{t('Continue')}</button>
        </div>
      </div>
    );
  },

  renderAcceptTermsLabel: function() {
    return (
      <Trans parent="span" i18nKey="html.signup-terms-of-use">
        I accept the terms of the Tidepool Applications <a href={URL_TERMS_OF_USE} target='_blank'>Terms of Use</a> and <a href={URL_PRIVACY_POLICY} target='_blank'>Privacy Policy</a>
      </Trans>
    );
  },

  handleContinueClick: function(e) {
    this.setState({madeSelection: true});
    browserHistory.push(`/signup/${this.state.selected}`);
  },

  handleTypeSwitchClick: function(type, e) {
    e.preventDefault();
    this.setState({selected: type});
    browserHistory.push(`/signup/${type}`);
  },

  handleChange: function(attributes) {
    let formValues = _.merge({}, this.state.formValues, {
      [attributes.name]: attributes.value,
    });

    this.setState({formValues});
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
    const { t } = this.props;
    var form = [
      { type: 'email', name: 'username', label: t('email address'), value: formValues.username },
      { type: 'password', name: 'password', label: t('password'), value: formValues.password },
      { type: 'confirmPassword', name: 'passwordConfirm', label: t('confirm password'), value: formValues.passwordConfirm, prerequisites: { password: formValues.password } },
    ];

    var validationErrors = validateForm(form);

    if (!_.isEmpty(validationErrors)) {
      this.setState({
        validationErrors: validationErrors,
        notification: {
          type: 'error',
          message: t('Some entries are invalid.')
        }
      });
    }

    return validationErrors;
  },

  prepareFormValuesForSubmit: function(formValues) {
    let roles = this.props.roles ? this.props.roles : [];

    let values = {
      username: formValues.username,
      emails: [formValues.username],
      password: formValues.password,
      roles: roles,
    };

    if(this.state.selected === 'personal') {
      values.profile = {
        fullName: formValues.fullName,
      };
    }

    if(this.state.selected === 'clinician') {
      if (formValues.termsAccepted) {
        values.termsAccepted = sundial.utcDateString();
      }

      if (_.indexOf(roles, 'clinic') === -1) {
        values.roles.push('clinic');
      }
    }

    return values;
  }
}));

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
