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

import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';
import * as bolusUtils from '../../../utils/bolus';
import { formatInsulin, formatInputTime } from '../../../utils/format';
import Tooltip from '../../common/tooltips/Tooltip';
import colors from '../../../styles/colors.css';
import styles from './BolusTooltip.css';
import i18next from 'i18next';

const t = i18next.t.bind(i18next);

class BolusTooltip extends React.Component {
  getBolusTypeLine(bolusType) {
    if (bolusType !== null) {
      return (
        <div className={styles.bolus} id="bolus-tooltip-line-type">
          <div className={styles.label} id="bolus-tooltip-line-type-label">{t('bolus_type')}</div>
          <div className={styles.value} id="bolus-tooltip-line-type-value">{t(`bolus_${bolusType}`)}</div>
        </div>
      );
    }
    return null;
  }

  getIobLine(iob) {
    if (iob !== null) {
      return (
        <div className={styles.iob} id="bolus-tooltip-line-iob">
          <div className={styles.label} id="bolus-tooltip-line-iob-label">{t('IOB')}</div>
          <div className={styles.value} id="bolus-tooltip-line-iob-value">{formatInsulin(iob)}</div>
          <div className={styles.units} id="bolus-tooltip-line-iob-units">{t('U')}</div>
        </div>
      );
    }
    return null;
  }

  getPrescriptorLine(prescriptor) {
    if (_.isString(prescriptor) && prescriptor !== 'manual') {
      return (
        <div className={styles.prescriptor} id="bolus-tooltip-line-prescriptor">
          <div className={styles.label} id="bolus-tooltip-line-prescriptor-label">{t('Prescribed by Loop Mode')}</div>
        </div>
      );
    }
    return null;
  }

  getDeliveredLine(delivered) {
    if (_.isFinite(delivered)) {
      return (
        <div className={styles.delivered} id="bolus-tooltip-line-delivered">
          <div className={styles.label} id="bolus-tooltip-line-delivered-label">{t('Delivered')}</div>
          <div className={styles.value} id="bolus-tooltip-line-delivered-value">{`${formatInsulin(delivered)}`}</div>
          <div className={styles.units} id="bolus-tooltip-line-delivered-units">{t('U')}</div>
        </div>
      );
    }
    return null;
  }

  getUndeliveredLine(/** @type{number} */ undelivered) {
    const value = undelivered > 0 ? `-${formatInsulin(undelivered)}` : `+${(-undelivered).toFixed(2)}`;
    return (
      <div className={styles.undelivered} id="bolus-tooltip-line-undelivered">
        <div className={styles.label} id="bolus-tooltip-line-undelivered-label">{t('Undelivered')}</div>
        <div className={styles.value} id="bolus-tooltip-line-undelivered-value">{value}</div>
        <div className={styles.units} id="bolus-tooltip-line-undelivered-units">{t('U')}</div>
      </div>
    );
  }

  getRecommendedLine(recommended) {
    return (
      <div className={styles.suggested} id="bolus-tooltip-line-recommended">
        <div className={styles.label} id="bolus-tooltip-line-recommended-label">{t('Recommended')}</div>
        <div className={styles.value} id="bolus-tooltip-line-recommended-value">{formatInsulin(recommended)}</div>
        <div className={styles.units} id="bolus-tooltip-line-recommended-units">{t('U')}</div>
      </div>
    );
  }

  getOverrideLine(programmed, recommended) {
    let overrideLine = null;
    if (Number.isFinite(programmed) && Number.isFinite(recommended) && programmed !== recommended) {
      let value = formatInsulin(Math.abs(programmed - recommended));
      value = programmed > recommended ? `+${value}` : `-${value}`;
      overrideLine = (
        <div className={styles.override} id="bolus-tooltip-line-override">
          <div className={styles.label} id="bolus-tooltip-line-override-label">{t('Override')}</div>
          <div className={styles.value} id="bolus-tooltip-line-override-value">{value}</div>
          <div className={styles.units} id="bolus-tooltip-line-override-units">{t('U')}</div>
        </div>
      );
    }
    return overrideLine;
  }

  getCarbsLine(carbs) {
    if (carbs !== null) {
      return (
        <div className={styles.carbs} id="bolus-tooltip-line-carbs">
          <div className={styles.label} id="bolus-tooltip-line-carbs-label">{t('Carbs')}</div>
          <div className={styles.value} id="bolus-tooltip-line-carbs-value">{carbs}</div>
          <div className={styles.units} id="bolus-tooltip-line-carbs-units">{t('g')}</div>
        </div>
      );
    }
    return null;
  }

  getMealLine(fatMeal) {
    if (fatMeal === 'yes') {
      return (
        <div className={styles.fat} id="bolus-tooltip-line-fat">
          <div className={styles.label} id="bolus-tooltip-line-fat-label">{t('High fat meal')}</div>
        </div>
      );
    }
    return null;
  }

  getInputTimeLine(inputTime, timePrefs) {
    if (inputTime !== null) {
      return (
        <div className={styles.input} id="bolus-tooltip-line-input">
          <div className={styles.label} id="bolus-tooltip-line-input-label">
            {t('Entered at')} {formatInputTime(inputTime, timePrefs)}
          </div>
        </div>
      );
    }
    return null;
  }

  renderWizard() {
    const { bolus: wizard, timePrefs } = this.props;

    const recommended = bolusUtils.getRecommended(wizard);
    const suggested = _.isFinite(recommended) ? recommended : null;
    const prescriptor = _.get(wizard, 'bolus.prescriptor', null);
    const inputTime = _.get(wizard, 'inputTime', null);
    const bolusType = _.get(wizard, 'bolus.subType', null);
    const fatMeal = _.get(wizard, 'inputMeal.fat', 'no');
    const iob = _.get(wizard, 'insulinOnBoard', null);
    const carbs = bolusUtils.getCarbs(wizard);
    const delivered = bolusUtils.getDelivered(wizard);
    const isInterrupted = bolusUtils.isInterruptedBolus(wizard);
    const programmed = bolusUtils.getProgrammed(wizard);

    const overrideLine = this.getOverrideLine(programmed, recommended);
    const deliveredLine = this.getDeliveredLine(delivered);
    const undeliveredLine = isInterrupted ? this.getUndeliveredLine(programmed - delivered) : null;
    const recommendedLine = (isInterrupted || overrideLine !== null) && suggested !== null ? this.getRecommendedLine(suggested) : null;
    const carbsLine = this.getCarbsLine(carbs);

    const iobLine = this.getIobLine(iob);
    const bolusTypeLine = this.getBolusTypeLine(bolusType);
    const prescriptorLine = this.getPrescriptorLine(prescriptor);

    const mealLine = this.getMealLine(fatMeal);
    const inputLine = this.getInputTimeLine(inputTime, timePrefs);

    return (
      <div className={styles.container}>
        {carbsLine}
        {mealLine}
        {inputLine}
        {iobLine}
        {(prescriptorLine || bolusTypeLine) && <div className={styles.dividerSmall} />}
        {prescriptorLine}
        {bolusTypeLine}
        {(overrideLine || recommendedLine) && <div className={styles.dividerSmall} />}
        {recommendedLine}
        {overrideLine}
        {undeliveredLine}
        {deliveredLine}
      </div>
    );
  }

  renderNormal() {
    const { bolus } = this.props;

    const prescriptor = _.get(bolus, 'prescriptor', null);
    const bolusType = _.get(bolus, 'subType', null);
    const iob = _.get(bolus, 'insulinOnBoard', null);
    const delivered = bolusUtils.getDelivered(bolus);
    const isInterrupted = bolusUtils.isInterruptedBolus(bolus);
    const programmed = bolusUtils.getProgrammed(bolus);

    const iobLine = this.getIobLine(iob);
    const prescriptorLine = this.getPrescriptorLine(prescriptor);
    const bolusTypeLine = this.getBolusTypeLine(bolusType);
    const undeliveredLine = isInterrupted ? this.getUndeliveredLine(programmed - delivered) : null;
    const deliveredLine = this.getDeliveredLine(delivered);

    return (
      <div className={styles.container} id="bolus-tooltip-content">
        {iobLine}
        {prescriptorLine}
        {bolusTypeLine}
        {undeliveredLine}
        {deliveredLine}
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
    const { bolus, timePrefs } = this.props;

    const dateTitle = {
      source: _.get(bolus, 'source', 'tidepool'),
      normalTime: bolus.normalTime,
      timezone: _.get(bolus, 'timezone', 'UTC'),
      timePrefs,
    };

    let tailColor = this.props.tailColor;
    let borderColor = this.props.borderColor;
    const bolusType = bolusUtils.getBolusType(bolus);

    switch (bolusType) {
    case bolusUtils.BolusTypes.meal:
      tailColor = colors.bolusMeal;
      borderColor = colors.bolusMeal;
      break;
    case bolusUtils.BolusTypes.manual:
      tailColor = colors.bolusManual;
      borderColor = colors.bolusManual;
      break;
    case bolusUtils.BolusTypes.micro:
      tailColor = colors.bolusMicro;
      borderColor = colors.bolusMicro;
      break;
    }

    return (
      <Tooltip
        {...this.props}
        dateTitle={dateTitle}
        content={this.renderBolus()}
        tailColor={tailColor}
        borderColor={borderColor}
      />
    );
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
  tailColor: PropTypes.string,
  tailWidth: PropTypes.number.isRequired,
  tailHeight: PropTypes.number.isRequired,
  backgroundColor: PropTypes.string,
  borderColor: PropTypes.string,
  borderWidth: PropTypes.number.isRequired,
  bolus: PropTypes.shape({
    type: PropTypes.string.isRequired,
    normalTime: PropTypes.string.isRequired,
    inputTime: PropTypes.string,
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
