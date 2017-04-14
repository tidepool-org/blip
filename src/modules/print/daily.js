/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2017, Tidepool Project
 *
 * This program is free software; you can redistribute it and/or modify it under
 * the terms of the associated License, which is identical to the BSD 2-Clause
 * License as published by the Open Source Initiative at opensource.org.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the License for more details.
 *
 * You should have received a copy of the License along with this program; if
 * not, you can obtain one from Tidepool Project at tidepool.org.
 * == BSD2 LICENSE ==
 */

/* eslint-disable no-console */

/* global PDFDocument, blobStream */

import _ from 'lodash';
import moment from 'moment-timezone';
import { extent } from 'd3-array';
import { scaleLinear } from 'd3-scale';

import { calcCbgTimeInCategories, classifyBgValue } from '../../utils/bloodglucose';
import {
  getTimezoneFromTimePrefs,
  timezoneAwareCeiling,
} from '../../utils/datetime';
import { displayPercentage } from '../../utils/format';

import styles from '../../styles/colors.css';

import getBolusPaths from '../render/bolus';

// dimensions of portrait-oriented 8.5" x 11" PDF are 612 x 792 at 72 dpi
// usable area with default 1" margins is 468 x 648
const DPI = 72;
const MARGIN = 72 / 2;
const DIMS = {
  WIDTH: 8.5 * DPI - (2 * MARGIN),
  HEIGHT: 11 * DPI - (2 * MARGIN),
};

const SUMMARY_WIDTH = DPI * 1.5;

const DATES_PER_PAGE = 3;

/**
 * selectData
 * @param {String} mostRecent - an ISO 8601-formatted timestamp of the most recent diabetes datum
 * @param {Object} dataByDate - a Crossfilter dimension for querying diabetes data by normalTime
 * @param {Number} numDays - number of days of data to select
 *
 * @return {TYPE} NAME
 */
export function selectData(mostRecent, dataByDate, numDays, timePrefs) {
  const timezone = getTimezoneFromTimePrefs(timePrefs);
  const end = timezoneAwareCeiling(mostRecent, timezone);
  const dateBoundaries = [end.toISOString()];
  let last = end;
  for (let i = 0; i < numDays; ++i) {
    const startOfDate = moment.utc(last)
      .tz(timezone)
      .subtract(1, 'day')
      .toDate();
    dateBoundaries.push(
      startOfDate.toISOString()
    );
    last = startOfDate;
  }
  dateBoundaries.reverse();
  const selected = {};
  for (let i = 0; i < numDays; ++i) {
    const start = dateBoundaries[i];
    const date = moment.utc(Date.parse(start))
      .tz(timezone)
      .format('YYYY-MM-DD');
    selected[date] = {
      bounds: [start, dateBoundaries[i + 1]],
      date,
      data: _.groupBy(dataByDate.filterRange([start, dateBoundaries[i + 1]]).top(Infinity), 'type'),
    };
    // get rid of irrelevant data types for...neatness?
    if (selected[date].data.fill) {
      delete selected[date].data.fill;
    }
    if (selected[date].data.pumpSettings) {
      delete selected[date].data.pumpSettings;
    }
    if (selected[date].data.wizard) {
      const wizards = selected[date].data.wizard;
      selected[date].data.wizard = _.reduce(wizards, (wizardsMap, wiz) => {
        wizardsMap[wiz.bolus.id] = wiz; // eslint-disable-line no-param-reassign
        return wizardsMap;
      }, {});
    }
    // TODO: select out infusion site changes, calibrations from deviceEvent array
  }
  // TODO: properly factor out into own utility? API needs thinking about
  const bgs = _.reduce(
    selected,
    (all, date) => (
      all.concat(_.get(date, ['data', 'cbg'], [])).concat(_.get(date, ['data', 'smbg'], []))
    ),
    []
  );
  selected.bgRange = extent(bgs, (d) => (d.value));

  const boluses = _.reduce(
    selected, (all, date) => (all.concat(_.get(date, ['data', 'bolus'], []))), []
  );
  selected.bolusRange = extent(boluses, (d) => (d.normal + (d.extended || 0)));

  const basals = _.reduce(
    selected, (all, date) => (all.concat(_.get(date, ['data', 'basal'], []))), []
  );
  selected.basalRange = extent(basals, (d) => (d.rate));

  console.log('DAILY PRINT VIEW DATA', selected);
  return selected;
}

/**
 * renderDateSummary
 * @param {PDFDocument} doc - the PDF target for rendering
 * @param {Number} yPos - the y-coordinate at which to start rendering
 * @param {Object} dateData - object containing String date and type-grouped Tidepool diabetes data
 * @param {Object} ops - object containing { bgBounds }
 */
export function renderDateSummary(doc, yPos, { date, data }, { bgBounds }) {
  doc.font('Helvetica-Bold')
    .fontSize(10)
    .text(moment(date, 'YYYY-MM-DD').format('dddd M/D'), MARGIN, yPos);

  const lineHeight = doc.currentLineHeight();
  const separatorHeight = yPos + lineHeight * 1.5;

  doc.moveTo(MARGIN, separatorHeight)
    .lineTo(MARGIN + SUMMARY_WIDTH, separatorHeight)
    .strokeColor('#D8D8D8')
    .lineWidth(0.25)
    .stroke();

  doc.fontSize(8)
    .text('Time in Target', MARGIN, separatorHeight + lineHeight);
  const { targetUpperBound, targetLowerBound } = bgBounds;
  const cbgTimeInCategories = calcCbgTimeInCategories(data.cbg, bgBounds);
  doc.moveDown()
    .font('Helvetica')
    .text(
      `${targetLowerBound} - ${targetUpperBound}`,
      { indent: 4, continued: true, width: SUMMARY_WIDTH },
    )
    .text(`${displayPercentage(cbgTimeInCategories.target)}`, { align: 'right' });
}

/**
 * renderDateChart
 * @param {PDFDocument} doc - the PDF target for rendering
 * @param {Number} yPos - the y-coordinate at which to start rendering
 * @param {Array} selectedData - result of selectData function
 * @param {Object} ops - object containing { bgBounds }
 */
export function renderDateChart(doc, yPos, selectedData, { bgBounds, chartHeight, date }) {
  const chartLeft = MARGIN + SUMMARY_WIDTH + MARGIN;
  const chartRight = MARGIN + DIMS.WIDTH;
  const chartTop = yPos;
  // draw the x- and y- axis frames
  doc.moveTo(chartLeft, yPos)
    .lineTo(chartLeft, yPos + chartHeight)
    .lineTo(chartRight, yPos + chartHeight)
    .lineTo(chartRight, yPos)
    .stroke();

  // draw the line marking the bottom of the first "pool" in the chart for BG & bolus data
  const firstPoolHeight = yPos + 0.75 * DPI;
  doc.moveTo(chartLeft, firstPoolHeight)
    .lineTo(chartRight, firstPoolHeight)
    .stroke();

  // draw the line marking the top of the bottom "pool" in the chart for basal selectedData
  const bottomPoolTopEdge = yPos + chartHeight - 0.5 * DPI;
  doc.moveTo(chartLeft, bottomPoolTopEdge)
    .lineTo(chartRight, bottomPoolTopEdge)
    .stroke();

  const { bounds } = selectedData[date];

  const xScale = scaleLinear()
    .domain([Date.parse(bounds[0]), Date.parse(bounds[1])])
    .range([chartLeft, chartRight]);
  const bgScale = scaleLinear()
    .domain([0, selectedData.bgRange[1]])
    .range([firstPoolHeight, chartTop]);
  const bolusScale = scaleLinear()
    .domain([0, selectedData.bolusRange[1]])
    .range([firstPoolHeight, firstPoolHeight - ((firstPoolHeight - chartTop) / 2)]);

  // render cbg
  _.each(selectedData[date].data.cbg, (cbg) => {
    console.log(styles[classifyBgValue(bgBounds, cbg.value)]);
    // eslint-disable-next-line lodash/prefer-lodash-method
    doc.circle(xScale(Date.parse(cbg.normalTime)), bgScale(cbg.value), 1)
      .fill(styles[classifyBgValue(bgBounds, cbg.value)]);
  });

  // render boluses
  _.each(selectedData[date].data.bolus, (bolus) => {
    if (bolus.normal) {
      const paths = getBolusPaths(bolus, xScale, bolusScale, { bolusWidth: 3 });
      _.each(paths, (path) => {
        doc.path(path.d).fill('black'); // eslint-disable-line lodash/prefer-lodash-method
      });
    }
  });
}

/**
 * openDailyPrintView
 * @param {String} mostRecent - an ISO 8601-formatted timestamp of the most recent diabetes datum
 * @param {Object} dataByDate - a Crossfilter dimension for querying diabetes data by normalTime
 * @param {Object} opts - an object of print options (see destructured param below)
 *
 * @return {String} url - the PDF file blog URL for opening in a new tab & printing
 */
// opts will be { bgPrefs, dateTitle, patientName, numDays, timePrefs }
export default function openDailyPrintView(mostRecent, dataByDate, {
  bgPrefs, numDays, timePrefs,
}) {
  // TODO: refactor this from where it was c&p-ed from (blip's trends.js)
  // repeating this logic here long-term would be super dumb and non-DRY
  const { bgClasses } = bgPrefs;
  const bgBounds = {
    veryHighThreshold: bgClasses.high.boundary,
    targetUpperBound: bgClasses.target.boundary,
    targetLowerBound: bgClasses.low.boundary,
    veryLowThreshold: bgClasses['very-low'].boundary,
  };

  const data = selectData(mostRecent, dataByDate, numDays, timePrefs);
  const doc = new PDFDocument;
  const stream = doc.pipe(blobStream());
  doc.fontSize(14).text('Daily View', MARGIN, MARGIN)
    .moveDown();
  const lineHeight = doc.currentLineHeight();
  const height = lineHeight * 2 + MARGIN;
  doc.moveTo(MARGIN, height)
    .lineTo(MARGIN + DIMS.WIDTH, height)
    .stroke();

  const poolHeights = [lineHeight * 4 + MARGIN];
  const chartHeight = (DIMS.HEIGHT - poolHeights[0]) / 4;
  // TODO: don't hardcode like this!
  // make dependent on DATES_PER_PAGE
  poolHeights.push(poolHeights[0] + chartHeight);
  poolHeights.push(poolHeights[1] + chartHeight);

  const dates = _.keys(data);

  for (let i = 0; i < DATES_PER_PAGE; ++i) {
    renderDateSummary(doc, poolHeights[i], data[dates[i]], { bgBounds });
    renderDateChart(
      doc,
      poolHeights[i],
      data,
      { bgBounds, chartHeight: chartHeight * 0.75, date: dates[i] },
    );
  }

  doc.end();

  stream.on('finish', () => {
    window.open(stream.toBlobURL('application/pdf'));
    // const printWindow = window.open(stream.toBlobURL('application/pdf'));
    // printWindow.focus();
    // printWindow.print();
  });
}
