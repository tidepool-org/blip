/* global chai */
/* global describe */
/* global context */
/* global sinon */
/* global it */
/* global beforeEach */
/* global afterEach */

import React from 'react';
import { mount } from 'enzyme';
import _ from 'lodash';
import { Provider } from 'react-redux'
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';
import { components as vizComponents } from '@tidepool/viz';
const { Loader } = vizComponents;

import Gate from '../../../app/components/gate';

const expect = chai.expect;

describe('Gate', () => {
  const props = {
    onEnter: sinon.stub().callsFake((cb) => (dispatch) => {cb()}),
    children: <div className='child'></div>
  };

  let wrapper;
  beforeEach(() => {
    wrapper = mount(<Provider store={configureStore([thunk])({blip: {}})}><Gate {...props} /></Provider>);
  });
  afterEach(() => {
    props.onEnter.resetHistory();
  });

  it('should be a function', () => {
    expect(Gate).to.be.a('function');
  });

  it('should render without errors when provided all required props', () => {
    console.error = sinon.stub();

    expect(wrapper.find(Gate)).to.have.length(1);
    expect(console.error.callCount).to.equal(0);
    expect(props.onEnter.callCount).to.equal(1);
  });

  describe('render', () => {
    it('should render child', () => {
      expect(wrapper.find('.child')).to.have.length(1);
      expect(props.onEnter.callCount).to.equal(1);
    });
    it('should render loader if callback returns false', () => {
      const props = {
        onEnter: sinon.stub().callsFake((cb) => (dispatch) => {cb(false)}),
        children: <div className='child'></div>
      };
      wrapper = mount(<Provider store={configureStore([thunk])({blip: {}})}><Gate {...props} /></Provider>);
      expect(wrapper.find(Loader)).to.have.length(1);
      expect(props.onEnter.callCount).to.equal(1);
    });
  });

});
