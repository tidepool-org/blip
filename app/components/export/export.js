/**
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
 */

import React, { Component } from 'react';
import _ from 'lodash';
import cx from 'classnames';
import moment from 'moment-timezone';
import { translate, Trans } from 'react-i18next';

const JS_DATE_FORMAT = 'YYYY-MM-DD';

export default translate()(class Export extends Component {
  static propTypes = {
    api: React.PropTypes.object.isRequired,
    patient: React.PropTypes.object.isRequired,
  };

  constructor(props) {
    super(props);

    const endDate = moment().format(JS_DATE_FORMAT);
    this.state = {
      allTime: false,
      endDate,
      startDate: moment(endDate)
        .subtract(30, 'd')
        .format(JS_DATE_FORMAT),
      anonymizeData: false,
      format: 'json',
      extraExpanded: false,
      error: false,
    };

    this.handleInputChange = this.handleInputChange.bind(this);
    this.handleSubmit = this.handleSubmit.bind(this);
    this.toggleOptions = this.toggleOptions.bind(this);
  }

  handleSubmit(event) {
    event.preventDefault();
    this.setState({ error: null });
    let options = _.pick(this.state, [
      'endDate',
      'startDate',
      'anonymizeData',
      'format',
    ]);
    if (this.state.allTime) {
      options = _.omit(options, ['endDate', 'startDate']);
    } else {
      options.endDate = moment.utc(this.state.endDate).toISOString();
      options.startDate = moment.utc(this.state.startDate).toISOString();
    }

    this.props.api.tidepool.getExportDataURL(
      this.props.patient.userid,
      options,
      (err, url) => {
        if (err) {
          this.setState({ error: err });
          return;
        }
        let a = document.createElement('a');
        a.style = 'display: none';
        document.body.appendChild(a);
        a.href = url;
        a.click();
        a.remove();
      }
    );
  }

  handleInputChange(event) {
    const target = event.target;
    let value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    if (name === 'startDate') {
      if (moment(value).isAfter(this.state.endDate)) {
        value = this.state.endDate;
      }
    }
    if (name === 'endDate') {
      if (moment(value).isBefore(this.state.startDate)) {
        value = this.state.startDate;
      }
      if (moment(value).isAfter(moment())) {
        value = moment().format(JS_DATE_FORMAT);
      }
    }
    

    this.setState({
      [name]: value
    });
  }

  toggleOptions() {
    this.setState({
      extraExpanded: !this.state.extraExpanded
    });
  }

  setDateRange(range) {
    const endDate = moment().format(JS_DATE_FORMAT);
    const startDate = moment(endDate)
      .subtract(range, 'd')
      .format(JS_DATE_FORMAT);
    this.setState({
      allTime: false,
      endDate,
      startDate,
    });
  }

  render() {
    /* TODO: for upcoming export service support of anonymization
    const extraClassnames = cx({
      hidden: !this.state.extraExpanded,
      'Export-optionEntry': true
    });
    const norgieClasses = cx({
      norgie: true,
      opened: this.state.extraExpanded,
    });
    */

    let errDisplay = null;
    if (this.state.error) {
      errDisplay = (
        <div className="Export-error">
          <div className="Export-error-title">
            An error occured attempting to export your data. This may be
            temporary and you can try the export again. If the error continues,
            please contact support.
          </div>
          <div className="Export-error-details">
            Details:{' '}
            {this.state.error.message
              ? this.state.error.message
              : this.state.error.toString()}
          </div>
        </div>
      );
    }
    return (
      <div className="Export">
        <form onSubmit={this.handleSubmit}>
          <div className="Export-dates">
            <div>Export my data from:</div>
            <input
              name="startDate"
              type="date"
              disabled={this.state.allTime}
              value={this.state.startDate}
              onChange={this.handleInputChange}
            />
            <div> to </div>
            <input
              name="endDate"
              type="date"
              disabled={this.state.allTime}
              value={this.state.endDate}
              onChange={this.handleInputChange}
            />
          </div>

          <div>
            <a onClick={() => this.setState({ allTime: true })}>All Data</a> |
            <a onClick={() => this.setDateRange(90)}>Last 90 Days</a> |
            <a onClick={() => this.setDateRange(30)}>Last 30 Days</a> |
            <a onClick={() => this.setDateRange(14)}>Last 14 Days</a>
          </div>

          <div className="Export-filetype">
            File type:
            <input
              name="format"
              type="radio"
              value="excel"
              checked={this.state.format === 'excel'}
              onChange={this.handleInputChange}
            />{' '}
            Excel
            <input
              name="format"
              type="radio"
              value="json"
              checked={this.state.format === 'json'}
              onChange={this.handleInputChange}
            />{' '}
            JSON
          </div>
          {/* TODO: for upcoming export service support of anonymization
          <div className="Export-extraOption">
            <div className={norgieClasses}></div>
            <a onClick={this.toggleOptions}>Optional export settings</a>
            <div className={extraClassnames}>
              <label>
                <input
                  name="anonymizeData"
                  type="checkbox"
                  checked={this.state.anonymizeData}
                  onChange={this.handleInputChange}
                />
                Anonymize my exported diabetes data
              </label>
              <div className="Export-optionDescription">This will remove personally identifying information as well as any device make, model, and serial number from the export.</div>
            </div>
          </div>
          */}
          <div className="Export-button">
            <input className="btn btn-primary" type="submit" value="Export" />
          </div>
        </form>
        {errDisplay}
      </div>
    );
  }
});
