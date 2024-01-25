/* global chai */
/* global describe */
/* global sinon */
/* global it */

var React = require('react');
import { mount } from 'enzyme';
var expect = chai.expect;

var DatePicker = require('../../../app/components/datepicker');

describe('DatePicker', function () {

  it('should be a function', function() {
    expect(DatePicker).to.be.a('function');
  });

  describe('render', function() {
    it('should render without problems', function () {
      var elem = mount(<DatePicker/>);
      expect(elem).to.be.ok;
    });
  });
});
