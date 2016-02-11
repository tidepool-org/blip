/* global chai */
/* global sinon */
/* global describe */
/* global it */

import React from 'react';
import _ from 'lodash';
import TestUtils from 'react-addons-test-utils';

// Need to add this line as app.js includes config
// which errors if window.config does not exist
//window.config = {};
 
import api from '../../../app/core/api';
import personUtils from '../../../app/core/personutils';
import mock from '../../../mock';

import { AppComponent } from '../../../app/components/app/app.js';

var expect = chai.expect;

describe('App',  () => {
  api.log = sinon.stub();

  var childContext = {
    route: {
      log: sinon.stub(),
      api: mock.patchApi(api),
      personUtils: personUtils,
      DEBUG: false,
      trackMetric: sinon.stub(),
      config: {}
    },
    location: {
      pathname: '/'
    }
  };

  describe('render', () => {
    it('should render without problems',  () => {
      console.error = sinon.stub();
      console.error = sinon.stub();
      
      var elem = TestUtils.renderIntoDocument(<AppComponent {...childContext} />);
      expect(elem).to.be.ok;
      expect(console.error.callCount).to.equal(0);
      expect(console.error.callCount).to.equal(0);
      var app = TestUtils.findRenderedDOMComponentWithClass(elem, 'app');
      expect(app).to.be.ok;
    });

    it('authenticated state should be false on boot',  () => {
      var elem = TestUtils.renderIntoDocument(<AppComponent {...childContext} />);
      expect(elem.state.authenticated).to.equal(false);
    });

    it('timezoneAware should be false and timeZoneName should be null', () => {
      var elem = TestUtils.renderIntoDocument(<AppComponent {...childContext} />);
      expect(elem.state.timePrefs.timezoneAware).to.equal(false);
      expect(elem.state.timePrefs.timezoneName).to.equal(null);
    });

    it('bgUnits should be mg/dL', () => {
      var elem = TestUtils.renderIntoDocument(<AppComponent {...childContext} />);
      expect(elem.state.bgPrefs.bgUnits).to.equal('mg/dL');
    });

    it('should render footer',  () => {
      var elem = TestUtils.renderIntoDocument(<AppComponent {...childContext} />);
      var footer = TestUtils.findRenderedDOMComponentWithClass(elem, 'footer');
      expect(footer).to.be.ok;
    });

    it('should not render a version element when version not set in config',  () => {
      var props = _.clone(childContext);
      props.route.config = { VERSION : null };
      var elem = TestUtils.renderIntoDocument(<AppComponent {...props} />);
      var versionElems = TestUtils.scryRenderedDOMComponentsWithClass(elem, 'Navbar-version');
      expect(versionElems.length).to.equal(0);
    });

    it('should render version when version present in config',  () => {
      var props = _.clone(childContext);
      props.route.config = { VERSION : 1.4 };
      var elem = TestUtils.renderIntoDocument(<AppComponent {...props} />);
      var elem = TestUtils.renderIntoDocument(<AppComponent {...childContext} />);
      var versionElems = TestUtils.scryRenderedDOMComponentsWithClass(elem, 'Navbar-version');
      expect(versionElems.length).to.equal(1);
    });
  });
});