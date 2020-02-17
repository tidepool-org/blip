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
import PropTypes from 'prop-types';
import _ from 'lodash';
import cx from 'classnames';
import { Table, Column, Cell } from 'fixed-data-table-2';
import sundial from 'sundial';
import { browserHistory } from 'react-router';
import WindowSizeListener from 'react-window-size-listener';
import { translate, Trans } from 'react-i18next';

import { SortHeaderCell, SortTypes } from './sortheadercell';
import personUtils from '../../core/personutils';
import ModalOverlay from '../modaloverlay';

const resetSearchImageSrc = require('./images/searchReset.png');

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
  col: PropTypes.string,
  data: PropTypes.array,
  rowIndex: PropTypes.number,
  icon: PropTypes.object,
};

const RemoveLinkCell = ({ rowIndex, data, handleClick, title, ...props }) => (
  <Cell {...props}>
    <div onClick={(e) => e.stopPropagation()} className="peopletable-cell remove">
      <i title={title} onClick={handleClick(data[rowIndex], rowIndex)} className="peopletable-icon-remove icon-delete"></i>
    </div>
  </Cell>
);

RemoveLinkCell.propTypes = {
  data: PropTypes.array,
  rowIndex: PropTypes.number,
  handleClick: PropTypes.func,
  title: PropTypes.string.isRequired,
};

RemoveLinkCell.displayName = 'RemoveLinkCell';

const PeopleTable = translate()(class PeopleTable extends React.Component {
  constructor(props) {
    super(props);

    this.getRowClassName = this.getRowClassName.bind(this);
    this.handleFilterChange = this.handleFilterChange.bind(this);
    this.handleOverlayClick = this.handleOverlayClick.bind(this);
    this.handleRemove = this.handleRemove.bind(this);
    this.handleRemovePatient = this.handleRemovePatient.bind(this);
    this.handleRowClick = this.handleRowClick.bind(this);
    this.handleSortChange = this.handleSortChange.bind(this);
    this.handleWindowResize = this.handleWindowResize.bind(this);
    this.handleEmptySearch = this.handleEmptySearch.bind(this);

    this.state = {
      searchPattern: '',
      currentRowIndex: -1,
      searching: false,
      showNames: true,
      dataList: this.buildDataList(),
      colSortDirs: {
        fullNameOrderable: SortTypes.ASC,
      },
      showModalOverlay: false,
      dialog: '',
      tableHeight: 590,
      showSearchReset: false,
    };

    WindowSizeListener.DEBOUNCE_TIME = 50;
  }

  handleEmptySearch(e){
    this.handleFilterChange(null);
  }

  componentDidMount() {
    //setup default sorting but don't track via metrics
    this.handleSortChange('fullNameOrderable', SortTypes.ASC, false);
  }
  
  //nextProps contains list of people being watched
  componentWillReceiveProps(nextProps) {
    //Watches for an update to the user list, if a clinician accepts an invitation then updates the visable user list
    if (nextProps.people !== this.props.people) {
      this.setState( {dataList: this.buildDataList()} );
    }
  }

  buildDataList() {
    const { t } = this.props;
    const list = _.map(this.props.people, (person) => {
      let bday = _.get(person, ['profile', 'patient', 'birthday'], '');

      if (bday) {
        bday = ` ${sundial.translateMask(bday, 'YYYY-MM-DD', t('M/D/YYYY'))}`;
      }

      return {
        fullName: personUtils.patientFullName(person),
        fullNameOrderable: (personUtils.patientFullName(person) || '').toLowerCase(),
        link: person.link,
        birthday: bday,
        birthdayOrderable: new Date(bday),
        userid: person.userid,
      };
    });

    return _.orderBy(list, ['fullNameOrderable'], [SortTypes.DESC]);
  }

  handleFilterChange(e) {
    if (e === null ||_.isEmpty(e.target.value)) {
      this.setState({
        searching: false,
        dataList: this.buildDataList(),
        showSearchReset: false,
        searchPattern: '',
      });
      return;
    }

    const filterBy = e.target.value.toLowerCase();

    const filtered = _.filter(this.buildDataList(), (person) => {
      return _.get(person, 'fullName', '').toLowerCase().indexOf(filterBy) !== -1;
    });

    this.setState({
      searching: true,
      dataList: filtered,
      showSearchReset: true,
      searchPattern: e.target.value,
    });
  }

  handleSortChange(columnKey, sortDir, track) {
    const sorted = _.orderBy(this.state.dataList, [columnKey], [sortDir]);

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
    const { t } = this.props;
    return (
      <div className="peopletable-search">
        <div className="peopletable-search-label">
          {t('Patient List')}
        </div>
        <div className="peopletable-search-box form-control-border">
        <input
          type="search"
          ref="searchInput"
          className="input"
          onChange={this.handleFilterChange}
          placeholder={t('Search by Name')}
          value={this.state.searchPattern}
        />
        { 
        this.state.showSearchReset ? 
          <img
            onClick={this.handleEmptySearch}
            className="peopletable-reset-image"
            src={resetSearchImageSrc}
            title={t('Reset Search')}/> : null 
        }
        </div>
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

  renderRemoveDialog(patient) {
    const { t } = this.props;
    return (
      <div className="patient-remove-dialog">
        <Trans className="ModalOverlay-content" i18nKey="html.peopletable-remove-patient-confirm">
          <p>
            Are you sure you want to remove this patient from your list?
          </p>
          <p>
            You will no longer be able to see or comment on their data.
          </p>
        </Trans>
        <div className="ModalOverlay-controls">
          <button className="btn-secondary" type="button" onClick={this.handleOverlayClick}>
            {t('Cancel')}
          </button>
          <button className="btn btn-danger" type="submit" onClick={this.handleRemovePatient(patient)}>
          {t('Remove')}
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
        overlayClickHandler={this.handleOverlayClick} />
    );
  }

  handleRemovePatient(patient) {
    return () => {
      this.props.onRemovePatient(patient.userid, function (err) {
        this.setState({
          currentRowIndex: -1,
          showModalOverlay: false,
        });
      });

      this.props.trackMetric('Web - clinician removed patient account');
    };
  }

  handleRemove(patient, rowIndex) {
    return () => {
      this.setState({
        currentRowIndex: rowIndex,
        showModalOverlay: true,
        dialog: this.renderRemoveDialog(patient)
      });
    };
  }

  handleOverlayClick() {
    this.setState({
      showModalOverlay: false,
      currentRowIndex: -1,
    });
  }

  handleWindowResize(windowSize) {
    let tableWidth = 880;

    switch (true) {

      case (windowSize.windowWidth < 480):
        tableWidth = windowSize.windowWidth - 20;
        break;

      case (windowSize.windowWidth < 934):
        tableWidth = windowSize.windowWidth - 60;
        break;
    }

    this.setState({
      tableWidth,
    });
  }

  renderPeopleTable() {
    const { t } = this.props;
    const { colSortDirs, dataList, tableWidth, tableHeight } = this.state;

    const title = t('I want to quit this patient\'s care team');

    return (
      <Table
        rowHeight={65}
        headerHeight={50}
        width={tableWidth}
        height={tableHeight}
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
              {t('NAME')}
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
              {t('BIRTHDAY')}
            </SortHeaderCell>
          }
          cell={<TextCell
            data={dataList}
            col="birthday"
          />}
          width={120}
          flexGrow={0}
        />

        <Column
          columnKey="remove"
          cell={<RemoveLinkCell
            data={dataList}
            handleClick={this.handleRemove.bind(this)}
            title={title}
          />}
          width={30}
          flexGrow={0}
        />
      </Table>
    )
  }

  render() {
    return (
      <div>
        {this.renderSearchBar()}
        {this.renderPeopleTable()}
        {this.renderModalOverlay()}
        <WindowSizeListener onResize={this.handleWindowResize} />
      </div>
    );
  }
});

PeopleTable.propTypes = {
  people: PropTypes.array,
  trackMetric: PropTypes.func.isRequired,
  onRemovePatient: PropTypes.func.isRequired,
};

export default PeopleTable;
