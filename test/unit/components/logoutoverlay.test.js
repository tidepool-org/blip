/* global chai */
/* global describe */
/* global sinon */
/* global it */

var React = require('react');
var { render, cleanup } = require('@testing-library/react');
var expect = chai.expect;

var LogoutOverlay = require('../../../app/components/logoutoverlay');

describe('LogoutOverlay', function () {
  afterEach(function() {
    cleanup();
  });

  it('should be exposed as a module and be of type function', function() {
    expect(LogoutOverlay).to.be.a('function');
  });

  describe('render', function() {
    it('should render without problems', function () {
      const consoleErrorStub = sinon.stub(console, 'error');
      try {
        var props = {};
        var elem = React.createElement(LogoutOverlay, props);
        render(elem);
        expect(consoleErrorStub.callCount).to.equal(0);
      } finally {
        consoleErrorStub.restore();
      }
    });
  });

  describe('initial state', function() {
    it('should have fadeOut initially equal to false', function() {
      const consoleErrorStub = sinon.stub(console, 'error');
      try {
        var props = {};
        var elem = React.createElement(LogoutOverlay, props);
        const { container } = render(elem);
        const overlay = container.querySelector('.logout-overlay');

        expect(overlay).to.not.equal(null);
        expect(overlay.classList.contains('logout-overlay-fade-out')).to.equal(false);
        expect(consoleErrorStub.callCount).to.equal(0);
      } finally {
        consoleErrorStub.restore();
      }
    })
  });
});
