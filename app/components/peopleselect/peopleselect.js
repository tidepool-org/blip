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

import React from 'react';
import _ from 'lodash';
import cx from 'classnames';
import Select from 'react-select';
import sundial from 'sundial';

import personUtils from '../../core/personutils';
 
const PeopleSelect = React.createClass({
  propTypes: {
    people: React.PropTypes.array,
    onClickPerson: React.PropTypes.func,
    onRemovePatient: React.PropTypes.func,
    trackMetric: React.PropTypes.func.isRequired,
  },
  handleOnChange: function(userId) {
    this.props.onClickPerson( _.find(this.props.people, { 'userid': userId }));
  },
  valueRenderer: function(option) {
    var user =  _.find(this.props.people, { 'userid': option.value });
    var name = personUtils.patientFullName(user);
    var bday = _.get(user, ['profile', 'patient', 'birthday'], '');

    var formattedBday;
    if (bday) {
      formattedBday = sundial.translateMask(bday, 'YYYY-MM-DD', 'M/D/YYYY');
    }

    var formattedLastUpload = 'TODO:';

    return (
      <div className="optionLabelWrapper">
        <div className="optionLabelName">
          {name}
        </div>
        <div className="optionLabelBirthday">
          {formattedBday}
        </div>
        <div className="optionLabelLastUpload">
          {formattedLastUpload}
        </div>
      </div>
    );
  },
  renderSelector: function(){
    var allUsers = this.props.people;
    var sorted = _.sortBy(allUsers, function(person) {
      var patient = _.get(person, 'profile.patient', null);
      return (patient && patient.isOtherPerson && patient.fullName) ?
        patient.fullName.toLowerCase() : person.profile.fullName.toLowerCase();
    });

    var selectorOpts = _.map(sorted, function(person) {
      var bday = _.get(person, ['profile', 'patient', 'birthday'], '');
      if(bday){
        bday = ' ' + sundial.translateMask(bday, 'YYYY-MM-DD', 'M/D/YYYY');
      }
      var fullName = personUtils.patientFullName(person);
      return {value: person.userid, label: fullName + bday};
    });

    return (
      <Select
        name={'patientSelect'}
        placeholder={'Search'}
        className="Select"
        clearable={false}
        simpleValue={true}
        options={selectorOpts}
        matchProp={'label'} //NOTE: we only want to match on the label!
        optionRenderer={this.valueRenderer}
        valueRenderer={this.valueRenderer}
        onChange={this.handleOnChange}
      />
    );
  },
  render: function() {
    return (
      <div className="wrap">
        <div className="wrapInner">
          <div className="clinicUserDropdown">
            {this.renderSelector()}
          </div>
        </div>
      </div>
    );
  }
});

module.exports = PeopleSelect;
