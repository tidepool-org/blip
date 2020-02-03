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

import PropTypes from 'prop-types';

import React from 'react';
import { browserHistory } from 'react-router';
import { translate } from 'react-i18next';

import personUtils from '../../core/personutils';

const AddEmailBanner = (props) => {
  const {
    patient,
    trackMetric,
    t,
  } = props;

  const handleSubmit = () => {
    browserHistory.push(`/patients/${patient.userid}/profile#edit`);

    if (trackMetric) {
      const source = 'none';
      const location = 'banner';
      trackMetric('Clicked Banner Add Email', { source, location });
    }
  }

  return (
    <div className='addEmailBanner'>
      <div className="container-box-inner">
        <div className="addEmailBanner-action">
          <button onClick={handleSubmit}>{
            t('ADD EMAIL')
          }</button>
        </div>
        <div className="addEmailBanner-message">
          <div className="message-text">
          {`${t('Add')} ${personUtils.patientFullName(patient)}'s ${t('email to invite them to upload and view data from home')}.`}
          </div>
        </div>
      </div>
    </div>
  );
};

AddEmailBanner.propTypes = {
  trackMetric: PropTypes.func.isRequired,
  patient: PropTypes.object.isRequired,
};

export default translate()(AddEmailBanner);
