import React from 'react';
import { default as Base, PopoverProps } from '@material-ui/core/Popover';
import styled from 'styled-components';

const StyledPopover = styled(Base)``;

const Popover = props => <StyledPopover {...props} />;

Popover.propTypes = PopoverProps;

Popover.defaultProps = {
  disableScrollLock: true,
};

export default Popover;
