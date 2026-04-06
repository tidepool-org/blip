/**
 * GRI Percentile Data and Lookup Utilities
 *
 * Data sourced from "Data Analysis of GRI in Randomly-Selected Patients"
 * Contains percentile distributions for:
 * - Overall GRI (glycemia risk index)
 * - GRI(Hypo) - hypoglycemia component
 * - GRI(Hyper) - hyperglycemia component
 */

// Overall GRI Percentiles (score -> percentile)
// Using "Percentile: Percent of Reports with This Score or Lower" column
const GRI_OVERALL_PERCENTILES = {
  0: 0.18, 1: 0.68, 2: 1.13, 3: 1.84, 4: 2.56, 5: 3.38, 6: 4.26, 7: 5.53, 8: 6.70, 9: 8.11,
  10: 9.28, 11: 11.04, 12: 12.52, 13: 14.18, 14: 15.90, 15: 17.89, 16: 19.88, 17: 22.03, 18: 24.12, 19: 26.33,
  20: 29.02, 21: 31.70, 22: 33.91, 23: 36.56, 24: 38.89, 25: 41.54, 26: 43.73, 27: 45.59, 28: 47.85, 29: 50.20,
  30: 52.60, 31: 54.80, 32: 57.05, 33: 59.10, 34: 61.02, 35: 63.09, 36: 64.90, 37: 66.43, 38: 67.81, 39: 69.69,
  40: 71.11, 41: 72.32, 42: 73.67, 43: 74.67, 44: 76.05, 45: 77.68, 46: 78.87, 47: 79.88, 48: 81.04, 49: 82.17,
  50: 83.36, 51: 84.16, 52: 84.86, 53: 85.47, 54: 86.09, 55: 86.95, 56: 87.64, 57: 88.20, 58: 88.91, 59: 89.51,
  60: 90.12, 61: 90.45, 62: 90.84, 63: 91.23, 64: 91.70, 65: 91.95, 66: 92.44, 67: 92.70, 68: 93.05, 69: 93.44,
  70: 93.89, 71: 94.20, 72: 94.41, 73: 94.57, 74: 94.92, 75: 95.12, 76: 95.25, 77: 95.41, 78: 95.64, 79: 95.80,
  80: 96.00, 81: 96.19, 82: 96.33, 83: 96.46, 84: 96.70, 85: 96.80, 86: 96.93, 87: 97.03, 88: 97.15, 89: 97.21,
  90: 97.29, 91: 97.50, 92: 97.64, 93: 97.71, 94: 97.79, 95: 97.91, 96: 97.95, 97: 98.05, 98: 98.13, 99: 98.20,
  100: 100.00,
};

// GRI(Hypo) Percentiles
const GRI_HYPO_PERCENTILES = {
  0: 12.96, 1: 26.31, 2: 37.85, 3: 46.49, 4: 53.49, 5: 60.21, 6: 65.83, 7: 70.39, 8: 74.32, 9: 77.90,
  10: 81.07, 11: 83.42, 12: 85.79, 13: 87.94, 14: 89.59, 15: 91.02, 16: 92.11, 17: 93.05, 18: 93.85, 19: 94.58,
  20: 95.09, 21: 95.71, 22: 96.22, 23: 96.59, 24: 97.02, 25: 97.32, 26: 97.67, 27: 97.91, 28: 98.22, 29: 98.41,
  30: 98.53, 31: 98.65, 32: 98.75, 33: 98.83, 34: 98.96, 35: 99.06, 36: 99.10, 37: 99.16, 38: 99.20, 39: 99.26,
  40: 99.31, 41: 99.33, 42: 99.37, 43: 99.43, 44: 99.53, 45: 99.55, 46: 99.57, 48: 99.59, 51: 99.61, 52: 99.63,
  54: 99.65, 56: 99.67, 57: 99.71, 59: 99.77, 60: 99.78, 61: 99.80, 63: 99.84, 68: 99.86, 69: 99.88, 76: 99.90,
  81: 99.92, 91: 99.94, 100: 100.00,
};

// GRI(Hyper) Percentiles (using cumulative_fraction * 100)
const GRI_HYPER_PERCENTILES = {
  0: 2.83, 1: 5.49, 2: 8.32, 3: 11.83, 4: 15.00, 5: 18.68, 6: 22.47, 7: 25.69, 8: 29.82, 9: 32.71,
  10: 36.90, 11: 40.52, 12: 44.48, 13: 47.82, 14: 51.27, 15: 54.33, 16: 57.44, 17: 60.95, 18: 63.61, 19: 66.27,
  20: 68.76, 21: 70.68, 22: 72.61, 23: 74.59, 24: 76.68, 25: 78.66, 26: 80.00, 27: 81.32, 28: 82.85, 29: 84.21,
  30: 85.17, 31: 86.30, 32: 87.49, 33: 88.29, 34: 88.91, 35: 89.76, 36: 90.72, 37: 91.40, 38: 92.08, 39: 92.64,
  40: 93.38, 41: 93.77, 42: 94.40, 43: 94.74, 44: 95.70, 45: 96.04, 46: 96.32, 47: 96.77, 48: 97.00, 49: 97.11,
  50: 97.40, 51: 97.45, 52: 97.62, 53: 97.74, 54: 97.91, 55: 98.13, 56: 98.36, 57: 98.47, 58: 98.53, 59: 98.64,
  60: 98.87, 61: 98.98, 63: 99.15, 64: 99.21, 65: 99.26, 66: 99.32, 67: 99.38, 69: 99.43, 71: 99.49, 74: 99.60,
  77: 99.66, 78: 99.72, 81: 99.77, 83: 99.83, 84: 99.89, 86: 99.94, 94: 100.00,
};

/**
 * Get zone (A-E) from GRI value
 * Based on existing GRI Grid zones
 */
export function getGriZone(griValue) {
  if (griValue == null || griValue < 0) return null;
  if (griValue <= 20) return 'A';
  if (griValue <= 40) return 'B';
  if (griValue <= 60) return 'C';
  if (griValue <= 80) return 'D';
  return 'E';
}

/**
 * Get zone configuration (color, range, label)
 */
export function getZoneConfig(zone) {
  const ZONE_CONFIG = {
    A: { range: '0-20', color: '#86efac', bgColor: 'rgba(134, 239, 172, 0.15)', label: 'Zone A' },
    B: { range: '21-40', color: '#fde047', bgColor: 'rgba(253, 224, 71, 0.15)', label: 'Zone B' },
    C: { range: '41-60', color: '#fdba74', bgColor: 'rgba(253, 186, 116, 0.15)', label: 'Zone C' },
    D: { range: '61-80', color: '#fca5a5', bgColor: 'rgba(252, 165, 165, 0.15)', label: 'Zone D' },
    E: { range: '81-100', color: '#f0abfc', bgColor: 'rgba(240, 171, 252, 0.15)', label: 'Zone E' },
  };
  return ZONE_CONFIG[zone] || null;
}

/**
 * Linear interpolation between two points
 */
function interpolate(x, x0, y0, x1, y1) {
  if (x1 === x0) return y0;
  return y0 + ((x - x0) * (y1 - y0)) / (x1 - x0);
}

/**
 * Get percentile for a given GRI value using interpolation
 * @param {number} value - The GRI score
 * @param {string} component - 'overall', 'hypo', or 'hyper'
 * @returns {number|null} - Percentile (0-100) or null if invalid
 */
export function getGriPercentile(value, component = 'overall') {
  if (value == null || value < 0) return null;

  const lookupTable = {
    overall: GRI_OVERALL_PERCENTILES,
    hypo: GRI_HYPO_PERCENTILES,
    hyper: GRI_HYPER_PERCENTILES,
  }[component];

  if (!lookupTable) return null;

  // Round to nearest integer for lookup
  const roundedValue = Math.round(value);

  // Exact match
  if (lookupTable[roundedValue] != null) {
    return lookupTable[roundedValue];
  }

  // Find surrounding values for interpolation
  const keys = Object.keys(lookupTable).map(Number).sort((a, b) => a - b);

  // Value is below minimum
  if (roundedValue < keys[0]) {
    return 0;
  }

  // Value is above maximum
  if (roundedValue > keys[keys.length - 1]) {
    return 100;
  }

  // Interpolate between two closest values
  let lowerKey = null;
  let upperKey = null;

  for (let i = 0; i < keys.length - 1; i++) {
    if (keys[i] <= roundedValue && keys[i + 1] >= roundedValue) {
      lowerKey = keys[i];
      upperKey = keys[i + 1];
      break;
    }
  }

  if (lowerKey != null && upperKey != null) {
    const lowerPercentile = lookupTable[lowerKey];
    const upperPercentile = lookupTable[upperKey];
    return interpolate(roundedValue, lowerKey, lowerPercentile, upperKey, upperPercentile);
  }

  return null;
}

/**
 * Get formatted percentile text for display
 * @param {number} percentile - Percentile value (0-100)
 * @returns {string} - Formatted text like "78th percentile"
 */
export function formatPercentile(percentile) {
  if (percentile == null) return '';

  const rounded = Math.round(percentile);

  // Handle special cases for suffix
  const lastDigit = rounded % 10;
  const lastTwoDigits = rounded % 100;

  let suffix = 'th';
  if (lastTwoDigits < 11 || lastTwoDigits > 13) {
    if (lastDigit === 1) suffix = 'st';
    else if (lastDigit === 2) suffix = 'nd';
    else if (lastDigit === 3) suffix = 'rd';
  }

  return `${rounded}${suffix} percentile`;
}

/**
 * Get descriptive text for percentile rank
 * @param {number} percentile - Percentile value (0-100)
 * @returns {string} - Description like "Higher than 78% of patients"
 */
export function getPercentileDescription(percentile) {
  if (percentile == null) return '';

  const rounded = Math.round(percentile);

  if (rounded <= 10) return `Better than ${100 - rounded}% of patients`;
  if (rounded <= 25) return `In the lowest quartile`;
  if (rounded <= 50) return `Below average`;
  if (rounded <= 75) return `Above average`;
  if (rounded <= 90) return `In the highest quartile`;
  return `Higher than ${rounded}% of patients`;
}
