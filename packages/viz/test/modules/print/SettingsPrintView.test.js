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

import _ from "lodash";
import * as sinon from "sinon";
import { expect } from "chai";

import SettingsPrintView from "../../../src/modules/print/SettingsPrintView";
import PrintView from "../../../src/modules/print/PrintView";
import { patient } from "../../../data/patient/profiles";
import device from "../../../data/pumpSettings/diabeloop/device.json";
import deviceHistory from "../../../data/pumpSettings/diabeloop/deviceHistory.json";

import {
  DEFAULT_FONT_SIZE,
  FOOTER_FONT_SIZE,
  HEADER_FONT_SIZE,
  LARGE_FONT_SIZE,
  SMALL_FONT_SIZE,
  EXTRA_SMALL_FONT_SIZE,
} from "../../../src/modules/print/utils/constants";

import Doc from "../../helpers/pdfDoc";

describe("SettingsPrintView", () => {
  let renderer;

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
      bgUnits: "mg/dL",
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
    patient,
    timePrefs: {
      timezoneAware: true,
      timezoneName: "US/Pacific",
    },
    width: 8.5 * DPI - (2 * MARGIN),
    title: "Device Settings",
  };


  const createRenderer = (renderOpts = opts) => {
    const data = _.cloneDeep(device);
    data.payload.history = _.cloneDeep(deviceHistory.history);
    return new SettingsPrintView(doc, data, renderOpts);
  };

  beforeEach(() => {
    doc = new Doc({ margin: MARGIN });
    renderer = createRenderer();
  });

  describe("class constructor", () => {
    it("should instantiate without errors", () => {
      expect(renderer).to.be.an("object");
    });

    it("should extend the `PrintView` class", () => {
      expect(renderer instanceof PrintView).to.be.true;
    });

    it("should add the first pdf page", () => {
      sinon.assert.calledOnce(renderer.doc.addPage);
    });

    it("should set the right device infos on this", () => {
      expect(renderer.source).to.be.eq("diabeloop");
      expect(renderer.timePrefs.timezoneName).to.be.eq("Europe/Paris");
      expect(renderer.timePrefs.timezoneAware).to.be.true;
      expect(renderer.deviceMeta.schedule).to.be.eq("Normal");
      expect(renderer.deviceMeta.uploaded).to.be.eq("May 23, 2019");
      expect(renderer.deviceMeta.serial).to.be.eq("unknown");
    });
  });

  describe("newPage", () => {
    let newPageSpy;

    beforeEach(() => {
      newPageSpy = sinon.spy(PrintView.prototype, "newPage");
    });

    afterEach(() => {
      newPageSpy.restore();
    });

    it("should call the newPage method of the parent class with the device uploaded time", () => {
      renderer.deviceMeta.uploaded = "Dec 17, 2017";

      renderer.newPage();
      sinon.assert.calledWith(PrintView.prototype.newPage, "Uploaded on Dec 17, 2017");
    });
  });

  describe("render", () => {
    it("should call all the appropriate render methods", () => {
      sinon.stub(renderer, "renderDeviceInfo");
      sinon.stub(renderer, "renderPumpInfo");
      sinon.stub(renderer, "renderCgmInfo");
      sinon.stub(renderer, "renderDeviceParameters");
      sinon.stub(renderer, "resetText");

      renderer.render();

      sinon.assert.calledOnce(renderer.renderDeviceInfo);
      sinon.assert.calledOnce(renderer.renderPumpInfo);
      sinon.assert.calledOnce(renderer.renderCgmInfo);
      sinon.assert.calledOnce(renderer.renderDeviceParameters);
      sinon.assert.calledOnce(renderer.resetText);
    });
  });

  describe("renderDeviceInfo", () => {
    /** @type {sinon.SinonStub} */
    let renderSettingsSection;
    /** @type {sinon.SinonStub} */
    let renderSectionHeading;
    beforeEach(() => {
      renderSettingsSection = sinon.stub(renderer, "renderSettingsSection");
      renderSectionHeading = sinon.stub(renderer, "renderSectionHeading");
    });
    it("with device info", () => {
      renderer.renderDeviceInfo();
      expect(renderSettingsSection.calledOnce).to.be.true;
      expect(renderSectionHeading.calledOnce).to.be.false;

      const callArgs = renderSettingsSection.firstCall.args;
      expect(callArgs.length).to.be.eq(2);
      expect(callArgs[0]).to.be.an("object").not.null;
      expect(callArgs[1]).to.be.a("number");
      expect(callArgs[0].heading.text).to.be.eq("Device");
      expect(callArgs[0].heading.subText).to.be.eq("- DBL4K");
      expect(callArgs[0].heading.note).to.be.undefined;

      const expectedRows = [
        {
          label: "Manufacturer",
          value: "Diabeloop"
        },
        {
          label: "Identifier",
          value: "Xperia XZ1 (AOSP)358321085116760"
        },
        {
          label: "IMEI",
          value: "358321085116760"
        },
        {
          label: "Software version",
          value: "1.1.1.18_DBL4K_CLINICAL"
        }
      ];

      expect(callArgs[0].rows).to.be.an("array").lengthOf(expectedRows.length);
      expectedRows.forEach((value, index) => {
        expect(callArgs[0].rows[index].label).to.be.eq(value.label);
        expect(callArgs[0].rows[index].value).to.be.eq(value.value);
      });
    });

    it("without device info", () => {
      delete renderer.data.payload.device;
      renderer.renderDeviceInfo();
      expect(renderSettingsSection.calledOnce).to.be.false;
      expect(renderSectionHeading.calledOnce).to.be.true;
    });
  });

  describe("renderPumpInfo", () => {
    /** @type {sinon.SinonStub} */
    let renderSettingsSection;
    /** @type {sinon.SinonStub} */
    let renderSectionHeading;
    beforeEach(() => {
      renderSettingsSection = sinon.stub(renderer, "renderSettingsSection");
      renderSectionHeading = sinon.stub(renderer, "renderSectionHeading");
    });

    it("with pump info", () => {
      renderer.renderPumpInfo();
      expect(renderSettingsSection.calledOnce).to.be.true;
      expect(renderSectionHeading.calledOnce).to.be.false;

      const callArgs = renderSettingsSection.firstCall.args;
      expect(callArgs.length).to.be.eq(2);
      expect(callArgs[0]).to.be.an("object").not.null;
      expect(callArgs[1]).to.be.a("number");

      expect(callArgs[0].heading.text).to.be.eq("Pump");
      expect(callArgs[0].heading.subText).to.be.eq("- Pump0001");
      expect(callArgs[0].heading.note).to.be.undefined;

      const expectedRows = [
        {
          label: "Manufacturer",
          value: "Roche"
        },
        {
          label: "Serial Number",
          value: "123456789"
        },
        {
          label: "Pump version",
          value: "0.1.0"
        },
        {
          label: "Pump cartridge expiration date",
          value: "Jan 31, 2021"
        }
      ];

      expect(callArgs[0].rows).to.be.an("array").lengthOf(expectedRows.length);
      expectedRows.forEach((value, index) => {
        expect(callArgs[0].rows[index].label).to.be.eq(value.label);
        expect(callArgs[0].rows[index].value).to.be.eq(value.value);
      });
      // console.info(JSON.stringify(callArgs[0], null, 2));
    });

    it("without pump info", () => {
      delete renderer.data.payload.pump;
      renderer.renderPumpInfo();
      expect(renderSettingsSection.calledOnce).to.be.false;
      expect(renderSectionHeading.calledOnce).to.be.false; // TODO ?
    });
  });

  describe("renderCgmInfo", () => {
    /** @type {sinon.SinonStub} */
    let renderSettingsSection;
    /** @type {sinon.SinonStub} */
    let renderSectionHeading;
    beforeEach(() => {
      renderSettingsSection = sinon.stub(renderer, "renderSettingsSection");
      renderSectionHeading = sinon.stub(renderer, "renderSectionHeading");
    });

    it("with cgm info", () => {
      renderer.renderCgmInfo();
      expect(renderSettingsSection.calledOnce).to.be.true;
      expect(renderSectionHeading.calledOnce).to.be.false;

      const callArgs = renderSettingsSection.firstCall.args;
      expect(callArgs.length).to.be.eq(2);
      expect(callArgs[0]).to.be.an("object").not.null;
      expect(callArgs[1]).to.be.a("number");

      expect(callArgs[0].heading.text).to.be.eq("CGM");
      expect(callArgs[0].heading.subText).to.be.undefined;
      expect(callArgs[0].heading.note).to.be.undefined;

      const expectedRows = [
        {
          label: "Manufacturer",
          value: "Dexcom"
        },
        {
          label: "Product",
          value: "G6"
        },
        {
          label: "Cgm sensor expiration date",
          value: "Nov 21, 2019"
        },
        {
          label: "Cgm transmitter software version",
          value: "0.0.1"
        },
        {
          label: "Cgm transmitter id",
          value: "123456789"
        },
        {
          label: "Cgm transmitter end of life",
          value: "Dec 20, 2019"
        }
      ];

      expect(callArgs[0].rows).to.be.an("array").lengthOf(expectedRows.length);
      expectedRows.forEach((value, index) => {
        expect(callArgs[0].rows[index].label).to.be.eq(value.label);
        expect(callArgs[0].rows[index].value).to.be.eq(value.value);
      });
    });

    it("without cgm info", () => {
      delete renderer.data.payload.cgm;
      renderer.renderCgmInfo();
      expect(renderSettingsSection.calledOnce).to.be.false;
      expect(renderSectionHeading.calledOnce).to.be.false; // TODO ?
    });
  });

  describe("renderDeviceParameters", () => {
    /** @type {sinon.SinonStub} */
    let renderSettingsSection;
    /** @type {sinon.SinonStub} */
    let renderSectionHeading;
    beforeEach(() => {
      renderSettingsSection = sinon.stub(renderer, "renderSettingsSection");
      renderSectionHeading = sinon.stub(renderer, "renderSectionHeading");
    });

    it("with device parameters info", () => {
      renderer.renderDeviceParameters();
      expect(renderSettingsSection.calledOnce).to.be.true;
      expect(renderSectionHeading.calledOnce).to.be.false;

      const callArgs = renderSettingsSection.firstCall.args;
      expect(callArgs.length).to.be.eq(3);
      expect(callArgs[0]).to.be.an("object").not.null;
      expect(callArgs[1]).to.be.a("number");
      expect(callArgs[2]).to.be.an("object").deep.eq({ zebra: true, showHeaders: true });

      expect(callArgs[0].heading.text).to.be.eq("Parameters");
      expect(callArgs[0].heading.subText).to.be.undefined;
      expect(callArgs[0].heading.note).to.be.undefined;

      const expectedRows = [
        {
          rawData: "TEST_PARAM_1",
          name: "TEST_PARAM_1",
          value: "120",
          unit: "%",
          level: 1
        },
        {
          rawData: "TEST_PARAM_2",
          name: "TEST_PARAM_2",
          value: "110",
          unit: "%",
          level: 1
        },
        {
          rawData: "TEST_PARAM_3",
          name: "TEST_PARAM_3",
          value: "100.0",
          unit: "mg/dL",
          level: 1
        },
        {
          rawData: "TEST_PARAM_3",
          name: "WEIGHT",
          value: "60.0",
          unit: "kg",
          level: 1
        },
      ];

      expect(callArgs[0].rows).to.be.an("array").lengthOf(expectedRows.length);
      expectedRows.forEach((value, index) => {
        expect(callArgs[0].rows[index].name).to.be.eq(value.name);
        expect(callArgs[0].rows[index].value).to.be.eq(value.value);
      });
    });

    it("without device parameters info", () => {
      delete renderer.data.payload.parameters;
      renderer.renderDeviceParameters();
      expect(renderSettingsSection.calledOnce).to.be.false;
      expect(renderSectionHeading.calledOnce).to.be.true;
    });
  });

  describe("renderSettingsSection", () => {
    /** @type {sinon.SinonStub} */
    let renderTableHeading;
    /** @type {sinon.SinonStub} */
    let renderTable;
    beforeEach(() => {
      renderTableHeading = sinon.stub(renderer, "renderTableHeading");
      renderTable = sinon.stub(renderer, "renderTable");
    });

    it("should call renderTableHeading & renderTable", () => {
      renderer.renderSettingsSection({ heading: "heading", columns: "columns", rows: "rows" });
      expect(renderTableHeading.calledOnce).to.be.true;
      expect(renderTable.calledOnce).to.be.true;

      expect(renderTableHeading.firstCall.args[0]).to.be.eq("heading");
      expect(renderTable.firstCall.args[0]).to.be.eq("columns");
      expect(renderTable.firstCall.args[1]).to.be.eq("rows");
    });
  });
});
