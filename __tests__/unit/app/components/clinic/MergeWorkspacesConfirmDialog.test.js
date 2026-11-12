/* global jest, expect, describe, beforeEach, it */

import React from 'react';

import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

import MergeWorkspacesConfirmDialog from '@app/components/clinic/MergeWorkspacesConfirmDialog';

describe('MergeWorkspacesConfirmDialog', () => {
  const props = {
    open: true,
    onClose: jest.fn(),
    onConfirm: jest.fn(),
    sourceName: 'North Clinic',
    targetName: 'South Clinic',
  };

  const checkbox = () => screen.getByRole('checkbox');
  const mergeButton = () => screen.getByRole('button', { name: 'Merge' });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  const checklist = () => screen.getAllByRole('listitem').map(item => item.textContent);

  it.each([
    ['a tag and a site', { sourcePatientTag: 'Imported', sourcePatientSite: 'Main Campus' }, 'Moved patients get the tag Imported and the site Main Campus.'],
    ['only a tag', { sourcePatientTag: 'Imported' }, 'Moved patients get the tag Imported.'],
    ['only a site', { sourcePatientSite: 'Main Campus' }, 'Moved patients get the site Main Campus.'],
  ])('should list the move, %s and the permanent deletion', (_, labels, labelsLine) => {
    render(<MergeWorkspacesConfirmDialog {...props} {...labels} />);

    expect(checklist()).toEqual([
      'Every patient in North Clinic moves into South Clinic.',
      labelsLine,
      'North Clinic is permanently deleted. This can\'t be undone.',
    ]);
  });

  it('should leave out the tag and site line when neither is chosen', () => {
    render(<MergeWorkspacesConfirmDialog {...props} />);

    expect(checklist()).toEqual([
      'Every patient in North Clinic moves into South Clinic.',
      'North Clinic is permanently deleted. This can\'t be undone.',
    ]);
  });

  it('should confirm only after the checkbox is checked', async () => {
    render(<MergeWorkspacesConfirmDialog {...props} />);
    expect(checkbox()).not.toBeChecked();
    expect(mergeButton()).toBeDisabled();

    await userEvent.click(mergeButton());
    expect(props.onConfirm).not.toHaveBeenCalled();

    await userEvent.click(checkbox());
    await userEvent.click(mergeButton());
    expect(props.onConfirm).toHaveBeenCalledTimes(1);
  });

  it('should uncheck the checkbox once it has closed', async () => {
    const { rerender } = render(<MergeWorkspacesConfirmDialog {...props} />);
    await userEvent.click(checkbox());

    rerender(<MergeWorkspacesConfirmDialog {...props} open={false} />);

    await waitFor(() => expect(screen.getByRole('checkbox', { hidden: true })).not.toBeChecked());
  });

  it('should stay open while the merge is processing', async () => {
    const { rerender } = render(<MergeWorkspacesConfirmDialog {...props} />);
    await userEvent.keyboard('{Escape}');
    expect(props.onClose).toHaveBeenCalledTimes(1);

    rerender(<MergeWorkspacesConfirmDialog {...props} processing />);
    await userEvent.keyboard('{Escape}');
    expect(props.onClose).toHaveBeenCalledTimes(1);
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeDisabled();
  });
});
