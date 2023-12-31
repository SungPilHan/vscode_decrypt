/*
 * 1DS JS SDK Core, 3.2.2
 * Copyright (c) Microsoft and contributors. All rights reserved.
 * (Microsoft Internal Only)
 */
/**
 * Index.ts
 * @author Abhilash Panwar (abpanwar)
 * @copyright Microsoft 2018
 * File to export public classes, interfaces and enums.
 */
import { ValueKind, EventLatency, EventPersistence, TraceLevel, EventPropertyType, _ExtendedInternalMessageId } from "./Enums";
import AppInsightsCore from "./AppInsightsCore";
import BaseCore from "./BaseCore";
import ESPromise from "./ESPromise";
import ESPromiseScheduler from "./ESPromiseScheduler";
import { ValueSanitizer } from "./ValueSanitizer";
export { ValueKind, EventLatency, EventPersistence, TraceLevel, AppInsightsCore, BaseCore, _ExtendedInternalMessageId, EventPropertyType, ESPromise, ESPromiseScheduler, ValueSanitizer };
export { NotificationManager, BaseTelemetryPlugin, ProcessTelemetryContext, MinChannelPriorty, EventsDiscardedReason, DiagnosticLogger, LoggingSeverity, PerfEvent, PerfManager, doPerf, EventHelper, AppInsightsCore as InternalAppInsightsCore, BaseCore as InternalBaseCore, _InternalLogMessage, _InternalMessageId, createEnumStyle, _throwInternal, // _warnToConsole, _logInternalMessage
// The HelperFuncs functions
isTypeof, isUndefined, isNullOrUndefined, hasOwnProperty, isObject, isFunction, attachEvent, detachEvent, normalizeJsName, objForEachKey, strStartsWith, strEndsWith, strContains, strTrim, isDate, isArray, isError, isString, isNumber, isBoolean, toISOString, arrForEach, arrIndexOf, arrMap, arrReduce, objKeys, objDefineAccessors, dateNow, getExceptionName, throwError, setValue, getSetValue, isNotTruthy, isTruthy, proxyAssign, proxyFunctions, proxyFunctionAs, optimizeObject, objCreate, addEventHandler, newGuid, perfNow, newId, generateW3CId, safeGetLogger, objFreeze, objSeal, 
// EnvUtils
getGlobal, getGlobalInst, hasWindow, getWindow, hasDocument, getDocument, getCrypto, getMsCrypto, hasNavigator, getNavigator, hasHistory, getHistory, getLocation, getPerformance, hasJSON, getJSON, isReactNative, getConsole, dumpObj, isIE, getIEVersion, strUndefined, strObject, strPrototype, strFunction, setEnableEnvMocks, strUndefined as Undefined, 
// Random
randomValue, random32, uaDisallowsSameSiteNone as disallowsSameSiteNone, areCookiesSupported, areCookiesSupported as cookieAvailable, createCookieMgr, safeGetCookieMgr, 
// Aliases
toISOString as getISOString, isBeaconsSupported, isFetchSupported, isXhrSupported, useXDomainRequest, addPageHideEventListener, addPageShowEventListener, addEventListeners, addPageUnloadEventListener, removeEventHandler, removeEventListeners, removePageUnloadEventListener, removePageHideEventListener, removePageShowEventListener, eventOn, eventOff, mergeEvtNamespace, createUniqueNamespace, __getRegisteredEvents, createProcessTelemetryContext, createUnloadHandlerContainer } from "@microsoft/applicationinsights-core-js";
export { isValueAssigned, isLatency, isUint8ArrayAvailable, getTenantId, sanitizeProperty, Version, FullVersionString, getCommonSchemaMetaData, getCookie, setCookie, deleteCookie, getCookieValue, extend, createGuid, isDocumentObjectAvailable, isWindowObjectAvailable, setProcessTelemetryTimings, getTime, isArrayValid, isValueKind, getFieldValueType, CoreUtils, disableCookies, // exporting the overridden version for tree-shaking
Utils, // Replacement for import * as Utils from "./Utils";
isChromium, // Replace with ai-core version once published in ai-core
openXhr } from "./Utils";//# sourceMappingURL=https://ticino.blob.core.windows.net/sourcemaps/695af097c7bd098fbf017ce3ac85e09bbc5dda06/node_modules/@microsoft/1ds-core-js/dist-esm/src/Index.js.map