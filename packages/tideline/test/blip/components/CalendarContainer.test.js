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

/* jshint esversion:6 */

/* global describe */
/* global it */
/* global expect */
/* global before */
/* global beforeEach */
/* global afterEach */
/* global after */
/* global sinon */
/* global chai */

var expect = chai.expect;
var { DEFAULT_BG_BOUNDS, MGDL_UNITS, BG_CLAMP_THRESHOLD } = require('../../../js/data/util/constants');

const React = require('react');
const _ = require('lodash');
const { mount } = require('enzyme');
const CalendarContainer = require('../../../plugins/blip/basics/components/CalendarContainer');

describe('CalendarContainer', () => {
  const data = {
    basals: {
      summary: {
        basal: {
          total: 4,
        },
      },
    },
  };

  var props = {
    bgClasses: {
      'very-low': {
        boundary: DEFAULT_BG_BOUNDS[MGDL_UNITS].veryLow,
      },
      'low': {
        boundary: DEFAULT_BG_BOUNDS[MGDL_UNITS].targetLower,
      },
      'target': {
        boundary: DEFAULT_BG_BOUNDS[MGDL_UNITS].targetUpper,
      },
      'high': {
        boundary: DEFAULT_BG_BOUNDS[MGDL_UNITS].veryHigh,
      },
      'very-high': {
        boundary: BG_CLAMP_THRESHOLD[MGDL_UNITS],
      },
    },
    bgUnits: 'mg/dL',
    data,
    chart: sinon.stub(),
    days: [
      {
        date: new Date().toISOString(),
      },
    ],
    hasHover: false,
    onSelectDay: sinon.stub(),
    sectionId: 'basals',
    settingsTogglable: false,
    selectorOptions: {
      primary: {
        key: 'basal',
        path: 'basal',
        average: true,
      },
      rows: [
        [
          {
            key: 'suspended',
            path: 'basal',
            average: true,
          },
        ],
      ],
    },
    timezone: 'UTC',
    type: 'basals',
    title: 'Basals',
    trackMetric: sinon.stub(),
  };

  let wrapper;
  let selectSubtotalSpy;

  before(() => {
    selectSubtotalSpy = sinon.stub(CalendarContainer.prototype.actions, 'selectSubtotal');
  });

  beforeEach(() => {
    wrapper = mount(<CalendarContainer {...props} />);
  });

  afterEach(() => {
    selectSubtotalSpy.reset();
  });

  after(() => {
    selectSubtotalSpy.restore();
  });

  describe('componentWillMount', () => {
    it('should set an alternative selected option with a value if the current one has no value', () => {
      sinon.assert.callCount(selectSubtotalSpy, 0);

      wrapper.setProps({
        data: _.assign({}, data, {
          basals: {
            summary: {
              basal: {
                total: 0,
                suspended: {
                  count: 2,
                },
              },
            },
          },
        }),
      });

      wrapper.unmount().mount();

      sinon.assert.callCount(selectSubtotalSpy, 1);
      sinon.assert.calledWith(selectSubtotalSpy, props.sectionId, 'suspended');
    });
  });
});
