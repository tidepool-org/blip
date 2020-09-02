import React from 'react';
import PropTypes from 'prop-types';
import { cloneDeep, pull, map, union, get, includes } from 'lodash';
import Accordion from '../elements/Accordion';
import Checkbox from '../elements/Checkbox';
import { Box, Flex } from 'rebass/styled-components';

import { colors, fontSizes } from '../../themes/baseTheme';

export const DeviceSelection = (props) => {
  const { chartPrefs, updateChartPrefs, deviceIds = [] } = props;
  const excludedDevices = get(chartPrefs, 'excludedDevices', []);

  const toggleDevice = (e) => {
    const prefs = cloneDeep(chartPrefs);

    if (e.target.checked) {
      pull(prefs.excludedDevices, e.target.value);
    } else {
      prefs.excludedDevices = union(prefs.excludedDevices, [e.target.value]);
    }

    updateChartPrefs(prefs, true, true);
  };

  return (
    <Accordion
      label={'deviceSelection'}
      header={
        <Flex flexDirection="row" justifyContent="space-between" flexGrow="1">
          <Box>Filter Devices</Box>
          <Box fontSize={3}>{deviceIds.length - excludedDevices.length}</Box>
        </Flex>
      }
      children={map(deviceIds, (deviceId) => (
        <Checkbox
          checked={!includes(excludedDevices, deviceId)}
          onChange={toggleDevice}
          label={deviceId}
          name={`${deviceId}-toggle`}
          value={deviceId}
          key={deviceId}
        />
      ))}
      square={false}
      themeProps={{
        wrapper: {
          sx: {
            '.MuiExpansionPanelSummary-root': {
              minHeight: '34px',
              '&.Mui-expanded': {
                minHeight: '34px',
              },
            },
          },
          style: {
            border: `1px solid ${colors.blueGreyMedium}`,
            borderRadius: '8px',
            fontSize: `${fontSizes[2]}px`,
          },
        },
        header: {
          style: {
            borderRadius: '8px',
            padding: '0px 12px',
          },
          sx: {
            margin: '0.25em 0.625em',
            height: '1.5em',
            padding: '0px',
            '.MuiExpansionPanelSummary-content': {
              margin: '0px',
              '&.Mui-expanded': {
                margin: '0px',
              },
            },
            '.MuiExpansionPanelSummary-expandIcon': {
              // This CSS specificity fight wasn't my favorite
              '&.MuiExpansionPanelSummary-expandIcon': {
                '&.MuiIconButton-edgeEnd': {
                  padding: '0px',
                  margin: '0px 12px 0px 0px',
                },
              },
            },
          },
        },
        panel: {
          style: {
            flexDirection: 'column',
          },
        },
      }}
    />
  );
};

DeviceSelection.propTypes = {
  chartPrefs: PropTypes.shape({
    excludedDevices: PropTypes.array,
  }),
  deviceIds: PropTypes.array,
  updateChartPrefs: PropTypes.func,
};

export default DeviceSelection;
