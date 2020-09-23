/**
 * Copied from https://github.com/esayemm/connect-with-transition-group (ISC license)
 * Cannot use dist from npm because `const` is not available yet under node v0.12.x
 * updated according to https://github.com/esayemm/connect-with-transition-group/pull/2
 */

/* eslint-disable func-names, lodash/prefer-lodash-method, no-param-reassign */

/**
 * Must have called react-redux/connect with the 'withRef' flag
 * ex:
 * connectWithTransitionGroup(connect(mapStateToProps, null, null, {
 *   withRef: true,
 * }));
 *
 * @param {*} connect - return from react-redux/connect
 * @returns {*} component monkey patched with special lifecycle functions
 */
export default function connectWithTransitionGroup(connect) {
  const willFunctions = [
    'componentWillAppear',
    'componentWillEnter',
    'componentWillLeave',
  ];

  const didFunctions = [
    'componentDidAppear',
    'componentDidEnter',
    'componentDidLeave',
  ];

  willFunctions.forEach((key) => {
    connect.prototype[key] = function (cb) {
        if (this.wrappedInstance[key]) {
          this.wrappedInstance[key](cb);
        } else {
          cb();
        }
    };
  });

  didFunctions.forEach((key) => {
    connect.prototype[key] = function () {
        if (this.wrappedInstance[key]) {
        this.wrappedInstance[key]();
        }
    };
  });

  return connect;
}
