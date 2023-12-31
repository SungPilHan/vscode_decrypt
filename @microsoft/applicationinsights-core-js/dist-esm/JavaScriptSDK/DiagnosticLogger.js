/*
 * Application Insights JavaScript SDK - Core, 2.8.3
 * Copyright (c) Microsoft and contributors. All rights reserved.
 */


"use strict";
import { hasJSON, getJSON, getConsole, dumpObj } from "./EnvUtils";
import dynamicProto from "@microsoft/dynamicproto-js";
import { isFunction, isNullOrUndefined, isUndefined } from "./HelperFuncs";
import { getDebugExt } from "./DbgExtensionUtils";
import { strEmpty } from "./InternalConstants";
/**
 * For user non actionable traces use AI Internal prefix.
 */
var AiNonUserActionablePrefix = "AI (Internal): ";
/**
 * Prefix of the traces in portal.
 */
var AiUserActionablePrefix = "AI: ";
/**
 *  Session storage key for the prefix for the key indicating message type already logged
 */
var AIInternalMessagePrefix = "AITR_";
var strErrorToConsole = "errorToConsole";
var strWarnToConsole = "warnToConsole";
function _sanitizeDiagnosticText(text) {
    if (text) {
        return "\"" + text.replace(/\"/g, strEmpty) + "\"";
    }
    return strEmpty;
}
function _logToConsole(func, message) {
    var theConsole = getConsole();
    if (!!theConsole) {
        var logFunc = "log";
        if (theConsole[func]) {
            logFunc = func;
        }
        if (isFunction(theConsole[logFunc])) {
            theConsole[logFunc](message);
        }
    }
}
var _InternalLogMessage = /** @class */ (function () {
    function _InternalLogMessage(msgId, msg, isUserAct, properties) {
        if (isUserAct === void 0) { isUserAct = false; }
        var _self = this;
        _self.messageId = msgId;
        _self.message =
            (isUserAct ? AiUserActionablePrefix : AiNonUserActionablePrefix) +
                msgId;
        var strProps = strEmpty;
        if (hasJSON()) {
            strProps = getJSON().stringify(properties);
        }
        var diagnosticText = (msg ? " message:" + _sanitizeDiagnosticText(msg) : strEmpty) +
            (properties ? " props:" + _sanitizeDiagnosticText(strProps) : strEmpty);
        _self.message += diagnosticText;
    }
    _InternalLogMessage.dataType = "MessageData";
    return _InternalLogMessage;
}());
export { _InternalLogMessage };
export function safeGetLogger(core, config) {
    return (core || {}).logger || new DiagnosticLogger(config);
}
var DiagnosticLogger = /** @class */ (function () {
    function DiagnosticLogger(config) {
        this.identifier = "DiagnosticLogger";
        /**
         * The internal logging queue
         */
        this.queue = [];
        /**
         * Count of internal messages sent
         */
        var _messageCount = 0;
        /**
         * Holds information about what message types were already logged to console or sent to server.
         */
        var _messageLogged = {};
        dynamicProto(DiagnosticLogger, this, function (_self) {
            if (isNullOrUndefined(config)) {
                config = {};
            }
            _self.consoleLoggingLevel = function () { return _getConfigValue("loggingLevelConsole", 0); };
            _self.telemetryLoggingLevel = function () { return _getConfigValue("loggingLevelTelemetry", 1); };
            _self.maxInternalMessageLimit = function () { return _getConfigValue("maxMessageLimit", 25); };
            _self.enableDebugExceptions = function () { return _getConfigValue("enableDebugExceptions", false); };
            /**
             * This method will throw exceptions in debug mode or attempt to log the error as a console warning.
             * @param severity {LoggingSeverity} - The severity of the log message
             * @param message {_InternalLogMessage} - The log message.
             */
            _self.throwInternal = function (severity, msgId, msg, properties, isUserAct) {
                if (isUserAct === void 0) { isUserAct = false; }
                var message = new _InternalLogMessage(msgId, msg, isUserAct, properties);
                if (_self.enableDebugExceptions()) {
                    throw dumpObj(message);
                }
                else {
                    // Get the logging function and fallback to warnToConsole of for some reason errorToConsole doesn't exist
                    var logFunc = severity === 1 /* CRITICAL */ ? strErrorToConsole : strWarnToConsole;
                    if (!isUndefined(message.message)) {
                        var logLevel = _self.consoleLoggingLevel();
                        if (isUserAct) {
                            // check if this message type was already logged to console for this page view and if so, don't log it again
                            var messageKey = +message.messageId;
                            if (!_messageLogged[messageKey] && logLevel >= severity) {
                                _self[logFunc](message.message);
                                _messageLogged[messageKey] = true;
                            }
                        }
                        else {
                            // Only log traces if the console Logging Level is >= the throwInternal severity level
                            if (logLevel >= severity) {
                                _self[logFunc](message.message);
                            }
                        }
                        _self.logInternalMessage(severity, message);
                    }
                    else {
                        _debugExtMsg("throw" + (severity === 1 /* CRITICAL */ ? "Critical" : "Warning"), message);
                    }
                }
            };
            /**
             * This will write a warning to the console if possible
             * @param message {string} - The warning message
             */
            _self.warnToConsole = function (message) {
                _logToConsole("warn", message);
                _debugExtMsg("warning", message);
            };
            /**
             * This will write an error to the console if possible
             * @param message {string} - The error message
             */
            _self.errorToConsole = function (message) {
                _logToConsole("error", message);
                _debugExtMsg("error", message);
            };
            /**
             * Resets the internal message count
             */
            _self.resetInternalMessageCount = function () {
                _messageCount = 0;
                _messageLogged = {};
            };
            /**
             * Logs a message to the internal queue.
             * @param severity {LoggingSeverity} - The severity of the log message
             * @param message {_InternalLogMessage} - The message to log.
             */
            _self.logInternalMessage = function (severity, message) {
                if (_areInternalMessagesThrottled()) {
                    return;
                }
                // check if this message type was already logged for this session and if so, don't log it again
                var logMessage = true;
                var messageKey = AIInternalMessagePrefix + message.messageId;
                // if the session storage is not available, limit to only one message type per page view
                if (_messageLogged[messageKey]) {
                    logMessage = false;
                }
                else {
                    _messageLogged[messageKey] = true;
                }
                if (logMessage) {
                    // Push the event in the internal queue
                    if (severity <= _self.telemetryLoggingLevel()) {
                        _self.queue.push(message);
                        _messageCount++;
                        _debugExtMsg((severity === 1 /* CRITICAL */ ? "error" : "warn"), message);
                    }
                    // When throttle limit reached, send a special event
                    if (_messageCount === _self.maxInternalMessageLimit()) {
                        var throttleLimitMessage = "Internal events throttle limit per PageView reached for this app.";
                        var throttleMessage = new _InternalLogMessage(23 /* MessageLimitPerPVExceeded */, throttleLimitMessage, false);
                        _self.queue.push(throttleMessage);
                        if (severity === 1 /* CRITICAL */) {
                            _self.errorToConsole(throttleLimitMessage);
                        }
                        else {
                            _self.warnToConsole(throttleLimitMessage);
                        }
                    }
                }
            };
            function _getConfigValue(name, defValue) {
                var value = config[name];
                if (!isNullOrUndefined(value)) {
                    return value;
                }
                return defValue;
            }
            function _areInternalMessagesThrottled() {
                return _messageCount >= _self.maxInternalMessageLimit();
            }
            function _debugExtMsg(name, data) {
                var dbgExt = getDebugExt(config);
                if (dbgExt && dbgExt.diagLog) {
                    dbgExt.diagLog(name, data);
                }
            }
        });
    }
// Removed Stub for DiagnosticLogger.prototype.enableDebugExceptions.
// Removed Stub for DiagnosticLogger.prototype.consoleLoggingLevel.
// Removed Stub for DiagnosticLogger.prototype.telemetryLoggingLevel.
// Removed Stub for DiagnosticLogger.prototype.maxInternalMessageLimit.
// Removed Stub for DiagnosticLogger.prototype.throwInternal.
// Removed Stub for DiagnosticLogger.prototype.warnToConsole.
// Removed Stub for DiagnosticLogger.prototype.errorToConsole.
// Removed Stub for DiagnosticLogger.prototype.resetInternalMessageCount.
// Removed Stub for DiagnosticLogger.prototype.logInternalMessage.
    return DiagnosticLogger;
}());
export { DiagnosticLogger };
function _getLogger(logger) {
    return (logger || new DiagnosticLogger());
}
/**
 * This is a helper method which will call throwInternal on the passed logger, will throw exceptions in
 * debug mode or attempt to log the error as a console warning. This helper is provided mostly to better
 * support minification as logger.throwInternal() will not compress the publish "throwInternal" used throughout
 * the code.
 * @param logger - The Diagnostic Logger instance to use.
 * @param severity {LoggingSeverity} - The severity of the log message
 * @param message {_InternalLogMessage} - The log message.
 */
export function _throwInternal(logger, severity, msgId, msg, properties, isUserAct) {
    if (isUserAct === void 0) { isUserAct = false; }
    (logger || new DiagnosticLogger()).throwInternal(severity, msgId, msg, properties, isUserAct);
}
/**
 * This is a helper method which will call warnToConsole on the passed logger with the provided message.
 * @param logger - The Diagnostic Logger instance to use.
 * @param message {_InternalLogMessage} - The log message.
 */
export function _warnToConsole(logger, message) {
    _getLogger(logger).warnToConsole(message);
}
/**
 * Logs a message to the internal queue.
 * @param logger - The Diagnostic Logger instance to use.
 * @param severity {LoggingSeverity} - The severity of the log message
 * @param message {_InternalLogMessage} - The message to log.
 */
export function _logInternalMessage(logger, severity, message) {
    _getLogger(logger).logInternalMessage(severity, message);
}//# sourceMappingURL=https://ticino.blob.core.windows.net/sourcemaps/695af097c7bd098fbf017ce3ac85e09bbc5dda06/node_modules/@microsoft/applicationinsights-core-js/dist-esm/JavaScriptSDK/DiagnosticLogger.js.map