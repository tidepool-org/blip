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

import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import i18n from '../../core/language';
import { MGDL_UNITS } from '../../core/constants';

function PatientBgUnits(props) {
  if (!_.get(props, 'patient.userid')) {
    return null;
  }

  const bgUnits = _.get(props.patient, 'settings.units.bg', MGDL_UNITS);

  return (
    <div className="PatientBgUnits">
      <div className="bgUnits">
        {i18n.t(bgUnits)}
      </div>
    </div>
  );
}

PatientBgUnits.propTypes = {
  patient: PropTypes.object.isRequired,
};

export default PatientBgUnits;
