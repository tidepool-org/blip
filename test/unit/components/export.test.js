/* global chai */
/* global describe */
/* global context */
/* global sinon */
/* global it */
/* global beforeEach */
/* global afterEach */

import React from 'react';
import { mount } from 'enzyme';
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
  const expectedInitialState = {
    allTime: false,
    endDate: moment().format(JS_DATE_FORMAT),
    startDate: moment()
      .subtract(30, 'd')
      .format(JS_DATE_FORMAT),
    anonymizeData: false,
    format: 'excel',
    extraExpanded: false,
    error: false,
    bgUnits: MGDL_UNITS,
  };
  const expectedInitialStateMmoll = {
    allTime: false,
    endDate: moment().format(JS_DATE_FORMAT),
    startDate: moment()
      .subtract(30, 'd')
      .format(JS_DATE_FORMAT),
    anonymizeData: false,
    format: 'excel',
    extraExpanded: false,
    error: false,
    bgUnits: MMOLL_UNITS,
  };

  let wrapper;
  beforeEach(() => {
    wrapper = mount(<Export {...props} />);
  });

  afterEach(() => {
    props.api.tidepool.getExportDataURL.reset();
    props.trackMetric.reset();
  });

  it('should be a function', () => {
    expect(Export).to.be.a('function');
  });

  it('should render without errors when provided all required props', () => {
    console.error = sinon.stub();

    expect(wrapper.find('.Export')).to.have.length(1);
    expect(console.error.callCount).to.equal(0);
  });

  it('should set the initial state', () => {
    expect(wrapper.childAt(0).state()).to.eql(
      expectedInitialState
    );
  });

  it('should accept bgUnits as prop', () => {
    wrapper = mount(<Export {...mmollProps} />);
    expect(wrapper.childAt(0).state()).to.eql(
      expectedInitialStateMmoll
    );
  });

  describe('render', () => {
    it('should render a pair of date selection inputs', () => {
      expect(wrapper.find('input[type="date"]')).to.have.length(2);
    });
    it('should render a file format selection', () => {
      expect(wrapper.find('input[name="format"][type="radio"]')).to.have.length(
        2
      );
    });
    it('should render a submit button', () => {
      expect(wrapper.find('input[type="submit"]')).to.have.length(1);
    });
  });

  describe('handleInputChange', () => {
    let startDate, endDate, json, excel;

    beforeEach(() => {
      wrapper.update();
      const dates = wrapper.find('input[type="date"]');
      startDate = dates.at(0);
      endDate = dates.at(1);
      const formats = wrapper.find('input[type="radio"]');
      excel = formats.at(0);
      json = formats.at(1);
    });

    it('should update start and end dates in state when form values change', () => {
      let newStartDate = '2000-02-02';
      let newEndDate = '2001-02-02';
      const wrappedInstance = wrapper.childAt(0);
      expect(wrappedInstance.state().startDate).to.equal(
        expectedInitialState.startDate
      );
      expect(wrappedInstance.state().endDate).to.equal(
        expectedInitialState.endDate
      );
      startDate.simulate('change', {
        target: { name: 'startDate', value: newStartDate }
      });
      sinon.assert.calledOnce(props.trackMetric);
      sinon.assert.calledWith(props.trackMetric, 'Selected custom start or end date');
      expect(wrappedInstance.state().startDate).to.equal(
        newStartDate
      );
      props.trackMetric.reset();
      endDate.simulate('change', {
        target: { name: 'endDate', value: newEndDate }
      });
      sinon.assert.calledOnce(props.trackMetric);
      sinon.assert.calledWith(props.trackMetric, 'Selected custom start or end date');
      expect(wrappedInstance.state().endDate).to.equal(
        newEndDate
      );
    });

    it('should not allow startDate to be after endDate', () => {
      let setEndDate = '2001-02-02';
      let attemptedStartDate = '2001-02-03';
      wrapper.childAt(0).instance().setState({ endDate: setEndDate });
      startDate.simulate('change', {
        target: { name: 'startDate', value: attemptedStartDate }
      });
      expect(wrapper.childAt(0).state().startDate).to.equal(
        setEndDate
      );
    });

    it('should not allow endDate to be before startDate', () => {
      let setStartDate = '2001-02-02';
      let attemptedEndDate = '2001-02-01';
      startDate.simulate('change', {
        target: { name: 'startDate', value: setStartDate }
      });
      endDate.simulate('change', {
        target: { name: 'endDate', value: attemptedEndDate }
      });
      expect(wrapper.childAt(0).state().endDate).to.equal(
        setStartDate
      );
    });

    it('should not allow endDate to be after the current date', () => {
      let currentDate = moment().format(JS_DATE_FORMAT);
      let attemptedEndDate = moment()
        .add(1, 'd')
        .format(JS_DATE_FORMAT);
      endDate.simulate('change', {
        target: { name: 'endDate', value: attemptedEndDate }
      });
      expect(wrapper.childAt(0).state().endDate).to.equal(
        currentDate
      );
    });

    it('should update format selection in state when form values change', () => {
      excel.simulate('change', {
        target: { name: 'format', checked: true, value: 'excel' }
      });
      expect(wrapper.childAt(0).state().format).to.equal(
        'excel'
      );
      sinon.assert.calledOnce(props.trackMetric);
      sinon.assert.calledWith(props.trackMetric, 'Selected file format');
      props.trackMetric.reset();
      json.simulate('change', {
        target: { name: 'format', checked: true, value: 'json' }
      });
      expect(wrapper.childAt(0).state().format).to.equal(
        'json'
      );
      sinon.assert.calledOnce(props.trackMetric);
      sinon.assert.calledWith(props.trackMetric, 'Selected file format');
    });
  });

  describe('handleSubmit', () => {
    let spy, button;

    beforeEach(() => {
      spy = sinon.spy(wrapper.childAt(0).instance(), 'handleSubmit');
      wrapper.update();
      button = wrapper.find('input[type="submit"]');
    });

    it('should be called when the user clicks the submit button', () => {
      // TODO: not sure why this now needs to simulate twice, but anser may be found somewhere here: https://github.com/airbnb/enzyme/blob/master/docs/guides/migration-from-2-to-3.md
      button.simulate('submit');
      button.simulate('submit');
      sinon.assert.calledOnce(spy);
    });

    it('should call getExportDataURL', () => {
      button.simulate('submit');
      sinon.assert.calledOnce(props.api.tidepool.getExportDataURL);
      sinon.assert.calledOnce(props.trackMetric)
      sinon.assert.calledWith(props.trackMetric, 'Clicked "export data"');
    });

    it('should set error state if callback errors', () => {
      let errMessage = 'get data url error';
      props.api.tidepool.getExportDataURL.callsArgWith(3, errMessage);
      button.simulate('submit');
      sinon.assert.calledOnce(props.api.tidepool.getExportDataURL);
      expect(wrapper.childAt(0).state().error).to.equal(
        errMessage
      );
    });
  });

  describe('setDateRange', () => {
    const fiveDaysPrior = moment()
      .subtract(5, 'd')
      .format(JS_DATE_FORMAT);
    const tenDaysPrior = moment()
      .subtract(10, 'd')
      .format(JS_DATE_FORMAT);

    it('should set allTime to false', () => {
      const wrappedInstance = wrapper.childAt(0);
      wrappedInstance.state().allTime = true;
      expect(wrappedInstance.state().allTime).to.eql(
        true
      );
      wrappedInstance.instance().setDateRange(5);
      expect(wrappedInstance.state().allTime).to.eql(
        false
      );
    });
    it('should set end date to current date', () => {
      const wrappedInstance = wrapper.childAt(0);
      wrappedInstance.state().endDate = null;
      expect(wrappedInstance.state().endDate).to.eql(null);
      wrappedInstance.instance().setDateRange(5);
      expect(wrappedInstance.state().endDate).to.eql(
        moment().format(JS_DATE_FORMAT)
      );
      sinon.assert.calledOnce(props.trackMetric);
      sinon.assert.calledWith(props.trackMetric, 'Selected pre-determined date range');
    });
    it('should set the start date to expected span', () => {
      const wrappedInstance = wrapper.childAt(0);
      wrappedInstance.state().startDate = null;
      expect(wrappedInstance.state().startDate).to.eql(
        null
      );
      wrappedInstance.instance().setDateRange(5);
      expect(wrappedInstance.state().startDate).to.eql(
        fiveDaysPrior
      );
      wrappedInstance.instance().setDateRange(10);
      expect(wrappedInstance.state().startDate).to.eql(
        tenDaysPrior
      );
    });
  });

  describe('toggleOptions', () => {
    it('should negate current expanded options state',
      () => {
        expect(
          wrapper.childAt(0).state().extraExpanded
        ).to.eql(false);
        wrapper
          .childAt(0).instance()
          .toggleOptions();
        expect(
          wrapper.childAt(0).state().extraExpanded
        ).to.eql(true);
        wrapper
          .childAt(0).instance()
          .toggleOptions();
        expect(
          wrapper.childAt(0).state().extraExpanded
        ).to.eql(false);
      });
  });
});
