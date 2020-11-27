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
var TestUtils = require('react-dom/test-utils');
var expect = chai.expect;

var InfusionHoverDisplay = require('../../../../../plugins/blip/basics/components/day/hover/InfusionHoverDisplay');

describe('InfusionHoverDisplay', function () {
  beforeEach(function() {
    this.props = {
      data: {
        "dataByDate": {
          "2017-01-01": {
            "type": "siteChange",
            "count": 1,
            "data": [
              {
                "clockDriftOffset": 0,
                "conversionOffset": 0,
                "deviceId": "tandem544890473649",
                "deviceTime": "2017-01-01T13:03:55",
                "guid": "3e4c881a-de93-4d5b-a30a-8c5ce0f05d84",
                "id": "cnqahrb55mn143g1tua8btdfe4mq2t47",
                "payload": {
                  "logIndices": [
                    43966
                  ]
                },
                "primeTarget": "cannula",
                "subType": "prime",
                "time": "2017-01-01T18:03:55.000Z",
                "timezoneOffset": -300,
                "type": "deviceEvent",
                "uploadId": "upid_6e9e5afac47c",
                "volume": 1,
                "deviceSerialNumber": "1",
                "source": "Tandem",
                "normalTime": "2017-01-01T18:03:55.000Z",
                "displayOffset": -300
              }
            ],
            "daysSince": 1
          },
        },
      },
      date: '2017-01-01',
      trackMetric: sinon.stub(),
    };
  });

  it('should be a function', function() {
    expect(InfusionHoverDisplay).to.be.a('function');
  });

  describe('render and track metric', function() {
    it('should render without problem when props provided', function () {
      expect(this.props.trackMetric.callCount).to.equal(0);

      var elem = React.createElement(InfusionHoverDisplay, this.props);
      var renderedElem = TestUtils.renderIntoDocument(elem);

      var compElem = TestUtils.findRenderedDOMComponentWithClass(renderedElem, 'Calendar-day-reservoirChange-times');
      expect(compElem).to.be.ok;

      expect(this.props.trackMetric.callCount).to.equal(1);
      expect(this.props.trackMetric.calledWith('Hovered over Infusion Site')).to.be.true;
    });
  });
});
