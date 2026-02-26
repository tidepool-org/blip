/* global afterEach, before, chai, describe, it, sinon */

import React from 'react';
import { render, fireEvent } from '@testing-library/react';

import Footer from '../../../app/components/footer/';

const expect = chai.expect;

describe('Footer', () => {
  const props = {
    trackMetric: sinon.spy(),
  };

  afterEach(() => {
    props.trackMetric.resetHistory();
  });

  describe('render', () => {
    it('should render four links', () => {
      const { container } = render(<Footer {...props} />);
      expect(container.querySelectorAll('a').length).to.equal(4);
    });
  });

  describe('interactions', () => {
    const links = [{
      id: 'twitter',
      metric: 'Twitter',
    }, {
      id: 'facebook',
      metric: 'Facebook',
    }, {
      id: 'support',
      metric: 'Support',
    }, {
      id: 'legal',
      metric: 'PP and TOU',
    }];

    links.forEach((link) => {
      it(`a#${link.id} should fire the trackMetric function when clicked`, () => {
        const { container } = render(<Footer {...props} />);
        const linkEl = container.querySelector(`#${link.id}`);
        expect(linkEl).to.not.be.null;
        expect(props.trackMetric.callCount).to.equal(0);
        fireEvent.click(linkEl);
        expect(props.trackMetric.callCount).to.equal(1);
        expect(props.trackMetric.firstCall.args[0]).to.equal(`Clicked Footer ${link.metric}`);
      });
    });
  });
});
