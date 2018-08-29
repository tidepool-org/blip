/* global chai */
/* global describe */
/* global sinon */
/* global it */

var React = require('react');
var TestUtils = require('react-addons-test-utils');
var expect = chai.expect;
import { shallow } from 'enzyme';
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
        trackMetric: function() {}
      };
      var navbarElem = React.createElement(NavbarPatientCard, props);
      var elem = TestUtils.renderIntoDocument(navbarElem);

      expect(elem).to.be.ok;
      expect(console.error.callCount).to.equal(0);
    });

    it('should render upload button if user is root', function() {
      let props = {
        permsOfLoggedInUser: rootUser.permsOfLoggedInUser,
        patient: rootUser.patient,
        t,
      };
      let wrapper = shallow(<NavbarPatientCard.WrappedComponent {...props} />);
      expect(wrapper.contains('Upload')).to.equal(true);
    });

    it('should render upload button if user is care team member with upload permissions', function() {
      let props = {
        permsOfLoggedInUser: careTeamMemberUpload.permsOfLoggedInUser,
        patient: careTeamMemberUpload.patient,
        t,
      };
      let wrapper = shallow(<NavbarPatientCard.WrappedComponent {...props} />);
      expect(wrapper.contains('Upload')).to.equal(true);
    });

    it('should not render upload button if user is care team member without upload permissions', function() {
      let props = {
        permsOfLoggedInUser: careTeamMemberNoUpload.permsOfLoggedInUser,
        patient: careTeamMemberNoUpload.patient,
        t,
      };
      let wrapper = shallow(<NavbarPatientCard.WrappedComponent {...props} />);
      expect(wrapper.contains('Upload')).to.equal(false);
    });
  });
});
