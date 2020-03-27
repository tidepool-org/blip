import React from 'react';
import { default as Base, PopoverProps } from '@material-ui/core/Popover';
import styled from 'styled-components';
import { Box } from 'rebass/styled-components';

import { borders, radii, shadows, space } from '../../themes/baseTheme';

const StyledPopover = styled(Base)`
  .MuiPopover-paper {
    padding: ${space[3]}px;
    margin-top: ${space[2]}px;
    margin-bottom: ${space[2]}px;
    border: ${borders.modal};
    box-shadow: ${shadows.large};
    border-radius: ${radii.default}px;
  }
`;

const PopoverContentWrapper = React.forwardRef((props, ref) => (
  <Box width={['100%', '50%', '33.3%', '25%']} {...props} ref={ref} />
));

const Popover = props => <StyledPopover {...props} />;

Popover.propTypes = PopoverProps;

Popover.defaultProps = {
  PaperProps: {
    component: PopoverContentWrapper,
  },
  anchorOrigin: {
    vertical: 'bottom',
    horizontal: 'left',
  },
  transformOrigin: {
    vertical: 'top',
    horizontal: 'left',
  },
};

export default Popover;
