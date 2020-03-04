import React from 'react';
import PropTypes from 'prop-types';
import CloseRoundedIcon from '@material-ui/icons/CloseRounded';
import MuiDialog, { DialogProps } from '@material-ui/core/Dialog';
import MuiDialogContent, { DialogContentProps } from '@material-ui/core/DialogContent';
import MuiDialogActions, { DialogActionsProps } from '@material-ui/core/DialogActions';
import styled from 'styled-components';
import { Flex } from 'rebass/styled-components';

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
      {closeIcon && <IconButton label="close dialog" onClick={onClose} icon={CloseRoundedIcon} />}
    </StyledDialogTitle>
  );
};

DialogTitle.propTypes = {
  closeIcon: PropTypes.bool,
};

DialogTitle.defaultProps = {
  closeIcon: true,
};

const StyledDialogContent = styled(MuiDialogContent)``;

export const DialogContent = props => <StyledDialogContent {...props} />;

DialogContent.propTypes = {
  ...DialogContentProps,
};

DialogContent.defaultProps = {
  dividers: true,
};

const StyledDialogActions = styled(MuiDialogActions)``;

export const DialogActions = props => <StyledDialogActions {...props} />;

DialogActions.propTypes = {
  ...DialogActionsProps,
};

DialogActions.defaultProps = {
  disableSpacing: true,
};

const StyledDialog = styled(MuiDialog)``;

export const Dialog = props => <StyledDialog {...props} />;

Dialog.propTypes = {
  ...DialogProps,
  id: PropTypes.string.isRequired,
};
