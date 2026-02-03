import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { MultiplePatientError } from '@app/pages/smartonfhir/MultiplePatientError';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key
  })
}));

jest.mock('@material-ui/icons/WarningRounded', () => {
  return function MockWarningRoundedIcon() {
    return <div data-testid="warning-icon" />;
  };
});

jest.mock('@app/components/elements/Icon', () => {
  return function MockIcon({ children }) {
    return <div data-testid="icon">{children}</div>;
  };
});

describe('MultiplePatientError', () => {
  it('should render without errors', () => {
    render(<MultiplePatientError />);
    expect(screen.getByText('Multiple Patient Matches')).toBeInTheDocument();
  });

  it('should render the warning box with icon', () => {
    render(<MultiplePatientError />);

    const warningIcon = screen.getByTestId('icon');
    expect(warningIcon).toBeInTheDocument();

    expect(screen.getByText('There are multiple patient records in Tidepool with identical MRN and date of birth to this patient.')).toBeInTheDocument();
  });

  it('should render the resolution instructions header', () => {
    render(<MultiplePatientError />);
    expect(screen.getByText('To resolve this issue:')).toBeInTheDocument();
  });

  it('should render an ordered list with the resolution steps', () => {
    render(<MultiplePatientError />);

    const orderedList = screen.getByRole('list');
    expect(orderedList).toBeInTheDocument();

    const listItems = within(orderedList).getAllByRole('listitem');
    expect(listItems).toHaveLength(4);

    expect(listItems[0]).toHaveTextContent('Log into Tidepool (app.tidepool.org) in a new browser');
    expect(listItems[1]).toHaveTextContent('Search for this patient\'s MRN in the Patient List');
    expect(listItems[2]).toHaveTextContent('Review duplicate accounts and either remove duplicates if appropriate or update MRNs to ensure each patient has a unique identifier');
    expect(listItems[3]).toHaveTextContent('Once resolved, return to the EHR and try again');
  });

  it('should render a help text section with contact information', () => {
    render(<MultiplePatientError />);

    expect(screen.getByText(/Need help\? Contact/)).toBeInTheDocument();

    const emailLink = screen.getByRole('link', { name: 'support@tidepool.org' });
    expect(emailLink).toBeInTheDocument();
    expect(emailLink).toHaveAttribute('href', 'mailto:support@tidepool.org');
  });

  it('should render the main title', () => {
    render(<MultiplePatientError />);
    expect(screen.getByText('Multiple Patient Matches')).toBeInTheDocument();
  });
});
