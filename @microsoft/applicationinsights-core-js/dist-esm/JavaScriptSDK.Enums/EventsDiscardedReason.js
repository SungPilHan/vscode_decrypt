/*
 * Application Insights JavaScript SDK - Core, 2.8.3
 * Copyright (c) Microsoft and contributors. All rights reserved.
 */


import { createEnumStyle } from "../JavaScriptSDK.Enums/EnumHelperFuncs";
/**
 * The EventsDiscardedReason enumeration contains a set of values that specify the reason for discarding an event.
 */
export var EventsDiscardedReason = createEnumStyle({
    /**
     * Unknown.
     */
    Unknown: 0 /* Unknown */,
    /**
     * Status set to non-retryable.
     */
    NonRetryableStatus: 1 /* NonRetryableStatus */,
    /**
     * The event is invalid.
     */
    InvalidEvent: 2 /* InvalidEvent */,
    /**
     * The size of the event is too large.
     */
    SizeLimitExceeded: 3 /* SizeLimitExceeded */,
    /**
     * The server is not accepting events from this instrumentation key.
     */
    KillSwitch: 4 /* KillSwitch */,
    /**
     * The event queue is full.
     */
    QueueFull: 5 /* QueueFull */
});//# sourceMappingURL=https://ticino.blob.core.windows.net/sourcemaps/695af097c7bd098fbf017ce3ac85e09bbc5dda06/node_modules/@microsoft/applicationinsights-core-js/dist-esm/JavaScriptSDK.Enums/EventsDiscardedReason.js.map