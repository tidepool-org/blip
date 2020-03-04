import React, { useState } from 'react';
import PropTypes from 'prop-types';
import CloseRoundedIcon from '@material-ui/icons/CloseRounded';
import MuiDialog, { DialogProps } from '@material-ui/core/Dialog';
import MuiDialogContent, { DialogContentProps } from '@material-ui/core/DialogContent';
import MuiDialogActions, { DialogActionsProps } from '@material-ui/core/DialogActions';
import styled from 'styled-components';
import { Flex } from 'rebass/styled-components';

import Button from './Button';
import { IconButton } from './IconButton';

import {
  space,
} from '../../themes/baseTheme';

const StyledDialogTitle = styled(Flex)`
  justify-content: space-between;
  padding: ${space[3]}px;
`;

export const DialogTitle = props => {
  const {
    children,
    closeIcon,
    onClose,
    ...dialogTitleProps
  } = props;

  return (
    <StyledDialogTitle {...dialogTitleProps}>
      {children}
      {closeIcon && <IconButton label="clear dates" onClick={onClose} icon={CloseRoundedIcon} />}
    </StyledDialogTitle>
  );
};

DialogTitle.propTypes = {
  closeIcon: PropTypes.bool,
};

DialogTitle.defaultProps = {
  closeIcon: true,
};

const StyledDialogContent = styled(MuiDialogContent)`
`;

export const DialogContent = props => <StyledDialogContent {...props} />;

DialogContent.propTypes = {
  ...DialogContentProps,
};

DialogContent.defaultProps = {
  dividers: true,
};

const StyledDialogActions = styled(MuiDialogActions)`
`;

export const DialogActions = props => <StyledDialogActions {...props} />;

DialogActions.propTypes = {
  ...DialogActionsProps,
};

DialogActions.defaultProps = {
  dividers: true,
};

const StyledDialog = styled(MuiDialog)`
`;

export const Dialog = props => {
  const {
    initialOpen,
    id,
    onClose,
    onSubmit,
    titleElement: Title,
    titleCloseIcon,
    triggerElement: Trigger,
    children,
    ...dialogProps
  } = props;

  const [open, setOpen] = useState(initialOpen);

  const handleClickOpen = () => setOpen(true);

  const handleClose = () => {
    setOpen(false);
    if (onClose) onClose();
  };

  const handleSubmit = () => {
    setOpen(false);
    if (onSubmit) onSubmit();
  };

  const titleId = Title ? `${id}-title` : undefined;

  return (
    <div>
      <Trigger onClick={handleClickOpen} />

      <StyledDialog
        {...dialogProps}
        onClose={handleClose}
        aria-labelledby={titleId}
        open={open}
      >
        {Title ? (
          <StyledDialogTitle disableTypography>
            <Title id={titleId} />
            {titleCloseIcon ? (
              <IconButton label="clear dates" onClick={handleClose} icon={CloseRoundedIcon} />
            ) : null}
          </StyledDialogTitle>
        ) : null}
        <StyledDialogContent dividers>
          {children}
        </StyledDialogContent>
        <StyledDialogActions>
          <Button variant="secondary" onClick={handleClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit}>
            Confirm
          </Button>
        </StyledDialogActions>
      </StyledDialog>
    </div>
  );
};

Dialog.propTypes = {
  ...DialogProps,
  initialOpen: PropTypes.bool,
  id: PropTypes.string.isRequired,
  onClose: PropTypes.func,
  onSubmit: PropTypes.func,
  title: PropTypes.string,
  titleCloseIcon: PropTypes.bool,
  trigger: PropTypes.elementType,
};

Dialog.defaultProps = {
  initialOpen: false,
  titleCloseIcon: true,
};

export default Dialog;
