import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../../../../components/elements/Button';
import { MS_IN_HOUR } from '../../../../core/constants';
import { Box } from 'theme-ui';
import { utils as vizUtils } from '@tidepool/viz';
const { agpCGMText } = vizUtils.text;

const STATE = {
  DEFAULT: 'DEFAULT',
  CLICKED: 'CLICKED',
};

const CGMClipboardButton = ({ patient, pdf }) => {
  const { t } = useTranslation();
  const [buttonState, setButtonState] = useState(STATE.DEFAULT);
  const clipboardText = useMemo(() => agpCGMText(patient, pdf), [patient, pdf]);

  useEffect(() => {
    let buttonTextEffect = setTimeout(() => {
      setButtonState(STATE.DEFAULT);
    }, 1000);

    return () => {
      clearTimeout(buttonTextEffect);
    };
  }, [buttonState]);

  const { count, sampleFrequency } = pdf?.data?.agpCGM?.data?.current?.stats?.sensorUsage || {};

  const hoursOfCGMData = count * sampleFrequency;

  const isDataInsufficient = !hoursOfCGMData || ((hoursOfCGMData / MS_IN_HOUR) < 24); // minimum 24 hours

  const handleCopy = () => {
    navigator?.clipboard?.writeText(clipboardText);
    setButtonState(STATE.CLICKED);
  };

  return (
    <Button disabled={isDataInsufficient} onClick={handleCopy} variant="secondary">
      {buttonState === STATE.CLICKED 
        ? <Box>{t('Copied ✓')}</Box> 
        : <Box>{t('Copy as Text')}</Box>
      }
    </Button>
  );
};

export default CGMClipboardButton;