import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import ArrowForwardRoundedIcon from '@material-ui/icons/ArrowForwardRounded';
import CheckRoundedIcon from '@material-ui/icons/CheckRounded';
import ReportProblemRoundedIcon from '@material-ui/icons/ReportProblemRounded';
import { Box, Flex, Text } from 'theme-ui';

import Button from '../elements/Button';
import Checkbox from '../elements/Checkbox';
import Icon from '../elements/Icon';
import { Body1, MediumTitle } from '../elements/FontStyles';
import { Dialog, DialogTitle, DialogContent, DialogActions, DIALOG_FULL_SCREEN_QUERY as mobile } from '../elements/Dialog';

// Shown on phones; above the breakpoint the arrow carries the direction and the labels stay for screen readers.
const summaryLabelStyles = {
  display: 'block',
  fontSize: 0,
  fontWeight: 'medium',
  position: 'absolute',
  width: '1px',
  height: '1px',
  overflow: 'hidden',
  clip: 'rect(0 0 0 0)',
  whiteSpace: 'nowrap',
  [mobile]: { position: 'static', width: 'auto', height: 'auto', overflow: 'visible', clip: 'auto', whiteSpace: 'normal' },
};

const summaryNameStyles = { color: 'white', fontWeight: 'bold', overflowWrap: 'break-word' };

const MergeWorkspacesConfirmDialog = ({
  open,
  onClose,
  onConfirm,
  processing = false,
  sourceName,
  targetName,
  sourcePatientTag,
  sourcePatientSite,
}) => {
  const { t } = useTranslation();
  const [confirmed, setConfirmed] = useState(false);

  // The merge can't be recalled once sent, so the dialog stays up until it settles.
  const handleClose = () => !processing && onClose();

  let labelsText = null;
  if (sourcePatientTag && sourcePatientSite) {
    labelsText = t('Moved patients get the tag {{tag}} and the site {{site}}.', { tag: sourcePatientTag, site: sourcePatientSite });
  } else if (sourcePatientTag) {
    labelsText = t('Moved patients get the tag {{tag}}.', { tag: sourcePatientTag });
  } else if (sourcePatientSite) {
    labelsText = t('Moved patients get the site {{site}}.', { site: sourcePatientSite });
  }

  const checklist = [
    { text: t('Every patient in {{source}} moves into {{target}}.', { source: sourceName, target: targetName }) },
    labelsText && { text: labelsText },
    { text: t('{{source}} is permanently deleted. This can\'t be undone.', { source: sourceName }), danger: true },
  ].filter(Boolean);

  return (
    <Dialog
      id="mergeWorkspacesConfirmDialog"
      aria-labelledby="mergeWorkspacesConfirmDialog-title"
      open={open}
      onClose={handleClose}
      TransitionProps={{ onExited: () => setConfirmed(false) }}
    >
      <DialogTitle onClose={handleClose}>
        <Flex sx={{ alignItems: 'center', gap: 2 }}>
          <Icon
            aria-hidden="true"
            tabIndex={-1}
            variant="static"
            icon={ReportProblemRoundedIcon}
            label={t('Warning')}
            sx={{ color: 'feedback.danger', fontSize: '1.5em' }}
          />
          <MediumTitle id="mergeWorkspacesConfirmDialog-title">{t('Confirm Merge')}</MediumTitle>
        </Flex>
      </DialogTitle>
      <DialogContent sx={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Flex
          sx={{
            bg: 'blueGreyDark',
            color: 'white',
            borderRadius: 'default',
            px: 3,
            py: '12px',
            gap: 3,
            alignItems: 'center',
            [mobile]: { flexDirection: 'column', alignItems: 'stretch', gap: 2 },
          }}
        >
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Text sx={summaryLabelStyles}>{t('Merge from')}</Text>
            <Body1 sx={summaryNameStyles}>{sourceName}</Body1>
          </Box>
          <Icon
            aria-hidden="true"
            tabIndex={-1}
            variant="static"
            icon={ArrowForwardRoundedIcon}
            label={t('Merges into')}
            sx={{ flexShrink: 0, fontSize: 2, [mobile]: { alignSelf: 'flex-start', transform: 'rotate(90deg)' } }}
          />
          <Box sx={{ flex: 1, minWidth: 0, textAlign: 'right', [mobile]: { textAlign: 'left' } }}>
            <Text sx={summaryLabelStyles}>{t('Merge into')}</Text>
            <Body1 sx={summaryNameStyles}>{targetName}</Body1>
          </Box>
        </Flex>

        <Box as="ul" sx={{ m: 0, p: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {checklist.map(({ text, danger }) => (
            <Flex as="li" key={text} sx={{ alignItems: 'flex-start', gap: 2 }}>
              <Icon
                aria-hidden="true"
                tabIndex={-1}
                variant="static"
                icon={danger ? ReportProblemRoundedIcon : CheckRoundedIcon}
                label={danger ? t('Warning') : t('Checkmark')}
                sx={{ flexShrink: 0, mt: '2px', fontSize: 2, color: danger ? 'feedback.danger' : 'blueGreyMedium' }}
              />
              <Body1 sx={danger ? { fontWeight: 'medium' } : {}}>{text}</Body1>
            </Flex>
          ))}
        </Box>

        <Checkbox
          id="merge-workspaces-confirm-checkbox"
          checked={confirmed}
          onChange={event => setConfirmed(event.target.checked)}
          themeProps={{ sx: { 'span': { lineHeight: 2 }, bg: 'lightestGrey', p: 3, borderRadius: 'default' } }}
          label={t('I confirm that I have the authority to do this merge, I understand this action is not reversible, and I am doing it in cooperation with Tidepool\'s team.')}
        />
      </DialogContent>
      <DialogActions>
        <Button variant="textSecondary" disabled={processing} onClick={onClose}>
          {t('Cancel')}
        </Button>
        <Button
          id="merge-workspaces-confirm"
          variant="danger"
          disabled={!confirmed}
          processing={processing}
          onClick={onConfirm}
        >
          {t('Merge')}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

MergeWorkspacesConfirmDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func.isRequired,
  processing: PropTypes.bool,
  sourceName: PropTypes.string,
  targetName: PropTypes.string,
  sourcePatientTag: PropTypes.string,
  sourcePatientSite: PropTypes.string,
};

export default MergeWorkspacesConfirmDialog;
