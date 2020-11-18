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


import _ from 'lodash';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import { bindActionCreators } from 'redux';

import * as actions from '../../redux/actions';
import ErrorMessages from '../../redux/constants/errorMessages';

import utils from '../../core/utils';
import LoginNav from '../../components/loginnav';
import LoginLogo from '../../components/loginlogo';
import SimpleForm from '../../components/simpleform';
import { validateForm } from '../../core/validation';

export let VerificationWithPassword = translate()(class VerificationWithPassword extends React.Component {
  static propTypes = {
    acknowledgeNotification: PropTypes.func.isRequired,
    api: PropTypes.object.isRequired,
    notification: PropTypes.object,
    signupEmail: PropTypes.string.isRequired,
    signupKey: PropTypes.string.isRequired,
    onSubmit: PropTypes.func.isRequired,
    trackMetric: PropTypes.func.isRequired,
    working: PropTypes.bool.isRequired,
    t: PropTypes.func.isRequired,
  };

  constructor(props) {
    super(props);
    var formValues = {};

    this.state = {
      loading: true,
      formValues,
      validationErrors: {},
      notification: null
    };
  }

  formInputs = () => {
    const { t } = this.props;
    const formText = 'Welcome!';
    return [
      { name: 'explanation', type: 'explanation', text: formText },
      { name: 'birthday', label: t('Birthday'), type: 'datepicker' },
      { name: 'password', label: t('Create Password'), type: 'password', placeholder: '' },
      { name: 'passwordConfirm', label: t('Confirm password'), type: 'password', placeholder: '' }
    ];
  };

  UNSAFE_componentWillMount() {
    this.setState({ loading: false });
  }

  componentDidMount() {
    if (this.props.trackMetric) {
      this.props.trackMetric('VCA Home Verification - Screen Displayed');
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    if (_.get(this.props, 'notification.message', null) === null &&
      _.get(nextProps, 'notification.message') === ErrorMessages.ERR_BIRTHDAY_MISMATCH) {
      this.props.trackMetric('VCA Home Verification - Birthday Mismatch');
    }
  }

  isFormDisabled = () => {
    return (this.props.fetchingUser && !this.props.user);
  };

  getSubmitButtonText = () => {
    const { t } = this.props;
    if (this.props.working) {
      return t('Setting up...');
    }
    return t('Ready!');
  };

  render() {
    return (
      <div className="VerificationWithPassword">
        <LoginNav
          page="VerificationWithPassword"
          trackMetric={this.props.trackMetric}
          hideLinks={true} />
        <LoginLogo />
        <div className="container-small-outer VerificationWithPassword-form">
          <div className="container-small-inner VerificationWithPassword-form-box">
            <SimpleForm
              inputs={this.formInputs()}
              formValues={this.state.formValues}
              validationErrors={this.state.validationErrors}
              submitButtonText={this.getSubmitButtonText()}
              submitDisabled={this.props.working}
              onSubmit={this.handleSubmit}
              notification={this.state.notification || this.props.notification} />
          </div>
        </div>
      </div>
    );
  }

  handleSubmit = (formValues) => {
    if (this.props.working) {
      return;
    }

    this.resetFormStateBeforeSubmit(formValues);

    var validationErrors = this.validateFormValues(formValues);

    if (!_.isEmpty(validationErrors)) {
      return;
    }

    formValues = this.prepareFormValuesForSubmit(formValues);
    this.props.onSubmit(this.props.api, this.props.signupKey, this.props.signupEmail, formValues.birthday, formValues.password);
  };

  resetFormStateBeforeSubmit = (formValues) => {
    this.setState({
      formValues: formValues,
      validationErrors: {},
      notification: null
    });
  };

  validateFormValues = (formValues) => {
    const { t } = this.props;
    var form = [
      { type: 'date', name: 'birthday', label: t('birthday'), value: formValues.birthday },
      { type: 'password', name: 'password', label: t('password'), value: formValues.password },
      { type: 'confirmPassword', name: 'passwordConfirm', label: t('confirm password'), value: formValues.passwordConfirm, prerequisites: { password: formValues.password } }
    ];
    var validationErrors = validateForm(form, true);

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
  };

  handleInputChange = (attributes) => {
    var key = attributes.name;
    var value = attributes.value;
    if (!key) {
      return;
    }

    var formValues = _.clone(this.state.formValues);
    formValues[key] = value;
    this.setState({ formValues: formValues });
  };

  makeRawDateString = (dateObj) => {

    var mm = '' + (parseInt(dateObj.month) + 1); //as a string, add 1 because 0-indexed
    mm = (mm.length === 1) ? '0' + mm : mm;
    var dd = (dateObj.day.length === 1) ? '0' + dateObj.day : dateObj.day;

    return dateObj.year + '-' + mm + '-' + dd;
  };

  prepareFormValuesForSubmit = (formValues) => {
    return {
      birthday: this.makeRawDateString(formValues.birthday),
      password: formValues.password
    };
  };
});

/**
 * Expose "Smart" Component that is connect-ed to Redux
 */

export function mapStateToProps(state) {
  return {
    notification: state.blip.working.verifyingCustodial.notification,
    working: state.blip.working.verifyingCustodial.inProgress
  };
}

let mapDispatchToProps = dispatch => bindActionCreators({
  onSubmit: actions.async.verifyCustodial,
  acknowledgeNotification: actions.sync.acknowledgeNotification
}, dispatch);

let mergeProps = (stateProps, dispatchProps, ownProps) => {
  return Object.assign({}, stateProps, dispatchProps, {
    signupEmail: utils.getSignupEmail(ownProps.location),
    signupKey: utils.getSignupKey(ownProps.location),
    trackMetric: ownProps.routes[0].trackMetric,
    api: ownProps.routes[0].api,
  });
};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(VerificationWithPassword);
