
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
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import * as actions from '../../redux/actions';

import {translate} from 'react-i18next';
import _ from 'lodash';
import { validateForm } from '../../core/validation';

import config from '../../config';

import SimpleForm from '../../components/simpleform';
import ToastContext from '../../providers/ToastProvider';

// A different namespace than the default can be specified in translate()
export var UserProfileClass = class extends React.Component {
  static propTypes = {
    fetchingUser: PropTypes.bool.isRequired,
    history: PropTypes.object.isRequired,
    onSubmit: PropTypes.func.isRequired,
    trackMetric: PropTypes.func.isRequired,
    login: PropTypes.func.isRequired,
    user: PropTypes.object
  };
  static contextType = ToastContext;

  formInputs = () => {
    const { t, user } = this.props;
    const userRoles = _.get(user, 'roles', []);
    const isBrokeredAccount =
      _.intersection(userRoles, ['brokered']).length > 0;
    const inputs = [
      { name: 'fullName', label: t('Full name'), type: 'text' },
      {
        name: 'username',
        label: t('Email'),
        type: 'email',
        disabled: isBrokeredAccount,
      },
      {
        name: 'password',
        label: t('Password'),
        type: 'password',
        disabled: isBrokeredAccount,
      },
      {
        name: 'passwordConfirm',
        label: t('Confirm password'),
        type: 'password',
        disabled: isBrokeredAccount,
      },
    ];

    if (config.I18N_ENABLED) {
      inputs.push({
        name: 'lang',
        label: t('Language'),
        type: 'select',
        items: [
          {value: 'en', label: 'English'},
          {value: 'fr', label: 'Français'},
        ],
        placeholder: t('Select language...')
      });
    }

    return inputs;
  };

  MESSAGE_TIMEOUT = 2000;

  formValuesFromUser = (user) => {
    if (!user) {
      return {};
    }

    return {
      fullName: user.profile && user.profile.fullName,
      username: user.username,
      lang: _.get(user, 'preferences.displayLanguageCode', undefined)
    };
  };

  componentDidMount() {
    const { user: { profile: { fullName } }, t } = this.props;
    if (_.isEmpty(fullName)) {
      this.context.set({
        message: t('Please enter your full name.'),
        autoHideDuration: null,
      });
      this.setState({
        validationErrors: {
          fullName: t('Full name is required.')
        }
      });
    }
    if (this.props.trackMetric) {
      this.props.trackMetric('Viewed Account Edit');
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    // Keep form values in sync with upstream changes
    this.setState({formValues: this.formValuesFromUser(nextProps.user)});
    if(_.isEmpty(this.props.user.profile.fullName) && !_.isEmpty(nextProps.user.profile.fullName)){
      this.context.clear();
      this.props.login();
    }
  }

  componentWillUnmount() {
    clearTimeout(this.messageTimeoutId);
  }

  render() {
    const {t} = this.props;
    var form = this.renderForm();
    var self = this;
    var handleClickBack = function(e) {
      e.preventDefault();
      self.props.trackMetric('Clicked Back in Account');
      self.props.history.goBack();
      return false;
    };

    return (
      <div className="profile">
        <div className="container-box-outer profile-subnav">
          <div className="container-box-inner profile-subnav-box">
            <div className="grid">
              <div className="grid-item one-whole medium-one-third">
                <a className="js-back" href="" onClick={handleClickBack}>
                  <i className="icon-back"></i>
                  {' ' + t('Back')}
                </a>
              </div>
              <div className="grid-item one-whole medium-one-third">
                <div className="profile-subnav-title">{t('Account')}</div>
              </div>
            </div>
          </div>
        </div>
        <div className="container-box-outer profile-content">
          <div className="container-box-inner profile-content-box">
            <div className="profile-form">{form}</div>
          </div>
        </div>
      </div>
    );

  }

  renderForm = () => {
    const {t} = this.props;
    var disabled = this.isResettingUserData();

    return (
      <SimpleForm
        inputs={this.formInputs()}
        formValues={this.state.formValues}
        validationErrors={this.state.validationErrors}
        submitButtonText={t('Save')}
        onSubmit={this.handleSubmit}
        notification={this.state.notification}
        disabled={disabled}/>
    );

  };

  isResettingUserData = () => {
    return (this.props.fetchingUser && !this.props.user);
  };

  handleSubmit = (formValues) => {

    this.resetFormStateBeforeSubmit(formValues);

    var validationErrors = this.validateFormValues(formValues);
    if (!_.isEmpty(validationErrors)) {
      return;
    }

    formValues = this.prepareFormValuesForSubmit(formValues);
    this.submitFormValues(formValues);
  };

  resetFormStateBeforeSubmit = (formValues) => {
    this.setState({
      formValues: formValues,
      validationErrors: {},
      notification: null
    });
    clearTimeout(this.messageTimeoutId);
  };

  validateFormValues = (formValues) => {
    var form = [
      { type: 'name', name: 'fullName', label: 'full name', value: formValues.fullName },
      { type: 'email', name: 'username', label: 'email', value: formValues.username }
    ];

    if (formValues.password || formValues.passwordConfirm) {
      form = _.merge(form, [
        { type: 'password', name: 'password', label: 'password', value: formValues.password },
        { type: 'confirmPassword', name: 'passwordConfirm', label: 'confirm password', value: formValues.passwordConfirm, prerequisites: { password: formValues.password }  }
      ]);
    }

    var validationErrors = validateForm(form);

    if (!_.isEmpty(validationErrors)) {
      this.setState({
        validationErrors: validationErrors
      });
    }

    return validationErrors;
  };

  prepareFormValuesForSubmit = (formValues) => {
    var result = {
      username: formValues.username,
      emails: [formValues.username],
      profile: {
        fullName: formValues.fullName
      },
    };

    if (config.I18N_ENABLED) {
      _.set(result, 'preferences.displayLanguageCode', formValues.lang);
    }

    if (formValues.password) {
      result.password = formValues.password;
    }

    return result;
  };

  submitFormValues = (formValues) => {
    const {t} = this.props;
    var self = this;
    var submit = this.props.onSubmit;

    // Save optimistically
    submit(formValues);
    this.setState({
      notification: {type: 'success', message: t('All changes saved.')}
    });

    this.messageTimeoutId = setTimeout(function() {
      self.setState({notification: null});
    }, this.MESSAGE_TIMEOUT);
  };

  state = {
    formValues: this.formValuesFromUser(this.props.user),
    validationErrors: {},
    notification: null
  };
};

// We need to apply the contextType prop to use the Toast provider with create-react-class.
// This produces an issue with the current enzyme mounting and breaks unit tests.
// Solution is to wrap the create-react-class component with a small HOC that gets the i18n context.
export const UserProfile = translate()(props => <UserProfileClass {...props}/>);

/**
 * Expose "Smart" Component that is connect-ed to Redux
 */
export function mapStateToProps(state) {
  let user = null;
  let { allUsersMap, loggedInUserId } = state.blip;

  if (allUsersMap) {
    if (loggedInUserId) {
      user = allUsersMap[loggedInUserId];
    }
  }

  return {
    user: user,
    fetchingUser: state.blip.working.fetchingUser.inProgress
  };
}

let mapDispatchToProps = dispatch => bindActionCreators({
  updateUser: actions.async.updateUser,
  login: actions.async.login,
}, dispatch);

let mergeProps = (stateProps, dispatchProps, ownProps) => {
  var api = ownProps.api;
  return Object.assign({}, _.pick(ownProps, ['history', 'trackMetric']), stateProps, {
    onSubmit: dispatchProps.updateUser.bind(null, api),
    login: dispatchProps.login.bind(null, api),
  });
};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(UserProfile);
