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
import { Table, Column, Cell } from 'fixed-data-table';
import sundial from 'sundial';
import { Link } from 'react-router';
import { TwoOptionToggle } from '@tidepool/viz';

import personUtils from '../../core/personutils';

var SortTypes = {
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
    var {sortDir, children, ...props} = this.props;
    return (
      <Cell {...props}>
        <a onClick={this._onSortChange}>
          {children} {sortDir ? (sortDir === SortTypes.DESC ? '↓' : '↑') : ''}
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

const TextCell = ({rowIndex, data, col, ...props}) => (
  <Cell {...props}>
    {data[rowIndex][col]}
  </Cell>
);

const LinkCell = ({rowIndex, data, col, href, ...props}) => (
  <Cell {...props}>
    <Link className="peopletable-link" to={data[rowIndex][href]} >
      <div className="peopletable-fullname" title={data[rowIndex][col]}>{data[rowIndex][col]}</div>
    </Link>
  </Cell>
);

class PeopleTable extends React.Component {
  constructor(props) {
    super(props);

    this._dataList = this.buildDataList();

    this._defaultSortIndexes = [];
    for (var index = 0; index < this._dataList.length; index++) {
      this._defaultSortIndexes.push(index);
    }

    this.state = {
      searching: false,
      showNames: true,
      dataList: this._dataList,
      colSortDirs: {},
    };

    this._onSortChange = this._onSortChange.bind(this);
    this._onFilterChange = this._onFilterChange.bind(this);
    this._onToggleShowNames = this._onToggleShowNames.bind(this);
  }

  buildDataList(){
    const sorted = _.sortBy(this.props.people, function(person) {
      const patient = _.get(person, 'profile.patient', null);
      return (patient && patient.isOtherPerson && patient.fullName) ?
        patient.fullName.toLowerCase() : person.profile.fullName.toLowerCase();
    });

    return _.map(sorted, function(person) {
      let bday = _.get(person, ['profile', 'patient', 'birthday'], '');
      if(bday){
        bday = ' ' + sundial.translateMask(bday, 'YYYY-MM-DD', 'M/D/YYYY');
      }
      return {
        person: person,
        fullName: personUtils.patientFullName(person),
        link: person.link,
        birthday: bday,
        birthdayDate: new Date(bday),
        lastUpload: 'last upload',
      };
    });
  }

  _onFilterChange(e) {
    if (!e.target.value) {
      this.setState({
        searching: false,
        dataList: this._dataList,
      });
    }

    const filterBy = e.target.value.toLowerCase();

    const filtered = _.filter(this._dataList, function(o) {
      return o.fullName.toLowerCase().indexOf(filterBy) !== -1;
    });

    this.setState({
      searching: true,
      dataList: filtered,
    });
  }

  _onSortChange(columnKey, sortDir) {
    this.setState({
      dataList: _.sortByOrder(this._dataList, [columnKey], [sortDir]),
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
          className="peopletable-search-box"
          onChange={this._onFilterChange}
          placeholder="Search"
        />
      </div>
    );
  }

  _onToggleShowNames() {
    console.log('show? ',!this.state.showNames);
    this.setState({
      showNames: !this.state.showNames,
    });
  }

  renderShowNamesToggle() {

    let toggleLabel = 'Hide Names';

    if (!this.state.showNames){
      toggleLabel = 'Show Names';
    }

    return (
      <div className="peopletable-names-toggle">
        <a onClick={this._onToggleShowNames}>
          {toggleLabel}
        </a>
      </div>
    );
  }

  render() {
    let {dataList, colSortDirs, showNames, searching} = this.state;

    console.log('searching? ',searching);
    console.log('showNames? ',showNames);

    if (!showNames && !searching) {
      dataList = [];
    }

    return (
      <div>
        {this.renderSearchBar()}
        {this.renderShowNamesToggle()}
        <Table
          rowHeight={50}
          rowsCount={dataList.length}
          headerHeight={50}
          width={700}
          height={300}
          {...this.props}>
          <Column
            columnKey="fullName"
            header={
              <SortHeaderCell
                onSortChange={this._onSortChange}
                sortDir={colSortDirs.fullName}>
                Name
              </SortHeaderCell>
            }
            cell={<LinkCell data={dataList} col="fullName" href="link" />}
            fixed={true}
            width={300}
          />
          <Column
            columnKey="birthdayDate"
            header={
              <SortHeaderCell
                onSortChange={this._onSortChange}
                sortDir={colSortDirs.birthdayDate}>
                Birthday
              </SortHeaderCell>
            }
            cell={<TextCell data={dataList} col="birthday" />}
            fixed={true}
            width={200}
          />
          <Column
            columnKey="lastUpload"
            header={
              <SortHeaderCell
                onSortChange={this._onSortChange}
                sortDir={colSortDirs.lastUpload}>
                Last Upload
              </SortHeaderCell>
            }
            cell={<TextCell data={dataList} col="lastUpload" />}
            width={200}
          />
        </Table>
      </div>
    );
  }
}

PeopleTable.propTypes = {
    people: React.PropTypes.array,
};

module.exports = PeopleTable;
 