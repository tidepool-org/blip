const CHART_QUERY = {
  "bgSource": "cbg",
  "chartType": "trends",
  "excludedDevices": [],
  "excludeDaysWithoutBolus": false,
  "endpoints": [
    1732953600000,
    1734163200000
  ],
  "metaData": "bgSources,devices,matchedDevices,excludedDevices,queryDataCount",
  "forceRemountAfterQuery": false,
  "activeDays": [
    1,
    2,
    3,
    4,
    5,
    6,
    0
  ],
  "types": {
    "cbg": {},
    "smbg": {}
  },
  "aggregationsByDate": "boluses",
  "stats": [
    "timeInRange",
    "averageGlucose",
    "sensorUsage",
    "totalInsulin",
    "averageDailyDose",
    "glucoseManagementIndicator",
    "standardDev",
    "coefficientOfVariation",
    "bgExtents"
  ],
  "nextDays": 0,
  "prevDays": 0,
  "updateChartEndpoints": true,
  "transitioningChartType": true
}

export default CHART_QUERY;