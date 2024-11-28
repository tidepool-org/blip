import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Flex, Box } from 'theme-ui'
import { withTranslation } from 'react-i18next';
import _ from 'lodash';

import personUtils from '../../core/personutils';
import WorkspaceSwitcher from '../clinic/WorkspaceSwitcher';
import NavigationMenu from './NavigationMenu';
import tidepoolLogo from './images/tidepoolLogo.svg';
import tidepoolPlusLogo from './images/tidepool+Logo.svg';

export default withTranslation()(class extends React.Component {
  static propTypes = {
    clinicFlowActive: PropTypes.bool,
    clinics: PropTypes.array,
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
    return (
      <>
        <Flex
          className="Navbar"
          sx={{
            flexWrap: 'wrap',
            justifyContent: ['center', 'space-between'],
            alignItems: 'center',
          }}
        >
          <Box sx={{ flex: 1, minWidth: ['100%', '100%', '33%'] }} py={[3, 3, 4]}>
            {this.renderLogoSection()}
          </Box>

          <Box sx={{ order: [3, 2], flex: 1, minWidth: ['100%', '50%', '33%'] }} py={1}>
            {this.renderMiddleSection()}
          </Box>

          <Box sx={{ order: [2, 3], flex: 1, minWidth: ['100%', '50%', '33%'] }} py={1}>
            {this.renderMenuSection()}
          </Box>
        </Flex>
      </>
    );
  }

  renderLogoSection = () => {
    return (
      <Flex className="Navbar-logoSection" sx={{ justifyContent: ['center', 'flex-start'] }}>
        {this.renderLogo()}
      </Flex>
    );
  };

  renderLogo = () => {
    var self = this;
    var handleClick = function() {
      self.props.trackMetric('Clicked Navbar Logo');
    };

    let linkDisabled = false;
    let logo = tidepoolLogo;

    if (this.props.clinicFlowActive) {
      logo = tidepoolPlusLogo
      const userClinics = _.filter(_.values(this.props.clinics), ({ clinicians }) => _.has(clinicians, _.get(this.props, 'user.userid')));
      // Disable logo link if the clinician is only a member of a single clinic,
      // or is not on a clinic workspace tab, the private workspace, or the account settings page
      linkDisabled = userClinics.length < 2 || !/^(\/clinic-workspace.*|\/profile|\/patients)$/.test(this.props.currentPage);
    }

    return (
      <Link
        disabled={linkDisabled}
        to="/"
        className="Navbar-logo"
        onClick={handleClick}>
        <img src={logo}/>
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

    if (
      _.isEmpty(patient) &&
      _.includes([
        '/patients',
        '/clinic-admin',
        '/prescriptions',
        '/clinic-invite',
        '/clinic-profile',
        '/clinic-workspace',
        '/clinic-workspace/patients',
        '/clinic-workspace/invites',
        '/clinic-workspace/prescriptions',
        '/clinician-edit',
      ], this.props.currentPage) &&
      personUtils.isClinicianAccount(this.props.user)
    ) {
      return (
        <WorkspaceSwitcher api={this.props.api} trackMetric={this.props.trackMetric} />
      );
    }

    return <div className="Navbar-patientSection"></div>;
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
        <NavigationMenu api={this.props.api} trackMetric={this.props.trackMetric} />
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
