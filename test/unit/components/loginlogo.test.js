/* global chai */
/* global describe */
/* global sinon */
/* global it */

var React = require('react');
var expect = chai.expect;

import { mount } from 'enzyme';
import LoginLogo from '../../../app/components/loginlogo/loginlogo';

describe('LoginLogo', function () {
  it('should be exposed as a module and be of type function', function() {
    expect(LoginLogo).to.be.a('function');
  });

  describe('render', function() {
    it('should render without problems', function () {
      console.error = sinon.stub();
      var props = {};
      var elem = React.createElement(LoginLogo, props);
      var render = mount(elem);
      expect(console.error.callCount).to.equal(0);
    });
  });
});
