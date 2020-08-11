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

import { addDuration } from '../src/utils/datetime';
import { MGDL_UNITS, MS_IN_DAY } from '../src/utils/constants';

const APPEND = '.000Z';

class Common {
  constructor(opts = {}) {
    this.deviceId = 'Test Page Data - 123';
    this.source = opts.source || 'testpage';
    this.conversionOffset = 0;

    this.assignGUID();
  }

  assignGUID() {
    const guid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, c => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });

    this.id = guid;
  }

  asObject() {
    const clone = {};

    _.forIn(this, (value, key) => {
      if (typeof key !== 'function') {
        clone[key] = value;
      }
    });

    return clone;
  }

  makeDeviceTime() {
    return new Date().toISOString().slice(0, -5);
  }

  makeLocalDate() {
    return new Date().toISOString().slice(0, 10);
  }

  makeNormalTime() {
    return this.deviceTime + APPEND;
  }

  makeTime() {
    const d = new Date(this.deviceTime + APPEND);
    const offsetMinutes = d.getTimezoneOffset();
    d.setUTCMinutes(d.getUTCMinutes() + offsetMinutes);
    return d.toISOString();
  }

  makeTimezoneOffset() {
    const d = new Date(this.deviceTime + APPEND);
    const offsetMinutes = d.getTimezoneOffset();
    return -offsetMinutes;
  }
}

export class Basal extends Common {
  constructor(opts = {}) {
    super(opts);

    _.defaults(opts, {
      deliveryType: 'scheduled',
      deviceTime: this.makeDeviceTime(),
      duration: MS_IN_DAY / 12,
      rate: 0.5,
    });

    this.type = 'basal';

    this.deliveryType = opts.deliveryType;
    this.deviceTime = opts.deviceTime;
    this.duration = opts.duration;
    this.rate = opts.rate;

    this.time = this.makeTime();
    this.timezoneOffset = this.makeTimezoneOffset();
    this.normalTime = this.makeNormalTime();
    this.normalEnd = addDuration(this.normalTime, this.duration);
  }
}

export class Bolus extends Common {
  constructor(opts = {}) {
    super(opts);

    _.defaults(opts, {
      deviceTime: this.makeDeviceTime(),
      subType: 'normal',
      value: 5.0,
    });

    this.type = 'bolus';
    this.deviceTime = opts.deviceTime;
    this.subType = opts.subType;

    if (this.subType === 'normal') {
      this.normal = opts.value;
    }

    this.time = this.makeTime();
    this.timezoneOffset = this.makeTimezoneOffset();
    this.normalTime = this.makeNormalTime();
  }
}

export class CBG extends Common {
  constructor(opts = {}) {
    super(opts);

    _.defaults(opts, {
      deviceId: 'DexG4Rec_XXXXXXXXX',
      deviceTime: this.makeDeviceTime(),
      units: MGDL_UNITS,
      value: 100,
      localDate: this.makeLocalDate(),
    });

    this.type = 'cbg';

    this.deviceTime = opts.deviceTime;
    this.deviceId = opts.deviceId;
    this.units = opts.units;
    this.value = opts.value;
    this.localDate = opts.localDate;

    this.time = this.makeTime();
    this.timezoneOffset = this.makeTimezoneOffset();
    this.normalTime = this.makeNormalTime();
  }
}

export class Message extends Common {
  constructor(opts = {}) {
    super(opts);

    _.defaults(opts, {
      messageText: 'This is a note.',
      parentMessage: null,
      time: new Date().toISOString(),
    });

    this.type = 'message';

    this.time = opts.time;
    const dt = new Date(this.time);
    const offsetMinutes = dt.getTimezoneOffset();
    dt.setUTCMinutes(dt.getUTCMinutes() - offsetMinutes);
    this.normalTime = dt.toISOString();

    this.messageText = opts.messageText;
    this.parentMessage = opts.parentMessage;
  }
}

export class Settings extends Common {
  constructor(opts = {}) {
    super(opts);

    _.defaults(opts, {
      activeBasalSchedule: 'standard',
      basalSchedules: [{
        name: 'standard',
        value: [{
          start: 0,
          rate: 1.0,
        }],
      }],
      bgTarget: [{
        high: 100,
        low: 80,
        start: 0,
      }],
      carbRatio: [{
        amount: 15,
        start: 0,
      }],
      deviceTime: this.makeDeviceTime(),
      insulinSensitivity: [{
        amount: 50,
        start: 0,
      }],
      units: {
        carb: 'grams',
        bg: MGDL_UNITS,
      },
    });

    this.type = 'settings';

    this.activeBasalSchedule = opts.activeBasalSchedule;
    this.basalSchedules = opts.basalSchedules;
    this.bgTarget = opts.bgTarget;
    this.carbRatio = opts.carbRatio;
    this.deviceTime = opts.deviceTime;
    this.insulinSensitivity = opts.insulinSensitivity;
    this.units = opts.units;

    this.time = this.makeTime();
    this.timezoneOffset = this.makeTimezoneOffset();
    this.normalTime = this.makeNormalTime();
  }
}

export class SMBG extends Common {
  constructor(opts = {}) {
    super(opts);

    _.defaults(opts, {
      deviceTime: this.makeDeviceTime(),
      displayOffset: 0,
      units: MGDL_UNITS,
      value: 100,
      localDate: this.makeLocalDate(),
    });

    this.type = 'smbg';

    this.deviceTime = opts.deviceTime;
    this.units = opts.units;
    this.value = opts.value;
    this.localDate = opts.localDate;

    this.time = this.makeTime();
    this.timezoneOffset = this.makeTimezoneOffset();
    this.displayOffset = opts.displayOffset;
    this.normalTime = this.makeNormalTime();
  }
}

export class DeviceEvent extends Common {
  constructor(opts = {}) {
    super(opts);

    _.defaults(opts, {
      deviceTime: this.makeDeviceTime(),
      units: 'mg/dL',
      value: 100,
      primeTarget: 'cannula',
    });

    this.type = 'deviceEvent';
    this.subType = opts.subType;

    if (opts.subType === 'prime') {
      this.primeTarget = opts.primeTarget;
    }

    this.deviceTime = opts.deviceTime;

    this.time = this.makeTime();
    this.createdTime = this.makeTime();
    this.timezoneOffset = this.makeTimezoneOffset();
    this.normalTime = this.makeNormalTime();
  }
}

export class Upload extends Common {
  constructor(opts = {}) {
    super(opts);

    _.defaults(opts, {
      deviceTime: this.makeDeviceTime(),
      timezone: 'US/Eastern',
    });

    this.type = 'upload';
    this.deviceTags = opts.deviceTags;
    this.source = opts.source;
    this.deviceTime = opts.deviceTime;
    this.deviceModel = opts.deviceModel;

    this.time = this.makeTime();
    this.timezone = opts.timezone;
    this.normalTime = this.makeNormalTime();
    this.createdTime = this.makeTime();
    this.timezoneOffset = this.makeTimezoneOffset();
  }
}

export class Wizard extends Common {
  constructor(opts = {}) {
    super(opts);

    if (opts.bolus) {
      // eslint-disable-next-line no-param-reassign
      opts.deviceTime = opts.bolus.deviceTime;
    }
    _.defaults(opts, {
      bgTarget: {
        high: 120,
        target: 100,
      },
      deviceTime: this.makeDeviceTime(),
      insulinCarbRatio: 15,
      insulinSensitivity: 50,
      recommended: {},
      value: 5.0,
    });

    this.type = 'wizard';

    this.bgTarget = opts.bgTarget;
    this.bolus = opts.bolus ? opts.bolus : new Bolus({
      value: opts.value,
      deviceTime: this.deviceTime,
    });

    this.carbInput = opts.carbInput;
    this.deviceTime = opts.deviceTime;
    this.insulinCarbRatio = opts.insulinCarbRatio;
    this.insulinSensitivity = opts.insulinSensitivity;
    this.recommended = opts.recommended;

    this.time = this.makeTime();
    this.timezoneOffset = this.makeTimezoneOffset();
    this.normalTime = this.makeNormalTime();
  }
}

export class Food extends Common {
  constructor(opts = {}) {
    super(opts);

    _.defaults(opts, {
      deviceTime: this.makeDeviceTime(),
    });

    this.type = 'food';
    this.deviceTime = opts.deviceTime;
    this.nutrition = opts.nutrition;

    this.prescriptor = (opts.prescribedNutrition) ? opts.prescriptor : undefined;
    this.prescribedNutrition = (opts.prescribedNutrition) ? opts.prescribedNutrition : undefined; 

    this.time = this.makeTime();
    this.normalTime = this.makeNormalTime();
    this.createdTime = this.makeTime();
    this.timezoneOffset = this.makeTimezoneOffset();
  }
}

export const types = {
  Basal,
  Bolus,
  CBG,
  DeviceEvent,
  Food,
  Message,
  Settings,
  SMBG,
  Upload,
  Wizard,
};

export default types;
