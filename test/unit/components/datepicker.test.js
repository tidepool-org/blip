/* global chai */
/* global describe */
/* global sinon */
/* global it */

import React from 'react';
import TestUtils from 'react-dom/test-utils';
var expect = chai.expect;

var DatePicker = require('../../../app/components/datepicker');

describe('DatePicker', function () {

  it('should be a function', function() {
    expect(DatePicker).to.be.a('function');
  });

  describe('render', function() {
    it('should render without problems', function () {
      var elem = TestUtils.renderIntoDocument(<DatePicker/>);
      expect(elem).to.be.ok;
    });
  });
});
