import PropTypes from 'prop-types';
import { MGDL_UNITS, MMOLL_UNITS } from '../utils/constants';

export const bgPrefsPropType = PropTypes.shape({
  bgBounds: PropTypes.shape({
    veryHighThreshold: PropTypes.number.isRequired,
    targetUpperBound: PropTypes.number.isRequired,
    targetLowerBound: PropTypes.number.isRequired,
    veryLowThreshold: PropTypes.number.isRequired,
  }),
  bgUnits: PropTypes.oneOf([MGDL_UNITS, MMOLL_UNITS]),
});
