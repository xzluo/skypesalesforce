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
        $('#signin').click(function () {
            $('#signin').hide();
            log('Signing in...');
            
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
              if (isIframe) {
                Logger_1.default.log('Running in an iframe, stoppig now.');
                return;
            }
            
             AuthModule_1.default.instance.refreshToken(function (error, token) {
               var origins = [
                      'https://webdir.tip.lync.com/autodiscover/autodiscoverservice.svc/root',
                      'https://webdir0d.tip.lync.com/autodiscover/autodiscoverservice.svc/root',
                      'https://webdir.online.lync.com/autodiscover/autodiscoverservice.svc/root',
                      'https://webdir0m.online.lync.com/autodiscover/autodiscoverservice.svc/root'
                  ];

               function auth(req, send) {
                        if (req.url.match(/https:\/\/webdir0d/)) {
                            req.headers['Authorization'] = 'Bearer ' + token.trim();
                        } else if (req.url.match(/https:\/\/webpoolbn10m03/)) {
                            req.headers['Authorization'] = 'Bearer ' + token.trim();
                        } else {
                            req.headers['Authorization'] = 'Bearer ' + token.trim();
                        }
                        log(req);
                        return send(req);
                    }
                   
                    client.signInManager.signIn({
                      auth: auth,
                        client_id: 'c050aba1-6509-4a0a-81f9-7ec4c0667010',
                        //oauth_uri: '...',
                        origins: origins,
                        //use_cwt: true,
                       // enableInternalNS: false,
                    }).then(function () {
                        log('Logged In Succesfully');
                    });
             });
        });

        // IMPLICIT FLOW
        $('#implicitsignin').click(function () {

            $('#signin').hide();
            $('#implicitsignin').hide();
           
            log('Entering Implicit in...');

            var Application = Skype.Web.Model.Application;
            client = new Application();
          var origins = [
                'https://webdir.tip.lync.com/autodiscover/autodiscoverservice.svc/root',
                'https://webdir0d.tip.lync.com/autodiscover/autodiscoverservice.svc/root',
                'https://webdir.online.lync.com/autodiscover/autodiscoverservice.svc/root',
                'https://webdir0m.online.lync.com/autodiscover/autodiscoverservice.svc/root'
            ];
 

            var options = {
                id: '9b0fdb2a252c4aca56847b17d11c5e5a',
                client_id: 'c050aba1-6509-4a0a-81f9-7ec4c0667010',
                //oauth_uri: 'https://login.microsoftonline.com/common/oauth2/authorize?domain_hint=microsoft.com',
                oauth_uri: 'https://login.windows-ppe.net/common/oauth2/authorize?domain_hint=lyncnadbr.ccsctp.net',
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
                $('#whoami').show();
                $('#pullcontacts').show();
                $('#getcontacts').show();
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
            if (client) {
                log("Schedule meeting");
                var options = getMeetingOptions();

               // client.scheduleMeeting(options).then(function (m) {
                client.startMeeting(options).then(function (m) {
                    meeting = m;
                });
            }
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

               // $('#dashboardoutput').append(meeting.onlineMeetingUri() + "<br>");
                //  $('#dashboardoutput').append(meeting.joinUrl() + "<br>");
                var str = meeting.meeting.joinUrl();
                var onlineMeetingURL = str.link(meeting.meeting.joinUrl());
                $('#dashboardoutput').append(onlineMeetingURL);

                displayOutput(str);
       
            }
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

            

                myPopup(encodeURIComponent(meetingSubject.value), encodeURIComponent(meetingstartDate.value), encodeURIComponent(meetingendDate.value), encodeURIComponent(meetingstartTime.value), encodeURIComponent(meetingendTime.value));

                $('#dashboardoutput').append(meeting.onlineMeetingUri() + "<br>");
                //  $('#dashboardoutput').append(meeting.joinUrl() + "<br>");
                var str = meeting.joinUrl();
                var onlineMeetingURL = str.link(meeting.joinUrl());
                $('#dashboardoutput').append(onlineMeetingURL);
                displayOutput(str);

            }
        });

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