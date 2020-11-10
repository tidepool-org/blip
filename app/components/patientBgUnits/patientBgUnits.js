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

import PropTypes from 'prop-types';

import React, { Component } from 'react';
import _ from 'lodash';

import SimpleForm from '../../components/simpleform';

import { MGDL_UNITS, MMOLL_UNITS } from '../../core/constants';
import { getSettings } from '../../core/utils';
import { togglePatientBgUnits } from '../../core/personutils';

export default class PatientBgUnits extends Component {
  static propTypes = {
    editingAllowed: PropTypes.bool.isRequired,
    onUpdatePatientSettings: PropTypes.func.isRequired,
    patient: PropTypes.object.isRequired,
    trackMetric: PropTypes.func.isRequired,
    working: PropTypes.bool.isRequired,
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
        items: this.getBgPatientUnitUsed()
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

  getBgPatientUnitUsed = () => {
    const unit = this.state.formValues.bgUnits;
    return [
      {
        label: unit,
        value: unit,
      }
    ];
  }

  handleChange = (attributes) => {
    const patientSettings = getSettings(_.get(this.props, 'patient.settings', {}));
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
