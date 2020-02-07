var PropTypes = require('prop-types');
var React = require('react');
var cx = require('classnames');

class ModalOverlay extends React.Component {
  static propTypes = {
    show: PropTypes.bool.isRequired,
    dialog: PropTypes.node.isRequired,
    overlayClickHandler: PropTypes.func.isRequired
  };

  render() {
    var self = this;
    var classes = cx({
      'ModalOverlay': true,
      'ModalOverlay--show': this.props.show
    });

    
    return (
      <div className={classes}>
        <div className="ModalOverlay-target" onClick={this.props.overlayClickHandler}></div>
        <div className="ModalOverlay-dialog">
          {this.props.dialog}
        </div>
      </div>
    );
    
  }
}

module.exports = ModalOverlay;
