/*
 * NodeJS compatible code for YourLoops
 *
 * Base on browserify code: MIT License, Copyright (c) 2010 James Halliday
 */

/* eslint-disable prefer-rest-params */

function runTimeout(fun) {
  return setTimeout(fun, 0);
}
function runClearTimeout(marker) {
  return clearTimeout(marker);
}

/** v8 likes predictible objects */
class Item {
  constructor(fun, array) {
    this.fun = fun;
    this.array = array;
  }

  run() {
    this.fun.apply(null, this.array);
  }
}

// Uncomment to activate bows login during tests
// localStorage.setItem('debug', 'true');

// shim for using process in browser
if (typeof window.process === "undefined") {
  let queue = [];
  let draining = false;
  let currentQueue = null;
  let queueIndex = -1;

  const cleanUpNextTick = () => {
    if (!draining || !currentQueue) {
      return;
    }
    draining = false;
    if (currentQueue.length) {
      queue = currentQueue.concat(queue);
    } else {
      queueIndex = -1;
    }
    if (queue.length) {
      drainQueue();
    }
  };

  const drainQueue = () => {
    if (draining) {
      return;
    }
    const timeout = runTimeout(cleanUpNextTick);
    draining = true;

    let len = queue.length;
    while (len) {
      currentQueue = queue;
      queue = [];
      while (++queueIndex < len) {
        if (currentQueue) {
          currentQueue[queueIndex].run();
        }
      }
      queueIndex = -1;
      len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
  };

  const noop = () => {};
  const process = {
    title: "browser",
    browser: true,
    env: {},
    argv: [],
    version: "",
    versions: {},
    nextTick: function (fun) {
      const args = new Array(arguments.length - 1);
      if (arguments.length > 1) {
        for (let i = 1; i < arguments.length; i++) {
          args[i - 1] = arguments[i];
        }
      }
      queue.push(new Item(fun, args));
      if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
      }
    },
    addListener: noop,
    off: noop,
    on: noop,
    once: noop,
    removeListener: noop,
    removeAllListeners: noop,
    emit: noop,
    prependListener: noop,
    prependOnceListener: noop,
    listeners: () => [],
    binding: () => { throw new Error("process.binding is not supported"); },
    cwd: () => "/",
    chdir: () => { throw new Error("process.chdir is not supported"); },
    umask: () => 0,
  };

  // @ts-ignore
  window.process = process;
}
