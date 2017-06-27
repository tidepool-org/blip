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
import { Table, Column, Cell } from 'fixed-data-table-2';
import sundial from 'sundial';
import moment from 'moment';
import { browserHistory } from 'react-router';
import dimensions from 'react-dimensions';

import { SortHeaderCell, SortTypes } from './sortheadercell';
import personUtils from '../../core/personutils';
import ModalOverlay from '../modaloverlay';

const TextCell = ({ rowIndex, data, col, icon, ...props }) => (
  <Cell {...props}>
    <div className="peopletable-cell">
      {icon}
      <div className="peopletable-cell-content">
        {data[rowIndex][col]}
      </div>
    </div>
  </Cell>
);

TextCell.propTypes = {
  col: React.PropTypes.string,
  data: React.PropTypes.array,
  rowIndex: React.PropTypes.number,
  icon: React.PropTypes.object,
};

const RemoveLinkCell = ({ rowIndex, data, onClick, ...props }) => (
  <Cell {...props}>
    <a onClick={(e) => e.stopPropagation()} className="peopletable-cell remove">
      <i onClick={onClick(data[rowIndex], rowIndex)} className="peopletable-icon-remove icon-delete"></i>
    </a>
  </Cell>
);

RemoveLinkCell.propTypes = {
  data: React.PropTypes.array,
  rowIndex: React.PropTypes.number,
  onClick: React.PropTypes.func,
};

class PeopleTable extends React.Component {
  constructor(props) {
    super(props);

    this.getRowClassName = this.getRowClassName.bind(this);
    this.handleSortChange = this.handleSortChange.bind(this);
    this.handleFilterChange = this.handleFilterChange.bind(this);
    this.handleRemove = this.handleRemove.bind(this);
    this.handleRemovePatient = this.handleRemovePatient.bind(this);
    this.handleRowClick = this.handleRowClick.bind(this);
    this.handleToggleShowNames = this.handleToggleShowNames.bind(this);
    this.overlayClickHandler = this.overlayClickHandler.bind(this);

    this.state = {
      currentRowIndex: -1,
      searching: false,
      showNames: false,
      dataList: this.buildDataList(),
      colSortDirs: {
        fullNameOrderable: SortTypes.ASC,
      },
      showModalOverlay: false,
      dialog: '',
    };

    // Override moment's `seconds ago` for relative time for recent uploads
    moment.localeData('en')._relativeTime.s = 'Just Now';
  }

  componentDidMount() {
    //setup default sorting but don't track via metrics
    this.handleSortChange('fullNameOrderable', SortTypes.ASC, false);
  }

  componentWillReceiveProps(nextProps) {
    this.setState({ dataList: this.buildDataList(nextProps.people) });
  }

  componentWillUnmount() {
    // Reset moment's `seconds ago` for relative time for recent uploads
    moment.localeData('en')._relativeTime.s = 'seconds';
  }

  buildDataList(people = this.props.people) {
    const list = _.map(people, (person) => {
      let bday = _.get(person, ['profile', 'patient', 'birthday'], '');
      let lastUpload = null;
      let timezone = null;
      let relativeLastUpload = '';

      if (bday) {
        bday = ` ${sundial.translateMask(bday, 'YYYY-MM-DD', 'M/D/YYYY')}`;
      }

      if (person.hasOwnProperty('lastUpload')) {
        lastUpload = _.get(person.lastUpload, ['time'], null);
        timezone = _.get(person.lastUpload, ['timezone'], null);

        if (lastUpload) {
          const now = moment.utc().tz(timezone);
          const uploadMoment = moment.utc(lastUpload).tz(timezone);
          const hideSuffix = now.diff(uploadMoment, 'seconds') < 44;
          relativeLastUpload = uploadMoment.fromNow(hideSuffix);
        } else {
          relativeLastUpload = 'Never'
        }
      }

      return {
        fullName: personUtils.patientFullName(person),
        fullNameOrderable: personUtils.patientFullName(person).toLowerCase(),
        link: person.link,
        birthday: bday,
        birthdayOrderable: new Date(bday),
        lastUpload: relativeLastUpload,
        lastUploadOrderable: lastUpload ? new Date(lastUpload) : new Date(),
        userid: person.userid,
      };
    });

    return _.sortByOrder(list, ['fullNameOrderable'], [SortTypes.DESC]);
  }

  handleFilterChange(e) {
    if (_.isEmpty(e.target.value)) {
      this.setState({
        searching: false,
        dataList: this.buildDataList(),
      });
      return;
    }

    const filterBy = e.target.value.toLowerCase();

    const filtered = _.filter(this.buildDataList(), (person) => {
      return person.fullName.toLowerCase().indexOf(filterBy) !== -1;
    });

    this.setState({
      searching: true,
      dataList: filtered,
    });
  }

  handleSortChange(columnKey, sortDir, track) {
    const sorted = _.sortByOrder(this.state.dataList, [columnKey], [sortDir]);

    if (track) {
      let metricMessage = 'Sort by ';

      if (columnKey === 'fullNameOrderable') {
        metricMessage += 'Name';
      } else if (columnKey === 'birthdayOrderable') {
        metricMessage += 'Birthday';
      } else if (columnKey === 'lastUploadOrderable') {
        metricMessage += 'Last Upload';
      }

      metricMessage += ` ${sortDir}`;
      this.props.trackMetric(metricMessage);
    }

    this.setState({
      dataList: sorted,
      colSortDirs: {
        [columnKey]: sortDir,
      },
    });
  }

  renderSearchBar() {
    return (
      <div className="peopletable-search">
        <div className="peopletable-search-label">
          Patient List
        </div>
        <input
          type="search"
          className="peopletable-search-box form-control-border"
          onChange={this.handleFilterChange}
          placeholder="Search by Name"
        />
      </div>
    );
  }

  handleToggleShowNames() {

    let toggleLabel = 'Clicked Hide All';
    if ( !this.state.showNames ){
      toggleLabel = 'Clicked Show All';
    }

    this.props.trackMetric(toggleLabel);
    this.setState({ showNames: !this.state.showNames });
  }

  renderShowNamesToggle() {
    let toggleLabel = 'Hide Names';

    if (!this.state.showNames) {
      toggleLabel = 'Show Names';
    }

    return (
      <div className="peopletable-names-toggle-wrapper">
        <a className="peopletable-names-toggle" disabled={this.state.searching} onClick={this.handleToggleShowNames}>
          {toggleLabel}
        </a>
      </div>
    );
  }

  getRowClassName(rowIndex) {
    return cx({
      'peopletable-active-row': rowIndex === this.state.currentRowIndex,
    });
  }

  handleRowClick(e, rowIndex) {
    this.props.trackMetric('Selected PwD');
    browserHistory.push(this.state.dataList[rowIndex].link);
  }

  renderPeopleInstructions() {
    return (
      <div>
        <div>
          <div className="peopletable-instructions">
            Type a patient name in the search box or click <a className="peopletable-names-showall" onClick={this.handleToggleShowNames}>Show Names</a> to display all patients.
          </div>
        </div>
      </div>
    );
  }

  renderRemoveDialog(patient) {
    return (
      <div>
        <div className="ModalOverlay-content">
          <p>
            Are you sure you want to remove this patient from your list?
          </p>
          <p>
            You will no longer be able to see or comment on thier data.
          </p>
        </div>
        <div className="ModalOverlay-controls">
          <button className="btn-secondary" type="button" onClick={this.overlayClickHandler}>
            Cancel
          </button>
          <button className="btn btn-danger" type="submit" onClick={this.handleRemovePatient(patient)}>
            Remove
          </button>
        </div>
      </div>
    );
  }

  renderModalOverlay() {
    return (
      <ModalOverlay
        show={this.state.showModalOverlay}
        dialog={this.state.dialog}
        overlayClickHandler={this.overlayClickHandler} />
    );
  }

  handleRemovePatient(patient) {
    var self = this;

    return function () {
      self.props.onRemovePatient(patient.userid, function (err) {
        self.setState({
          currentRowIndex: -1,
          showModalOverlay: false,
        });
      });

      self.props.trackMetric('Web - clinician removed patient account');
    };

  }

  handleRemove(patient, rowIndex) {
    var self = this;

    return function (e) {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      self.setState({
        currentRowIndex: rowIndex,
        showModalOverlay: true,
        dialog: self.renderRemoveDialog(patient)
      });

      return false;
    };
  }

  overlayClickHandler() {
    this.setState({
      showModalOverlay: false,
      currentRowIndex: -1,
    });
  }

  renderPeopleTable() {
    const { colSortDirs, dataList } = this.state;
    const { containerHeight, containerWidth } = this.props;

    console.log(containerWidth, containerHeight);

    return (
      <Table
        rowHeight={65}
        headerHeight={50}
        width={containerWidth}
        height={containerHeight}
        rowsCount={dataList.length}
        rowClassNameGetter={this.getRowClassName}
        onRowClick={this.handleRowClick}
        {...this.props}
      >
        <Column
          columnKey="fullNameOrderable"
          header={
            <SortHeaderCell
              onSortChange={this.handleSortChange}
              sortDir={colSortDirs.fullNameOrderable}
            >
              NAME
            </SortHeaderCell>
          }
          cell={<TextCell
            className="fullName"
            data={dataList}
            col="fullName"
            icon={<i className="peopletable-icon-profile icon-profile"></i>}
          />}
          width={20}
          flexGrow={1}
        />

        <Column
          columnKey="birthdayOrderable"
          header={
            <SortHeaderCell
              onSortChange={this.handleSortChange}
              sortDir={colSortDirs.birthdayOrderable}
            >
              BIRTHDAY
            </SortHeaderCell>
          }
          cell={<TextCell
            data={dataList}
            col="birthday"
          />}
          width={20}
          flexGrow={1}
        />

        <Column
          columnKey="lastUploadOrderable"
          header={
            <SortHeaderCell
              onSortChange={this.handleSortChange}
              sortDir={colSortDirs.lastUploadOrderable}
            >
              LAST UPLOAD
            </SortHeaderCell>
          }
          cell={<TextCell
            data={dataList}
            col="lastUpload"
          />}
          width={125}
          flexGrow={0}
        />

        <Column
          columnKey="remove"
          cell={<RemoveLinkCell
            data={dataList}
            onClick={this.handleRemove.bind(this)}
          />}
          width={30}
          flexGrow={0}
        />
      </Table>
    )
  }

  renderPeopleArea() {
    const { showNames, searching } = this.state;

    if (!showNames && !searching) {
      return this.renderPeopleInstructions();
    } else {
      return this.renderPeopleTable();
    }
  }

  render() {
    return (
      <div>
        {this.renderSearchBar()}
        {this.renderShowNamesToggle()}
        {this.renderPeopleArea()}
        {this.renderModalOverlay()}
      </div>
    );
  }
}

PeopleTable.propTypes = {
  people: React.PropTypes.array,
  trackMetric: React.PropTypes.func.isRequired,
  onRemovePatient: React.PropTypes.func.isRequired,
  containerWidth: React.PropTypes.number.isRequired,
  containerHeight: React.PropTypes.number.isRequired,
};

module.exports = dimensions({
  getHeight: function () {
    const min = 200;
    const calculated = window.innerHeight - 232;
    return (calculated < min) ? min : calculated;
  },
})(PeopleTable);
// module.exports = PeopleTable;
