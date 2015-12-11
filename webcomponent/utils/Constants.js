/********************************************************
*                                                        *
*   © Microsoft. All rights reserved.                    *
*                                                        *
*********************************************************/
define(["require", "exports", '../utils/UrlParser'], function (require, exports, UrlParser_1) {
    /// <summary>
    /// Contant variables
    /// </summary>
    /// <reference path="strings.d.ts" />
    "use strict";
    var Constants = (function () {
        function Constants() {
        }
        Constants.GetScriptRootPath = function () {
            if (this.RootPath == null) {
                var htmlElement = document.getElementsByTagName('html')[0];
                this.RootPath = htmlElement.getAttribute('sb-data-rootPath') + '/';
            }
            return this.RootPath;
        };
        Constants.GetShowDogfoodFeaturesFlag = function () {
            var addressBarUrl = window.location.href;
            if (addressBarUrl.indexOf("localhost") !== -1
                || addressBarUrl.indexOf("sched-dev") !== -1
                || addressBarUrl.indexOf("sched-int") !== -1) {
                // we only enable dogfood features for our test environments
                return true;
            }
            return false;
        };

        // loc
        Constants.DefaultDateFormat = "dddd, MMMM Do, YYYY";
        Constants.DefaultTimeFormat = "h:mm A";
        Constants.RootPath = null;

        // meeting eidt panel name
        Constants.ManageAttendeeAccess = "ManageAttendeeAccess";
        Constants.ManageEventTeamMember = "AddTeamMember";
        Constants.EditEventBasicInformation = "EditEventBasicInformation";
        Constants.CustomizeEvent = "CustomizeEvent";
        // query parameter for indicating client type e.g. automation test
        Constants.requestClientQueryString = "requestClient";
        // meeting resource types
        Constants.ResourceTypeRecording = "MeetingRecording";
        // Organizer's language
        Constants.OrganizerCultureNameKey = "organizerCultureName";
        Constants.DefaultCultureName = "en-US";
        // Recording option in meeting data
        Constants.MeetingDataRecordingOptionKey = "recording";

        // Azure AD Properties
        // Constants.AzureADInstanceUrl = UrlParser_1.default.isLocalhost() ? "https://login.microsoftonline.com/" :
        //     window.azureADInstance || "https://login.windows-ppe.net/";
        Constants.AzureADInstanceUrl = "https://login.microsoftonline.com/";
        Constants.AzureADTenant = "skypeforcei.onmicrosoft.com";
        Constants.AzureClientId = "f8acbf70-6af2-445c-adb0-a54706370fd4"; //"e4dac4cd-21a8-49cc-81c4-91a3670f767a";

        //Constants.AzureADTenant = "skypeforcei.onmicrosoft.com";
        //Constants.AzureClientId = "c715cb2d-69a4-441d-8ac6-e7b3c88c75b3"; //"e4dac4cd-21a8-49cc-81c4-91a3670f767a";

        // Meeting Access level
        Constants.MeetingAccessLevelAnonymous = "Anonymous";
        Constants.MeetingAccessLevelClosed = "Closed";
        Constants.MeetingAccessLevelOpen = "Open";
        Constants.PrivacyUrl = "http://go.microsoft.com/fwlink/?LinkID=517480&clcid=0x";
        Constants.DefaultLcid = "409"; // Default LCID for english
        Constants.DogfoodDomains = ['microsoft.com', 'exchange.microsoft.com', 'ssippe1luo.ccsctp.net', 'mlctest.ccsctp.net',
            'skypeforcei.onmicrosoft.com', 'ssippe2luo.ccsctp.net', 'lyncoqa.com', 'lyncoqa.ccsctp.net', 'lync2lync.ccsctp.net'];
        Constants.AllowedSdnNames = ['hive', 'kollective'];
        // Invite
        Constants.InviteUrlSuffix = "invite";
        // UI Ids
        Constants.IconIds = {
            Home: 'sb-icon-home',
            Close: 'sb-icon-x',
            Check: 'sb-icon-check',
            Settings: 'sb-icon-settings',
            Add: 'sb-icon-circlePlus',
            Edit: 'sb-icon-pencil',
            Delete: 'sb-icon-trash',
            MeetingSettings: 'sb-icon-scheduling',
            MeetingSummary: 'sb-icon-eventInfo'
        };
        return Constants;
    })();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = Constants;
});
//# sourceMappingURL=Constants.js.map