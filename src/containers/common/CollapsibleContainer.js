import React from 'react';
import Collapse from 'react-collapse';

import styles from './CollapsibleContainer.css';

class CollapsibleContainer extends React.Component {

  constructor(props) {
    super(props);
    this.state = { isOpened: this.props.openByDefault, keepContent: false };
    this.handleClick = this.handleClick.bind(this);
  }

  handleClick() {
    const current = this.state.isOpened;
    this.setState({ isOpened: !current });
  }

  render() {
    return (
      <div>
        <div onClick={this.handleClick}>{this.props.label}</div>
        <Collapse
          style={styles.collapsibleContainer}
          isOpened={this.state.isOpened}
          keepCollapsedContent={this.state.keepContent}
        >
          <div>{this.props.children}</div>
        </Collapse>
      </div>
    );
  }
}

CollapsibleContainer.propTypes = {
  children: React.PropTypes.element.isRequired,
  label: React.PropTypes.string.isRequired,
  openByDefault: React.PropTypes.bool,
};

export default CollapsibleContainer;
