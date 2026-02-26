/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2017, Tidepool Project
 *
 * This program is free software; you can redistribute it and/or modify it under
 * the terms of the associated License, which is identical to the BSD 2-Clause
 * License as published by the Open Source Initiative at opensource.org.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the License for more details.
 *
 * You should have received a copy of the License along with this program; if
 * not, you can obtain one from Tidepool Project at tidepool.org.
 * == BSD2 LICENSE ==
 */
/* global chai */
/* global describe */
/* global context */
/* global sinon */
/* global it */
/* global before */
/* global after */
/* global beforeEach */
/* global afterEach */

import React from 'react';
import _ from 'lodash';
import { render, fireEvent, cleanup } from '@testing-library/react';
import { MGDL_UNITS } from '../../../../app/core/constants';

import Stats from '../../../../app/components/chart/stats';

jest.mock('@tidepool/viz', () => {
  const React = require('react');
  const actualViz = jest.requireActual('@tidepool/viz');

  return {
    ...actualViz,
    components: {
      ...actualViz.components,
      Stat: ({ id, title, isOpened, onCollapse }) => React.createElement(
        'div',
        {
          'data-testid': `stat-${id}`,
          'data-is-opened': String(isOpened),
          'data-title': title || '',
        },
        React.createElement('button', {
          'data-testid': `collapse-${id}`,
          onClick: () => onCollapse?.(true),
        }, 'collapse'),
        React.createElement('button', {
          'data-testid': `expand-${id}`,
          onClick: () => onCollapse?.(false),
        }, 'expand'),
      ),
    },
    utils: {
      ...actualViz.utils,
      stat: {
        ...actualViz.utils.stat,
        reconcileTIRDatumValues: datum => datum,
      },
    },
  };
});

const expect = chai.expect;

describe('Stats', () => {
  const baseProps = {
    bgPrefs: {
      bgClasses: {
        'very-low': {
          boundary: 60
        },
        'low': {
          boundary: 80
        },
        'target': {
          boundary: 180
        },
        'high': {
          boundary: 200
        },
        'very-high': {
          boundary: 300
        }
      },
      bgUnits: MGDL_UNITS
    },
    chartPrefs: {
      animateStats: true
    },
    chartType: 'basics',
    stats: [],
    trackMetric: sinon.stub(),
  };

  const renderStats = (overrides = {}) => render(<Stats {...baseProps} {...overrides} />);

  afterEach(() => {
    cleanup();
    localStorage.clear();
  });

  describe('render', () => {
    it('should render without errors when provided all required props', () => {
      const consoleErrorStub = sinon.stub(console, 'error');
      let container;
      try {
        ({ container } = renderStats());
        expect(container.querySelector('.Stats')).to.exist;
        expect(consoleErrorStub.callCount).to.equal(0);
      } finally {
        consoleErrorStub.restore();
      }
    });

    it('should render all provided stats', () => {
      const { container } = renderStats({
        stats: [
          { id: 'timeInRange', data: { data: [], total: { value: 100 } } },
          { id: 'averageGlucose' },
          { id: 'sensorUsage' },
          { id: 'totalInsulin' },
          { id: 'carbs' },
          { id: 'averageDailyDose' },
          { id: 'glucoseManagementIndicator' },
        ],
      });

      expect(container.querySelectorAll('.Stats > div').length).to.equal(7);

      const expectedStats = [
        'timeInRange',
        'averageGlucose',
        'sensorUsage',
        'totalInsulin',
        'carbs',
        'averageDailyDose',
        'glucoseManagementIndicator',
      ];

      _.each(expectedStats, statId => {
        expect(container.querySelector(`#Stat--${statId}`)).to.exist;
      });
    });

    describe('collapse state', () => {
      beforeEach(() => {
        baseProps.trackMetric.resetHistory();
      });

      afterEach(() => {
        baseProps.trackMetric.resetHistory();
      });

      it('should render stats with default isOpened=true and correct title when localStorage is empty', () => {
        const { getByTestId } = renderStats({
          stats: [
            {
              id: 'carbs',
              collapsible: false,
              title: 'Carbs',
              collapsedTitle: 'Carbs Collapsed',
            },
            {
              id: 'averageDailyDose',
              collapsible: true,
              title: 'Daily Dose',
              collapsedTitle: 'Daily Dose Collapsed',
            },
          ],
        });

        const carbStat = getByTestId('stat-carbs');
        expect(carbStat.getAttribute('data-is-opened')).to.equal('true');
        expect(carbStat.getAttribute('data-title')).to.equal('Carbs');

        const dailyDoseStat = getByTestId('stat-averageDailyDose');
        expect(dailyDoseStat.getAttribute('data-is-opened')).to.equal('true');
        expect(dailyDoseStat.getAttribute('data-title')).to.equal('Daily Dose');
      });

      it('should track metrics for collapse and expand clicks', () => {
        const { getByTestId } = renderStats({
          stats: [
            {
              id: 'averageDailyDose',
              collapsible: true,
              title: 'Daily Dose',
              collapsedTitle: 'Daily Dose Collapsed',
            },
          ],
        });

        const dailyDoseStat = getByTestId('stat-averageDailyDose');
        expect(dailyDoseStat.getAttribute('data-is-opened')).to.equal('true');
        sinon.assert.callCount(baseProps.trackMetric, 0);

        fireEvent.click(getByTestId('collapse-averageDailyDose'));
        sinon.assert.calledWith(baseProps.trackMetric, 'Click collapsed - Basics - averageDailyDose');

        fireEvent.click(getByTestId('expand-averageDailyDose'));
        sinon.assert.calledWith(baseProps.trackMetric, 'Click expanded - Basics - averageDailyDose');
      });
    });
  });
});
