/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2016, Tidepool Project
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

import React from "react";
import * as sinon from "sinon";
import { expect } from "chai";
import { mount } from "enzyme";
import { MGDL_UNITS } from "tideline";

import PumpSettingsContainer from "../../../../src/components/settings/common/PumpSettingsContainer";

describe("PumpSettingsContainer", () => {
  const defaultProps = {
    copySettingsClicked: sinon.spy(),
    onSwitchToDaily: sinon.spy(),
    manufacturerKey: "diabeloop",
    bgUnits: MGDL_UNITS,
    timePrefs: {
      timezoneAware: true,
      timezoneName: "Europe/Paris",
      timezoneOffset: 60,
    },
    pumpSettings: {
      deviceId: "123456789-ID",
      deviceTime: "2021-01-31T10:26:04",
      id: "49d2fb94b1a62a3db3c6aec3f1dc66b8",
      timezone: "Europe/Paris",
      type: "pumpSettings",
      deviceSerialNumber: "123456789-IMEI",
      source: "Diabeloop",
      normalTime: "2021-01-31T09:26:04.000Z",
      epoch: 1612085164000,
      payload: {
        cgm: {
          apiVersion: "1.0.0",
          endOfLifeTransmitterDate: "2021-03-31T08:21:00.000Z",
          expirationDate: "2021-03-31T08:21:00.000Z",
          manufacturer: "Dexcom",
          name: "G6",
          swVersionTransmitter: "1.0.0",
          transmitterId: "123456789",
        },
        device: {
          deviceId: "123456789-ID",
          imei: "123456789-IMEI",
          manufacturer: "Diabeloop",
          name: "DBLG1",
          swVersion: "1.1.0",
        },
        history: [
          {
            changeDate: "2020-11-29T11:00:00Z",
            parameters: [
              {
                changeType: "updated",
                effectiveDate: "2020-11-29T11:00:00Z",
                level: 1,
                name: "WEIGHT",
                unit: "Kg",
                value: "83",
              },
            ],
          },
          {
            changeDate: "2020-10-01T00:00:00Z",
            parameters: [
              {
                changeType: "added",
                effectiveDate: "2020-10-01T00:00:00Z",
                level: 1,
                name: "WEIGHT",
                unit: "Kg",
                value: "82",
              },
            ],
          },
        ],
        parameters: [
          {
            effectiveDate: "2020-12-02T11:02:23.000Z",
            level: 1,
            name: "WEIGHT",
            unit: "Kg",
            value: "82",
          },
        ],
        pump: {
          expirationDate: "2021-03-30T17:47:32.000Z",
          manufacturer: "Roche",
          name: "Pump0001",
          serialNumber: "123456789",
          swVersion: "1.0.0",
        },
      },
    },
  };

  let component = null;
  const mountOptions = {
    attachTo: null,
  };

  before(async () => {
    sinon.stub(console, "error").callsFake(console.log.bind(console));
    mountOptions.attachTo = document.getElementById("app");
    if (mountOptions.attachTo === null) {
      mountOptions.attachTo = document.createElement("div");
      mountOptions.attachTo.id = "app";
      document.body.appendChild(mountOptions.attachTo);
    }
  });

  after(() => {
    const { attachTo } = mountOptions;
    if (attachTo instanceof HTMLElement) {
      document.body.removeChild(attachTo);
    }
    sinon.restore();
  });

  afterEach(() => {
    defaultProps.copySettingsClicked.resetHistory();
    console.error.resetHistory();

    if (component !== null) {
      component.unmount();
      component.detach();
      component = null;
    }
  });

  it("should render with no error", () => {
    component = mount(<PumpSettingsContainer {...defaultProps } />, mountOptions);
    expect(console.error.callCount).to.equal(0);
    expect(component.exists("#button-settings-copy-as-text")).to.be.true;
  });

  it("should call copySettingsClicked() when copy setting is pressed", (done) => {
    component = mount(<PumpSettingsContainer {...defaultProps } />, mountOptions);
    expect(console.error.callCount).to.equal(0);
    component.find("#button-settings-copy-as-text").simulate("click");
    setTimeout(() => {
      try {
        expect(defaultProps.copySettingsClicked.callCount).to.be.equal(1);
        done();
      } catch (r) {
        done(r);
      }
    }, 10);
  });
});
