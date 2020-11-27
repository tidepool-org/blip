/*
 * == BSD2 LICENSE ==
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
 * == BSD2 LICENSE ==
 */

import _ from 'lodash';
import i18next from 'i18next';

import BasicsPrintView from '../../../src/modules/print/BasicsPrintView';
import PrintView from '../../../src/modules/print/PrintView';
import * as patients from '../../../data/patient/profiles';
import * as settings from '../../../data/patient/settings';

import { basicsData as data } from '../../../data/print/fixtures';
import { MS_IN_HOUR } from '../../../src/utils/constants';

import {
  DEFAULT_FONT_SIZE,
  FOOTER_FONT_SIZE,
  HEADER_FONT_SIZE,
  LARGE_FONT_SIZE,
  SMALL_FONT_SIZE,
  EXTRA_SMALL_FONT_SIZE,
} from '../../../src/modules/print/utils/constants';

import Doc from '../../helpers/pdfDoc';

describe('BasicsPrintView', () => {
  let Renderer;

  const DPI = 72;
  const MARGIN = DPI / 2;

  let doc;

  const opts = {
    bgPrefs: {
      bgBounds: {
        veryHighThreshold: 300,
        targetUpperBound: 180,
        targetLowerBound: 70,
        veryLowThreshold: 54,
      },
      bgUnits: 'mg/dL',
    },
    debug: false,
    dpi: DPI,
    defaultFontSize: DEFAULT_FONT_SIZE,
    footerFontSize: FOOTER_FONT_SIZE,
    headerFontSize: HEADER_FONT_SIZE,
    largeFontSize: LARGE_FONT_SIZE,
    smallFontSize: SMALL_FONT_SIZE,
    extraSmallFontSize: EXTRA_SMALL_FONT_SIZE,
    height: 11 * DPI - (2 * MARGIN),
    margins: {
      left: MARGIN,
      top: MARGIN,
      right: MARGIN,
      bottom: MARGIN,
    },
    patient: {
      ...patients.standard,
      ...settings.cannulaPrimeSelected,
    },
    timePrefs: {
      timezoneAware: true,
      timezoneName: 'US/Pacific',
    },
    width: 8.5 * DPI - (2 * MARGIN),
    title: 'The Basics',
  };

  const stats = {
    averageDailyDose: { data: { raw: {
      totalInsulin: 30,
    } } },
    averageGlucose: { data: { raw: {
      averageGlucose: 120,
    } } },
    carbs: { data: { raw: {
      carbs: 10.2,
    } } },
    readingsInRange: { data: {
      raw: {
        target: MS_IN_HOUR * 3,
        veryLow: MS_IN_HOUR,
      },
      total: { value: MS_IN_HOUR * 4 },
    } },
    timeInRange: { data: {
      raw: {
        target: MS_IN_HOUR * 3,
        veryLow: MS_IN_HOUR,
      },
      total: { value: MS_IN_HOUR * 4 },
    } },
    timeInAuto: { data: {
      raw: {
        manual: MS_IN_HOUR * 3,
        automated: MS_IN_HOUR * 7,
      },
      total: { value: MS_IN_HOUR * 10 },
    } },
    totalInsulin: { data: { raw: {
      basal: 10,
      bolus: 20,
    } } },
  };

  const createRenderer = (renderData = data, renderOpts = opts) => (
    new BasicsPrintView(doc, renderData, renderOpts)
  );

  beforeEach(() => {
    doc = new Doc({ margin: MARGIN });
    Renderer = createRenderer({ ...data, stats });
  });

  describe('class constructor', () => {
    const filteredTypes = [
      'basal',
      'bolus',
      'reservoirChange',
      'tubingPrime',
      'cannulaPrime',
    ];

    const fingerstickTypes = [
      'smbg',
      'calibration',
    ];

    it('should instantiate without errors', () => {
      expect(Renderer).to.be.an('object');
    });

    it('should extend the `PrintView` class', () => {
      expect(Renderer instanceof PrintView).to.be.true;
    });

    it('should set it\'s own required initial instance properties', () => {
      const requiredProps = [
        { prop: 'bgSource', type: 'string' },
        { prop: 'cgmStatus', type: 'string' },
        { prop: 'source', type: 'string' },
        { prop: 'manufacturer', type: 'string' },
      ];

      _.each(requiredProps, item => {
        expect(Renderer[item.prop]).to.be.a(item.type);
        item.hasOwnProperty('value') && expect(Renderer[item.prop]).to.eql(item.value);
      });
    });

    it('should add section data', () => {
      expect(Renderer.data.sections).to.be.an('object');
    });

    _.forEach(filteredTypes, type => {
      it(`should reduce data by day for ${type} data`, () => {
        expect(Renderer.data.data[type].dataByDate).to.be.an('object');
      });
    });

    _.forEach(fingerstickTypes, type => {
      it(`should reduce data by day for ${type} data`, () => {
        expect(Renderer.data.data.fingerstick[type].dataByDate).to.be.an('object');
      });
    });

    it('should add the provided averageDailyCarbs stat data', () => {
      expect(Renderer.data.data.averageDailyCarbs).to.equal(10.2);
    });

    it('should add the provided averageDailyDose stat data', () => {
      expect(Renderer.data.data.averageDailyDose).to.eql({
          basal: 10,
          bolus: 20,
      });
    });

    it('should add the provided basalBolusRatio stat data', () => {
      expect(Renderer.data.data.basalBolusRatio).to.eql({
        basal: (10 / 30),
        bolus: (20 / 30),
      });
    });

    it('should add the provided timeInAutoRatio stat data', () => {
      expect(Renderer.data.data.timeInAutoRatio).to.eql({
        automated: 0.7,
        manual: 0.3,
      });
    });

    it('should add the provided totalDailyDose stat data', () => {
      expect(Renderer.data.data.totalDailyDose).to.equal(30);
    });

    it('should process infusion site history', () => {
      expect(Renderer.data.data.cannulaPrime.infusionSiteHistory).to.be.an('object');
      expect(Renderer.data.data.tubingPrime.infusionSiteHistory).to.be.an('object');
    });

    it('should process the section availability', () => {
      assert(!Renderer.data.sections.basals.disabled);

      const noBasalData = _.cloneDeep(data);
      noBasalData.data.basal.data = [];
      Renderer = createRenderer(noBasalData);

      assert(Renderer.data.sections.basals.disabled);
    });

    it('should add the first pdf page', () => {
      sinon.assert.calledOnce(Renderer.doc.addPage);
    });

    it('should initialize the page layout', () => {
      const initLayoutSpy = sinon.stub(BasicsPrintView.prototype, 'initLayout');
      Renderer = createRenderer();
      sinon.assert.calledOnce(Renderer.initLayout);

      initLayoutSpy.restore();
    });
  });

  describe('newPage', () => {
    let newPageSpy;

    beforeEach(() => {
      newPageSpy = sinon.spy(PrintView.prototype, 'newPage');
    });

    afterEach(() => {
      newPageSpy.restore();
    });

    it('should call the newPage method of the parent class with a date range string', () => {
      Renderer.newPage();
      sinon.assert.calledWith(PrintView.prototype.newPage, 'Date range: Sep 18 - Oct 7, 2017');
    });
  });

  describe('initCalendar', () => {
    it('should initialize the calendar data', () => {
      expect(Renderer.calendar).to.be.undefined;

      Renderer.initCalendar();

      expect(Renderer.calendar).to.be.an('object');
      expect(Renderer.calendar.labels).to.be.an('array');
      expect(Renderer.calendar.columns).to.be.an('array');
      expect(Renderer.calendar.days).to.eql(Renderer.data.days);
      expect(Renderer.calendar.pos).to.eql({});
      expect(Renderer.calendar.headerHeight).to.equal(15);
    });
  });

  describe('initLayout', () => {
    it('should initialize the page layout', () => {
      sinon.stub(Renderer, 'setLayoutColumns');

      Renderer.initLayout();

      sinon.assert.calledWithMatch(Renderer.setLayoutColumns, {
        type: 'percentage',
        width: Renderer.chartArea.width,
      });
    });
  });

  describe('render', () => {
    it('should call all the appropriate render methods', () => {
      sinon.stub(Renderer, 'renderLeftColumn');
      sinon.stub(Renderer, 'renderCenterColumn');
      sinon.stub(Renderer, 'renderRightColumn');

      Renderer.render();

      sinon.assert.calledOnce(Renderer.renderLeftColumn);
      sinon.assert.calledOnce(Renderer.renderCenterColumn);
      sinon.assert.calledOnce(Renderer.renderRightColumn);
    });
  });

  describe('renderLeftColumn', () => {
    it('should set the pdf cursor in the left column', () => {
      sinon.stub(Renderer, 'goToLayoutColumnPosition');

      Renderer.renderLeftColumn();

      sinon.assert.calledWith(Renderer.goToLayoutColumnPosition, 0);
    });

    it('should call all the appropriate render methods', () => {
      sinon.stub(Renderer, 'renderBgDistribution');
      sinon.stub(Renderer, 'renderAggregatedStats');

      Renderer.renderLeftColumn();

      sinon.assert.calledOnce(Renderer.renderBgDistribution);
      sinon.assert.calledOnce(Renderer.renderAggregatedStats);
    });
  });

  describe('renderCenterColumn', () => {
    it('should set the pdf cursor in the center column', () => {
      sinon.stub(Renderer, 'goToLayoutColumnPosition');

      Renderer.renderCenterColumn();

      sinon.assert.calledWith(Renderer.goToLayoutColumnPosition, 1);
    });

    it('should call the calendar init method', () => {
      sinon.spy(Renderer, 'initCalendar');

      Renderer.renderCenterColumn();

      sinon.assert.calledOnce(Renderer.initCalendar);
    });

    it('should render the smbg calendar section with the appropriate data', () => {
      sinon.stub(Renderer, 'renderCalendarSection');

      Renderer.renderCenterColumn();

      sinon.assert.calledWithMatch(Renderer.renderCalendarSection, {
        title: Renderer.data.sections.fingersticks.title,
        data: Renderer.data.data.fingerstick.smbg.dataByDate,
        type: 'smbg',
        disabled: Renderer.data.sections.fingersticks.disabled,
        emptyText: Renderer.data.sections.fingersticks.emptyText,
      });
    });

    it('should render the bolus calendar section with the appropriate data', () => {
      sinon.stub(Renderer, 'renderCalendarSection');

      Renderer.renderCenterColumn();

      sinon.assert.calledWithMatch(Renderer.renderCalendarSection, {
        title: Renderer.data.sections.boluses.title,
        data: Renderer.data.data.bolus.dataByDate,
        type: 'bolus',
        disabled: Renderer.data.sections.boluses.disabled,
        emptyText: Renderer.data.sections.boluses.emptyText,
      });
    });

    it('should render the sitechange calendar section with the appropriate data', () => {
      sinon.stub(Renderer, 'renderCalendarSection');
      const t = i18next.t.bind(i18next);

      Renderer.renderCenterColumn();
      sinon.assert.calledWithMatch(Renderer.renderCalendarSection, {
        title: {
          text: Renderer.data.sections.siteChanges.title,
          subText: `${t('from ')}${Renderer.data.sections.siteChanges.subTitle}`,
        },
        data: Renderer.data.data.cannulaPrime.infusionSiteHistory,
        type: 'siteChange',
        disabled: Renderer.data.sections.siteChanges.disabled,
        emptyText: Renderer.data.sections.siteChanges.emptyText,
      });
    });

    it('should render the basal calendar section with the appropriate data', () => {
      sinon.stub(Renderer, 'renderCalendarSection');

      Renderer.renderCenterColumn();

      sinon.assert.calledWithMatch(Renderer.renderCalendarSection, {
        title: Renderer.data.sections.basals.title,
        data: Renderer.data.data.basal.dataByDate,
        type: 'basal',
        disabled: Renderer.data.sections.basals.disabled,
        emptyText: Renderer.data.sections.basals.emptyText,
      });
    });
  });

  describe('renderRightColumn', () => {
    it('should set the pdf cursor in the right column', () => {
      sinon.stub(Renderer, 'goToLayoutColumnPosition');

      Renderer.renderRightColumn();

      sinon.assert.calledWith(Renderer.goToLayoutColumnPosition, 2);
    });

    it('should render the smbg calendar summary with the appropriate data', () => {
      sinon.stub(Renderer, 'renderCalendarSummary');

      Renderer.renderRightColumn();

      sinon.assert.calledWithMatch(Renderer.renderCalendarSummary, {
        filters: Renderer.data.sections.fingersticks.filters,
        header: Renderer.data.sections.fingersticks.summaryTitle,
        data: Renderer.data.data.fingerstick.summary,
        type: 'smbg',
        disabled: Renderer.data.sections.fingersticks.disabled,
      });
    });

    it('should render the bolus calendar summary with the appropriate data', () => {
      sinon.stub(Renderer, 'renderCalendarSummary');

      Renderer.renderRightColumn();

      sinon.assert.calledWithMatch(Renderer.renderCalendarSummary, {
        filters: Renderer.data.sections.boluses.filters,
        header: Renderer.data.sections.boluses.summaryTitle,
        data: Renderer.data.data.bolus.summary,
        type: 'bolus',
        disabled: Renderer.data.sections.boluses.disabled,
      });
    });

    it('should render the basal calendar summary with the appropriate data', () => {
      sinon.stub(Renderer, 'renderCalendarSummary');

      Renderer.renderRightColumn();

      sinon.assert.calledWithMatch(Renderer.renderCalendarSummary, {
        filters: Renderer.data.sections.basals.filters,
        header: Renderer.data.sections.basals.summaryTitle,
        data: Renderer.data.data.basal.summary,
        type: 'basal',
        disabled: Renderer.data.sections.basals.disabled,
      });
    });
  });

  describe('renderBgDistribution', () => {
    it('should render a section heading', () => {
      sinon.stub(Renderer, 'renderSectionHeading');

      Renderer.renderBgDistribution();

      sinon.assert.calledWith(Renderer.renderSectionHeading, 'BG Distribution');
    });

    it('should render the BG source', () => {
      expect(Renderer.bgSource).to.equal('cbg');

      Renderer.renderBgDistribution();

      sinon.assert.calledWith(Renderer.doc.text, 'Showing CGM data');

      Renderer.cgmStatus = 'noCGM';

      Renderer.doc.text.resetHistory();
      Renderer.renderBgDistribution();

      sinon.assert.calledWith(Renderer.doc.text, 'Showing BGM data (no CGM)');

      Renderer.cgmStatus = 'notEnoughCGM';

      Renderer.doc.text.resetHistory();
      Renderer.renderBgDistribution();

      sinon.assert.calledWith(Renderer.doc.text, 'Showing BGM data (not enough CGM)');
    });

    it('should render the BG distrubution empty text when BG source is unavailable', () => {
      const noBGData = _.cloneDeep(data);
      noBGData.data.cbg.data = [];
      noBGData.data.smbg.data = [];

      Renderer = createRenderer(noBGData);

      Renderer.renderBgDistribution();

      sinon.assert.calledWith(Renderer.doc.text, 'No BG data available');
    });
  });

  describe('renderAggregatedStats', () => {
    it('should render the average daily carbs stat', () => {
      sinon.stub(Renderer, 'renderSimpleStat');

      Renderer.renderAggregatedStats();

      sinon.assert.calledWith(Renderer.renderSimpleStat, 'Avg daily carbs');
    });

    it('should render the basal to bolus ratio', () => {
      sinon.stub(Renderer, 'renderRatio');

      Renderer.renderAggregatedStats();

      expect(Renderer.data.data.averageDailyDose.basal).to.be.a('number');
      expect(Renderer.data.data.averageDailyDose.bolus).to.be.a('number');

      expect(Renderer.data.data.basalBolusRatio.basal).to.be.a('number');
      expect(Renderer.data.data.basalBolusRatio.bolus).to.be.a('number');

      sinon.assert.calledWith(
        Renderer.renderRatio,
        'basalBolusRatio',
        {
          primary: Renderer.data.data.basalBolusRatio,
          secondary: Renderer.data.data.averageDailyDose,
        }
      );
    });

    it('should render the total daily dose stat', () => {
      sinon.stub(Renderer, 'renderSimpleStat');

      Renderer.renderAggregatedStats();

      sinon.assert.calledWith(Renderer.renderSimpleStat, 'Avg total daily dose');
    });
  });

  describe('renderRatio', () => {
    it('should render a simple disabled stat when disabled', () => {
      sinon.stub(Renderer, 'renderSimpleStat');

      Renderer.data.sections.basalBolusRatio.active = true;
      Renderer.data.sections.basalBolusRatio.disabled = true;

      Renderer.renderRatio('basalBolusRatio', {});

      sinon.assert.calledWith(
        Renderer.renderSimpleStat,
        { text: 'Insulin ratio' },
        '--',
        '',
        true
      );
    });

    it('should render a basal:bolus stat when not disabled', () => {
      sinon.stub(Renderer, 'renderTableHeading');
      sinon.stub(Renderer, 'renderTable');

      Renderer.data.sections.basalBolusRatio.active = true;
      Renderer.data.sections.basalBolusRatio.disabled = false;

      Renderer.renderRatio(
        'basalBolusRatio',
        {
          primary: {
            basal: 0.06,
            bolus: 0.94,
          },
          secondary: {
            basal: 1,
            bolus: 15,
          },
        }
      );

      sinon.assert.calledWith(Renderer.renderTableHeading, { text: 'Insulin ratio' });
      sinon.assert.calledOnce(Renderer.renderTable);
    });

    it('should render a time in auto stat when not disabled', () => {
      sinon.stub(Renderer, 'renderTableHeading');
      sinon.stub(Renderer, 'renderTable');

      Renderer.data.sections.timeInAutoRatio.active = true;
      Renderer.data.sections.timeInAutoRatio.disabled = false;

      Renderer.renderRatio(
        'timeInAutoRatio',
        {
          primary: {
            manual: 0.25,
            automated: 0.75,
          },
        }
      );

      sinon.assert.calledWith(Renderer.renderTableHeading, { text: 'Time in Automated ratio' });
      sinon.assert.calledOnce(Renderer.renderTable);
    });
  });

  describe('renderStackedStat', () => {
    const stat = {
      stat: 'my stat',
      primary: 10,
      secondary: 'stat summary',
    };

    it('should render a stacked stat with active styles', () => {
      sinon.stub(Renderer, 'renderSimpleStat');
      sinon.stub(Renderer, 'setFill');

      Renderer.renderStackedStat(
        {},
        { test: stat },
        true,
        { id: 'test' },
        {
          x: 100,
          y: 200,
        },
        {
          top: 0,
          left: 0,
        }
      );

      sinon.assert.callCount(Renderer.doc.text, 3);
      sinon.assert.calledWith(Renderer.doc.text, stat.stat);
      sinon.assert.calledWith(Renderer.doc.text, stat.primary);
      sinon.assert.calledWith(Renderer.doc.text, stat.secondary);

      sinon.assert.calledWith(Renderer.setFill, 'black', 1);
    });

    it('should render a stacked stat with disabled styles', () => {
      sinon.stub(Renderer, 'renderSimpleStat');
      sinon.stub(Renderer, 'setFill');

      Renderer.renderStackedStat(
        {},
        { test: stat },
        true,
        { id: 'test', disabled: true },
        {
          x: 100,
          y: 200,
        },
        {
          top: 0,
          left: 0,
        }
      );

      sinon.assert.callCount(Renderer.doc.text, 3);
      sinon.assert.calledWith(Renderer.doc.text, stat.stat);
      sinon.assert.calledWith(Renderer.doc.text, stat.primary);
      sinon.assert.calledWith(Renderer.doc.text, stat.secondary);

      sinon.assert.calledWith(Renderer.setFill, Renderer.colors.lightGrey, 1);
    });

    it('should not render secondary text if falsey', () => {
      sinon.stub(Renderer, 'setFill');

      Renderer.renderStackedStat(
        {},
        { test: _.assign({}, stat, { secondary: undefined }) },
        true,
        { id: 'test', disabled: true },
        {
          x: 100,
          y: 200,
        },
        {
          top: 0,
          left: 0,
        }
      );

      sinon.assert.callCount(Renderer.doc.text, 2);
      sinon.assert.calledWith(Renderer.doc.text, stat.stat);
      sinon.assert.calledWith(Renderer.doc.text, stat.primary);
    });
  });

  describe('renderPieChart', () => {
    const pieData = {
      data: [
        {
          value: 0.25,
          color: 'blue',
        },
        {
          value: 0.75,
          color: 'green',
        },
      ],
    };

    it('should render a pie chart', () => {
      sinon.stub(Renderer, 'setFill');

      Renderer.renderPieChart(
        {},
        { test: pieData },
        true,
        { id: 'test' },
        {
          x: 100,
          y: 200,
        },
        {
          top: 0,
          left: 0,
        }
      );

      sinon.assert.callCount(Renderer.setFill, 3);
      sinon.assert.calledWith(Renderer.setFill, 'blue', 1);
      sinon.assert.calledWith(Renderer.setFill, 'green', 1);

      sinon.assert.callCount(Renderer.doc.path, 2);
      sinon.assert.callCount(Renderer.doc.fill, 2);
    });
  });

  describe('defineStatColumns', () => {
    let defaultColumns;

    beforeEach(() => {
      Renderer.setLayoutColumns({
        width: 100,
        count: 1,
      });

      defaultColumns = [
        {
          id: 'stat',
          cache: false,
          renderer: Renderer.renderCustomTextCell,
          width: Renderer.getActiveColumnWidth() * 0.65 - Renderer.tableSettings.borderWidth,
          height: 35,
          fontSize: Renderer.defaultFontSize,
          font: Renderer.font,
          align: 'left',
          headerAlign: 'left',
          border: 'TBL',
          headerBorder: 'TBL',
          valign: 'center',
          header: false,
        },
        {
          id: 'value',
          cache: false,
          renderer: Renderer.renderCustomTextCell,
          width: Renderer.getActiveColumnWidth() * 0.35 - Renderer.tableSettings.borderWidth,
          height: 35,
          fontSize: Renderer.defaultFontSize,
          font: Renderer.boldFont,
          align: 'right',
          headerAlign: 'right',
          border: 'TBR',
          headerBorder: 'TBR',
          valign: 'center',
          header: false,
        },
      ];
    });

    it('should return default column definitions', () => {
      const result = Renderer.defineStatColumns();

      expect(result).to.eql(defaultColumns);
    });

    it('should return customized column definitions', () => {
      const result = Renderer.defineStatColumns({
        height: 50,
        statWidth: 40,
        valueWidth: 100,
        statFont: 'comic sans',
        statFontSize: 40,
        valueFont: 'courrier new',
        valueFontSize: 50,
        statHeader: 'My Stat',
        valueHeader: 'Values',
      });

      expect(result[0].height).to.equal(50);
      expect(result[0].width).to.equal(40 - Renderer.tableSettings.borderWidth);
      expect(result[0].font).to.equal('comic sans');
      expect(result[0].fontSize).to.equal(40);
      expect(result[0].header).to.equal('My Stat');

      expect(result[1].height).to.equal(50);
      expect(result[1].width).to.equal(100 - Renderer.tableSettings.borderWidth);
      expect(result[1].font).to.equal('courrier new');
      expect(result[1].fontSize).to.equal(50);
      expect(result[1].header).to.equal('Values');
    });
  });

  describe('renderSimpleStat', () => {
    beforeEach(() => {
      sinon.stub(Renderer, 'setFill');
      sinon.stub(Renderer, 'renderTable');
    });

    it('should render a simple stat with name and value with active styles', () => {
      Renderer.renderSimpleStat('My stat', 10, 'U', false);

      sinon.assert.calledWith(Renderer.setFill, 'black', 1);
      sinon.assert.calledOnce(Renderer.renderTable);
    });

    it('should render a simple stat with name and value with disabled styles', () => {
      Renderer.renderSimpleStat('My stat', '--', 'U', true);

      sinon.assert.calledWith(Renderer.setFill, Renderer.colors.lightGrey, 1);
      sinon.assert.calledOnce(Renderer.renderTable);
    });
  });

  describe('renderCalendarSection', () => {
    beforeEach(() => {
      Renderer.setLayoutColumns({
        width: 100,
        count: 1,
      });

      Renderer.initCalendar();

      sinon.stub(Renderer, 'renderSectionHeading');
      sinon.stub(Renderer, 'renderEmptyText');
      sinon.stub(Renderer, 'renderTable');
    });

    it('should render a calendar section with empty text for disabled sections', () => {
      Renderer.renderCalendarSection({
        title: 'My Disabled Section',
        active: true,
        disabled: true,
        emptyText: 'Sorry, nothing to show here',
      });

      sinon.assert.calledWith(Renderer.renderSectionHeading, 'My Disabled Section');
      sinon.assert.calledWith(Renderer.renderEmptyText, 'Sorry, nothing to show here');

      sinon.assert.notCalled(Renderer.renderTable);
    });

    it('should render a calendar section for enabled sections', () => {
      Renderer.renderCalendarSection({
        title: 'My Active Section',
        active: true,
        disabled: false,
      });

      sinon.assert.calledWith(Renderer.renderSectionHeading, 'My Active Section');
      sinon.assert.calledOnce(Renderer.renderTable);
      sinon.assert.calledWith(Renderer.renderTable, [
        sinon.match({ header: 'Mon', renderer: Renderer.renderCalendarCell }),
        sinon.match({ header: 'Tue', renderer: Renderer.renderCalendarCell }),
        sinon.match({ header: 'Wed', renderer: Renderer.renderCalendarCell }),
        sinon.match({ header: 'Thu', renderer: Renderer.renderCalendarCell }),
        sinon.match({ header: 'Fri', renderer: Renderer.renderCalendarCell }),
        sinon.match({ header: 'Sat', renderer: Renderer.renderCalendarCell }),
        sinon.match({ header: 'Sun', renderer: Renderer.renderCalendarCell }),
      ]);

      sinon.assert.notCalled(Renderer.renderEmptyText);
    });
  });

  describe('renderCalendarCell', () => {
    beforeEach(() => {
      sinon.stub(Renderer, 'setFill');
      sinon.stub(Renderer, 'setStroke');
      sinon.stub(Renderer, 'renderCountGrid');
    });

    it('should render a calendar count cell if count > 0', () => {
      Renderer.renderCalendarCell(
        {},
        { test: {
          color: 'blue',
          count: 30,
        } },
        true,
        { id: 'test', disabled: true },
        {
          x: 100,
          y: 200,
        },
        {
          top: 0,
          left: 0,
        }
      );

      sinon.assert.calledOnce(Renderer.renderCountGrid);
      sinon.assert.calledWith(Renderer.setFill, 'blue');
    });

    it('should not render a calendar count cell if not count > 0', () => {
      Renderer.renderCalendarCell(
        {},
        { test: {
          color: 'blue',
          count: 0,
        } },
        true,
        { id: 'test', disabled: true },
        {
          x: 100,
          y: 200,
        },
        {
          top: 0,
          left: 0,
        }
      );
    });

    it('should render a sitechange cell showing days since last sitechange', () => {
      Renderer.data.sections.siteChanges.type = 'fillCannula';

      Renderer.renderCalendarCell(
        {},
        { test: {
          color: 'blue',
          type: 'siteChange',
          daysSince: 3,
        } },
        true,
        { id: 'test', disabled: true },
        {
          x: 100,
          y: 200,
        },
        {
          top: 0,
          left: 0,
        }
      );

      sinon.assert.calledWith(Renderer.setStroke, Renderer.colors.grey);
      sinon.assert.calledWith(Renderer.doc.lineWidth, 1);

      sinon.assert.callCount(Renderer.doc.moveTo, 2);
      sinon.assert.callCount(Renderer.doc.lineTo, 2);
      sinon.assert.callCount(Renderer.doc.stroke, 2);

      sinon.assert.callCount(Renderer.doc.circle, 1);
      sinon.assert.callCount(Renderer.doc.fillAndStroke, 1);

      sinon.assert.calledOnce(Renderer.doc.image);

      sinon.assert.callCount(Renderer.doc.text, 2);
      sinon.assert.calledWith(Renderer.doc.text, '3 days');
    });

    it('should render a sitechange cell without days since last sitechange when NaN', () => {
      Renderer.data.sections.siteChanges.type = 'fillCannula';

      Renderer.renderCalendarCell(
        {},
        { test: {
          color: 'blue',
          type: 'siteChange',
          daysSince: NaN,
        } },
        true,
        { id: 'test', disabled: true },
        {
          x: 100,
          y: 200,
        },
        {
          top: 0,
          left: 0,
        }
      );

      sinon.assert.calledWith(Renderer.setStroke, Renderer.colors.grey);
      sinon.assert.calledWith(Renderer.doc.lineWidth, 1);

      sinon.assert.callCount(Renderer.doc.moveTo, 2);
      sinon.assert.callCount(Renderer.doc.lineTo, 2);
      sinon.assert.callCount(Renderer.doc.stroke, 2);

      sinon.assert.callCount(Renderer.doc.circle, 1);
      sinon.assert.callCount(Renderer.doc.fillAndStroke, 1);

      sinon.assert.calledOnce(Renderer.doc.image);

      sinon.assert.callCount(Renderer.doc.text, 1);
    });
  });

  describe('renderCountGrid', () => {
    const largeRadius = 15;
    const smallRadius = 4.5;

    beforeEach(() => {
      sinon.spy(Renderer, 'renderCountGrid');
    });

    it('should render a single count grid when count <= 9', () => {
      Renderer.renderCountGrid(
        9,
        100,
        {
          x: 0,
          y: 0,
        },
      );

      sinon.assert.callCount(Renderer.doc.circle, 9);
      sinon.assert.callCount(Renderer.doc.fill, 9);

      sinon.assert.alwaysCalledWith(
        Renderer.doc.circle,
        sinon.match.typeOf('number'),
        sinon.match.typeOf('number'),
        largeRadius
      );

      sinon.assert.callCount(Renderer.renderCountGrid, 1);
    });

    it('should render smaller recursive count grids when count > 9', () => {
      Renderer.renderCountGrid(
        10,
        100,
        {
          x: 0,
          y: 0,
        },
      );

      sinon.assert.callCount(Renderer.doc.circle, 10);
      sinon.assert.callCount(Renderer.doc.fill, 10);

      sinon.assert.calledWith(
        Renderer.doc.circle,
        sinon.match.typeOf('number'),
        sinon.match.typeOf('number'),
        largeRadius
      );

      sinon.assert.calledWith(
        Renderer.doc.circle,
        sinon.match.typeOf('number'),
        sinon.match.typeOf('number'),
        smallRadius
      );

      sinon.assert.callCount(Renderer.renderCountGrid, 2);
    });

    it('should render smaller recursive count grids to a max count of 17', () => {
      Renderer.renderCountGrid(
        83,
        100,
        {
          x: 0,
          y: 0,
        },
      );

      sinon.assert.callCount(Renderer.doc.circle, 17);
      sinon.assert.callCount(Renderer.doc.fill, 17);
    });
  });

  describe('renderCalendarSummary', () => {
    beforeEach(() => {
      Renderer.setLayoutColumns({
        width: 100,
        count: 1,
      });

      Renderer.initCalendar();

      sinon.spy(Renderer, 'defineStatColumns');
      sinon.stub(Renderer, 'renderTable');
    });

    it('should not render a table if section is disabled', () => {
      Renderer.renderCalendarSummary({
        disabled: true,
      });

      sinon.assert.notCalled(Renderer.renderTable);
    });

    it('should call defineStatColumns with custom opts', () => {
      Renderer.renderCalendarSummary({
        dimensions: Renderer.data.sections.basals.dimensions,
        header: Renderer.data.sections.basals.summaryTitle,
        data: Renderer.data.data.basal.summary,
        type: 'basal',
        disabled: false,
      });

      sinon.assert.calledOnce(Renderer.defineStatColumns);
      sinon.assert.calledWith(Renderer.defineStatColumns, {
        statWidth: 75,
        valueWidth: 25,
        height: 20,
        statHeader: 'Total basal events',
        valueHeader: '1',
      });
    });

    it('should render a table if section is enabled', () => {
      Renderer.renderCalendarSummary({
        dimensions: Renderer.data.sections.basals.dimensions,
        header: Renderer.data.sections.basals.summaryTitle,
        data: Renderer.data.data.basal.summary,
        type: 'basal',
        disabled: false,
      });

      sinon.assert.calledOnce(Renderer.renderTable);
    });
  });

  describe('renderEmptyText', () => {
    beforeEach(() => {
      Renderer.setLayoutColumns({
        width: 100,
        count: 1,
      });

      sinon.spy(Renderer, 'getActiveColumnWidth');
      sinon.stub(Renderer, 'resetText');
      sinon.stub(Renderer, 'setFill');
    });

    it('should render text with the appropriate styles and width', () => {
      Renderer.renderEmptyText('No data to show');

      sinon.assert.calledWith(Renderer.setFill, Renderer.colors.lightGrey);

      sinon.assert.calledOnce(Renderer.getActiveColumnWidth);

      sinon.assert.calledWith(Renderer.doc.fontSize, Renderer.defaultFontSize);
      sinon.assert.calledWith(Renderer.doc.text, 'No data to show', { width: 100 });
    });

    it('should move down and reset the text styles when finished', () => {
      Renderer.renderEmptyText('No data to show');

      sinon.assert.calledOnce(Renderer.resetText);
      sinon.assert.calledOnce(Renderer.doc.moveDown);
    });
  });
});
