/* global chai */
/* global describe */
/* global sinon */
/* global it */

import React from 'react';
import TestUtils from 'react-dom/test-utils';
import { shallow } from 'enzyme';
import i18next from '../../../app/core/language';
var expect = chai.expect;

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
      sinon.stub(console, 'error');
      var props = {
        href: 'foo',
        trackMetric: function() {}
      };
      var navbarElem = React.createElement(NavbarPatientCard, props);
      var elem = TestUtils.renderIntoDocument(navbarElem);

      expect(elem).to.be.ok;
      expect(console.error.callCount).to.equal(0);
      sinon.restore();
    });

    it('should render upload button if user is root', function() {
      let props = {
        permsOfLoggedInUser: rootUser.permsOfLoggedInUser,
        patient: rootUser.patient,
        t,
      };
      let wrapper = shallow(<NavbarPatientCard {...props} />);
      expect(wrapper.contains('Upload')).to.equal(true);
    });

    it('should render upload button if user is care team member with upload permissions', function() {
      let props = {
        permsOfLoggedInUser: careTeamMemberUpload.permsOfLoggedInUser,
        patient: careTeamMemberUpload.patient,
        t,
      };
      let wrapper = shallow(<NavbarPatientCard {...props} />);
      expect(wrapper.contains('Upload')).to.equal(true);
    });

    it('should not render upload button if user is care team member without upload permissions', function() {
      let props = {
        permsOfLoggedInUser: careTeamMemberNoUpload.permsOfLoggedInUser,
        patient: careTeamMemberNoUpload.patient,
        t,
      };
      let wrapper = shallow(<NavbarPatientCard {...props} />);
      expect(wrapper.contains('Upload')).to.equal(false);
    });
  });
});
