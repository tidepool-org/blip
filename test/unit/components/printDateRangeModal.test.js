/* global chai */
/* global describe */
/* global sinon */
/* global it */
/* global beforeEach */
/* global afterEach */
/* global context */

import React from 'react';
import moment from 'moment-timezone';
import { render, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { MemoryRouter } from 'react-router-dom';
import configureStore from 'redux-mock-store';

jest.mock('../../../app/core/metricUtils');
import { trackMetric as mockTrackMetric } from '../../../app/core/metricUtils';

import PrintDateRangeModal from '../../../app/components/PrintDateRangeModal';
import { DEFAULT_CGM_SAMPLE_INTERVAL_RANGE } from '../../../app/core/constants';

const expect = chai.expect;

const mockStore = configureStore([]);

describe('PrintDateRangeModal', function () {
  const loggedInUserId = 'clinicianUserId123';
  const enabledChartsLocalKey = `${loggedInUserId}_PDFChartsEnabled`;
  const defaultRangesLocalKey = `${loggedInUserId}_PDFChartsSelectedRangeIndices`;

  const selectedClinicId = 'clinicId123';

  const store = mockStore({
    blip: {
      loggedInUserId,
      selectedClinicId,
      clinics: { [selectedClinicId]: { id: selectedClinicId, patientTags: [], sites: [] } },
    },
  });

  const wrapper = ({ children }) => (
    <Provider store={store}>
      <MemoryRouter>{children}</MemoryRouter>
    </Provider>
  );

  const props = {
    loggedInUserId,
    mostRecentDatumDates: {
      agpBGM: Date.parse('2020-03-08T00:00:00.000Z'),
      agpCGM: Date.parse('2020-03-10T00:00:00.000Z'),
      basics: Date.parse('2020-03-10T00:00:00.000Z'),
      bgLog: Date.parse('2020-03-12T00:00:00.000Z'),
      daily: Date.parse('2020-03-05T00:00:00.000Z'),
    },
    open: true,
    onClose: sinon.stub(),
    onClickPrint: sinon.stub(),
    processing: false,
    timePrefs: { timezoneName: 'UTC' },
    trackMetric: sinon.stub(),
  };

  let rendered;
  const get = (selector) => document.body.querySelector(selector);
  const getAll = (selector) => Array.from(document.body.querySelectorAll(selector));
  const numValue = el => Number(el.value);

  beforeEach(() => {
    localStorage.removeItem(enabledChartsLocalKey);
    localStorage.removeItem(defaultRangesLocalKey);
    rendered = render(<PrintDateRangeModal {...props} />, { wrapper });
  });

  afterEach(() => {
    rendered && rendered.unmount();
    props.onClose.reset();
    props.onClickPrint.reset();
    mockTrackMetric.mockReset();
  });

  it('should be visible when open prop is true', () => {
    expect(get('.MuiDialog-container').style.opacity).to.equal('1');
    rendered.rerender(<PrintDateRangeModal {...props} open={false} />);
    expect(get('.MuiDialog-container').style.opacity).to.equal('0');
  });

  it('should provide toggles to enable/disable each chart, enabled by default', () => {
    expect(get('input[name="enabled-agpCGM"]').checked).to.be.true;
    expect(get('input[name="enabled-agpBGM"]').checked).to.be.true;
    expect(get('input[name="enabled-basics"]').checked).to.be.true;
    expect(get('input[name="enabled-bgLog"]').checked).to.be.true;
    expect(get('input[name="enabled-daily"]').checked).to.be.true;
    expect(get('input[name="enabled-settings"]').checked).to.be.true;
  });

  it('should hide a section\'s range presets and date fields when disabled', () => {
    const basicsToggle = get('input[name="enabled-basics"]');
    expect(get('#days-basics button')).to.exist;
    expect(get('#basics-end-date')).to.exist;
    expect(get('#basics-start-date')).to.exist;

    fireEvent.click(basicsToggle);

    expect(get('input[name="enabled-basics"]').checked).to.be.false;
    expect(get('#days-basics button')).to.not.exist;
    expect(get('#basics-end-date')).to.not.exist;
    expect(get('#basics-start-date')).to.not.exist;
  });

  it('should persist selected range presets and enabled state', () => {
    expect(localStorage[enabledChartsLocalKey]).to.be.undefined;
    expect(localStorage[defaultRangesLocalKey]).to.be.undefined;

    fireEvent.click(get('input[name="enabled-basics"]'));
    expect(localStorage[enabledChartsLocalKey]).to.eql(JSON.stringify({
      agpBGM: true,
      agpCGM: true,
      basics: false,
      bgLog: true,
      daily: true,
      settings: true,
    }));

    expect(numValue(get('#days-agpCGM .selected'))).to.equal(14);
    fireEvent.click(getAll('#days-agpCGM button')[0]);
    expect(numValue(get('#days-agpCGM .selected'))).to.equal(7);

    expect(localStorage[defaultRangesLocalKey]).to.eql(JSON.stringify({
      agpBGM: 1,
      agpCGM: 0,
      basics: 0,
      bgLog: 2,
      daily: 0,
    }));

    // new render should load with the updated defaults from localStorage
    rendered.unmount();
    rendered = render(<PrintDateRangeModal {...props} />, { wrapper });
    expect(numValue(get('#days-agpCGM .selected'))).to.equal(7);
    expect(get('input[name="enabled-basics"]').checked).to.be.false;
  });

  it('should provide appropriate date ranges and selected defaults for each applicable chart', () => {
    const agpCGMButtons = getAll('#days-agpCGM button');
    expect(numValue(agpCGMButtons[0])).to.equal(7);
    expect(numValue(agpCGMButtons[1])).to.equal(14);
    expect(numValue(agpCGMButtons[2])).to.equal(30);
    expect(numValue(get('#days-agpCGM .selected'))).to.equal(14);

    const agpBGMButtons = getAll('#days-agpBGM button');
    expect(numValue(agpBGMButtons[0])).to.equal(14);
    expect(numValue(agpBGMButtons[1])).to.equal(30);
    expect(numValue(get('#days-agpBGM .selected'))).to.equal(30);

    const basicsButtons = getAll('#days-basics button');
    expect(numValue(basicsButtons[0])).to.equal(14);
    expect(numValue(basicsButtons[1])).to.equal(21);
    expect(numValue(basicsButtons[2])).to.equal(30);
    expect(numValue(get('#days-basics .selected'))).to.equal(14);

    const bgLogButtons = getAll('#days-bgLog button');
    expect(numValue(bgLogButtons[0])).to.equal(14);
    expect(numValue(bgLogButtons[1])).to.equal(21);
    expect(numValue(bgLogButtons[2])).to.equal(30);
    expect(numValue(get('#days-bgLog .selected'))).to.equal(30);

    const dailyButtons = getAll('#days-daily button');
    expect(numValue(dailyButtons[0])).to.equal(14);
    expect(numValue(dailyButtons[1])).to.equal(21);
    expect(numValue(dailyButtons[2])).to.equal(30);
    expect(numValue(get('#days-daily .selected'))).to.equal(14);
  });

  it('should provide appropriate date ranges and selected defaults for each applicable chart when invalid config stored in localStorage', () => {
    // Set invalid legacy localStorage (component was already rendered in beforeEach with clean state)
    localStorage.setItem(enabledChartsLocalKey, '{"agp":true,"basics":false,"bgLog":true,"daily":true,"settings":false}');
    localStorage.setItem(defaultRangesLocalKey, '{"agp":1,"basics":0,"bgLog":2,"daily":0}');

    // Component was mounted before invalid localStorage was set — verify defaults are still in effect
    expect(numValue(getAll('#days-agpCGM button')[0])).to.equal(7);
    expect(numValue(getAll('#days-agpCGM button')[1])).to.equal(14);
    expect(numValue(get('#days-agpCGM .selected'))).to.equal(14); // default range still selected

    expect(numValue(getAll('#days-agpBGM button')[0])).to.equal(14);
    expect(numValue(getAll('#days-agpBGM button')[1])).to.equal(30);
    expect(numValue(get('#days-agpBGM .selected'))).to.equal(30); // default range still selected

    expect(numValue(getAll('#days-basics button')[0])).to.equal(14);
    expect(numValue(getAll('#days-basics button')[1])).to.equal(21);
    expect(numValue(getAll('#days-basics button')[2])).to.equal(30);
    expect(numValue(get('#days-basics .selected'))).to.equal(14);

    expect(numValue(getAll('#days-bgLog button')[0])).to.equal(14);
    expect(numValue(getAll('#days-bgLog button')[1])).to.equal(21);
    expect(numValue(getAll('#days-bgLog button')[2])).to.equal(30);
    expect(numValue(get('#days-bgLog .selected'))).to.equal(30);

    expect(numValue(getAll('#days-daily button')[0])).to.equal(14);
    expect(numValue(getAll('#days-daily button')[1])).to.equal(21);
    expect(numValue(getAll('#days-daily button')[2])).to.equal(30);
    expect(numValue(get('#days-daily .selected'))).to.equal(14);
  });

  it('should set appropriate default dates and timezone-adjusted values', () => {
    const dateFormat = 'MMM D, YYYY';

    expect(get('#basics-end-date').value).to.equal('Mar 10, 2020');
    expect(get('#basics-start-date').value).to.equal(
      moment.utc('Mar 10, 2020', dateFormat).subtract(14, 'days').format(dateFormat)
    );

    expect(get('#bgLog-end-date').value).to.equal('Mar 12, 2020');
    expect(get('#bgLog-start-date').value).to.equal(
      moment.utc('Mar 12, 2020', dateFormat).subtract(29, 'days').format(dateFormat)
    );

    expect(get('#daily-end-date').value).to.equal('Mar 5, 2020');
    expect(get('#daily-start-date').value).to.equal(
      moment.utc('Mar 5, 2020', dateFormat).subtract(13, 'days').format(dateFormat)
    );

    rendered.unmount();
    rendered = render(<PrintDateRangeModal {...{ ...props, timePrefs: { timezoneName: 'US/Pacific' } }} />, { wrapper });

    expect(get('#basics-end-date').value).to.equal('Mar 9, 2020 (5:00 PM)');
    expect(get('#basics-start-date').value).to.equal('Feb 24, 2020 (5:00 PM)');
  });

  context('form is submitted', () => {
    it('should call onClickPrint with expected options on submit', () => {
      fireEvent.click(get('input[name="enabled-bgLog"]'));
      fireEvent.click(getAll('#days-daily button')[2]);

      fireEvent.click(get('button.print-submit'));

      sinon.assert.calledOnce(props.onClickPrint);
      sinon.assert.calledWith(props.onClickPrint, {
        agpBGM: {
          disabled: false, endpoints: [
            moment.utc(Date.parse('2020-03-09T00:00:00.000Z')).subtract(30, 'days').valueOf(),
            Date.parse('2020-03-09T00:00:00.000Z'),
          ]
        },
        agpCGM: {
          disabled: false, endpoints: [
            moment.utc(Date.parse('2020-03-11T00:00:00.000Z')).subtract(14, 'days').valueOf(),
            Date.parse('2020-03-11T00:00:00.000Z'),
          ]
        },
        basics: {
          disabled: false, endpoints: [
            moment.utc(Date.parse('2020-03-10T00:00:00.000Z')).subtract(14, 'days').valueOf(),
            Date.parse('2020-03-10T00:00:00.000Z'),
          ]
        },
        bgLog: {
          disabled: true, endpoints: [
            moment.utc(Date.parse('2020-03-13T00:00:00.000Z')).subtract(30, 'days').valueOf(),
            Date.parse('2020-03-13T00:00:00.000Z'),
          ]
        },
        daily: {
          cgmSampleIntervalRange: DEFAULT_CGM_SAMPLE_INTERVAL_RANGE,
          disabled: false,
          endpoints: [
            moment.utc(Date.parse('2020-03-06T00:00:00.000Z')).subtract(30, 'days').valueOf(),
            Date.parse('2020-03-06T00:00:00.000Z'),
          ]
        },
        settings: { disabled: false },
      });
    });

    it('should show validation errors and block submit when invalid', () => {
      fireEvent.click(get('#basics-content button.DateRangePickerInput_clearDates'));
      fireEvent.click(get('button.print-submit'));

      sinon.assert.notCalled(props.onClickPrint);
      expect(get('#basics-error').textContent).to.equal('Please select a date range');
    });

    it('should require at least one chart enabled before submit', () => {
      fireEvent.click(get('input[name="enabled-agpBGM"]'));
      fireEvent.click(get('input[name="enabled-agpCGM"]'));
      fireEvent.click(get('input[name="enabled-basics"]'));
      fireEvent.click(get('input[name="enabled-bgLog"]'));
      fireEvent.click(get('input[name="enabled-daily"]'));
      fireEvent.click(get('input[name="enabled-settings"]'));

      fireEvent.click(get('button.print-submit'));

      sinon.assert.notCalled(props.onClickPrint);
      expect(get('#general-print-error').textContent).to.equal('Please enable at least one chart to print');
    });

    it('should send metric for print options', () => {
      fireEvent.click(get('input[name="enabled-bgLog"]'));
      fireEvent.click(getAll('#days-daily button')[2]);
      fireEvent.click(get('button.print-submit'));

      expect(mockTrackMetric.mock.calls[0]).to.deep.equal(['Submitted Print Options', {
        source: 'Unknown',
        agpBGM: '30 days',
        agpCGM: '14 days',
        basics: '14 days',
        bgLog: 'disabled',
        daily: '30 days',
        settings: 'enabled',
      }]);
    });
  });

  describe('tags and clinic sites', () => {
    const patientTags = [{ id: 'tag-a', name: 'A tag' }, { id: 'tag-b', name: 'B tag' }];
    const sites = [{ id: 'site-a', name: 'A site' }];

    // The panels seed their selection when the dialog mounts, so each case renders fresh
    // rather than re-rendering the suite's default (propless) instance.
    const renderWith = (extraProps = { patientTags, sites }) => {
      rendered.unmount();
      rendered = render(<PrintDateRangeModal {...props} {...extraProps} />, { wrapper });
    };

    // The panels render the same react-select multi the Edit Patient Details form uses
    const prefix = (key) => (key === 'tags' ? 'PatientFormSelectTags' : 'PatientFormSelectSites');
    const chipNames = (key) => getAll(`.${prefix(key)}__multi-value__label`).map(el => el.textContent);
    const removeChip = (key, i) => fireEvent.click(getAll(`.${prefix(key)}__multi-value__remove`)[i]);

    // react-select opens its menu on mousedown, so the overflow control needs the full sequence
    const clickOverflow = (key) => {
      const trigger = get(`#${key}-content .value-overflow-count`);
      fireEvent.mouseDown(trigger);
      fireEvent.click(trigger);
    };
    const submit = () => fireEvent.click(get('button.print-submit'));

    const manyTags = Array.from({ length: 25 }, (_, i) => ({
      id: `tag-${i}`,
      name: `Tag ${String(i).padStart(2, '0')}`,
    }));

    it('should not render either panel when the patient has no tags or sites', () => {
      expect(get('#tags-header')).to.not.exist;
      expect(get('#clinicSites-header')).to.not.exist;
    });

    it('should render both panels after Device Settings with everything selected', () => {
      renderWith();

      const headerIds = getAll('[id$="-header"]').map(el => el.id);
      expect(headerIds).to.eql([
        'agpCGM-header',
        'agpBGM-header',
        'basics-header',
        'daily-header',
        'bgLog-header',
        'settings-header',
        'tags-header',
        'clinicSites-header',
      ]);

      expect(get('input[name="enabled-tags"]').checked).to.be.true;
      expect(get('input[name="enabled-clinicSites"]').checked).to.be.true;
      expect(get('#export-all-tags').checked).to.be.true;
      expect(get('#export-all-clinicSites').checked).to.be.true;
      expect(chipNames('tags')).to.eql(['A tag', 'B tag']);
      expect(chipNames('clinicSites')).to.eql(['A site']);
      expect(get('#tags-content .value-overflow-count')).to.not.exist;
    });

    it('should drop a removed chip from the selection and uncheck "Export all"', () => {
      renderWith();
      removeChip('tags', 0);

      expect(get('#export-all-tags').checked).to.be.false;

      submit();
      expect(props.onClickPrint.getCall(0).args[0].tagSelection).to.eql({ enabled: true, ids: ['tag-b'] });
    });

    it('should clear the selection when "Export all" is unchecked and restore it when re-checked', () => {
      renderWith();

      fireEvent.click(get('#export-all-tags'));
      expect(chipNames('tags')).to.eql([]);

      submit();
      expect(props.onClickPrint.getCall(0).args[0].tagSelection).to.eql({ enabled: true, ids: [] });

      fireEvent.click(get('#export-all-tags'));
      expect(chipNames('tags')).to.eql(['A tag', 'B tag']);

      submit();
      expect(props.onClickPrint.getCall(1).args[0].tagSelection).to.eql({ enabled: true, ids: ['tag-a', 'tag-b'] });
    });

    it('should hide a panel\'s body and submit it as disabled when its toggle is off', () => {
      renderWith();
      fireEvent.click(get('input[name="enabled-clinicSites"]'));

      expect(get('#clinicSites-content')).to.not.exist;
      expect(get('#tags-content')).to.exist;

      submit();
      expect(props.onClickPrint.getCall(0).args[0].clinicSiteSelection.enabled).to.be.false;
    });

    it('should render 20 chips and collapse the rest behind a "+N" that reveals them', () => {
      renderWith({ patientTags: manyTags, sites });

      expect(chipNames('tags')).to.have.lengthOf(20);
      expect(get('#tags-content .value-overflow-count').textContent).to.equal('+5');

      // The cap is presentational — every tag is still submitted
      submit();
      expect(props.onClickPrint.getCall(0).args[0].tagSelection.ids).to.have.lengthOf(25);

      clickOverflow('tags');

      expect(chipNames('tags')).to.have.lengthOf(25);
      expect(get('#tags-content .value-overflow-count')).to.not.exist;
    });

    it('should leave the select menu closed when the "+N" is clicked', () => {
      renderWith({ patientTags: manyTags, sites });
      clickOverflow('tags');

      expect(get('.PatientFormSelectTags__menu')).to.not.exist;
    });

    it('should label both panels with their export limits', () => {
      renderWith();

      expect(get('#tags-content').textContent).to.contain('Export all Tags (50 tags max)');
      expect(get('#tags-content').textContent).to.contain('Or select from your tags (20 tags max)');
      expect(get('#clinicSites-content').textContent).to.contain('Export all patient clinic sites (50 sites max)');
      expect(get('#clinicSites-content').textContent).to.contain('Select from your clinic sites (20 sites max)');
    });

    it('should not write the new panels into the persisted enabled map', () => {
      renderWith();
      fireEvent.click(get('input[name="enabled-tags"]'));
      fireEvent.click(get('input[name="enabled-basics"]'));

      expect(JSON.parse(localStorage[enabledChartsLocalKey])).to.eql({
        agpBGM: true,
        agpCGM: true,
        basics: false,
        bgLog: true,
        daily: true,
        settings: true,
      });
    });

    it('should still require at least one chart when only the new panels are enabled', () => {
      renderWith();

      ['agpCGM', 'agpBGM', 'basics', 'daily', 'bgLog', 'settings'].forEach(key => {
        fireEvent.click(get(`input[name="enabled-${key}"]`));
      });

      submit();

      expect(get('#general-print-error').textContent).to.equal('Please enable at least one chart to print');
      sinon.assert.notCalled(props.onClickPrint);
    });

    it('should report the new sections in the print options metric', () => {
      renderWith();
      removeChip('tags', 0);
      fireEvent.click(get('input[name="enabled-clinicSites"]'));

      submit();

      expect(mockTrackMetric.mock.calls[0][1]).to.include({
        tags: 'partial',
        clinicSites: 'disabled',
      });
    });
  });

  it('should run `onClose` prop method when "Cancel" button is clicked', () => {
    fireEvent.click(get('button.print-cancel'));
    sinon.assert.calledOnce(props.onClose);
  });

  it('should run `onClose` prop method when the close icon is clicked', () => {
    fireEvent.click(get('button[aria-label="close dialog"]'));
    sinon.assert.calledOnce(props.onClose);
  });
});
