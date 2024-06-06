import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import { Text, Box, Flex } from 'theme-ui';
import map from 'lodash/map';
import pick from 'lodash/pick';
import isEqual from 'lodash/isEqual';
import { withTranslation } from 'react-i18next';

import {
  usePopupState,
  bindHover,
  bindPopover,
} from 'material-ui-popup-state/hooks';

import Popover from '../elements/Popover';
import { space, shadows, radii } from '../../themes/baseTheme';

import utils from '../../core/utils';
import { DEFAULT_FILTER_THRESHOLDS } from '../../core/constants';
import { utils as vizUtils } from '@tidepool/viz';
const { reshapeBgClassesToBgBounds, generateBgRangeLabels } = vizUtils.bg;

export const BgRangeSummary = React.memo(props => {
  const {
    bgUnits,
    cgmUsePercent,
    data,
    showExtremeHigh,
    striped,
    targetRange,
    t,
    ...themeProps
  } = props;

  const formattedBgUnits = bgUnits.replace(/l$/, 'L');

  const popupState = usePopupState({
    variant: 'popover',
    popupId: 'summaryPopover',
  });

  const popoverProps = useMemo(() => bindPopover(popupState), [popupState]);

  const bgPrefs = {
    bgUnits: formattedBgUnits,
    bgBounds: reshapeBgClassesToBgBounds({ bgUnits: formattedBgUnits, bgClasses: {
      low: { boundary: targetRange[0]},
      target: { boundary: targetRange[1]},
    }}),
  };

  const anchorOrigin = useMemo(() => ({
    vertical: 'bottom',
    horizontal: 'center',
  }), []);

  const transformOrigin = useMemo(() => ({
    vertical: 'top',
    horizontal: 'center',
  }), []);

  const popoverFlexStyle = useMemo(() => ({ gap: 3 }), []);
  const wrapperStyle = useMemo(() => ({ position: 'relative', borderRadius: `${radii.input}px`, overflow: 'hidden' }), []);
  const flexWidth = useMemo(() => (['155px', '175px']),[])

  const bgLabels = generateBgRangeLabels(bgPrefs, { condensed: true });

  // DELETEME: Test data //
  data.extremeHigh = data.veryHigh / 4;
  // DELETEME //

  const renderedData = pick(data, ['veryLow', 'low', 'target', 'high', 'veryHigh']);
  const barData = { ...renderedData };

  if (showExtremeHigh) {
    barData.veryHigh -= data.extremeHigh || 0;
    barData.extremeHigh = data.extremeHigh || 0;
    renderedData.extremeHigh = data.extremeHigh || 0;
  }

  return (
    <>
      <Box sx={wrapperStyle} {...themeProps}>
        <Flex className="range-summary-bars" sx={{ width: flexWidth, height: '18px', justifyContent: 'center' }} {...bindHover(popupState)}>
          {map(barData, (value, key) => (
            <Box className={`range-summary-bars-${key}`} key={key} data-width={`${value * 100}%`} sx={{ bg: `bg.${key}`, width: `${value * 100}%` }}/>
          ))}
        </Flex>

        {striped && (
          <Box
            className="range-summary-stripe-overlay"
            sx={{
              width: '175px',
              height: '18px',
              position: 'absolute',
              pointerEvents: 'none',
              top: 0,
              background: 'transparent repeating-linear-gradient(125deg,transparent,transparent 3px,rgba(255,255,255,0.75) 3px,rgba(255,255,255,0.75) 5px)',
            }}
          />
        )}
      </Box>

      <Popover
        className='range-summary-data'
        anchorOrigin={anchorOrigin}
        transformOrigin={transformOrigin}
        width="auto"
        height="auto"
        mt={`${space[1]}px`}
        boxShadow={shadows.small}
        {...popoverProps}
        useHoverPopover
      >
        <Box px={2} py={1}>
          <Flex mb="12px" sx={{ ...popoverFlexStyle, justifyContent: 'space-between', flexWrap: 'nowrap' }}>
            {map(renderedData, (value, key) => (
              <Flex
                key={key}
                pl={key === 'extremeHigh' ? '12px' : 0}
                ml={key === 'extremeHigh' ? '-4px' : 0}
                sx={{
                  flexDirection: 'column',
                  justifyContent: 'center',
                  alignItems: 'center',
                  borderLeft: key === 'extremeHigh' ? 'divider' : 'none'
                }}
                >
                <Flex className={`range-summary-value-${key}`} mb={1} sx={{ flexWrap: 'nowrap', textAlign: 'center', alignItems: 'flex-end',  color: `bg.${key}` }} key={key}>
                  <Text sx={{ fontWeight: 'bold', lineHeight: 0, fontSize: 1 }}>
                    {utils.formatThresholdPercentage(value, ...DEFAULT_FILTER_THRESHOLDS[key])}
                  </Text>
                  <Text sx={{ color: 'inherit', fontSize: '9px', fontWeight: 'bold' }}>%</Text>
                </Flex>
                <Text className={`range-summary-range-${key}`} sx={{ fontWeight: 'medium', lineHeight: 1, color: 'grays.4', fontSize: '9px' }}>{bgLabels[key]}</Text>
              </Flex>
            ))}
          </Flex>

          <Flex sx={{ alignItems: 'flex-end', justifyContent: 'space-between', flexWrap: 'nowrap' }}>
            <Text className={'range-summary-bg-units'} sx={{ lineHeight: 0, color: 'grays.4', fontSize: '10px' }}>{t('Units in {{bgUnits}}', { bgUnits: formattedBgUnits })}</Text>
            <Flex className={'range-summary-cgm-use'} sx={{ gap: 1, alignItems: 'flex-end', justifyContent: 'flex-start', flexWrap: 'nowrap' }}>
              <Text sx={{ lineHeight: 0, color: 'text.primary', fontSize: '10px', fontWeight: 'medium' }}>{t('% CGM Use: ')}</Text>
              <Text sx={{ lineHeight: '10px', color: 'text.primary', fontSize: '12px', fontWeight: 'bold' }}>{t('{{cgmUsePercent}} %', { cgmUsePercent: utils.formatThresholdPercentage(cgmUsePercent, ...DEFAULT_FILTER_THRESHOLDS.cgmUse) })}</Text>
            </Flex>
          </Flex>
        </Box>
      </Popover>
    </>
  );
}, isEqual);

BgRangeSummary.propTypes = {
  bgUnits: PropTypes.string.isRequired,
  cgmUsePercent: PropTypes.number.isRequired,
  data: PropTypes.shape({
    veryLow: PropTypes.number,
    low: PropTypes.number,
    target: PropTypes.number,
    high: PropTypes.number,
    veryHigh: PropTypes.number,
  }).isRequired,
  showExtremeHigh: PropTypes.bool,
  striped: PropTypes.bool,
  targetRange: PropTypes.arrayOf(PropTypes.number).isRequired,
}

export default withTranslation()(BgRangeSummary);
