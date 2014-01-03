/** @jsx React.DOM */
var React = window.React;
var _ = window._;

var Nav = React.createClass({
  render: function() {
    var versionElement = this.getVersionElement();
    var userElement = this.getUserElement();

    /* jshint ignore:start */
    return (
      <div className="nav">
        <div className="nav-inner">
          <ul>
            <li><a href="#/">Blip</a></li>
            {versionElement}
          </ul>
          {userElement}
        </div>
      </div>
    );
    /* jshint ignore:end */
  },

  handleLogout: function(e) {
    e.preventDefault();
    var logout = this.props.onLogout;
    if (logout) {
      logout();
    }
  },

  getVersionElement: function() {
    var version = this.props.version;
    if (version) {
      version = 'v' + version;
      /* jshint ignore:start */
      return (
        <li className="nav-version" ref="version">{version}</li>
      );
      /* jshint ignore:end */
    }
    return null;
  },

  getUserElement: function() {
    var user = this.props.user;
    if (!_.isEmpty(user)) {
      var fullName = this.getUserFullName(user);
      /* jshint ignore:start */
      return (
        <ul className="nav-right">
          <li>Logged in as <span>{fullName}</span></li>
          <li><a href="" onClick={this.handleLogout}>Logout</a></li>
        </ul>
      );
      /* jshint ignore:end */
    }
    return null;
  },

  getUserFullName: function(user) {
    return user.firstName + ' ' + user.lastName;
  }
});

module.exports = Nav;