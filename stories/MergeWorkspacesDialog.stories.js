import React from 'react';
import { Provider } from 'react-redux';
import { legacy_createStore as createStore } from 'redux';
import { Global, ThemeProvider } from '@emotion/react';
import { screen } from '@testing-library/dom';
import userEvent from '@testing-library/user-event';
import noop from 'lodash/noop';

import baseTheme from '../app/themes/baseTheme';
import MergeWorkspacesDialog from '../app/components/clinic/MergeWorkspacesDialog';
import MergeWorkspacesConfirmDialog from '../app/components/clinic/MergeWorkspacesConfirmDialog';

/* eslint-disable max-len */

// The app sets these on body and its form controls; the labels, pickers and badge digits inherit them.
const appBodyStyles = {
  body: { fontFamily: baseTheme.fonts.default, fontSize: '16px', lineHeight: '20px', color: '#6d6d6d' },
  'input, button, select, textarea': { fontFamily: 'inherit', fontSize: 'inherit', lineHeight: 'inherit' },
};

// Wrap each story component with the base theme
const withTheme = (Story) => (
  <ThemeProvider theme={baseTheme}>
    <Global styles={appBodyStyles} />
    <Story />
  </ThemeProvider>
);

const store = createStore(() => ({
  blip: {
    clinics: {
      north: { id: 'north', patientTags: [{ id: 't1', name: 'North Tag' }], sites: [{ id: 's1', name: 'North Site' }] },
      south: { id: 'south', patientTags: [{ id: 't2', name: 'Imported' }, { id: 't3', name: 'Dawn Cohort' }], sites: [{ id: 's2', name: 'Main Campus' }] },
      east: { id: 'east', patientTags: [{ id: 't4', name: 'East Tag' }], sites: [{ id: 's3', name: 'East Site' }] },
    },
  },
}));

const withStore = (Story) => (
  <Provider store={store}>
    <Story />
  </Provider>
);

export default {
  title: 'Merge Workspaces Dialogs',
  component: MergeWorkspacesDialog,
  decorators: [withTheme, withStore],
};

const mergeArgs = {
  open: true,
  workspaces: [
    { id: 'south', name: 'South Clinic' },
    { id: 'north', name: 'North Clinic' },
    { id: 'east', name: 'East Hospital' },
  ],
  generatingReport: false,
  merging: false,
  onClose: noop,
  onGenerateReport: noop,
  onMerge: noop,
};

const confirmArgs = {
  open: true,
  processing: false,
  sourceName: 'North Clinic',
  targetName: 'South Clinic',
  sourcePatientTag: 'Imported',
  sourcePatientSite: 'Main Campus',
  onClose: noop,
  onConfirm: noop,
};

// The pickers and the confirmation checkbox keep their own state, so the stories set them the way a user would.
// react-select options carry no ARIA role, so they are found by class. Blurring leaves the picker at rest.
const choose = async (label, name) => {
  const input = screen.getByLabelText(label);
  await userEvent.click(input);
  await userEvent.click(screen.getByText(name, { selector: '[class$="__option"], [class*="__option "]' }));
  input.blur();
};

const chooseBoth = async () => {
  await choose('Merge from', 'North Clinic');
  await choose('Merge into', 'South Clinic');
};

const checkConfirm = () => userEvent.click(screen.getByRole('checkbox', { hidden: true }));

export const Empty = { args: mergeArgs };

export const TargetOnly = {
  args: mergeArgs,
  play: () => choose('Merge into', 'South Clinic'),
};

export const BothSelected = {
  args: mergeArgs,
  play: chooseBoth,
};

export const TagAndSiteChosen = {
  args: mergeArgs,
  play: async () => {
    await chooseBoth();
    await choose('Tag', 'Imported');
    await choose('Site', 'Main Campus');
  },
};

export const GeneratingReport = {
  args: { ...mergeArgs, generatingReport: true },
  play: chooseBoth,
};

export const Merging = {
  args: { ...mergeArgs, merging: true },
  play: async () => {
    await chooseBoth();
    await userEvent.click(document.getElementById('merge-workspaces-merge'));
    await checkConfirm();
  },
};

const renderConfirm = args => <MergeWorkspacesConfirmDialog {...args} />;

export const ConfirmUnchecked = {
  args: confirmArgs,
  render: renderConfirm,
};

export const ConfirmChecked = {
  args: confirmArgs,
  render: renderConfirm,
  play: checkConfirm,
};

export const ConfirmProcessing = {
  args: { ...confirmArgs, processing: true },
  render: renderConfirm,
  play: checkConfirm,
};
