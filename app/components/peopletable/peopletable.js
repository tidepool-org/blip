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
import { Table, Column, Cell } from 'fixed-data-table-2';
import sundial from 'sundial';
import { browserHistory } from 'react-router';
import Dimensions from 'react-dimensions';

import personUtils from '../../core/personutils';

const SortTypes = {
  ASC: 'asc',
  DESC: 'desc',
};

function reverseSortDirection(sortDir) {
  return sortDir === SortTypes.DESC ? SortTypes.ASC : SortTypes.DESC;
}

class SortHeaderCell extends React.Component {
  constructor(props) {
    super(props);
    this._onSortChange = this._onSortChange.bind(this);
  }

  render() {
    const {onSortChange, sortDir, children, ...props} = this.props;
    let sortDirectionClass = 'peopletable-search-icon';

    if (sortDir === SortTypes.DESC ) {
      sortDirectionClass += ' icon-arrow-down';
    } else if (sortDir === SortTypes.ASC) {
      sortDirectionClass += ' icon-arrow-up';
    }

    return (
      <Cell {...props}>
        <a onClick={this._onSortChange}>
          {children} <i className={sortDirectionClass}></i>
        </a>
      </Cell>
    );
  }

  _onSortChange(e) {
    e.preventDefault();

    if (this.props.onSortChange) {
      this.props.onSortChange(
        this.props.columnKey,
        this.props.sortDir ?
          reverseSortDirection(this.props.sortDir) :
          SortTypes.DESC
      );
    }
  }
}

const TextCell = ({rowIndex, data, col, icon, ...props}) => (
  <Cell {...props}>
    {data[rowIndex][col]}
    {icon}
  </Cell>
);

class PeopleTable extends React.Component {
  constructor(props) {
    super(props);

    this._onSortChange = this._onSortChange.bind(this);
    this._onFilterChange = this._onFilterChange.bind(this);
    this._onToggleShowNames = this._onToggleShowNames.bind(this);
    this._onRowClick = this._onRowClick.bind(this);
    this._rowClassNameGetter = this._rowClassNameGetter.bind(this);
    this._onRowMouseEnter = this._onRowMouseEnter.bind(this);
    this._onRowMouseLeave = this._onRowMouseLeave.bind(this);

    this.state = {
      currentRowIndex: -1,
      searching: false,
      showNames: false,
      dataList: this.buildDataList(),
      colSortDirs: {
        'fullName': SortTypes.DESC,
      },
    };

    this._onSortChange('fullName',SortTypes.DESC);
  }

  buildDataList(){
    const list = _.map(this.props.people, function(person) {
      let bday = _.get(person, ['profile', 'patient', 'birthday'], '');
      if(bday){
        bday = ' ' + sundial.translateMask(bday, 'YYYY-MM-DD', 'M/D/YYYY');
      }
      return {
        fullName: personUtils.patientFullName(person),
        link: person.link,
        birthday: bday,
        birthdayDate: new Date(bday),
        lastUpload: 'last upload',
      };
    });
    return _.sortByOrder(list, 'fullName', SortTypes.DESC);
  }

  _onFilterChange(e) {
    if (_.isEmpty(e.target.value)) {
      this.setState({
        searching: false,
        dataList: this.buildDataList(),
      });
      return;
    }

    const filterBy = e.target.value.toLowerCase();

    const filtered = _.filter(this.state.dataList, function(person) {
      return person.fullName.toLowerCase().indexOf(filterBy) !== -1;
    });

    this.setState({
      searching: true,
      dataList: filtered,
    });
  }

  _onSortChange(columnKey, sortDir) {

    const sorted = _.sortByOrder(this.state.dataList, columnKey, sortDir);

    let metricMessage = 'Sort by ';

    if (columnKey === 'fullName'){
      metricMessage += 'Name';
    } else if (columnKey === 'birthdayDate'){
      metricMessage += 'Birthday';
    } else {
      metricMessage += 'Last Upload';
    }

    metricMessage += ' '+sortDir;

    this.props.trackMetric(metricMessage);

    this.setState({
      dataList: sorted,
      colSortDirs: {
        [columnKey]: sortDir,
      },
    });
  }

  renderSearchBar() {
    return (
      <div className='peopletable-search'>
        <div className='peopletable-search-label'>
          Patient List
        </div>
        <input
          className='peopletable-search-box'
          onChange={this._onFilterChange}
          placeholder='Search'
        />
      </div>
    );
  }

  _onToggleShowNames() {
    this.setState({ showNames: !this.state.showNames });
  }

  renderShowNamesToggle() {
    let toggleLabel = 'Hide All';

    if (!this.state.showNames){
      toggleLabel = 'Show All';
    }

    this.props.trackMetric('Clicked '+toggleLabel);

    return (
      <div className='peopletable-names-toggle'>
        <a onClick={this._onToggleShowNames}>
          {toggleLabel}
        </a>
      </div>
    );
  }

  _rowClassNameGetter(rowIndex) {
    if (rowIndex === this.state.currentRowIndex) {
      return 'peopletable-active-row';
    }
  }

  _onRowClick(e, rowIndex){
    this.props.trackMetric('Selected PwD');
    browserHistory.push(this.state.dataList[rowIndex].link);
  }

  _onRowMouseEnter(e, rowIndex){
    this.setState({ currentRowIndex: rowIndex });
  }

  _onRowMouseLeave(e, rowIndex){
    this.setState({ currentRowIndex: -1 });
  }

  render() {
    const {colSortDirs, showNames, searching} = this.state;
    const {containerHeight, containerWidth, ...props} = this.props;
    let {dataList} = this.state;

    if (!showNames && !searching) {
      dataList = [];
    }

    return (
      <div>
        {this.renderSearchBar()}
        {this.renderShowNamesToggle()}
        <Table
          rowHeight={40}
          headerHeight={50}
          width={containerWidth}
          height={containerHeight}
          rowsCount={dataList.length}
          rowClassNameGetter={this._rowClassNameGetter}
          onRowClick={this._onRowClick}
          onRowMouseEnter={this._onRowMouseEnter}
          onRowMouseLeave={this._onRowMouseLeave}
          {...this.props}>
          <Column
            columnKey='fullName'
            header={
              <SortHeaderCell
                onSortChange={this._onSortChange}
                sortDir={colSortDirs.fullName}>
                NAME
              </SortHeaderCell>
            }
            cell={<TextCell data={dataList} col='fullName' icon={<i className="peopletable-icon-profile icon-profile"></i>} />}
            width={540}
            flexGrow={1}
          />
          <Column
            columnKey='birthdayDate'
            header={
              <SortHeaderCell
                onSortChange={this._onSortChange}
                sortDir={colSortDirs.birthdayDate}>
                BIRTHDAY
              </SortHeaderCell>
            }
            cell={<TextCell data={dataList} col='birthday' />}
            width={220}
            flexGrow={1}
          />
          <Column
            columnKey='lastUpload'
            header={
              <SortHeaderCell
                onSortChange={this._onSortChange}
                sortDir={colSortDirs.lastUpload}>
                LAST UPLOAD
              </SortHeaderCell>
            }
            cell={<TextCell data={dataList} col='lastUpload' />}
            width={120}
            flexGrow={1}
          />
        </Table>
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

module.exports = Dimensions()(PeopleTable);
 