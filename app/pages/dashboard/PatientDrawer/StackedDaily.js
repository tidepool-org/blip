import React, { useRef } from 'react';
import { useSelector } from 'react-redux';
import { Box } from 'theme-ui';
import { STATUS } from './useAgpCGM';

import { components as vizComponents, utils as vizUtils } from '@tidepool/viz';
import { NoPatientData, InsufficientData } from './Overview';
import { map, includes } from 'lodash';
const { Loader } = vizComponents;
const { getLocalizedCeiling } = vizUtils.datetime;

// tideline dependencies & plugins
import tidelineBlip from 'tideline/plugins/blip';
import { noop } from 'lodash';
import { MS_IN_DAY } from '../../../core/constants';
import { get } from 'lodash';
import { chunk } from 'lodash';
const chartDailyFactory = tidelineBlip.oneday;

const CHART_HEIGHT = 300;

const StackedDaily = ({ patientId, agpCGMData }) => {
  const { status } = agpCGMData;
  const chartRefs = useRef([]);

  const clinic = useSelector(state => state.blip.clinics[state.blip.selectedClinicId]);
  const patient = clinic?.patients?.[patientId];

  const fillDataChunks = chunk(
    get(agpCGMData, 'agpCGM.data.current.data.fill', []),
    8 // number of 3hr intervals in a day
  ).reverse();

  const dataByDate = agpCGMData?.agpCGM?.data?.current?.aggregationsByDate?.dataByDate;

  if (status === STATUS.NO_PATIENT_DATA)   return <NoPatientData patientName={patient?.fullName}/>;
  if (status === STATUS.INSUFFICIENT_DATA) return <InsufficientData />;
  if (!includes([STATUS.DATA_PROCESSED, STATUS.SVGS_GENERATED], status)) return <Loader show={true} overlay={false} />;

  const charts = map(dataByDate, (data, date) => {
    const timePrefs = agpCGMData?.agpCGM?.timePrefs;
    const chartStart = getLocalizedCeiling(date, timePrefs).valueOf();
    const chartEnd = chartStart + MS_IN_DAY;

    const chartOpts = {
      bgClasses: agpCGMData?.agpCGM.query.bgPrefs?.bgClasses,
      bgUnits: agpCGMData?.agpCGM.query.bgPrefs?.bgUnits,
      timePrefs: agpCGMData?.agpCGM?.timePrefs,
      onSMBGHover: noop,
      onSMBGOut: noop,
      onCBGHover: noop,
      onCBGOut: noop,
      endpoints: [chartStart, chartEnd],
      scrollNav: false,
      showPools: {
        events: false,
        bg: true,
        bolus: false,
        basal: false,
      },
    };

    return [chartOpts, [...data.cbg]];
  });

  const addToRefs = (element) => {
    if (element && !chartRefs.current.includes(element)) {
      element.style.height = `${CHART_HEIGHT}px`;
      element.offsetHeigth = `${CHART_HEIGHT}px`;
      chartRefs.current.push(element);

      const [chartOpts, data] = charts[chartRefs.current.length - 1];
      const fillData = fillDataChunks[chartRefs.current.length - 1] || [];
      const processedData = [...data, ...fillData];

      chartDailyFactory(element, chartOpts)
        .setupPools()
        .load(processedData, true)
        .locate();
    }
  };

  return (
    <Box>
      {map(charts, ([date]) => <Box key={date} ref={addToRefs} />)}
    </Box>
  );
};

export default StackedDaily;
