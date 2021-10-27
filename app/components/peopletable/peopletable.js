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
import { Box, Text, Flex } from 'rebass/styled-components';
import DeleteIcon from '@material-ui/icons/Delete';
import EditIcon from '@material-ui/icons/Edit';
import SearchIcon from '@material-ui/icons/Search';
import CloseRoundedIcon from '@material-ui/icons/CloseRounded';

import personUtils from '../../core/personutils';
import Button from '../elements/Button';
import Icon from '../elements/Icon';
import Table from '../elements/Table';
import TextInput from '../elements/TextInput';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '../elements/Dialog';

import {
  Title,
  MediumTitle,
  Body1,
} from '../elements/FontStyles';

export const PeopleTable = translate()(class PeopleTable extends React.Component {
  constructor(props) {
    super(props);

    this.handleCloseOverlay = this.handleCloseOverlay.bind(this);
    this.handleRemove = this.handleRemove.bind(this);
    this.handleRemovePatient = this.handleRemovePatient.bind(this);
    this.handleToggleShowNames = this.handleToggleShowNames.bind(this);
    this.handleWindowResize = this.handleWindowResize.bind(this);
    this.handleSearchChange = this.handleSearchChange.bind(this);
    this.handleClearSearch = this.handleClearSearch.bind(this);
    this.handleClickPwD = this.handleClickPwD.bind(this);
    this.handleClickEdit = this.handleClickEdit.bind(this);

    this.state = {
      showNames: false,
      dataList: this.buildDataList(),
      showModalOverlay: false,
      tableHeight: 590,
      search:'',
      selectedPatient: null,
    };

    WindowSizeListener.DEBOUNCE_TIME = 50;
  }

  //nextProps contains list of people being watched
  UNSAFE_componentWillReceiveProps(nextProps) {
    //Watches for an update to the user list, if a clinician accepts an invitation then updates the visable user list
    if (nextProps.people !== this.props.people) {
      this.setState( {dataList: this.buildDataList(nextProps)} );
    }
  }

  buildDataList(props = this.props) {
    const { t } = props;

    return _.map(props.people, (person) => {
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
  }

  renderHeader() {
    const { t, layout } = this.props;
    const isTabLayout = layout === 'tab';
    const hiddenStyles = { visibility: 'hidden', height: 0 };

    return (
      <Flex mb={4} alignItems="center" justifyContent="space-between">
        {!isTabLayout && (
          <Title pt={4} pr={4}>
            {t('Patients')}
          </Title>
        )}

        <Flex
          alignItems="center"
          flexDirection="row"
          justifyContent="space-between"
          flexGrow={isTabLayout ? 1 : 0}
          pt={isTabLayout ? 0 : 4}
        >
          <TextInput
            themeProps={{
              width: 'auto',
              minWidth: '250px',
              mr: isTabLayout ? 0 : 2,
            }}
            id="patients-search"
            placeholder={t('Search by Name')}
            icon={!_.isEmpty(this.state.search) ? CloseRoundedIcon : SearchIcon}
            iconLabel={t('Search by Name')}
            onClickIcon={!_.isEmpty(this.state.search) ? this.handleClearSearch : null}
            name="search-prescriptions"
            onChange={this.handleSearchChange}
            value={this.state.search}
            variant="condensed"
          />

          <Button
            id="patients-view-toggle"
            variant={isTabLayout ? 'primary' : 'textSecondary'}
            disabled={!_.isEmpty(this.state.search)}
            onClick={this.handleToggleShowNames}
          >
            <Text sx={this.state.showNames ? hiddenStyles : undefined}>{t('Show All')}</Text>
            <Text sx={this.state.showNames ? undefined : hiddenStyles}>{t('Hide All')}</Text>
          </Button>
        </Flex>
      </Flex>
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

  renderPeopleInstructions() {
    return (
      <Trans className="peopletable-instructions" i18nKey="html.peopletable-instructions">
        Type a patient name in the search box or click <a className="peopletable-names-showall" onClick={this.handleToggleShowNames}>Show All</a> to display all patients.
      </Trans>
    );
  }

  renderRemoveDialog() {
    const { t } = this.props;
    const fullName = this.state.selectedPatient?.fullName;

    return (
      <Dialog
        id="deleteUser"
        aria-labelledBy="dialog-title"
        open={this.state.showModalOverlay}
        onClose={this.handleCloseOverlay}
      >
        <DialogTitle onClose={this.handleCloseOverlay}>
          <MediumTitle id="dialog-title">{t('Remove {{name}}', { name: fullName })}</MediumTitle>
        </DialogTitle>

        <DialogContent>
          <Trans className="ModalOverlay-content" i18nKey="html.peopletable-remove-patient-confirm">
            <Body1>
              Are you sure you want to remove patient: {{fullName}} from your list?
            </Body1>
            <Body1>
              You will no longer be able to see or comment on their data.
            </Body1>
          </Trans>
        </DialogContent>

        <DialogActions>
          <Button id="patientRemoveCancel" variant="secondary" onClick={this.handleCloseOverlay}>
            {t('Cancel')}
          </Button>
          <Button
            id="patientRemoveConfirm"
            variant="danger"
            onClick={this.handleRemovePatient(this.state.selectedPatient)}
          >
            {t('Remove')}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  handleRemovePatient(patient) {
    return () => {
      this.props.onRemovePatient(patient.userid, (err) => {
        this.handleCloseOverlay();
      });

      const metric = this.props.selectedClinicId
        ? ['Blip - Clinic - Remove patient confirmed', { clinicId: this.props.selectedClinicId }]
        : ['Web - clinician removed patient account'];

      this.props.trackMetric(...metric);
    };
  }

  handleRemove(patient) {
    return () => {
      if (this.props.selectedClinicId) {
        this.props.trackMetric('Clinic - Remove patient', { clinicId: this.props.selectedClinicId });
      }

      this.setState({
        showModalOverlay: true,
        selectedPatient: patient,
      });
    };
  }

  handleCloseOverlay() {
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
      const metric = this.props.selectedClinicId
        ? ['Clinic - Edit patient info', { clinicId: this.props.selectedClinicId }]
        : ['Clicked Edit PwD'];

      this.props.trackMetric(...metric);
      this.props.push(`/patients/${patient.userid}/profile#edit`);
    }
  }

  handleSearchChange(event) {
    this.setState({search: event.target.value});
  }

  handleClearSearch(event) {
    this.setState({search: ''});
  }

  renderPatient = ({fullName, email, link}) => (
    <Box onClick={this.handleClickPwD(link)} sx={{ cursor: 'pointer' }}>
      <Text fontWeight="medium">{fullName}</Text>
      <Text>{email || '\u00A0'}</Text>
    </Box>
  );

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
    const { t } = this.props;
    const columns = [
      {
        title: t('Patient'),
        field: 'profile',
        align: 'left',
        sortable: true,
        sortBy: 'fullNameOrderable',
        render: this.renderPatient,
        searchable: true,
        searchBy: ['fullName', 'email'],
      },
      {
        title: t('Birthday'),
        field: 'birthday',
        align: 'left',
        sortable: true,
        sortBy: 'birthdayOrderable',
        render: this.renderBirthday,
      },
      {
        title: t('Edit'),
        field: 'edit',
        render: this.renderEdit,
        align: 'center',
        size: 'small',
        padding: 'checkbox',
      },
    ];

    if (_.isFunction(this.props.onRemovePatient)) columns.push({
      title: t('Remove'),
      field: 'remove',
      render: this.renderRemove,
      align: 'center',
      size: 'small',
      padding: 'checkbox',
    });

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
        style={{fontSize:'14px'}}
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
        {this.renderHeader()}
        {this.renderPeopleArea()}
        {this.renderRemoveDialog()}
        <WindowSizeListener onResize={this.handleWindowResize} />
      </div>
    );
  }
});

PeopleTable.defaultProps = {
  layout: 'page',
};

PeopleTable.propTypes = {
  people: PropTypes.array,
  trackMetric: PropTypes.func.isRequired,
  onRemovePatient: PropTypes.func,
  selectedClinicId: PropTypes.string,
  layout: PropTypes.oneOf(['page', 'tab']).isRequired,
};

export default connect(null, { push })(PeopleTable);
