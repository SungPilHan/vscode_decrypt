/*
 * 1DS JS SDK Core, 3.2.2
 * Copyright (c) Microsoft and contributors. All rights reserved.
 * (Microsoft Internal Only)
 */
/**
 * Enums.ts
 * @author Abhilash Panwar (abpanwar)
 * @copyright Microsoft 2018
 * File containing the enums as constants.
 */
import { __assignFn as __assign } from "@microsoft/applicationinsights-shims";
import { _InternalMessageId, createEnumStyle, objFreeze } from "@microsoft/applicationinsights-core-js";
/**
 * The ValueKind contains a set of values that specify value kind of the property.
 * Either PII (Personal Identifiable Information) or customer content.
 */
export var ValueKind = createEnumStyle({
    NotSet: 0 /* NotSet */,
    Pii_DistinguishedName: 1 /* Pii_DistinguishedName */,
    Pii_GenericData: 2 /* Pii_GenericData */,
    Pii_IPV4Address: 3 /* Pii_IPV4Address */,
    Pii_IPv6Address: 4 /* Pii_IPv6Address */,
    Pii_MailSubject: 5 /* Pii_MailSubject */,
    Pii_PhoneNumber: 6 /* Pii_PhoneNumber */,
    Pii_QueryString: 7 /* Pii_QueryString */,
    Pii_SipAddress: 8 /* Pii_SipAddress */,
    Pii_SmtpAddress: 9 /* Pii_SmtpAddress */,
    Pii_Identity: 10 /* Pii_Identity */,
    Pii_Uri: 11 /* Pii_Uri */,
    Pii_Fqdn: 12 /* Pii_Fqdn */,
    Pii_IPV4AddressLegacy: 13 /* Pii_IPV4AddressLegacy */,
    CustomerContent_GenericContent: 32 /* CustomerContent_GenericContent */
});
/**
 * The EventLatency contains a set of values that specify the latency with which an event is sent.
 */
export var EventLatency = createEnumStyle({
    /**
     * Normal latency.
     */
    Normal: 1 /* Normal */,
    /**
     * Cost deferred latency. At the moment this latency is treated as Normal latency.
     */
    CostDeferred: 2 /* CostDeferred */,
    /**
     * Real time latency.
     */
    RealTime: 3 /* RealTime */,
    /**
     * Bypass normal batching/timing and send as soon as possible, this will still send asynchronously.
     * Added in v3.1.1
     */
    Immediate: 4 /* Immediate */
});
/**
 * Enum for property types.
 */
export var EventPropertyType = createEnumStyle({
    Unspecified: 0 /* Unspecified */,
    String: 1 /* String */,
    Int32: 2 /* Int32 */,
    UInt32: 3 /* UInt32 */,
    Int64: 4 /* Int64 */,
    UInt64: 5 /* UInt64 */,
    Double: 6 /* Double */,
    Bool: 7 /* Bool */,
    Guid: 8 /* Guid */,
    DateTime: 9 /* DateTime */
});
/**
 * The EventPersistence contains a set of values that specify the event's persistence.
 */
export var EventPersistence = createEnumStyle({
    /**
     * Normal persistence.
     */
    Normal: 1 /* Normal */,
    /**
     * Critical persistence.
     */
    Critical: 2 /* Critical */
});
export var TraceLevel = createEnumStyle({
    NONE: 0 /* NONE */,
    ERROR: 1 /* ERROR */,
    WARNING: 2 /* WARNING */,
    INFORMATION: 3 /* INFORMATION */
});
export var _ExtendedInternalMessageId = objFreeze(__assign(__assign({}, _InternalMessageId), createEnumStyle({
    AuthHandShakeError: 501 /* AuthHandShakeError */,
    AuthRedirectFail: 502 /* AuthRedirectFail */,
    BrowserCannotReadLocalStorage: 503 /* BrowserCannotReadLocalStorage */,
    BrowserCannotWriteLocalStorage: 504 /* BrowserCannotWriteLocalStorage */,
    BrowserDoesNotSupportLocalStorage: 505 /* BrowserDoesNotSupportLocalStorage */,
    CannotParseBiBlobValue: 506 /* CannotParseBiBlobValue */,
    CannotParseDataAttribute: 507 /* CannotParseDataAttribute */,
    CVPluginNotAvailable: 508 /* CVPluginNotAvailable */,
    DroppedEvent: 509 /* DroppedEvent */,
    ErrorParsingAISessionCookie: 510 /* ErrorParsingAISessionCookie */,
    ErrorProvidedChannels: 511 /* ErrorProvidedChannels */,
    FailedToGetCookies: 512 /* FailedToGetCookies */,
    FailedToInitializeCorrelationVector: 513 /* FailedToInitializeCorrelationVector */,
    FailedToInitializeSDK: 514 /* FailedToInitializeSDK */,
    InvalidContentBlob: 515 /* InvalidContentBlob */,
    InvalidCorrelationValue: 516 /* InvalidCorrelationValue */,
    SessionRenewalDateIsZero: 517 /* SessionRenewalDateIsZero */,
    SendPostOnCompleteFailure: 518 /* SendPostOnCompleteFailure */,
    PostResponseHandler: 519 /* PostResponseHandler */,
    SDKNotInitialized: 520 /* SDKNotInitialized */
})));//# sourceMappingURL=https://ticino.blob.core.windows.net/sourcemaps/695af097c7bd098fbf017ce3ac85e09bbc5dda06/node_modules/@microsoft/1ds-core-js/dist-esm/src/Enums.js.map