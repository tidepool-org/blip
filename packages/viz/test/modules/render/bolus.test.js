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

import * as boluses from '../../../data/bolus/fixtures';
import { detail } from '../../helpers/scales';
const { detailXScale, detailBolusScale } = detail;

import getBolusPaths, { getBolusEdges } from '../../../src/modules/render/bolus';

const BOLUS_OPTS = {
  bolusWidth: 12,
  extendedLineThickness: 2,
  interruptedLineThickness: 2,
  triangleHeight: 5,
};

describe('bolus path generators', () => {
  describe('getBolusEdges', () => {
    it('should be a function', () => {
      assert.isFunction(getBolusEdges);
    });

    it(`should calculate left and right edges for the bolus half a bolus width to the left and right
      of the bolus\'s center on the x-axis`, () => {
      const edges = getBolusEdges(4, 10, 50, 25);
      expect(edges.left).to.equal(8);
      expect(edges.right).to.equal(12);
    });

    it('should return the `bolusBottom` as `bottom` and `bolusHeight` as `top`', () => {
      const edges = getBolusEdges(4, 10, 50, 25);
      expect(edges.top).to.equal(25);
      expect(edges.bottom).to.equal(50);
    });
  });

  describe('getBolusPaths', () => {
    it('should be a function', () => {
      assert.isFunction(getBolusPaths);
    });

    describe('normal boluses', () => {
      it('should calculate one path for a normal bolus', () => {
        const paths = getBolusPaths(boluses.normal, detailXScale, detailBolusScale, BOLUS_OPTS);
        expect(paths.length).to.equal(1);
        expect(paths[0].type).to.equal('delivered');
      });

      it('should calculate four paths for an interrupted normal bolus', () => {
        const paths = getBolusPaths(
          boluses.interruptedNormal, detailXScale, detailBolusScale, BOLUS_OPTS
        );
        expect(paths.length).to.equal(4);
        expect(paths[0].type).to.equal('undelivered');
        expect(paths[1].type).to.equal('programmed');
        expect(paths[2].type).to.equal('delivered');
        expect(paths[3].type).to.equal('interrupted');
      });

      it('should calculate three paths for an underride on a normal bolus', () => {
        const paths = getBolusPaths(
          boluses.underrideNormal, detailXScale, detailBolusScale, BOLUS_OPTS
        );
        expect(paths.length).to.equal(3);
        expect(paths[0].type).to.equal('underride');
        expect(paths[1].type).to.equal('delivered');
        expect(paths[2].type).to.equal('underrideTriangle');
      });

      it('should calculate four paths for an interrupted underride on a normal bolus', () => {
        const paths = getBolusPaths(
          boluses.underrideAndInterruptedNormal, detailXScale, detailBolusScale, BOLUS_OPTS
        );
        expect(paths.length).to.equal(5);
        expect(paths[0].type).to.equal('undelivered');
        expect(paths[1].type).to.equal('programmed');
        expect(paths[2].type).to.equal('delivered');
        expect(paths[3].type).to.equal('underrideTriangle');
        expect(paths[4].type).to.equal('interrupted');
      });

      it('should calculate no paths for a zero underride on a normal bolus', () => {
        const paths = getBolusPaths(
          boluses.zeroUnderride, detailXScale, detailBolusScale, BOLUS_OPTS
        );
        expect(paths.length).to.equal(0);
      });

      it('should calculate two paths for an override on a normal bolus', () => {
        const paths = getBolusPaths(
          boluses.overrideNormal, detailXScale, detailBolusScale, BOLUS_OPTS
        );
        expect(paths.length).to.equal(2);
        expect(paths[0].type).to.equal('delivered');
        expect(paths[1].type).to.equal('overrideTriangle');
      });

      it('should calculate two paths for a zero override on a normal bolus', () => {
        const paths = getBolusPaths(
          boluses.zeroOverride, detailXScale, detailBolusScale, BOLUS_OPTS
        );
        expect(paths.length).to.equal(2);
        expect(paths[0].type).to.equal('delivered');
        expect(paths[1].type).to.equal('overrideTriangle');
      });

      it('should calculate five paths for an interrupted underride on a normal bolus', () => {
        const paths = getBolusPaths(
          boluses.underrideAndInterruptedNormal, detailXScale, detailBolusScale, BOLUS_OPTS
        );
        expect(paths.length).to.equal(5);
        expect(paths[0].type).to.equal('undelivered');
        expect(paths[1].type).to.equal('programmed');
        expect(paths[2].type).to.equal('delivered');
        expect(paths[3].type).to.equal('underrideTriangle');
        expect(paths[4].type).to.equal('interrupted');
      });

      it('should calculate five paths for an interrupted override on a normal bolus', () => {
        const paths = getBolusPaths(
          boluses.overrideAndInterruptedNormal, detailXScale, detailBolusScale, BOLUS_OPTS
        );
        expect(paths.length).to.equal(5);
        expect(paths[0].type).to.equal('undelivered');
        expect(paths[1].type).to.equal('programmed');
        expect(paths[2].type).to.equal('delivered');
        expect(paths[3].type).to.equal('overrideTriangle');
        expect(paths[4].type).to.equal('interrupted');
      });
    });

    describe('extended ("square") boluses', () => {
      it('should calculate three paths for an extended bolus', () => {
        const paths = getBolusPaths(
          boluses.extended, detailXScale, detailBolusScale, BOLUS_OPTS
        );
        expect(paths.length).to.equal(3);
        expect(paths[0].type).to.equal('delivered');
        expect(paths[1].type).to.equal('extendedPath');
        expect(paths[2].type).to.equal('extendedTriangle');
      });

      it('should calculate eight paths for an interrupted extended bolus', () => {
        const paths = getBolusPaths(
          boluses.interruptedExtended, detailXScale, detailBolusScale, BOLUS_OPTS
        );
        expect(paths.length).to.equal(8);
        expect(paths[0].type).to.equal('undelivered');
        expect(paths[1].type).to.equal('programmed');
        expect(paths[2].type).to.equal('delivered');
        expect(paths[3].type).to.equal('extendedPath');
        expect(paths[4].type).to.equal('extendedExpectationPath');
        expect(paths[5].type).to.equal('extendedInterrupted');
        expect(paths[6].type).to.equal('extendedTriangleInterrupted');
        expect(paths[7].type).to.equal('interrupted');
      });

      it('should calculate four paths for an override on an extended bolus', () => {
        const paths = getBolusPaths(
          boluses.overrideExtended, detailXScale, detailBolusScale, BOLUS_OPTS
        );
        expect(paths.length).to.equal(4);
        expect(paths[0].type).to.equal('delivered');
        expect(paths[1].type).to.equal('extendedPath');
        expect(paths[2].type).to.equal('extendedTriangle');
        expect(paths[3].type).to.equal('overrideTriangle');
      });

      it('should calculate five paths for an underride on an extended bolus', () => {
        const paths = getBolusPaths(
          boluses.underrideExtended, detailXScale, detailBolusScale, BOLUS_OPTS
        );
        expect(paths.length).to.equal(5);
        expect(paths[0].type).to.equal('underride');
        expect(paths[1].type).to.equal('delivered');
        expect(paths[2].type).to.equal('extendedPath');
        expect(paths[3].type).to.equal('extendedTriangle');
        expect(paths[4].type).to.equal('underrideTriangle');
      });

      it(`should calculate nine paths for an interruption of an underride on
        an extended bolus`, () => {
        const paths = getBolusPaths(
          boluses.interruptedUnderrideExtended, detailXScale, detailBolusScale, BOLUS_OPTS
        );
        expect(paths.length).to.equal(9);
        expect(paths[0].type).to.equal('undelivered');
        expect(paths[1].type).to.equal('programmed');
        expect(paths[2].type).to.equal('delivered');
        expect(paths[3].type).to.equal('extendedPath');
        expect(paths[4].type).to.equal('extendedExpectationPath');
        expect(paths[5].type).to.equal('extendedInterrupted');
        expect(paths[6].type).to.equal('extendedTriangleInterrupted');
        expect(paths[7].type).to.equal('underrideTriangle');
        expect(paths[8].type).to.equal('interrupted');
      });
    });

    describe('combo boluses', () => {
      it('should calculate three paths for a combo bolus', () => {
        const paths = getBolusPaths(
          boluses.combo, detailXScale, detailBolusScale, BOLUS_OPTS
        );
        expect(paths.length).to.equal(3);
        expect(paths[0].type).to.equal('delivered');
        expect(paths[1].type).to.equal('extendedPath');
        expect(paths[2].type).to.equal('extendedTriangle');
      });

      it(`should calculate four paths for a combo bolus interrupted
        during \`normal\` delivery`, () => {
        const paths = getBolusPaths(
          boluses.interruptedDuringNormalCombo, detailXScale, detailBolusScale, BOLUS_OPTS
        );
        expect(paths.length).to.equal(4);
        expect(paths[0].type).to.equal('undelivered');
        expect(paths[1].type).to.equal('programmed');
        expect(paths[2].type).to.equal('delivered');
        expect(paths[3].type).to.equal('interrupted');
      });

      it(`should calculate eight paths for a combo bolus interrupted
        during \`extended\` delivery`, () => {
        const paths = getBolusPaths(
          boluses.interruptedDuringExtendedCombo, detailXScale, detailBolusScale, BOLUS_OPTS
        );
        expect(paths.length).to.equal(8);
        expect(paths[0].type).to.equal('undelivered');
        expect(paths[1].type).to.equal('programmed');
        expect(paths[2].type).to.equal('delivered');
        expect(paths[3].type).to.equal('extendedPath');
        expect(paths[4].type).to.equal('extendedExpectationPath');
        expect(paths[5].type).to.equal('extendedInterrupted');
        expect(paths[6].type).to.equal('extendedTriangleInterrupted');
        expect(paths[7].type).to.equal('interrupted');
      });

      it('should calculate five paths for an underride on a combo bolus', () => {
        const paths = getBolusPaths(
          boluses.underrideCombo, detailXScale, detailBolusScale, BOLUS_OPTS
        );
        expect(paths.length).to.equal(5);
        expect(paths[0].type).to.equal('underride');
        expect(paths[1].type).to.equal('delivered');
        expect(paths[2].type).to.equal('extendedPath');
        expect(paths[3].type).to.equal('extendedTriangle');
        expect(paths[4].type).to.equal('underrideTriangle');
      });

      it('should calculate four paths for an override on a combo bolus', () => {
        const paths = getBolusPaths(
          boluses.overrideCombo, detailXScale, detailBolusScale, BOLUS_OPTS
        );
        expect(paths.length).to.equal(4);
        expect(paths[0].type).to.equal('delivered');
        expect(paths[1].type).to.equal('extendedPath');
        expect(paths[2].type).to.equal('extendedTriangle');
        expect(paths[3].type).to.equal('overrideTriangle');
      });

      it(`should calculate nine paths for an interruption of an override on
        a combo bolus`, () => {
        const paths = getBolusPaths(
          boluses.interruptedOverrideCombo, detailXScale, detailBolusScale, BOLUS_OPTS
        );
        expect(paths.length).to.equal(9);
        expect(paths[0].type).to.equal('undelivered');
        expect(paths[1].type).to.equal('programmed');
        expect(paths[2].type).to.equal('delivered');
        expect(paths[3].type).to.equal('extendedPath');
        expect(paths[4].type).to.equal('extendedExpectationPath');
        expect(paths[5].type).to.equal('extendedInterrupted');
        expect(paths[6].type).to.equal('extendedTriangleInterrupted');
        expect(paths[7].type).to.equal('overrideTriangle');
        expect(paths[8].type).to.equal('interrupted');
      });
    });
  });
});
