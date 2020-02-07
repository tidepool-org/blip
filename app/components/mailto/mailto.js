var PropTypes = require('prop-types');
var React = require('react');

class MailTo extends React.Component {
  static propTypes = {
    linkTitle : PropTypes.string.isRequired,
    emailAddress : PropTypes.string.isRequired,
    emailSubject : PropTypes.string.isRequired,
    onLinkClicked: PropTypes.func.isRequired
  };

  render() {

    var mailtoInfo = 'mailto:'+this.props.emailAddress+'?Subject='+this.props.emailSubject;

    // Hack: don't let "mailto:" link cancel other XHR requests by pointing it
    // to a hidden iframe
    // https://github.com/angular/angular.js/issues/7461#issuecomment-43073994

    return (
      <div className='mailto footer-link'>
        <a href={mailtoInfo} onClick={this.props.onLinkClicked} target="mailto">{this.props.linkTitle}</a>
        <iframe name="mailto" src="about:blank" style={{display: 'none'}}></iframe>
      </div>
    );
  }
}

module.exports = MailTo;
