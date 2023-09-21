import React from 'react';
import PropTypes from 'prop-types';
import { Text, Box, Flex } from 'rebass/styled-components';
import { translate } from 'react-i18next';
import isEqual from 'lodash/isEqual';
import map from 'lodash/map';

import utils from '../../core/utils';
import { colors, radii } from '../../themes/baseTheme';

export const DeltaBar = React.memo(props => {
  const { delta, max, threshold, ...themeProps } = props;
  const values = [delta, 0].sort();
  const labelMaxPercentage = 100;

  const labels = map(values, value => (Math.abs(value) <= labelMaxPercentage
    ? utils.formatThresholdPercentage(Math.abs(value / 100), ...threshold)
    : labelMaxPercentage
  ));

  const colorsArray = [colors.bg.veryLow, colors.bg.target];

  return (
    <Box {...themeProps}>
      <Flex
        className="range-summary-bars"
        width="120px"
        justifyContent={['flex-end', 'center']}
        alignItems="center"
      >
        {map(values, (value, i) => (
          <Flex
            key={`delta-value-${i}`}
            py="6px"
            flexBasis="50%"
            flexDirection={i === 0 ? 'row' : 'row-reverse'}
            justifyContent="flex-end"
            alignItems="center"
            sx={{ gap: 1, borderRight: i === 0 ? `1px solid ${colors.grays[1]}` : 'none' }}
          >
            {value !== 0 && (
              <Text
                as={Flex}
                fontSize="inherit"
                fontWeight="inherit"
                color="inherit"
                justifyContent={i === 0 ? 'flex-end' : 'flex-start'}
              >
                {labels[i]}
              </Text>
            )}

            <Box
              className={`range-summary-bars-${i}`}
              key={i}
              flexBasis={`${Math.abs((value / max) * 100)}%`}
              height="18px"
              backgroundColor={colorsArray[i]}
              sx={{
                borderTopLeftRadius: i === 0 ? `${radii.input}px` : 0,
                borderBottomLeftRadius: i === 0 ? `${radii.input}px` : 0,
                borderTopRightRadius: i === 0 ? 0 : `${radii.input}px`,
                borderBottomRightRadius: i === 0 ? 0 : `${radii.input}px`,
              }}
            />
          </Flex>
        ))}
      </Flex>
    </Box>
  );
}, isEqual);

DeltaBar.propTypes = {
  delta: PropTypes.number.isRequired,
  max: PropTypes.number.isRequired,
  threshold: PropTypes.array.isRequired,
};

DeltaBar.defaultProps = {
  threshold: [],
};

export default translate()(DeltaBar);
