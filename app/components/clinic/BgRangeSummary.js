import React from 'react';
import PropTypes from 'prop-types';
import { Text, Box, Flex } from 'rebass/styled-components';
import map from 'lodash/map';
import { format } from 'd3-format';
import { translate } from 'react-i18next';

import {
  usePopupState,
  bindHover,
  bindPopover,
} from 'material-ui-popup-state/hooks';

import Popover from '../elements/Popover';
import { space, shadows } from '../../themes/baseTheme';

import { utils as vizUtils } from '@tidepool/viz';
const { reshapeBgClassesToBgBounds, generateBgRangeLabels } = vizUtils.bg;

export const BgRangeSummary = props => {
  const { bgUnits, data, striped, targetRange, t } = props;

  const popupState = usePopupState({
    variant: 'popover',
    popupId: 'summaryPopover',
  });

  const bgPrefs = {
    bgUnits,
    bgBounds: reshapeBgClassesToBgBounds({ bgUnits, bgClasses: {
      low: { boundary: targetRange[0]},
      target: { boundary: targetRange[1]},
    }}),
  };

  const bgLabels = generateBgRangeLabels(bgPrefs, { condensed: true });

  return (
    <>
      <Box sx={{ position: 'relative' }}>
        <Flex width="200px" height="20px" justifyContent="center" {...bindHover(popupState)}>
          {map(data, (value, key) => (
              <Box key={key} bg={`bg.${key}`} width={`${value * 100}%`}/>
          ))}
        </Flex>

        {striped && (
          <Box
            width="200px"
            height="20px"
            sx={{
              position: 'absolute',
              pointerEvents: 'none',
              top: 0,
              background: 'transparent repeating-linear-gradient(125deg,transparent,transparent 3px,rgba(255,255,255,0.75) 3px,rgba(255,255,255,0.75) 5px)',
            }}
          />
        )}
      </Box>

      <Popover
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'center',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'center',
        }}
        width="auto"
        height="auto"
        marginTop={`${space[1]}px`}
        boxShadow={shadows.small}
        {...bindPopover(popupState)}
        useHoverPopover
      >
        <Box px={2} py={1}>
          <Flex mb={1} sx={{ gap: 3 }} justifyContent="space-between" flexWrap="nowrap">
            {map(data, (value, key) => (
              <Flex key={key} flexDirection="column" alignItems="center">
                <Flex mb={2} textAlign="center" alignItems="flex-end" key={key} color={`bg.${key}`} flexWrap="nowrap">
                  <Text fontWeight="bold" lineHeight={1} fontSize={1}>
                    {/* TODO: better formatting - precision matching viz stats for veryLow */}
                    {format(`.${0}%`)(value).slice(0, -1)}
                  </Text>
                  <Text lineHeight={1} color="inherit" fontSize=".65em">%</Text>
                </Flex>
                <Text fontWeight="medium" lineHeight={1} color="grays.4" fontSize="9px">{bgLabels[key]}</Text>
              </Flex>
            ))}
          </Flex>

          <Text lineHeight={1} color="grays.4" fontSize="8px">{t(`Units in ${bgUnits}`)}</Text>
        </Box>
      </Popover>
    </>
  );
};

BgRangeSummary.propTypes = {
  bgUnits: PropTypes.string.isRequired,
  data: PropTypes.shape({
    veryLow: PropTypes.number,
    low: PropTypes.number,
    target: PropTypes.number,
    high: PropTypes.number,
    veryHigh: PropTypes.number,
  }).isRequired,
  striped: PropTypes.bool,
  targetRange: PropTypes.arrayOf(PropTypes.number).isRequired,
}

export default translate()(BgRangeSummary);
