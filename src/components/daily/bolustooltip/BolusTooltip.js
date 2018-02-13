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
 * You should have received a copy of the License along with this program; if
 * not, you can obtain one from Tidepool Project at tidepool.org.
 * == BSD2 LICENSE ==
 */

import React, { PropTypes, PureComponent } from 'react';
import _ from 'lodash';
import * as bolusUtils from '../../../utils/bolus';
import { formatLocalizedFromUTC, formatDuration } from '../../../utils/datetime';
import { formatDecimalNumber } from '../../../utils/format';
import Tooltip from '../../common/tooltips/Tooltip';
import colors from '../../../styles/colors.css';
import styles from './BolusTooltip.css';

class BolusTooltip extends PureComponent {
  formatInsulin(qty) {
    let decimalLength;
    const qtyString = qty.toString();
    if (qtyString.indexOf('.') !== -1 && qtyString.split('.')[1].length === 2) {
      decimalLength = 2;
    } else {
      decimalLength = 1;
    }
    return formatDecimalNumber(qty, decimalLength);
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
      content = (
        <div className={styles.annotation}>
          * Animas pumps don't capture the details of how combo boluses are split between the normal
          and extended amounts.
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
    if (targetLow) {
      // medtronic
      let value;
      if (targetLow === targetHigh) {
        value = `${targetLow}`;
      } else {
        value = `${targetLow}-${targetHigh}`;
      }
      return (
        <div className={styles.target}>
          <div className={styles.label}>Target</div>
          <div className={styles.value}>{value}</div>
          <div className={styles.units} />
        </div>
      );
    }
    if (targetRange) {
      // animas
      return [
        <div className={styles.target} key={'target'}>
          <div className={styles.label}>Target</div>
          <div className={styles.value}>{`${target}`}</div>
          <div className={styles.units} />
        </div>,
        <div className={styles.target} key={'range'}>
          <div className={styles.label}>Range</div>
          <div className={styles.value}>{`${targetRange}`}</div>
          <div className={styles.units} />
        </div>,
      ];
    }
    if (targetHigh) {
      // insulet
      return [
        <div className={styles.target} key={'target'}>
          <div className={styles.label}>Target</div>
          <div className={styles.value}>{`${target}`}</div>
          <div className={styles.units} />
        </div>,
        <div className={styles.target} key={'high'}>
          <div className={styles.label}>High</div>
          <div className={styles.value}>{`${targetHigh}`}</div>
          <div className={styles.units} />
        </div>,
      ];
    }
    // tandem
    return (
      <div className={styles.target}>
        <div className={styles.label}>Target</div>
        <div className={styles.value}>{`${target}`}</div>
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
              <div className={styles.label}>{`Up Front (${normalPercentage})`}</div>
              <div className={styles.value}>{`${this.formatInsulin(normal)}`}</div>
              <div className={styles.units}>U</div>
            </div>
          ),
          <div className={styles.extended} key={'extended'}>
            <div className={styles.label}>
              {`Over ${formatDuration(bolusUtils.getDuration(bolus))} ${extendedPercentage}`}
            </div>
            <div className={styles.value}>
              {`${this.formatInsulin(bolusUtils.getExtended(bolus))}`}
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
          <div className={styles.label}>Override</div>
          <div className={styles.value}>{`+${this.formatInsulin(programmed - recommended)}`}</div>
          <div className={styles.units}>U</div>
        </div>
      );
    }
    if (bolusUtils.isUnderride(wizard)) {
      overrideLine = (
        <div className={styles.override}>
          <div className={styles.label}>Underride</div>
          <div className={styles.value}>{`-${this.formatInsulin(recommended - programmed)}`}</div>
          <div className={styles.units}>U</div>
        </div>
      );
    }
    const deliveredLine = _.isFinite(delivered) && (
      <div className={styles.delivered}>
        <div className={styles.label}>Delivered</div>
        <div className={styles.value}>{`${this.formatInsulin(delivered)}`}</div>
        <div className={styles.units}>U</div>
      </div>
    );
    const suggestedLine = (isInterrupted || overrideLine) &&
      !!suggested && (
      <div className={styles.suggested}>
        <div className={styles.label}>Suggested</div>
        <div className={styles.value}>{this.formatInsulin(suggested)}</div>
        <div className={styles.units}>U</div>
      </div>
      );
    const bgLine = !!bg && (
      <div className={styles.bg}>
        <div className={styles.label}>BG</div>
        <div className={styles.value}>{bg}</div>
        <div className={styles.units} />
      </div>
    );
    const carbsLine = !!carbs && (
      <div className={styles.carbs}>
        <div className={styles.label}>Carbs</div>
        <div className={styles.value}>{carbs}</div>
        <div className={styles.units}>g</div>
      </div>
    );
    const iobLine = !!iob && (
      <div className={styles.iob}>
        <div className={styles.label}>IOB</div>
        <div className={styles.value}>{`${this.formatInsulin(iob)}`}</div>
        <div className={styles.units}>U</div>
      </div>
    );
    const interruptedLine = isInterrupted && (
      <div className={styles.interrupted}>
        <div className={styles.label}>Interrupted</div>
        <div className={styles.value}>{`-${this.formatInsulin(programmed - delivered)}`}</div>
        <div className={styles.units}>U</div>
      </div>
    );
    const icRatioLine = !!carbsInput &&
      !!carbRatio && (
      <div className={styles.carbRatio}>
        <div className={styles.label}>I:C Ratio</div>
        <div className={styles.value}>{`1:${carbRatio}`}</div>
        <div className={styles.units} />
      </div>
      );
    const isfLine = !!isf &&
      !!bg && (
      <div className={styles.isf}>
        <div className={styles.label}>ISF</div>
        <div className={styles.value}>{`${isf}`}</div>
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
        <div className={styles.label}>Delivered</div>
        <div className={styles.value}>{`${this.formatInsulin(delivered)}`}</div>
        <div className={styles.units}>U</div>
      </div>
    );
    const interruptedLine = isInterrupted && (
      <div className={styles.interrupted}>
        <div className={styles.label}>Interrupted</div>
        <div className={styles.value}>{`-${this.formatInsulin(programmed - delivered)}`}</div>
        <div className={styles.units}>U</div>
      </div>
    );
    const programmedLine = isInterrupted &&
      !!programmed && (
      <div className={styles.programmed}>
        <div className={styles.label}>Programmed</div>
        <div className={styles.value}>{`${this.formatInsulin(programmed)}`}</div>
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
        {formatLocalizedFromUTC(this.props.bolus.normalTime, this.props.timePrefs, 'h:mm a')}
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
