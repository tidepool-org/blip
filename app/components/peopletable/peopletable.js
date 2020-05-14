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
import { Link } from 'react-router';

const resetSearchImageSrc = require('./images/searchReset.png');

const TextCell = ({ rowIndex, data, col, icon, title, t, track, fullDisplayMode, ...props }) => (
  <Cell {...props}>
    <div className="peopletable-cell">
      <div className="peopletable-cell-content">
        {data[rowIndex][col]}
      </div>
      { fullDisplayMode ? (
        <div 
          onClick={
            (e) => {
              track('Selected PWD in new tab');
              e.stopPropagation()}
          } 
          className="peopletable-cell-content-svg">
          <Link 
            title={t(title, {patient: data[rowIndex][col]})} 
            to={data[rowIndex].link}  
            target="_blank">
              <svg width="1em" height="1em" viewBox="0 0 16 16" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                <path d="M9 1H4a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V8h-1v5a1 1 0 01-1 1H4a1 1 0 01-1-1V3a1 1 0 011-1h5V1z"/>
                <path fillRule="evenodd" d="M13.5 1a.5.5 0 01.5.5v2a.5.5 0 01-.5.5h-2a.5.5 0 010-1H13V1.5a.5.5 0 01.5-.5z" fillRule="evenodd"/>
                <path fillRule="evenodd" d="M13 3.5a.5.5 0 01.5-.5h2a.5.5 0 010 1H14v1.5a.5.5 0 01-1 0v-2z" fillRule="evenodd"/>
            </svg>
          </Link>
        </div>
        )
        :
        <div width="100%">&nbsp;</div> 
        }
    </div>
  </Cell>
);

TextCell.propTypes = {
  col: PropTypes.string,
  data: PropTypes.array,
  rowIndex: PropTypes.number,
  icon: PropTypes.object,
  title: PropTypes.string,
  t: PropTypes.func,
  track: PropTypes.func,
  fullDisplayMode: PropTypes.bool,
};

const MetricCell = ({ rowIndex, data, col, title, t, track, format, timezone, ...props }) => (
  <Cell {...props}>
    <div className="peopletable-cell">
      <div className="peopletable-cell-metric">
        {(timezone)?format(data[rowIndex][col], t, timezone):format(data[rowIndex][col], t)}
      </div>
    </div>
  </Cell>
);

MetricCell.propTypes = {
  col: PropTypes.string,
  data: PropTypes.array,
  rowIndex: PropTypes.number,
  title: PropTypes.string,
  t: PropTypes.func,
  track: PropTypes.func,
  format: PropTypes.func,
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
      tableWidth: 880,
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
    const list = _.map(this.props.people, (person) => {
      let pmetric = _.get(person, ['metric'], '');
      let rate = pmetric.rate;
      let tirVeryLow, tirLow, tirTarget, tirHigh, tirVeryHigh = undefined;
      if (rate) {
        tirVeryLow = pmetric.rate.veryLow;
        tirLow = pmetric.rate.low;
        tirTarget = pmetric.rate.target;
        tirHigh = pmetric.rate.high;
        tirVeryHigh = pmetric.rate.veryHigh;
      }

      return {
        fullName: personUtils.patientFullName(person),
        fullNameOrderable: (personUtils.patientFullName(person) || '').toLowerCase(),
        link: person.link,
        userid: person.userid,
        tirLastTime: pmetric.lastCbgTime || '0',
        rate: pmetric.rate,
        tirVeryLow,
        tirLow,
        tirTarget,
        tirHigh,
        tirVeryHigh
      };
    });

    return _.orderBy(list, ['fullNameOrderable'], [SortTypes.DESC]);
  }

  formatRate(rate){
    if (rate === undefined) {
      return '';
    }

    const v = Math.round((rate + Number.EPSILON) * 100) / 100
    return `${v}%`
  }

  formatDate(datetime, t, timezone) {
    if (datetime && datetime !== '0') {
      return sundial.formatInTimezone(
        datetime, 
        timezone, 
        t('MMM D, YYYY h:mm a'));
    };
    return t('No data in the last 24 hours');
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

  handleSortChange(columnKey, sortDir, track, excludedValue = undefined) {
    const split = _.partition(this.state.dataList, {[columnKey]: excludedValue});
    const sortNotExcluded = _.orderBy(split[1], [columnKey], [sortDir]);
    const sorted = _.concat(sortNotExcluded, split[0]);
    if (track) {
      let metricMessage = 'Sort by ';

      switch (columnKey) {
        case 'fullNameOrderable':
          metricMessage += 'Name';
          break;
        case 'tirLastTime': 
        case 'tirVeryLow':
        case 'tirLow':
        case 'tirTarget':
        case 'tirHigh':
        case 'tirVeryHigh':
                metricMessage += columnKey
          break;
        default:
          break;
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
    let fullDisplayMode = true;

    switch (true) {

      case (windowSize.windowWidth < 480):
        tableWidth = windowSize.windowWidth - 35;
        fullDisplayMode = false;
        break;

      case (windowSize.windowWidth < 934):
        tableWidth = windowSize.windowWidth - 75;
        break;
    }

    this.setState({
      tableWidth,
      fullDisplayMode
    });
  }

  getTirCol(list, item, label, sortDirs, t, format, width = 50, flexGrow = 0) {
    return <Column
      key={item}
      columnKey={item}
      header={
        <SortHeaderCell
          onSortChange={this.handleSortChange}
          sortDir={sortDirs[item]}
          title={t('Sort By {{name}}', {name: t(item)})}
        >
          {t(label)}
        </SortHeaderCell>
      }
      cell={<MetricCell
        className={item}
        data={list}
        col={item}
        title={item}
        t={t}
        track={this.props.trackMetric}
        format={format}
        timezone={this.props.timezone}
      />}
      width={width}
      flexGrow={flexGrow}
    />
  }

  getTirsCol(list, cols, sortDirs, t, format, width = 40, flexGrow = 0){
    let res = [];
    cols.forEach(item => {
      res.push(this.getTirCol(list, item, item, sortDirs, t, format, width, flexGrow));      
    });
    return res;
  }

  renderPeopleTable() {
    const { t } = this.props;
    const { colSortDirs, dataList, tableWidth, tableHeight, fullDisplayMode } = this.state;

    const title = t('I want to quit this patient\'s care team');
    const newTabTitle = 'open {{patient}} in a new tab';
    const labelName = t('NAME');
    return (
      <Table
        rowHeight={50}
        headerHeight={70}
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
              title={t('Sort By {{name}}', {name: labelName})}
            >
              {labelName}
            </SortHeaderCell>
        }
          cell={<TextCell
            className="fullName"
            data={dataList}
            col="fullName"
            title={newTabTitle}
            t={t}
            track={this.props.trackMetric}
            fullDisplayMode= {fullDisplayMode}
          />}
          width={50}
          flexGrow={1}
        />
        {this.getTirCol(dataList, 'tirLastTime', 'tirLastTime', colSortDirs, t, this.formatDate, 40, 1)}
        {(fullDisplayMode) ?
          this.getTirsCol(
            dataList, 
            ['tirVeryLow', 'tirLow', 'tirTarget', 'tirHigh', 'tirVeryHigh'],
            colSortDirs, 
            t, 
            this.formatRate)
          : 
          this.getTirCol(dataList, 'tirTarget', 'tirTarget', colSortDirs, t, this.formatRate)
          }

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
  timezone: PropTypes.string.isRequired,
};

export default PeopleTable;
