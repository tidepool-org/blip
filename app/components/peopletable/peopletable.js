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
import PropTypes from 'prop-types';
import React from 'react';
import _ from 'lodash';
import sundial from 'sundial';
import WindowSizeListener from 'react-window-size-listener';
import { translate, Trans } from 'react-i18next';
import { push } from 'connected-react-router';
import { connect } from 'react-redux';
import { Flex, Box, Text } from 'rebass/styled-components';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';

import personUtils from '../../core/personutils';
import ModalOverlay from '../modaloverlay';

import Table from '../elements/Table';
import Icon from '../elements/Icon';

export const PeopleTable = translate()(class PeopleTable extends React.Component {
  constructor(props) {
    super(props);

    this.handleOverlayClick = this.handleOverlayClick.bind(this);
    this.handleRemove = this.handleRemove.bind(this);
    this.handleRemovePatient = this.handleRemovePatient.bind(this);
    this.handleToggleShowNames = this.handleToggleShowNames.bind(this);
    this.handleWindowResize = this.handleWindowResize.bind(this);
    this.handleSearchChange = this.handleSearchChange.bind(this);
    this.handleClickPwD = this.handleClickPwD.bind(this);
    this.handleClickEdit = this.handleClickEdit.bind(this);

    this.state = {
      showNames: false,
      dataList: this.buildDataList(),
      showModalOverlay: false,
      dialog: '',
      tableHeight: 590,
      search:'',
    };

    WindowSizeListener.DEBOUNCE_TIME = 50;
  }

  //nextProps contains list of people being watched
  UNSAFE_componentWillReceiveProps(nextProps) {
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
        email: _.get(person, 'emails[0]'),
      };
    });

    return list;
  }

  renderSearchBar() {
    const { t } = this.props;
    return (
      <div className="peopletable-search">
        <div className="peopletable-search-label">
          {t('Patient List')}
        </div>
        <input
          type="search"
          className="peopletable-search-box form-control-border"
          onChange={this.handleSearchChange}
          placeholder={t('Search by Name')}
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
    const { t } = this.props;
    let toggleLabel = t('Hide All');

    if (!this.state.showNames) {
      toggleLabel = t('Show All');
    }

    return (
      <div className="peopletable-names-toggle-wrapper">
        <a className="peopletable-names-toggle" disabled={this.state.search} onClick={this.handleToggleShowNames}>
          {toggleLabel}
        </a>
      </div>
    );
  }

  renderPeopleInstructions() {
    return (
      <Trans className="peopletable-instructions" i18nKey="html.peopletable-instructions">
        Type a patient name in the search box or click <a className="peopletable-names-showall" onClick={this.handleToggleShowNames}>Show All</a> to display all patients.
      </Trans>
    );
  }

  renderRemoveDialog(patient) {
    const { t } = this.props;
    const fullName = patient.fullName;
    return (
      <div className="patient-remove-dialog">
        <Trans className="ModalOverlay-content" i18nKey="html.peopletable-remove-patient-confirm">
          <p>
            Are you sure you want to remove patient: {{fullName}} from your list?
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
      this.props.onRemovePatient(patient.userid, (err) => {
        this.setState({
          showModalOverlay: false,
        });
      });

      this.props.trackMetric('Web - clinician removed patient account');
    };
  }

  handleRemove(patient) {
    return () => {
      this.setState({
        showModalOverlay: true,
        dialog: this.renderRemoveDialog(patient)
      });
    };
  }

  handleOverlayClick() {
    this.setState({
      showModalOverlay: false,
    });
  }

  handleClickPwD(link) {
    return () => {
      this.props.trackMetric('Selected PwD');
      this.props.push(link);
    }
  }

  handleClickEdit(patient) {
    return () => {
      this.props.trackMetric('Clicked Edit PwD');
      this.props.push(`/patients/${patient.userid}/profile#edit`);
    }
  }

  handleSearchChange(event) {
    this.setState({search: event.target.value});
  }

  renderPatient = ({fullName, email, link}) => {
    return (
      <Flex alignItems="center" onClick={this.handleClickPwD(link)} sx={{cursor: 'pointer', height: '2.8em'}}>
        <Box>
          <Text fontWeight="medium">{fullName}</Text>
          <Text>{email}</Text>
        </Box>
      </Flex>
    );
  }

  renderBirthday = ({birthday, link}) => (
    <Box onClick={this.handleClickPwD(link)} sx={{ cursor: 'pointer' }}>
      <Text fontWeight="medium">{birthday}</Text>
    </Box>
  ); 

  renderEdit = (patient) => (
    <Icon icon={EditIcon} label={'Edit'} variant={'button'} onClick={this.handleClickEdit(patient)} />
  );

  renderRemove = (patient) => (
    <Icon icon={DeleteIcon} label={'Remove'} variant={'button'} onClick={this.handleRemove(patient)} />
  );

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
    const columns = [
      {
        title: 'Patient',
        field: 'profile',
        align: 'left',
        sortable: true,
        sortBy: 'fullNameOrderable',
        render: this.renderPatient,
        searchable: true,
        searchBy: ['fullName', 'email'],
      },
      {
        title: 'Birthday',
        field: 'birthday',
        align: 'left',
        sortable: true,
        sortBy: 'birthdayOrderable',
        render: this.renderBirthday,
      },
      {
        title: 'Edit',
        field: 'edit',
        render: this.renderEdit,
        align: 'center',
        size: 'small',
        padding: 'checkbox',
      },
      {
        title: 'Remove',
        field: 'remove',
        render: this.renderRemove,
        align: 'center',
        size: 'small',
        padding: 'checkbox',
      },
    ];

    return (
      <Table
        id={'peopleTable'}
        label={'peopletablelabel'}
        columns={columns}
        data={this.state.dataList}
        orderBy="fullNameOrderable"
        order="asc"
        searchText={this.state.search}
        rowsPerPage={8}
        pagination={true}
      />
    );
  }

  renderPeopleArea() {
    const { showNames, search } = this.state;

    if (!showNames && !search) {
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

export default connect(null, { push })(PeopleTable);
