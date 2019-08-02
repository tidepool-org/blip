import _ from 'lodash';
import { utcFormat} from 'd3-time-format';

function formatDate (date) {
  return utcFormat('%b %-d, %Y')(Date.parse(date));
}

function toPercent (n) {
  return '(' + _.round(n*100, 0) + '%)'
}

function getCountAndPercent (n) {
  return _.get(n, 'count') + ' ' + toPercent(_.get(n, 'percentage'))
}

function titleSection (patient) {
  let fullname = _.get(patient, 'profile.fullName')
  let bday = 'Date of birth: ' + formatDate(patient.profile.patient.birthday)
  let diagnosis = 'Date of diagnosis: ' + formatDate(patient.profile.patient.diagnosisDate)
  let currentDate = 'Exported from Tidepool: ' + formatDate(new Date())
  return `${fullname}\n${bday}\n${diagnosis}\n${currentDate}\n`
}

function bgdist (type, units, data) {
  let title = 'BG Distribution: ' + type + ' (' + units + ')'
  let bgtable = []
  let bgtotal = _.get(data, 'total.value')
  _.forEachRight(_.get(data, 'data'), function (range, total) {
    return bgtable += _.toString(_.get(range, 'legendTitle') + ': \t' + _.round(_.get(range, 'value')/bgtotal, 2)*100 + '%\n')
  })
  bgtable = _.replace(bgtable, '>', 'Above ')
  bgtable = _.replace(bgtable, '<', 'Below ')
  return `${title}\n${bgtable}`
}

function calcPercentage (total, n) {
  return '(' + _.round(n/total*100) +'%)'
}

function insulinDist (patientData) {
  let title = 'Insulin:'
  let totalunits = _.round(_.get(patientData, 'basicsData.stats.averageDailyDose.data.data[0].value'), 1)
  let basalunits = _.round(_.get(patientData, 'basicsData.stats.totalInsulin.data.data[1].value'), 1)
  let bolusunits = _.round(_.get(patientData, 'basicsData.stats.totalInsulin.data.data[0].value'), 1)
  let total = 'Avg. Total Daily Dose: ' + totalunits + ' U/day '
  let basal = 'Avg. Basal Insulin: ' + basalunits + ' U/day ' + calcPercentage(totalunits, basalunits)
  let bolus = 'Avg. Bolus Insulin: ' + bolusunits + ' U/day ' + calcPercentage(totalunits, bolusunits)
  return `${title}\n${total}\n${basal}\n${bolus}\n`
}

function bgReadings (patientData) {
  let title = 'Total BG Readings: ' + _.get(patientData, 'basicsData.data.fingerstick.summary.smbg.total')
  let meter = 'Meter:\t' + getCountAndPercent(_.get(patientData, 'basicsData.data.fingerstick.summary.smbg.meter'))
  let manual = 'Manual:\t' + getCountAndPercent(_.get(patientData, 'basicsData.data.fingerstick.summary.smbg.manual'))
  return `${title}\n${meter}\n${manual}\n\n`
}

function bolusBreakdown (patientData) {
  let title = 'Total Boluses: \t' + _.get(patientData, 'basicsData.data.bolus.summary.total')
  let avg = 'Avg. per day: \t' + _.round(_.get(patientData, 'basicsData.data.bolus.summary.avgPerDay'), 0)
  let calculator = 'Calculator: \t' + getCountAndPercent( _.get(patientData, 'basicsData.data.bolus.summary.wizard'))
  let correction = 'Correction: \t' + getCountAndPercent(_.get(patientData, 'basicsData.data.bolus.summary.correction'))
  let override = 'Override: \t' + getCountAndPercent(_.get(patientData, 'basicsData.data.bolus.summary.override'))
  let underride = 'Underride: \t' + getCountAndPercent(_.get(patientData, 'basicsData.data.bolus.summary.underride'))
  let manualnum = _.get(patientData, 'basicsData.data.bolus.summary.total') - _.get(patientData, 'basicsData.data.bolus.summary.wizard.count')
  let manualpercent = ' ' + calcPercentage(_.get(patientData, 'basicsData.data.bolus.summary.total'), manualnum)
  let manual = 'Manual: \t' + manualnum + manualpercent
  let extended = 'Extended: \t' + getCountAndPercent(_.get(patientData, 'basicsData.data.bolus.summary.extended'))
  let interrupted = 'Interrupted: \t' + getCountAndPercent(_.get(patientData, 'basicsData.data.bolus.summary.interrupted'))

  return `${title}\n${avg}\n${calculator}\n${correction}\n${override}\n${underride}\n${manual}\n${extended}\n${interrupted}\n`
}

function infusionSiteCalc (source) {
  let days = []
  _.forEach(source.infusionSiteHistory, function(date){
    if (_.has(date, 'daysSince')) {
      return days.push(_.get(date, 'daysSince'))
    }
  });
  return {
    mean: _.mean(days),
    max: _.max(days),
  }
}

function infusionSiteChange (source, patientData) {
  let title = 'Infusion Site Changes';
  let sitedata = null
  if (source === 'cannulaPrime') {
    sitedata = infusionSiteCalc(_.get(patientData, 'basicsData.data.cannulaPrime'))
  }else if (source === 'tubingPrime') {
    sitedata = infusionSiteCalc(_.get(patientData, 'basicsData.data.tubingPrime'))
  }
  let meandays = 'Mean Duration: ' + _.get(sitedata, 'mean') + ' days'
  let maxdays = 'Longest Duration: ' + _.get(sitedata, 'max') + ' days'
  return `${title}\n${meandays}\n${maxdays}\n`
}

function basalData (source, numdays) {
  let num = _.get(source, 'count')
  let avg = num/numdays
  let text = num + ' (Avg. ' + avg + '/day)'
  return `${text}`
}

function basalEvents (patientData, dataUtil) {
  let title = 'Basal Events:'
  let numdays = _.get(dataUtil, 'days')
  let tempBasal = 'Temp. Basals: ' + basalData(_.get(patientData, 'basicsData.data.basal.summary.temp'), numdays)
  let suspend = 'Suspends: ' + basalData(_.get(patientData, 'basicsData.data.basal.summary.suspend'), numdays)
  return `${title}\n${tempBasal}\n${suspend}\n`
}

export default function basicsText (patient, patientData, dataUtil, chartPrefs) {
  let title = titleSection(_.get(patient))

  let startDate = formatDate(_.get(patientData, 'basicsData.dateRange[0]'))
  let endDate = formatDate(_.get(patientData, 'basicsData.dateRange[1]'))
  let dateRange = 'Start Date: ' + startDate + '\nEnd Date: ' + endDate + '\n'

  let bgsource = _.get(chartPrefs, 'basics.bgSource')
  let bgunits = _.get(patient, 'settings.units.bg')
  let bg = null
  if (bgsource === 'cbg'){
    bg = bgdist('CGM', bgunits, _.get(patientData, 'basicsData.stats.timeInRange.data'))
  } else {
    bg = bgdist('BG Meter', bgunits, _.get(patientData, 'basicsData.stats.readingsInRange.data'))
  }

  let carbs = 'Avg. Daily Carbs: ' + _.round(_.get(patientData, 'basicsData.stats.carbs.data.data[0].value'), 0) + ' grams\n'

  let insulin = insulinDist(patientData)

  let numbg = (bgsource === 'smbg') ? bgReadings(patientData) : ''

  let bolus = bolusBreakdown(patientData)

  let infusionsite = infusionSiteChange(_.get(patient, 'settings.siteChangeSource'), patientData)

  let basal = basalEvents(patientData, dataUtil)

  return `${title}\n${dateRange}\n${bg}\n${carbs}\n${insulin}\n${numbg}${bolus}\n${infusionsite}\n${basal}\n`
}
