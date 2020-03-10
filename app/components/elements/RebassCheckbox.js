import React from 'react';
import styled from 'styled-components';
import { Checkbox } from 'rebass/styled-components';
import { Box, Label, Text } from 'rebass/styled-components';

import {
  colors,
  fonts,
  fontSizes,
  fontWeights,
  lineHeights,
} from '../../themes/baseTheme';

export const InputLabel = styled.span`
  font-size: ${fontSizes[1]}px;
  line-height: ${lineHeights[4]};
  font-weight: ${fontWeights.medium};
  font-family: ${fonts.default};
  padding: 0 0 0 8px;
  color: ${props => (props.color ? props.color : colors.text.primary)};
`;

const RebassCheckbox = () => (
  <Box>
    <Text>Hello</Text>
    <Label>
      <Checkbox id='remember' name='remember' />
      Remember Me
    </Label>
  </Box>
);

export default RebassCheckbox;
