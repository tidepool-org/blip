
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
import _ from 'lodash';
import cx from 'classnames';
import { translate } from 'react-i18next';

var personUtils = require('../../core/personutils');
var PatientCard = require('../../components/patientcard');

var PeopleList = translate()(React.createClass({
  propTypes: {
    people: React.PropTypes.array,
    uploadUrl: React.PropTypes.string,
    onClickPerson: React.PropTypes.func,
    onRemovePatient: React.PropTypes.func,
    trackMetric: React.PropTypes.func.isRequired,
  },

  getInitialState: function() {
    return {
      editing: false
    };
  },

  getDefaultProps: function() {
    return {
      onClickPerson: function() {}
    };
  },

  render: function() {
    var peopleNodes = [];
    if (!_.isEmpty(this.props.people)) {

      // first sort by fullName
      var sortedPeople = _.sortBy(this.props.people, function(person) {
        var patient = _.get(person, 'profile.patient', null);
        return (patient && patient.isOtherPerson && patient.fullName)
          ? _.get(patient, 'fullName', '').toLowerCase()
          : _.get(person, 'profile.fullName', '').toLowerCase();
      });

      // then pop the logged-in user to the top if has data
      sortedPeople = _.sortBy(sortedPeople, function(person) {
        if (!_.isEmpty(person.permissions)) {
          if (person.permissions.root) {
            return 1;
          }
          else {
            return 2;
          }
        }
        return 2;
      });

      peopleNodes = _.map(sortedPeople, this.renderPeopleListItem);
    }

    var classes = cx({
      'people-list': true,
      'list-group': true,
      'people-list-single': (this.props.people && this.props.people.length === 1)
    });

    var removeControls = this.removeablePersonExists(this.props.people) ? this.renderRemoveControls() : null;

    return (
      <div>
        <ul className={classes}>
          {peopleNodes}
          <div className="clear"></div>
        </ul>
        {removeControls}
      </div>
    );

  },

  removeablePersonExists: function(patients) {
    return Boolean(_.find(patients, personUtils.isRemoveable));
  },

  renderRemoveControls: function() {
    const { t } = this.props;
    var key = 'edit';
    var text = t('Remove People');
    if (this.state.editing) {
      key = 'cancel';
      text = t('Done');
    }

    return (
      <div className="patient-list-controls">
        <button key={key} onClick={this.toggleEdit} className="patient-list-controls-button patient-list-controls-button--secondary" type="button">{text}</button>
      </div>
    );
  },

  toggleEdit: function() {
    this.setState({
      editing: !this.state.editing,
    });
  },

  renderPeopleListItem: function(person, index) {
    var peopleListItemContent;
    var displayName = this.getPersonDisplayName(person);
    var self = this;
    var handleClick = function() {
      self.props.onClickPerson(person);
    };

    return (
      <li key={person.userid || index} className="patient-list-item">
        <PatientCard
          href={person.link}
          onClick={handleClick}
          uploadUrl={this.props.uploadUrl}
          isEditing={this.state.editing}
          onRemovePatient={this.props.onRemovePatient}
          patient={person}
          trackMetric={this.props.trackMetric}></PatientCard>
      </li>
    );
  },

  getPersonDisplayName: function(person) {
    const { t } = this.props;
    var fullName;
    fullName = personUtils.patientFullName(person);

    if (!fullName) {
      return t('Anonymous user');
    }

    return fullName;
  }
}));

module.exports = PeopleList;
