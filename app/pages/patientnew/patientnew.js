
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
import config from '../../config';
import * as actions from '../../redux/actions';
import SimpleForm from '../../components/simpleform';
import personUtils from '../../core/personutils';
import { getDonationAccountCodeFromEmail } from '../../core/utils';

import {
  DATA_DONATION_NONPROFITS,
  DIABETES_TYPES,
  TIDEPOOL_DATA_DONATION_ACCOUNT_EMAIL,
  URL_BIG_DATA_DONATION_INFO,
} from '../../core/constants';

const t = i18n.t.bind(i18n);

class PatientNew extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      working: false,
      formValues: {
        isOtherPerson: false,
        firstName:this.getUserFirstName(),
        lastName:this.getUserLastName(),
        dataDonateDestination: ''
      },
      validationErrors: {},
    };
    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  getFormInputs() {
    const isOtherPerson = this.state.formValues.isOtherPerson;

    const baseInputs = [
      {
        name: 'isOtherPerson',
        type: 'radios',
        items: [
          {value: false, label: t('This is for me, I have diabetes')},
          {value: true, label: t('This is for someone I care for who has diabetes')}
        ],
      },
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
        name: 'about',
        type: 'textarea',
        placeholder: isOtherPerson ? t('Share a bit about this person.') : t('Share a bit about yourself.')
      },
      {
        name: 'birthday',
        label: t('Birthday'),
        type: 'datepicker',
      },
      {
        name: 'diagnosisDate',
        label: t('Diagnosis date'),
        type: 'datepicker',
      },
      {
        name: 'diagnosisType',
        label: isOtherPerson ? t('How do you describe their diabetes?') : t('How do you describe your diabetes?'),
        type: 'select',
        multi: false,
        value: this.state.formValues.diagnosisType,
        placeholder: t('Choose One'),
        items: DIABETES_TYPES(),// eslint-disable-line new-cap
      }
    ];
    if (config.HIDE_DONATE) {
      return baseInputs;
    } else {
      return baseInputs.concat(
          {
        name: 'dataDonate',
        label: isOtherPerson ? t('Donate their anonymized data') : t('Donate my anonymized data'),
        disabled: !_.isEmpty(this.state.formValues.dataDonateDestination),
        value: this.state.formValues.dataDonate,
        type: 'checkbox',
      },
      {
        name: 'dataDonateExplainer',
        type: 'explanation',
        text: (
          <div>
            {t("You own your data. Read all the details about Tidepool's Big Data Donation project")} 
            <a target="_blank" rel="noreferrer" href={URL_BIG_DATA_DONATION_INFO}>{t('here')}</a>.
          </div>
        ),
      },
      {
        name: 'dataDonateDestination',
        type: 'select',
        multi: true,
        value: this.state.formValues.dataDonateDestination,
        placeholder: t('Choose which diabetes organization(s) to support'),
        items: DATA_DONATION_NONPROFITS(), //eslint-disable-line new-cap
      },
      {
        name: 'donateExplainer',
        type: 'explanation',
        text: (
          <div>
            {t('Tidepool will share 10% of the proceeds with the diabetes organization(s) of your choice.')}
          </div>
        ),
      })
    }
  }

  componentDidMount() {
    if (this.props.trackMetric) {
      this.props.trackMetric('Viewed Profile Create');
    }
  }

  getUserFirstName(props) {
    props = props || this.props;
    return personUtils.firstName(props.user);
  }

  getUserLastName(props) {
    props = props || this.props;
    return personUtils.lastName(props.user);
  }

  render() {
    const subnav = this.renderSubnav();
    const form = this.renderForm();

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
  }

  renderSubnav() {
    return (
      <div className="container-box-outer">
        <div className="container-box-inner PatientNew-subnavInner">
          <div className="grid PatientNew-subnav">
            <div className="grid-item one-whole">
              <div className="PatientNew-subnavTitle">
                {t('Set up data storage')}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  renderForm() {
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
  }

  getSubmitButtonText() {
    if (this.props.working) {
      return t('Saving...');
    }
    return t('Save');
  }

  isFormDisabled() {
    return (this.props.fetchingUser && !this.props.user);
  }

  handleInputChange(attributes) {
    const key = attributes.name;
    const value = attributes.value;
    if (!key) {
      return;
    }

    var formValues = _.clone(this.state.formValues);

    if (key === 'isOtherPerson') {
      const isOtherPerson = (attributes.value === 'true') ? true : false;
      const firstName = isOtherPerson ? '' : this.getUserFirstName();
      const lastName = isOtherPerson ? '' : this.getUserLastName();
      formValues = _.assign(formValues, {
        isOtherPerson: isOtherPerson,
        firstName: firstName,
        lastName: lastName
      });
    }
    else if (key === 'dataDonateDestination') {
      // Sort the values so that we can accurately check see if the form values have changed
      let sortedValue = attributes.value.map(value => value.value).sort().join(',');
      formValues[key] = sortedValue;

      // Ensure that the donate checkbox is checked if there are nonprofits selected
      if (!_.isEmpty(value) && !formValues.dataDonate) {
        formValues.dataDonate = true;
      }
    }
    else {
      formValues[key] = value;
    }

    this.setState({formValues: formValues});
  }

  handleSubmit(formValues) {
    this.resetFormStateBeforeSubmit(formValues);

    const validationErrors = this.validateFormValues(formValues);

    if (!_.isEmpty(validationErrors)) {
      return;
    }

    const origFormValues = _.clone(formValues);

    formValues = this.prepareFormValuesForSubmit(formValues);
    this.props.onSubmit(formValues);

    if(origFormValues.dataDonate) {
      const addAccounts = [ TIDEPOOL_DATA_DONATION_ACCOUNT_EMAIL ];
      const selectedAccounts = origFormValues.dataDonateDestination.split(',');

      _.forEach(selectedAccounts, accountId => {
        accountId && addAccounts.push(`bigdata+${accountId}@tidepool.org`);
      });

      this.props.onUpdateDataDonationAccounts(addAccounts);

      if (this.props.trackMetric) {
        _.forEach(addAccounts, email => {
          const source = getDonationAccountCodeFromEmail(email) || 'none';
          const location = 'sign-up';
          this.props.trackMetric('web - big data sign up', { source, location });
        });
      }
    }
  }

  validateFormValues(formValues) {
    const form = [
      { type: 'name', name: 'firstName', label: t('first name'), value: formValues.firstName },
      { type: 'name', name: 'lastName', label: t('last name'), value: formValues.lastName },
      { type: 'date', name: 'birthday', label: t('birthday'), value: formValues.birthday },
      { type: 'diagnosisDate', name: 'diagnosisDate', label: t('diagnosis date'), value: formValues.diagnosisDate, prerequisites: { birthday: formValues.birthday } },
      { type: 'about', name: 'about', label: t('about'), value: formValues.about},
    ];
    const validationErrors = validateForm(form, this.state.formValues.isOtherPerson);

    if (!_.isEmpty(validationErrors)) {
      this.setState({
        validationErrors: validationErrors,
      });
    }

    return validationErrors;
  }

  resetFormStateBeforeSubmit(formValues) {
    this.setState({
      working: true,
      formValues: formValues,
      validationErrors: {},
    });
  }

  // because JavaScript Date will coerce impossible dates into possible ones with
  // no opportunity for exposing the error to the user
  // i.e., mis-typing 02/31/2014 instead of 03/31/2014 will be saved as 03/03/2014!
  makeRawDateString(dateObj){
    let mm = ''+(parseInt(dateObj.month) + 1); //as a string, add 1 because 0-indexed
    mm = (mm.length === 1) ? '0'+ mm : mm;
    const dd = (dateObj.day.length === 1) ? '0'+dateObj.day : dateObj.day;

    return dateObj.year+'-'+mm+'-'+dd;
  }

  isDateObjectComplete(dateObj) {
    if (!dateObj) {
      return false;
    }
    return (!_.isEmpty(dateObj.year) && dateObj.year.length === 4 && !_.isEmpty(dateObj.month) && !_.isEmpty(dateObj.day));
  }

  prepareFormValuesForSubmit(formValues) {
    const profile = {};
    const patient = {
      birthday: this.makeRawDateString(formValues.birthday),
      diagnosisDate: this.makeRawDateString(formValues.diagnosisDate),
    };

    if (formValues.about) {
      patient.about = formValues.about;
    }

    if (formValues.diagnosisType) {
      patient.diagnosisType = formValues.diagnosisType;
    }

    if (formValues.isOtherPerson) {
      profile.firstName = this.getUserFirstName();
      profile.lastName = this.getUserLastName();
      patient.isOtherPerson = true;
      patient.firstName = formValues.firstName;
      patient.lastName = formValues.lastName;
      patient.fullName = `${formValues.firstName} ${formValues.lastName}`;
    }
    else {
      profile.firstName = formValues.firstName;
      profile.lastName = formValues.lastName;
    }
    profile.fullName = `${profile.firstName} ${profile.lastName}`;

    profile.patient = patient;

    return {
      profile: profile,
    };
  }
}

PatientNew.propTypes = {
  fetchingUser: PropTypes.bool.isRequired,
  onUpdateDataDonationAccounts: PropTypes.func.isRequired,
  onSubmit: PropTypes.func.isRequired,
  trackMetric: PropTypes.func.isRequired,
  user: PropTypes.object,
  working: PropTypes.bool.isRequired
};

/**
 * Expose "Smart" Component that is connect-ed to Redux
 */

function mapStateToProps(state) {
  let user = null;
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
  const api = ownProps.routes[0].api;
  return Object.assign({}, stateProps, {
    onSubmit: dispatchProps.setupDataStorage.bind(null, api),
    onUpdateDataDonationAccounts: dispatchProps.updateDataDonationAccounts.bind(null, api),
    trackMetric: ownProps.routes[0].trackMetric,
  });
};

export { PatientNew, mapStateToProps };
export default connect(mapStateToProps, mapDispatchToProps, mergeProps)(PatientNew);
