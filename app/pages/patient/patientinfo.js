
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
import { Link } from 'react-router-dom';
import _ from 'lodash';
import sundial from 'sundial';
import { translate, Trans } from 'react-i18next';
import i18next from '../../core/language';

import { Element } from 'react-scroll';

var personUtils = require('../../core/personutils');
import PatientSettings from './patientsettings';
import PatientBgUnits from '../../components/patientBgUnits';
import DonateForm from '../../components/donateform';
import DataSources from '../../components/datasources';
import Export from '../../components/export';
import { DIABETES_TYPES } from '../../core/constants';

const t = i18next.t.bind(i18next);

//date masks we use
var FORM_DATE_FORMAT = t('MM/DD/YYYY');
var SERVER_DATE_FORMAT = 'YYYY-MM-DD';

var PatientInfo = translate()(class extends React.Component {
  // many things *not* required here because they aren't needed for
  // /patients/:id/profile although they are for /patients/:id/share (or vice-versa)
  static propTypes = {
    dataDonationAccounts: PropTypes.array,
    dataDonationAccountsFetched: PropTypes.bool,
    fetchingPatient: PropTypes.bool.isRequired,
    fetchingUser: PropTypes.bool.isRequired,
    onUpdateDataDonationAccounts: PropTypes.func,
    onUpdatePatient: PropTypes.func.isRequired,
    onUpdatePatientSettings: PropTypes.func,
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
  };

  constructor(props, context) {
    super(props, context);
    var editing = this.isEditingAllowed(props.permsOfLoggedInUser) && window.location.hash === '#edit';

    this.state = {
      editing,
      validationErrors: {},
      bioLength: 0
    };
  }

  render() {
    const { t } = this.props;
    if (this.props.fetchingPatient) {
      return this.renderSkeleton();
    }

    if (this.state.editing) {
      return this.renderEditing();
    }

    var patient = this.props.patient;
    var self = this;
    var handleClick = function(e) {
      e.preventDefault();
      self.toggleEdit();
    };
    var nameNode;
    var ageNode;
    var diagnosisNode;
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
        {this.renderExport()}
      </div>
    );
  }

  renderSkeleton = () => {
    const { t } = this.props;
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
  };

  renderEditLink = () => {
    const { t } = this.props;
    if (!this.isSamePersonUserAndPatient() && !this.isEditingAllowed(this.props.permsOfLoggedInUser)) {
      return null;
    }

    var self = this;
    var handleClick = function(e) {
      e.preventDefault();
      self.props.trackMetric('Clicked Edit Profile');
      self.toggleEdit();
    };

    // Important to add a `key`, different from the "Cancel" button in edit mode
    // or else react will maintain the "focus" state when flipping back and forth
    return (
      <button key="edit" className="PatientInfo-button PatientInfo-button--primary" type="button" onClick={handleClick}>{t('Edit')}</button>
    );
  };

  toggleEdit = () => {
    this.setState({
      editing: !this.state.editing,
      validationErrors: {}
    });
  };

  renderEditing = () => {
    var patient = this.props.patient;
    var formValues = this.formValuesFromPatient(patient);

    var self = this;
    var handleCancel = function(e) {
      e.preventDefault();
      self.toggleEdit();
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
              {this.renderMRNInput(formValues)}
              {this.renderEmailInput(formValues)}
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
  };

  renderFullNameInput = (formValues) => {
    var fullNameNode, errorElem, classes;
    var error = this.state.validationErrors.fullName;
    // Legacy: revisit when proper "child accounts" are implemented
    if (personUtils.patientIsOtherPerson(this.props.patient) || this.isEditingAllowed(this.props.permsOfLoggedInUser)) {
      classes = 'PatientInfo-input';
      if (error) {
        classes += ' PatientInfo-input-error';
        errorElem = <div className="PatientInfo-error-message">{error}</div>;
      }
      fullNameNode = (
        <div>
          <label className="PatientInfo-label" htmlFor="fullName">{t('Full Name')}</label>
          <input className={classes} id="fullName" ref="fullName" placeholder="Full name" defaultValue={formValues.fullName} />
          {errorElem}
        </div>
      );
    }
    else {
      formValues = _.omit(formValues, 'fullName');
      const fullName = this.getDisplayName(this.props.patient);
      fullNameNode = (
        <Trans className="PatientInfo-block PatientInfo-block--withArrow" i18nKey="html.patient-info-fullname">
          {{fullName}} (edit in
          <Link to="/profile">account</Link>)
        </Trans>
      );
    }

    return (<div className="PatientInfo-blockRow">
      {fullNameNode}
    </div>);
  };

  renderBirthdayInput = (formValues) => {
    const { t } = this.props;
    var classes = 'PatientInfo-input', errorElem;
    var error = this.state.validationErrors.birthday;
    if (error) {
      classes += ' PatientInfo-input-error';
      errorElem = <div className="PatientInfo-error-message">{error}</div>;
    }
    return (<div className="PatientInfo-blockRow">
      <div className="">
        <label className="PatientInfo-label" htmlFor="birthday">{t('Date of birth')}</label>
        <input className={classes} id="birthday" ref="birthday" placeholder={FORM_DATE_FORMAT} defaultValue={formValues.birthday} />
        {errorElem}
      </div>
    </div>);
  };

  renderDiagnosisDateInput = (formValues) => {
    const { t } = this.props;
    var classes = 'PatientInfo-input', errorElem;
    var error = this.state.validationErrors.diagnosisDate;
    if (error) {
      classes += ' PatientInfo-input-error';
      errorElem = <div className="PatientInfo-error-message">{error}</div>;
    }
    return (<div className="PatientInfo-blockRow">
      <div className="">
        <label className="PatientInfo-label" htmlFor="diagnosisDate">{t('Date of diagnosis')}</label>
        <input className={classes} id="diagnosisDate" ref="diagnosisDate" placeholder={FORM_DATE_FORMAT} defaultValue={formValues.diagnosisDate} />
        {errorElem}
      </div>
    </div>);
  };

  renderDiagnosisTypeInput = (formValues) => {
    const { t } = this.props;
    var classes = 'PatientInfo-input';
    var types = _.clone(DIABETES_TYPES()); // eslint-disable-line new-cap
    types.unshift({
      value: '',
      label: t('Choose One')
    });
    var options = _.map(types, function(item) {
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
  };

  renderAboutInput = (formValues) => {
    const { t } = this.props;
    var classes = 'PatientInfo-input', errorElem;
    var error = this.state.validationErrors.about;
    if (error) {
      classes += ' PatientInfo-input-error';
      errorElem = <div className="PatientInfo-error-message">{error}</div>;
    }

    var charCountClass;
    if (this.state.bioLength > 256) {
      charCountClass = 'PatientInfo-error-message';
    }

    var charCount = <div className={charCountClass}>{this.state.bioLength === 0 ? '' : this.state.bioLength.toString() + '/256'}</div>;
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
  };

  renderMRNInput = (formValues) => {
    var mrn, errorElem, classes;
    const error = this.state.validationErrors.mrn;
    const permsOfLoggedInUser = _.get(this.props, 'permsOfLoggedInUser', {});

    if (permsOfLoggedInUser.hasOwnProperty('custodian')) {
      classes = '';
      if (error) {
        classes += ' PatientInfo-input-error';
        errorElem = <div className="PatientInfo-error-message">{error}</div>;
      }
      mrn = (
        <div className={classes}>
          <label className="PatientInfo-label" htmlFor="mrn">{t('MRN (optional)')}</label>
          <input className="PatientInfo-input" id="mrn" ref="mrn" placeholder="MRN" defaultValue={formValues.mrn} />
          {errorElem}
        </div>
      );
    }

    return (<div className="PatientInfo-blockRow">
      {mrn}
    </div>);
  };

  renderEmailInput = (formValues) => {
    var email, errorElem, classes;
    const error = this.state.validationErrors.email;
    const permsOfLoggedInUser = _.get(this.props, 'permsOfLoggedInUser', {});

    if (permsOfLoggedInUser.hasOwnProperty('custodian')) {
      classes = '';
      if (error) {
        classes += ' PatientInfo-input-error';
        errorElem = <div className="PatientInfo-error-message">{error}</div>;
      }
      email = (
        <div className={classes}>
          <label className="PatientInfo-label" htmlFor="email">{t('Patient Email (optional)')}</label>
          <input type="email" className="PatientInfo-input" id="email" ref="email" placeholder="Email address" defaultValue={formValues.email} required/>
          {errorElem}
        </div>
      );
    }

    return (<div className="PatientInfo-blockRow">
      {email}
    </div>);
  };

  renderSubmit = () => {
    const { t } = this.props;
    return (
      <button className="PatientInfo-button PatientInfo-button--primary"
        type="submit" onClick={this.handleSubmit}>
        {t('Save changes')}
      </button>
    );
  };

  renderPatientSettings = () => {
    return (
      <PatientSettings
        editingAllowed={this.isEditingAllowed(this.props.permsOfLoggedInUser)}
        onUpdatePatientSettings={this.props.onUpdatePatientSettings}
        patient={this.props.patient}
        trackMetric={this.props.trackMetric}
      />
    );
  };

  renderBgUnitSettings = () => {
    return (
      <Trans className="PatientPage-bgUnitSettings" i18nKey="html.patientinfo-units-used">
        <div className="PatientPage-sectionTitle">The units I use are</div>
        <div className="PatientInfo-content">
          <PatientBgUnits
            editingAllowed={this.isEditingAllowed(this.props.permsOfLoggedInUser)}
            onUpdatePatientSettings={this.props.onUpdatePatientSettings}
            patient={this.props.patient}
            trackMetric={this.props.trackMetric}
            working={this.props.updatingPatientBgUnits || false}
          />
        </div>
      </Trans>
    );
  };

  renderDonateForm = () => {
    const { t } = this.props;
    if (this.isSamePersonUserAndPatient()) {
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
  };

  renderDataSources = () => {
    const { t } = this.props;
    if (this.isSamePersonUserAndPatient()) {
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
  };

  renderExport = () => {
    const { t } = this.props;
    return (
      <div className="PatientPage-export">
        <div className="PatientPage-sectionTitle">{t('Export My Data')}</div>
        <div className="PatientInfo-content">
          <Export
            api={this.props.api}
            patient={this.props.patient}
            user={this.props.user}
            trackMetric={this.props.trackMetric}
          />
        </div>
      </div>
    );
  };

  isSamePersonUserAndPatient = () => {
    return personUtils.isSame(this.props.user, this.props.patient);
  };

  isEditingAllowed = (permissions) => {
    if (_.isPlainObject(permissions)) {
      return permissions.hasOwnProperty('custodian') || permissions.hasOwnProperty('root');
    }

    return false;
  };

  getDisplayName = (patient) => {
    return personUtils.patientFullName(patient);
  };

  getAgeText = (patient, currentDate) => {
    const { t } = this.props;
    var patientInfo = personUtils.patientInfo(patient) || {};
    var birthday = patientInfo.birthday;

    if (!birthday) {
      return;
    }

    var now = new Date();
    currentDate = currentDate || Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());
    var yrsAgo = sundial.dateDifference(currentDate, birthday, 'years');

    if (yrsAgo === 1) {
      return t('1 year old');
    } else if (yrsAgo > 1) {
      return t('{{yrsAgo}} years old', {yrsAgo});
    } else if (yrsAgo === 0) {
      return t('Born this year');
    } else {
      return t('Birthdate not known');
    }
  };

  getDiagnosisText = (patient, currentDate) => {
    const { t } = this.props;
    var patientInfo = personUtils.patientInfo(patient) || {};
    var diagnosisDate = patientInfo.diagnosisDate;
    var diagnosisType = patientInfo.diagnosisType;
    var diagnosisDateText = '';
    var diagnosisTypeText = '';
    var yearsAgo;

    if (!diagnosisDate && !diagnosisType) {
      return;
    }

    var now = new Date();
    currentDate = currentDate || Date.UTC(now.getFullYear(), now.getMonth(), now.getDate());

    if (diagnosisDate) {
      var yearsAgo = sundial.dateDifference(currentDate, diagnosisDate, 'years');

      if (yearsAgo === 0) {
        diagnosisDateText = t('this year');
      } else if (yearsAgo === 1) {
        diagnosisDateText = t('1 year ago');
      } else if (yearsAgo > 1) {
        diagnosisDateText = t('{{yearsAgo}} years ago', {yearsAgo});
      } else if (yearsAgo === 0) {
        diagnosisDateText = t('this year');
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
  };

  getAboutText = (patient) => {
    var patientInfo = personUtils.patientInfo(patient) || {};
    return patientInfo.about;
  };

  /**
   * Given a patient object, extract the values from it
   * that needs to be displayed on the patientinfo form
   *
   * @param  {Object} patient
   * @return {Object}
   */
  formValuesFromPatient = (patient) => {
    if (!_.isPlainObject(patient) || _.isEmpty(patient)) {
      return {};
    }

    var formValues = {};
    var patientInfo = personUtils.patientInfo(patient);
    var name = personUtils.patientFullName(patient);
    var email = _.get(patient, 'profile.emails[0]', null);

    if (name) {
      formValues.fullName = name;
    }

    if (patientInfo) {
      if (patientInfo.birthday) {
        formValues.birthday =  sundial.translateMask(patientInfo.birthday, SERVER_DATE_FORMAT, FORM_DATE_FORMAT);
      }

      if (patientInfo.diagnosisDate) {
        formValues.diagnosisDate = sundial.translateMask(patientInfo.diagnosisDate, SERVER_DATE_FORMAT, FORM_DATE_FORMAT);
      }

      if (patientInfo.diagnosisType) {
        formValues.diagnosisType = patientInfo.diagnosisType;
      }

      if (patientInfo.about) {
        formValues.about = patientInfo.about;
      }

      if (patientInfo.mrn) {
        formValues.mrn = patientInfo.mrn;
      }
    }

    if (email) {
      formValues.email = email;
    }

    return formValues;
  };

  handleSubmit = (e) => {
    e.preventDefault();
    var formValues = this.getFormValues();
    const permsOfLoggedInUser = _.get(this.props, 'permsOfLoggedInUser', {});

    this.setState({validationErrors: {}});

    var isNameRequired = personUtils.patientIsOtherPerson(this.props.patient);
    var validationErrors = personUtils.validateFormValues(formValues, isNameRequired, FORM_DATE_FORMAT);

    if(permsOfLoggedInUser.hasOwnProperty('custodian') && validationErrors.diagnosisDate === personUtils.OUT_OF_ORDER_TEXT){
      delete validationErrors.diagnosisDate;
    }
    if (!_.isEmpty(validationErrors)) {
      this.setState({
        validationErrors: validationErrors
      });
      return;
    }

    this.submitFormValues(formValues);
  };

  getFormValues = () => {
    var self = this;
    return _.reduce([
      'fullName',
      'birthday',
      'diagnosisDate',
      'diagnosisType',
      'about',
      'mrn',
      'email'
    ], function(acc, key, value) {
      if (self.refs[key]) {
        acc[key] = self.refs[key].value;
      }
      return acc;
    }, {});
  };

  submitFormValues = (formValues) => {
    formValues = this.prepareFormValuesForSubmit(formValues);

    if(this.props.permsOfLoggedInUser.hasOwnProperty('custodian') && !this.props.patient.username && formValues.username){
      this.props.trackMetric('VCA - add patient email saved');
    }
    // Save optimistically
    this.props.onUpdatePatient(formValues);
    this.toggleEdit();
  };

  prepareFormValuesForSubmit = (formValues) => {
    const updatedPatient = _.cloneDeep(this.props.patient);
    const updatedPatientProfile = updatedPatient.profile.patient;

    if (formValues.birthday) {
      updatedPatientProfile.birthday = sundial.translateMask(formValues.birthday, FORM_DATE_FORMAT, SERVER_DATE_FORMAT);
    }

    if (formValues.diagnosisDate) {
      updatedPatientProfile.diagnosisDate = sundial.translateMask(formValues.diagnosisDate, FORM_DATE_FORMAT, SERVER_DATE_FORMAT);
    }

    if (!formValues.diagnosisType) {
      delete updatedPatientProfile.diagnosisType;
    } else {
      updatedPatientProfile.diagnosisType = formValues.diagnosisType;
    }

    if (!formValues.about) {
      delete updatedPatientProfile.about;
    } else {
      updatedPatientProfile.about = formValues.about;
    }

    if (formValues.email) {
      _.assign(updatedPatient, {emails: [formValues.email]})
      updatedPatient.username = formValues.email;
      updatedPatient.profile.emails = [formValues.email];
      updatedPatientProfile.email = formValues.email;
    }

    if (formValues.fullName) {
      if (personUtils.patientIsOtherPerson(this.props.patient)) {
        _.assign(updatedPatientProfile, {fullName: formValues.fullName});
      } else {
        updatedPatient.profile.fullName = formValues.fullName;
      }
    }

    if (personUtils.isClinic(this.props.user)) {
      if (!formValues.mrn && updatedPatientProfile.mrn) {
        delete updatedPatientProfile.mrn;
      } else {
        updatedPatientProfile.mrn = formValues.mrn;
      }
    }

    return updatedPatient;
  };
});

module.exports = PatientInfo;
