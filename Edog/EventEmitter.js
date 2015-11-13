// an implementation of NodeJS EventEmitter

(function () {
    'use strict';
    var exports = this;

    function EventEmitter() {
        var handlers = {};
        var syncHandlers = {};

        // add async event listeners
        function addListener(event, listener) {
            if (!handlers[event])
                handlers[event] = [];

            handlers[event].push(listener);
        }

        // add sync event listeners
        function addListenerSync(event, listener) {
            if (!syncHandlers[event])
                syncHandlers[event] = [];
            syncHandlers[event].push(listener);
        }

        // an alias of addListener
        function on(event, listener) {
            addListener(event, listener);
        }

        // remove an async listener from the listener collection
        function removeListener(event, listener) {
            if (!handlers[event])
                return;

            var index = handlers[event].indexOf(listener);
            if (index != -1)
                handlers[event].splice(index, 1);
        }

        // remove an async listener from the listener collection
        function removeListenerSync(event, listener) {
            if (!syncHandlers[event])
                return;

            var index = syncHandlers[event].indexOf(listener);
            if (index != -1)
                syncHandlers[event].splice(index, 1);
        }

        // calls the sync callback in the same system tick, and calls the async callback in the 
        // next system tick.
        function emit(event, args, callback) {
            var callbacks = handlers[event];
            var syncCallbacks = syncHandlers[event];

            if (callback) {
                callback.call(null, args);
            }

            if (syncCallbacks) {
                syncCallbacks.forEach(function (cb) {
                    cb.call(null, args);
                });
            }

            if (callbacks) {
                callbacks.forEach(function (cb) {
                    setTimeout(function () {
                        cb.call(null, args);
                    }, 0);
                });
            }
        }

        return {
            addListener: addListener,
            on: on,
            addListenerSync: addListenerSync,
            removeListener: removeListener,
            off: removeListener,
            emit: emit
        }
    }

    // Expose the class either via AMD, CommonJS or the global object
    if (typeof define === 'function' && define.amd) {
        define(function () {
            return EventEmitter;
        });
    }
    else if (typeof module === 'object' && module.exports) {
        module.exports = EventEmitter;
    }
    else {
        exports.EventEmitter = EventEmitter;
    }
}.call(this));

