import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import { withTranslation } from 'react-i18next';
import { components as vizComponents } from '@tidepool/viz';
import InfoOutlinedIcon from '@material-ui/icons/InfoOutlined';

import { DEFAULT_CGM_SAMPLE_INTERVAL_RANGE, ONE_MINUTE_CGM_SAMPLE_INTERVAL_RANGE } from '../../core/constants';
import { Box, Flex } from 'theme-ui';
import Icon from '../elements/Icon';

const { TwoOptionToggle, CgmSampleIntervalTooltip } = vizComponents;

const CgmSampleIntervalRangeToggle = props => {
  const { t } = props;
  const [showTooltip, setShowTooltip] = React.useState(false);

  const getBgSource = () => {
    return _.get(props, `chartPrefs[${props.chartType}].bgSource`, _.get(props, 'bgSources.current'));
  };

  const getCgmSampleInterval = () => {
    return _.get(props, `chartPrefs[${props.chartType}].cgmSampleIntervalRange`, DEFAULT_CGM_SAMPLE_INTERVAL_RANGE);
  };

  const handleCgmSampleIntervalToggle = (e) => {
    if (e) {
      e.preventDefault();
    }

    const currentCgmSampleIntervalRange = getCgmSampleInterval();

    if (_.isEqual(currentCgmSampleIntervalRange, DEFAULT_CGM_SAMPLE_INTERVAL_RANGE)) {
      props.onClickCgmSampleIntervalRangeToggle(e, ONE_MINUTE_CGM_SAMPLE_INTERVAL_RANGE);
    } else{
      props.onClickCgmSampleIntervalRangeToggle(e, DEFAULT_CGM_SAMPLE_INTERVAL_RANGE);
    }
  };

  const currentCgmSampleIntervalRange = getCgmSampleInterval();
  const showToggle = getBgSource() === 'cbg'; // TODO: only show if user has a cgm device that supports 1min intervals

  return showToggle ? (
    <Flex className="toggle-container" sx={{ alignItems: 'center' }}>
      <TwoOptionToggle
        left={{ label: t('1min Data'), state: _.isEqual(currentCgmSampleIntervalRange, ONE_MINUTE_CGM_SAMPLE_INTERVAL_RANGE) }}
        right={{ label: t('5min Data'), state: _.isEqual(currentCgmSampleIntervalRange, DEFAULT_CGM_SAMPLE_INTERVAL_RANGE) }}
        toggleFn={handleCgmSampleIntervalToggle}
      />

      <Flex sx={{ position: 'relative', alignItems: 'center' }}>
        <Icon
          icon={InfoOutlinedIcon}
          color="stat.text"
          sx={{ fontSize: 1 }}
          onMouseEnter={() => setShowTooltip(true)}
          onMouseLeave={() => setShowTooltip(false)}
        />
        {showTooltip && (
          <Box sx={{ zIndex: 1, position: 'relative' }}>
            <CgmSampleIntervalTooltip position={{ top: 0, left: 0 }} />
          </Box>
        )}
      </Flex>
    </Flex>
  ) : null;
};

CgmSampleIntervalRangeToggle.displayName = 'CgmSampleIntervalRangeToggle';

const chartPrefsShape = {
  bgSource: PropTypes.string,
  cgmSampleIntervalRange: PropTypes.arrayOf(PropTypes.number),
};

CgmSampleIntervalRangeToggle.propTypes = {
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
  onClickCgmSampleIntervalRangeToggle: PropTypes.func.isRequired,
};

export default withTranslation()(CgmSampleIntervalRangeToggle);
