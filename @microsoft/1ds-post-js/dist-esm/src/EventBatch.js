/*
 * 1DS JS SDK POST plugin, 3.2.2
 * Copyright (c) Microsoft and contributors. All rights reserved.
 * (Microsoft Internal Only)
 */
import { isNullOrUndefined, isValueAssigned } from "@microsoft/1ds-core-js";
import { strMsfpc } from "./Constants";
function _getEventMsfpc(theEvent) {
    var intWeb = ((theEvent.ext || {})["intweb"]);
    if (intWeb && isValueAssigned(intWeb[strMsfpc])) {
        return intWeb[strMsfpc];
    }
    return null;
}
function _getMsfpc(theEvents) {
    var msfpc = null;
    for (var lp = 0; msfpc === null && lp < theEvents.length; lp++) {
        msfpc = _getEventMsfpc(theEvents[lp]);
    }
    return msfpc;
}
/**
* This class defines a "batch" events related to a specific iKey, it is used by the PostChannel and HttpManager
* to collect and transfer ownership of events without duplicating them in-memory. This reduces the previous
* array duplication and shared ownership issues that occurred due to race conditions caused by the async nature
* of sending requests.
*/
var EventBatch = /** @class */ (function () {
    /**
     * Private constructor so that caller is forced to use the static create method.
     * @param iKey - The iKey to associate with the events (not validated)
     * @param addEvents - The optional collection of events to assign to this batch - defaults to an empty array.
     */
    function EventBatch(iKey, addEvents) {
        var events = addEvents ? [].concat(addEvents) : [];
        var _self = this;
        var _msfpc = _getMsfpc(events);
        _self.iKey = function () {
            return iKey;
        };
        _self.Msfpc = function () {
            // return the cached value unless it's undefined -- used to avoid cpu
            return _msfpc || "";
        };
        _self.count = function () {
            return events.length;
        };
        _self.events = function () {
            return events;
        };
        _self.addEvent = function (theEvent) {
            if (theEvent) {
                events.push(theEvent);
                if (!_msfpc) {
                    // Not found so try and find one
                    _msfpc = _getEventMsfpc(theEvent);
                }
                return true;
            }
            return false;
        };
        _self.split = function (fromEvent, numEvents) {
            // Create a new batch with the same iKey
            var theEvents;
            if (fromEvent < events.length) {
                var cnt = events.length - fromEvent;
                if (!isNullOrUndefined(numEvents)) {
                    cnt = numEvents < cnt ? numEvents : cnt;
                }
                theEvents = events.splice(fromEvent, cnt);
                // reset the fetched msfpc value
                _msfpc = _getMsfpc(events);
            }
            return new EventBatch(iKey, theEvents);
        };
    }
    /**
     * Creates a new Event Batch object
     * @param iKey The iKey associated with this batch of events
     */
    EventBatch.create = function (iKey, theEvents) {
        return new EventBatch(iKey, theEvents);
    };
    return EventBatch;
}());
export { EventBatch };//# sourceMappingURL=https://ticino.blob.core.windows.net/sourcemaps/695af097c7bd098fbf017ce3ac85e09bbc5dda06/node_modules/@microsoft/1ds-post-js/dist-esm/src/EventBatch.js.map