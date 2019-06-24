
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

var PatientInfo = translate()(React.createClass({
  // many things *not* required here because they aren't needed for
  // /patients/:id/profile although they are for /patients/:id/share (or vice-versa)
  propTypes: {
    dataDonationAccounts: React.PropTypes.array,
    fetchingPatient: React.PropTypes.bool.isRequired,
    fetchingUser: React.PropTypes.bool.isRequired,
    onUpdateDataDonationAccounts: React.PropTypes.func,
    onUpdatePatient: React.PropTypes.func.isRequired,
    onUpdatePatientSettings: React.PropTypes.func,
    permsOfLoggedInUser: React.PropTypes.object,
    patient: React.PropTypes.object,
    trackMetric: React.PropTypes.func.isRequired,
    updatingDataDonationAccounts: React.PropTypes.bool,
    updatingPatientBgUnits: React.PropTypes.bool,
    user: React.PropTypes.object,
    dataSources: React.PropTypes.array,
    fetchDataSources: React.PropTypes.func,
    connectDataSource: React.PropTypes.func,
    disconnectDataSource: React.PropTypes.func,
    authorizedDataSource: React.PropTypes.object,
    api: React.PropTypes.object.isRequired,
  },

  getInitialState: function() {
    return {
      editing: false,
      validationErrors: {},
      bioLength: 0
    };
  },

  render: function() {
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
        {/*this.renderExport()*/}
      </div>
    );
  },

  renderSkeleton: function() {
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
  },

  renderEditLink: function() {
    const { t } = this.props;
    if (!this.isSamePersonUserAndPatient()) {
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
      <button key="edit" className="PatientInfo-button PatientInfo-button--secondary" type="button" onClick={handleClick}>{t('Edit')}</button>
    );
  },

  toggleEdit: function() {
    this.setState({
      editing: !this.state.editing,
      validationErrors: {}
    });
  },

  renderEditing: function() {
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
  },

  renderFullNameInput: function(formValues) {
    var fullNameNode, errorElem, classes;
    var error = this.state.validationErrors.fullName;
    // Legacy: revisit when proper "child accounts" are implemented
    if (personUtils.patientIsOtherPerson(this.props.patient)) {
      classes = 'PatientInfo-input';
      if (error) {
        classes += ' PatientInfo-input-error';
        errorElem = <div className="PatientInfo-error-message">{error}</div>;
      }
      fullNameNode = (
        <div className={classes}>
          <input className="PatientInfo-input" id="fullName" ref="fullName" placeholder="Full name" defaultValue={formValues.fullName} />
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
  },

  renderBirthdayInput: function(formValues) {
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
  },

  renderDiagnosisDateInput: function(formValues) {
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
  },

  renderDiagnosisTypeInput: function(formValues) {
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
  },

  renderAboutInput: function(formValues) {
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
  },

  renderSubmit: function() {
    const { t } = this.props;
    return (
      <button className="PatientInfo-button PatientInfo-button--primary"
        type="submit" onClick={this.handleSubmit}>
        {t('Save changes')}
      </button>
    );
  },

  renderPatientSettings: function() {
    return (
      <PatientSettings
        editingAllowed={this.isEditingAllowed(this.props.permsOfLoggedInUser)}
        onUpdatePatientSettings={this.props.onUpdatePatientSettings}
        patient={this.props.patient}
        trackMetric={this.props.trackMetric}
      />
    );
  },

  renderBgUnitSettings: function() {
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
  },

  renderDonateForm: function() {
    const { t } = this.props;
    if (this.isSamePersonUserAndPatient()) {
      return (
        <div className="PatientPage-donateForm">
          <div className="PatientPage-sectionTitle">{t('Donate my data?')}</div>
          <div className="PatientInfo-content">
            <DonateForm
              dataDonationAccounts={this.props.dataDonationAccounts || []}
              onUpdateDataDonationAccounts={this.props.onUpdateDataDonationAccounts}
              working={this.props.updatingDataDonationAccounts || false}
              trackMetric={this.props.trackMetric}
            />
          </div>
        </div>
      );
    }

    return null;
  },

  renderDataSources: function() {
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
  },

  renderExport: function() {
    return (
      <div className="PatientPage-export">
        <div className="PatientPage-sectionTitle">Export My Data</div>
        <div className="PatientInfo-content">
          <Export api={this.props.api} patient={this.props.patient} />
        </div>
      </div>
    )
  },

  isSamePersonUserAndPatient: function() {
    return personUtils.isSame(this.props.user, this.props.patient);
  },

  isEditingAllowed: function(permissions) {
    if (_.isPlainObject(permissions)) {
      return permissions.hasOwnProperty('custodian') || permissions.hasOwnProperty('root');
    }

    return false;
  },

  getDisplayName: function(patient) {
    return personUtils.patientFullName(patient);
  },

  getAgeText: function(patient, currentDate) {
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
  },

  getDiagnosisText: function(patient, currentDate) {
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
  },

  getAboutText: function(patient) {
    var patientInfo = personUtils.patientInfo(patient) || {};
    return patientInfo.about;
  },

  /**
   * Given a patient object, extract the values from it
   * that needs to be displayed on the patientinfo form
   *
   * @param  {Object} patient
   * @return {Object}
   */
  formValuesFromPatient: function(patient) {
    if (!_.isPlainObject(patient) || _.isEmpty(patient)) {
      return {};
    }

    var formValues = {};
    var patientInfo = personUtils.patientInfo(patient);
    var name = personUtils.patientFullName(patient);

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
    }

    return formValues;
  },

  handleSubmit: function(e) {
    e.preventDefault();
    var formValues = this.getFormValues();

    this.setState({validationErrors: {}});

    var isNameRequired = personUtils.patientIsOtherPerson(this.props.patient);
    var validationErrors = personUtils.validateFormValues(formValues, isNameRequired,  FORM_DATE_FORMAT);

    if (!_.isEmpty(validationErrors)) {
      this.setState({
        validationErrors: validationErrors
      });
      return;
    }

    this.submitFormValues(formValues);
  },

  getFormValues: function() {
    var self = this;
    return _.reduce([
      'fullName',
      'birthday',
      'diagnosisDate',
      'diagnosisType',
      'about'
    ], function(acc, key, value) {
      if (self.refs[key]) {
        acc[key] = self.refs[key].value;
      }
      return acc;
    }, {});
  },

  submitFormValues: function(formValues) {
    formValues = this.prepareFormValuesForSubmit(formValues);

    // Save optimistically
    this.props.onUpdatePatient(formValues);
    this.toggleEdit();
  },

  prepareFormValuesForSubmit: function(formValues) {
    // Legacy: revisit when proper "child accounts" are implemented
    if (personUtils.patientIsOtherPerson(this.props.patient)) {
      formValues.isOtherPerson = true;
    }

    if (formValues.birthday) {
      formValues.birthday =  sundial.translateMask(formValues.birthday, FORM_DATE_FORMAT, SERVER_DATE_FORMAT);
    }

    if (formValues.diagnosisDate) {
      formValues.diagnosisDate = sundial.translateMask(formValues.diagnosisDate, FORM_DATE_FORMAT, SERVER_DATE_FORMAT);
    }

    if (!formValues.diagnosisType) {
      delete formValues.diagnosisType;
    }

    if (!formValues.about) {
      delete formValues.about;
    }

    var profile = _.assign({}, this.props.patient.profile, {
      patient: formValues
    });

    var result = _.assign({}, this.props.patient, {
      profile: profile
    });

    return result;
  }
}));

module.exports = PatientInfo;
