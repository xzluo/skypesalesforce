define(["require", "exports", './utils/Logger', "./utils/Constants", './utils/AuthModule', './utils/UrlParser', './libs/adal', './libs/es6-promise.min'], function (require, exports, Logger_1, Constants_1, AuthModule_1, UrlParser_1) {
    "use strict";

    function log(texttolog) {
        var d = new Date();
        var time = padLeft(d.getHours(), 2) + ":" + padLeft(d.getMinutes(), 2) + ":" + padLeft(d.getSeconds(), 2) + ":" + padLeft(d.getMilliseconds(), 3);
        console.log(time + ": " + texttolog + "<br>");
    }

    function padLeft(nr, n, str) {
        return Array(n - String(nr).length + 1).join(str || '0') + nr;
    }

    function peopleCard(name, avatarUrl, title, status) {
        var newCard = '<div class="col-lg-3 alert alert-success">';
        // newCard = newCard + '<img src="' + presenseimage + '" height="32" width="32" onError="imgError(this);" >&nbsp;';
        newCard = newCard + '<img src="' + avatarUrl + '" height="32" width="32" onError="imgError(this);" >&nbsp;';
        newCard = newCard + name + "<br>";
        newCard = newCard + title + "<br>";
        newCard = newCard + status;
        newCard = newCard + '<img src="' + "  " + "imshow.png" + '" height="30" width="30" onError="imgError(this);" >&nbsp;';
        newCard = newCard + '<img src="' + "  " + "video.png" + '" height="30" width="30" onError="imgError(this);" >&nbsp;';
        newCard = newCard + '</div>';
        $('#cards').append(newCard);
    }

    function imgError(image) {
        image.onerror = "";
        image.src = "unknown.png";
        return true;
    }
    
    function myPopup(meetingSubject, meetingstartDate, meetingendDate, meetingstartTime, meetingendTime) {

        //log("passing" + meetingSubject);
        //$('#dashboardoutput').append(meetingSubject + "<br>");
        //$('#dashboardoutput').append(meetingstartDate + "<br>");
        //$('#dashboardoutput').append(meetingendDate + "<br>");
        //$('#dashboardoutput').append(meetingstartTime + "<br>");
        //$('#dashboardoutput').append(meetingendTime + "<br>");

        var subject = meetingSubject;
        var owaControlurl = document.getElementById("owaControlurl").value;
        var owaVersion = document.getElementById("owaVersion").value;
        var owaServerversion = document.getElementById("owaServerversion").value;
        var owaPath = document.getElementById("owaPath").value;
        var startdt = meetingstartDate + meetingstartTime;
        var enddt = meetingendDate + meetingendTime;
        var location = encodeURIComponent("Online Skype Meeting");
        var body = "This+is+the+body+%3cb%3ebold%3c%2fb%3e%3cbr%2f%3e%3cbr%2f%3e%3cfont+size%3d%22%2b3%22%3e%3cb%3e%3ca+href%3d%22http%3a%2f%2fmeet.skype.com%2fmymeeting123%22%3eJoin+Skype+Meeting%3c%2fa%3e%3c%2fb%3e%3c%2ffont%3e&wa=wsignin1.0";
        var part1 = owaControlurl + "ver=" + owaVersion + "&" + "cver=" + owaServerversion + "&" + owaPath
        var owaMeetingURL = part1 + "&" + "Subject=" + subject + "&" + "startdt=" + startdt + "&" + "enddt=" + enddt + "&" + "location=" + location + "&" + "isPopout=1&" + "body=" + body;
        log(owaMeetingURL);
        var myWindow = window.open
            (owaMeetingURL,
            "_blank", "toolbar=yes, scrollbars=yes, resizable=yes, top=500, left=500, width=1200, height=800");
    }

    function displayOutput(str) {

        var meetingsubjectInput = document.getElementById("txtname").value;
        document.getElementById("saveMeetingEvents_meetingsubject").innerHTML = meetingsubjectInput;

        var meetingstartdate = document.getElementById("sdate").value;
        document.getElementById("saveMeetingEvents_startdate").innerHTML = meetingstartdate;

        var meetingstarttime = document.getElementById("stime").value;
        document.getElementById("saveMeetingEvents_starttime").innerHTML = meetingstarttime;

        var meetingenddate = document.getElementById("edate").value;
        document.getElementById("saveMeetingEvents_enddate").innerHTML = meetingenddate;

        var meetingendtime = document.getElementById("etime").value;
        document.getElementById("saveMeetingEvents_endtime").innerHTML = meetingendtime;

        myOnlinemeetingurl(str);
    }

    function myOnlinemeetingurl(str) {
        document.getElementById('mySchedulemeetingonlineurl').innerHTML = "Join Online Skype Meeting";
        document.getElementById('mySchedulemeetingonlineurl').href = str;
    }
    
    var App = (function () {
        function App(){}
        
        log("App Loaded");
        $('#signout').hide();
        $('#userdetails').hide();
        $('#whoami').hide();
        $('#pullcontacts').hide();
        $('#getcontacts').hide();
        $('#createMeeting').hide();
        $('#skypemeeting').hide();
        $('#saveschedulemeeting').hide();
        $('#popupsaveschedulemeeting').hide();
        $('#contactdetails').hide();
        $('#saveMeetingEvents').hide();

        var meeting;
        var Application
        var client;

        Skype.initialize({
            apiKey: 'a42fcebd-5b43-4b89-a065-74450fb91255',
        }, function (api) {
            Application = api.application;
            client = new Application();
            log("Client Created");
        }, function (err) {
            log('some error occurred: failed' + err);
        });



        // SIGN IN FLOW
        $('#authorizeToOffice').click(function () {
            Logger_1.default.log("authorizeToOffice: AuthModule_1.default.instance");
            AuthModule_1.default.instance.refreshToken(function (error, token) {
                Logger_1.default.log("AuthModule_1.default.instance.refreshToken");
            });
        });

        $('#signin').click(function () {
            $('#signin').hide();
            log('Signing in...');
            console.log("signin");

            // window.location.origin is not available in older versions of IE
            if (!window.location.origin) {
                window.location.origin = window.location.protocol + "//" + window.location.hostname +
                    (window.location.port ? ':' + location.port : '');
                log(window.location.origin);
            }
            if (window.serviceRegionalBaseUrl) {
                window.serviceRegionalBaseUrl = 'https://' + window.serviceRegionalBaseUrl;
                log(window.serviceRegionalBaseUrl);
            }
            else {
                window.serviceRegionalBaseUrl = '';
            }
            // Promises
            require('./libs/es6-promise.min').polyfill();

            // ----------
            // Initialize the authentication module
            var isIframe = (window !== window.top);

            AuthModule_1.default.instance.initialize();
            console.log("AuthModule_1.default.instance.initialize");
            console.log(AuthModule_1.default.instance);
            if (isIframe) {
                Logger_1.default.log('Running in an iframe, stoppig now.');
                console.log('Running in an iframe, stoppig now.');
                return;
            }

            //setTimeout(AuthModule_1.default.instance.refreshToken(function (error, token) {
            //    var origins = [
            //          // 'https://webdir.tip.lync.com/autodiscover/autodiscoverservice.svc/root',
            //          // 'https://webdir0d.tip.lync.com/autodiscover/autodiscoverservice.svc/root',
            //           'https://webdir.online.lync.com/autodiscover/autodiscoverservice.svc/root'
            //          // 'https://webdir0m.online.lync.com/autodiscover/autodiscoverservice.svc/root'
            //       ];

            //    function auth(req, send) {
            //             if (req.url.match(/https:\/\/webdir0d/)) {
            //                 req.headers['Authorization'] = 'Bearer ' + token.trim();
            //             } else if (req.url.match(/https:\/\/webpoolbn10m03/)) {
            //                 req.headers['Authorization'] = 'Bearer ' + token.trim();
            //             } else {
            //                 req.headers['Authorization'] = 'Bearer ' + token.trim();
            //             }
            //             log(req);
            //             return send(req);
            //         }
            //
            //         client.signInManager.signIn({
            //           auth: auth,
            //             client_id: '3f303bbb-4d5f-45c2-ad2b-7034c16f38b6',
            //             //oauth_uri: '...',
            //             origins: origins,
            //             //use_cwt: true,
            //            // enableInternalNS: false,
            //         }).then(function (data) {
            //             log('Logged In Succesfully');
            //         });
            //  }), 5000);
        });

        // IMPLICIT FLOW
        $('#implicitsignin').click(function () {

            $('#signin').hide();
            $('#implicitsignin').hide();
           
            log('Entering Implicit in...');
            
          
            var Application = Skype.Web.Model.Application;
            client = new Application();
          var origins = [
               // 'https://webdir.tip.lync.com/autodiscover/autodiscoverservice.svc/root',
              //  'https://webdir0d.tip.lync.com/autodiscover/autodiscoverservice.svc/root',
                'https://webdir.online.lync.com/autodiscover/autodiscoverservice.svc/root'
               // 'https://webdir0m.online.lync.com/autodiscover/autodiscoverservice.svc/root'
            ];
 

            var options = {
                cors: true,
                use_cwt: false,
                redirect_uri: '/query.html',
                id: '9b0fdb2a252c4aca56847b17d11c5e5a',
                // client_id: 'c050aba1-6509-4a0a-81f9-7ec4c0667010',
                //client_id: '3f303bbb-4d5f-45c2-ad2b-7034c16f38b6', //Davi newman tenant id
                //  oauth_uri: 'https://login.microsoftonline.com/common/oauth2/authorize?domain_hint=danewman.onmicrosoft.com',
                client_id: '9de6b775-994c-44a2-973d-fd28189ccfaf', //ssiprod tenant expires 4/28/2016
                oauth_uri: 'https://login.microsoftonline.com/common/oauth2/authorize?domain_hint=ssiprod.onmicrosoft.com',
                // oauth_uri: 'https://login.windows-ppe.net/common/oauth2/authorize?domain_hint=lyncnadbr.ccsctp.net',
                origins: origins,
            }

            log(client.personsAndGroupsManager.mePerson.displayName);
            client.signInManager.signIn(options).then(function () {
                log('Signed in as ' + client.personsAndGroupsManager.mePerson.displayName());
            }).then(null, function (error) {
                log("Cannot sign in");
            });

          
            //$(window).load(function () {
            //    $("#loader").fadeOut("fast");
                log("completed");
                $('#loginbox').hide();
                $('#signout').show();
                // $('#whoami').show();
                // $('#pullcontacts').show();
                // $('#getcontacts').show();
                $('#skypemeeting').show();
                $('#saveschedulemeeting').show();
                $('#popupsaveschedulemeeting').show();
            //});
            

        });

        // GIVES BASIC INFO ABOUT SIGNED IN USER
        $('#whoami').click(function () {
            $('#userdetails').show();
            var me = client.personsAndGroupsManager.mePerson;
            me.title.get().then(function (value) {
                $('#label_title').text(value);
            });

            me.displayName.get().then(function (value) {
                log(value);
                $('#label_displayName').text(value);
            });

            me.avatarUrl.get().then(function (value) {

                $('#label_avatarUrl').html("<img src='" + value + "'>");

            });
        });

        // SHOWS PEOPLE CARD CONTACTS ASSOCIATED WITH SIGNED IN USER
        $("#pullcontacts").click(function () {

            log('Retrieving all contacts...');
            $('#cards').html("");
            client.personsAndGroupsManager.all.persons.get().then(function (persons) {
                // `persons` is an array, so we can use Array::forEach here
                log("Found Collection of persons");

                persons.forEach(function (person) {
                    person.displayName.get().then(function (name) {
                        //   name = firstName(name);
                        //log("Found Name" + name);
                        person.avatarUrl.get().then(function (avatarUrl) {
                            // log("Image" + avatarUrl);

                            person.title.get().then(function (title) {
                                //    log("title" + title);

                                person.status.get().then(function (status) {

                                    //var presenceimage = "";
                                    //if (status == 'Online')
                                    //{
                                    //    presenceimage.src = "available.png";
                                    //}

                                    peopleCard(name, avatarUrl, title, status);
                                });
                            });
                        });
                    });
                });
            });
            log('Everyone found!');


            //client.personsAndGroupsManager.all.persons.get().then(function (persons) {
            //    persons.forEach(function (person) {
            //        person.displayName.get().then(function (name) {
            //            $('#dashboardoutput').append(name);
            //            log("running" + name);
            //        });
            //        person.status.get().then(function (status) {
            //            $('#dashboardoutput').append(status);
            //        });
            //        person.avatarUrl.get().then(function (url) {
            //            $('#dashboardoutput').append.html("<img src='" + url + "'>");
            //        });

            //    });

            //});
        });

        // SHOWS CONTACTS ASSOCIATED WITH SIGNED IN USER
        $('#getcontacts').click(function () {

            log("Looking for all contacts");
            client.personsAndGroupsManager.all.persons.get().then(function (persons) {
                persons.forEach(function (person) {
                    person.displayName.get().then(function (name) {
                        $('#dashboardoutput').append(name + "<br>");
                        log(name);
                    });


                });

            });
        });

        // CLICK SKYPE MEETING
        $('#skypemeeting').click(function () {
            $('#createMeeting').show();
            //if (client) {
                log("Schedule meeting");
                var options = getMeetingOptions();

                 //client.startMeeting(options).then(function (m) {
                 //    meeting = m;
                 //});

        });


        //function OnButtonClick() {
        //    var textcontrol = document.getElementById("txtname");
        //    textcontrol.value = tempSubjectTitle;

        //    var today = new Date();
        //    var dd = today.getDate();
        //    var mm = today.getMonth() + 1; //January is 0!
        //    var yyyy = today.getFullYear();

        //    if (dd < 10) {
        //        dd = '0' + dd
        //    }

        //    if (mm < 10) {
        //        mm = '0' + mm
        //    }

        //    today = mm + '/' + dd + '/' + yyyy;
        //    // document.write(today);
        //    // textcontrol.value = today;

        //    var sdate = document.getElementById("sdate");
        //    //sdate.value = today;
        //}

        function getMeetingOptions() {
            var options = {
                //accessLevel: $('#accessLevel option:selected').val(),
                accessLevel: 'Everyone',
                //attendees: [],
                //automaticLeaderAssignment: $('#automaticLeaderAssignment option:selected').val(),
                automaticLeaderAssignment: 'Everyone',
                //description: $('#description').text(),
                //entryExitAnnouncement: $('#entryExitAnnouncement option:selected').val(),
                entryExitAnnouncement: 'Enabled',
                //expirationTime: $('#expirationTime').val(),
                //leaders: [],
                //lobbyBypassForPhoneUsers: $('#lobbyBypassForPhoneUsers option:selected').val(),
                lobbyBypassForPhoneUsers: 'Enabled',
                //phoneUserAdmission: $('#phoneUserAdmission option:selected').val(),
                //phoneUserAdmission: 'Enabled',
                subject: $('#subject').text()
            };
            var selected;
            var useExpiration = $('#useExpiration').is(':checked');

            if (options.accessLevel == 'null') {
                delete options.accessLevel;
            }

            selected = $('#attendees option:selected');

            for (var i = 0; i < selected.length; i++) {
                options.attendees.push(selected[i].value);
            }

            if (options.automaticLeaderAssignment == 'null') {
                delete options.automaticLeaderAssignment;
            }

            if (options.entryExitAnnouncement == 'null') {
                delete options.entryExitAnnouncement;
            }

            if (useExpiration) {
                var date;

                if (meeting && meeting.expirationTime()) {
                    date = new Date(meeting.expirationTime());
                } else {
                    date = new Date();
                }

                date.setMinutes(date.getMinutes() + parseInt(options.expirationTime));
                options.expirationTime = date;
            } else if (meeting && meeting.expirationTime()) {
                options.expirationTime = meeting.expirationTime();
            } else {
                delete options.expirationTime;
            }

            selected = $('#leaders option:selected');

            for (var i = 0; i < selected.length; i++) {
                options.leaders.push(selected[i].value);
            }

            if (options.lobbyBypassForPhoneUsers == 'null') {
                delete options.lobbyBypassForPhoneUsers;
            }

            if (options.phoneUserAdmission == 'null') {
                delete options.phoneUserAdmission;
            }

            return options;
        }

        // CLICK SAVE BUTTON
        $('#save').click(function () {
            //if (client && meeting) {

                //if ( meeting) {
                $('#saveMeetingEvents').show();

                //Updating Meeting subject modified by the user
                var meetingSubject = document.getElementById('txtname');
                var updatemeetingSubject = function () {
                }

                log(meetingSubject.value + "***I SAVE THIS SUBJECT****");

                if (meetingSubject.addEventListener) {
                    meetingSubject.addEventListener('keyup', function () {
                        updatemeetingSubject();

                    });
                }

                //Updating Meeting Start Date modified by the user
                var meetingstartDate = document.getElementById('sdate');
                var updatemeetingstartDate = function () {
                }
                  log(meetingstartDate.value + "***I SAVE THIS START DATE****");

                if (meetingstartDate.addEventListener) {
                    meetingstartDate.addEventListener('keyup', function () {
                        updatemeetingstartDate();
                    });
                }

                //Updating Meeting End Date modified by the user
                var meetingendDate = document.getElementById('edate');
                var updatemeetingendDate = function () {
                }
                log(meetingendDate.value + "***I SAVE THIS END DATE****");

                if (meetingendDate.addEventListener) {
                    meetingendDate.addEventListener('keyup', function () {
                        updatemeetingendDate();
                    });
                }

                //Updating Meeting Start Time modified by the user
                var meetingstartTime = document.getElementById('stime');
                var updatemeetingstartTime = function () {
                }
                log(meetingstartTime.value + "***I SAVE THIS START TIME****");


                if (meetingstartTime.addEventListener) {
                    meetingstartTime.addEventListener('keyup', function () {
                        updatemeetingstartTime();
                    });
                }

                //Updating Meeting End Time modified by the user
                var meetingendTime = document.getElementById('etime');
                var updatemeetingendTime = function () {
                }
                log(meetingendTime.value + "***I SAVE THIS END TIME****");

                if (meetingendTime.addEventListener) {
                    meetingendTime.addEventListener('keyup', function () {
                        updatemeetingendTime();
                    });
                }

               // $('#dashboardoutput').append(meeting.onlineMeetingUri() + "<br>");
                //  $('#dashboardoutput').append(meeting.joinUrl() + "<br>");
                //var str = meeting.meeting.joinUrl();
                //var str = meeting.joinUrl.get();
                //var onlineMeetingURL = str.link(meeting.meeting.joinUrl());
                //var onlineMeetingURL = meeting.joinUrl();
                //meeting.onlineMeetingUri.get().then(function(onlineMeetingURL)
                //{
                //    $('#dashboardoutput').append(onlineMeetingURL);
                //    displayOutput(onlineMeetingURL);
                //});
                
                //var str = meeting.meeting.joinUrl();
                //var onlineMeetingURL = str.link(meeting.meeting.joinUrl());
                //$('#dashboardoutput').append(onlineMeetingURL);

               // var str = meeting.meeting.joinUrl();
               //// var onlineMeetingURL = str.link(meeting.meeting.joinUrl());
               // $('#dashboardoutput').append(str);
               // console.log("meeting url" + str);
               // displayOutput(str);

                var conf = client.conversationsManager.createMeeting();
                conf.accessLevel("Everyone");
                conf.subject(meetingSubject.value);
                conf.joinUrl.get().then(function (res) {
                    console.log("Meeting URL " + conf.joinUrl());
                    var str = conf.joinUrl();
                    $('#dashboardoutput').append(str);
                    console.log("meeting url" + str);
                    displayOutput(str);

                }, function (err) {
                    log("Falied to schedule meeting" + err);
                });
               
               
            //}
        });

        //CLICK SCHEDULE BUTTON
        $('#popupsaveschedulemeeting').click(function () {

            if (client && meeting) {

                $('#saveMeetingEvents').show();

                //Updating Meeting subject modified by the user
                var meetingSubject = document.getElementById('txtname');
                var updatemeetingSubject = function () {
                }
                log(meetingSubject.value + "***I SAVE THIS SUBJECT****");

                if (meetingSubject.addEventListener) {
                    meetingSubject.addEventListener('keyup', function () {
                        updatemeetingSubject();

                    });
                }

                //Updating Meeting Start Date modified by the user
                var meetingstartDate = document.getElementById('sdate');
                var updatemeetingstartDate = function () {
                }
                log(meetingstartDate.value + "***I SAVE THIS START DATE****");

                if (meetingstartDate.addEventListener) {
                    meetingstartDate.addEventListener('keyup', function () {
                        updatemeetingstartDate();
                    });
                }

                //Updating Meeting End Date modified by the user
                var meetingendDate = document.getElementById('edate');
                var updatemeetingendDate = function () {
                }
                log(meetingendDate.value + "***I SAVE THIS END DATE****");

                if (meetingendDate.addEventListener) {
                    meetingendDate.addEventListener('keyup', function () {
                        updatemeetingendDate();
                    });
                }

                //Updating Meeting Start Time modified by the user
                var meetingstartTime = document.getElementById('stime');
                var updatemeetingstartTime = function () {
                }
                log(meetingstartTime.value + "***I SAVE THIS START TIME****");

                if (meetingstartTime.addEventListener) {
                    meetingstartTime.addEventListener('keyup', function () {
                        updatemeetingstartTime();
                    });
                }

                //Updating Meeting End Time modified by the user
                var meetingendTime = document.getElementById('etime');
                var updatemeetingendTime = function () {
                }
                log(meetingendTime.value + "***I SAVE THIS END TIME****");

                if (meetingendTime.addEventListener) {
                    meetingendTime.addEventListener('keyup', function () {
                        updatemeetingendTime();
                    });
                }

                //$('#dashboardoutput').append(meetingSubject.value + "<br>");
                //$('#dashboardoutput').append(meetingstartDate.value + "<br>");
                //$('#dashboardoutput').append(meetingendDate.value + "<br>");
                //$('#dashboardoutput').append(meetingstartTime.value + "<br>");
                //$('#dashboardoutput').append(meetingendTime.value + "<br>");
                
                
                
                AuthModule_1.default.instance.refreshToken(function (error, token) {
                    Logger_1.default.log("AuthModule_1.default.instance.refreshToken");
                });

            
                var str = meeting.meeting.joinUrl();
                var onlineMeetingURL = str.link(meeting.meeting.joinUrl());
                $('#dashboardoutput').append(onlineMeetingURL);

                displayOutput(str);

                //myPopup(encodeURIComponent(meetingSubject.value), encodeURIComponent(meetingstartDate.value), encodeURIComponent(meetingendDate.value), encodeURIComponent(meetingstartTime.value), encodeURIComponent(meetingendTime.value));
                //outlookSub(encodeURIComponent(meetingSubject.value));
               
                var xhttpPost = new XMLHttpRequest();
         

            var tempMeetingURL = "https://meet.lync.com/microsoft/aravin/M5LJHMG0";
            var acquireToken = "eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6Ik1uQ19WWmNBVGZNNXBPWWlKSE1iYTlnb0VLWSIsImtpZCI6Ik1uQ19WWmNBVGZNNXBPWWlKSE1iYTlnb0VLWSJ9.eyJhdWQiOiJodHRwczovL291dGxvb2sub2ZmaWNlLmNvbSIsImlzcyI6Imh0dHBzOi8vc3RzLndpbmRvd3MubmV0LzUzNDExYjhiLTFkZTgtNGQwMi05N2ZjLTcwMTBiYWQ1ZjIyNi8iLCJpYXQiOjE0NTc3Mjk3NjYsIm5iZiI6MTQ1NzcyOTc2NiwiZXhwIjoxNDU3NzMzNjY2LCJhY3IiOiIxIiwiYW1yIjpbInB3ZCJdLCJhcHBpZCI6IjNmMzAzYmJiLTRkNWYtNDVjMi1hZDJiLTcwMzRjMTZmMzhiNiIsImFwcGlkYWNyIjoiMCIsImZhbWlseV9uYW1lIjoiTmV3bWFuIiwiZ2l2ZW5fbmFtZSI6IkRhdmlkIiwiaXBhZGRyIjoiMTY3LjIyMC4wLjE4OCIsIm5hbWUiOiJEYXZpZCBOZXdtYW4iLCJvaWQiOiIxZWJhMjM0NS1mYzcxLTRmZjQtODljYS0yMDE5NWM2YTdjYWMiLCJwdWlkIjoiMTAwMzNGRkY5NjFFRkQ2NyIsInNjcCI6IkNhbGVuZGFycy5SZWFkIENhbGVuZGFycy5SZWFkV3JpdGUgQ29udGFjdHMuUmVhZCBDb250YWN0cy5SZWFkV3JpdGUgRXhjaGFuZ2UuTWFuYWdlIGZ1bGxfYWNjZXNzX2FzX3VzZXIgR3JvdXAuUmVhZC5BbGwgR3JvdXAuUmVhZFdyaXRlLkFsbCBNYWlsLlJlYWQgTWFpbC5SZWFkV3JpdGUgTWFpbC5TZW5kIE1haWxib3hTZXR0aW5ncy5SZWFkV3JpdGUgUGVvcGxlLlJlYWQgUGVvcGxlLlJlYWRXcml0ZSBUYXNrcy5SZWFkIFRhc2tzLlJlYWRXcml0ZSBVc2VyLlJlYWRCYXNpYy5BbGwiLCJzdWIiOiJ5UFZpVHVSQm83QjZTMUhuNXZ1cUY3czAzRVRMSkNGMW9UVmp6eVZIQmVvIiwidGlkIjoiNTM0MTFiOGItMWRlOC00ZDAyLTk3ZmMtNzAxMGJhZDVmMjI2IiwidW5pcXVlX25hbWUiOiJEYXZpZEBkYW5ld21hbi5vbm1pY3Jvc29mdC5jb20iLCJ1cG4iOiJEYXZpZEBkYW5ld21hbi5vbm1pY3Jvc29mdC5jb20iLCJ2ZXIiOiIxLjAifQ.DQIV1RNYAkphRjlWmauDcz1ChBaAYAOcisq9IOulqC33ae7a1sUN84bfv5H97ipIHRNE7RobJaUmQ0BmTYnD9Vzda1X5mVNFkIfx6Zms2lu-rGnnmA25IIilLBw9VA2L3ENHvxprp0tzauGzpwC7XHHuhaaU_strjJcDQFYJxTE9b-9_jvzsWUm8mh1bqIMxM4VypqWeMUbFSoSaWFSpgSrU_6Ewn2WJ2sgboIzGDjdCZChJunM7SeFaTIeBC1GZtc2z0qbpv53RrVU9Eu0LilhRptNGSRx7kMrw4L5Y-QcRG9YucWd7cFKFVWIE8hugb2wNg5caDn0oTVsYJTAXWA";
            xhttpPost.open("POST", "https://outlook.office.com/api/v1.0/me/events", true);
              
           
            xhttpPost.setRequestHeader("Authorization", "Bearer " + acquireToken);
            xhttpPost.setRequestHeader("Content-type", "application/json");
            //xhttpPost.setRequestHeader("X-AnchorMailbox", "david@danewman.onmicrosoft.com");
          
                // console.log("data" + requestData);
                //var options = getRequestBodyOptions();
                //console.log(options);
                //xhttpPost.send(options);

     
            xhttpPost.send('{ "Subject":' + '"' + meetingSubject.value + '",' + '"Body": { "ContentType": "HTML", "Content":' + '"' + str + '"}' + ',"Start":' + '"' + meetingstartDate.value + 'T' + meetingstartTime.value + ':00-08:00' + '"' + ',"StartTimeZone": "Pacific Standard Time","End":' + '"' + meetingendDate.value + 'T' + meetingendTime.value + ':00-08:00' + '"' + ',"EndTimeZone": "Pacific Standard Time"' + ',"Attendees": [ { "EmailAddress": { "Address": "aravin@microsoft.com","Name": "Aravind Namasivayam"},"Type": "Required"}]}');

            xhttpPost.onreadystatechange = function () {
                if (xhttpPost.readyState == 4 && xhttpPost.status == 201) {
                    var data = xhttpPost.responseText;
                    var jsonResponse = JSON.parse(data);
                    console.log("Weblink" + jsonResponse["WebLink"]);
                    document.getElementById("demo").innerHTML = jsonResponse["WebLink"];
                    //document.getElementById("popupsaveschedulemeeting").onclick = function () {
                    location.href = jsonResponse["WebLink"];

                    //function popitup(url) {
                    //    newwindow = window.open(jsonResponse["WebLink"], 'name', 'height=600,width=650');
                    //    if (window.focus) { newwindow.focus() }
                    //    return false;
                    //}

               
                    //}
                }
            }

            var mapWin = window.open(jsonResponse["WebLink"], "_blank", "toolbar=yes, scrollbars=yes, resizable=yes, top=500, left=500, width=1200, height=800"); // Opens a popup   

            setWindowTitle(mapWin) // Starts checking

            function setWindowTitle(mapWin) {
                if (mapWin.document) // If loaded
                {
                    mapWin.document.title = "sdf";
                }
                else // If not loaded yet
                {
                    setTimeout(setWindowTitle, 10); // Recheck again every 10 ms
                }
            }

          //  window.open(jsonResponse["WebLink"], "_blank", "toolbar=yes, scrollbars=yes, resizable=yes, top=500, left=500, width=1200, height=800");

            //$('#dashboardoutput').append(meeting.onlineMeetingUri() + "<br>");
            //    //  $('#dashboardoutput').append(meeting.joinUrl() + "<br>");
            //var str = meeting.joinUrl();
            //var onlineMeetingURL = str.link(meeting.joinUrl());
            //$('#dashboardoutput').append(onlineMeetingURL);
            //displayOutput(str);


            //function outlookUrl() {
            //    window.open(jsonResponse["WebLink"]);
            //}

            }
        });


        //$('#outlook').click(function () {

            
        //    function getRequestBodyOptions() {
        //        var optionsBody = {

        //            Subject: "TESTING IGNORE CALENDAR EVENT CREATED",
        //            Body: {
        //                ContentType: "HTML",
        //                Content: "I think it wil"
        //            }
        //        }
        //        return optionsBody;
        //    };

            
        //    var test = getRequestBodyOptions();
            
        //    console.log("starts test" + test.Subject);
            
        //    //// JSON to be passed 
        //    var requestData = {
                
        //    "Subject": "TESTING IGNORE CALENDAR EVENT CREATED",
        //            "Body": {
        //                "ContentType": "HTML",
        //                "Content": "I think it will meet our requirements! SENT VIA OUTLOOK REST API CODE"
        //            },
        //            //"Start": {
        //            //    "DateTime": "2016-03-03T18:00:00",
        //            //    "TimeZone": "Pacific Standard Time"
        //            //},
        //            //"End": {
        //            //    "DateTime": "2016-03-03T19:00:00",
        //            //    "TimeZone": "Pacific Standard Time"
        //            //},
        //            "Attendees": [
        //              {
        //                  "EmailAddress": {
        //                      "Name": "Aravind Namasivayam",
        //                      "Address": "aravin@microsoft.com"
        //                  },
        //                  "Type": "Required"
        //              }
        //            ]
        //        }
            

        //    //// Outlook calendar event create REST API URL (I censored my api key)
        //    //url = "https://outlook.office.com/api/v1.0/me/events"

        //    //// POST request
        //    //request({
        //    //    url: url,
        //    //    method : "POST",
        //    //    json: requestData,
        //    //    headers: {
        //    //                'content-type': 'application/json',
        //    //                'Authorization': 'Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6Ik1uQ19WWmNBVGZNNXBPWWlKSE1iYTlnb0VLWSIsImtpZCI6Ik1uQ19WWmNBVGZNNXBPWWlKSE1iYTlnb0VLWSJ9.eyJhdWQiOiJodHRwczovL291dGxvb2sub2ZmaWNlLmNvbSIsImlzcyI6Imh0dHBzOi8vc3RzLndpbmRvd3MubmV0LzUzNDExYjhiLTFkZTgtNGQwMi05N2ZjLTcwMTBiYWQ1ZjIyNi8iLCJpYXQiOjE0NTcwMjgyNTgsIm5iZiI6MTQ1NzAyODI1OCwiZXhwIjoxNDU3MDMyMTU4LCJhY3IiOiIxIiwiYW1yIjpbInB3ZCJdLCJhcHBpZCI6IjNmMzAzYmJiLTRkNWYtNDVjMi1hZDJiLTcwMzRjMTZmMzhiNiIsImFwcGlkYWNyIjoiMCIsImZhbWlseV9uYW1lIjoiTmV3bWFuIiwiZ2l2ZW5fbmFtZSI6IkRhdmlkIiwiaXBhZGRyIjoiMTA3LjE0Ny40LjI0MCIsIm5hbWUiOiJEYXZpZCBOZXdtYW4iLCJvaWQiOiIxZWJhMjM0NS1mYzcxLTRmZjQtODljYS0yMDE5NWM2YTdjYWMiLCJwdWlkIjoiMTAwMzNGRkY5NjFFRkQ2NyIsInNjcCI6IkNhbGVuZGFycy5SZWFkIENhbGVuZGFycy5SZWFkV3JpdGUgQ29udGFjdHMuUmVhZCBDb250YWN0cy5SZWFkV3JpdGUgRXhjaGFuZ2UuTWFuYWdlIGZ1bGxfYWNjZXNzX2FzX3VzZXIgR3JvdXAuUmVhZC5BbGwgR3JvdXAuUmVhZFdyaXRlLkFsbCBNYWlsLlJlYWQgTWFpbC5SZWFkV3JpdGUgTWFpbC5TZW5kIE1haWxib3hTZXR0aW5ncy5SZWFkV3JpdGUgUGVvcGxlLlJlYWQgUGVvcGxlLlJlYWRXcml0ZSBUYXNrcy5SZWFkIFRhc2tzLlJlYWRXcml0ZSBVc2VyLlJlYWRCYXNpYy5BbGwiLCJzdWIiOiJ5UFZpVHVSQm83QjZTMUhuNXZ1cUY3czAzRVRMSkNGMW9UVmp6eVZIQmVvIiwidGlkIjoiNTM0MTFiOGItMWRlOC00ZDAyLTk3ZmMtNzAxMGJhZDVmMjI2IiwidW5pcXVlX25hbWUiOiJEYXZpZEBkYW5ld21hbi5vbm1pY3Jvc29mdC5jb20iLCJ1cG4iOiJEYXZpZEBkYW5ld21hbi5vbm1pY3Jvc29mdC5jb20iLCJ2ZXIiOiIxLjAifQ.W0sH16jd0iZL54ch4G76aKNMnL5aEtLNPIg_wtmERwt7NCSLkfMJ0fDvCr1s_QM-mr43h2OmUNJ1pfvNg5zrP373NuhieQmKaPHmuen21pf3IucqVKMnd0pBbsW4JFBvmQ9Rk47ShvyFlYrdda7xobfgOBazlquNBbAsfRu3ZiLieCMo8rgt0eDHygTV1nTn2Ps7Hj1V3GP-hWecQL9_VdBJKclIlAU8D05vYAdYCsyLkvi4j9HiBRP_PuWhENoM5OavOmmDUtN7JkWGD7O2xnJV7_N1G6fFVh3ZXyRQgs5xNrBn9dQzrGMbA4o-ODe10In2UV-G2qFIigwx_qlfgg',
        //    //                'X-AnchorMailbox' : 'david@danewman.onmicrosoft.com',
        //    //    },
        //    //}, function (error, response, body) {
        //    //    if (!error && response.statusCode === 201) {
        //    //        console.log(body)
        //    //    }
        //    //    else {
        //    //        console.log("error: " + error)
        //    //        console.log("response.statusCode: " + response.statusCode)
        //    //        console.log("response.statusText: " + response.statusText)
        //    //    }
        //    //})

        //    //var xhttpGet = new XMLHttpRequest();
        //    //xhttpGet.onreadystatechange = function () {
        //    //    if (xhttpGet.readyState == 4 && xhttpGet.status == 200) {
        //    //        document.getElementById("demo").innerHTML = xhttpGet.responseText;
        //    //    }
        //    //};
        //    //xhttpGet.open("GET", "https://outlook.office.com/api/v1.0/me", true);
        //    //xhttpGet.setRequestHeader("Content-type", "application/json");
        //    //xhttpGet.setRequestHeader("Authorization", "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6Ik1uQ19WWmNBVGZNNXBPWWlKSE1iYTlnb0VLWSIsImtpZCI6Ik1uQ19WWmNBVGZNNXBPWWlKSE1iYTlnb0VLWSJ9.eyJhdWQiOiJodHRwczovL291dGxvb2sub2ZmaWNlLmNvbSIsImlzcyI6Imh0dHBzOi8vc3RzLndpbmRvd3MubmV0LzUzNDExYjhiLTFkZTgtNGQwMi05N2ZjLTcwMTBiYWQ1ZjIyNi8iLCJpYXQiOjE0NTcwMTM0OTYsIm5iZiI6MTQ1NzAxMzQ5NiwiZXhwIjoxNDU3MDE3Mzk2LCJhY3IiOiIxIiwiYW1yIjpbInB3ZCJdLCJhcHBpZCI6IjNmMzAzYmJiLTRkNWYtNDVjMi1hZDJiLTcwMzRjMTZmMzhiNiIsImFwcGlkYWNyIjoiMCIsImZhbWlseV9uYW1lIjoiTmV3bWFuIiwiZ2l2ZW5fbmFtZSI6IkRhdmlkIiwiaXBhZGRyIjoiMTA3LjE0Ny40LjI0MCIsIm5hbWUiOiJEYXZpZCBOZXdtYW4iLCJvaWQiOiIxZWJhMjM0NS1mYzcxLTRmZjQtODljYS0yMDE5NWM2YTdjYWMiLCJwdWlkIjoiMTAwMzNGRkY5NjFFRkQ2NyIsInNjcCI6IkNhbGVuZGFycy5SZWFkIENhbGVuZGFycy5SZWFkV3JpdGUgQ29udGFjdHMuUmVhZCBDb250YWN0cy5SZWFkV3JpdGUgRXhjaGFuZ2UuTWFuYWdlIGZ1bGxfYWNjZXNzX2FzX3VzZXIgR3JvdXAuUmVhZC5BbGwgR3JvdXAuUmVhZFdyaXRlLkFsbCBNYWlsLlJlYWQgTWFpbC5SZWFkV3JpdGUgTWFpbC5TZW5kIE1haWxib3hTZXR0aW5ncy5SZWFkV3JpdGUgUGVvcGxlLlJlYWQgUGVvcGxlLlJlYWRXcml0ZSBUYXNrcy5SZWFkIFRhc2tzLlJlYWRXcml0ZSBVc2VyLlJlYWRCYXNpYy5BbGwiLCJzdWIiOiJ5UFZpVHVSQm83QjZTMUhuNXZ1cUY3czAzRVRMSkNGMW9UVmp6eVZIQmVvIiwidGlkIjoiNTM0MTFiOGItMWRlOC00ZDAyLTk3ZmMtNzAxMGJhZDVmMjI2IiwidW5pcXVlX25hbWUiOiJEYXZpZEBkYW5ld21hbi5vbm1pY3Jvc29mdC5jb20iLCJ1cG4iOiJEYXZpZEBkYW5ld21hbi5vbm1pY3Jvc29mdC5jb20iLCJ2ZXIiOiIxLjAifQ.afFTezYQFRZLoG5kHtk5iFTW6MUoMazH5EDQpz1QJaMjGESfXaf_ylsg_1p2A87iVOYoB546FeJ9RhhYm03YVycjMep22-Yy6-FNlDyM6c__raMEB3Z_XCYKKDgFaP4BcfkRvcLlAN3xvNeFpjZJnFC_zLwo7VBGyCrRFWkAX3RuzJFh2wLu0PQi1Ath6fYidhD_2zsNCne5DdWZvDAuBYEPpFm_r3LT1TGdHw48cGo-9btZw_LI2Hd1tyiv48DHUaTRXJFeVZCiYT7VLe2SfSh-PPU1aUqn7eeatGNH_jUKXEY__BFFINvpncrC5WGw354aMRS84VY3EBLWxzTTNQ");
        //    //xhttpGet.setRequestHeader("X-AnchorMailbox", "david@danewman.onmicrosoft.com");
        //    //xhttpGet.send();

        //    var xhttpPost = new XMLHttpRequest();
        //    xhttpPost.onreadystatechange = function () {
        //        if (xhttpPost.readyState == 4 && xhttpPost.status == 201) {
        //            var data = xhttpPost.responseText;
        //            var jsonResponse = JSON.parse(data);
        //            console.log("Weblink" + jsonResponse["WebLink"]);
        //            document.getElementById("demo").innerHTML = jsonResponse["WebLink"];
        //            document.getElementById("scheduleRest").onclick = function () {
        //                location.href = jsonResponse["WebLink"];

                     
        //            }
        //        }
        //    };
        //    xhttpPost.open("POST", "https://outlook.office.com/api/v1.0/me/events", true);
        //    xhttpPost.setRequestHeader("Content-type", "application/json"); 
        //    xhttpPost.setRequestHeader("Authorization", "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsIng1dCI6Ik1uQ19WWmNBVGZNNXBPWWlKSE1iYTlnb0VLWSIsImtpZCI6Ik1uQ19WWmNBVGZNNXBPWWlKSE1iYTlnb0VLWSJ9.eyJhdWQiOiJodHRwczovL291dGxvb2sub2ZmaWNlLmNvbSIsImlzcyI6Imh0dHBzOi8vc3RzLndpbmRvd3MubmV0LzUzNDExYjhiLTFkZTgtNGQwMi05N2ZjLTcwMTBiYWQ1ZjIyNi8iLCJpYXQiOjE0NTc1Njc2NjQsIm5iZiI6MTQ1NzU2NzY2NCwiZXhwIjoxNDU3NTcxNTY0LCJhY3IiOiIxIiwiYW1yIjpbInB3ZCJdLCJhcHBpZCI6IjNmMzAzYmJiLTRkNWYtNDVjMi1hZDJiLTcwMzRjMTZmMzhiNiIsImFwcGlkYWNyIjoiMCIsImZhbWlseV9uYW1lIjoiTmV3bWFuIiwiZ2l2ZW5fbmFtZSI6IkRhdmlkIiwiaXBhZGRyIjoiMTY3LjIyMC4xLjE4OCIsIm5hbWUiOiJEYXZpZCBOZXdtYW4iLCJvaWQiOiIxZWJhMjM0NS1mYzcxLTRmZjQtODljYS0yMDE5NWM2YTdjYWMiLCJwdWlkIjoiMTAwMzNGRkY5NjFFRkQ2NyIsInNjcCI6IkNhbGVuZGFycy5SZWFkIENhbGVuZGFycy5SZWFkV3JpdGUgQ29udGFjdHMuUmVhZCBDb250YWN0cy5SZWFkV3JpdGUgRXhjaGFuZ2UuTWFuYWdlIGZ1bGxfYWNjZXNzX2FzX3VzZXIgR3JvdXAuUmVhZC5BbGwgR3JvdXAuUmVhZFdyaXRlLkFsbCBNYWlsLlJlYWQgTWFpbC5SZWFkV3JpdGUgTWFpbC5TZW5kIE1haWxib3hTZXR0aW5ncy5SZWFkV3JpdGUgUGVvcGxlLlJlYWQgUGVvcGxlLlJlYWRXcml0ZSBUYXNrcy5SZWFkIFRhc2tzLlJlYWRXcml0ZSBVc2VyLlJlYWRCYXNpYy5BbGwiLCJzdWIiOiJ5UFZpVHVSQm83QjZTMUhuNXZ1cUY3czAzRVRMSkNGMW9UVmp6eVZIQmVvIiwidGlkIjoiNTM0MTFiOGItMWRlOC00ZDAyLTk3ZmMtNzAxMGJhZDVmMjI2IiwidW5pcXVlX25hbWUiOiJEYXZpZEBkYW5ld21hbi5vbm1pY3Jvc29mdC5jb20iLCJ1cG4iOiJEYXZpZEBkYW5ld21hbi5vbm1pY3Jvc29mdC5jb20iLCJ2ZXIiOiIxLjAifQ.I2nIyIwLL1LlXM4qMP1TIHFpGFgYWVDuPs8fa1WSj5lVPh-flkO4GBLgauyWtKcoHXN1fUtiiCcJwuVYhV0Ah217vIedfI6S7vo28Ay6yLwtWzKLOWWnKsoIZDkd2blrypH0qiJWSda22Qf-NLEY_eAP3r6u3kKW8pU9TETWGaQEsbGypjCECQVZsvJ4-CnTJ-n1MGB1tD0MofWiXT3uQm16GEusySiQbivE2fq5z2dCtxN6xKXumN7Ejn56ldUNhJ7VYVeUarAFAvUuiNJ6kWQ5EroYAknGBNxiiFGaiVCeAEktsh8kuqpf1fu8hhjsnq6pC6xP6_lfaVU69lwE2Q");
        //    xhttpPost.setRequestHeader("X-AnchorMailbox", "david@danewman.onmicrosoft.com");

        //    // console.log("data" + requestData);
        //    //var options = getRequestBodyOptions();
        //    //console.log(options);
        //    //xhttpPost.send(options);
            
        //    xhttpPost.send('{ "Subject": "Skype Meeting Tesla CloudHub + Anypoint Connectors Test","Attendees": [ { "EmailAddress": { "Address": "aravin@microsoft.com","Name": "Aravind Namasivayam"},"Type": "Required"}]}');
            
            

        //    //xhttpPost.send('Subject=Discuss the Calendar REST API' + 'Body=I think it will meet our requirements');
        //    //var json_data = xhttpPost.responseText;
        //    //console.log("Text" + xhttpPost.responseText);
        //    //console.log("Body" + xhttpPost.responseBody);
        //    //console.log("Type" + xhttpPost.responseType);
        //    //console.log("XML" + xhttpPost.responseXML);

           

        //   // console.log("response data url" + json_data);
            


        //    //console.log (xhttp.getResponseHeader(name));
           
        //    //var http = require('http');

        //    //var app = http.createServer(function (req, res) {
        //    //    res.setHeader('Content-Type', 'application/json');
        //    //    res.send(JSON.stringify({ a: 1 }, null, 3));
        //    //});
        //    //app.listen(3000);

        //    //console.log("TEXT"+ xhttp.responseText);
        //    //console.log("RESPONSE" + xhttp.response);
        //    //console.log("Body" + xhttp.responseBody);

        //    //log("Refresh token" + AuthModule_1.refreshToken);
        //    //log("Actual token" + AuthModule_1.Token);
        //    //$.post("");

        //    function outlookUrl() {
        //        window.open(jsonResponse["WebLink"]);
        //    }

          
        //});

        // when the user clicks on the "Sign Out" button
        $('#signout').click(function () {
            // start signing out
           

            log("Signing Out");
            client.signInManager.signOut().then(
                    //onSuccess callback
                    function () {
                        // and report the success
                        log('Signed out');
                        $('#loginbox').show();
                        $('#signin').show();
                        $('#signout').hide();
                        $('#userdetails').hide();
                        client = new Application();
                    },
                //onFailure callback
                function (error) {
                    // or a failure
                    log(error || 'Cannot Sign Out');
                });
        });
    })();

});