import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { components as vizComponents } from '@tidepool/viz';

import { BG_DATA_TYPES } from '../../core/constants';

const { TwoOptionToggle } = vizComponents;

class BgSourceToggle extends PureComponent {
  static propTypes = {
    bgSource: PropTypes.oneOf(BG_DATA_TYPES),
    chartPrefs: PropTypes.object.isRequired,
    chartType: PropTypes.oneOf(['basics', 'daily', 'weekly', 'trends']).isRequired,
    onClickBgSourceToggle: PropTypes.func.isRequired,
  };

  render = () => {
    return (
      <div className="toggle-container">
        <TwoOptionToggle
          left={{ label: 'BGM', state: this.props.bgSource === 'smbg' }}
          right={{ label: 'CGM', state: this.props.bgSource === 'cbg' }}
          toggleFn={this.handleBgToggle}
          />
      </div>
    );
  };

  handleBgToggle = (e) => {
    if (e) {
      e.preventDefault();
    }

    if (this.props.bgSource) {
      const bgSource = this.props.bgSource === 'cbg' ? 'smbg' : 'cbg';
      this.props.onClickBgSourceToggle(e, bgSource);
    }
  };
};

export default BgSourceToggle;
