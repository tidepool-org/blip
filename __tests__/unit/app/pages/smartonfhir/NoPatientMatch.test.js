import React from 'react';
import { render, screen, within } from '@testing-library/react';
import { ThemeProvider } from '@emotion/react';
import { NoPatientMatch } from '@app/pages/smartonfhir/NoPatientMatch';
import baseTheme from '@app/themes/baseTheme';

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

describe('NoPatientMatch', () => {
  const renderWithProviders = (ui) => {
    return render(ui, {
      wrapper: ({ children }) => (
        <ThemeProvider theme={baseTheme}>
          {children}
        </ThemeProvider>
      ),
    });
  };

  const renderComponent = () => renderWithProviders(<NoPatientMatch />);

  it('renders the main heading with correct text', () => {
    renderComponent();

    const heading = screen.getByRole('heading', { level: 3, name: 'No Patient Match' });
    expect(heading).toBeInTheDocument();
  });

  it('displays the warning message with icon', () => {
    renderComponent();

    const warningIcon = screen.getByTestId('icon');
    expect(warningIcon).toBeInTheDocument();

    expect(screen.getByText('There is no patient with that MRN and date of birth in your Tidepool workspace.')).toBeInTheDocument();
  });

  it('renders the complete instructions list', () => {
    renderComponent();

    expect(screen.getByText('To add this patient to Tidepool:')).toBeInTheDocument();

    expect(screen.getByText('Log into Tidepool (app.tidepool.org) in a new browser')).toBeInTheDocument();
    expect(screen.getByText(/Click.*Add New Patient.*Clinic Workspace/)).toBeInTheDocument();
    expect(screen.getByText('Enter the required information, making sure the MRN and birthdate match the EHR')).toBeInTheDocument();
  });

  it('displays the follow-up information and support contact', () => {
    renderComponent();

    expect(screen.getByText(/After this.*you.*ll be able to open their Tidepool account/)).toBeInTheDocument();

    expect(screen.getByText(/Need help\? Contact/)).toBeInTheDocument();

    const emailLink = screen.getByRole('link', { name: 'support@tidepool.org' });
    expect(emailLink).toBeInTheDocument();
    expect(emailLink).toHaveAttribute('href', 'mailto:support@tidepool.org');
  });

  it('renders all content in correct document structure', () => {
    renderComponent();

    expect(screen.getByRole('heading', { name: 'No Patient Match' })).toBeInTheDocument();

    const orderedList = screen.getByRole('list');
    expect(orderedList).toBeInTheDocument();
    expect(orderedList.tagName).toBe('OL');

    const listItems = within(orderedList).getAllByRole('listitem');
    expect(listItems).toHaveLength(3);
  });
});
