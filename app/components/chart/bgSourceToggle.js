import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { components as vizComponents, utils as vizUtils } from '@tidepool/viz';

import { BG_DATA_TYPES } from '../../core/constants';

const { TwoOptionToggle } = vizComponents;
const { statBgSourceLabels } = vizUtils.stat;

class BgSourceToggle extends PureComponent {
  static propTypes = {
    bgSources: PropTypes.shape({
      cbg: PropTypes.bool.isRequired,
      smbg: PropTypes.bool.isRequired,
      current: PropTypes.string,
    }).isRequired,
    chartPrefs: PropTypes.shape({
      bgSource: PropTypes.string,
    }),
    chartType: PropTypes.string,
    onClickBgSourceToggle: PropTypes.func.isRequired,
  };

  static displayName = 'BgSourceToggle';

  render = () => {
    const showToggle = this.props.bgSources.cbg || this.props.bgSources.smbg;
    const disabled = !(this.props.bgSources.cbg && this.props.bgSources.smbg);
    const currentBgSource = this.getBgSource();

    return (
      <div className="toggle-container">
        {showToggle ? <TwoOptionToggle
          left={{ label: statBgSourceLabels.smbg, state: currentBgSource === 'smbg' }}
          right={{ label: statBgSourceLabels.cbg, state: currentBgSource === 'cbg' }}
          toggleFn={this.handleBgToggle}
          disabled={disabled}
        /> : null}
      </div>
    );
  };

  getBgSource = () => {
    return _.get(this.props, `chartPrefs[${this.props.chartType}].bgSource`, _.get(this.props, 'bgSources.current'));
  };

  handleBgToggle = (e) => {
    if (e) {
      e.preventDefault();
    }

    const currentBgSource = this.getBgSource();

    if (currentBgSource) {
      const bgSource = currentBgSource === 'cbg' ? 'smbg' : 'cbg';
      this.props.onClickBgSourceToggle(e, bgSource);
    }
  };
};

export default BgSourceToggle;
