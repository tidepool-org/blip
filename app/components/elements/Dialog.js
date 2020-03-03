import React, { useState } from 'react';
import PropTypes from 'prop-types';
import CloseRoundedIcon from '@material-ui/icons/CloseRounded';
import MuiDialog from '@material-ui/core/Dialog';
import MuiDialogTitle from '@material-ui/core/DialogTitle';
import MuiDialogContent from '@material-ui/core/DialogContent';
import MuiDialogActions from '@material-ui/core/DialogActions';
import styled from 'styled-components';
import noop from 'lodash/noop';
import { Flex } from 'rebass/styled-components';

import Button from './Button';
import { IconButton } from './InputStyles';
import { Title, Body1 } from './FontStyles';

import {
  colors,
  fontSizes,
  radii,
  shadows,
  space,
} from '../../themes/baseTheme';

const StyledDialog = styled(MuiDialog)`
`;

const DialogTitle = styled(Flex)`
  justify-content: space-between;
  padding: ${space[3]}px;
`;

const DialogContent = styled(MuiDialogContent)`
`;

const DialogActions = styled(MuiDialogActions)`
`;

export const Dialog = props => {
  const [open, setOpen] = useState(props.initialOpen);

  const handleClose = () => props.onClose && setOpen(false);
  const handleSubmit = () => props.onSubmit && setOpen(false);

  return (
    <div>
      <StyledDialog onClose={handleClose} aria-labelledby={`${props.id}-title`} open={open}>
        <DialogTitle>
          <Title id={`${props.id}-title`}>
            {props.title}
          </Title>
          {props.titleCloseIcon ? (
            <IconButton aria-label="close" onClick={handleClose}>
              <CloseRoundedIcon />
            </IconButton>
          ) : null}
        </DialogTitle>
        <DialogContent dividers>
          <Body1>
            Cras mattis consectetur purus sit amet fermentum. Cras justo odio, dapibus ac facilisis
            in, egestas eget quam. Morbi leo risus, porta ac consectetur ac, vestibulum at eros.
          </Body1>
          <Body1>
            Praesent commodo cursus magna, vel scelerisque nisl consectetur et. Vivamus sagittis
            lacus vel augue laoreet rutrum faucibus dolor auctor.
          </Body1>
          <Body1>
            Aenean lacinia bibendum nulla sed consectetur. Praesent commodo cursus magna, vel
            scelerisque nisl consectetur et. Donec sed odio dui. Donec ullamcorper nulla non metus
            auctor fringilla.
          </Body1>
        </DialogContent>
        <DialogActions>
          <Button autoFocus onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button autoFocus onClick={handleSubmit} color="primary">
            Confirm
          </Button>
        </DialogActions>
      </StyledDialog>
    </div>
  );
};

Dialog.propTypes = {
  initialOpen: PropTypes.bool,
  onClose: PropTypes.func,
  id: PropTypes.string.isRequired,
};

Dialog.defaultProps = {
  initialOpen: true,
  onClose: noop,
  titleCloseIcon: true,
  title: ' ',
};

export default Dialog;
