/* global chai */
/* global sinon */
/* global describe */
/* global beforeEach */
/* global afterEach */
/* global it */

import React from 'react';
import ReactDOM from 'react-dom';
import TestUtils from 'react-dom/test-utils';
import moment from 'moment';
import chai from 'chai';
import { DatePicker, RangeDatePicker } from '../../../app/components/datepicker';

const { expect } = chai;

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
      // console.log(container);
      document.body.removeChild(container);
      container = null;
    });

    it('should render without problems', () => {
      const handleChange = sinon.spy();

      ReactDOM.render((<RangeDatePicker
        begin="2020-01-01T22:44:30.652Z"
        end={moment.utc('2020-01-07')}
        onChange={ handleChange } />), container, () => {
          const button = container.querySelector('button');
          expect(button.textContent, 'button text is Apply').to.equal('Apply');
          TestUtils.Simulate.click(button);
          checkChangeArgs(handleChange, '2020-01-01T00:00:00.000Z', '2020-01-07T00:00:00.000Z');
        }
      );
    });

    it('should pick a day', () => {
      const handleChange = sinon.spy();

      ReactDOM.render((<RangeDatePicker
        begin="2020-01-01T22:44:30.652Z"
        end={moment.utc('2020-01-07')}
        onChange={ handleChange } />), container, () => {
          // span id="datepicker-popup-day-begin-1577923200" class="datepicker-popup-day" value="begin-1577923200">2</span>
          const spanDay = document.getElementById('datepicker-popup-day-begin-1577923200');
          expect(spanDay.textContent).to.equal('2');
          TestUtils.Simulate.click(spanDay);
          const button = container.querySelector('button');
          TestUtils.Simulate.click(button);
          checkChangeArgs(handleChange, '2020-01-02T00:00:00.000Z', '2020-01-07T00:00:00.000Z');
        }
      );
    });

    it('should change month', () => {
      const handleChange = sinon.spy();

      ReactDOM.render((<RangeDatePicker
        begin="2020-01-01T22:44:30.652Z"
        end={moment.utc('2020-01-07')}
        onChange={ handleChange } />), container, () => {
          // <span id="datepicker-popup-end-next-month" class="datepicker-popup-change-month icon-next"></span>
          const spanNextMonth = document.getElementById('datepicker-popup-end-next-month');
          TestUtils.Simulate.click(spanNextMonth);
          const spanDay = document.getElementById('datepicker-popup-day-end-1581292800'); // 2020-02-10
          expect(spanDay).to.be.not.null;
          TestUtils.Simulate.click(spanDay);
          const button = container.querySelector('button');
          TestUtils.Simulate.click(button);
          checkChangeArgs(handleChange, '2020-01-01T00:00:00.000Z', '2020-02-10T00:00:00.000Z');
        }
      );
    });
  });
});
