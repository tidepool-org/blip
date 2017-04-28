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
import { browserHistory } from 'react-router';

import { SortHeaderCell, SortTypes } from './sortheadercell';
import personUtils from '../../core/personutils';

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

class PeopleTable extends React.Component {
  constructor(props) {
    super(props);

    this.handleSortChange = this.handleSortChange.bind(this);
    this.handleFilterChange = this.handleFilterChange.bind(this);
    this.handleToggleShowNames = this.handleToggleShowNames.bind(this);
    this.handleRowClick = this.handleRowClick.bind(this);
    this.getRowClassName = this.getRowClassName.bind(this);
    this.handleRowMouseEnter = this.handleRowMouseEnter.bind(this);
    this.handleRowMouseLeave = this.handleRowMouseLeave.bind(this);

    this.state = {
      currentRowIndex: -1,
      searching: false,
      showNames: false,
      dataList: this.buildDataList(),
      colSortDirs: {
        fullNameOrderable: SortTypes.ASC,
      },
    };
  }

  componentDidMount() {
    //setup default sorting but don't track via metrics
    this.handleSortChange('fullNameOrderable', SortTypes.ASC, false);
  }

  buildDataList() {
    const list = _.map(this.props.people, (person) => {
      let bday = _.get(person, ['profile', 'patient', 'birthday'], '');
      if (bday) {
        bday = ` ${sundial.translateMask(bday, 'YYYY-MM-DD', 'M/D/YYYY')}`;
      }

      return {
        fullName: personUtils.patientFullName(person),
        fullNameOrderable: personUtils.patientFullName(person).toLowerCase(),
        link: person.link,
        birthday: bday,
        birthdayOrderable: new Date(bday),
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
          placeholder="Search"
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
    let toggleLabel = 'Hide All';

    if (!this.state.showNames) {
      toggleLabel = 'Show All';
    }

    return (
      <div>
        <a className="peopletable-names-toggle" onClick={this.handleToggleShowNames}>
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

  handleRowMouseEnter(e, rowIndex) {
    this.setState({ currentRowIndex: rowIndex });
  }

  handleRowMouseLeave() {
    this.setState({ currentRowIndex: -1 });
  }

  renderPeopleInstructions() {
    const { containerHeight, containerWidth } = this.props;

    return (
      <div style={{width: containerWidth, height: containerHeight}}>
        <div>
          <div className="peopletable-instructions">
            Type a patient name in the search box or click <a className="peopletable-names-showall" onClick={this.handleToggleShowNames}>Show All</a> to display all patients.
          </div>
        </div>
      </div>
    );
  }

  renderPeopleTable() {
    const { colSortDirs, dataList } = this.state;
    const { containerHeight, containerWidth } = this.props;

    return (
      <Table
        rowHeight={40}
        headerHeight={50}
        width={containerWidth}
        height={containerHeight}
        rowsCount={dataList.length}
        rowClassNameGetter={this.getRowClassName}
        onRowClick={this.handleRowClick}
        onRowMouseEnter={this.handleRowMouseEnter}
        onRowMouseLeave={this.handleRowMouseLeave}
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
            data={dataList}
            col="fullName"
            icon={<i className="peopletable-icon-profile icon-profile"></i>}
          />}
          width={320}
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
          width={560}
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
      </div>
    );
  }
}

PeopleTable.propTypes = {
  people: React.PropTypes.array,
  trackMetric: React.PropTypes.func.isRequired,
  containerWidth: React.PropTypes.number.isRequired,
  containerHeight: React.PropTypes.number.isRequired,
};

module.exports = PeopleTable;
