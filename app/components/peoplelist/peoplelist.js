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
var cx = require('react/lib/cx');

var personUtils = require('../../core/personutils');
var PersonCard = require('../../components/personcard');
var PatientCard = require('../../components/patientcard');

var PeopleList = React.createClass({
  propTypes: {
    people: React.PropTypes.array,
    isPatientList: React.PropTypes.bool,
    onClickPerson: React.PropTypes.func,
    uploadUrl: React.PropTypes.string,
    onRemovePatient: React.PropTypes.func
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
    var peopleNodes = _.map(this.props.people, this.renderPeopleListItem);

    this.props.people = _.sortBy(_.sortBy(this.props.people, 'fullname'), function(person) {

      if (_.isEmpty(person.permissions) === false){
        if (person.permissions.root) {
          return 1;
        }
        if (person.permissions.admin) {
          return 2;
        }
        if (person.permissions.upload) {
          return 3;
        }
      }
      return 4;
    });

    peopleNodes = _.map(this.props.people, this.renderPeopleListItem);

    var classes = cx({
      'people-list': true,
      'list-group': true,
      'people-list-single': this.props.people.length === 1
    });

    var editControls = this.editablePersonExists(this.props.people) ? this.renderEditControls() : null;

      /* jshint ignore:start */
    return (
      <div>
        <ul className={classes}>
          {peopleNodes}
          <div className="clear"></div>
        </ul>
        {editControls}
      </div>
    );
    /* jshint ignore:end */
  },

  editablePersonExists: function(patients) {
    return Boolean(_.find(patients, personUtils.hasEditPermissions));
  },

  renderEditControls: function() {
    var key = 'edit';
    var text = 'Remove People';
    if (this.state.editing) {
      key = 'cancel';
      text = 'Done';
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
    var handleClick;

    if (this.props.isPatientList) {
      handleClick = function() {
        self.props.onClickPerson(person);
      };

      /* jshint ignore:start */
      return (
        <li key={person.userid || index} className="patient-list-item">
          <PatientCard
            href={person.link}
            onClick={handleClick}
            uploadUrl={this.props.uploadUrl}
            isEditing={this.state.editing}
            onRemovePatient={this.props.onRemovePatient}
            patient={person}></PatientCard>
        </li>
      );
      /* jshint ignore:end */
    }

    if (person.link) {
      handleClick = function() {
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
