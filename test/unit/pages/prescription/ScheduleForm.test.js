import React from 'react';
import { mount } from 'enzyme';
import { Formik } from 'formik';
import cloneDeep from 'lodash/cloneDeep';
import noop from 'lodash/noop';
import set from 'lodash/set';

import ScheduleForm from '../../../../app/pages/prescription/ScheduleForm';
import { convertTimeStringToMsPer24 } from '../../../../app/core/datetime';

/* global chai */
/* global sinon */
/* global describe */
/* global it */
/* global before */
/* global after */
/* global afterEach */
/* global beforeEach */

const expect = chai.expect;

describe('ScheduleForm', () => {
  let wrapper;

  const initialValues = {
    fooSchedule: [{ rate: 9, start: 0 }],
  };

  let formikContext;

  const defaultProps = {
    addButtonText: '+ Add an Additional foo',
    fieldArrayName: 'fooSchedule',
    fields: [
      {
        label: 'Foo rates values (in U/foo)',
        name: 'rate',
        suffix: 'U/foo',
        threshold: {
          low: { value: 10, message: 'Too low!' },
          high: { value: 20, message: 'Too high!' },
        },
        type: 'number',
        min: 0,
        max: 30,
        increment: 1,
      },
    ],
  };

  afterEach(() => {
    ScheduleForm.__ResetDependency__('useFormikContext');
  });

  beforeEach(() => {
    formikContext = {
      touched: {
        fooSchedule: [{ start: true }],
      },
      values: { ...initialValues },
      errors: {
        fooSchedule: [{ start: 'some start error!' }],
      },
      setFieldTouched: sinon.stub().resolves(),
      setFieldValue: sinon.stub().resolves(),
      handleChange: sinon.stub().callsFake(e => set(this.values, e.target.name, e.target.value)),
    };

    ScheduleForm.__Rewire__('useFormikContext', sinon.stub().returns(cloneDeep(formikContext)));

    wrapper = mount((
      <Formik
        initialValues={{ ...initialValues }}
      >
        <ScheduleForm {...defaultProps} />
      </Formik>
    ));
  });

  it('should render the input labels for the initial data row', () => {
    const rows = wrapper.find('.schedule-row').hostNodes();
    expect(rows).to.have.length(1);

    const labels = wrapper.find('label').hostNodes();
    expect(labels).to.have.length(2);
    expect(labels.at(0).text()).to.equal('Start Time');
    expect(labels.at(1).text()).to.equal('Foo rates values (in U/foo)');
  });

  it('should render the inputs for the initial data row', () => {
    const rows = wrapper.find('.schedule-row').hostNodes();
    expect(rows).to.have.length(1);

    // Start Time Input
    const startTimeInput = wrapper.find('[id="fooSchedule.0.start"]').hostNodes();
    expect(startTimeInput).to.have.length(1);
    expect(startTimeInput.prop('type')).to.equal('text');
    expect(startTimeInput.prop('value')).to.equal('00:00');
    expect(startTimeInput.prop('readOnly')).to.be.true;
    expect(startTimeInput.hasClass('error')).to.be.true;

    const startTimeError = rows.find('.error').hostNodes();
    expect(startTimeError).to.have.length(3);
    expect(startTimeError.last().text()).to.equal('some start error!');

    // Rate Input
    const rateInput = wrapper.find('[id="fooSchedule.0.rate"]').hostNodes();
    expect(rateInput).to.have.length(1);
    expect(rateInput.prop('type')).to.equal('number');
    expect(rateInput.prop('min')).to.equal(0);
    expect(rateInput.prop('max')).to.equal(30);
    expect(rateInput.prop('step')).to.equal(1);
    expect(rateInput.prop('value')).to.equal(9);

    expect(rateInput.hasClass('warning')).to.be.true;
    const rateWarning = rows.first().find('.warning').hostNodes();
    expect(rateWarning).to.have.length(3);
    expect(rateWarning.last().text()).to.equal('Too low!');

    // Delete icon (disabled)
    const deleteIcon = rows.first().find('button[aria-label="Delete"]').hostNodes();
    expect(deleteIcon).to.have.length(1);
    expect(deleteIcon.prop('disabled')).to.be.true;
    expect(deleteIcon.hasClass('disabled')).to.be.true;
  });

  it('should render a button to add additional rows', () => {
    const addButton = wrapper.find('button.add-schedule').hostNodes();
    expect(addButton).to.have.length(1);
    expect(addButton.prop('disabled')).to.be.false;
  });

  it('should add a row with same values as previous and a start time increased by 30m when the add button is clicked', done => {
    const rows = () => wrapper.find('.schedule-row').hostNodes();
    expect(rows()).to.have.length(1);

    const addButton = wrapper.find('button.add-schedule');
    addButton.last().simulate('click');

    expect(rows()).to.have.length(2);

    // Labels not rendered for additional rows
    const firstRowlabels = rows().at(0).find('label').hostNodes();
    expect(firstRowlabels).to.have.length(2);

    const secondRowlabels = rows().at(1).find('label').hostNodes();
    expect(secondRowlabels).to.have.length(0);

    // Start Time Input
    const startTimeInput = wrapper.find('select[id="fooSchedule.1.start"]').hostNodes();
    expect(startTimeInput).to.have.length(1);
    expect(startTimeInput.prop('value')).to.equal(convertTimeStringToMsPer24('00:30'));
    expect(startTimeInput.hasClass('error')).to.be.false;

    // Rate Input
    const rateInput = () => wrapper.find('[id="fooSchedule.1.rate"]').hostNodes();
    expect(rateInput()).to.have.length(1);

    expect(rateInput().prop('type')).to.equal('number');
    expect(rateInput().prop('min')).to.equal(0);
    expect(rateInput().prop('max')).to.equal(30);
    expect(rateInput().prop('step')).to.equal(1);
    expect(rateInput().prop('value')).to.equal(9);

    // Update rate to trigger high threshold
    // Need this to actually set the field value, so can't use stub here
    ScheduleForm.__ResetDependency__('useFormikContext');

    setTimeout(() => {
      rateInput().at(0).simulate('change', { persist: noop, target: { name: 'fooSchedule.1.rate', value: 25 } });
      expect(rateInput().prop('value')).to.equal(25);

      const rateWarning = rows().at(1).find('.warning').hostNodes();
      expect(rateWarning).to.have.length(2); // only 2 this time b/c there's no label rendered
      expect(rateWarning.last().text()).to.equal('Too high!');

      // Update rate to within threshold range to remove warning
      rateInput().at(0).simulate('change', { target: { name: 'fooSchedule.1.rate', value: 15 } })
      expect(rateInput().prop('value')).to.equal(15);

      expect(rows().at(1).find('.warning').hostNodes()).to.have.length(0);

      done();
    });
  });

  it('should not allow adding another row when the last row is within 30m of the end of the day', () => {
    const addButton = () => wrapper.find('button.add-schedule').hostNodes();
    expect(addButton()).to.have.length(1);
    expect(addButton().prop('disabled')).to.be.false;

    const rows = () => wrapper.find('.schedule-row').hostNodes();
    expect(rows()).to.have.length(1);

    addButton().at(0).simulate('click');

    expect(rows()).to.have.length(2);

    const startTimeInput = () => wrapper.find('select[id="fooSchedule.1.start"]').hostNodes();
    expect(startTimeInput()).to.have.length(1);
    expect(startTimeInput().prop('value')).to.equal(convertTimeStringToMsPer24('00:30'));

    expect(addButton().prop('disabled')).to.be.false;

    startTimeInput().at(0).simulate('change', { persist: noop, target: { name: 'fooSchedule.1.start', value: convertTimeStringToMsPer24('23:30') } });
    expect(addButton().prop('disabled')).to.be.true;

    startTimeInput().at(0).simulate('change', { persist: noop, target: { name: 'fooSchedule.1.start', value: convertTimeStringToMsPer24('23:00') } });
    expect(addButton().prop('disabled')).to.be.false;
  });

  it('should reorder inputs by start time as they are changed', done => {
    const addButton = () => wrapper.find('button.add-schedule').hostNodes();
    expect(addButton()).to.have.length(1);
    expect(addButton().prop('disabled')).to.be.false;

    const rows = () => wrapper.find('.schedule-row').hostNodes();
    expect(rows()).to.have.length(1);

    addButton().at(0).simulate('click');
    addButton().at(0).simulate('click');

    expect(rows()).to.have.length(3);

    const startTimeInput1 = () => wrapper.find('[id="fooSchedule.0.start"]').hostNodes();
    const startTimeInput2 = () => wrapper.find('select[id="fooSchedule.1.start"]').hostNodes();
    const startTimeInput3 = () => wrapper.find('select[id="fooSchedule.2.start"]').hostNodes();

    const rateTimeInput1 = () => wrapper.find('[id="fooSchedule.0.rate"]').hostNodes();
    const rateTimeInput2 = () => wrapper.find('[id="fooSchedule.1.rate"]').hostNodes();
    const rateTimeInput3 = () => wrapper.find('[id="fooSchedule.2.rate"]').hostNodes();

    // Update rate to trigger high threshold
    // Need this to actually set the field value, so can't use stub here
    ScheduleForm.__ResetDependency__('useFormikContext');

    setTimeout(() => {
      rateTimeInput1().simulate('change', { persist: noop, target: { name: 'fooSchedule.0.rate', value: 1 } });
      rateTimeInput2().simulate('change', { persist: noop, target: { name: 'fooSchedule.1.rate', value: 2 } });
      rateTimeInput3().simulate('change', { persist: noop, target: { name: 'fooSchedule.2.rate', value: 3 } });

      expect(startTimeInput1().prop('value')).to.equal('00:00');
      expect(rateTimeInput1().prop('value')).to.equal(1);

      expect(startTimeInput2().prop('value')).to.equal(convertTimeStringToMsPer24('00:30'));
      expect(rateTimeInput2().prop('value')).to.equal(2);

      expect(startTimeInput3().prop('value')).to.equal(convertTimeStringToMsPer24('01:00'));
      expect(rateTimeInput3().prop('value')).to.equal(3);

      // Change the middle input time to a later value than the 3rd. The time and rate inputs should move together
      startTimeInput2().simulate('change', { persist: noop, target: { name: 'fooSchedule.1.start', value: convertTimeStringToMsPer24('2:00') } });
      expect(startTimeInput1().prop('value')).to.equal('00:00');
      expect(rateTimeInput1().prop('value')).to.equal(1);

      expect(startTimeInput2().prop('value')).to.equal(convertTimeStringToMsPer24('01:00'));
      expect(rateTimeInput2().prop('value')).to.equal(3);

      expect(startTimeInput3().prop('value')).to.equal(convertTimeStringToMsPer24('02:00'));
      expect(rateTimeInput3().prop('value')).to.equal(2);

      done();
    });
  });

  it('should round the fields prop input to the provided increment on blur', done => {
    const addButton = wrapper.find('button.add-schedule');
    addButton.last().simulate('click');

    // Rate Input
    const rateInput = () => wrapper.find('[id="fooSchedule.0.rate"]').hostNodes();
    expect(rateInput()).to.have.length(1);

    expect(rateInput().prop('type')).to.equal('number');
    expect(rateInput().prop('step')).to.equal(1);
    expect(rateInput().prop('value')).to.equal(9);

    // Update rate to trigger high threshold
    // Need this to actually set the field value, so can't use stub here
    ScheduleForm.__ResetDependency__('useFormikContext');

    setTimeout(() => {
      rateInput().at(0).simulate('change', { persist: noop, target: { name: 'fooSchedule.0.rate', value: 25.4 } })
      rateInput().at(0).simulate('blur');
      expect(rateInput().prop('value')).to.equal(25);

      rateInput().at(0).simulate('change', { persist: noop, target: { name: 'fooSchedule.0.rate', value: 25.5 } })
      rateInput().at(0).simulate('blur');
      expect(rateInput().prop('value')).to.equal(26);

      done();
    });
  });
});
