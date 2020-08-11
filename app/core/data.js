import _ from 'lodash';

/**
 * Utility function to check to see if we have any aggregated basics data available
 * @param  {aggregationsByDate} Object - aggregationsByDate data from the data worker
 * @returns {Boolean}
 */
export const isMissingBasicsData = (aggregationsByDate = {}) => {
  const {
    basals = {},
    boluses = {},
    fingersticks = {},
    siteChanges = {},
  } = aggregationsByDate;

  const {
    calibration = {},
    smbg = {},
  } = fingersticks;

  const basicsData = [basals, boluses, siteChanges, calibration, smbg];
  return !_.some(basicsData, d => _.keys(d.byDate).length > 0);
}

export const getFloatFromUnitsAndNanos = ({ units, nanos } = {}) => {
  return parseFloat(parseInt(units) + (parseInt(nanos) / 10e8));
};
