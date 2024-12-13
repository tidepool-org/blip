const QUERIES = {
  "agpBGM": {
    "endpoints": [
      1730606400000,
      1733202000000
    ],
    "aggregationsByDate": "dataByDate, statsByDate",
    "bgSource": "smbg",
    "stats": [
      "averageGlucose",
      "bgExtents",
      "coefficientOfVariation",
      "glucoseManagementIndicator",
      "readingsInRange"
    ],
    "types": {
      "smbg": {}
    },
    "bgPrefs": {
      "bgUnits": "mg/dL",
      "bgClasses": {
        "low": {
          "boundary": 70
        },
        "target": {
          "boundary": 180
        }
      },
      "bgBounds": {
        "veryHighThreshold": 250,
        "targetUpperBound": 180,
        "targetLowerBound": 70,
        "veryLowThreshold": 54,
        "extremeHighThreshold": 350,
        "clampThreshold": 600
      }
    },
    "metaData": "latestPumpUpload, bgSources",
    "timePrefs": {
      "timezoneAware": true,
      "timezoneName": "US/Eastern"
    },
    "excludedDevices": []
  },
  "agpCGM": {
    "endpoints": [
      1730606400000,
      1733202000000
    ],
    "aggregationsByDate": "dataByDate, statsByDate",
    "bgSource": "cbg",
    "stats": [
      "averageGlucose",
      "bgExtents",
      "coefficientOfVariation",
      "glucoseManagementIndicator",
      "sensorUsage",
      "timeInRange"
    ],
    "types": {
      "cbg": {}
    },
    "bgPrefs": {
      "bgUnits": "mg/dL",
      "bgClasses": {
        "low": {
          "boundary": 70
        },
        "target": {
          "boundary": 180
        }
      },
      "bgBounds": {
        "veryHighThreshold": 250,
        "targetUpperBound": 180,
        "targetLowerBound": 70,
        "veryLowThreshold": 54,
        "extremeHighThreshold": 350,
        "clampThreshold": 600
      }
    },
    "metaData": "latestPumpUpload, bgSources",
    "timePrefs": {
      "timezoneAware": true,
      "timezoneName": "US/Eastern"
    },
    "excludedDevices": []
  }
}

export default QUERIES;