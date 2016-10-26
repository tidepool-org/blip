/* global chai */
/* global describe */
/* global sinon */
/* global it */

var React = require('react');
var TestUtils = require('react-addons-test-utils');
var expect = chai.expect;

import UploaderButton from '../../../app/components/uploaderbutton';

describe('UploaderButton', function () {
  it('should be a function', function() {
    expect(UploaderButton).to.be.a('function');
  });

  describe('render', function() {
    it('should render without problems', function () {
      var props = {
        buttonUrl: 'http://tidepool.org/products/tidepool-uploader/',
        buttonText: 'Get the Tidepool Uploader'
      };
      var uploaderButtonElem = React.createElement(UploaderButton, props);
      var elem = TestUtils.renderIntoDocument(uploaderButtonElem);
      expect(elem).to.be.ok;
    });
  });
});
