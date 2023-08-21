import React from 'react';
import { Link } from 'react-router-dom';
import PropTypes from 'prop-types';
import { Flex, Box } from 'rebass/styled-components'
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
    const { t, query } = this.props;
    let patientListLink = this.props.clinicFlowActive && this.props.selectedClinicId ? '/clinic-workspace/patients' : '/patients';
    if (query.dashboard) patientListLink = `/dashboard/${query.dashboard}`;

    const linkText = query.dashboard
      ? t('Back to Dashboard')
      : t('Back to Patient List')

    const isDashboardView = /^\/dashboard\//.test(this.props.currentPage);

    const showPatientListLink = personUtils.isClinicianAccount(this.props.user) && (
      /^\/patients\/.*\/(profile|data)/.test(this.props.currentPage) ||
      isDashboardView
    );

    return (
      <>
        <Flex
          className="Navbar"
          flexWrap="wrap"
          justifyContent={['center', 'space-between']}
          alignItems="center"
        >
          <Box flex={1} minWidth={['100%', '100%', '33%']} py={[3, 3, 4]}>
            {this.renderLogoSection()}
          </Box>

          <Box flex={1} order={[3, 2]} minWidth={['100%', '50%', '33%']} py={1}>
            {this.renderMiddleSection()}
          </Box>

          <Box flex={1} order={[2, 3]} minWidth={['100%', '50%', '33%']} py={1}>
            {this.renderMenuSection()}
          </Box>
        </Flex>

        {showPatientListLink && (
          <Link className="static" to={patientListLink}>
            <Button
              variant="textSecondary"
              icon={ChevronLeftRoundedIcon}
              iconPosition='left'
              id="patientListLink"
              onClick={() => this.props.trackMetric('Clinic - View patient list', {
                clinicId: this.props.selectedClinicId,
                source: isDashboardView ? 'Dashboard' : 'Patient data',
              })}
              sx={{ display: 'inline-flex !important' }}
            >
              {linkText}
            </Button>
          </Link>
        )}
      </>
    );
  }

  renderLogoSection = () => {
    return (
      <Flex className="Navbar-logoSection" justifyContent={['center', 'flex-start']}>
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

    if (this.props.clinicFlowActive) {
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
          '/clinician-edit',
        ], this.props.currentPage) && personUtils.isClinicianAccount(this.props.user)
      ) {
        return (
          <WorkspaceSwitcher api={this.props.api} trackMetric={this.props.trackMetric} />
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
