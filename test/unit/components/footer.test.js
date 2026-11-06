/* global afterEach, chai, describe, it, jest, sinon */

import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { thunk } from 'redux-thunk';

import Footer from '../../../app/components/footer/';

jest.mock('../../../app/redux/features/productInfo/productInfoApi');

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

  const renderFooter = (store = defaultStore) => render(
    <Provider store={store}>
      <Footer {...props} />
    </Provider>
  );

  afterEach(() => {
    props.trackMetric.resetHistory();
  });

  describe('render', () => {
    it('should render the Get Support link and the About button', () => {
      renderFooter();
      const links = screen.getAllByRole('link');

      expect(links.length).to.equal(1);
      expect(links[0].id).to.equal('support');
      expect(links[0].getAttribute('href')).to.equal('https://support.tidepool.org/');
      expect(screen.getByRole('button', { name: 'About' }).id).to.equal('about');
    });

    it('should render the About button without the Get Support link in Smart-on-FHIR mode', () => {
      renderFooter(mockStore({ blip: { smartCorrelationId: 'test-correlation-id' } }));

      expect(screen.queryByRole('button', { name: 'About' })).to.not.be.null;
      expect(screen.queryByRole('link', { name: 'Get Support' })).to.be.null;
    });
  });

  describe('interactions', () => {
    it('the Get Support link should fire the trackMetric function when clicked', () => {
      renderFooter();

      fireEvent.click(screen.getByRole('link', { name: 'Get Support' }));
      expect(props.trackMetric.callCount).to.equal(1);
      expect(props.trackMetric.firstCall.args[0]).to.equal('Clicked Footer Support');
    });

    it('the About button should fire the trackMetric function and open the About dialog', () => {
      renderFooter();
      expect(screen.queryByRole('heading', { name: 'About Tidepool' })).to.be.null;

      fireEvent.click(screen.getByRole('button', { name: 'About' }));
      expect(props.trackMetric.callCount).to.equal(1);
      expect(props.trackMetric.firstCall.args[0]).to.equal('Clicked Footer About');
      expect(screen.queryByRole('heading', { name: 'About Tidepool' })).to.not.be.null;
    });
  });
});
