import React from 'react';
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
  const { bgUnits, data, targetRange, t } = props;

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
    <Box width="200px">
      <Flex height="20px" width="100%" justifyContent="center" {...bindHover(popupState)}>
        {map(data, (value, key) => (
          <Box key={key} bg={`bg.${key}`} width={`${value * 100}%`} />
        ))}
      </Flex>

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
              <Flex flexDirection="column" alignItems="center">
                <Flex mb={2} textAlign="center" alignItems="flex-end" key={key} color={`bg.${key}`} flexWrap="nowrap">
                  <Text lineHeight={1} fontSize={1}>
                    {/* TODO: better formatting - precision matching viz stats for veryLow */}
                    {format(`.${0}%`)(value).slice(0, -1)}
                  </Text>
                  <Text lineHeight={1} color="inherit" fontSize=".65em">%</Text>
                </Flex>
                <Text lineHeight={1} color="grays.4" fontSize="9px">{bgLabels[key]}</Text>
              </Flex>
            ))}
          </Flex>

          <Text lineHeight={1} color="grays.4" fontSize="8px">{t(`Units in ${bgUnits}`)}</Text>
        </Box>
      </Popover>
    </Box>
  );
};

export default translate()(BgRangeSummary);
