import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import Button from '../../../../components/elements/Button';
import utils from '../../../../core/utils';
import { MGDL_UNITS } from '../../../../core/constants';
import { utils as vizUtils } from '@tidepool/viz';
const { TextUtil } = vizUtils.text;
import { Box } from 'theme-ui'

const getCGMClipboardText = (patientName, agpCGM, t) => {
  if (!agpCGM) return '';

  const { veryLow, low, target, total } = agpCGM.data?.current?.stats?.timeInRange?.counts || {};
  const { averageGlucose } =  agpCGM.data?.current?.stats?.averageGlucose || {};
  const { bgUnits } = agpCGM.bgPrefs;

  const avgGlucosePrecision = bgUnits === MGDL_UNITS ? 0 : 1;
  const targetRange = bgUnits === MGDL_UNITS ? '70-180' : '4.0-10.0';

  const avgGlucose   = utils.roundToPrecision(averageGlucose, avgGlucosePrecision);
  const timeInTarget = utils.roundToPrecision((target / total) * 100, 1);
  const timeInLows   = utils.roundToPrecision(((veryLow + low) * 100 ) / total, 1);

  const textUtil = new TextUtil();
  let clipboardText = '';

  const paragraph1 = '{{patientName}} has an average blood glucose of {{avgGlucose}} {{bgUnits}} and is in target'
                     + ' range ({{targetRange}}) {{timeInTarget}}% of the time with {{timeInLows}}% lows.';

  const paragraph1Opts = { patientName, avgGlucose, targetRange, bgUnits, timeInTarget, timeInLows };

  const paragraph2 = 'Our goal is to get people into target range more than 70% (16 hours 48 min/day) of the time'
                     + ' with less than 4% lows (58 min/day).';
  
  const paragraph3 = 'Please let us know if you have questions or concerns. We will review trends again next'
                     + ' month. You can also view the trends if you log into clarity on your computer and look at'
                     + ' the overall trends and average blood glucose.';

  // TODO: Verify copy text, especially line 3 - (reviewing Q monthly)
  clipboardText += textUtil.buildTextLine(t(paragraph1, paragraph1Opts));
  clipboardText += textUtil.buildTextLine('');
  clipboardText += textUtil.buildTextLine(t(paragraph2));
  clipboardText += textUtil.buildTextLine('');
  clipboardText += textUtil.buildTextLine(t(paragraph3));

  return clipboardText;
}

const STATE = {
  DEFAULT: 'DEFAULT',
  CLICKED: 'CLICKED',
}

const CGMClipboardButton = ({ patientName, agpCGM }) => {
  const { t } = useTranslation();
  const [buttonState, setButtonState] = useState(STATE.DEFAULT);

  useEffect(() => {
    let buttonTextEffect = setTimeout(() => {
      setButtonState(STATE.DEFAULT)
    }, 1000);

    return () => {
      clearTimeout(buttonTextEffect);
    }
  }, [buttonState])

  const isDisabled = !agpCGM;

  const clipboardText = useMemo(() => getCGMClipboardText(patientName, agpCGM, t), [patientName, agpCGM, t]);

  const handleCopy = () => {
    navigator?.clipboard?.writeText(clipboardText);
    setButtonState(STATE.CLICKED);
  }

  return (
    <Button disabled={isDisabled} onClick={handleCopy} variant="secondary">
      {buttonState === STATE.CLICKED 
        ? <Box>{t('Copied ✓')}</Box> 
        : <Box>{t('Copy as Text')}</Box>
      }
    </Button>
  )
}

export default CGMClipboardButton;