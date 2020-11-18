
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
import PropTypes from 'prop-types';
import { Link } from 'react-router';
import _ from 'lodash';
import sundial from 'sundial';
import moment from 'moment-timezone';
import i18next from '../../core/language';

import { Element } from 'react-scroll';

import config from '../../config';
import personUtils from '../../core/personutils';
import PatientSettings from './patientsettings';
import PatientBgUnits from '../../components/patientBgUnits';
import DonateForm from '../../components/donateform';
import DataSources from '../../components/datasources';
import Export from '../../components/export';
import { DIABETES_TYPES } from '../../core/constants';

const t = i18next.t.bind(i18next);

//date masks we use
const FORM_DATE_FORMAT = 'MM/DD/YYYY';
const SERVER_DATE_FORMAT = 'YYYY-MM-DD';

class PatientInfo extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      editing: false,
      validationErrors: {},
      bioLength: 0
    };
    this.handleSubmit = this.handleSubmit.bind(this);
  }

  render() {
    if (this.props.fetchingPatient) {
      return this.renderSkeleton();
    }

    if (this.state.editing) {
      return this.renderEditing();
    }

    const patient = this.props.patient;
    const handleClick = (e) => {
      e.preventDefault();
      this.toggleEdit();
    };
    let nameNode;
    let ageNode;
    let diagnosisNode;
    if (this.isSamePersonUserAndPatient()) {
      nameNode = (
        <a href="" onClick={handleClick} className="PatientInfo-block PatientInfo-block--withArrow">
          {this.getDisplayName(patient)}
        </a>
      );
      ageNode = (
        <a href="" onClick={handleClick} className="PatientInfo-block">
          {this.getAgeText(patient)}
        </a>
      );
      diagnosisNode = (
        <a href="" onClick={handleClick} className="PatientInfo-block">
          {this.getDiagnosisText(patient)}
        </a>
      );
    }
    else {
      nameNode = (
        <div className="PatientInfo-block PatientInfo-block--withArrow">
          {this.getDisplayName(patient)}
        </div>
      );
      ageNode = (
        <div className="PatientInfo-block">
          {this.getAgeText(patient)}
        </div>
      );
      diagnosisNode = (
        <div className="PatientInfo-block">
          {this.getDiagnosisText(patient)}
        </div>
      );
    }

    return (
      <div className="PatientInfo">
        <div className="PatientPage-sectionTitle">{t('Profile')}</div>
        <div className="PatientInfo-controls">
          {this.renderEditLink()}
        </div>
        <div className="clear"></div>

        <div className="PatientInfo-content">
          <div className="PatientInfo-head">
            <div className="PatientInfo-picture"></div>
            <div className="PatientInfo-blocks">
              <div className="PatientInfo-blockRow">
                {nameNode}
              </div>
              <div className="PatientInfo-blockRow">
                {ageNode}
              </div>
              <div className="PatientInfo-blockRow">
                {diagnosisNode}
              </div>
            </div>
          </div>
          <div className="PatientInfo-bio">
            {this.getAboutText(patient)}
          </div>
        </div>
        {this.renderPatientSettings()}
        {this.renderBgUnitSettings()}
        {this.renderDonateForm()}
        {this.renderDataSources()}
        {/*this.renderExport()*/}
      </div>
    );
  }

  renderSkeleton() {
    return (
      <div className="PatientInfo">
        <div className="PatientPage-sectionTitle">{t('Profile')}</div>
        <div className="PatientInfo-controls"></div>
        <div className="clear"></div>
        <div className="PatientInfo-content">
          <div className="PatientInfo-head">
            <div className="PatientInfo-picture"></div>
            <div className="PatientInfo-blocks">
              <div className="PatientInfo-blockRow">
                <div className="PatientInfo-block PatientInfo-block--withArrow PatientInfo-block--placeholder">&nbsp;</div>
              </div>
              <div className="PatientInfo-blockRow">
                <div className="PatientInfo-block PatientInfo-block--placeholder">&nbsp;</div>
              </div>
              <div className="PatientInfo-blockRow">
                <div className="PatientInfo-block PatientInfo-block--placeholder">&nbsp;</div>
              </div>
            </div>
          </div>
          <div className="PatientInfo-bio PatientInfo-bio--placeholder">&nbsp;</div>
        </div>
      </div>
    );
  }

  renderEditLink() {
    if (!this.isSamePersonUserAndPatient()) {
      return null;
    }

    const handleClick = (e) => {
      e.preventDefault();
      this.props.trackMetric('Clicked Edit Profile');
      this.toggleEdit();
    };

    // Important to add a `key`, different from the "Cancel" button in edit mode
    // or else react will maintain the "focus" state when flipping back and forth
    return (
      <button key="edit" className="PatientInfo-button PatientInfo-button--secondary" type="button" onClick={handleClick}>{t('Edit')}</button>
    );
  }

  toggleEdit() {
    this.setState({
      editing: !this.state.editing,
      validationErrors: {}
    });
  }

  renderEditing() {
    const patient = this.props.patient;
    const formValues = this.formValuesFromPatient(patient);

    const handleCancel = (e) => {
      e.preventDefault();
      this.toggleEdit();
    };

    return (
      <div className="PatientInfo">
        <div className="PatientPage-sectionTitle">{t('Profile')}</div>
        <div className="PatientInfo-controls">
          <button key="cancel" className="PatientInfo-button PatientInfo-button--secondary" type="button" disabled={this.state.working} onClick={handleCancel}>{t('Cancel')}</button>
          {this.renderSubmit()}
        </div>
        <div className="clear"></div>
        <div className="PatientInfo-content">
          <div className="PatientInfo-head">
            <div className="PatientInfo-picture"></div>
            <div className="PatientInfo-blocks">
              {this.renderFullNameInput(formValues)}
              {this.renderBirthdayInput(formValues)}
              {this.renderDiagnosisDateInput(formValues)}
              {this.renderDiagnosisTypeInput(formValues)}
            </div>
          </div>
          {this.renderAboutInput(formValues)}
        </div>
        {this.renderPatientSettings()}
        {this.renderBgUnitSettings()}
        {this.renderDonateForm()}
        {this.renderDataSources()}
      </div>
    );
  }

  renderFullNameInput(formValues) {
    let fullNameNode, errorElem, classes;
    const errors = {
      firstName: this.state.validationErrors.firstName,
      lastName: this.state.validationErrors.lastName
    };
    // Legacy: revisit when proper "child accounts" are implemented
    if (personUtils.patientIsOtherPerson(this.props.patient)) {
      classes = 'PatientInfo-input';
      if (errors.firstName || errors.lastName) {
        classes += ' PatientInfo-input-error';
        errorElem = <div className="PatientInfo-error-message">
            {errors.firstName}
            <br/>
            {errors.lastName}
          </div>;
      }
      fullNameNode = (
        <div className="PatientInfo-blockRow">
          <input className={classes} id="firstName" ref="firstName" placeholder={t('First name')} defaultValue={formValues.firstName} />
          <input className={classes} id="lastName" ref="lastName" placeholder={t('Last name')} defaultValue={formValues.lastName} />
          {errorElem}
        </div>
      );
    }
    else {
      formValues = _.omit(formValues, ['firstName','lastName']);
      const fullName = this.getDisplayName(this.props.patient);
      fullNameNode = (
        <div className="PatientInfo-block PatientInfo-block--withArrow">
          {fullName} ({t('edit in')} <Link to="/profile">{t('account')}</Link>)
        </div>
      );
    }

    return (<div className="PatientInfo-blockRow">
      {fullNameNode}
    </div>);
  }

  renderBirthdayInput(formValues) {
    let classes = 'PatientInfo-input', errorElem;
    const error = this.state.validationErrors.birthday;
    if (error) {
      classes += ' PatientInfo-input-error';
      errorElem = <div className="PatientInfo-error-message">{error}</div>;
    }
    return (<div className="PatientInfo-blockRow">
      <div className="">
        <label className="PatientInfo-label" htmlFor="birthday">{t('Date of birth')}</label>
        <input className={classes} id="birthday" ref="birthday" placeholder={t(FORM_DATE_FORMAT)} defaultValue={formValues.birthday} />
        {errorElem}
      </div>
    </div>);
  }

  renderDiagnosisDateInput(formValues) {
    let classes = 'PatientInfo-input', errorElem;
    const error = this.state.validationErrors.diagnosisDate;
    if (error) {
      classes += ' PatientInfo-input-error';
      errorElem = <div className="PatientInfo-error-message">{error}</div>;
    }
    return (<div className="PatientInfo-blockRow">
      <div className="">
        <label className="PatientInfo-label" htmlFor="diagnosisDate">{t('Date of diagnosis')}</label>
        <input className={classes} id="diagnosisDate" ref="diagnosisDate" placeholder={t(FORM_DATE_FORMAT)} defaultValue={formValues.diagnosisDate} />
        {errorElem}
      </div>
    </div>);
  }

  renderDiagnosisTypeInput(formValues) {
    const classes = 'PatientInfo-input';
    const types = _.clone(DIABETES_TYPES()); // eslint-disable-line new-cap
    types.unshift({
      value: '',
      label: t('Choose One')
    });
    const options = _.map(types, function(item) {
      return <option key={item.value} value={item.value}>{item.label}</option>;
    });
    return (<div className="PatientInfo-blockRow">
      <div className="">
        <label className="PatientInfo-label" htmlFor="diagnosisType">{t('Diagnosed as')}</label>
        <select
          id="diagnosisType"
          ref="diagnosisType"
          placeholder='Choose one'
          className={classes}
          name="diabetesType"
          defaultValue={formValues.diagnosisType}>
          {options}
        </select>
      </div>
    </div>);
  }

  renderAboutInput(formValues) {
    let classes = 'PatientInfo-input';
    let errorElem = null;
    const error = this.state.validationErrors.about;
    if (error) {
      classes += ' PatientInfo-input-error';
      errorElem = <div className="PatientInfo-error-message">{error}</div>;
    }

    let charCountClass;
    if (this.state.bioLength > 256) {
      charCountClass = 'PatientInfo-error-message';
    }

    const charCount = <div className={charCountClass}>{this.state.bioLength === 0 ? '' : this.state.bioLength.toString() + '/256'}</div>;
    return (<div className="PatientInfo-bio">
      <textarea className={classes} ref="about"
        placeholder={t('Anything you would like to share?')}
        rows="3"
        defaultValue={formValues.about}
        onChange={(event) => this.setState({ bioLength : event.target.value === undefined ? 0 : event.target.value.length })}>
      </textarea>
      {charCount}
      {errorElem}
    </div>);
  }

  renderSubmit() {
    return (
      <button className="PatientInfo-button PatientInfo-button--primary"
        type="submit" onClick={this.handleSubmit}>
        {t('Save changes')}
      </button>
    );
  }

  renderPatientSettings() {
    return (
      <PatientSettings
        editingAllowed={this.isEditingAllowed(this.props.permsOfLoggedInUser)}
        onUpdatePatientSettings={this.props.onUpdatePatientSettings}
        patient={this.props.patient}
        trackMetric={this.props.trackMetric}
      />
    );
  }

  renderBgUnitSettings() {
    return (
      <div className="PatientPage-bgUnitSettings">
        <div className="PatientPage-sectionTitle">{t('The units I use are')}</div>
        <div className="PatientInfo-content">
          <PatientBgUnits
            patient={this.props.patient}
          />
        </div>
      </div>
    );
  }

  renderDonateForm() {
    if (this.isSamePersonUserAndPatient() && !config.HIDE_DONATE) {
      return (
        <div className="PatientPage-donateForm">
          <div className="PatientPage-sectionTitle">{t('Donate my data?')}</div>
          <div className="PatientInfo-content">
            <DonateForm
              dataDonationAccounts={this.props.dataDonationAccounts || []}
              dataDonationAccountsFetched={this.props.dataDonationAccountsFetched || false}
              onUpdateDataDonationAccounts={this.props.onUpdateDataDonationAccounts}
              working={this.props.updatingDataDonationAccounts || false}
              trackMetric={this.props.trackMetric}
            />
          </div>
        </div>
      );
    }

    return null;
  }

  renderDataSources() {
    if (this.isSamePersonUserAndPatient() && !config.HIDE_DEXCOM_BANNER) {
      return (
        <Element name="dexcomConnect" className="PatientPage-dataSources">
          <div className="PatientPage-sectionTitle">{t('My Data Sources')}</div>
          <div className="PatientInfo-content">
            <DataSources
              dataSources={this.props.dataSources}
              fetchDataSources={this.props.fetchDataSources}
              connectDataSource={this.props.connectDataSource}
              disconnectDataSource={this.props.disconnectDataSource}
              authorizedDataSource={this.props.authorizedDataSource}
              trackMetric={this.props.trackMetric}
              queryParams={this.props.queryParams}
            />
          </div>
        </Element>
      );
    }

    return null;
  }

  renderExport() {
    return (
      <div className="PatientPage-export">
        <div className="PatientPage-sectionTitle">Export My Data</div>
        <div className="PatientInfo-content">
          <Export api={this.props.api} patient={this.props.patient} />
        </div>
      </div>
    );
  }

  isSamePersonUserAndPatient() {
    return personUtils.isSame(this.props.user, this.props.patient);
  }

  isEditingAllowed(permissions) {
    if (_.isPlainObject(permissions)) {
      return Object.prototype.hasOwnProperty.call(permissions,'custodian') || Object.prototype.hasOwnProperty.call(permissions,'root');
    }

    return false;
  }

  getDisplayName(patient) {
    return personUtils.patientFullName(patient);
  }

  getAgeText(patient,to=moment.utc()) {
    const patientInfo = personUtils.patientInfo(patient) || {};
    const birthday = patientInfo.birthday;

    if (!birthday) {
      return null;
    }

    const yrsAgo = to.diff(moment.utc(birthday), 'years');

    if (yrsAgo === 1) {
      return t('1 year old');
    } else if (yrsAgo > 1) {
      return t('{{yrsAgo}} years old', {yrsAgo});
    } else if (yrsAgo === 0) {
      return t('Born this year');
    } else {
      return t('Birthdate not known');
    }
  }

  getDiagnosisText(patient,to=moment.utc()) {
    const patientInfo = personUtils.patientInfo(patient) || {};
    const { diagnosisDate, diagnosisType } = patientInfo;
    let diagnosisDateText = '';
    let diagnosisTypeText = '';
    let yearsAgo;

    if (!diagnosisDate && !diagnosisType) {
      return;
    }

    if (diagnosisDate) {
      yearsAgo = to.diff(moment.utc(diagnosisDate), 'years');

      if (yearsAgo === 0) {
        diagnosisDateText = t('this year');
      } else if (yearsAgo === 1) {
        diagnosisDateText = t('1 year ago');
      } else if (yearsAgo > 1) {
        diagnosisDateText = t('{{yearsAgo}} years ago', {yearsAgo});
      }
    }

    if (diagnosisType) {
      // eslint-disable-next-line new-cap
      diagnosisTypeText = _.get(_.find(DIABETES_TYPES(), { value: diagnosisType}), 'label');
    }

    if (!diagnosisTypeText && !diagnosisDateText) {
      return t('Diagnosis date not known');
    }

    if (!diagnosisTypeText) {
      return t('Diagnosed {{diagnosisDate}}', {diagnosisDate: diagnosisDateText});
    }

    if (!diagnosisDateText) {
      return t('Diagnosed as {{diagnosisType}}', {diagnosisType: diagnosisTypeText});
    }

    return t('Diagnosed {{diagnosisDate}} as {{diagnosisType}}', {diagnosisDate: diagnosisDateText, diagnosisType: diagnosisTypeText});
  }

  getAboutText(patient) {
    const patientInfo = personUtils.patientInfo(patient) || {};
    return patientInfo.about;
  }

  /**
   * Given a patient object, extract the values from it
   * that needs to be displayed on the patientinfo form
   *
   * @param  {Object} patient
   * @return {Object}
   */
  formValuesFromPatient(patient) {
    if (!_.isPlainObject(patient) || _.isEmpty(patient)) {
      return {};
    }

    const formValues = {};
    const patientInfo = personUtils.patientInfo(patient);
    const firstName = personUtils.patientFirstName(patient);
    if (firstName) {
      formValues.firstName = firstName;
    }
    const lastName = personUtils.patientLastName(patient);
    if (lastName) {
      formValues.lastName = lastName;
    }

    if (patientInfo) {
      if (patientInfo.birthday) {
        formValues.birthday = sundial.translateMask(patientInfo.birthday, SERVER_DATE_FORMAT, t(FORM_DATE_FORMAT));
      }

      if (patientInfo.diagnosisDate) {
        formValues.diagnosisDate = sundial.translateMask(patientInfo.diagnosisDate, SERVER_DATE_FORMAT, t(FORM_DATE_FORMAT));
      }

      if (patientInfo.diagnosisType) {
        formValues.diagnosisType = patientInfo.diagnosisType;
      }

      if (patientInfo.about) {
        formValues.about = patientInfo.about;
      }
    }

    return formValues;
  }

  handleSubmit(e) {
    e.preventDefault();
    const formValues = this.getFormValues();

    this.setState({validationErrors: {}});

    const isNameRequired = personUtils.patientIsOtherPerson(this.props.patient);
    const validationErrors = personUtils.validateFormValues(formValues, isNameRequired, t(FORM_DATE_FORMAT));

    if (!_.isEmpty(validationErrors)) {
      this.setState({
        validationErrors: validationErrors
      });
      return;
    }
    this.submitFormValues(formValues);
  }

  getFormValues() {
    return _.reduce([
      'firstName',
      'lastName',
      'birthday',
      'diagnosisDate',
      'diagnosisType',
      'about'
    ], (acc, key) => {
      if (this.refs[key]) {
        acc[key] = this.refs[key].value;
      }
      return acc;
    }, {});
  }

  submitFormValues(formValues) {
    formValues = this.prepareFormValuesForSubmit(formValues);

    // Save optimistically
    this.props.onUpdatePatient(formValues);
    this.toggleEdit();
  }

  prepareFormValuesForSubmit(formValues) {
    formValues.fullName = `${formValues.firstName} ${formValues.lastName}`

    // Legacy: revisit when proper "child accounts" are implemented
    if (personUtils.patientIsOtherPerson(this.props.patient)) {
      formValues.isOtherPerson = true;
    }

    if (formValues.birthday) {
      formValues.birthday = sundial.translateMask(formValues.birthday, t(FORM_DATE_FORMAT), SERVER_DATE_FORMAT);
    }

    if (formValues.diagnosisDate) {
      formValues.diagnosisDate = sundial.translateMask(formValues.diagnosisDate, t(FORM_DATE_FORMAT), SERVER_DATE_FORMAT);
    }

    if (!formValues.diagnosisType) {
      delete formValues.diagnosisType;
    }

    if (!formValues.about) {
      delete formValues.about;
    }

    const profile = _.assign({}, this.props.patient.profile, {
      patient: formValues
    });

    const result = _.assign({}, this.props.patient, {
      profile: profile
    });

    return result;
  }
}

// many things *not* required here because they aren't needed for
// /patients/:id/profile although they are for /patients/:id/share (or vice-versa)
PatientInfo.propTypes = {
  dataDonationAccounts: PropTypes.array,
  dataDonationAccountsFetched: PropTypes.bool,
  fetchingPatient: PropTypes.bool.isRequired,
  fetchingUser: PropTypes.bool.isRequired,
  onUpdateDataDonationAccounts: PropTypes.func,
  onUpdatePatient: PropTypes.func.isRequired,
  onUpdatePatientSettings: PropTypes.func.isRequired,
  permsOfLoggedInUser: PropTypes.object,
  patient: PropTypes.object,
  trackMetric: PropTypes.func.isRequired,
  updatingDataDonationAccounts: PropTypes.bool,
  updatingPatientBgUnits: PropTypes.bool,
  user: PropTypes.object,
  dataSources: PropTypes.array,
  fetchDataSources: PropTypes.func,
  connectDataSource: PropTypes.func,
  disconnectDataSource: PropTypes.func,
  authorizedDataSource: PropTypes.object,
  api: PropTypes.object.isRequired,
  queryParams: PropTypes.object,
};

export default PatientInfo;
