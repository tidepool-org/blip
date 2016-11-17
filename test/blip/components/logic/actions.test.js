/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2016, Tidepool Project
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

/* global sinon */

var chai = require('chai');
var assert = chai.assert;
var expect = chai.expect;

var basicsActions = require('../../../../plugins/blip/basics/logic/actions');

describe('actions', function() {

  var app = {
    state: {
      sections: {
        'tst': { id: 'tst section', open: false },
        'tst2': { id: 'tst2 section', open: true }
      }
    },
    setState: sinon.stub()
  };

  beforeEach(function() {
    basicsActions.bindApp(app);
  });

  describe('toggleSection', function() {
    it('should track opened metric', function() {
      var trackMetric = sinon.stub();
      expect(trackMetric.callCount).to.equal(0);
      basicsActions.toggleSection('tst', trackMetric);
      expect(trackMetric.callCount).to.equal(1);
      expect(trackMetric.calledWith('tst section was opened')).to.be.true;
    });
    it('should track closed metric', function() {
      var trackMetric = sinon.stub();
      expect(trackMetric.callCount).to.equal(0);
      basicsActions.toggleSection('tst2', trackMetric);
      expect(trackMetric.callCount).to.equal(1);
      expect(trackMetric.calledWith('tst2 section was closed')).to.be.true;
    });
  });
});