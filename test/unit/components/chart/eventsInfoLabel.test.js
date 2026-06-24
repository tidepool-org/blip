/* global chai */
/* global describe */
/* global it */
/* global afterEach */

import React from 'react';
import { cleanup, render } from '@testing-library/react';

import '../../../../app/core/language';
import EventsInfoLabel from '../../../../app/components/chart/eventsInfoLabel';

const expect = chai.expect;

describe('EventsInfoLabel', () => {
  afterEach(() => {
    cleanup();
  });

  const infoTooltip = container => container.querySelectorAll('.events-label-tooltip').length;

  it('always renders the Events label text', () => {
    const { container } = render(<EventsInfoLabel />);
    expect(container.querySelector('.events-label-container').textContent).to.equal('Events');
  });

  it('renders the info tooltip when only site-change events are in view', () => {
    const { container } = render(<EventsInfoLabel hasAlarmEventsInView={false} hasSiteChangeEventsInView={true} />);
    expect(infoTooltip(container)).to.equal(1);
  });

  it('renders the info tooltip when only alarm events are in view', () => {
    const { container } = render(<EventsInfoLabel hasAlarmEventsInView={true} hasSiteChangeEventsInView={false} />);
    expect(infoTooltip(container)).to.equal(1);
  });

  it('renders no info tooltip when neither alarms nor site changes are in view', () => {
    const { container } = render(<EventsInfoLabel hasAlarmEventsInView={false} hasSiteChangeEventsInView={false} />);
    expect(infoTooltip(container)).to.equal(0);
  });
});
