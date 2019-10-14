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

import SettingsPrintView from '../../../src/modules/print/SettingsPrintView';
import PrintView from '../../../src/modules/print/PrintView';
import * as patients from '../../../data/patient/profiles';
import animasFlatrate from '../../../data/pumpSettings/animas/flatrate.json';
import medtronicFlatrate from '../../../data/pumpSettings/medtronic/flatrate.json';
import medtronicAutomated from '../../../data/pumpSettings/medtronic/automated.json';
import omnipodMultirate from '../../../data/pumpSettings/omnipod/multirate.json';
import tandemMultirate from '../../../data/pumpSettings/tandem/multirate.json';

import {
  ratio,
  sensitivity,
  target,
} from '../../../src/utils/settings/nonTandemData';

import {
  DEFAULT_FONT_SIZE,
  FOOTER_FONT_SIZE,
  HEADER_FONT_SIZE,
  LARGE_FONT_SIZE,
  SMALL_FONT_SIZE,
  EXTRA_SMALL_FONT_SIZE,
} from '../../../src/modules/print/utils/constants';

import Doc from '../../helpers/pdfDoc';

const data = {
  animasFlatrate,
  tandemMultirate,
  medtronicFlatrate,
  medtronicAutomated,
  omnipodMultirate,
};

describe('SettingsPrintView', () => {
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
    patient: patients.standard,
    timePrefs: {
      timezoneAware: true,
      timezoneName: 'US/Pacific',
    },
    width: 8.5 * DPI - (2 * MARGIN),
    title: 'Device Settings',
  };

  const mmollOpts = _.assign({}, opts, {
    bgPrefs: {
      bgBounds: {
        veryHighThreshold: 16.7,
        targetUpperBound: 10,
        targetLowerBound: 3.9,
        veryLowThreshold: 3.1,
      },
      bgUnits: 'mmol/L',
    },
  });

  const devices = [
    {
      name: 'animas',
      data: animasFlatrate,
      opts: mmollOpts,
    },
    {
      name: 'medtronic',
      data: medtronicFlatrate,
      opts,
    },
    {
      name: 'omnipod',
      data: omnipodMultirate,
      opts,
    },
  ];

  const createRenderer = (renderData = data.animasFlatrate, renderOpts = opts) => (
    new SettingsPrintView(doc, renderData, renderOpts)
  );

  beforeEach(() => {
    doc = new Doc({ margin: MARGIN });
    Renderer = createRenderer();
  });

  describe('class constructor', () => {
    it('should instantiate without errors', () => {
      expect(Renderer).to.be.an('object');
    });

    it('should extend the `PrintView` class', () => {
      expect(Renderer instanceof PrintView).to.be.true;
    });

    it('should set it\'s own required initial instance properties for non-tandem devices', () => {
      const requiredProps = [
        { prop: 'manufacturer', type: 'string', value: 'animas' },
        { prop: 'deviceMeta', type: 'object' },
      ];

      _.each(requiredProps, item => {
        expect(Renderer[item.prop]).to.be.a(item.type);
        item.hasOwnProperty('value') && expect(Renderer[item.prop]).to.eql(item.value);
      });

      expect(Renderer.deviceMeta.schedule).to.be.a('string');
      expect(Renderer.deviceMeta.uploaded).to.be.a('string');
      expect(Renderer.deviceMeta.serial).to.be.a('string');
    });

    it('should set the manufacturer to `medtronic` when the source is `carelink`', () => {
      Renderer = createRenderer(_.assign({}, data.tandemMultirate, {
        source: 'carelink',
      }));

      const requiredProps = [
        { prop: 'manufacturer', type: 'string', value: 'medtronic' },
        { prop: 'deviceMeta', type: 'object' },
      ];

      _.each(requiredProps, item => {
        expect(Renderer[item.prop]).to.be.a(item.type);
        item.hasOwnProperty('value') && expect(Renderer[item.prop]).to.eql(item.value);
      });

      expect(Renderer.deviceMeta.schedule).to.be.a('string');
      expect(Renderer.deviceMeta.uploaded).to.be.a('string');
      expect(Renderer.deviceMeta.serial).to.be.a('string');
    });

    it('should set it\'s own required initial instance properties for tandem devices', () => {
      Renderer = createRenderer(data.tandemMultirate);

      const requiredProps = [
        { prop: 'manufacturer', type: 'string', value: 'tandem' },
        { prop: 'deviceMeta', type: 'object' },
      ];

      _.each(requiredProps, item => {
        expect(Renderer[item.prop]).to.be.a(item.type);
        item.hasOwnProperty('value') && expect(Renderer[item.prop]).to.eql(item.value);
      });

      expect(Renderer.deviceMeta.schedule).to.be.a('string');
      expect(Renderer.deviceMeta.uploaded).to.be.a('string');
      expect(Renderer.deviceMeta.serial).to.be.a('string');
    });

    it('should add the first pdf page', () => {
      sinon.assert.calledOnce(Renderer.doc.addPage);
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

    it('should call the newPage method of the parent class with the device uploaded time', () => {
      Renderer.deviceMeta.uploaded = 'Dec 17, 2017';

      Renderer.newPage();
      sinon.assert.calledWith(PrintView.prototype.newPage, 'Uploaded on: Dec 17, 2017');
    });
  });

  describe('render', () => {
    it('should call all the appropriate render methods for non-tandem devices', () => {
      Renderer = createRenderer(data.omnipodMultirate);

      sinon.stub(Renderer, 'renderDeviceMeta');
      sinon.stub(Renderer, 'renderBasalSchedules');
      sinon.stub(Renderer, 'renderWizardSettings');

      Renderer.render();

      sinon.assert.calledOnce(Renderer.renderDeviceMeta);
      sinon.assert.calledOnce(Renderer.renderBasalSchedules);
      sinon.assert.calledOnce(Renderer.renderWizardSettings);
    });

    it('should call all the appropriate render methods for tandem devices', () => {
      Renderer = createRenderer(data.tandemMultirate);

      sinon.stub(Renderer, 'renderDeviceMeta');
      sinon.stub(Renderer, 'renderTandemProfiles');

      Renderer.render();

      sinon.assert.calledOnce(Renderer.renderDeviceMeta);
      sinon.assert.calledOnce(Renderer.renderTandemProfiles);
    });
  });

  describe('renderDeviceMeta', () => {
    it('should render the serial #', () => {
      Renderer.renderDeviceMeta();

      sinon.assert.calledWithMatch(Renderer.doc.text, sinon.match('123-45-678'));
    });

    it('should render the device name for Animas devices', () => {
      Renderer.renderDeviceMeta();

      sinon.assert.calledWith(Renderer.doc.text, 'Animas');
    });

    it('should render the device name for Medronic devices', () => {
      Renderer = createRenderer(data.medtronicFlatrate);
      Renderer.renderDeviceMeta();

      sinon.assert.calledWith(Renderer.doc.text, 'Medtronic');
    });

    it('should render the device name for Omnipod devices', () => {
      Renderer = createRenderer(data.omnipodMultirate);
      Renderer.renderDeviceMeta();

      sinon.assert.calledWith(Renderer.doc.text, 'OmniPod');
    });

    it('should render the device name for Tandem devices', () => {
      Renderer = createRenderer(data.tandemMultirate);
      Renderer.renderDeviceMeta();

      sinon.assert.calledWith(Renderer.doc.text, 'Tandem');
    });

    it('should reset text styles and move down when complete', () => {
      sinon.stub(Renderer, 'resetText');
      Renderer.renderWizardSettings();

      assert(Renderer.resetText.calledBefore(Renderer.doc.moveDown));
    });
  });

  describe('renderTandemProfiles', () => {
    beforeEach(() => {
      Renderer = createRenderer(data.tandemMultirate);
    });

    it('should render a section heading', () => {
      sinon.stub(Renderer, 'renderSectionHeading');

      Renderer.renderTandemProfiles();

      sinon.assert.calledWith(Renderer.renderSectionHeading, 'Profile Settings');
    });

    it('should render a table heading and table for each schedule', () => {
      sinon.stub(Renderer, 'renderTableHeading');
      sinon.stub(Renderer, 'renderTable');

      const schedules = Renderer.data.basalSchedules;
      expect(schedules.length).to.equal(3);

      Renderer.renderTandemProfiles();

      // ensure it's rendering a table heading for each schedule
      sinon.assert.callCount(Renderer.renderTableHeading, schedules.length);

      // ensure it's writing the schedule name
      let activeIndex;
      _.forEach(schedules, (schedule, index) => {
        sinon.assert.calledWithMatch(Renderer.renderTableHeading, {
          text: schedule.name,
        });

        if (schedule.name === Renderer.data.activeSchedule) {
          activeIndex = index;
        }
      });

      // ensure it's denoting the active schedule
      expect(activeIndex).to.be.a('number');

      const activeCall = Renderer.renderTableHeading.getCall(activeIndex);
      expect(activeCall.args[0].text).to.equal(Renderer.data.activeSchedule);
      expect(activeCall.args[0].subText).to.equal('Active at upload');

      // ensure it's rendering a table for each schedule
      sinon.assert.callCount(Renderer.renderTable, schedules.length);
    });
  });

  describe('renderBasalSchedules', () => {
    it('should render a section heading', () => {
      sinon.stub(Renderer, 'renderSectionHeading');

      Renderer.renderBasalSchedules();

      sinon.assert.calledWith(Renderer.renderSectionHeading, 'Basal Rates');
    });

    it('should set a 3 column layout', () => {
      sinon.spy(Renderer, 'setLayoutColumns');

      Renderer.renderBasalSchedules();

      sinon.assert.calledWithMatch(Renderer.setLayoutColumns, { count: 3 });
    });

    it('should set a render a schedule in each column', () => {
      sinon.spy(Renderer, 'goToLayoutColumnPosition');

      Renderer.renderBasalSchedules();

      sinon.assert.calledWith(Renderer.goToLayoutColumnPosition, 0);
      sinon.assert.calledWith(Renderer.goToLayoutColumnPosition, 1);
      sinon.assert.calledWith(Renderer.goToLayoutColumnPosition, 2);
    });

    it('should set update the layout column position before and after rendering each table', () => {
      const singleScheduleData = _.cloneDeep(Renderer.data);
      singleScheduleData.basalSchedules = _.slice(singleScheduleData.basalSchedules, 0, 1);
      Renderer = createRenderer(singleScheduleData);

      sinon.spy(Renderer, 'updateLayoutColumnPosition');
      sinon.spy(Renderer, 'renderTable');

      Renderer.renderBasalSchedules();

      assert(Renderer.renderTable.calledAfter(Renderer.updateLayoutColumnPosition));
      assert(Renderer.renderTable.calledBefore(Renderer.updateLayoutColumnPosition));
    });

    it('should render a table heading and table for each schedule', () => {
      sinon.stub(Renderer, 'renderTableHeading');
      sinon.stub(Renderer, 'renderTable');

      const schedules = Renderer.data.basalSchedules;
      expect(schedules.length).to.equal(3);

      Renderer.renderBasalSchedules();

      // ensure it's rendering a table heading for each schedule
      sinon.assert.callCount(Renderer.renderTableHeading, schedules.length);

      // ensure it's writing the schedule name
      let activeIndex;
      _.forEach(schedules, (schedule, index) => {
        sinon.assert.calledWithMatch(Renderer.renderTableHeading, {
          text: schedule.name,
        });

        if (schedule.name === Renderer.data.activeSchedule) {
          activeIndex = index;
        }
      });

      // ensure it's denoting the active schedule
      expect(activeIndex).to.be.a('number');

      const activeCall = Renderer.renderTableHeading.getCall(activeIndex);
      expect(activeCall.args[0].text).to.equal(Renderer.data.activeSchedule);
      expect(activeCall.args[0].note).to.equal('Active at upload');

      // ensure it's rendering a table for each schedule
      sinon.assert.callCount(Renderer.renderTable, schedules.length);
    });

    it('should reset text styles when complete', () => {
      sinon.stub(Renderer, 'resetText');
      sinon.stub(Renderer, 'updateLayoutColumnPosition');

      Renderer.renderWizardSettings();

      assert(Renderer.resetText.calledAfter(Renderer.updateLayoutColumnPosition));
    });

    context('automated basals', () => {
      it('should render the automated basal schedule if active at upload', () => {
        Renderer = createRenderer(data.medtronicAutomated);

        sinon.stub(Renderer, 'renderTableHeading');
        sinon.stub(Renderer, 'renderTable');

        const schedules = Renderer.data.basalSchedules;
        expect(schedules.length).to.equal(4);

        Renderer.renderBasalSchedules();

        // ensure it's rendering a table heading for each schedule, including the automated one
        sinon.assert.callCount(Renderer.renderTableHeading, schedules.length);

        // ensure it's writing the schedule name
        let activeIndex;
        _.forEach(schedules, (schedule, index) => {
          sinon.assert.calledWithMatch(Renderer.renderTableHeading, {
            text: schedule.name,
          });

          if (schedule.name === Renderer.data.activeSchedule) {
            activeIndex = index;
          }
        });

        // ensure it's denoting the active schedule
        expect(activeIndex).to.be.a('number');

        const activeCall = Renderer.renderTableHeading.getCall(activeIndex);
        expect(activeCall.args[0].text).to.equal('Auto Mode');
        expect(activeCall.args[0].subText).to.equal('active at upload');

        // ensure it's only rendering a table for each non-automated schedule
        sinon.assert.callCount(Renderer.renderTable, schedules.length - 1);
      });

      it('should not render the automated basal schedule if inactive at upload', () => {
        Renderer = createRenderer(_.assign({}, data.medtronicAutomated, {
          activeSchedule: 'Standard',
        }));

        sinon.stub(Renderer, 'renderTableHeading');
        sinon.stub(Renderer, 'renderTable');

        const schedules = Renderer.data.basalSchedules;
        expect(schedules.length).to.equal(4);

        Renderer.renderBasalSchedules();

        // ensure it's rendering a table heading for each non-automated schedule
        sinon.assert.callCount(Renderer.renderTableHeading, schedules.length - 1);

        // ensure it's writing the schedule name
        _.forEach(schedules, (schedule) => {
          if (schedule.name === 'Auto Mode') return; // not called for the automated basal

          sinon.assert.calledWithMatch(Renderer.renderTableHeading, {
            text: schedule.name,
          });
        });

        // ensure it's only rendering a table for each non-automated schedule
        sinon.assert.callCount(Renderer.renderTable, schedules.length - 1);
      });
    });
  });

  describe('renderWizardSettings', () => {
    it('should render a unique section heading for each manufacturer', () => {
      sinon.spy(Renderer, 'renderSectionHeading');
      Renderer.renderWizardSettings();
      sinon.assert.calledWithMatch(Renderer.renderSectionHeading, 'ezCarb ezBG');

      Renderer = createRenderer(data.medtronicFlatrate);
      sinon.spy(Renderer, 'renderSectionHeading');
      Renderer.renderWizardSettings();
      sinon.assert.calledWithMatch(Renderer.renderSectionHeading, 'Bolus Wizard');

      Renderer = createRenderer(data.omnipodMultirate);
      sinon.spy(Renderer, 'renderSectionHeading');
      Renderer.renderWizardSettings();
      sinon.assert.calledWithMatch(Renderer.renderSectionHeading, 'Bolus Calculator');
    });

    it('should set a 3 column layout', () => {
      sinon.spy(Renderer, 'setLayoutColumns');

      Renderer.renderWizardSettings();

      sinon.assert.calledWithMatch(Renderer.setLayoutColumns, { count: 3 });
    });

    it('should call all the appropriate render methods for wizard settings', () => {
      sinon.stub(Renderer, 'renderSensitivity');
      sinon.stub(Renderer, 'renderTarget');
      sinon.stub(Renderer, 'renderRatio');

      Renderer.renderWizardSettings();

      sinon.assert.calledOnce(Renderer.renderSensitivity);
      sinon.assert.calledOnce(Renderer.renderTarget);
      sinon.assert.calledOnce(Renderer.renderRatio);
    });

    it('should reset text styles when complete', () => {
      sinon.stub(Renderer, 'resetText');
      sinon.stub(Renderer, 'renderRatio');

      Renderer.renderWizardSettings();

      assert(Renderer.resetText.calledAfter(Renderer.renderRatio));
    });
  });

  describe('renderWizardSetting', () => {
    const settings = {};

    beforeEach(() => {
      settings.sensitivity = sensitivity(Renderer.data, Renderer.manufacturer, Renderer.bgUnits);
      settings.target = target(Renderer.data, Renderer.manufacturer);
      settings.ratio = ratio(Renderer.data, Renderer.manufacturer);
      Renderer.setLayoutColumns({ count: 3 });
    });

    it('should render a setting in the shortest column', () => {
      sinon.stub(Renderer, 'goToLayoutColumnPosition');
      sinon.stub(Renderer, 'getShortestLayoutColumn');

      Renderer.renderWizardSetting(settings.sensitivity);

      sinon.assert.calledWith(
        Renderer.goToLayoutColumnPosition,
        Renderer.getShortestLayoutColumn()
      );
    });

    it('should get the current column width', () => {
      sinon.stub(Renderer, 'getActiveColumnWidth');

      Renderer.renderWizardSetting(settings.sensitivity);

      sinon.assert.calledOnce(Renderer.getActiveColumnWidth);
    });

    it('should render a table heading', () => {
      sinon.stub(Renderer, 'renderTableHeading');

      Renderer.renderWizardSetting(settings.sensitivity);

      sinon.assert.calledOnce(Renderer.renderTableHeading);
      sinon.assert.calledWithMatch(Renderer.renderTableHeading, { text: 'ISF' });
    });

    it('should render a table', () => {
      sinon.stub(Renderer, 'renderTableHeading');
      sinon.stub(Renderer, 'renderTable');

      Renderer.renderWizardSetting(settings.sensitivity);

      sinon.assert.calledOnce(Renderer.renderTable);
    });

    it('should set update the layout column position before and after rendering each table', () => {
      sinon.stub(Renderer, 'renderTableHeading');
      sinon.spy(Renderer, 'updateLayoutColumnPosition');
      sinon.spy(Renderer, 'renderTable');

      Renderer.renderWizardSetting(settings.sensitivity);

      assert(Renderer.renderTable.calledAfter(Renderer.updateLayoutColumnPosition));
      assert(Renderer.renderTable.calledBefore(Renderer.updateLayoutColumnPosition));
    });
  });

  describe('renderSensitivity', () => {
    let settings;

    _.forEach(devices, device => {
      beforeEach(() => {
        Renderer = createRenderer(device.data, device.opts);
        settings = sensitivity(Renderer.data, Renderer.manufacturer, Renderer.bgUnits);
      });

      it(`should render the appropriate title and units for ${device.name} pumps`, () => {
        sinon.stub(Renderer, 'renderWizardSetting');

        Renderer.renderSensitivity(settings);

        sinon.assert.calledWithMatch(
          Renderer.renderWizardSetting,
          {
            title: settings.title,
          },
          `${Renderer.bgUnits}/U`
        );
      });
    });
  });

  describe('renderTarget', () => {
    let settings;

    _.forEach(devices, device => {
      beforeEach(() => {
        Renderer = createRenderer(device.data, device.opts);
        settings = target(Renderer.data, Renderer.manufacturer);
      });

      it(`should render the appropriate title and units for ${device.name} pumps`, () => {
        sinon.stub(Renderer, 'renderWizardSetting');

        Renderer.renderTarget(settings);

        sinon.assert.calledWithMatch(
          Renderer.renderWizardSetting,
          {
            title: settings.title,
          },
          Renderer.bgUnits
        );
      });

      it(`should render the appropriate column headers for ${device.name} pumps`, () => {
        sinon.stub(Renderer, 'renderWizardSetting');

        Renderer.renderTarget(settings);

        sinon.assert.calledWithMatch(
          Renderer.renderWizardSetting,
          {
            columns: [
              { key: 'start', label: 'Start time' },
              { key: 'columnTwo', label: settings.columns[1].label },
              { key: 'columnThree', label: settings.columns[2].label },
            ],
          }
        );
      });
    });
  });

  describe('renderRatio', () => {
    let settings;

    _.forEach(devices, device => {
      beforeEach(() => {
        Renderer = createRenderer(device.data, device.opts);
        settings = ratio(Renderer.data, Renderer.manufacturer);
      });

      it(`should render the appropriate title and units for ${device.name} pumps`, () => {
        sinon.stub(Renderer, 'renderWizardSetting');

        Renderer.renderRatio(settings);

        sinon.assert.calledWithMatch(
          Renderer.renderWizardSetting,
          {
            title: settings.title,
          },
          'g/U'
        );
      });
    });
  });
});
