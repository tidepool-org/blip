/* global sinon */
/* global describe */
/* global it */
/* global expect */
/* global beforeEach */
/* global afterEach */
/* global jest */

import React from 'react';
import { render, screen } from '@testing-library/react';
import { NoPatientMatch } from '../../../../app/pages/smartonfhir/NoPatientMatch';

// Mock the i18next translation
jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key) => key
  })
}));

// Mock the Material-UI icons
jest.mock('@material-ui/icons/WarningRounded', () => {
  return function MockWarningRoundedIcon() {
    return <div data-testid="warning-icon" />;
  };
});

// Mock the Icon component
jest.mock('../../../../app/components/elements/Icon', () => {
  return function MockIcon({ children }) {
    return <div data-testid="icon">{children}</div>;
  };
});

// Mock the theme
jest.mock('../../../../app/themes/baseTheme', () => ({
  fontWeights: { medium: 500 },
  fonts: { default: 'Arial' }
}));

describe('NoPatientMatch', () => {
  const renderComponent = () => render(<NoPatientMatch />);

  it('renders the main heading with correct text', () => {
    renderComponent();

    const heading = screen.getByRole('heading', { level: 3, name: 'No Patient Match' });
    expect(heading).toBeInTheDocument();
  });

  it('displays the warning message with icon', () => {
    renderComponent();

    // Check that the warning icon is present
    const warningIcon = screen.getByTestId('icon');
    expect(warningIcon).toBeInTheDocument();

    // Check that the warning message is displayed
    expect(screen.getByText('There is no patient with that MRN and date of birth in your Tidepool workspace.')).toBeInTheDocument();
  });

  it('renders the complete instructions list', () => {
    renderComponent();

    // Check the introductory text
    expect(screen.getByText('To add this patient to Tidepool:')).toBeInTheDocument();

    // Check all list items are present
    expect(screen.getByText('Log into Tidepool (app.tidepool.org) in a new browser')).toBeInTheDocument();
    expect(screen.getByText(/Click.*Add New Patient.*Clinic Workspace/)).toBeInTheDocument();
    expect(screen.getByText('Enter the required information, making sure the MRN and birthdate match the EHR')).toBeInTheDocument();
  });

  it('displays the follow-up information and support contact', () => {
    renderComponent();

    // Check the follow-up text
    expect(screen.getByText(/After this.*you.*ll be able to open their Tidepool account/)).toBeInTheDocument();

    // Check the support contact section
    expect(screen.getByText(/Need help\? Contact/)).toBeInTheDocument();

    // Check the email link has correct attributes
    const emailLink = screen.getByRole('link', { name: 'support@tidepool.org' });
    expect(emailLink).toBeInTheDocument();
    expect(emailLink).toHaveAttribute('href', 'mailto:support@tidepool.org');
  });

  it('renders all content in correct document structure', () => {
    renderComponent();

    // Verify the component renders without throwing
    expect(screen.getByRole('heading', { name: 'No Patient Match' })).toBeInTheDocument();

    // Check that we have an ordered list for instructions
    const orderedList = screen.getByRole('list', { ordered: true });
    expect(orderedList).toBeInTheDocument();
    expect(orderedList.tagName).toBe('OL');

    // Verify we have the expected number of list items
    const listItems = screen.getAllByRole('listitem');
    expect(listItems).toHaveLength(3);
  });
});
