/* global jest, expect, describe, beforeEach, it */

import React from 'react';

import { Provider } from 'react-redux';
import configureStore from 'redux-mock-store';
import { render, screen, waitFor, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import MergeWorkspacesDialog from '@app/components/clinic/MergeWorkspacesDialog';

describe('MergeWorkspacesDialog', () => {
  const workspaces = [
    { id: 'south', name: 'South Clinic' },
    { id: 'north', name: 'North Clinic' },
    { id: 'east', name: 'East Hospital' },
  ];
  const props = {
    open: true,
    onClose: jest.fn(),
    workspaces,
    onGenerateReport: jest.fn(),
    onMerge: jest.fn(),
  };

  const store = configureStore()({
    blip: {
      clinics: {
        north: { id: 'north', patientTags: [{ id: 't1', name: 'North Tag' }], sites: [{ id: 's1', name: 'North Site' }] },
        south: {
          id: 'south',
          patientTags: [{ id: 't2', name: 'Imported' }, { id: 't3', name: 'Dawn Cohort' }],
          sites: [{ id: 's2', name: 'Main Campus' }],
        },
        east: { id: 'east' },
      },
    },
  });

  const dialog = (overrides = {}) => (
    <Provider store={store}>
      <MergeWorkspacesDialog {...props} {...overrides} />
    </Provider>
  );

  const fromInput = () => screen.getByLabelText('Merge from');
  const intoInput = () => screen.getByLabelText('Merge into');
  const tagInput = () => screen.getByLabelText('Tag');
  const siteInput = () => screen.getByLabelText('Site');
  // Without a portal, the modal marks the test container aria-hidden, so role queries opt in to hidden nodes.
  const reportButton = () => screen.getByRole('button', { name: 'Download Merge Report', hidden: true });
  const reportHint = 'Choose a workspace to merge into to download one.';
  const mergeDialog = () => within(screen.getByRole('dialog', { name: 'Merge Workspaces', hidden: true }));
  const confirmDialog = () => within(screen.getByRole('dialog', { name: 'Confirm Merge', hidden: true }));
  const mergeButton = () => mergeDialog().getByRole('button', { name: 'Merge', hidden: true });
  const confirmButton = () => confirmDialog().getByRole('button', { name: 'Merge', hidden: true });
  const confirmMerge = async () => {
    await userEvent.click(mergeButton());
    await userEvent.click(confirmDialog().getByRole('checkbox', { hidden: true }));
    await userEvent.click(confirmButton());
  };
  // react-select 5.7 options carry no ARIA role, so they are found by class.
  const optionSelector = { selector: '[class$="__option"], [class*="__option "]' };
  const option = name => screen.getByText(name, optionSelector);
  const optionNames = () => screen.queryAllByText(/./, optionSelector).map(el => el.textContent);

  const choose = async (input, name) => {
    await userEvent.click(input);
    await userEvent.click(option(name));
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should list the given workspaces alphabetically and narrow them as the user types', async () => {
    render(dialog());

    await userEvent.click(fromInput());
    expect(optionNames()).toEqual(['East Hospital', 'North Clinic', 'South Clinic']);

    await userEvent.type(fromInput(), 'clin');
    expect(optionNames()).toEqual(['North Clinic', 'South Clinic']);
  });

  it('should leave a workspace chosen in one picker out of the other', async () => {
    render(dialog());

    await choose(fromInput(), 'North Clinic');
    await userEvent.click(intoInput());
    expect(optionNames()).toEqual(['East Hospital', 'South Clinic']);

    await userEvent.click(option('South Clinic'));
    await userEvent.click(fromInput());
    expect(optionNames()).toEqual(['East Hospital', 'North Clinic']);
  });

  it('should enable Download Merge Report once a workspace to merge into is chosen and pass one or both ids', async () => {
    render(dialog());
    expect(reportButton()).toBeDisabled();
    expect(screen.getByText(reportHint, { exact: false })).toBeInTheDocument();

    await choose(fromInput(), 'North Clinic');
    expect(reportButton()).toBeDisabled();

    await choose(intoInput(), 'South Clinic');
    expect(screen.queryByText(reportHint, { exact: false })).not.toBeInTheDocument();
    await userEvent.click(reportButton());
    expect(props.onGenerateReport).toHaveBeenLastCalledWith({ targetId: 'south', sourceId: 'north' });

    await userEvent.type(fromInput(), '{backspace}');
    await userEvent.click(reportButton());
    expect(props.onGenerateReport).toHaveBeenLastCalledWith({ targetId: 'south', sourceId: null });
  });

  it('should enable Merge only once both workspaces are chosen', async () => {
    render(dialog());
    expect(mergeButton()).toBeDisabled();

    await choose(intoInput(), 'South Clinic');
    expect(mergeButton()).toBeDisabled();

    await choose(fromInput(), 'North Clinic');
    expect(mergeButton()).toBeEnabled();
  });

  it('should ask for confirmation before merging and keep the choices when it is cancelled', async () => {
    render(dialog());
    await choose(fromInput(), 'North Clinic');
    await choose(intoInput(), 'South Clinic');
    await choose(tagInput(), 'Imported');

    await userEvent.click(mergeButton());
    await userEvent.click(confirmDialog().getByRole('button', { name: 'Cancel', hidden: true }));
    expect(props.onMerge).not.toHaveBeenCalled();
    expect(mergeDialog().getByText('North Clinic')).toBeInTheDocument();
    expect(mergeDialog().getByText('South Clinic')).toBeInTheDocument();
    expect(mergeDialog().getByText('Imported')).toBeInTheDocument();

    await confirmMerge();
    expect(props.onMerge).toHaveBeenCalledWith({
      sourceId: 'north',
      targetId: 'south',
      sourcePatientTag: 'Imported',
      sourcePatientSite: null,
      confirmed: true,
    });
  });

  it('should clear both pickers once it has closed', async () => {
    const { rerender } = render(dialog());
    await choose(fromInput(), 'North Clinic');
    await choose(intoInput(), 'South Clinic');

    rerender(dialog({ open: false }));

    await waitFor(() => expect(screen.queryByText('North Clinic')).not.toBeInTheDocument());
    expect(screen.queryByText('South Clinic')).not.toBeInTheDocument();
    expect(mergeButton()).toBeDisabled();
    expect(reportButton()).toBeDisabled();
  });

  describe('tag and site for source patients', () => {
    it('should show a placeholder sentence until both workspaces are chosen, then the fields', async () => {
      const placeholder = 'Once both workspaces are chosen, you can give every moved patient one tag and one site.';
      render(dialog());
      await choose(intoInput(), 'South Clinic');
      expect(screen.getByText(placeholder)).toBeInTheDocument();
      expect(screen.queryByLabelText('Tag')).not.toBeInTheDocument();
      expect(screen.queryByLabelText('Site')).not.toBeInTheDocument();

      await choose(fromInput(), 'North Clinic');
      expect(screen.queryByText(placeholder)).not.toBeInTheDocument();
      expect(tagInput()).toBeInTheDocument();
      expect(siteInput()).toBeInTheDocument();
      expect(screen.getByText(
        'Give every patient from North Clinic one tag and one site so they are easy to find after the merge. A new tag or site is created in South Clinic if it doesn\'t already exist there.'
      )).toBeInTheDocument();
    });

    it('should offer the tags and sites of the workspace being merged into', async () => {
      render(dialog());
      await choose(fromInput(), 'North Clinic');
      await choose(intoInput(), 'South Clinic');

      await userEvent.click(tagInput());
      expect(optionNames()).toEqual(['Dawn Cohort', 'Imported']);

      await userEvent.click(siteInput());
      expect(optionNames()).toEqual(['Main Campus']);
    });

    it('should pass an existing tag and a newly typed, trimmed site by name', async () => {
      render(dialog());
      await choose(fromInput(), 'North Clinic');
      await choose(intoInput(), 'South Clinic');

      await choose(tagInput(), 'Imported');
      await userEvent.type(siteInput(), 'West Annex[Space][Space]');
      await userEvent.click(option('Create "West Annex"'));
      await confirmMerge();

      expect(props.onMerge).toHaveBeenCalledWith({
        sourceId: 'north',
        targetId: 'south',
        sourcePatientTag: 'Imported',
        sourcePatientSite: 'West Annex',
        confirmed: true,
      });
    });

    it.each([
      ['longer than a tag name allows', 'A tag name over twenty', 'Tag name max length is 20 characters'],
      ['with a character a tag name does not allow', 'Imported!', 'Allowed special characters: - _ + > <'],
    ])('should explain instead of offering to create a tag %s', async (_, name, message) => {
      render(dialog());
      await choose(fromInput(), 'North Clinic');
      await choose(intoInput(), 'South Clinic');

      await userEvent.type(tagInput(), name);

      expect(optionNames()).toEqual([]);
      expect(screen.getByText(message)).toBeInTheDocument();
    });

    it('should not offer to create a tag that differs from an existing one only by case', async () => {
      render(dialog());
      await choose(fromInput(), 'North Clinic');
      await choose(intoInput(), 'South Clinic');

      await userEvent.type(tagInput(), 'imported');

      expect(optionNames()).toEqual(['Imported']);
    });

    it('should clear the tag and site when the workspace to merge into changes', async () => {
      render(dialog());
      await choose(fromInput(), 'North Clinic');
      await choose(intoInput(), 'South Clinic');
      await choose(tagInput(), 'Imported');
      await choose(siteInput(), 'Main Campus');

      await choose(intoInput(), 'East Hospital');
      await confirmMerge();

      expect(props.onMerge).toHaveBeenCalledWith({
        sourceId: 'north',
        targetId: 'east',
        sourcePatientTag: null,
        sourcePatientSite: null,
        confirmed: true,
      });
    });
  });
});
