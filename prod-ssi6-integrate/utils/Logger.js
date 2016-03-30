/********************************************************
*                                                        *
*   © Microsoft. All rights reserved.                    *
*                                                        *
*********************************************************/
'use strict';
define(["require", "exports"], function (require, exports) {
    /**
    * Handles logging messages in the console.
    */
    var Logger = (function () {
        function Logger() {
        }
        /**
        * Logs a verbose message in the console
        * @param {string} message to be logged in the console
        */
        Logger.verbose = function (message) {
            Logger.log(message, 0 /* verbose */);
        };
        /**
        * Logs an info message in the console
        * @param {string} message to be logged in the console
        */
        Logger.info = function (message) {
            Logger.log(message, 2 /* info */);
        };
        /**
        * Logs a warning message in the console
        * @param {string} message to be logged in the console
        */
        Logger.warn = function (message) {
            Logger.log(message, 3 /* warning */);
        };
        /**
        * Logs an error message in the console
        * @param {string} message to be logged in the console
        */
        Logger.error = function (message) {
            Logger.log(message, 4 /* error */);
        };
        /**
        * Logs a message in the console with the given level
        * @param {string} message to be logged in the console
        * @param {LogLevel} level to use when logging the message
        */
        Logger.log = function (message, level) {
            if (level === void 0) { level = 1 /* log */; }
            // Prepend a timestamp to the message
            var timestamp = (new Date()).toISOString();
            message = "[" + Logger.frameId + "] " + timestamp + " " + message;
            switch (level) {
                case 0 /* verbose */:
                    // Log with a lighter tone to reduce visual noise.
                    Logger.logWithColor(message, '#aaaaaa');
                    break;
                case 1 /* log */:
                    console.log(message);
                    break;
                case 2 /* info */:
                    if (console.info) {
                        console.info(message);
                    }
                    else {
                        console.log("INFO - " + message);
                    }
                    break;
                case 3 /* warning */:
                    if (console.warn) {
                        console.warn(message);
                    }
                    else {
                        console.log("WARNING - " + message);
                    }
                    break;
                case 4 /* error */:
                    if (console.error) {
                        console.error(message);
                    }
                    else {
                        console.log("ERROR - " + message);
                    }
                    break;
                default:
                    console.log(message);
            }
        };
        /**
        * Sets up a logger for Adal.js to get their traces in the console.
        */
        Logger.setupAdalLogger = function () {
            Logger.log('Setting up logging for ADAL');
            window.Logging = {
                level: 3,
                log: function (msg) {
                    // Use a color to differentiate these external traces.
                    Logger.logWithColor(msg, '#6673bd');
                }
            };
        };
        Logger.logWithColor = function (message, color) {
            // Log with a specific color in the console for browsers that support it. IE and Edge don't, a simple
            // detection of features for those help with this but it's not critical.
            // If the detection fails, it would just add an extra string to the end of the message.
            if ("ActiveXObject" in window || !!window.MSStream) {
                // IE || Edge. No colors
                console.log(message);
            }
            else {
                // Log with a lighter gray color to reduce visual noise
                console.log("%c" + message, "color: " + color);
            }
        };
        Logger.getFrameId = function () {
            var id = 0;
            var frame = window;
            var parent = window.parent;
            while (frame !== parent) {
                id++;
                frame = parent;
                parent = parent.parent;
            }
            return id;
        };
        Logger.frameId = Logger.getFrameId();
        return Logger;
    })();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Logger;
});
//# sourceMappingURL=Logger.js.map