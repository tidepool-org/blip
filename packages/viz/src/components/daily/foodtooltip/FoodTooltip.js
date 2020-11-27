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

import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

import Tooltip from '../../common/tooltips/Tooltip';
import colors from '../../../styles/colors.css';
import styles from './FoodTooltip.css';
import i18next from 'i18next';
import { PRESCRIPTOR_MODIFIED, PRESCRIPTOR_NONE} from '../../../utils/constants';

class FoodTooltip extends React.Component {
  getCarbs(food) {
    return _.get(food, 'nutrition.carbohydrate.net', 0);
  }

  getPrescribedCarbs(food) {
    return _.get(food, 'prescribedNutrition.carbohydrate.net');
  }

  getPrescriptor(food) {
    return _.get(food, 'prescriptor');
  }

  isPrescribed(food) {
    const prescriptor = this.getPrescriptor(food);
    if (prescriptor) {
      return true;
    }
    return false;
  }

  renderFood() {
    const food = this.props.food;
    const actualValue = this.getCarbs(food);
    const rows = [];
    const prescriptor = this.getPrescriptor(food);
    if (this.isPrescribed(food) && (prescriptor !== PRESCRIPTOR_NONE) ) {      
      const prescribedValue = (prescriptor === PRESCRIPTOR_MODIFIED) ? this.getPrescribedCarbs(food) : this.getCarbs(food);
      rows.push(
        <div key={'prescribed'} className={styles.prescribed}>
        <div className={styles.label}>{i18next.t('Recommended')}</div>
        <div className={styles.value}>
          {prescribedValue}
        </div>
        <div className={styles.units}>g</div>
        </div>
      )
    }
    rows.push(
      <div key={'carb'} className={styles.carb}>
        <div className={styles.label}>{i18next.t('Confirmed')}</div>
        <div className={styles.value}>
          {actualValue}
        </div>
        <div className={styles.units}>g</div>
      </div>,
    );

    return <div className={styles.container}>{rows}</div>;
  }

  render() {
    const { food, timePrefs, title } = this.props;

    let dateTitle = null;
    if (title === null) {
      dateTitle = {
        source: _.get(food, 'source', 'tidepool'),
        normalTime: food.normalTime,
        timezone: _.get(food, 'timezone', 'UTC'),
        timePrefs,
      };
    }

    return (
      <Tooltip
        {...this.props}
        title={title}
        dateTitle={dateTitle}
        content={this.renderFood()}
      />
    );
  }
}

FoodTooltip.propTypes = {
  position: PropTypes.shape({
    top: PropTypes.number.isRequired,
    left: PropTypes.number.isRequired,
  }).isRequired,
  offset: PropTypes.shape({
    top: PropTypes.number.isRequired,
    left: PropTypes.number,
    horizontal: PropTypes.number,
  }),
  title: PropTypes.node,
  tail: PropTypes.bool.isRequired,
  side: PropTypes.oneOf(['top', 'right', 'bottom', 'left']).isRequired,
  tailColor: PropTypes.string.isRequired,
  tailWidth: PropTypes.number.isRequired,
  tailHeight: PropTypes.number.isRequired,
  backgroundColor: PropTypes.string,
  borderColor: PropTypes.string.isRequired,
  borderWidth: PropTypes.number.isRequired,
  food: PropTypes.shape({
    nutrition: PropTypes.shape({
      carbohydrate: PropTypes.shape({
        net: PropTypes.number.isRequired,
        units: PropTypes.string.isRequired,
      }).isRequired,
    }).isRequired,
  }).isRequired,
  timePrefs: PropTypes.object.isRequired,
  bgPrefs: PropTypes.shape({
    bgClasses: PropTypes.object.isRequired,
    bgUnits: PropTypes.string.isRequired,
  }).isRequired,
};

FoodTooltip.defaultProps = {
  tail: true,
  side: 'right',
  tailWidth: 9,
  tailHeight: 17,
  tailColor: colors.rescuecarbs,
  borderColor: colors.rescuecarbs,
  borderWidth: 2,
  title: null,
};

export default FoodTooltip;
