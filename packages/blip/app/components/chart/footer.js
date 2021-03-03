
/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2014, Tidepool Project
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
import i18next from 'i18next';

function TidelineFooter(props) {
  const { children, onClickRefresh } = props;
  return (
    <div className="container-box-outer patient-data-footer-outer">
      <div className="container-box-inner patient-data-footer-inner">
        <div className="patient-data-footer-left">
          <button className="btn btn-chart btn-refresh" onClick={onClickRefresh}>
            {i18next.t('Refresh')}</button>
        </div>
        <div className="patient-data-footer-right">{children}</div>
      </div>
    </div>
  );
}

TidelineFooter.propTypes = {
  children: PropTypes.node,
  onClickRefresh: PropTypes.func.isRequired,
};

TidelineFooter.defaultProps = {
  children: null,
};

export default TidelineFooter;
