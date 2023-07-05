/*
 * Application Insights JavaScript SDK - Core, 2.8.3
 * Copyright (c) Microsoft and contributors. All rights reserved.
 */


// Note: DON'T Export these const from the package as we are still targeting ES3 this will export a mutable variables that someone could change!!!
export var strEmpty = "";
export var strProcessTelemetry = "processTelemetry";
export var strPriority = "priority";
export var strSetNextPlugin = "setNextPlugin";
export var strIsInitialized = "isInitialized";
export var strTeardown = "teardown";
export var strCore = "core";
export var strUpdate = "update";
export var strDisabled = "disabled";
export var strDoTeardown = "_doTeardown";
export var strProcessNext = "processNext";
export var strResume = "resume";
export var strPause = "pause";
export var strNotificationListener = "NotificationListener";
export var strAddNotificationListener = "add" + strNotificationListener;
export var strRemoveNotificationListener = "remove" + strNotificationListener;
export var strEventsSent = "eventsSent";
export var strEventsDiscarded = "eventsDiscarded";
export var strEventsSendRequest = "eventsSendRequest";
export var strPerfEvent = "perfEvent";