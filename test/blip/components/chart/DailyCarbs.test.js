/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2016 Tidepool Project
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
/* global sinon */

var React = require('react');
var ReactDOM = require('react-dom');
var TestUtils = require('react-addons-test-utils');
var expect = chai.expect;

var DailyCarbs = require('../../../../plugins/blip/basics/components/chart/DailyCarbs');

describe('DailyCarbs', function () {

  it('should be a function', function() {
    expect(DailyCarbs).to.be.a('function');
  });

  describe('render', function() {
    it('should render without problem when props provided', function () {
      var props = {
        data: {
          averageDailyCarbs: 345
        }
      };

      var elem = TestUtils.renderIntoDocument(
        <DailyCarbs data={props.data} />
      );

      var compElem = TestUtils.findRenderedDOMComponentWithClass(elem, 'DailyCarbs');
      expect(compElem).to.be.ok;
    });

    it('should render with UnknownStatistic when no data provided', function () {
      console.error = sinon.stub();

      var props = {
        data: {
          averageDailyCarbs: null
        }
      };

      var elem = TestUtils.renderIntoDocument(
        <DailyCarbs data={props.data} />
      );

      var compElem = TestUtils.findRenderedDOMComponentWithClass(elem, 'DailyCarbs');
      expect(compElem).to.be.ok;
      var unknownElem = TestUtils.findRenderedDOMComponentWithClass(elem, 'UnknownStatistic');
      expect(unknownElem).to.be.ok;
    });
  });
});