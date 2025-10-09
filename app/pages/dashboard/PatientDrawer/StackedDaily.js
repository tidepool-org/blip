import React, { useRef, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { push } from 'connected-react-router';
import { useTranslation } from 'react-i18next';
import { Flex, Box } from 'theme-ui';
import sundial from 'sundial';
import VerticalAlignTopRoundedIcon from '@material-ui/icons/VerticalAlignTopRounded';
import { map, includes, get, chunk, mean } from 'lodash';

import { components as vizComponents, utils as vizUtils } from '@tidepool/viz';
const { Loader, SMBGTooltip, CBGTooltip } = vizComponents;
const { getLocalizedCeiling } = vizUtils.datetime;

import tidelineBlip from 'tideline/plugins/blip';
const chartDailyFactory = tidelineBlip.oneday;

import { MS_IN_DAY } from '../../../core/constants';
import { NoPatientData, InsufficientData } from './Overview';
import { STATUS } from './useAgpCGM';
import { Body1, Body2 } from '../../../components/elements/FontStyles';
import Button from '../../../components/elements/Button';
import { STACKED_DAILY_TAB_INDEX } from './MenuBar';
import BgLegend from '../../../components/chart/BgLegend';

const CHART_HEIGHT = 200;

const StackedDaily = ({ patientId, agpCGMData }) => {
  const { t } = useTranslation();
  const { status } = agpCGMData;
  const chartRefs = useRef([]);
  const containerRef = useRef(null);
  const [hoveredSMBG, setHoveredSMBG] = React.useState(false);
  const [hoveredCBG, setHoveredCBG] = React.useState(false);
  const clinic = useSelector(state => state.blip.clinics[state.blip.selectedClinicId]);
  const patient = clinic?.patients?.[patientId];
  const dispatch = useDispatch();

  const dataByDate = agpCGMData?.agpCGM?.data?.current?.aggregationsByDate?.dataByDate;
  const bgPrefs = agpCGMData?.agpCGM?.query?.bgPrefs;
  const bgClasses = bgPrefs?.bgClasses;
  const bgUnits = bgPrefs?.bgUnits;
  const timePrefs = agpCGMData?.agpCGM?.timePrefs;

  const fillDataChunks = chunk(
    get(agpCGMData, 'agpCGM.data.current.data.fill', []),
    8 // number of 3hr intervals in a day
  ).reverse();

  const [visibleDays, setVisibleDays] = React.useState(7);
  const dates = Object.keys(dataByDate || {});
  const hasMoreDays = visibleDays < dates.length;

  const visibleDaysText = visibleDays < dates.length
    ? t('Showing {{count}} of {{total}} days', { count: visibleDays, total: dates.length })
    : t('Showing all {{total}} days', { total: dates.length });

  const handleViewMore = () => {
    setVisibleDays(prev => prev + 7);
  };

  const allCharts = useMemo(() => map(dataByDate, (data, date) => {
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
      dayLabel: false,
      minHeight: CHART_HEIGHT,
      pool: {
        events: {
          hidden: true,
        },
        bg: {
          hidden: false,
          label: false,
          legend: false,
          heightRatio: 10,
          gutterWeight: 0,
        },
        bolus: {
          hidden: true,
        },
        basal: {
          hidden: true,
        },
      },
    };

    const chartData = [...(data.cbg || []), ...(data.smbg || [])]
    return [date, chartOpts, chartData];
  }), [dataByDate, agpCGMData, bgClasses, bgUnits]);

  // Limit charts to visibleDays count
  const charts = useMemo(() => allCharts.slice(0, visibleDays), [allCharts, visibleDays]);

  if (status === STATUS.NO_PATIENT_DATA)   return <NoPatientData patientName={patient?.fullName}/>;
  if (status === STATUS.INSUFFICIENT_DATA) return <InsufficientData />;
  if (!includes([STATUS.DATA_PROCESSED, STATUS.SVGS_GENERATED], status)) return <Loader show={true} overlay={false} />;

  function addToRefs(element) {
    if (element && !chartRefs.current.includes(element)) {
      const chartIndex = chartRefs.current.length;

      element.style.height = `${CHART_HEIGHT}px`;
      element.id = `tideline-daily-${chartIndex}`;
      chartRefs.current.push(element);

      const [_, chartOpts, chartData] = charts[chartIndex];
      const fillData = fillDataChunks[chartIndex] || [];
      const processedData = [...chartData, ...fillData];

      chartDailyFactory(element, chartOpts)
        .setupPools()
        .load(processedData, true)
        .locate();
    }
  }

  function handleSMBGHover(smbg) {
    const rect = smbg.rect;
    const containerRect = containerRef.current?.getBoundingClientRect();
    const containerXOffset = containerRect?.x || 0;

    // range here is -12 to 12
    const datetimeLocation = mean(smbg.chartEndpoints);
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

    // range here is -12 to 12
    const datetimeLocation = mean(cbg.chartEndpoints);
    var hoursOffset = sundial.dateDifference(cbg.data.normalTime, datetimeLocation, 'h');
    cbg.top = rect.top + (rect.height / 2)

    if(hoursOffset > 5) {
      cbg.side = 'left';
      cbg.left = rect.left;
    } else {
      cbg.side = 'right';
      cbg.left = rect.left + rect.width;
    }

    setHoveredCBG({ ...cbg, left: cbg.left - containerXOffset });
  }

  function handleCBGOut() {
    setHoveredCBG(false);
  }

  function handleSwitchToDaily(endpoints) {
    dispatch(push(`/patients/${patientId}/data/daily?dashboard=tide&drawerTab=${STACKED_DAILY_TAB_INDEX}&datetime=${mean(endpoints)}`));
  }

  function scrollToTop() {
    if (containerRef?.current) {
      containerRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

  return (
    <Box
      className='patient-data'
      pt={3}
      sx={{ position: 'relative' }}
      ref={containerRef}
      data-testid="stacked-daily-container"
    >
      <Flex mb={3} sx={{ justifyContent: 'space-between', alignItems: 'center'}}>
        <Body2 sx={{ fontWeight: 'bold', color: 'purple90' }} data-testid="glucose-units-label">{t('Glucose ({{bgUnits}})', { bgUnits })}</Body2>

        <Box data-testid="bg-legend">
          <BgLegend />
        </Box>
      </Flex>

      {map(charts, ([date, chartOpts]) => (
        <Box mb={4} key={date} className='chart-wrapper'>
          <Body1
            py={1}
            sx={{ fontWeight: 'bold', '&:hover': { display: 'inline-block', textDecoration: 'underline', cursor: 'pointer' } }}
            onClick={() => handleSwitchToDaily(chartOpts.endpoints)}
            data-testid="chart-date-header"
          >
            {date}
          </Body1>

          <Box className='chart-container' ref={addToRefs} data-testid="chart-container" />
        </Box>
      ))}

      <Flex sx={{ justifyContent: 'space-between', alignItems: 'center', gap: 2 }}>
        <Box sx={{ flex: '1 1 0' }}>
          <Body1 sx={{ fontWeight: 'medium', color: 'gray50'}} data-testid="day-count-text">{visibleDaysText}</Body1>
        </Box>

        <Flex sx={{ justifyContent: 'center', alignItems: 'center', gap: 1 }}>
          {hasMoreDays && (
            <Button
            sx={{ fontSize: 1, fontWeight: 'medium' }}
            variant="secondary"
            onClick={handleViewMore}
            data-testid="view-more-button"
            >
              {t('View More')}
            </Button>
          )}

          <Button
            sx={{ fontSize: 1, fontWeight: 'medium' }}
            variant="textSecondary"
            onClick={scrollToTop}
            icon={VerticalAlignTopRoundedIcon}
            iconPosition="right"
            data-testid="back-to-top-button"
          >
            {t('Back to Top')}
          </Button>
        </Flex>

        <Box sx={{ flex: '1 1 0' }}>&nbsp;</Box>
      </Flex>

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
