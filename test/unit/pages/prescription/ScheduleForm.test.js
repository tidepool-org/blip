import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react';
import { Formik } from 'formik';

import ScheduleForm from '../../../../app/pages/prescription/ScheduleForm';
import { convertTimeStringToMsPer24 } from '../../../../app/core/datetime';

/* global chai */
/* global sinon */
/* global describe */
/* global it */
const expect = chai.expect;

describe('ScheduleForm', () => {
  const initialValues = {
    fooSchedule: [{ rate: 9, start: 0 }],
  };

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

  const renderForm = (overrides = {}, scheduleOverrides = {}) => {
    return render(
      <Formik
        initialValues={{ ...initialValues }}
        initialTouched={{ fooSchedule: [{ start: true }] }}
        initialErrors={{ fooSchedule: [{ start: 'some start error!' }] }}
        onSubmit={sinon.stub()}
        {...overrides}
      >
        <ScheduleForm {...defaultProps} {...scheduleOverrides} />
      </Formik>
    );
  };

  it('should render the input labels for the initial data row', () => {
    const { container, getByText } = renderForm();
    const rows = container.querySelectorAll('.schedule-row');
    expect(rows.length).to.equal(1);

    getByText('Start Time');
    getByText('Foo rates values (in U/foo)');
  });

  it('should render the inputs for the initial data row', () => {
    const { container } = renderForm();
    const rows = container.querySelectorAll('.schedule-row');
    expect(rows.length).to.equal(1);

    // Start Time Input
    const startTimeInput = container.querySelector('#fooSchedule\\.0\\.start');
    expect(startTimeInput).to.exist;
    expect(startTimeInput.getAttribute('type')).to.equal('text');
    expect(startTimeInput.value).to.equal('00:00');
    expect(startTimeInput.readOnly).to.equal(true);
    expect(startTimeInput.classList.contains('error')).to.equal(true);
    expect(container.textContent).to.contain('some start error!');

    // Rate Input
    const rateInput = container.querySelector('#fooSchedule\\.0\\.rate');
    expect(rateInput).to.exist;
    expect(rateInput.getAttribute('type')).to.equal('number');
    expect(Number(rateInput.getAttribute('min'))).to.equal(0);
    expect(Number(rateInput.getAttribute('max'))).to.equal(30);
    expect(Number(rateInput.getAttribute('step'))).to.equal(1);
    expect(Number(rateInput.value)).to.equal(9);
    expect(rateInput.classList.contains('warning')).to.equal(true);
    expect(container.textContent).to.contain('Too low!');

    // Delete icon (disabled)
    const deleteIcon = container.querySelector('button[aria-label="Delete"]');
    expect(deleteIcon).to.exist;
    expect(deleteIcon.disabled).to.equal(true);
    expect(deleteIcon.classList.contains('disabled')).to.equal(true);
  });

  it('should render a button to add additional rows', () => {
    const { container } = renderForm();
    const addButton = container.querySelector('button.add-schedule');
    expect(addButton).to.exist;
    expect(addButton.disabled).to.equal(false);
  });

  it('should add a row with same values as previous when the add button is clicked', async () => {
    const { container } = renderForm();
    const addButton = container.querySelector('button.add-schedule');
    fireEvent.click(addButton);

    await waitFor(() => {
      const rows = container.querySelectorAll('.schedule-row');
      expect(rows.length).to.equal(2);
    });

    const startTimeInput = container.querySelector('select#fooSchedule\\.1\\.start');
    expect(startTimeInput).to.exist;

    const rateInput = container.querySelector('#fooSchedule\\.1\\.rate');
    expect(rateInput).to.exist;
    expect(rateInput.getAttribute('type')).to.equal('number');
    expect(Number(rateInput.value)).to.equal(9);

    fireEvent.change(rateInput, { target: { name: 'fooSchedule.1.rate', value: 25 } });
    await waitFor(() => {
      expect(Number(container.querySelector('#fooSchedule\\.1\\.rate').value)).to.equal(25);
      expect(container.textContent).to.contain('Too high!');
    });

    fireEvent.change(rateInput, { target: { name: 'fooSchedule.1.rate', value: 15 } });
    await waitFor(() => {
      expect(Number(container.querySelector('#fooSchedule\\.1\\.rate').value)).to.equal(15);
      expect(container.textContent).to.not.contain('Too high!');
    });
  });

  it('should add a row with same values as previous and a start time increased by 30m when the add button is clicked', async () => {
    const { container } = renderForm();
    const addButton = container.querySelector('button.add-schedule');
    fireEvent.click(addButton);

    await waitFor(() => {
      const rows = container.querySelectorAll('.schedule-row');
      expect(rows.length).to.equal(2);
    });

    const startTimeInput = container.querySelector('select#fooSchedule\\.1\\.start');
    expect(startTimeInput).to.exist;
    expect(Number(startTimeInput.value)).to.equal(convertTimeStringToMsPer24('00:30'));

    const rateInput = container.querySelector('#fooSchedule\\.1\\.rate');
    expect(Number(rateInput.value)).to.equal(9);
  });

  it('should not allow adding another row when the initial row starts within 30m of the end of the day', () => {
    const { container } = renderForm({
      initialValues: {
        fooSchedule: [{ rate: 9, start: convertTimeStringToMsPer24('23:30') }],
      },
    });
    const addButton = container.querySelector('button.add-schedule');
    expect(addButton.disabled).to.equal(true);
  });

  it('should not allow adding another row when the last row is within 30m of the end of the day', () => {
    const { container } = renderForm({
      initialValues: {
        fooSchedule: [
          { rate: 9, start: convertTimeStringToMsPer24('00:00') },
          { rate: 9, start: convertTimeStringToMsPer24('23:30') },
        ],
      },
    });
    const addButton = container.querySelector('button.add-schedule');
    expect(addButton.disabled).to.equal(true);
  });

  it('should reorder inputs by start time as they are changed', async () => {
    const { container } = renderForm({
      initialValues: {
        fooSchedule: [
          { rate: 9, start: convertTimeStringToMsPer24('00:00') },
          { rate: 9, start: convertTimeStringToMsPer24('00:30') },
          { rate: 9, start: convertTimeStringToMsPer24('01:00') },
        ],
      },
    });

    const secondStartInput = container.querySelector('select#fooSchedule\\.1\\.start');
    fireEvent.change(secondStartInput, {
      target: {
        name: 'fooSchedule.1.start',
        value: String(convertTimeStringToMsPer24('01:30')),
      },
    });

    await waitFor(() => {
      const startInputAtIndex1 = container.querySelector('select#fooSchedule\\.1\\.start');
      const startInputAtIndex2 = container.querySelector('select#fooSchedule\\.2\\.start');
      expect(Number(startInputAtIndex1.value)).to.equal(convertTimeStringToMsPer24('01:00'));
      expect(Number(startInputAtIndex2.value)).to.equal(convertTimeStringToMsPer24('01:30'));
    });
  });

  it('should update rate values independently across added rows', async () => {
    const { container } = renderForm();
    const addButton = container.querySelector('button.add-schedule');
    fireEvent.click(addButton);
    fireEvent.click(addButton);

    await waitFor(() => {
      expect(container.querySelectorAll('.schedule-row').length).to.equal(3);
    });

    const rateInput1 = container.querySelector('#fooSchedule\\.0\\.rate');
    const rateInput2 = container.querySelector('#fooSchedule\\.1\\.rate');
    const rateInput3 = container.querySelector('#fooSchedule\\.2\\.rate');

    fireEvent.change(rateInput1, { target: { name: 'fooSchedule.0.rate', value: 1 } });
    fireEvent.change(rateInput2, { target: { name: 'fooSchedule.1.rate', value: 2 } });
    fireEvent.change(rateInput3, { target: { name: 'fooSchedule.2.rate', value: 3 } });

    await waitFor(() => {
      expect(Number(container.querySelector('#fooSchedule\\.0\\.rate').value)).to.equal(1);
      expect(Number(container.querySelector('#fooSchedule\\.1\\.rate').value)).to.equal(2);
      expect(Number(container.querySelector('#fooSchedule\\.2\\.rate').value)).to.equal(3);
    });
  });

  it('should round the fields prop input to the provided increment on blur', async () => {
    const { container } = renderForm();
    const addButton = container.querySelector('button.add-schedule');
    fireEvent.click(addButton);

    const rateInput = container.querySelector('#fooSchedule\\.0\\.rate');
    expect(rateInput).to.exist;
    expect(rateInput.getAttribute('type')).to.equal('number');
    expect(Number(rateInput.getAttribute('step'))).to.equal(1);
    expect(Number(rateInput.value)).to.equal(9);

    fireEvent.change(rateInput, { target: { name: 'fooSchedule.0.rate', value: 25.4 } });
    fireEvent.blur(rateInput);
    await waitFor(() => {
      expect(Number(container.querySelector('#fooSchedule\\.0\\.rate').value)).to.equal(25);
    });

    fireEvent.change(rateInput, { target: { name: 'fooSchedule.0.rate', value: 25.5 } });
    fireEvent.blur(rateInput);
    await waitFor(() => {
      expect(Number(container.querySelector('#fooSchedule\\.0\\.rate').value)).to.equal(26);
    });
  });
});
