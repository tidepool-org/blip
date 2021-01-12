/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2020, Diabeloop
 *
 * This program is free software; you can redistribute it and/or modify it under
 * the terms of the associated License, which is identical to the BSD 2-Clause
 * License as published by the Open Source Initiative at opensource.org.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A confidRTICULAR PURPOSE. See the License for more details.
 *
 * You should have received a copy of the License along with this program; if
 * not, you can obtain one from Tidepool Project at tidepool.org.
 * == BSD2 LICENSE ==
 */

import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import i18next from 'i18next';
import Tooltip from '../../common/tooltips/Tooltip';
import colors from '../../../styles/colors.css';
import styles from './ConfidentialTooltip.css';

import {Grid} from '@material-ui/core';
import LockIcon from '@material-ui/icons/LockOutlined';

const t = i18next.t.bind(i18next);

class ConfidentialTooltip extends React.Component {

  renderConfidential(c) {
    return <Grid container direction="row" alignItems="center" justify="center">
      <Grid item>
      <LockIcon className={styles.icon} />
      </Grid>
      <Grid item>{t('Confidential mode')}</Grid>
    </Grid>;
  }

  render() {
    const { confidential } = this.props;

    return (
      <Tooltip
        {...this.props}
        content={this.renderConfidential(confidential)}
      />
    );
  }
}

ConfidentialTooltip.propTypes = {
  position: PropTypes.shape({
    top: PropTypes.number.isRequired,
    left: PropTypes.number.isRequired,
  }).isRequired,
  offset: PropTypes.shape({
    top: PropTypes.number.isRequired,
    left: PropTypes.number,
    horizontal: PropTypes.number,
  }),
  title: PropTypes.node,
  tail: PropTypes.bool.isRequired,
  side: PropTypes.oneOf(['top', 'right', 'bottom', 'left']).isRequired,
  backgroundColor: PropTypes.string,
  borderColor: PropTypes.string.isRequired,
  borderWidth: PropTypes.number.isRequired,
  confidential: PropTypes.shape({
    duration: PropTypes.shape({
      units: PropTypes.string.isRequired,
      value: PropTypes.number.isRequired,
    }).isRequired,
  }).isRequired,
  timePrefs: PropTypes.object.isRequired,
};

ConfidentialTooltip.defaultProps = {
  tail: true,
  side: 'right',
  tailWidth: 9,
  tailHeight: 17,
  tailColor: colors.confidentialMode,
  borderColor: colors.confidentialMode,
  borderWidth: 2,
  title: null,
};

export default ConfidentialTooltip;
