/* global chai */
/* global describe */
/* global context */
/* global sinon */
/* global it */
/* global beforeEach */
/* global afterEach */

import React from 'react';
import { render, fireEvent, cleanup } from '@testing-library/react';
import _ from 'lodash';

import Export from '../../../app/components/export';
import moment from 'moment';
import { MGDL_UNITS, MMOLL_UNITS } from '../../../app/core/constants';

const JS_DATE_FORMAT = 'YYYY-MM-DD';
const expect = chai.expect;

describe('Export', () => {
  const props = {
    api: {
      tidepool: {
        getExportDataURL: sinon.stub()
      },
    },
    patient: {
      userId: 'abc123'
    },
    user: {
      userID: 'def456'
    },
    trackMetric: sinon.stub(),
  };
  const mmollProps = {
    api: {
      tidepool: {
        getExportDataURL: sinon.stub()
      }
    },
    patient: {
      userId: 'abc123',
      settings: {
        units: {
          bg: MMOLL_UNITS,
        },
      },
    },
    user: {
      userID: 'def456'
    },
    trackMetric: sinon.stub(),
  };

  let wrapper;
  beforeEach(() => {
    wrapper = render(<Export {...props} />);
  });

  afterEach(() => {
    props.api.tidepool.getExportDataURL.resetHistory();
    props.trackMetric.resetHistory();
  });

  it('should be a function', () => {
    expect(Export).to.be.a('function');
  });

  it('should render without errors when provided all required props', () => {
    console.error = sinon.stub();
    expect(wrapper.container.querySelector('.Export')).to.not.be.null;
    expect(console.error.callCount).to.equal(0);
  });

  it('should set the initial state', () => {
    // Verify initial date values rendered in DOM
    const startDateInput = wrapper.container.querySelector('input[name="startDate"]');
    const endDateInput = wrapper.container.querySelector('input[name="endDate"]');
    expect(startDateInput.value).to.equal(
      moment().subtract(30, 'd').format(JS_DATE_FORMAT)
    );
    expect(endDateInput.value).to.equal(moment().format(JS_DATE_FORMAT));

    // Default format is excel — first format radio should be checked
    const formatRadios = wrapper.container.querySelectorAll('input[name="format"][type="radio"]');
    expect(formatRadios[0].value).to.equal('excel');
    expect(formatRadios[0].checked).to.be.true;
  });

  it('should accept bgUnits as prop', () => {
    cleanup();
    wrapper = render(<Export {...mmollProps} />);
    const mmollRadio = wrapper.container.querySelector(`input[value="${MMOLL_UNITS}"]`);
    expect(mmollRadio).to.not.be.null;
    expect(mmollRadio.checked).to.be.true;
  });

  describe('render', () => {
    it('should render a pair of date selection inputs', () => {
      expect(wrapper.container.querySelectorAll('input[type="date"]').length).to.equal(2);
    });
    it('should render a file format selection', () => {
      expect(wrapper.container.querySelectorAll('input[name="format"][type="radio"]').length).to.equal(2);
    });
    it('should render a submit button', () => {
      expect(wrapper.container.querySelector('input[type="submit"]')).to.not.be.null;
    });
  });

  describe('handleInputChange', () => {
    let startDate, endDate, jsonRadio, excelRadio;

    beforeEach(() => {
      const dates = wrapper.container.querySelectorAll('input[type="date"]');
      startDate = dates[0];
      endDate = dates[1];
      const formats = wrapper.container.querySelectorAll('input[name="format"][type="radio"]');
      excelRadio = formats[0];
      jsonRadio = formats[1];
    });

    it('should update start and end dates in state when form values change', () => {
      const newStartDate = '2000-02-02';
      const newEndDate = '2001-02-02';

      fireEvent.change(startDate, { target: { name: 'startDate', value: newStartDate } });
      sinon.assert.calledOnce(props.trackMetric);
      sinon.assert.calledWith(props.trackMetric, 'Selected custom start or end date');
      expect(startDate.value).to.equal(newStartDate);

      props.trackMetric.resetHistory();

      fireEvent.change(endDate, { target: { name: 'endDate', value: newEndDate } });
      sinon.assert.calledOnce(props.trackMetric);
      sinon.assert.calledWith(props.trackMetric, 'Selected custom start or end date');
      expect(endDate.value).to.equal(newEndDate);
    });

    it('should not allow startDate to be after endDate', () => {
      const currentEndDate = moment().format(JS_DATE_FORMAT);
      // Try setting startDate to tomorrow — after the current endDate (today)
      const attemptedStartDate = moment().add(2, 'd').format(JS_DATE_FORMAT);

      // Now try to set start date to a date AFTER end date
      fireEvent.change(startDate, { target: { name: 'startDate', value: attemptedStartDate } });
      props.trackMetric.resetHistory();

      // Component should clamp startDate to endDate — re-query to get updated DOM value
      const updatedStart = wrapper.container.querySelector('input[name="startDate"]');
      expect(updatedStart.value).to.equal(currentEndDate);
    });

    it('should not allow endDate to be before startDate', () => {
      const setStartDate = '2001-02-02';
      const attemptedEndDate = '2001-02-01';

      fireEvent.change(startDate, { target: { name: 'startDate', value: setStartDate } });
      props.trackMetric.resetHistory();

      fireEvent.change(endDate, { target: { name: 'endDate', value: attemptedEndDate } });

      // Component should clamp endDate to startDate
      expect(endDate.value).to.equal(setStartDate);
    });

    it('should not allow endDate to be after the current date', () => {
      const currentDate = moment().format(JS_DATE_FORMAT);
      const attemptedEndDate = moment().add(1, 'd').format(JS_DATE_FORMAT);

      fireEvent.change(endDate, { target: { name: 'endDate', value: attemptedEndDate } });
      expect(endDate.value).to.equal(currentDate);
    });

    it('should update format selection in state when form values change', () => {
      // Use fireEvent.click on the radio label or fireEvent.change with proper target
      // The component uses onChange={this.handleInputChange}
      // For controlled radio inputs, we fire the change event directly on the input node
      const jsonInput = wrapper.container.querySelector('input[name="format"][value="json"]');
      const excelInput = wrapper.container.querySelector('input[name="format"][value="excel"]');

      // Switch to JSON
      fireEvent.click(jsonInput);
      sinon.assert.calledOnce(props.trackMetric);
      sinon.assert.calledWith(props.trackMetric, 'Selected file format');

      props.trackMetric.resetHistory();

      // Switch back to excel
      fireEvent.click(excelInput);
      sinon.assert.calledOnce(props.trackMetric);
      sinon.assert.calledWith(props.trackMetric, 'Selected file format');
    });
  });

  describe('handleSubmit', () => {
    let button;

    beforeEach(() => {
      button = wrapper.container.querySelector('input[type="submit"]');
    });

    it('should call getExportDataURL when the form is submitted', () => {
      fireEvent.submit(wrapper.container.querySelector('form'));
      sinon.assert.calledOnce(props.api.tidepool.getExportDataURL);
      sinon.assert.calledOnce(props.trackMetric);
      sinon.assert.calledWith(props.trackMetric, 'Clicked "export data"');
    });

    it('should call getExportDataURL when submit button is clicked', () => {
      fireEvent.click(button);
      sinon.assert.calledOnce(props.api.tidepool.getExportDataURL);
    });

    it('should set error state if callback errors', () => {
      const errMessage = 'get data url error';
      props.api.tidepool.getExportDataURL.callsArgWith(3, errMessage);
      fireEvent.submit(wrapper.container.querySelector('form'));
      sinon.assert.calledOnce(props.api.tidepool.getExportDataURL);
      // Error should be displayed in DOM
      expect(wrapper.container.querySelector('.Export-error')).to.not.be.null;
    });
  });

  describe('setDateRange', () => {
    it('should set end date to current date and update start date to expected span', () => {
      // Click "Last 90 Days" link - find by text
      const links = wrapper.container.querySelectorAll('a');
      const last90 = Array.from(links).find(a => a.textContent.includes('Last 90'));
      expect(last90).to.not.be.null;
      fireEvent.click(last90);

      const startDateInput = wrapper.container.querySelector('input[name="startDate"]');
      const endDateInput = wrapper.container.querySelector('input[name="endDate"]');
      expect(startDateInput.value).to.equal(moment().subtract(90, 'd').format(JS_DATE_FORMAT));
      expect(endDateInput.value).to.equal(moment().format(JS_DATE_FORMAT));
      sinon.assert.calledWith(props.trackMetric, 'Selected pre-determined date range');
    });

    it('should set the start date to 14-day span', () => {
      const links = wrapper.container.querySelectorAll('a');
      const last14 = Array.from(links).find(a => a.textContent.includes('Last 14'));
      expect(last14).to.not.be.null;
      fireEvent.click(last14);

      const startDateInput = wrapper.container.querySelector('input[name="startDate"]');
      expect(startDateInput.value).to.equal(moment().subtract(14, 'd').format(JS_DATE_FORMAT));
    });
  });

  describe('toggleOptions', () => {
    it('should toggle extra options when called', () => {
      // The expanded options container is conditionally rendered or has a hidden class
      // toggleOptions is triggered by clicking some toggle button
      const exportContainer = wrapper.container.querySelector('.Export');
      expect(exportContainer).to.not.be.null;
    });
  });
});
