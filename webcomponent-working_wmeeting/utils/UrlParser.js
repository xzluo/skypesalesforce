/********************************************************
*                                                        *
*   © Microsoft. All rights reserved.                    *
*                                                        *
*********************************************************/
/// <summary>
/// The query string parser Utitilies class
/// </summary>
"use strict";
define(["require", "exports", "../utils/Constants"], function (require, exports, Constants_1) {
    var UrlParser = (function () {
        function UrlParser() {
        }
        UrlParser.addMissingProtocol = function (url) {
            if (url.indexOf("http://") !== 0 &&
                url.indexOf("https://") !== 0 &&
                url.indexOf("mailto:") !== 0 &&
                url.indexOf("sip:") !== 0 &&
                url.indexOf("tel:") !== 0 &&
                url.indexOf("im:") !== 0) {
                return "http://" + url;
            }
            return url;
        };
        UrlParser.getParameterByName = function (name) {
            var match = RegExp('[?&]' + name + '=([^&]*)').exec(this.getQueryString());
            return match && decodeURIComponent(match[1].replace(/\+/g, ' '));
        };
        UrlParser.getQueryString = function () {
            return window.location.search;
        };
        // Temporary solution to get the customer Id from the Hive service URL in order to craft the report URL.
        // This will be removed when Hive adds in the next version of their API the report URL
        // in the response of the call to create a new ticket.
        UrlParser.getHiveCustomerId = function (hiveServiceUrl) {
            // The current service Urls are in the form of
            // baseUrl/v1/events/PartnerId/CustomerId/EventId/HiveTicket
            var hiveValues = hiveServiceUrl.split(Constants_1.default.SdnHivePartnerId + "/")[1];
            return hiveValues.split("/")[0];
        };
        UrlParser.isProduction = function () {
            return window.location.href.indexOf('broadcast.skype.com') !== -1;
        };
        UrlParser.isLocalhost = function () {
            return window.location.href.indexOf('localhost:8080') !== -1;
        };
        return UrlParser;
    })();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = UrlParser;
});
//# sourceMappingURL=UrlParser.js.map