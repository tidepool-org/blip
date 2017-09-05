/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2017, Tidepool Project
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
 * == BSD2 LICENSE ==
 */

import React, { Component } from 'react';
import _ from 'lodash';

import InputGroup from '../../components/inputgroup';
import SimpleForm from '../../components/simpleform';

import { MGDL_UNITS, MMOLL_UNITS } from '../../core/constants';
import { DEFAULT_BG_SETTINGS } from '../../pages/patient/patientsettings';
import { togglePatientBgUnits } from '../../core/personutils';

export default class PatientBgUnits extends Component {
  static propTypes = {
    editingAllowed: React.PropTypes.bool.isRequired,
    onUpdatePatientSettings: React.PropTypes.func.isRequired,
    patient: React.PropTypes.object.isRequired,
    trackMetric: React.PropTypes.func.isRequired,
    working: React.PropTypes.bool.isRequired,
  };

  constructor(props) {
    super(props);

    const initialFormValues = this.getInitialFormValues();

    this.state = {
      formValues: initialFormValues,
    };
  }

  render() {
    if (!_.get(this.props, 'patient.userid')) {
      return null;
    }

    const content = this.props.editingAllowed ? this.renderForm : this.renderBgPref;

    return (
      <div className="PatientBgUnits">
        {content()}
      </div>
    );
  }

  renderBgPref = () => {
    return (
      <div className="bgUnits" children={this.state.formValues.bgUnits} />
    );
  }

  renderForm = () => {
    return (
      <SimpleForm
        formValues={this.state.formValues}
        inputs={this.getFormInputs()}
        onChange={this.handleChange}
        renderSubmit={false}
      />
    );
  }

  getFormInputs = () => {
    return [
      {
        name: 'bgUnits',
        type: 'radios',
        disabled: this.props.working,
        items: [
          {
            label: MGDL_UNITS,
            value: MGDL_UNITS,
          },
          {
            label: MMOLL_UNITS,
            value: MMOLL_UNITS,
          },
        ],
      },
    ];
  }

  getInitialFormValues = () => {
    if (this.props.patient) {
      return {
        bgUnits: _.get(this.props.patient, 'settings.units.bg', MGDL_UNITS),
      };
    }

    return {};
  }

  handleChange = (attributes) => {
    const patientSettings = _.defaultsDeep({}, _.get(this.props, 'patient.settings', {}), DEFAULT_BG_SETTINGS);
    const targetUnits = attributes.value;
    const unitsChanged = targetUnits !== patientSettings.units.bg;

    if (!unitsChanged || this.props.working) {
      return;
    }

    const newSettings = togglePatientBgUnits(patientSettings);

    if (newSettings) {
      this.props.onUpdatePatientSettings(this.props.patient.userid, newSettings);

      let formValues = _.merge({}, this.state.formValues, {
        [attributes.name]: attributes.value,
      });

      this.setState({
        formValues,
      });

      if (this.props.trackMetric) {
        const units = newSettings.units.bg.replace('/', '').toLowerCase();
        this.props.trackMetric(`web - switched to ${units}`);
      }
    }
  }
}
