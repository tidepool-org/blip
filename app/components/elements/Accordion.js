import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import get from 'lodash/get';
import { Box, BoxProps } from 'rebass/styled-components';
import { default as ExpansionPanel, ExpansionPanelProps } from '@material-ui/core/ExpansionPanel';
import { default as ExpansionPanelSummary, ExpansionPanelSummaryProps } from '@material-ui/core/ExpansionPanelSummary';
import { default as ExpansionPanelDetails, ExpansionPanelDetailsProps } from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreRoundedIcon from '@material-ui/icons/ExpandMoreRounded';

import {
  borders,
  colors,
  fonts,
  fontSizes,
  fontWeights,
} from '../../themes/baseTheme';

const StyledAccordion = styled(ExpansionPanel)`
  font-family: ${fonts.default};
  font-size: ${fontSizes[1]}px;
  color: ${colors.text.primary};
  box-shadow: none;
  border-bottom: ${borders.divider};
  &:before {
    background-color: transparent;
  }

  &.Mui-expanded {
    margin: 0;
  }
`;

const StyledAccordionHeader = styled(ExpansionPanelSummary)`
  font-family: inherit;
  flex-direction: row-reverse;
  color: ${props => get(colors, props.color, 'inherit')};

  .MuiIconButton-edgeEnd {
    margin-right: 0px;
    margin-left: -12px;
  }

  &:hover {
    background-color: ${colors.lightestGrey};
  }
`;

const StyledAccordionContent = styled(ExpansionPanelDetails)`
  padding: 0;
  color: ${colors.text.primarySubdued};
`;

export const Accordion = (props) => {
  const {
    header,
    children,
    themeProps,
    icon,
    label,
    square,
    ...accordionProps
  } = props;

  return (
    <Box
      square={square}
      as={StyledAccordion}
      {...themeProps.wrapper}
      {...accordionProps}
    >
      <Box
        as={StyledAccordionHeader}
        expandIcon={icon}
        aria-controls={`${label}-content`}
        id={`${label}-header`}
        fontWeight={fontWeights.medium}
        IconButtonProps={{
          disableFocusRipple: true,
          disableRipple: true,
        }}
        {...themeProps.header}
      >
        {header}
      </Box>
      <Box
        as={StyledAccordionContent}
        id={`${label}-content`}
      >
        <Box
          p={3}
          {...themeProps.panel}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

Accordion.propTypes = {
  ...BoxProps,
  ...ExpansionPanelProps,
  header: PropTypes.node.isRequired,
  icon: PropTypes.element,
  label: PropTypes.string.isRequired,
  themeProps: PropTypes.shape({
    wrapper: PropTypes.shape(BoxProps),
    panel: PropTypes.shape({ ...BoxProps, ...ExpansionPanelDetailsProps }),
    header: PropTypes.shape({ ...BoxProps, ...ExpansionPanelSummaryProps }),
  }),
};

Accordion.defaultProps = {
  icon: <ExpandMoreRoundedIcon />,
  themeProps: {},
  square: true,
};

export default Accordion;
