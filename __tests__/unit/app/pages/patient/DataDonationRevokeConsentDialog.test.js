/* global jest, test, expect, describe, it, beforeEach */

import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import { DataDonationRevokeConsentDialog } from '../../../../../app/pages/patient/DataDonationRevokeConsentDialog';

describe('DataDonationRevokeConsentDialog', () => {
  const defaultProps = {
    onClose: jest.fn(),
    onConfirm: jest.fn(),
    open: true,
    processing: false,
    t: (key) => key, // Mock translation function
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders when open is true', () => {
    render(<DataDonationRevokeConsentDialog {...defaultProps} />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: 'Stop Sharing Data?' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Yes, stop sharing' })).toBeInTheDocument();
  });

  it('does not render when open is false', () => {
    render(<DataDonationRevokeConsentDialog {...defaultProps} open={false} />);

    expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
  });

  it('calls onClose when cancel button is clicked', async () => {
    render(<DataDonationRevokeConsentDialog {...defaultProps} />);

    const cancelButton = screen.getByRole('button', { name: 'Cancel' });
    await userEvent.click(cancelButton);

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onConfirm when confirm button is clicked', async () => {
    render(<DataDonationRevokeConsentDialog {...defaultProps} />);

    const confirmButton = screen.getByRole('button', { name: 'Yes, stop sharing' });
    await userEvent.click(confirmButton);

    expect(defaultProps.onConfirm).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when dialog close button is clicked', async () => {
    render(<DataDonationRevokeConsentDialog {...defaultProps} />);

    const closeButton = screen.getByRole('button', { name: /close/i });
    await userEvent.click(closeButton);

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('shows processing state on confirm button when processing', () => {
    render(<DataDonationRevokeConsentDialog {...defaultProps} processing={true} />);

    const confirmButton = screen.getByRole('button', { name: 'Yes, stop sharing' });
    expect(confirmButton).toBeDisabled();
  });

  it('confirm button is clickable when not processing', () => {
    render(<DataDonationRevokeConsentDialog {...defaultProps} processing={false} />);

    const confirmButton = screen.getByRole('button', { name: 'Yes, stop sharing' });
    expect(confirmButton).toBeEnabled();
  });

  it('has proper accessibility attributes', () => {
    render(<DataDonationRevokeConsentDialog {...defaultProps} />);

    const dialog = screen.getByRole('dialog');
    expect(dialog).toHaveAttribute('aria-labelledby', 'dialog-title');

    const dialogWrapper = screen.getByRole('presentation');
    expect(dialogWrapper).toHaveAttribute('id', 'dataDonationRevokeConsentDialog');

    const title = screen.getByText('Stop Sharing Data?');
    expect(title).toHaveAttribute('id', 'dialog-title');
  });

  it('calls onClose when escape key is pressed', async () => {
    render(<DataDonationRevokeConsentDialog {...defaultProps} />);

    await userEvent.keyboard('{Escape}');

    expect(defaultProps.onClose).toHaveBeenCalledTimes(1);
  });

  it('renders question and description content', () => {
    render(<DataDonationRevokeConsentDialog {...defaultProps} />);

    expect(screen.getByTestId('revoke-consent-question')).toBeInTheDocument();
    expect(screen.getByTestId('revoke-consent-description')).toBeInTheDocument();
  });
});
