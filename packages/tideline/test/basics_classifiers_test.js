/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2015, Tidepool Project
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

var { MMOLL_UNITS } = require('../js/data/util/constants');

var chai = require('chai');
var assert = chai.assert;
var expect = chai.expect;

var bgClasses = {
  'very-low': {boundary: 10},
  low: {boundary: 20},
  target: {boundary: 30},
  high: {boundary: 40},
  'very-high': {boundary: 50}
};

var bgClassesMmoll = {
  'very-low': {boundary: 2},
  low: {boundary: 3},
  target: {boundary: 4},
  high: {boundary: 10},
  'very-high': {boundary: 20}
};

var classifiers = require('../plugins/blip/basics/logic/classifiers');

describe('basics classifiers', function() {
  it('should be a function', function() {
    assert.isFunction(classifiers);
  });

  it('should return an object', function() {
    assert.isObject(classifiers());
  });

  describe('basal', function() {
    var classifier = classifiers().basal;
    it('should return no tags for a scheduled basal', function() {
      expect(classifier({deliveryType: 'scheduled'})).to.deep.equal([]);
    });

    it('should return no tags for an automated basal', function() {
      expect(classifier({deliveryType: 'automated'})).to.deep.equal([]);
    });

    it('should return `temp` for a temp basal', function() {
      expect(classifier({deliveryType: 'temp'})).to.deep.equal(['temp']);
    });

    it('should return `suspended` for a temp basal', function() {
      expect(classifier({deliveryType: 'suspended'})).to.deep.equal(['suspended']);
    });
  });

  describe('bolus', function() {
    var classifier = classifiers().bolus;

    it('should return `wizard` and `correction` tags for a correction-only bolus from wizard', function() {
      expect(classifier({
        wizard: {recommended: {correction: 1.0, carb: 0, net: 1.0}},
        normal: 1.0
      })).to.deep.equal(['wizard', 'correction']);
    });

    it('should return `wizard` and `override` for an underridden bolus', function() {
      expect(classifier({
        wizard: {recommended: {correction: 1.0, carb: 2.0, net: 3.0}},
        normal: 1.5
      })).to.deep.equal(['wizard', 'underride']);
    });

    it('should return `manual`, `extended`, and `interrupted` for an interrupted non-wizard extended bolus', function() {
      expect(classifier({
        extended: 5.0,
        expectedExtended: 5.5
      })).to.deep.equal(['manual', 'interrupted', 'extended']);
    });

    it('is possible to get all tags but `manual` on a single bolus', function() {
      expect(classifier({
        extended: 1.2,
        expectedExtended: 2.0,
        wizard: {recommended: {correction: 2.5, carb: 0, net: 2.5}}
      })).to.deep.equal(['wizard', 'underride', 'correction', 'interrupted', 'extended']);
    });

    it('net recommendation is what counts for determining override', function() {
      expect(classifier({
        wizard: {recommended: {correction: 2.5, carb: 0, net: 2.2}},
        normal: 2.5
      })).to.deep.equal(['wizard', 'override', 'correction']);
    });

    it('corner case: interrupted correction zero bolus', function() {
      expect(classifier({
        wizard: {recommended: {correction: 1.0, carb: 0, net: 1.0}},
        normal: 0.0,
        expectedNormal: 1.0
      })).to.deep.equal(['wizard', 'correction', 'interrupted']);
    });

    it('corner case: interrupt an override to recommended amount', function() {
      expect(classifier({
        wizard: {recommended: {correction: 3.0, carb: 5.0, net: 7.5}},
        normal: 7.5,
        expectedNormal: 8.5
      })).to.deep.equal(['wizard', 'override', 'interrupted']);
    });

    it('corner case: good intentions count! (interrupted bolus does not automatically = override)', function() {
      expect(classifier({
        wizard: {recommended: {correction: 2.5, carb: 0, net: 2.2}},
        normal: 1.0,
        expectedNormal: 2.2
      })).to.deep.equal(['wizard', 'correction', 'interrupted']);
    });
  });

  describe('smbg', function() {
    var classifier = classifiers(bgClasses).smbg;
    var classifierMmoll = classifiers(bgClassesMmoll, MMOLL_UNITS).smbg;
    it('should classify a non-subTyped smbg as `meter`', function() {
      expect(classifier({value: 25})).to.deep.equal(['meter']);
    });

    it('should classify a `linked` smbg as `meter`', function() {
      expect(classifier({value: 25, subType: 'linked'})).to.deep.equal(['meter']);
    });

    it('should classify a `manual` smbg as `manual`', function() {
      expect(classifier({value: 25, subType: 'manual'})).to.deep.equal(['manual']);
    });

    it('should classify an smbg below the very-low threshold as `verylow`', function() {
      expect(classifier({value: 5})).to.deep.equal(['meter', 'verylow']);
    });

    it('should classify an mmol/L smbg below the very-low threshold as `verylow`', function() {
      expect(classifierMmoll({value: 1.3})).to.deep.equal(['meter', 'verylow']);
    });

    it('should not return any category tags for an in-target value', function() {
      expect(classifier({value: 25})).to.deep.equal(['meter']);
    });

    it('should not return any category tags for an in-target mmol/L value', function() {
      expect(classifierMmoll({value: 7.2})).to.deep.equal(['meter']);
    });

    it('should classify an smbg above the high threshold as `veryhigh`', function() {
      expect(classifier({value: 35})).to.deep.equal(['meter']);
      expect(classifier({value: 55})).to.deep.equal(['meter', 'veryhigh']);
    });

    it('should classify an mmol/L smbg above the high threshold as `veryhigh`', function() {
      expect(classifierMmoll({value: 8})).to.deep.equal(['meter']);
      expect(classifierMmoll({value: 22})).to.deep.equal(['meter', 'veryhigh']);
    });
  });
});
