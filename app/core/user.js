var user = {
  validate: function(attributes) {
    if (!attributes.firstName) {
      return 'First name is required.';
    }

    if (!attributes.lastName) {
      return 'Last name is required.';
    }

    return null;
  }
};

module.exports = user;