/*
 * Application Insights JavaScript SDK - Core, 2.8.3
 * Copyright (c) Microsoft and contributors. All rights reserved.
 */
import dynamicProto from "@microsoft/dynamicproto-js";
import { arrForEach, arrIndexOf } from "./HelperFuncs";
import { strAddNotificationListener, strEventsDiscarded, strEventsSendRequest, strEventsSent, strPerfEvent, strRemoveNotificationListener } from "./InternalConstants";
function _runListeners(listeners, name, isAsync, callback) {
    arrForEach(listeners, function (listener) {
        if (listener && listener[name]) {
            if (isAsync) {
                setTimeout(function () { return callback(listener); }, 0);
            }
            else {
                try {
                    callback(listener);
                }
                catch (e) {
                    // Catch errors to ensure we don't block sending the requests
                }
            }
        }
    });
}
/**
 * Class to manage sending notifications to all the listeners.
 */
var NotificationManager = /** @class */ (function () {
    function NotificationManager(config) {
        this.listeners = [];
        var perfEvtsSendAll = !!(config || {}).perfEvtsSendAll;
        dynamicProto(NotificationManager, this, function (_self) {
            _self[strAddNotificationListener] = function (listener) {
                _self.listeners.push(listener);
            };
            /**
             * Removes all instances of the listener.
             * @param {INotificationListener} listener - AWTNotificationListener to remove.
             */
            _self[strRemoveNotificationListener] = function (listener) {
                var index = arrIndexOf(_self.listeners, listener);
                while (index > -1) {
                    _self.listeners.splice(index, 1);
                    index = arrIndexOf(_self.listeners, listener);
                }
            };
            /**
             * Notification for events sent.
             * @param {ITelemetryItem[]} events - The array of events that have been sent.
             */
            _self[strEventsSent] = function (events) {
                _runListeners(_self.listeners, strEventsSent, true, function (listener) {
                    listener[strEventsSent](events);
                });
            };
            /**
             * Notification for events being discarded.
             * @param {ITelemetryItem[]} events - The array of events that have been discarded by the SDK.
             * @param {number} reason           - The reason for which the SDK discarded the events. The EventsDiscardedReason
             * constant should be used to check the different values.
             */
            _self[strEventsDiscarded] = function (events, reason) {
                _runListeners(_self.listeners, strEventsDiscarded, true, function (listener) {
                    listener[strEventsDiscarded](events, reason);
                });
            };
            /**
             * [Optional] A function called when the events have been requested to be sent to the sever.
             * @param {number} sendReason - The reason why the event batch is being sent.
             * @param {boolean} isAsync   - A flag which identifies whether the requests are being sent in an async or sync manner.
             */
            _self[strEventsSendRequest] = function (sendReason, isAsync) {
                _runListeners(_self.listeners, strEventsSendRequest, isAsync, function (listener) {
                    listener[strEventsSendRequest](sendReason, isAsync);
                });
            };
            _self[strPerfEvent] = function (perfEvent) {
                if (perfEvent) {
                    // Send all events or only parent events
                    if (perfEvtsSendAll || !perfEvent.isChildEvt()) {
                        _runListeners(_self.listeners, strPerfEvent, false, function (listener) {
                            if (perfEvent.isAsync) {
                                setTimeout(function () { return listener[strPerfEvent](perfEvent); }, 0);
                            }
                            else {
                                listener[strPerfEvent](perfEvent);
                            }
                        });
                    }
                }
            };
        });
    }
// Removed Stub for NotificationManager.prototype.addNotificationListener.
// Removed Stub for NotificationManager.prototype.removeNotificationListener.
// Removed Stub for NotificationManager.prototype.eventsSent.
// Removed Stub for NotificationManager.prototype.eventsDiscarded.
// Removed Stub for NotificationManager.prototype.eventsSendRequest.
    return NotificationManager;
}());
export { NotificationManager };//# sourceMappingURL=https://ticino.blob.core.windows.net/sourcemaps/695af097c7bd098fbf017ce3ac85e09bbc5dda06/node_modules/@microsoft/applicationinsights-core-js/dist-esm/JavaScriptSDK/NotificationManager.js.map