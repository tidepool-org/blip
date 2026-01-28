import React from 'react';
import { render, screen } from '@testing-library/react';
import { NoClinicsError } from '@app/pages/smartonfhir/NoClinicsError';

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

describe('NoClinicsError', () => {
  it('should render without errors', () => {
    render(<NoClinicsError />);
    expect(screen.getByText('Account Set Up Required')).toBeInTheDocument();
  });

  it('should render the warning box with icon', () => {
    render(<NoClinicsError />);

    const warningIcon = screen.getByTestId('icon');
    expect(warningIcon).toBeInTheDocument();

    expect(screen.getByText('You don\'t appear to have a Tidepool account yet.')).toBeInTheDocument();
  });

  it('should render the main title', () => {
    render(<NoClinicsError />);
    expect(screen.getByText('Account Set Up Required')).toBeInTheDocument();
  });

  it('should render the help text section with contact information', () => {
    render(<NoClinicsError />);

    expect(screen.getByText(/Please contact/)).toBeInTheDocument();

    const emailLink = screen.getByRole('link', { name: 'support@tidepool.org' });
    expect(emailLink).toBeInTheDocument();
    expect(emailLink).toHaveAttribute('href', 'mailto:support@tidepool.org');
  });

  it('should render the full help message', () => {
    render(<NoClinicsError />);

    expect(screen.getByText(/Our team will check on your account status and permissions to help you get appropriate access\./)).toBeInTheDocument();
  });
});
