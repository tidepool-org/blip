/* global afterEach, before, chai, describe, it, sinon, after */

import React from 'react';
import { mount } from 'enzyme';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import Footer from '../../../app/components/footer/';
import utils from '../../../app/core/utils';

const expect = chai.expect;
const mockStore = configureStore([thunk]);

describe('Footer', () => {
  let wrapper;
  let store;

  const props = {
    trackMetric: sinon.spy(),
    version: '1.0.0',
    location: '/patient'
  };

  before(() => {
    store = mockStore({
      blip: {
        smartCorrelationId: null
      }
    });
    wrapper = mount(
      <Provider store={store}>
        <Footer {...props} />
      </Provider>
    );
  });

  after(() => {
    wrapper.unmount();
  });

  afterEach(() => {
    props.trackMetric.resetHistory();
  });

  describe('render', () => {
    it('should render four links', () => {
      expect(wrapper.find('a').length).to.equal(4);
    });

    describe('in Smart-on-FHIR mode', () => {
      let smartOnFhirWrapper;

      before(() => {
        const smartOnFhirStore = mockStore({
          blip: {
            smartCorrelationId: 'test-correlation-id'
          }
        });
        smartOnFhirWrapper = mount(
          <Provider store={smartOnFhirStore}>
            <Footer {...props} />
          </Provider>
        );
      });

      after(() => {
        smartOnFhirWrapper.unmount();
      });

      it('should not render social media links', () => {
        // Should not find Twitter and Facebook links
        expect(smartOnFhirWrapper.find('a#twitter').exists()).to.be.false;
        expect(smartOnFhirWrapper.find('a#facebook').exists()).to.be.false;
      });

      it('should still render version info', () => {
        expect(smartOnFhirWrapper.find('Version').exists()).to.be.true;
      });
    });
  });

  describe('interactions', () => {
    const links = [
      { id: 'twitter', metric: 'Twitter' },
      { id: 'facebook', metric: 'Facebook' },
      { id: 'support', metric: 'Support' },
      { id: 'legal', metric: 'PP and TOU' }
    ];

    for (const link of links) {
      it(`a#${link.id} should fire the trackMetric function when clicked`, () => {
        const linkEl = wrapper.find(`a#${link.id}`);
        expect(props.trackMetric.callCount).to.equal(0);
        linkEl.simulate('click');
        expect(props.trackMetric.callCount).to.equal(1);
        expect(props.trackMetric.firstCall.args[0]).to.equal(`Clicked Footer ${link.metric}`);
      });
    }
  });
});
