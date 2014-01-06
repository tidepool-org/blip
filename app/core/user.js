var _ = window._;

var user = {
  validate: function(attributes) {
    var errors = {};

    errors.firstName = this.validateRequired(attributes.firstName);
    errors.lastName = this.validateRequired(attributes.lastName);

    if (!_.some(errors)) {
      return {};
    }

    return errors;
  },

  validateRequired: function(value) {
    if (!value) {
      return 'This field is required.';
    }
  }
};

module.exports = user;