import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Flex } from 'rebass/styled-components'
import { translate } from 'react-i18next';
import ChevronLeftRoundedIcon from '@material-ui/icons/ChevronLeftRounded';

import _ from 'lodash';

import personUtils from '../../core/personutils';
import NavbarPatientCard from '../navbarpatientcard';
import WorkspaceSwitcher from '../clinic/WorkspaceSwitcher';
import NavigationMenu from './NavigationMenu';
import Button from '../elements/Button';

import logoSrc from './images/tidepool-logo-408x46.png';
export default translate()(class extends React.Component {
  static propTypes = {
    clinicFlowActive: PropTypes.bool,
    currentPage: PropTypes.string,
    user: PropTypes.object,
    fetchingUser: PropTypes.bool,
    patient: PropTypes.object,
    fetchingPatient: PropTypes.bool,
    getUploadUrl: PropTypes.func,
    onLogout: PropTypes.func,
    trackMetric: PropTypes.func.isRequired,
    permsOfLoggedInUser: PropTypes.object,
    selectedClinicId: PropTypes.string,
  };

  state = {
    showDropdown: false,
  };

  render() {
    const { t } = this.props;
    const patientListLink = this.props.clinicFlowActive && this.props.selectedClinicId ? '/clinic-workspace/patients' : '/patients';
    const showPatientListLink = personUtils.isClinicianAccount(this.props.user) && /^\/patients\/.*\/(profile|data)/.test(this.props.currentPage);

    return (
      <>
        <Flex
          className="Navbar"
          flexWrap="wrap"
          justifyContent={['center', 'space-between']}
          alignItems="center"
          sx={{ minHeight: '60px' }}
        >
          {this.renderLogoSection()}
          {this.renderMiddleSection()}
          {this.renderMenuSection()}
        </Flex>

        {showPatientListLink && (
          <Link className="static" to={patientListLink}>
            <Button
              variant="textSecondary"
              icon={ChevronLeftRoundedIcon}
              iconPosition='left'
              id="patientListLink"
            >
              {t('Back to Patient List')}
            </Button>
          </Link>
        )}
      </>
    );
  }

  renderLogoSection = () => {
    return (
      <div className="Navbar-logoSection">
        {this.renderLogo()}
      </div>
    );
  };

  renderLogo = () => {
    var self = this;
    var handleClick = function() {
      self.props.trackMetric('Clicked Navbar Logo');
    };

    return (
      <Link
        to="/"
        className="Navbar-logo"
        onClick={handleClick}>
        <img src={logoSrc}/>
      </Link>
    );
  };

  getPatientLink = (patient) => {
    if (!patient || !patient.userid) {
      return '';
    }

    return '/patients/' + patient.userid + '/data';
  };

  renderMiddleSection = () => {
    var patient = this.props.patient;

    if (_.isEmpty(patient)) {
      if (
        _.includes([
          '/patients',
          '/clinic-admin',
          '/prescriptions',
          '/clinic-invite',
          '/clinic-workspace',
          '/clinic-workspace/patients',
          '/clinic-workspace/invites',
          '/clinic-workspace/prescriptions',
          '/clinician-edit'
        ], this.props.currentPage) && personUtils.isClinicianAccount(this.props.user)
      ) {
        return (
          <Flex flex={1} alignItems="center" justifyContent="center">
            <WorkspaceSwitcher api={this.props.api} trackMetric={this.props.trackMetric} />
          </Flex>
        );
      }
      return <div className="Navbar-patientSection"></div>;
    }

    patient.link = this.getPatientLink(patient);

    return (
      <div className="Navbar-patientSection" ref="patient">
        <NavbarPatientCard
          href={patient.link}
          currentPage={this.props.currentPage}
          uploadUrl={this.props.getUploadUrl()}
          patient={patient}
          permsOfLoggedInUser={this.props.permsOfLoggedInUser}
          trackMetric={this.props.trackMetric} />
      </div>
    );
  };

  toggleDropdown = (e) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }

    this.setState({showDropdown: !this.state.showDropdown});
  };

  stopPropagation = (e) => {
    e.stopPropagation();
  };

  hideDropdown = () => {
    if (this.state.showDropdown) {
      this.setState({showDropdown: false});
    }
  };

  renderMenuSection = () => {
    const {user} = this.props;

    if (_.isEmpty(user)) {
      return <div className="Navbar-menuSection"></div>;
    }

    var self = this;
    var handleClickUser = function() {
      self.props.trackMetric('Clicked Navbar Logged In User');
      self.setState({showDropdown: false});
    };

    var handleCareteam = function() {
      self.props.trackMetric('Clicked Navbar CareTeam');
    };

    return (
      <Flex flex={1} justifyContent="flex-end">
        <NavigationMenu api={this.props.api} />
      </Flex>
    );
  };

  getUserDisplayName = () => {
    return personUtils.fullName(this.props.user);
  };

  isSamePersonUserAndPatient = () => {
    return personUtils.isSame(this.props.user, this.props.patient);
  };

  handleLogout = (e) => {
    this.setState({showDropdown: false});

    if (e) {
      e.preventDefault();
    }

    var logout = this.props.onLogout;
    if (logout) {
      logout();
    }
  };
});
