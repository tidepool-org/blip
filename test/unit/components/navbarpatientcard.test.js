/* global chai */
/* global describe */
/* global sinon */
/* global it */

var React = require('react');
var TestUtils = require('react-addons-test-utils');
var expect = chai.expect;
import { shallow } from 'enzyme';

var NavbarPatientCard = require('../../../app/components/navbarpatientcard');

const rootuser = {
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

const clinicianupload = {
  patient: {
    permissions: {},
  },
  permsOfLoggedInUser: {
    note: {},
    upload: {},
    view: {},
  },
};

const cliniciannoupload = {
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
      let wrapper = shallow(<NavbarPatientCard  patient={rootuser.patient} permsOfLoggedInUser={rootuser.permsOfLoggedInUser}/>);
        expect(wrapper.contains('Upload')).to.equal(true);
    });

    it('should render upload button if user is clinician with upload permissions', function() {
      let wrapper = shallow(<NavbarPatientCard  patient={clinicianupload.patient} permsOfLoggedInUser={clinicianupload.permsOfLoggedInUser}/>);
      expect(wrapper.contains('Upload')).to.equal(true);
    });

    it('should not render upload button if use is clinician without upload permissions', function() {
      let wrapper = shallow(<NavbarPatientCard  patient={cliniciannoupload.patient} permsOfLoggedInUser={cliniciannoupload.permsOfLoggedInUser}/>);
      expect(wrapper.contains('Upload')).to.equal(false);
    });
  });
});