/* global afterEach, before, chai, describe, it, sinon, after */

import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import Footer from '../../../app/components/footer/';

const expect = chai.expect;
const mockStore = configureStore([thunk]);

describe('Footer', () => {
  const props = {
    trackMetric: sinon.spy(),
    version: '1.0.0',
    location: '/patient'
  };

  const defaultStore = mockStore({
    blip: {
      smartCorrelationId: null
    }
  });

  afterEach(() => {
    props.trackMetric.resetHistory();
  });

  describe('render', () => {
    it('should render four links', () => {
      const { container } = render(
        <Provider store={defaultStore}>
          <Footer {...props} />
        </Provider>
      );
      expect(container.querySelectorAll('a').length).to.equal(4);
    });

    describe('in Smart-on-FHIR mode', () => {
      let smartOnFhirContainer;

      beforeEach(() => {
        const smartOnFhirStore = mockStore({
          blip: {
            smartCorrelationId: 'test-correlation-id'
          }
        });
        const { container } = render(
          <Provider store={smartOnFhirStore}>
            <Footer {...props} />
          </Provider>
        );
        smartOnFhirContainer = container;
      });

      it('should not render social media links', () => {
        // Should not find Twitter and Facebook links
        expect(smartOnFhirContainer.querySelector('a#twitter')).to.be.null;
        expect(smartOnFhirContainer.querySelector('a#facebook')).to.be.null;
      });

      it('should still render version info', () => {
        expect(smartOnFhirContainer.querySelector('.Version')).to.not.be.null;
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
        const { container } = render(
          <Provider store={defaultStore}>
            <Footer {...props} />
          </Provider>
        );
        const linkEl = container.querySelector(`#${link.id}`);
        expect(linkEl).to.not.be.null;
        expect(props.trackMetric.callCount).to.equal(0);
        fireEvent.click(linkEl);
        expect(props.trackMetric.callCount).to.equal(1);
        expect(props.trackMetric.firstCall.args[0]).to.equal(`Clicked Footer ${link.metric}`);
      });
    }
  });
});
