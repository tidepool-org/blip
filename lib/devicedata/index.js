// == BSD2 LICENSE ==
// Copyright (c) 2014, Tidepool Project
//
// This program is free software; you can redistribute it and/or modify it under
// the terms of the associated License, which is identical to the BSD 2-Clause
// License as published by the Open Source Initiative at opensource.org.
//
// This program is distributed in the hope that it will be useful, but WITHOUT
// ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
// FOR A PARTICULAR PURPOSE. See the License for more details.
//
// You should have received a copy of the License along with this program; if
// not, you can obtain one from Tidepool Project at tidepool.org.
// == BSD2 LICENSE ==

'use strict';

var Rx = (typeof window !== 'undefined' && typeof window.Rx !== 'undefined') ? window.Rx : require('rx');

require('./convertbasal.js');
require('./convertbolus.js');
require('./convertwizard.js');

module.exports = {
  processAll: function(data, cb) {
    Rx.Observable.fromArray(data)
      .tidepoolConvertBasal()
      .tidepoolConvertBolus()
      .tidepoolConvertWizard()
      .toArray()
      .subscribe(function(data) {
        cb(null, data);
      }, cb);
  }
};
