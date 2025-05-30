import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { components as vizComponents, utils as vizUtils } from '@tidepool/viz';

const { TwoOptionToggle } = vizComponents;
const { statBgSourceLabels } = vizUtils.stat;

const BgSourceToggle = props => {
  const getBgSource = () => {
    return _.get(props, `chartPrefs[${props.chartType}].bgSource`, _.get(props, 'bgSources.current'));
  };

  const handleBgToggle = (e) => {
    if (e) {
      e.preventDefault();
    }

    const currentBgSource = getBgSource();

    if (currentBgSource) {
      const bgSource = currentBgSource === 'cbg' ? 'smbg' : 'cbg';
      props.onClickBgSourceToggle(e, bgSource);
    }
  };

  const showToggle = props.bgSources.cbg || props.bgSources.smbg;
  const disabled = !(props.bgSources.cbg && props.bgSources.smbg);
  const currentBgSource = getBgSource();

  return (
    <div className="toggle-container">
      {showToggle ? <TwoOptionToggle
        left={{ label: statBgSourceLabels.smbg, state: currentBgSource === 'smbg' }}
        right={{ label: statBgSourceLabels.cbg, state: currentBgSource === 'cbg' }}
        toggleFn={handleBgToggle}
        disabled={disabled}
      /> : null}
    </div>
  );
};

const chartPrefsShape = {
  bgSource: PropTypes.string,
};

BgSourceToggle.displayName = 'BgSourceToggle';

BgSourceToggle.propTypes = {
  bgSources: PropTypes.shape({
    cbg: PropTypes.bool.isRequired,
    smbg: PropTypes.bool.isRequired,
    current: PropTypes.string,
  }).isRequired,
  chartPrefs: PropTypes.shape({
    bgLog: chartPrefsShape,
    daily: chartPrefsShape,
    trends: chartPrefsShape,
  }),
  chartType: PropTypes.string,
  onClickBgSourceToggle: PropTypes.func.isRequired,
};

export default BgSourceToggle;
