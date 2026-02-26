/**
 * Copyright (c) 2017, Tidepool Project
 *
 * This program is free software; you can redistribute it and/or modify it under
 * the terms of the associated License, which is identical to the BSD 2-Clause
 * License as published by the Open Source Initiative at opensource.org.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the License for more details.
 *
 * You should have received a copy of the License along with this program; if
 * not, you can obtain one from Tidepool Project at tidepool.org.
 */
/* global chai */
/* global describe */
/* global sinon */
/* global it */
/* global beforeEach */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { __mockListReleases as mockListReleases } from '@octokit/rest';

import UploadLaunchOverlay from '../../../app/components/uploadlaunchoverlay';
import ModalOverlay from '../../../app/components/modaloverlay';
import { URL_UPLOADER_DOWNLOAD_PAGE } from '../../../app/core/constants';

jest.mock('@octokit/rest', () => {
  const __mockListReleases = jest.fn();
  return {
    __mockListReleases,
    Octokit: jest.fn(() => ({
      repos: {
        listReleases: __mockListReleases,
      },
    })),
  };
});

const expect = chai.expect;

describe('UploadLaunchOverlay', function () {
  const props = {
    modalDismissHandler: sinon.spy(),
  };

  beforeEach(() => {
    props.modalDismissHandler.resetHistory();
    mockListReleases.mockReset();
    mockListReleases.mockResolvedValue({ data: [] });
  });

  it('should be a function', function() {
    expect(UploadLaunchOverlay).to.be.a('function');
  });

  describe('render', function() {
    it('should render without problems', function () {
      const { container } = render(<UploadLaunchOverlay {...props} />);
      expect(container.querySelector('.UploadLaunchOverlay')).to.exist;
      expect(container.querySelector('.ModalOverlay')).to.exist;
    });

    it('should respond to an onClick event', () => {
      const { container } = render(<UploadLaunchOverlay {...props} />);
      const callCount = props.modalDismissHandler.callCount;
      fireEvent.click(container.querySelector('.ModalOverlay-target'));
      expect(props.modalDismissHandler.callCount).to.equal(callCount + 1);
    });

    it('dismiss button should respond to an onClick event', () => {
      const { container } = render(<UploadLaunchOverlay {...props} />);
      const callCount = props.modalDismissHandler.callCount;
      fireEvent.click(container.querySelector('.ModalOverlay-dismiss'));
      expect(props.modalDismissHandler.callCount).to.equal(callCount + 1);
    });

    it('should have disabled download buttons if no URLs have been set', async () => {
      const { container } = render(<UploadLaunchOverlay {...props} />);

      await waitFor(() => {
        const macButton = container.querySelector('button.btn-download-mac');
        const winButton = container.querySelector('button.btn-download-win');

        expect(macButton).to.exist;
        expect(winButton).to.exist;
        expect(macButton.disabled).to.equal(true);
        expect(winButton.disabled).to.equal(true);
      });
    });

    it('should have active buttons if URLs have been set', async () => {
      mockListReleases.mockResolvedValue({
        // eslint-disable-next-line camelcase
        data: [{ prerelease: false, tag_name: 'v2.3.4' }],
      });

      const { container } = render(<UploadLaunchOverlay {...props} />);

      await waitFor(() => {
        const macButton = container.querySelector('button.btn-download-mac');
        const winButton = container.querySelector('button.btn-download-win');
        expect(macButton).to.exist;
        expect(winButton).to.exist;
        expect(macButton.disabled).to.equal(false);
        expect(winButton.disabled).to.equal(false);

        const anchors = container.querySelectorAll('a');
        expect(anchors.length).to.be.greaterThan(0);
        expect(container.querySelectorAll('a.disabled').length).to.equal(0);
      });
    });

    it('should display download link if error retrieving github releases', async () => {
      mockListReleases.mockRejectedValueOnce(new Error('release error'));
      const { container } = render(<UploadLaunchOverlay {...props} />);

      await waitFor(() => {
        expect(container.querySelector(`a[href="${URL_UPLOADER_DOWNLOAD_PAGE}"]`)).to.exist;
      });
    });
  });
});
