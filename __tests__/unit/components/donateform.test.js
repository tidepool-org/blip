/* global jest, beforeEach, test, expect, describe, it */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Import the mocked component
import DonateForm from '../../../app/components/donateform';

describe('DonateForm', ()  => {
  const trackMetric = jest.fn();
  const onUpdateDataDonationAccounts = jest.fn();

  beforeEach(() => {
    trackMetric.mockClear();
    onUpdateDataDonationAccounts.mockClear();
  });

  it('Prevents interaction when data donation accounts have not been fetched', async () => {
    const testProps = {
      trackMetric,
      onUpdateDataDonationAccounts,
      dataDonationAccountsFetched: false,
      working: false,
      dataDonationAccounts: [], // Empty
    };

    render(<DonateForm {...testProps} />);

    // Data donate checkbox should be unchecked and enabled
    expect(screen.getByLabelText('Donate my anonymized data')).not.toBeChecked();
    expect(screen.getByLabelText('Donate my anonymized data')).toBeDisabled();

    // Save button should be disabled
    const saveButton = screen.getByText('Save', { selector: 'button' });
    expect(saveButton).toHaveAttribute('disabled');
    expect(saveButton).toHaveTextContent('Save');

    // Select dropdown should be disabled
    expect(screen.queryByRole('combobox')).toBeFalsy();
  });

  it('Allows addition of nonprofits when there are no existing selections', async () => {
    const testProps = {
      trackMetric,
      onUpdateDataDonationAccounts,
      dataDonationAccountsFetched: true,
      working: false,
      dataDonationAccounts: [], // Empty
    };

    render(<DonateForm {...testProps} />);

    // Data donate checkbox should be unchecked and enabled
    expect(screen.getByLabelText('Donate my anonymized data')).not.toBeChecked();
    expect(screen.getByLabelText('Donate my anonymized data')).not.toBeDisabled();

    // Save button should be disabled
    const saveButton = screen.getByText('Save', { selector: 'button' });
    expect(saveButton).toHaveAttribute('disabled');
    expect(saveButton).toHaveTextContent('Save');

    // Click open the Select dropdown
    await userEvent.click(screen.queryByRole('combobox'));

    // These select options should be visible
    expect(screen.queryByText('ADCES Foundation')).toBeTruthy();
    expect(screen.queryByText('Breakthrough T1D')).toBeTruthy();
    expect(screen.queryByText('Children with Diabetes')).toBeTruthy();
    expect(screen.queryByText('The Diabetes Link')).toBeTruthy();
    expect(screen.queryByText('Diabetes Youth Families (DYF)')).toBeTruthy();
    expect(screen.queryByText('DiabetesSisters')).toBeTruthy();
    expect(screen.queryByText('The diaTribe Foundation')).toBeTruthy();
    expect(screen.queryByText('Breakthrough T1D')).toBeTruthy();
    expect(screen.queryByText('Nightscout Foundation')).toBeTruthy();
    expect(screen.queryByText('T1D Exchange')).toBeTruthy();

    // Select Children with Diabetes
    await userEvent.click(screen.queryByText('Children with Diabetes'));

    // Data donate checkbox should now be checked and disabled
    expect(screen.getByLabelText('Donate my anonymized data')).toBeChecked();
    expect(screen.getByLabelText('Donate my anonymized data')).toBeDisabled();

    // Click on Save button, which should now be enabled
    expect(saveButton).not.toHaveAttribute('disabled');
    expect(saveButton).toHaveTextContent('Save');
    await userEvent.click(saveButton);

    // Save button should now be disabled
    expect(saveButton).toHaveTextContent('Saved');
    expect(saveButton).toHaveAttribute('disabled');

    // Callback should be passed arrays of orgs to add or remove. Unchanged orgs are not passed.
    expect(onUpdateDataDonationAccounts).toHaveBeenCalledTimes(1);
    expect(onUpdateDataDonationAccounts).toHaveBeenCalledWith(
      [ 'bigdata@tidepool.org', 'bigdata+CWD@tidepool.org' ], // to add
      [], // to remove
    );

    // Tracking should have been called with signup and cancellation events
    expect(trackMetric).toHaveBeenCalledTimes(2);
    expect(trackMetric.mock.calls[0]).toStrictEqual(
      [ 'web - big data sign up', { source: 'none', location: 'settings' }]
    );
    expect(trackMetric.mock.calls[1]).toStrictEqual(
      [ 'web - big data sign up', { source: 'CWD', location: 'settings' } ]
    );
  });

  it('Allows addition/removal of nonprofits when there are pre-existing selections', async () => {
    const testProps = {
      trackMetric,
      onUpdateDataDonationAccounts,
      dataDonationAccountsFetched: true,
      working: false,
      dataDonationAccounts: [ // Pre-selected options
        {email: 'bigdata@tidepool.org', status: 'pending' },
        {email: 'bigdata+BT1@tidepool.org', status: 'pending' }, // Beyond Type 1
        {email: 'bigdata+CWD@tidepool.org', status: 'pending' }, // Children with Diabetes
      ],
    };

    render(<DonateForm {...testProps} />);

    // Data donate checkbox should be checked and disabled from the start
    expect(screen.getByLabelText('Donate my anonymized data')).toBeChecked();
    expect(screen.getByLabelText('Donate my anonymized data')).toBeDisabled();

    // Save button should be disabled
    const saveButton = screen.getByText('Saved', { selector: 'button' });
    expect(saveButton).toHaveAttribute('disabled');
    expect(saveButton).toHaveTextContent('Saved');

    // Click open the Select dropdown
    await userEvent.click(screen.queryByRole('combobox'));

    // Select Breakthrough T1D
    await userEvent.click(screen.queryByText('Breakthrough T1D'));

    // Remove Children with Diabetes
    await userEvent.click(screen.getByLabelText('Remove Children with Diabetes'));

    // Click on Save button, which should now be enabled
    expect(saveButton).not.toHaveAttribute('disabled');
    expect(saveButton).toHaveTextContent('Save');
    await userEvent.click(saveButton);

    // Save button should now be disabled
    expect(saveButton).toHaveTextContent('Saved');
    expect(saveButton).toHaveAttribute('disabled');

    // Callback should be passed arrays of orgs to add or remove. Unchanged orgs are not passed.
    expect(onUpdateDataDonationAccounts).toHaveBeenCalledTimes(1);
    expect(onUpdateDataDonationAccounts).toHaveBeenCalledWith(
      ['bigdata+JDRF@tidepool.org'], // to add
      [{email: 'bigdata+CWD@tidepool.org', status: 'pending' }], // to remove
    );

    // Tracking should have been called with signup and cancellation events
    expect(trackMetric).toHaveBeenCalledTimes(2);
    expect(trackMetric.mock.calls[0]).toStrictEqual(
      ['web - big data sign up', { source: 'JDRF', location: 'settings' }]
    );
    expect(trackMetric.mock.calls[1]).toStrictEqual(
      ['web - big data cancellation', { source: 'CWD' }]
    );
  });
});
