/*
 * == BSD2 LICENSE ==
 * Copyright (c) 2016, Tidepool Project
 *
 * This program is free software; you can redistribute it and/or modify it under
 * the terms of the associated License, which is identical to the BSD 2-Clause
 * License as published by the Open Source Initiative at opensource.org.
 *
 * This program is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS
 * FOR A PARTICULAR PURPOSE. See the License for more details.
 *
 * You should have received a copy of the License along with this program; ifg
 * not, you can obtain one from Tidepool Project at tidepool.org.
 * == BSD2 LICENSE ==
 */

import React, { PropTypes, PureComponent } from 'react';
import _ from 'lodash';
import * as bolusUtils from '../../../utils/bolus';
import { formatLocalizedFromUTC, formatDuration, HOUR_MINUTE_FORMAT } from '../../../utils/datetime';
import { formatInsulin, formatBgValue } from '../../../utils/format';
import { getAnnotationMessages } from '../../../utils/annotations';
import Tooltip from '../../common/tooltips/Tooltip';
import colors from '../../../styles/colors.css';
import styles from './BolusTooltip.css';
import i18next from 'i18next';

const t = i18next.t.bind(i18next);

class BolusTooltip extends PureComponent {
  formatBgValue(val) {
    return formatBgValue(val, this.props.bgPrefs);
  }

  isAnimasExtended() {
    const annotations = bolusUtils.getAnnotations(this.props.bolus);
    const isAnimasExtended =
      _.findIndex(annotations, { code: 'animas/bolus/extended-equal-split' }) !== -1;
    return isAnimasExtended;
  }

  animasExtendedAnnotationMessage() {
    let content = null;
    if (this.isAnimasExtended()) {
      const messages = getAnnotationMessages(bolusUtils.getBolusFromInsulinEvent(this.props.bolus));
      content = (
        <div className={styles.annotation}>
          {_.find(messages, { code: 'animas/bolus/extended-equal-split' }).message.value}
        </div>
      );
    }
    return content;
  }

  getTarget() {
    const wizardTarget = _.get(this.props.bolus, 'bgTarget');
    const target = _.get(wizardTarget, 'target', null);
    const targetLow = _.get(wizardTarget, 'low', null);
    const targetHigh = _.get(wizardTarget, 'high', null);
    const targetRange = _.get(wizardTarget, 'range', null);
    const isAutomatedTarget = _.findIndex(_.get(this.props.bolus, 'annotations', []), {
      code: 'wizard/target-automated',
    }) !== -1;
    if (isAutomatedTarget) {
      return (
        <div className={styles.target}>
          <div className={styles.label}>{t('Target')}</div>
          <div className={styles.value}>{t('Auto')}</div>
          <div className={styles.units} />
        </div>
      );
    }
    if (targetLow) {
      // medtronic
      let value;
      if (targetLow === targetHigh) {
        value = `${this.formatBgValue(targetLow)}`;
      } else {
        value = `${this.formatBgValue(targetLow)}-${this.formatBgValue(targetHigh)}`;
      }
      return (
        <div className={styles.target}>
          <div className={styles.label}>{t('Target')}</div>
          <div className={styles.value}>{value}</div>
          <div className={styles.units} />
        </div>
      );
    }
    if (targetRange) {
      // animas
      return [
        <div className={styles.target} key={'target'}>
          <div className={styles.label}>{t('Target')}</div>
          <div className={styles.value}>{`${this.formatBgValue(target)}`}</div>
          <div className={styles.units} />
        </div>,
        <div className={styles.target} key={'range'}>
          <div className={styles.label}>{t('Range')}</div>
          <div className={styles.value}>{`${this.formatBgValue(targetRange)}`}</div>
          <div className={styles.units} />
        </div>,
      ];
    }
    if (targetHigh) {
      // insulet
      return [
        <div className={styles.target} key={'target'}>
          <div className={styles.label}>{t('Target')}</div>
          <div className={styles.value}>{`${this.formatBgValue(target)}`}</div>
          <div className={styles.units} />
        </div>,
        <div className={styles.target} key={'high'}>
          <div className={styles.label}>{t('High')}</div>
          <div className={styles.value}>{`${this.formatBgValue(targetHigh)}`}</div>
          <div className={styles.units} />
        </div>,
      ];
    }
    // tandem
    return (
      <div className={styles.target}>
        <div className={styles.label}>{t('Target')}</div>
        <div className={styles.value}>{`${this.formatBgValue(target)}`}</div>
        <div className={styles.units} />
      </div>
    );
  }

  getExtended() {
    const bolus = bolusUtils.getBolusFromInsulinEvent(this.props.bolus);
    const hasExtended = bolusUtils.hasExtended(bolus);
    const normalPercentage = bolusUtils.getNormalPercentage(bolus);
    const normal = _.get(bolus, 'normal', NaN);
    const isAnimasExtended = this.isAnimasExtended();
    const extendedPercentage = _.isNaN(bolusUtils.getExtendedPercentage(bolus))
      ? ''
      : `(${bolusUtils.getExtendedPercentage(bolus)})`;
    let extendedLine = null;
    if (hasExtended) {
      if (isAnimasExtended) {
        extendedLine = (
          <div className={styles.extended}>
            <div className={styles.label}>Extended Over*</div>
            <div className={styles.value}>{formatDuration(bolusUtils.getDuration(bolus))}</div>
          </div>
        );
      } else {
        extendedLine = [
          !!normal && (
            <div className={styles.normal} key={'normal'}>
              <div className={styles.label}>
                {t('Up Front ({{normalPercentage}})', { normalPercentage })}
              </div>
              <div className={styles.value}>{`${formatInsulin(normal)}`}</div>
              <div className={styles.units}>U</div>
            </div>
          ),
          <div className={styles.extended} key={'extended'}>
            <div className={styles.label}>
              {`Over ${formatDuration(bolusUtils.getDuration(bolus))} ${extendedPercentage}`}
            </div>
            <div className={styles.value}>
              {`${formatInsulin(bolusUtils.getExtended(bolus))}`}
            </div>
            <div className={styles.units}>U</div>
          </div>,
        ];
      }
    }
    return extendedLine;
  }

  renderWizard() {
    const wizard = this.props.bolus;
    const recommended = bolusUtils.getRecommended(wizard);
    const suggested = _.isFinite(recommended) ? `${recommended}` : null;
    const bg = _.get(wizard, 'bgInput', null);
    const iob = _.get(wizard, 'insulinOnBoard', null);
    const carbs = bolusUtils.getCarbs(wizard);
    const carbsInput = _.isFinite(carbs) && carbs > 0;
    const carbRatio = _.get(wizard, 'insulinCarbRatio', null);
    const isf = _.get(wizard, 'insulinSensitivity', null);
    const delivered = bolusUtils.getDelivered(wizard);
    const isInterrupted = bolusUtils.isInterruptedBolus(wizard);
    const programmed = bolusUtils.getProgrammed(wizard);
    const hasExtended = bolusUtils.hasExtended(wizard);
    const isAnimasExtended = this.isAnimasExtended();

    let overrideLine = null;
    if (bolusUtils.isOverride(wizard)) {
      overrideLine = (
        <div className={styles.override}>
          <div className={styles.label}>{t('Override')}</div>
          <div className={styles.value}>{`+${formatInsulin(programmed - recommended)}`}</div>
          <div className={styles.units}>U</div>
        </div>
      );
    }
    if (bolusUtils.isUnderride(wizard)) {
      overrideLine = (
        <div className={styles.override}>
          <div className={styles.label}>{t('Underride')}</div>
          <div className={styles.value}>{`-${formatInsulin(recommended - programmed)}`}</div>
          <div className={styles.units}>U</div>
        </div>
      );
    }
    const deliveredLine = _.isFinite(delivered) && (
      <div className={styles.delivered}>
        <div className={styles.label}>{t('Delivered')}</div>
        <div className={styles.value}>{`${formatInsulin(delivered)}`}</div>
        <div className={styles.units}>U</div>
      </div>
    );
    const suggestedLine = (isInterrupted || overrideLine) &&
      !!suggested && (
      <div className={styles.suggested}>
        <div className={styles.label}>{t('Suggested')}</div>
        <div className={styles.value}>{formatInsulin(suggested)}</div>
        <div className={styles.units}>U</div>
      </div>
    );
    const bgLine = !!bg && (
      <div className={styles.bg}>
        <div className={styles.label}>{t('BG')}</div>
        <div className={styles.value}>{this.formatBgValue(bg)}</div>
        <div className={styles.units} />
      </div>
    );
    const carbsLine = !!carbs && (
      <div className={styles.carbs}>
        <div className={styles.label}>{t('Carbs')}</div>
        <div className={styles.value}>{carbs}</div>
        <div className={styles.units}>g</div>
      </div>
    );
    const iobLine = !!iob && (
      <div className={styles.iob}>
        <div className={styles.label}>{t('IOB')}</div>
        <div className={styles.value}>{`${formatInsulin(iob)}`}</div>
        <div className={styles.units}>U</div>
      </div>
    );
    const interruptedLine = isInterrupted && (
      <div className={styles.interrupted}>
        <div className={styles.label}>{t('Interrupted')}</div>
        <div className={styles.value}>{`-${formatInsulin(programmed - delivered)}`}</div>
        <div className={styles.units}>U</div>
      </div>
    );
    const icRatioLine = !!carbsInput &&
      !!carbRatio && (
      <div className={styles.carbRatio}>
        <div className={styles.label}>{t('I:C Ratio')}</div>
        <div className={styles.value}>{`1:${carbRatio}`}</div>
        <div className={styles.units} />
      </div>
    );
    const isfLine = !!isf &&
      !!bg && (
      <div className={styles.isf}>
        <div className={styles.label}>{t('ISF')}</div>
        <div className={styles.value}>{`${this.formatBgValue(isf)}`}</div>
        <div className={styles.units} />
      </div>
    );

    return (
      <div className={styles.container}>
        {bgLine}
        {carbsLine}
        {iobLine}
        {suggestedLine}
        {this.getExtended()}
        {(isInterrupted || overrideLine || hasExtended) && <div className={styles.dividerSmall} />}
        {overrideLine}
        {interruptedLine}
        {deliveredLine}
        {(icRatioLine || isfLine || bg || isAnimasExtended) && (
          <div className={styles.dividerLarge} />
        )}
        {icRatioLine}
        {isfLine}
        {!!bg && this.getTarget()}
        {this.animasExtendedAnnotationMessage()}
      </div>
    );
  }

  renderNormal() {
    const bolus = this.props.bolus;
    const delivered = bolusUtils.getDelivered(bolus);
    const isInterrupted = bolusUtils.isInterruptedBolus(bolus);
    const programmed = bolusUtils.getProgrammed(bolus);
    const isAnimasExtended = this.isAnimasExtended();

    const deliveredLine = _.isFinite(delivered) && (
      <div className={styles.delivered}>
        <div className={styles.label}>{t('Delivered')}</div>
        <div className={styles.value}>{`${formatInsulin(delivered)}`}</div>
        <div className={styles.units}>U</div>
      </div>
    );
    const interruptedLine = isInterrupted && (
      <div className={styles.interrupted}>
        <div className={styles.label}>{t('Interrupted')}</div>
        <div className={styles.value}>{`-${formatInsulin(programmed - delivered)}`}</div>
        <div className={styles.units}>U</div>
      </div>
    );
    const programmedLine = isInterrupted &&
      !!programmed && (
      <div className={styles.programmed}>
        <div className={styles.label}>{t('Programmed')}</div>
        <div className={styles.value}>{`${formatInsulin(programmed)}`}</div>
        <div className={styles.units}>U</div>
      </div>
    );

    return (
      <div className={styles.container}>
        {programmedLine}
        {interruptedLine}
        {deliveredLine}
        {this.getExtended()}
        {isAnimasExtended && <div className={styles.dividerLarge} />}
        {this.animasExtendedAnnotationMessage()}
      </div>
    );
  }

  renderBolus() {
    let content;
    if (this.props.bolus.type === 'wizard') {
      content = this.renderWizard();
    } else {
      content = this.renderNormal();
    }
    return content;
  }

  render() {
    const title = (
      <div className={styles.title}>
        {
          formatLocalizedFromUTC(
            this.props.bolus.normalTime,
            this.props.timePrefs,
            HOUR_MINUTE_FORMAT)
        }
      </div>
    );
    return <Tooltip {...this.props} title={title} content={this.renderBolus()} />;
  }
}

BolusTooltip.propTypes = {
  position: PropTypes.shape({
    top: PropTypes.number.isRequired,
    left: PropTypes.number.isRequired,
  }).isRequired,
  offset: PropTypes.shape({
    top: PropTypes.number.isRequired,
    left: PropTypes.number,
    horizontal: PropTypes.number,
  }),
  tail: PropTypes.bool.isRequired,
  side: PropTypes.oneOf(['top', 'right', 'bottom', 'left']).isRequired,
  tailColor: PropTypes.string.isRequired,
  tailWidth: PropTypes.number.isRequired,
  tailHeight: PropTypes.number.isRequired,
  backgroundColor: PropTypes.string,
  borderColor: PropTypes.string.isRequired,
  borderWidth: PropTypes.number.isRequired,
  bolus: PropTypes.shape({
    type: PropTypes.string.isRequired,
  }).isRequired,
  bgPrefs: PropTypes.object.isRequired,
  timePrefs: PropTypes.object.isRequired,
};

BolusTooltip.defaultProps = {
  tail: true,
  side: 'right',
  tailWidth: 9,
  tailHeight: 17,
  tailColor: colors.bolus,
  borderColor: colors.bolus,
  borderWidth: 2,
};

export default BolusTooltip;
