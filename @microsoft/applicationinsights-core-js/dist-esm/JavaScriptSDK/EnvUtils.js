/*
 * Application Insights JavaScript SDK - Core, 2.8.3
 * Copyright (c) Microsoft and contributors. All rights reserved.
 */


"use strict";
import { getGlobal, strShimUndefined, strShimObject, strShimPrototype } from "@microsoft/applicationinsights-shims";
import { strEmpty } from "./InternalConstants";
import { isString, isUndefined, strContains } from "./HelperFuncs";
/**
 * This file exists to hold environment utilities that are required to check and
 * validate the current operating environment. Unless otherwise required, please
 * only use defined methods (functions) in this class so that users of these
 * functions/properties only need to include those that are used within their own modules.
 */
var strWindow = "window";
var strDocument = "document";
var strDocumentMode = "documentMode";
var strNavigator = "navigator";
var strHistory = "history";
var strLocation = "location";
var strConsole = "console";
var strPerformance = "performance";
var strJSON = "JSON";
var strCrypto = "crypto";
var strMsCrypto = "msCrypto";
var strReactNative = "ReactNative";
var strMsie = "msie";
var strTrident = "trident/";
var strXMLHttpRequest = "XMLHttpRequest";
var _isTrident = null;
var _navUserAgentCheck = null;
var _enableMocks = false;
var _useXDomainRequest = null;
var _beaconsSupported = null;
function _hasProperty(theClass, property) {
    var supported = false;
    if (theClass) {
        try {
            supported = property in theClass;
            if (!supported) {
                var proto = theClass[strShimPrototype];
                if (proto) {
                    supported = property in proto;
                }
            }
        }
        catch (e) {
            // Do Nothing
        }
        if (!supported) {
            try {
                var tmp = new theClass();
                supported = !isUndefined(tmp[property]);
            }
            catch (e) {
                // Do Nothing
            }
        }
    }
    return supported;
}
/**
 * Enable the lookup of test mock objects if requested
 * @param enabled
 */
export function setEnableEnvMocks(enabled) {
    _enableMocks = enabled;
}
/**
 * Return the named global object if available, will return null if the object is not available.
 * @param name The globally named object
 */
export function getGlobalInst(name) {
    var gbl = getGlobal();
    if (gbl && gbl[name]) {
        return gbl[name];
    }
    // Test workaround, for environments where <global>.window (when global == window) doesn't return the base window
    if (name === strWindow && hasWindow()) {
        // tslint:disable-next-line: no-angle-bracket-type-assertion
        return window;
    }
    return null;
}
/**
 * Checks if window object is available, this is required as we support the API running without a
 * window /document (eg. Node server, electron webworkers) and if we attempt to assign a window
 * object to a local variable or pass as an argument an "Uncaught ReferenceError: window is not defined"
 * exception will be thrown.
 * Defined as a function to support lazy / late binding environments.
 */
export function hasWindow() {
    return Boolean(typeof window === strShimObject && window);
}
/**
 * Returns the global window object if it is present otherwise null.
 * This helper is used to access the window object without causing an exception
 * "Uncaught ReferenceError: window is not defined"
 */
export function getWindow() {
    if (hasWindow()) {
        return window;
    }
    // Return the global instance or null
    return getGlobalInst(strWindow);
}
/**
 * Checks if document object is available, this is required as we support the API running without a
 * window /document (eg. Node server, electron webworkers) and if we attempt to assign a document
 * object to a local variable or pass as an argument an "Uncaught ReferenceError: document is not defined"
 * exception will be thrown.
 * Defined as a function to support lazy / late binding environments.
 */
export function hasDocument() {
    return Boolean(typeof document === strShimObject && document);
}
/**
 * Returns the global document object if it is present otherwise null.
 * This helper is used to access the document object without causing an exception
 * "Uncaught ReferenceError: document is not defined"
 */
export function getDocument() {
    if (hasDocument()) {
        return document;
    }
    return getGlobalInst(strDocument);
}
/**
 * Checks if navigator object is available, this is required as we support the API running without a
 * window /document (eg. Node server, electron webworkers) and if we attempt to assign a navigator
 * object to a local variable or pass as an argument an "Uncaught ReferenceError: navigator is not defined"
 * exception will be thrown.
 * Defined as a function to support lazy / late binding environments.
 */
export function hasNavigator() {
    return Boolean(typeof navigator === strShimObject && navigator);
}
/**
 * Returns the global navigator object if it is present otherwise null.
 * This helper is used to access the navigator object without causing an exception
 * "Uncaught ReferenceError: navigator is not defined"
 */
export function getNavigator() {
    if (hasNavigator()) {
        return navigator;
    }
    return getGlobalInst(strNavigator);
}
/**
 * Checks if history object is available, this is required as we support the API running without a
 * window /document (eg. Node server, electron webworkers) and if we attempt to assign a history
 * object to a local variable or pass as an argument an "Uncaught ReferenceError: history is not defined"
 * exception will be thrown.
 * Defined as a function to support lazy / late binding environments.
 */
export function hasHistory() {
    return Boolean(typeof history === strShimObject && history);
}
/**
 * Returns the global history object if it is present otherwise null.
 * This helper is used to access the history object without causing an exception
 * "Uncaught ReferenceError: history is not defined"
 */
export function getHistory() {
    if (hasHistory()) {
        return history;
    }
    return getGlobalInst(strHistory);
}
/**
 * Returns the global location object if it is present otherwise null.
 * This helper is used to access the location object without causing an exception
 * "Uncaught ReferenceError: location is not defined"
 */
export function getLocation(checkForMock) {
    if (checkForMock && _enableMocks) {
        var mockLocation = getGlobalInst("__mockLocation");
        if (mockLocation) {
            return mockLocation;
        }
    }
    if (typeof location === strShimObject && location) {
        return location;
    }
    return getGlobalInst(strLocation);
}
/**
 * Returns the global console object
 */
export function getConsole() {
    if (typeof console !== strShimUndefined) {
        return console;
    }
    return getGlobalInst(strConsole);
}
/**
 * Returns the performance object if it is present otherwise null.
 * This helper is used to access the performance object from the current
 * global instance which could be window or globalThis for a web worker
 */
export function getPerformance() {
    return getGlobalInst(strPerformance);
}
/**
 * Checks if JSON object is available, this is required as we support the API running without a
 * window /document (eg. Node server, electron webworkers) and if we attempt to assign a history
 * object to a local variable or pass as an argument an "Uncaught ReferenceError: JSON is not defined"
 * exception will be thrown.
 * Defined as a function to support lazy / late binding environments.
 */
export function hasJSON() {
    return Boolean((typeof JSON === strShimObject && JSON) || getGlobalInst(strJSON) !== null);
}
/**
 * Returns the global JSON object if it is present otherwise null.
 * This helper is used to access the JSON object without causing an exception
 * "Uncaught ReferenceError: JSON is not defined"
 */
export function getJSON() {
    if (hasJSON()) {
        return JSON || getGlobalInst(strJSON);
    }
    return null;
}
/**
 * Returns the crypto object if it is present otherwise null.
 * This helper is used to access the crypto object from the current
 * global instance which could be window or globalThis for a web worker
 */
export function getCrypto() {
    return getGlobalInst(strCrypto);
}
/**
 * Returns the crypto object if it is present otherwise null.
 * This helper is used to access the crypto object from the current
 * global instance which could be window or globalThis for a web worker
 */
export function getMsCrypto() {
    return getGlobalInst(strMsCrypto);
}
/**
 * Returns whether the environment is reporting that we are running in a React Native Environment
 */
export function isReactNative() {
    // If running in React Native, navigator.product will be populated
    var nav = getNavigator();
    if (nav && nav.product) {
        return nav.product === strReactNative;
    }
    return false;
}
/**
 * Identifies whether the current environment appears to be IE
 */
export function isIE() {
    var nav = getNavigator();
    if (nav && (nav.userAgent !== _navUserAgentCheck || _isTrident === null)) {
        // Added to support test mocking of the user agent
        _navUserAgentCheck = nav.userAgent;
        var userAgent = (_navUserAgentCheck || strEmpty).toLowerCase();
        _isTrident = (strContains(userAgent, strMsie) || strContains(userAgent, strTrident));
    }
    return _isTrident;
}
/**
 * Gets IE version returning the document emulation mode if we are running on IE, or null otherwise
 */
export function getIEVersion(userAgentStr) {
    if (userAgentStr === void 0) { userAgentStr = null; }
    if (!userAgentStr) {
        var navigator_1 = getNavigator() || {};
        userAgentStr = navigator_1 ? (navigator_1.userAgent || strEmpty).toLowerCase() : strEmpty;
    }
    var ua = (userAgentStr || strEmpty).toLowerCase();
    // Also check for documentMode in case X-UA-Compatible meta tag was included in HTML.
    if (strContains(ua, strMsie)) {
        var doc = getDocument() || {};
        return Math.max(parseInt(ua.split(strMsie)[1]), (doc[strDocumentMode] || 0));
    }
    else if (strContains(ua, strTrident)) {
        var tridentVer = parseInt(ua.split(strTrident)[1]);
        if (tridentVer) {
            return tridentVer + 4;
        }
    }
    return null;
}
/**
 * Returns string representation of an object suitable for diagnostics logging.
 */
export function dumpObj(object) {
    var objectTypeDump = Object[strShimPrototype].toString.call(object);
    var propertyValueDump = strEmpty;
    if (objectTypeDump === "[object Error]") {
        propertyValueDump = "{ stack: '" + object.stack + "', message: '" + object.message + "', name: '" + object.name + "'";
    }
    else if (hasJSON()) {
        propertyValueDump = getJSON().stringify(object);
    }
    return objectTypeDump + propertyValueDump;
}
export function isSafari(userAgentStr) {
    if (!userAgentStr || !isString(userAgentStr)) {
        var navigator_2 = getNavigator() || {};
        userAgentStr = navigator_2 ? (navigator_2.userAgent || strEmpty).toLowerCase() : strEmpty;
    }
    var ua = (userAgentStr || strEmpty).toLowerCase();
    return (ua.indexOf("safari") >= 0);
}
/**
 * Checks if HTML5 Beacons are supported in the current environment.
 * @returns True if supported, false otherwise.
 */
export function isBeaconsSupported() {
    if (_beaconsSupported === null) {
        _beaconsSupported = hasNavigator() && Boolean(getNavigator().sendBeacon);
    }
    return _beaconsSupported;
}
/**
 * Checks if the Fetch API is supported in the current environment.
 * @param withKeepAlive - [Optional] If True, check if fetch is available and it supports the keepalive feature, otherwise only check if fetch is supported
 * @returns True if supported, otherwise false
 */
export function isFetchSupported(withKeepAlive) {
    var isSupported = false;
    try {
        isSupported = !!getGlobalInst("fetch");
        var request = getGlobalInst("Request");
        if (isSupported && withKeepAlive && request) {
            isSupported = _hasProperty(request, "keepalive");
        }
    }
    catch (e) {
        // Just Swallow any failure during availability checks
    }
    return isSupported;
}
export function useXDomainRequest() {
    if (_useXDomainRequest === null) {
        _useXDomainRequest = (typeof XDomainRequest !== strShimUndefined);
        if (_useXDomainRequest && isXhrSupported()) {
            _useXDomainRequest = _useXDomainRequest && !_hasProperty(getGlobalInst(strXMLHttpRequest), "withCredentials");
        }
    }
    return _useXDomainRequest;
}
/**
 * Checks if XMLHttpRequest is supported
 * @returns True if supported, otherwise false
 */
export function isXhrSupported() {
    var isSupported = false;
    try {
        var xmlHttpRequest = getGlobalInst(strXMLHttpRequest);
        isSupported = !!xmlHttpRequest;
    }
    catch (e) {
        // Just Swallow any failure during availability checks
    }
    return isSupported;
}//# sourceMappingURL=https://ticino.blob.core.windows.net/sourcemaps/695af097c7bd098fbf017ce3ac85e09bbc5dda06/node_modules/@microsoft/applicationinsights-core-js/dist-esm/JavaScriptSDK/EnvUtils.js.map