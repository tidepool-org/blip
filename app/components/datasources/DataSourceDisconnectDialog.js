import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { Box, Flex, Text } from 'theme-ui';
import InfoRoundedIcon from '@material-ui/icons/InfoRounded';

import Button from '../elements/Button';
import baseTheme from '../../themes/baseTheme';
import { MediumTitle, Paragraph1 } from '../elements/FontStyles';
import Icon from '../elements/Icon';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '../elements/Dialog';

export const DataSourceDisconnectDialog = (props) => {
  const { t, onClose, onConfirm, open, disconnectInstructions = {} } = props;
  const { title, message } = disconnectInstructions;

  return (
    <Dialog
      id="resendDataSourceConnectRequest"
      aria-labelledby="dialog-title"
      open={open}
      onClose={onClose}
    >
      <DialogTitle onClose={onClose}>
        <MediumTitle id="dialog-title">{t('One More Step!')}</MediumTitle>
      </DialogTitle>
      <DialogContent>
        <Flex variant="containers.infoWell">
          <Icon className="icon" theme={baseTheme} variant="static" icon={InfoRoundedIcon} label={'Info Icon'} />

          <Box>
            {title && (
              <Paragraph1>
                <Text className='title' variant="bold">{title}</Text>
              </Paragraph1>
            )}
            {message && (
              <Paragraph1>
                <Text className='message'>{message}</Text>
              </Paragraph1>
            )}
          </Box>
        </Flex>
      </DialogContent>
      <DialogActions>
        <Button
          className="disconnect-data-source-connect-request"
          variant="primary"
          onClick={onConfirm}
        >
          {t('Done')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

DataSourceDisconnectDialog.propTypes = {
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  open: PropTypes.bool,
  disconnectInstructions: PropTypes.shape({
    title: PropTypes.string,
    message: PropTypes.string,
  }),
  t: PropTypes.func.isRequired,
};

export default withTranslation()(DataSourceDisconnectDialog);
