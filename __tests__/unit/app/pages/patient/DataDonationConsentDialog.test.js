/* global jest, test, expect, describe, it, beforeEach */

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import thunk from 'redux-thunk';

import { DataDonationConsentDialog } from '../../../../../app/pages/patient/DataDonationConsentDialog';
import { DATA_DONATION_CONSENT_TYPE } from '../../../../../app/core/constants';

describe('DataDonationConsentDialog', () => {
  const mockStore = configureStore([thunk]);

  const mockStoreState = {
    blip: {
      consents: {
        [DATA_DONATION_CONSENT_TYPE]: {
          content: '# Test Consent Document\n\nThis is test consent content for data donation.\n\n## Section 1\nConsent details here.\n\n## Section 2\nMore consent information.',
          type: DATA_DONATION_CONSENT_TYPE,
          version: 1
        }
      }
    }
  };

  const baseProps = {
    onClose: jest.fn(),
    onConfirm: jest.fn(),
    open: true,
    patientName: 'John Doe',
    caregiverName: 'Jane Doe',
    consentDate: '2024-01-01',
  };

  const renderWithStore = (props = {}) => {
    const store = mockStore(mockStoreState);
    return render(
      <Provider store={store}>
        <DataDonationConsentDialog {...baseProps} {...props} />
      </Provider>
    );
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('personal account + adult patient', () => {
    const props = { accountType: 'personal', patientAgeGroup: 'adult' };

    it('shows single step consent flow', () => {
      renderWithStore(props);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Fuel the Next Generation of Diabetes Innovation')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument();

      // Should not show caregiver name input
      expect(screen.queryByLabelText(/Parent Or Legal Guardian Name/)).not.toBeInTheDocument();
    });

    it('uses patient name in signature', () => {
      renderWithStore(props);

      expect(screen.getByText(/Electronic signature: John Doe/)).toBeInTheDocument();
    });

    it('disables submit button until form is valid', () => {
      renderWithStore(props);

      const submitButton = screen.getByRole('button', { name: 'Submit' });
      expect(submitButton).toBeDisabled();
    });
  });

  describe('personal account + youth patient', () => {
    const props = { accountType: 'personal', patientAgeGroup: 'youth' };

    it('shows two-step consent flow', () => {
      renderWithStore(props);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Submit' })).not.toBeInTheDocument();

      // Should show caregiver name input on first step
      expect(screen.getByLabelText(/Parent Or Legal Guardian Name/)).toBeInTheDocument();
    });

    it('shows review message for caregiver on primary step', () => {
      renderWithStore(props);

      expect(screen.getByText(/Please ask your parent or guardian to review/)).toBeInTheDocument();
    });

    it('advances from parent consent to youth assent', async () => {
      const user = userEvent.setup();
      renderWithStore(props);

      // Fill in required fields for first step
      const nameInput = screen.getByLabelText(/Parent Or Legal Guardian Name/);
      await user.type(nameInput, 'Jane Doe');

      // Check consent checkboxes
      const readCheckbox = screen.getByLabelText(/I have read the consent statement/);
      const consentCheckbox = screen.getByLabelText(/As their parent or guardian, I have read this form/);
      const consentPrompt = screen.getByText('Please scroll to the bottom of the consent form to enable the agreement checkbox.');

      expect(readCheckbox).not.toBeChecked(); // Should be unchecked until document is scrolled
      expect(consentCheckbox).toBeDisabled(); // Should be disabled until read checkbox is checked
      expect(consentPrompt).toBeInTheDocument(); // Should be visible until user scrolls to bottom

      // Find the consent document container and simulate scroll
      const consentText = screen.getByTestId('consentDocumentText');

      // Mock element scroll properties to scroll and then fire the event
      // jsdom does not calculate these automatically
      Object.defineProperty(consentText, 'scrollHeight', { value: 300 });
      Object.defineProperty(consentText, 'clientHeight', { value: 100 });
      Object.defineProperty(consentText, 'scrollTop', { value: 200 }); // (scrollHeight - clientHeight) = 200
      fireEvent.scroll(consentText);

      expect(readCheckbox).toBeChecked(); // Should be checked after scrolling
      expect(consentCheckbox).toBeEnabled(); // Should be enabled after scrolling
      expect(consentPrompt).not.toBeInTheDocument(); // Should be hidden since user has read entire consent
      await user.click(consentCheckbox);

      // Click Next to advance to second step
      const nextButton = screen.getByRole('button', { name: 'Next' });
      await user.click(nextButton);

      // Should now show Submit button instead of Next
      expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument();
    });
  });

  describe('personal account + child patient', () => {
    const props = { accountType: 'personal', patientAgeGroup: 'child' };

    it('shows single step consent flow', () => {
      renderWithStore(props);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByText('Fuel the Next Generation of Diabetes Innovation')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument();

      // Should show caregiver name input
      expect(screen.getByLabelText(/Parent Or Legal Guardian Name/)).toBeInTheDocument();
    });

    it('uses caregiver name in signature', async () => {
      const user = userEvent.setup();
      renderWithStore(props);

      // Fill in required fields for first step
      const nameInput = screen.getByLabelText(/Parent Or Legal Guardian Name/);
      await user.type(nameInput, 'Jane Doe');

      expect(screen.getByText(/Electronic signature: Jane Doe/)).toBeInTheDocument();
    });

    it('disables submit button until form is valid', () => {
      renderWithStore(props);

      const submitButton = screen.getByRole('button', { name: 'Submit' });
      expect(submitButton).toBeDisabled();
    });
  });

  describe('caregiver account + adult patient', () => {
    const props = { accountType: 'caregiver', patientAgeGroup: 'adult' };

    it('shows single step with review message', () => {
      renderWithStore(props);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument();

      // Should show review message for patient
      expect(screen.getByText(/Please ask John to review and take the next step/)).toBeInTheDocument();

      // Should not show caregiver name input (already known)
      expect(screen.queryByLabelText(/Parent Or Legal Guardian Name/)).not.toBeInTheDocument();
    });

    it('uses patient name in signature', () => {
      renderWithStore(props);

      expect(screen.getByText(/Electronic signature: John Doe/)).toBeInTheDocument();
    });
  });

  describe('caregiver account + youth patient', () => {
    const props = { accountType: 'caregiver', patientAgeGroup: 'youth' };

    it('shows two-step consent flow', () => {
      renderWithStore(props);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Next' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Submit' })).not.toBeInTheDocument();

      // Should not show caregiver name input (already known)
      expect(screen.queryByLabelText(/Parent Or Legal Guardian Name/)).not.toBeInTheDocument();
    });

    it('shows review messages for both steps', () => {
      renderWithStore(props);

      // First step should show caregiver consent question
      expect(screen.getByText(/Do you give your consent for John Doe to donate/)).toBeInTheDocument();
    });

    it('uses both names in final signature after completing both steps', async () => {
      const user = userEvent.setup();
      renderWithStore(props);

      const readCheckbox = screen.getByLabelText(/I have read the consent statement/);
      const consentCheckbox = screen.getByLabelText(/As their parent or guardian, I have read this form/);

      expect(readCheckbox).not.toBeChecked(); // Should be unchecked until document is scrolled
      expect(consentCheckbox).toBeDisabled(); // Should be disabled until read checkbox is checked

      // Find the consent document container and simulate scroll
      const consentText = screen.getByTestId('consentDocumentText');

      // Mock element scroll properties to scroll and then fire the event
      // jsdom does not calculate these automatically
      Object.defineProperty(consentText, 'scrollHeight', { value: 300 });
      Object.defineProperty(consentText, 'clientHeight', { value: 100 });
      Object.defineProperty(consentText, 'scrollTop', { value: 200 }); // (scrollHeight - clientHeight) = 200
      fireEvent.scroll(consentText);

      expect(readCheckbox).toBeChecked(); // Should be checked after scrolling
      expect(consentCheckbox).toBeEnabled(); // Should be enabled after scrolling
      await user.click(consentCheckbox);

      const nextButton = screen.getByRole('button', { name: 'Next' });
      await user.click(nextButton);

      // Second step should show both names in signature
      expect(screen.getByText(/Electronic signature: John Doe, Jane Doe/)).toBeInTheDocument();
    });
  });

  describe('caregiver account + child patient', () => {
    const props = { accountType: 'caregiver', patientAgeGroup: 'child' };

    it('shows single step consent (caregiver only)', () => {
      renderWithStore(props);

      expect(screen.getByRole('dialog')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: 'Submit' })).toBeInTheDocument();
      expect(screen.queryByRole('button', { name: 'Next' })).not.toBeInTheDocument();

      // Should not show caregiver name input (already known)
      expect(screen.queryByLabelText(/Parent Or Legal Guardian Name/)).not.toBeInTheDocument();
    });

    it('uses caregiver name in signature', () => {
      renderWithStore(props);

      expect(screen.getByText(/Electronic signature: Jane Doe/)).toBeInTheDocument();
    });

    it('shows child-specific consent text', () => {
      renderWithStore(props);

      expect(screen.getByText(/As their parent or guardian, I have read this form and give my consent/)).toBeInTheDocument();
    });
  });

  describe('Common functionality across all combinations', () => {
    const testCombinations = [
      { accountType: 'personal', patientAgeGroup: 'adult' },
      { accountType: 'personal', patientAgeGroup: 'youth' },
      { accountType: 'caregiver', patientAgeGroup: 'adult' },
      { accountType: 'caregiver', patientAgeGroup: 'youth' },
      { accountType: 'caregiver', patientAgeGroup: 'child' },
    ];

    testCombinations.forEach(combination => {
      describe(`${combination.accountType} + ${combination.patientAgeGroup}`, () => {
        it('requires scrolling to enable consent checkbox', () => {
          renderWithStore(combination);

          // Check that consent checkbox is initially disabled
          const consentCheckbox = screen.getByTestId('consent-checkbox');
          expect(consentCheckbox).toBeDisabled();
        });

        it('renders consent document content', () => {
          renderWithStore(combination);

          expect(screen.getByText(/Test Consent Document/)).toBeInTheDocument();
          expect(screen.getByText(/This is test consent content/)).toBeInTheDocument();
        });

        it('calls onClose when cancel button is clicked', async () => {
          const user = userEvent.setup();
          renderWithStore(combination);

          const cancelButton = screen.getByRole('button', { name: 'Cancel' });
          await user.click(cancelButton);

          expect(baseProps.onClose).toHaveBeenCalledTimes(1);
        });
      });
    });

    it('does not render when open is false', () => {
      renderWithStore({ open: false, accountType: 'personal', patientAgeGroup: 'adult' });

      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });

    it('has proper accessibility attributes', () => {
      renderWithStore({ accountType: 'personal', patientAgeGroup: 'adult' });

      const dialog = screen.getByRole('dialog');
      expect(dialog).toHaveAttribute('aria-labelledby', 'dialog-title');

      const dialogWrapper = screen.getByRole('presentation');
      expect(dialogWrapper).toHaveAttribute('id', 'dataDonationConsentDialog');

      const title = screen.getByText('Fuel the Next Generation of Diabetes Innovation');
      expect(title).toHaveAttribute('id', 'dialog-title');
    });
  });
});
