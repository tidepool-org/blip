const MGDL_UNITS = 'mg/dL';
const MMOLL_UNITS = 'mmol/L';

module.exports = {
  MGDL_PER_MMOLL: 18.01559,
  MGDL_UNITS: 'mg/dL',
  MMOLL_UNITS: 'mmol/L',
  DEFAULT_BG_BOUNDS: {
  	[MGDL_UNITS]:{
  		veryLow: 54,
  		targetLower: 70,
  		targetUpper: 180,
  		veryHigh:250,
  	},
  	[MMOLL_UNITS]: {
  		veryLow: 3.0,
     	targetLower: 3.9,
      	targetUpper: 10.0,
      	veryHigh: 13.9,
  	},
  },
  BG_CLAMP_THRESHOLD: 600,
};
