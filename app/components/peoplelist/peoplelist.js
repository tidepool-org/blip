/** @jsx React.DOM */
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

var React = require('react');
var _ = require('lodash');

var personUtils = require('../../core/personutils');
var PersonCard = require('../../components/personcard');
var PatientCard = require('../../components/patientcard');

var PeopleList = React.createClass({
  propTypes: {
    people: React.PropTypes.array,
    isPatientList: React.PropTypes.bool,
    onClickPerson: React.PropTypes.func
  },

  getDefaultProps: function() {
    return {
      onClickPerson: function() {}
    };
  },

  render: function() {
    var peopleNodes = _.map(this.props.people, this.renderPeopleListItem);

    /* jshint ignore:start */
    return (
      <ul className="people-list list-group">
        {peopleNodes}
      </ul>
    );
    /* jshint ignore:end */
  },

  renderPeopleListItem: function(person, index) {
    var peopleListItemContent;
    var displayName = this.getPersonDisplayName(person);

    if (this.props.isPatientList) {
      var self = this;
      var handleClick = function() {
        self.props.onClickPerson(person);
      };
      /* jshint ignore:start */
      peopleListItemContent = (
        <PatientCard
          href={person.link}
          onClick={handleClick}
          patient={person}></PatientCard>
      );
      /* jshint ignore:end */
    } else if (person.link) {
      var self = this;
      var handleClick = function() {
        self.props.onClickPerson(person);
      };
      /* jshint ignore:start */
      peopleListItemContent = (
        <PersonCard
          href={person.link}
          onClick={handleClick}>{displayName}</PersonCard>
      );
      /* jshint ignore:end */
    }
    else {
      /* jshint ignore:start */
      peopleListItemContent = (
        <PersonCard>{displayName}</PersonCard>
      );
      /* jshint ignore:end */
    }

    /* jshint ignore:start */
    return (
      <li key={person.userid || index} className="people-list-item">
        {peopleListItemContent}
      </li>
    );
    /* jshint ignore:end */
  },

  getPersonDisplayName: function(person) {
    var fullName;

    if (this.props.isPatientList) {
      fullName = personUtils.patientFullName(person);
    }
    else {
      fullName = personUtils.fullName(person);
    }

    if (!fullName) {
      return 'Anonymous user';
    }

    return fullName;
  }
});

module.exports = PeopleList;
