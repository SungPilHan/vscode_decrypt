/*
 * Application Insights JavaScript SDK - Core, 2.8.3
 * Copyright (c) Microsoft and contributors. All rights reserved.
 */
export { MinChannelPriorty } from "./JavaScriptSDK.Interfaces/IChannelControls";
export { EventsDiscardedReason } from "./JavaScriptSDK.Enums/EventsDiscardedReason";
export { AppInsightsCore } from "./JavaScriptSDK/AppInsightsCore";
export { BaseCore } from "./JavaScriptSDK/BaseCore";
export { BaseTelemetryPlugin } from "./JavaScriptSDK/BaseTelemetryPlugin";
export { randomValue, random32, mwcRandomSeed, mwcRandom32, newId } from "./JavaScriptSDK/RandomHelper";
export { CoreUtils, EventHelper, Undefined, newGuid, perfNow, generateW3CId, disableCookies, canUseCookies, getCookie, setCookie, deleteCookie, _legacyCookieMgr } from "./JavaScriptSDK/CoreUtils";
export { isTypeof, isUndefined, isNullOrUndefined, hasOwnProperty, isObject, isFunction, normalizeJsName, objForEachKey, strEndsWith, strStartsWith, isDate, isArray, isError, isString, isNumber, isBoolean, toISOString, arrForEach, arrIndexOf, arrMap, arrReduce, strTrim, objKeys, objDefineAccessors, dateNow, getExceptionName, throwError, strContains, isSymbol, setValue, getSetValue, isNotTruthy, isTruthy, proxyAssign, proxyFunctions, proxyFunctionAs, createClassFromInterface, optimizeObject, isNotUndefined, isNotNullOrUndefined, objFreeze, objSeal, objExtend, objToString, deepFreeze } from "./JavaScriptSDK/HelperFuncs";
export { createEnumStyle, createEnumMap, createValueMap } from "./JavaScriptSDK.Enums/EnumHelperFuncs";
export { attachEvent, detachEvent, addEventHandler, addEventListeners, addPageUnloadEventListener, addPageHideEventListener, addPageShowEventListener, removeEventHandler, removeEventListeners, removePageUnloadEventListener, removePageHideEventListener, removePageShowEventListener, eventOn, eventOff, mergeEvtNamespace, __getRegisteredEvents } from "./JavaScriptSDK/EventHelpers";
export { getGlobalInst, hasWindow, getWindow, hasDocument, getDocument, getCrypto, getMsCrypto, hasNavigator, getNavigator, hasHistory, getHistory, getLocation, getPerformance, hasJSON, getJSON, isReactNative, getConsole, dumpObj, isIE, getIEVersion, isSafari, setEnableEnvMocks, isBeaconsSupported, isFetchSupported, useXDomainRequest, isXhrSupported } from "./JavaScriptSDK/EnvUtils";
export { getGlobal, objCreateFn as objCreate, strShimPrototype as strPrototype, strShimFunction as strFunction, strShimUndefined as strUndefined, strShimObject as strObject } from "@microsoft/applicationinsights-shims";
export { NotificationManager } from "./JavaScriptSDK/NotificationManager";
export { PerfEvent, PerfManager, doPerf, getGblPerfMgr, setGblPerfMgr } from "./JavaScriptSDK/PerfManager";
export { safeGetLogger, DiagnosticLogger, _InternalLogMessage, _throwInternal, _warnToConsole, _logInternalMessage } from "./JavaScriptSDK/DiagnosticLogger";
export { ProcessTelemetryContext, createProcessTelemetryContext
// Explicitly NOT exporting createProcessTelemetryUnloadContext() and createProcessTelemetryUpdateContext() as these should only be created internally
 } from "./JavaScriptSDK/ProcessTelemetryContext";
export { initializePlugins, sortPlugins, unloadComponents } from "./JavaScriptSDK/TelemetryHelpers";
export { _InternalMessageId, LoggingSeverity } from "./JavaScriptSDK.Enums/LoggingEnums";
export { InstrumentProto, InstrumentProtos, InstrumentFunc, InstrumentFuncs, InstrumentEvent } from "./JavaScriptSDK/InstrumentHooks";
export { createCookieMgr, safeGetCookieMgr, uaDisallowsSameSiteNone, areCookiesSupported } from "./JavaScriptSDK/CookieMgr";
export { getDebugListener, getDebugExt } from "./JavaScriptSDK/DbgExtensionUtils";
export { createUniqueNamespace } from "./JavaScriptSDK/DataCacheHelper";
export { createUnloadHandlerContainer } from "./JavaScriptSDK/UnloadHandlerContainer";//# sourceMappingURL=https://ticino.blob.core.windows.net/sourcemaps/695af097c7bd098fbf017ce3ac85e09bbc5dda06/node_modules/@microsoft/applicationinsights-core-js/dist-esm/applicationinsights-core-js.js.map