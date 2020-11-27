/**
 * Copyright 2013-present, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 * @providesModule ReactTransitionGroup
 * --------------------------------------
 * Update code for Diabeloop.
 */

/* eslint-disable lodash/prefer-lodash-method, react/no-string-refs, guard-for-in */

import React from 'react';
import PropTypes from 'prop-types';
import _ from 'lodash';

function getChildMapping(children) {
  return _.keyBy(
    React.Children.toArray(
      children,
    ),
    child => child.key,
  );
}

class ReactTransitionGroupPlus extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      children: getChildMapping(this.props.children),
    };
    this.displayName = 'ReactTransitionGroupPlus';
    this.currentlyEnteringOrEnteredKeys = {};
    this.currentlyEnteringKeys = {};
    this.currentlyEnteringPromises = {};
    this.currentlyLeavingKeys = {};
    this.currentlyLeavingPromises = {};
    this.pendingEnterCallbacks = {};
    this.pendingLeaveCallbacks = {};
    this.deferredLeaveRemovalCallbacks = [];
    this.keysToEnter = [];
    this.keysToLeave = [];
    this.cancel = null;

    this.performEnter = this.performEnter.bind(this);
    this.performLeave = this.performLeave.bind(this);
  }

  componentDidMount() {
    this.currentlyEnteringOrEnteredKeys = {};
    this.currentlyEnteringKeys = {};
    this.currentlyEnteringPromises = {};
    this.currentlyLeavingKeys = {};
    this.currentlyLeavingPromises = {};
    this.pendingEnterCallbacks = {};
    this.pendingLeaveCallbacks = {};
    this.deferredLeaveRemovalCallbacks = [];
    this.keysToEnter = [];
    this.keysToLeave = [];
    this.cancel = null;

    const initialChildMapping = this.state.children;

    for (const key of _.keys(initialChildMapping)) {
      if (initialChildMapping[key]) {
        this.performAppear(key);
      }
    }
  }

  UNSAFE_componentWillReceiveProps(nextProps) {
    const nextChildMapping = getChildMapping(
      nextProps.children,
    );
    const prevChildMapping = this.state.children;

    const mergedChildMapping = _.assign({},
      prevChildMapping,
      nextChildMapping,
    );
    this.setState({
      children: mergedChildMapping,
    });

    for (const key of _.keys(nextChildMapping)) {
      const hasPrev = prevChildMapping && prevChildMapping.hasOwnProperty(key);
      if (nextChildMapping[key] && (!hasPrev || this.currentlyLeavingKeys[key])) {
        this.keysToEnter.push(key);
      }
    }

    for (const key of _.keys(prevChildMapping)) {
      const hasNext = nextChildMapping && nextChildMapping.hasOwnProperty(key);
      if (prevChildMapping[key] && !hasNext) {
        this.keysToLeave.push(key);
      }
    }

    if (this.props.transitionMode === 'out-in') {
      this.keysToEnter = _.difference(this.keysToEnter, this.keysToLeave);
    }

    // If we want to someday check for reordering, we could do it here.
  }

  componentDidUpdate() {
    const keysToEnter = this.keysToEnter;
    const keysToLeave = this.keysToLeave;

    switch (this.props.transitionMode) {
      case 'out-in':
        this.keysToLeave = [];
        if (keysToLeave.length) {
          keysToLeave.forEach(this.performLeave);
        } else {
          this.keysToEnter = [];
          keysToEnter.forEach(this.performEnter);
        }
        break;
      case 'in-out':
        this.keysToEnter = [];
        this.keysToLeave = [];

        if (keysToEnter.length) {
          Promise.all(keysToEnter.map(this.performEnter))
            .then(() => {
              keysToLeave.forEach(this.performLeave);
            });
        } else {
          keysToLeave.forEach(this.performLeave);
        }
        break;
      default:
        this.keysToEnter = [];
        this.keysToLeave = [];
        keysToEnter.forEach(this.performEnter);
        keysToLeave.forEach(this.performLeave);
        break;
    }
  }

  performAppear(key) {
    this.currentlyEnteringOrEnteredKeys[key] = true;

    const component = this.refs[key];

    if (component.componentWillAppear) {
      component.componentWillAppear(
        this.handleDoneAppearing.bind(this, key)
      );
    } else {
      this.handleDoneAppearing(key);
    }
  }

  handleDoneAppearing(key) {
    const component = this.refs[key];
    if (component && component.componentDidAppear) {
      component.componentDidAppear();
    }

    const currentChildMapping = getChildMapping(
      this.props.children,
    );

    if (!currentChildMapping || !currentChildMapping.hasOwnProperty(key)) {
      // This was removed before it had fully appeared. Remove it.
      this.performLeave(key);
    }
  }

  performEnter(key) {
    if (this.currentlyEnteringKeys[key]) {
      return this.currentlyEnteringPromises[key];
    }

    this.cancelPendingLeave(key);

    const component = this.refs[key];

    if (!component) {
      return Promise.resolve();
    }

    this.currentlyEnteringOrEnteredKeys[key] = true;
    this.currentlyEnteringKeys[key] = true;

    const callback = this.handleDoneEntering.bind(this, key);
    this.pendingEnterCallbacks[key] = callback;

    const enterPromise = new Promise((resolve) => {
      if (component.componentWillEnter) {
        component.componentWillEnter(resolve);
      } else {
        resolve();
      }
    }).then(callback);

    this.currentlyEnteringPromises[key] = enterPromise;

    return enterPromise;
  }

  handleDoneEntering(key) {
    delete this.pendingEnterCallbacks[key];
    delete this.currentlyEnteringPromises[key];
    delete this.currentlyEnteringKeys[key];

    this.deferredLeaveRemovalCallbacks.forEach((fn) => { fn(); });
    this.deferredLeaveRemovalCallbacks = [];

    const component = this.refs[key];
    if (component && component.componentDidEnter) {
      component.componentDidEnter();
    }

    const currentChildMapping = getChildMapping(
      this.props.children
    );

    // eslint-disable-next-line max-len
    if (!currentChildMapping || (!currentChildMapping.hasOwnProperty(key) && this.currentlyEnteringOrEnteredKeys[key])) {
      // This was removed before it had fully entered. Remove it.

      if (this.props.transitionMode !== 'in-out') {
        this.performLeave(key);
      }
    }
  }

  performLeave(key) {
    if (this.currentlyLeavingKeys[key]) {
      // already leaving, let it finish
      return this.currentlyLeavingPromises[key];
    }

    this.cancelPendingEnter(key);

    const component = this.refs[key];

    if (!component) {
      return Promise.resolve();
    }

    this.currentlyLeavingKeys[key] = true;

    const callback = this.handleDoneLeaving.bind(this, key);
    this.pendingLeaveCallbacks[key] = callback;

    const leavePromise = new Promise((resolve) => {
      if (component.componentWillLeave) {
        component.componentWillLeave(resolve);
      } else {
        resolve();
      }
    })
      // Note that this is somewhat dangerous b/c it calls setState()
      // again, effectively mutating the component before all the work
      // is done.
      .then(callback);

    this.currentlyLeavingPromises[key] = leavePromise;
    return leavePromise;
  }

  handleDoneLeaving(key) {
    delete this.pendingLeaveCallbacks[key];
    delete this.currentlyLeavingKeys[key];
    delete this.currentlyLeavingPromises[key];

    const component = this.refs[key];

    if (component && component.componentDidLeave) {
      component.componentDidLeave();
    }


    const currentChildMapping = getChildMapping(
      this.props.children
    );

    const updateChildren = () => {
      this.setState((state) => {
        const newChildren = _.assign({}, state.children);
        delete newChildren[key];
        return { children: newChildren };
      });
    };

    if (currentChildMapping && currentChildMapping.hasOwnProperty(key)) {
      // This entered again before it fully left. Add it again.
      // but only perform enter if currently animating out, not already animated out
      if (this.props.transitionMode !== 'in-out') {
        this.performEnter(key);
      }
    } else {
      delete this.currentlyEnteringOrEnteredKeys[key];

      if (this.props.deferLeavingComponentRemoval && this.props.transitionMode !== 'in-out') {
        this.deferredLeaveRemovalCallbacks.push(updateChildren);
        this.forceUpdate();
      } else {
        updateChildren();
      }
    }
  }

  cancelPendingLeave(key) {
    if (this.pendingLeaveCallbacks[key]) {
      this.pendingLeaveCallbacks[key]();
      delete this.pendingLeaveCallbacks[key];
    }
  }

  cancelPendingEnter(key) {
    if (this.pendingEnterCallbacks[key]) {
      this.pendingEnterCallbacks[key]();
      delete this.pendingEnterCallbacks[key];
    }
  }

  cleanProps(props) {
    const cp = { ...props };
    delete cp.component;
    delete cp.transitionMode;
    delete cp.childFactory;
    delete cp.deferLeavingComponentRemoval;
    return cp;
  }

  render() {
    // TODO: we could get rid of the need for the wrapper node
    // by cloning a single child
    const childrenToRender = [];
    for (const key in this.state.children) {
      const child = this.state.children[key];
      if (child) {
        // You may need to apply reactive updates to a child as it is leaving.
        // The normal React way to do it won't work since the child will have
        // already been removed. In case you need this behavior you can provide
        // a childFactory function to wrap every child, even the ones that are
        // leaving.
        childrenToRender.push(React.cloneElement(
          this.props.childFactory(child),
          { ref: key, key }
        ));
      }
    }
    const Component = this.props.component;
    const componentsProps = this.cleanProps(_.assign({}, this.props));
    return (
      <Component {...componentsProps}>
        {childrenToRender}
      </Component>
    );
    // return React.createElement(
    //   this.props.component,
    //   this.cleanProps(_.assign({}, this.props)),
    //   childrenToRender,
    // );
  }
}

ReactTransitionGroupPlus.propTypes = {
  component: PropTypes.any,
  childFactory: PropTypes.func,
  transitionMode: PropTypes.oneOf(['in-out', 'out-in', 'simultaneous']),
  deferLeavingComponentRemoval: PropTypes.bool,
};

ReactTransitionGroupPlus.defaultProps = {
  component: 'span',
  childFactory: arg => arg,
  transitionMode: 'simultaneous',
  deferLeavingComponentRemoval: false,
};

export default ReactTransitionGroupPlus;
