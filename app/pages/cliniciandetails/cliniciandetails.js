
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
import { bindActionCreators } from 'redux';

import i18n from '../../core/language';
import { validateForm } from '../../core/validation';
import * as actions from '../../redux/actions';
import SimpleForm from '../../components/simpleform';
import personUtils from '../../core/personutils';

const t = i18n.t.bind(i18n);

class ClinicianDetails extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      working: false,
      formValues: {
        firstName: this.getUserFirstName(),
        lastName: this.getUserLastName(),
        clinicalRole: '',
      },
      validationErrors: {},
    }
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  formInputs() {
    return [
    {
      name: 'firstName',
      label: t('First Name'),
      type: 'text',
      placeholder: t('First name')
    },
    {
      name: 'lastName',
      label: t('Last Name'),
      type: 'text',
      placeholder: t('Last name')
    },
    {
      name: 'clinicalRole',
      label: t('Clinical Role'),
      type: 'select',
      value: '',
      placeholder: t('Select Role...'),
      items: [
        {value: 'clinic_manager', label: t('Clinic Manager')},
        {value: 'diabetes_educator', label: t('Diabetes Educator')},
        {value: 'endocrinologist', label: t('Endocrinologist')},
        {value: 'front_desk', label: t('Front Desk')},
        {value: 'information_technology', label: t('IT/Technology')},
        {value: 'medical_assistant', label: t('Medical Assistant')},
        {value: 'nurse', label: t('Nurse/Nurse Practitioner')},
        {value: 'primary_care_physician', label: t('Primary Care Physician')},
        {value: 'physician_assistant', label: t('Physician Assistant')},
        {value: 'other', label: t('Other')}
      ]
    }
  ]}

  componentDidMount() {
    if (this.props.trackMetric) {
      this.props.trackMetric('Web - Clinician Details Setup');
    }
  }

  getUserFirstName() {
    return personUtils.firstName(this.props.user);
  }

  getUserLastName() {
    return personUtils.lastName(this.props.user);
  }

  canSubmit() {
    const { formValues } = this.state;
    if (
      _.get(formValues,'firstName.length') &&
      _.get(formValues,'lastName.length') &&
      _.get(formValues,'clinicalRole.length') 
    )
      {
        return true;
      } else {
        return false;
      }
  }

  render() {
    const form = this.renderForm();

    return (
      <div className="ClinicianDetails">
        <div className="container-box-outer ClinicianDetails-contentOuter">
          <div className="container-box-inner ClinicianDetails-contentInner">
            <div className="ClinicianDetails-content">
              <div className="ClinicianDetails-head">
                {t('Clinician Setup')}
              </div>
              <div className="ClinicianDetails-subTitle">
                {t('Please complete these details.')}
              </div>
              <div className="ClinicianDetails-desc">
                {t('We use these details to identify you to your patients and to better support you.')}
              </div>
              {form}
            </div>
          </div>
        </div>
      </div>
    );
  }

  renderForm() {
    return (
      <SimpleForm
        inputs={this.formInputs()}
        formValues={this.state.formValues}
        validationErrors={this.state.validationErrors}
        submitButtonText={this.getSubmitButtonText()}
        submitDisabled={this.props.working || !this.canSubmit()}
        onSubmit={this.handleSubmit}
        onChange={this.handleInputChange}
      />
    );
  }

  getSubmitButtonText() {
    if (this.props.working) {
      return t('Saving...');
    }
    return t('Continue');
  }

  isFormDisabled() {
    return (this.props.fetchingUser && !this.props.user);
  }

  handleInputChange(attributes) {
    const key = attributes.name;
    if (!key) {
      return;
    }
    const formValues = _.clone(this.state.formValues);

    formValues[key] = attributes.value;

    this.setState({ formValues });
  }

  handleSubmit(formValues) {
    this.resetFormStateBeforeSubmit(formValues);

    const validationErrors = this.validateFormValues(formValues);

    if (!_.isEmpty(validationErrors)) {
      return;
    }
    const fullName = `${formValues.firstName} ${formValues.lastName}`;
    const user = {
      firstName: formValues.firstName,
      lastName: formValues.lastName,
      fullName,
      profile: {
        fullName,
        firstName: formValues.firstName,
        lastName: formValues.lastName,
        clinic: {
          role: formValues.clinicalRole
        }
      }
    };
    this.props.onSubmit(user);
  }

  validateFormValues(formValues) {
    const form = [
      { type: 'name', name: 'firstName', label: 'first name', value: formValues.firstName },
      { type: 'name', name: 'lastName', label: 'last name', value: formValues.lastName },
      { type: 'clinicalRole', name: 'clinicalRole', label: 'clinical role', value: formValues.clinicalRole }
    ];
    const validationErrors = validateForm(form, false);

    if (!_.isEmpty(validationErrors)) {
      this.setState({ validationErrors });
    }

    return validationErrors;
  }

  resetFormStateBeforeSubmit(formValues) {
    this.setState({
      working: true,
      formValues,
      validationErrors: {}
    });
  }
}

ClinicianDetails.propTypes = {
  fetchingUser: PropTypes.bool.isRequired,
  onSubmit: PropTypes.func.isRequired,
  trackMetric: PropTypes.func.isRequired,
  user: PropTypes.object,
  working: PropTypes.bool.isRequired
};

/**
 * Expose "Smart" Component that is connect-ed to Redux
 */

export function mapStateToProps(state) {
  let user = null;
  if (state.blip.allUsersMap){
    if (state.blip.loggedInUserId) {
      user = state.blip.allUsersMap[state.blip.loggedInUserId];
    }
  }

  return {
    user: user,
    fetchingUser: state.blip.working.fetchingUser.inProgress,
    working: state.blip.working.updatingUser.inProgress,
  };
}

const mapDispatchToProps = dispatch => bindActionCreators({
  updateClinicianProfile: actions.async.updateClinicianProfile
}, dispatch);

const mergeProps = (stateProps, dispatchProps, ownProps) => {
  const api = ownProps.routes[0].api;
  return Object.assign({}, stateProps, {
    onSubmit: dispatchProps.updateClinicianProfile.bind(null, api),
    trackMetric: ownProps.routes[0].trackMetric
  });
};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(ClinicianDetails);
