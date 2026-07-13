import React from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import { Box, Flex } from 'theme-ui';

import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from './elements/Dialog';
import { MediumTitle, Body1 } from './elements/FontStyles';
import UploaderButton from './uploaderbutton';
import logoSrc from './uploaderbutton/images/T-logo-dark-512x512.png';

export const UploadLaunchDialog = (props) => {
  const { open, onClose } = props;
  const { t } = useTranslation();

  return (
    <Dialog id="uploadLaunchDialog" aria-labelledby="dialog-title" open={open} onClose={onClose}>
      <DialogTitle onClose={onClose}>
        <MediumTitle id="dialog-title">{t('Launching Uploader')}</MediumTitle>
      </DialogTitle>
      <DialogContent minWidth={320}>
        <Flex sx={{ alignItems: 'center', gap: 3 }}>
          <Box sx={{ flexShrink: 0 }}>
            <img src={logoSrc} width={60} height={60} alt={t('Tidepool logo')} />
          </Box>
          <Body1 sx={{ flex: 1, textAlign: 'left' }}>
            {t('If you don\'t yet have the Tidepool Uploader, please install the appropriate version below')}
          </Body1>
        </Flex>
      </DialogContent>
      <DialogActions>
        <UploaderButton buttonText={t('Get the Tidepool Uploader')} />
      </DialogActions>
    </Dialog>
  );
};

UploadLaunchDialog.propTypes = {
  open: PropTypes.bool,
  onClose: PropTypes.func.isRequired,
};

export default UploadLaunchDialog;
