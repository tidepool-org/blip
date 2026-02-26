/* global chai */
/* global describe */
/* global sinon */
/* global it */
/* global beforeEach */

import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import { __mockListReleases as mockListReleases } from '@octokit/rest';

import UploaderButton from '../../../app/components/uploaderbutton';
import { URL_UPLOADER_DOWNLOAD_PAGE } from '../../../app/core/constants';
import utils from '../../../app/core/utils';

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

jest.mock('../../../app/core/utils', () => ({
  __esModule: true,
  default: {
    getUploaderDownloadURL: jest.fn(),
  },
}));

const expect = chai.expect;

describe('UploaderButton', function () {
  const props = {
    buttonText: 'Get the Tidepool Uploader',
    onClick: sinon.spy(),
  };

  beforeEach(() => {
    props.onClick.resetHistory();
    mockListReleases.mockReset();
    utils.getUploaderDownloadURL.mockReset();
    mockListReleases.mockResolvedValue({ data: [] });
    utils.getUploaderDownloadURL.mockReturnValue({});
  });

  it('should be a function', function () {
    expect(UploaderButton).to.be.a('function');
  });

  describe('render', function () {
    it('should render without problems', function () {
      const { container } = render(<UploaderButton {...props} />);
      expect(container.querySelector('.btn-download-mac')).to.exist;
    });

    it('should have a Mac and a Windows Download button', function () {
      const { container } = render(<UploaderButton {...props} />);
      expect(container.querySelectorAll('button.btn-download-mac').length).to.equal(1);
      expect(container.querySelectorAll('button.btn-download-win').length).to.equal(1);
    });

    it('should have disabled download buttons if no URLs have been set', async () => {
      const { container } = render(<UploaderButton {...props} />);

      await waitFor(() => {
        expect(container.querySelector('button.btn-download-mac').disabled).to.equal(true);
        expect(container.querySelector('button.btn-download-win').disabled).to.equal(true);
      });
    });

    it('should have active buttons if URLs have been set', async () => {
      utils.getUploaderDownloadURL.mockReturnValue({
        latestMacRelease: 'https://example.com/mac',
        latestWinRelease: 'https://example.com/win',
      });

      const { container } = render(<UploaderButton {...props} />);

      await waitFor(() => {
        expect(container.querySelector('button.btn-download-mac').disabled).to.equal(false);
        expect(container.querySelector('button.btn-download-win').disabled).to.equal(false);
      });
    });

    it('should display error button if error retrieving github releases', async () => {
      mockListReleases.mockRejectedValueOnce(new Error('release error'));
      const { container } = render(<UploaderButton {...props} />);

      await waitFor(() => {
        const errorLink = container.querySelector(`a[href="${URL_UPLOADER_DOWNLOAD_PAGE}"]`);
        expect(errorLink).to.exist;
        expect(container.querySelector('button.btn-uploader-download')).to.exist;
      });
    });

    it('should respond to onClick on Mac Download Button', async () => {
      utils.getUploaderDownloadURL.mockReturnValue({
        latestMacRelease: 'https://example.com/mac',
        latestWinRelease: 'https://example.com/win',
      });
      const { container } = render(<UploaderButton {...props} />);

      await waitFor(() => expect(container.querySelector('a.link-download-mac')).to.exist);
      fireEvent.click(container.querySelector('a.link-download-mac'));
      expect(props.onClick.calledOnce).to.equal(true);
    });

    it('should respond to onClick on Windows Download Button', async () => {
      utils.getUploaderDownloadURL.mockReturnValue({
        latestMacRelease: 'https://example.com/mac',
        latestWinRelease: 'https://example.com/win',
      });
      const { container } = render(<UploaderButton {...props} />);

      await waitFor(() => expect(container.querySelector('a.link-download-win')).to.exist);
      fireEvent.click(container.querySelector('a.link-download-win'));
      expect(props.onClick.calledOnce).to.equal(true);
    });

    it('should respond to an onClick event on Download Error Button', async () => {
      mockListReleases.mockRejectedValueOnce(new Error('release error'));
      const { container } = render(<UploaderButton {...props} />);

      await waitFor(() => expect(container.querySelector('a.link-uploader-download')).to.exist);
      fireEvent.click(container.querySelector('a.link-uploader-download'));
      expect(container.querySelector(`a[href="${URL_UPLOADER_DOWNLOAD_PAGE}"]`)).to.exist;
      expect(props.onClick.calledOnce).to.equal(true);
    });
  });
});
