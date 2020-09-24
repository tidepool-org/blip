/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2017, Tidepool Project
 * Copyright (c) 2020, Diabeloop Project
 *
 * This program is free software; you can redistribute it and/or modify it under
 * the terms of the associated License, which is identical to the BSD 2-Clause
 * License as published by the Open Source Initiative at opensource.org.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the License for more details.
 * == BSD2 LICENSE ==
 */

import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-dom/test-utils';
import moment from 'moment';
import chai from 'chai';
import sinon from 'sinon';
import { DatePicker, RangeDatePicker } from '../../../app/components/datepicker';

const { expect } = chai;

function deferPromise() {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 2);
  });
}

describe('DatePickers', function () {

  describe('DatePicker', function () {
    it('should be a function', function() {
      expect(DatePicker).to.be.a('function');
    });

    describe('render', function() {
      it('should render without problems', () => {
        const elem = TestUtils.renderIntoDocument(<DatePicker />);
        expect(elem).to.be.ok;
      });
    });
  });

  describe('RangeDatePicker', function () {
    let container = null;

    function checkChangeArgs(handleChange, begin, end) {
      expect(handleChange.calledOnce, 'calledOnce').to.be.true;
      expect(handleChange.args[0], 'args').to.be.an('array').lengthOf(2);
      expect(moment.isMoment(handleChange.args[0][0]), 'first arg is a moment()').to.be.true;
      expect(moment.isMoment(handleChange.args[0][1]), 'second arg is a moment()').to.be.true;
      expect(handleChange.args[0][0].toISOString(), 'first date').to.equal(begin);
      expect(handleChange.args[0][1].toISOString(), 'second date').to.equal(end);
    }

    beforeEach(() => {
      container = document.createElement('div');
      document.body.appendChild(container);
    });
    afterEach(() => {
      ReactDOM.unmountComponentAtNode(container);
      document.body.removeChild(container);
      container = null;
    });

    it('should render without problems', (done) => {
      const handleChange = (f, s) => {
        const spy = sinon.spy();
        spy(f, s);
        try {
          checkChangeArgs(spy, '2020-01-01T00:00:00.000Z', '2020-01-07T00:00:00.000Z');
          done();
        } catch (e) {
          done(e);
        }
      };

      ReactDOM.render((<RangeDatePicker
        begin="2020-01-01T22:44:30.652Z"
        end={moment.utc('2020-01-07')}
        onChange={ handleChange } />), container, () => {
          let button = container.querySelector('.btn-secondary');
          expect(button.textContent, 'secondary button text is Cancel').to.equal('Cancel');
          button = container.querySelector('.btn-primary');
          expect(button.textContent, 'primary button text is Apply').to.equal('Apply');
          TestUtils.Simulate.click(button);
        }
      );
    });

    it('should pick a day', (done) => {
      const handleChange = (f, s) => {
        const spy = sinon.spy();
        spy(f, s);
        try {
          checkChangeArgs(spy, '2019-12-31T00:00:00.000Z', '2020-01-08T00:00:00.000Z');
          done();
        } catch (e) {
          done(e);
        }
      };

      ReactDOM.render((<RangeDatePicker
        begin="2019-12-25T22:44:30.652Z"
        end={'2020-01-07T00:00:00.000Z'}
        onChange={ handleChange } />), container, () => {
          deferPromise().then(() => {
            const spanDay = document.getElementById('datepicker-popup-day-1577750400');
            expect(spanDay.textContent).to.equal('31'); // 2019-12-31
            TestUtils.Simulate.click(spanDay);
            return deferPromise();
          }).then(() => {
            const spanDay = document.getElementById('datepicker-popup-day-1578441600');
            expect(spanDay.textContent).to.equal('8'); // 2020-01-08
            TestUtils.Simulate.click(spanDay);
            return deferPromise();
          }).then(() => {
            const button = container.querySelector('.btn-primary');
            TestUtils.Simulate.click(button);
          }).catch(done);
        }
      );
    });

    it('should change month', (done) => {
      const handleChange = (f, s) => {
        const spy = sinon.spy();
        spy(f, s);
        try {
          checkChangeArgs(spy, '2019-11-21T00:00:00.000Z', '2019-12-16T00:00:00.000Z');
          done();
        } catch (e) {
          done(e);
        }
      };

      ReactDOM.render((<RangeDatePicker
        begin={new Date('2020-01-01T22:44:30.652Z')}
        end="2020-01-07T00:00:00.000Z"
        onChange={ handleChange } />), container, () => {
          deferPromise().then(() => {
            // <span id="datepicker-popup-end-next-month" class="datepicker-popup-change-month icon-next"></span>
            const spanNextMonth = document.getElementById('datepicker-popup-prev-month');
            TestUtils.Simulate.click(spanNextMonth);
            return deferPromise();
          }).then(() => {
            const spanDay = document.getElementById('datepicker-popup-day-1576454400'); // 2019-12-16
            expect(spanDay).to.be.not.null;
            TestUtils.Simulate.click(spanDay);
            return deferPromise();
          }).then(() => {
            const spanDay = document.getElementById('datepicker-popup-day-1574294400'); // 2019-11-21
            expect(spanDay).to.be.not.null;
            TestUtils.Simulate.click(spanDay);
            return deferPromise();
          }).then(() => {
            const button = container.querySelector('.btn-primary');
            TestUtils.Simulate.click(button);
          }).catch(done);
        }
      );
    });
  });
});
