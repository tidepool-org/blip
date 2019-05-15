import React, { PropTypes, PureComponent } from 'react';
import _ from 'lodash';

import colors from '../../../styles/colors.css';
import styles from './StatLegend.css';

class StatLegend extends PureComponent {
  static propTypes = {
    items: PropTypes.arrayOf(PropTypes.shape({
      id: PropTypes.string,
      legendTitle: PropTypes.string,
    })).isRequired,
  };

  static displayName = 'StatLegend';

  renderLegendItems = (items) => (
    _.map(items, (item) => (
      <li
        className={styles.StatLegendItem}
        key={item.id}
        style={{ borderBottomColor: colors[item.id] }}
      >
        <span className={styles.StatLegendTitle}>
          {item.legendTitle}
        </span>
      </li>
    ))
  );

  render() {
    return (
      <ul className={styles.StatLegend}>
        {this.renderLegendItems(this.props.items)}
      </ul>
    );
  }
}

export default StatLegend;
