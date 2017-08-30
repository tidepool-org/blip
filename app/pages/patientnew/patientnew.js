
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
import { Link } from 'react-router';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';

import _ from 'lodash';
import sundial from 'sundial';
import { validateForm } from '../../core/validation';

import * as actions from '../../redux/actions';

import InputGroup from '../../components/inputgroup';
import DatePicker from '../../components/datepicker';
import SimpleForm from '../../components/simpleform';
import personUtils from '../../core/personutils';
import { getDonationAccountCodeFromEmail } from '../../core/utils';

import {
  DATA_DONATION_NONPROFITS,
  URL_BIG_DATA_DONATION_INFO,
  TIDEPOOL_DATA_DONATION_ACCOUNT_EMAIL,
} from '../../core/constants';

var MODEL_DATE_FORMAT = 'YYYY-MM-DD';

export let PatientNew = React.createClass({
  propTypes: {
    fetchingUser: React.PropTypes.bool.isRequired,
    onUpdateDataDonationAccounts: React.PropTypes.func.isRequired,
    onSubmit: React.PropTypes.func.isRequired,
    trackMetric: React.PropTypes.func.isRequired,
    user: React.PropTypes.object,
    working: React.PropTypes.bool.isRequired
  },

  getFormInputs: function() {
    return [
      {
        name: 'isOtherPerson',
        type: 'radios',
        items: [
          {value: false, label: 'This is for me, I have type 1 diabetes'},
          {value: true, label: 'This is for someone I care for who has type 1 diabetes'}
        ],
      },
      {
        name: 'fullName',
        type: 'text',
        placeholder: 'Full name',
      },
      {
        name: 'about',
        type: 'textarea',
        placeholder: 'Share a bit about yourself or this person.',
      },
      {
        name: 'birthday',
        label: 'Birthday',
        type: 'datepicker',
      },
      {
        name: 'diagnosisDate',
        label: 'Diagnosis date',
        type: 'datepicker',
      },
      {
        name: 'dataDonate',
        label: 'Donate my anonymized data',
        disabled: !_.isEmpty(this.state.formValues.dataDonateDestination),
        value: this.state.formValues.dataDonate,
        type: 'checkbox',
      },
      {
        name: 'dataDonateExplainer',
        type: 'explanation',
        text: (
          <div>
            You own your data. Read all the details about Tidepool's Big Data
            Donation project <a target="_blank" href={URL_BIG_DATA_DONATION_INFO}>here</a>.
          </div>
        ),
      },
      {
        name: 'dataDonateDestination',
        type: 'select',
        multi: true,
        value: this.state.formValues.dataDonateDestination,
        placeholder: 'Choose which diabetes organization(s) to support',
        items: DATA_DONATION_NONPROFITS,
      },
      {
        name: 'donateExplainer',
        type: 'explanation',
        text: (
          <div>
            Tidepool will share 10% of the proceeds with the diabetes organization(s) of your choice.
          </div>
        ),
      }
    ];
  },

  getInitialState: function() {
    return {
      working: false,
      formValues: {
        isOtherPerson: false,
        fullName: this.getUserFullName(),
        dataDonateDestination: ''
      },
      validationErrors: {},
    };
  },

  componentDidMount: function() {
    if (this.props.trackMetric) {
      this.props.trackMetric('Viewed Profile Create');
    }
  },

  componentWillReceiveProps: function(nextProps) {
    this.setState({
      formValues: _.assign(this.state.formValues, {
        fullName: this.getUserFullName(nextProps)
      })
    });
  },

  getUserFullName: function(props) {
    props = props || this.props;
    return personUtils.fullName(props.user) || '';
  },

  render: function() {
    var subnav = this.renderSubnav();
    var form = this.renderForm();

    return (
      <div className="PatientNew">
        {subnav}
        <div className="container-box-outer PatientNew-contentOuter">
          <div className="container-box-inner PatientNew-contentInner">
            <div className="PatientNew-content">
              {form}
            </div>
          </div>
        </div>
      </div>
    );
  },

  renderSubnav: function() {
    return (
      <div className="container-box-outer">
        <div className="container-box-inner PatientNew-subnavInner">
          <div className="grid PatientNew-subnav">
            <div className="grid-item one-whole">
              <div className="PatientNew-subnavTitle">
                {'Set up data storage'}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  },

  renderForm: function() {
    return (
      <SimpleForm
        inputs={this.getFormInputs()}
        formValues={this.state.formValues}
        validationErrors={this.state.validationErrors}
        submitButtonText={this.getSubmitButtonText()}
        submitDisabled={this.props.working}
        onSubmit={this.handleSubmit}
        onChange={this.handleInputChange}
      />
    );
  },

  getSubmitButtonText: function() {
    if (this.props.working) {
      return 'Saving...';
    }
    return 'Save';
  },

  isFormDisabled: function() {
    return (this.props.fetchingUser && !this.props.user);
  },

  handleInputChange: function(attributes) {
    var key = attributes.name;
    var value = attributes.value;
    if (!key) {
      return;
    }

    var formValues = _.clone(this.state.formValues);

    if (key === 'isOtherPerson') {
      var isOtherPerson = (attributes.value === 'true') ? true : false;
      var fullName = isOtherPerson ? '' : this.getUserFullName();
      formValues = _.assign(formValues, {
        isOtherPerson: isOtherPerson,
        fullName: fullName,
      });
    }
    else if (key === 'dataDonateDestination' && !_.isEmpty(value)) {
      // Ensure that the donate checkbox is checked if there are nonprofits selected
      if (!formValues.dataDonate) {
        formValues.dataDonate = true;
      }
      formValues[key] = value;
    }
    else {
      formValues[key] = value;
    }

    this.setState({formValues: formValues});
  },

  handleSubmit: function(formValues) {
    this.resetFormStateBeforeSubmit(formValues);

    var validationErrors = this.validateFormValues(formValues);

    if (!_.isEmpty(validationErrors)) {
      return;
    }

    var origFormValues = _.clone(formValues);

    formValues = this.prepareFormValuesForSubmit(formValues);
    this.props.onSubmit(formValues);

    if(origFormValues.dataDonate) {
      const addAccounts = [ TIDEPOOL_DATA_DONATION_ACCOUNT_EMAIL ];
      const selectedAccounts = origFormValues.dataDonateDestination.split(',');

      _.forEach(selectedAccounts, accountId => {
        accountId && addAccounts.push(`bigdata+${accountId}@tidepool.org`);
      })

      this.props.onUpdateDataDonationAccounts(addAccounts);

      if (this.props.trackMetric) {
        _.forEach(addAccounts, email => {
          const source = getDonationAccountCodeFromEmail(email) || 'none';
          const location = 'sign-up';
          this.props.trackMetric('web - big data sign up', { source, location });
        });
      }
    }
  },

  validateFormValues: function(formValues) {
    var form = [
      { type: 'name', name: 'fullName', label: 'full name', value: formValues.fullName },
      { type: 'date', name: 'birthday', label: 'birthday', value: formValues.birthday },
      { type: 'diagnosisDate', name: 'diagnosisDate', label: 'diagnosis date', value: formValues.diagnosisDate, prerequisites: { birthday: formValues.birthday } },
      { type: 'about', name: 'about', label: 'about', value: formValues.about},
    ];
    var validationErrors = validateForm(form);

    if (!_.isEmpty(validationErrors)) {
      this.setState({
        validationErrors: validationErrors,
      });
    }

    return validationErrors;
  },

  resetFormStateBeforeSubmit: function(formValues) {
    this.setState({
      working: true,
      formValues: formValues,
      validationErrors: {},
    });
  },

  // because JavaScript Date will coerce impossible dates into possible ones with
  // no opportunity for exposing the error to the user
  // i.e., mis-typing 02/31/2014 instead of 03/31/2014 will be saved as 03/03/2014!
  makeRawDateString: function(dateObj){
    var mm = ''+(parseInt(dateObj.month) + 1); //as a string, add 1 because 0-indexed
    mm = (mm.length === 1) ? '0'+ mm : mm;
    var dd = (dateObj.day.length === 1) ? '0'+dateObj.day : dateObj.day;

    return dateObj.year+'-'+mm+'-'+dd;
  },

  isDateObjectComplete: function(dateObj) {
    if (!dateObj) {
      return false;
    }
    return (!_.isEmpty(dateObj.year) && dateObj.year.length === 4 && !_.isEmpty(dateObj.month) && !_.isEmpty(dateObj.day));
  },

  prepareFormValuesForSubmit: function(formValues) {
    var profile = {};
    var patient = {
      birthday: this.makeRawDateString(formValues.birthday),
      diagnosisDate: this.makeRawDateString(formValues.diagnosisDate),
    };

    if (formValues.about) {
      patient.about = formValues.about;
    }

    if (formValues.isOtherPerson) {
      profile.fullName = this.getUserFullName();
      patient.isOtherPerson = true;
      patient.fullName = formValues.fullName;
    }
    else {
      profile.fullName = formValues.fullName;
    }

    profile.patient = patient;

    return {
      profile: profile,
    };
  }
});

/**
 * Expose "Smart" Component that is connect-ed to Redux
 */

export function mapStateToProps(state) {
  var user = null;
  if (state.blip.allUsersMap){
    if (state.blip.loggedInUserId) {
      user = state.blip.allUsersMap[state.blip.loggedInUserId];
    }
  }

  return {
    user: user,
    fetchingUser: state.blip.working.fetchingUser.inProgress,
    working: state.blip.working.settingUpDataStorage.inProgress,
  };
}

let mapDispatchToProps = dispatch => bindActionCreators({
  updateDataDonationAccounts: actions.async.updateDataDonationAccounts,
  setupDataStorage: actions.async.setupDataStorage,
}, dispatch);

let mergeProps = (stateProps, dispatchProps, ownProps) => {
  var api = ownProps.routes[0].api;
  return Object.assign({}, stateProps, {
    onSubmit: dispatchProps.setupDataStorage.bind(null, api),
    onUpdateDataDonationAccounts: dispatchProps.updateDataDonationAccounts.bind(null, api),
    trackMetric: ownProps.routes[0].trackMetric,
  });
};

export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(PatientNew);
