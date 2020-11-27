import _ from 'lodash';
import React from 'react';
import ReactDOM from 'react-dom';
import chai from 'chai';
import sinon from 'sinon';
import LoginNav from '../../../app/components/loginnav';

const { expect } = chai;
describe('LoginNav', function () {
  it('should be exposed as a module and be of type function', function() {
    expect(LoginNav).to.be.a('function');
  });

  describe('render', function() {
    let container = null;
    before(() => {
      try {
        // FIXME should not protect this call
        sinon.spy(console, 'error');
      } catch (e) {
        console.error = sinon.stub();
      }
    });
    after(() => {
      // @ts-ignore
      if (_.isFunction(_.get(console, 'error.restore'))) {
        // @ts-ignore
        console.error.restore();
      }
    });


    beforeEach(() => {
      container = document.createElement('div');
      document.body.appendChild(container);
    });
    afterEach(() => {
      document.body.removeChild(container);
      container = null;
      console.error.resetHistory();
    });

    it('should render without problems when required props are present', (done) => {
      const props = {
        trackMetric: sinon.stub()
      };
      ReactDOM.render(<LoginNav {...props} />, container, () => {
        try {
          const div = document.querySelector('.login-nav');
          expect(div).to.be.not.null;
          expect(console.error.callCount).to.equal(0);
          done();
        } catch (e) {
          done(e);
        }
      });
    });
  });
});
