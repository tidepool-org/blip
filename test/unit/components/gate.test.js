/* global chai */
/* global describe */
/* global context */
/* global sinon */
/* global it */
/* global beforeEach */
/* global afterEach */

import React from 'react';
import { render, screen } from '@testing-library/react';
import _ from 'lodash';
import { Provider } from 'react-redux'
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import Gate from '../../../app/components/gate';

const expect = chai.expect;

describe('Gate', () => {
  const props = {
    onEnter: sinon.stub().callsFake((cb) => (dispatch) => {cb()}),
    children: <div className='child'>child</div>
  };

  let rendered;
  beforeEach(() => {
    rendered = render(
      <Provider store={configureStore([thunk])({blip: {}})}>
        <Gate {...props} />
      </Provider>
    );
  });
  afterEach(() => {
    props.onEnter.resetHistory();
  });

  it('should be a function', () => {
    expect(Gate).to.be.a('function');
  });

  it('should render without errors when provided all required props', () => {
    const consoleErrorStub = sinon.stub(console, 'error');
    try {
      expect(screen.getByText('child')).to.exist;
      expect(consoleErrorStub.callCount).to.equal(0);
      expect(props.onEnter.callCount).to.equal(1);
    } finally {
      consoleErrorStub.restore();
    }
  });

  describe('render', () => {
    it('should render child', () => {
      expect(screen.getByText('child')).to.exist;
      expect(props.onEnter.callCount).to.equal(1);
    });
    it('should render loader if callback returns false', () => {
      const loadingProps = {
        onEnter: sinon.stub().callsFake((cb) => (dispatch) => {cb(false)}),
        children: <div className='child'>child</div>
      };
      rendered.unmount();
      const loadingRender = render(
        <Provider store={configureStore([thunk])({blip: {}})}>
          <Gate {...loadingProps} />
        </Provider>
      );

      expect(loadingRender.queryByText('child')).to.not.exist;
      expect(loadingProps.onEnter.callCount).to.equal(1);
    });
  });

});
