/********************************************************
*                                                        *
*   © Microsoft. All rights reserved.                    *
*                                                        *
*********************************************************/
/// <summary>
/// The Localization Utitilies class
/// </summary>
/// <remark>
/// In this method, we use "Any" type for all the variables, as we don"t want to strong type them here which makes our test case hard to write
/// Outside of this method, clientStrings are strong typed by deriving from IAttendeeClientStrings
/// </remark>
"use strict";
define(["require", "exports", "../utils/Constants"], function (require, exports, Constants_1) {
    var ErrorCodes = (function () {
        function ErrorCodes() {
        }
        ErrorCodes.ErrorTable = {
            /// Unknown error:
            "-1": Constants_1.default.clientStrings.ErrorUnknownErrorCode,
            /// Invalid content type
            "1000": Constants_1.default.clientStrings.ErrorInvalidContentType,
            "1001": Constants_1.default.clientStrings.ErrorInvalidMeetingDataFormat,
            "1002": Constants_1.default.clientStrings.ErrorEventSubjectLengthExceedMaximumLimit,
            "1003": Constants_1.default.clientStrings.ErrorInvalidCharInEventName,
            "1004": Constants_1.default.clientStrings.ErrorEventNameLengthExceedMaximumLimit,
            "1005": Constants_1.default.clientStrings.ErrorStartTimeLaterThanEndTime,
            "1006": Constants_1.default.clientStrings.ErrorStartTimeEarlierThanCurrentTime,
            "1007": Constants_1.default.clientStrings.ErrorInvalidEndTime,
            "1008": Constants_1.default.clientStrings.ErrorInvalidEventTeamMember,
            "1009": Constants_1.default.clientStrings.ErrorInvalidSipAddressInEventTeamMember,
            "1010": Constants_1.default.clientStrings.ErrorInvalidMeetingAccessLevel,
            "1011": Constants_1.default.clientStrings.ErrorInvalidAttendee,
            "1012": Constants_1.default.clientStrings.ErrorInvalidOrganizer,
            "1013": Constants_1.default.clientStrings.ErrorInvalidMeetingResourceType,
            "1014": Constants_1.default.clientStrings.ErrorInvalidMeetingRequest,
            /// Empty Meeting Inputs
            "2000": Constants_1.default.clientStrings.ErrorEmptyMeetingRequest,
            "2001": Constants_1.default.clientStrings.ErrorEmptyUserNameList,
            "2002": Constants_1.default.clientStrings.ErrorEmptyMeetingResourceType,
            "2003": Constants_1.default.clientStrings.ErrorEmptyEventSubject,
            "2004": Constants_1.default.clientStrings.ErrorEmptyEventName,
            "2005": Constants_1.default.clientStrings.ErrorEmptyEventStartTime,
            "2006": Constants_1.default.clientStrings.ErrorEmptyEventEndTime,
            "2007": Constants_1.default.clientStrings.ErrorEmptyEventTeam,
            "2008": Constants_1.default.clientStrings.ErrorEmptyEventTeamMember,
            "2009": Constants_1.default.clientStrings.ErrorEmptyAttendee,
            "2010": Constants_1.default.clientStrings.ErrorEmptyJoinUrl,
            "2011": Constants_1.default.clientStrings.ErrorEmptyETag,
            "2012": Constants_1.default.clientStrings.ErrorEmptyOrganizer,
            /// Not allowed meeting inputs
            "3000": Constants_1.default.clientStrings.ErrorEventNameNotAllowedToBeModified,
            "3001": Constants_1.default.clientStrings.ErrorJoinUrlNotAllowedToBeModified,
            "3002": Constants_1.default.clientStrings.ErrorNotInEventTeam,
            "3003": Constants_1.default.clientStrings.ErrorNotFoundEvent,
            "3004": Constants_1.default.clientStrings.ErrorOutdatedEvent,
            /// Input request failures
            "4000": Constants_1.default.clientStrings.ErrorFailedToCreateSkypeCastMeeting,
            "4001": Constants_1.default.clientStrings.ErrorFailedToModifySkypeCastMeeting,
            "4002": Constants_1.default.clientStrings.ErrorFailedToDeleteSkypeCastMeeting,
            "4003": Constants_1.default.clientStrings.ErrorMeetingRequestFailure,
            "4004": Constants_1.default.clientStrings.ErrorMeetingPolicyRequestFailure,
            "4005": Constants_1.default.clientStrings.ErrorMeetingResourceRequestFailure,
            /// Permission Related Failures
            "5000": Constants_1.default.clientStrings.ErrorCreateMeetingPermissionFailure,
            "5001": Constants_1.default.clientStrings.ErrorModifyMeetingPermissionFailure,
            /// AAD Failed 6000
            "6000": Constants_1.default.clientStrings.ErrorLookUpUserInfoInAADFailed,
            "6001": Constants_1.default.clientStrings.ErrorConvertUpnToSipFailure,
            "6002": Constants_1.default.clientStrings.ErrorConvertUpnToSipEmptyResultFailure
        };
        return ErrorCodes;
    })();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.default = ErrorCodes;
});
//# sourceMappingURL=ErrorCodes.js.map