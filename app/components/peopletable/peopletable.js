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

import { SortHeaderCell, SortTypes } from './sortheadercell';

import personUtils from '../../core/personutils';

const TextCell = ({ rowIndex, data, col, icon, ...props }) => (
  <Cell {...props}>
    {data[rowIndex][col]}
    {icon}
  </Cell>
);

TextCell.propTypes = {
  data: React.PropTypes.array,
  rowIndex: React.PropTypes.number,
  col: React.PropTypes.string,
  icon: React.PropTypes.string,
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
        fullNameOrderable: SortTypes.DESC,
      },
    };
  }

  componentDidMount() {
    this.handleSortChange('fullNameOrderable', SortTypes.DESC);
  }

  buildDataList() {
    const list = _.map(this.props.people, (person) => {
      let bday = _.get(person, ['profile', 'patient', 'birthday'], '');
      if (bday) {
        bday = ` ${sundial.translateMask(bday, 'YYYY-MM-DD', 'M/D/YYYY')}`;
      }
      return {
        fullName: personUtils.fullName(person),
        fullNameOrderable: personUtils.fullName(person).toLowerCase(),
        link: person.link,
        birthday: bday,
        birthdayOrderable: new Date(bday),
        lastUpload: 'None',
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

    const filtered = _.filter(this.state.dataList, (person) => {
      return person.fullName.toLowerCase().indexOf(filterBy) !== -1;
    });

    this.setState({
      searching: true,
      dataList: filtered,
    });
  }

  handleSortChange(columnKey, sortDir) {
    const sorted = _.sortByOrder(this.state.dataList, [columnKey], [sortDir]);

    let metricMessage = 'Sort by ';

    if (columnKey === 'fullNameOrderable') {
      metricMessage += 'Name';
    } else if (columnKey === 'birthdayOrderable') {
      metricMessage += 'Birthday';
    } else {
      metricMessage += 'Last Upload';
    }

    metricMessage += ` ${sortDir}`;

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
      <div className="peopletable-search">
        <div className="peopletable-search-label">
          Patient List
        </div>
        <input
          className="peopletable-search-box"
          onChange={this.handleFilterChange}
          placeholder="Search"
        />
      </div>
    );
  }

  handleToggleShowNames() {
    this.setState({ showNames: !this.state.showNames });
  }

  renderShowNamesToggle() {
    let toggleLabel = 'Hide All';

    if (!this.state.showNames) {
      toggleLabel = 'Show All';
    }

    this.props.trackMetric(`Clicked ${toggleLabel}`);

    return (
      <div className="peopletable-names-toggle">
        <a onClick={this.handleToggleShowNames}>
          {toggleLabel}
        </a>
      </div>
    );
  }

  getRowClassName(rowIndex) {
    if (rowIndex === this.state.currentRowIndex) {
      return 'peopletable-active-row';
    }
    return '';
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

  render() {
    const { colSortDirs, showNames, searching } = this.state;
    const { containerHeight, containerWidth } = this.props;
    let { dataList } = this.state;

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
            width={540}
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
            cell={<TextCell data={dataList} col="birthday" />}
            width={220}
          />
          <Column
            columnKey="lastUpload"
            header={
              <SortHeaderCell
                onSortChange={this.handleSortChange}
                sortDir={colSortDirs.lastUpload}
              >
                LAST UPLOAD
              </SortHeaderCell>
            }
            cell={<TextCell data={dataList} col="lastUpload" />}
            width={120}
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

module.exports = PeopleTable;
