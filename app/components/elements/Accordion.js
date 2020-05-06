import React from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Box, BoxProps } from 'rebass/styled-components';
import { default as ExpansionPanel, ExpansionPanelProps } from '@material-ui/core/ExpansionPanel';
import { default as ExpansionPanelSummary, ExpansionPanelSummaryProps } from '@material-ui/core/ExpansionPanelSummary';
import { default as ExpansionPanelDetails, ExpansionPanelDetailsProps } from '@material-ui/core/ExpansionPanelDetails';
import ExpandMoreRoundedIcon from '@material-ui/icons/ExpandMoreRounded';

import { borders, colors, space, fonts, fontSizes, fontWeights } from '../../themes/baseTheme';

const StyledAccordion = styled(ExpansionPanel)`
  font-family: ${fonts.default};
  font-size: ${fontSizes[1]};
  color: ${colors.text.primary};
  box-shadow: none;
  border-bottom: ${borders.divider};
`;

const StyledAccordionHeader = styled(ExpansionPanelSummary)`
  font-family: inherit;
  flex-direction: row-reverse;

  .MuiIconButton-edgeEnd {
    margin-right: 0px;
    margin-left: -12px;
  }

  &:hover {
    background-color: ${colors.lightestGrey};
  }
`;

const StyledAccordionContent = styled(ExpansionPanelDetails)`
  padding: ${space[3]}px;
  color: ${colors.text.primarySubdued}
`;

export const Accordion = (props) => {
  const { header, children, themeProps, icon, label, ...accordionProps } = props;

  return (
    <Box square as={StyledAccordion} {...themeProps.wrapper} {...accordionProps}>
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
        {...themeProps.panel}
      >
        {children}
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
};

export default Accordion;
