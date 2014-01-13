var React = window.React;

var container;

var helpers = {
  mountComponent: function(component) {
    container = document.createElement('div');
    document.documentElement.appendChild(container);
    React.renderComponent(component, container);
  },

  unmountComponent: function() {
    React.unmountComponentAtNode(container);
    document.documentElement.removeChild(container);
  }
};

module.exports = helpers;