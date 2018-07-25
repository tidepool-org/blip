/* global chai */
/* global describe */
/* global sinon */
/* global it */

var React = require('react');
var TestUtils = require('react-addons-test-utils');
var expect = chai.expect;
import { shallow } from 'enzyme';

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
      let wrapper = shallow(<NavbarPatientCard  patient={rootUser.patient} permsOfLoggedInUser={rootUser.permsOfLoggedInUser}/>);
        expect(wrapper.contains('Upload')).to.equal(true);
    });

    it('should render upload button if user is care team member with upload permissions', function() {
      let wrapper = shallow(<NavbarPatientCard  patient={careTeamMemberUpload.patient} permsOfLoggedInUser={careTeamMemberUpload.permsOfLoggedInUser}/>);
      expect(wrapper.contains('Upload')).to.equal(true);
    });

    it('should not render upload button if user is care team member without upload permissions', function() {
      let wrapper = shallow(<NavbarPatientCard  patient={careTeamMemberNoUpload.patient} permsOfLoggedInUser={careTeamMemberNoUpload.permsOfLoggedInUser}/>);
      expect(wrapper.contains('Upload')).to.equal(false);
    });
  });
});
