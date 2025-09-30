import React, { useEffect, useState, useMemo } from 'react';
import PropTypes from 'prop-types';
import { useTranslation } from 'react-i18next';
import Button from '../../../../components/elements/Button';
import { MS_IN_HOUR } from '../../../../core/constants';
import { Box, Flex } from 'theme-ui';
import { utils as vizUtils } from '@tidepool/viz';
const { agpCGMText } = vizUtils.text;

const STATE = {
  DEFAULT: 'DEFAULT',
  CLICKED: 'CLICKED',
};

const MINIMUM_HOURS_OF_DATA = 24;

const CGMClipboardButton = ({ patient, data, variant }) => {
  const { t } = useTranslation();
  const [buttonState, setButtonState] = useState(STATE.DEFAULT);
  const clipboardText = useMemo(() => agpCGMText(patient, data), [patient, data]);

  useEffect(() => {
    let buttonTextEffect = setTimeout(() => {
      setButtonState(STATE.DEFAULT);
    }, 1000);

    return () => {
      clearTimeout(buttonTextEffect);
    };
  }, [buttonState]);

  const { count, sampleInterval } = data?.data?.current?.stats?.sensorUsage || {};
  const hoursOfCGMData = (count * sampleInterval) / MS_IN_HOUR;
  const isDataInsufficient = !hoursOfCGMData || hoursOfCGMData < MINIMUM_HOURS_OF_DATA;

  const handleCopy = () => {
    navigator?.clipboard?.writeText(clipboardText);
    setButtonState(STATE.CLICKED);
  };

  return (
    <Button disabled={isDataInsufficient} onClick={handleCopy} variant={variant} sx={{ position: 'relative', alignItems: 'center' }}>
      <Box sx={{ visibility: buttonState === STATE.DEFAULT ? 'visible' : 'hidden' }}>{t('Copy as Text')}</Box>

      <Flex sx={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0, alignSelf: 'center', justifySelf: 'center' }}>
        <Flex sx={{ visibility: buttonState === STATE.CLICKED ? 'visible' : 'hidden' }}>{t('Copied ✓')}</Flex>
      </Flex>
    </Button>
  );
};

CGMClipboardButton.propTypes = {
  variant: PropTypes.oneOf(['secondary', 'tab']),
};

CGMClipboardButton.defaultProps = {
  variant: 'secondary',
};

export default CGMClipboardButton;
