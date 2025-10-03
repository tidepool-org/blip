import React, { useRef, useMemo } from 'react';
import { useSelector } from 'react-redux';
import { Box } from 'theme-ui';
import { STATUS } from './useAgpCGM';
import sundial from 'sundial';

import { components as vizComponents, utils as vizUtils } from '@tidepool/viz';
import { NoPatientData, InsufficientData } from './Overview';
import { map, includes } from 'lodash';
const { Loader, SMBGTooltip, CBGTooltip } = vizComponents;
const { getLocalizedCeiling } = vizUtils.datetime;

// tideline dependencies & plugins
import tidelineBlip from 'tideline/plugins/blip';
import { MS_IN_DAY } from '../../../core/constants';
import { get, chunk, mean } from 'lodash';
const chartDailyFactory = tidelineBlip.oneday;

const CHART_HEIGHT = 300;

const StackedDaily = ({ patientId, agpCGMData }) => {
  const { status } = agpCGMData;
  const chartRefs = useRef([]);
  const containerRef = useRef(null);
  const [hoveredSMBG, setHoveredSMBG] = React.useState(false);
  const [hoveredCBG, setHoveredCBG] = React.useState(false);

  const clinic = useSelector(state => state.blip.clinics[state.blip.selectedClinicId]);
  const patient = clinic?.patients?.[patientId];

  const fillDataChunks = chunk(
    get(agpCGMData, 'agpCGM.data.current.data.fill', []),
    8 // number of 3hr intervals in a day
  ).reverse();

  const dataByDate = agpCGMData?.agpCGM?.data?.current?.aggregationsByDate?.dataByDate;
  const bgPrefs = agpCGMData?.agpCGM?.query?.bgPrefs;
  const bgClasses = bgPrefs?.bgClasses;
  const bgUnits = bgPrefs?.bgUnits;
  const timePrefs = agpCGMData?.agpCGM?.timePrefs;

  const charts = useMemo(() => map(dataByDate, (data, date) => {
    const timePrefs = agpCGMData?.agpCGM?.timePrefs;
    const chartStart = getLocalizedCeiling(date, timePrefs).valueOf();
    const chartEnd = chartStart + MS_IN_DAY;

    const chartOpts = {
      bgClasses,
      bgUnits,
      timePrefs,
      onSMBGHover: handleSMBGHover,
      onSMBGOut: handleSMBGOut,
      onCBGHover: handleCBGHover,
      onCBGOut: handleCBGOut,
      endpoints: [chartStart, chartEnd],
      scrollNav: false,
      showPools: {
        events: false,
        bg: true,
        bolus: false,
        basal: false,
      },
    };

    return [chartOpts, [...(data.cbg || []), ...(data.smbg || [])]];
  }), [dataByDate, agpCGMData, bgClasses, bgUnits]);

  if (status === STATUS.NO_PATIENT_DATA)   return <NoPatientData patientName={patient?.fullName}/>;
  if (status === STATUS.INSUFFICIENT_DATA) return <InsufficientData />;
  if (!includes([STATUS.DATA_PROCESSED, STATUS.SVGS_GENERATED], status)) return <Loader show={true} overlay={false} />;

  function addToRefs(element) {
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
  }

  function handleSMBGHover(smbg) {
    const rect = smbg.rect;
    const datetimeLocation = mean(smbg.chartEndpoints);
    const containerRect = containerRef.current?.getBoundingClientRect();
    const containerXOffset = containerRect?.x || 0;
    // range here is -12 to 12
    const hoursOffset = sundial.dateDifference(smbg.data.normalTime, datetimeLocation, 'h');
    smbg.top = rect.top + (rect.height / 2)
    if(hoursOffset > 5) {
      smbg.side = 'left';
      smbg.left = rect.left;
    } else {
      smbg.side = 'right';
      smbg.left = rect.left + rect.width;
    }
    setHoveredSMBG({ ...smbg, left: smbg.left - containerXOffset });
  }

  function handleSMBGOut() {
    setHoveredSMBG(false);
  }

  function handleCBGHover(cbg) {
    var rect = cbg.rect;
    const containerRect = containerRef.current?.getBoundingClientRect();
    const containerXOffset = containerRect?.x || 0;
    const datetimeLocation = mean(cbg.chartEndpoints);
    // range here is -12 to 12
    var hoursOffset = sundial.dateDifference(cbg.data.normalTime, datetimeLocation, 'h');
    console.log('cbg.data.normalTime, datetimeLocation, hoursOffset', cbg.data.normalTime, datetimeLocation, hoursOffset);
    cbg.top = rect.top + (rect.height / 2)
    if(hoursOffset > 5) {
      console.log('cbg left');
      cbg.side = 'left';
      cbg.left = rect.left;
    } else {
      console.log('cbg right');
      cbg.side = 'right';
      cbg.left = rect.left + rect.width;
    }

    setHoveredCBG({ ...cbg, left: cbg.left - containerXOffset });
  }

  function handleCBGOut() {
    setHoveredCBG(false);
  }

  return (
    <Box className='patient-data' sx={{ position: 'relative' }} ref={containerRef}>
      {map(charts, (chart, key) => <Box key={key} ref={addToRefs} />)}

      {hoveredSMBG && <SMBGTooltip
        position={{
          top: hoveredSMBG.top,
          left: hoveredSMBG.left
        }}
        side={hoveredSMBG.side}
        smbg={hoveredSMBG.data}
        timePrefs={timePrefs}
        bgPrefs={bgPrefs}
      />}
      {hoveredCBG && <CBGTooltip
        position={{
          top: hoveredCBG.top,
          left: hoveredCBG.left
        }}
        side={hoveredCBG.side}
        cbg={hoveredCBG.data}
        timePrefs={timePrefs}
        bgPrefs={bgPrefs}
      />}
    </Box>
  );
};

export default StackedDaily;
