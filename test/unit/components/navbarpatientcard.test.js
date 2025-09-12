/* global chai */
/* global describe */
/* global sinon */
/* global it */

var React = require('react');
var expect = chai.expect;
import { mount } from 'enzyme';
import { BrowserRouter } from 'react-router-dom';
import i18next from '../../../app/core/language';

const t = i18next.t.bind(i18next);

var NavbarPatientCard = require('../../../app/components/navbarpatientcard');

const rootUser = {
  patient: {
    permissions: {
      root: {},
    },
  },
  permsOfLoggedInUser: {
    note: {},
    upload: {},
    view: {},
  },
};

const careTeamMemberUpload = {
  patient: {
    permissions: {},
  },
  permsOfLoggedInUser: {
    note: {},
    upload: {},
    view: {},
  },
};

const careTeamMemberNoUpload = {
  patient: {
    permissions: {},
  },
  permsOfLoggedInUser: {
    note: {},
    view: {},
  },
};

describe('NavbarPatientCard', function () {
  describe('render', function() {
    it('should not console.error when trackMetric set', function() {
      console.error = sinon.stub();
      var props = {
        href: 'foo',
        trackMetric: function() {},
        isSmartOnFhirMode: false,
      };
      var navbarElem = React.createElement(NavbarPatientCard, props);
      var wrapper = React.createElement(BrowserRouter, props, navbarElem);
      var elem = mount(wrapper);

      expect(elem).to.be.ok;
      expect(console.error.callCount).to.equal(0);
    });

    it('should render upload button if user is root', function() {
      let props = {
        permsOfLoggedInUser: rootUser.permsOfLoggedInUser,
        patient: rootUser.patient,
        t,
      };
      let wrapper = mount(<BrowserRouter><NavbarPatientCard.WrappedComponent {...props} /></BrowserRouter>);
      expect(wrapper.contains('Upload')).to.equal(true);
    });

    it('should render upload button if user is care team member with upload permissions', function() {
      let props = {
        permsOfLoggedInUser: careTeamMemberUpload.permsOfLoggedInUser,
        patient: careTeamMemberUpload.patient,
        t,
      };
      let wrapper = mount(<BrowserRouter><NavbarPatientCard.WrappedComponent {...props} /></BrowserRouter>);
      expect(wrapper.contains('Upload')).to.equal(true);
    });

    it('should not render upload button if user is care team member without upload permissions', function() {
      let props = {
        permsOfLoggedInUser: careTeamMemberNoUpload.permsOfLoggedInUser,
        patient: careTeamMemberNoUpload.patient,
        t,
      };
      let wrapper = mount(<BrowserRouter><NavbarPatientCard.WrappedComponent {...props} /></BrowserRouter>);
      expect(wrapper.contains('Upload')).to.equal(false);
    });

    it('should render the patient birthday when available', function() {
      let props = {
        permsOfLoggedInUser: careTeamMemberNoUpload.permsOfLoggedInUser,
        patient: {
          ...careTeamMemberNoUpload.patient,
          profile: {
            patient: {
              birthday: '2010-01-01',
            },
          },
        },
        t,
      };
      let wrapper = mount(<BrowserRouter><NavbarPatientCard.WrappedComponent {...props} /></BrowserRouter>);
      expect(wrapper.find('.patientcard-dateOfBirth')).to.have.lengthOf(1);
      expect(wrapper.contains('January 1, 2010')).to.equal(true);
    });

    it('should not render the patient birthday when malformed', function() {
      let props = {
        permsOfLoggedInUser: careTeamMemberNoUpload.permsOfLoggedInUser,
        patient: {
          ...careTeamMemberNoUpload.patient,
          profile: {
            patient: {
              birthday: 'badBirthday',
            },
          },
        },
        t,
      };
      let wrapper = mount(<BrowserRouter><NavbarPatientCard.WrappedComponent {...props} /></BrowserRouter>);
      expect(wrapper.find('.patientcard-dateOfBirth')).to.have.lengthOf(0);
    });

    it('should not render the patient birthday when not provided', function() {
      let props = {
        permsOfLoggedInUser: careTeamMemberNoUpload.permsOfLoggedInUser,
        patient: {
          ...careTeamMemberNoUpload.patient,
          profile: {
            patient: {
              birthday: undefined,
            },
          },
        },
        t,
      };
      let wrapper = mount(<BrowserRouter><NavbarPatientCard.WrappedComponent {...props} /></BrowserRouter>);
      expect(wrapper.find('.patientcard-dateOfBirth')).to.have.lengthOf(0);
    });
  });
});
