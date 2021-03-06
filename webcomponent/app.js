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
    
    var App = (function () {
        function App(){}
        
        log("App Loaded");
        $('#signout').hide();
        $('#userdetails').hide();
        $('#whoami').hide();
        $('#pullcontacts').hide();
        $('#getcontacts').hide();
        $('#createMeeting').hide();
        $('#schedulemeeting').hide();
        $('#contactdetails').hide();


        var Application
        var client;

        //Skype.initialize({
        //    apiKey: 'SWX-BUILD-SDK',
        //}, function (api) {
        //    Application = api.application;
        //    client = new Application();
        //}, function (err) {
        //    log('some error occurred: ' + err);
        //});

        Application = Skype.Web.Model.Application;

        client = new Application();

        log("Client Created");

        // when the user clicks the "Sign In" button
        $('#signin').click(function () {
            $('#signin').hide();
            log('Signing in...');
            
            // window.location.origin is not available in older versions of IE
            if (!window.location.origin) {
                window.location.origin = window.location.protocol + "//" + window.location.hostname +
                    (window.location.port ? ':' + location.port : '');
                    log (window.location.origin);
            }
            if (window.serviceRegionalBaseUrl) {
                window.serviceRegionalBaseUrl = 'https://' + window.serviceRegionalBaseUrl;
                log (window.serviceRegionalBaseUrl);
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
             console.log("AAD TOKEN IS:::::::::" + token);
                        var origins = [
                           'https://webdir.tip.lync.com/autodiscover/autodiscoverservice.svc/root',
                           'https://webdir0d.tip.lync.com/autodiscover/autodiscoverservice.svc/root',
                           'https://webdir.online.lync.com/autodiscover/autodiscoverservice.svc/root',
                           'https://webdir0m.online.lync.com/autodiscover/autodiscoverservice.svc/root',
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
                        //auth: auth,
                        client_id: '95899b4e-ca0b-4a09-b696-edd9229c4e56',
                        //oauth_uri: '...',
                        origins: origins
                    }).then(function () {
                log('Logged In Succesfully');
                    });
             });
        });


        // when the user clicks the "Sign In" button
        $('#implicitsignin').click(function () {

            $('#signin').hide();
            log('Entering Implicit in...');

            var Application = Skype.Web.Model.Application;
            client = new Application();
            var origins = [
                           'https://webdir.tip.lync.com/autodiscover/autodiscoverservice.svc/root',
                           'https://webdir0d.tip.lync.com/autodiscover/autodiscoverservice.svc/root',
                           'https://webdir.online.lync.com/autodiscover/autodiscoverservice.svc/root',
                           'https://webdir0m.online.lync.com/autodiscover/autodiscoverservice.svc/root',
            ];


            var options = {
                id: '9b0fdb2a252c4aca56847b17d11c5e5a',
                // client_id: 'e48d4214-364e-4731-b2b6-47dabf529218',
                client_id: '95899b4e-ca0b-4a09-b696-edd9229c4e56',
                //oauth_uri: 'https://login.microsoftonline.com/common/oauth2/authorize?domain_hint=microsoft.com',
                oauth_uri: 'https://login.windows-ppe.net/common/oauth2/authorize?domain_hint=s4bwebsdk.ccsctp.net',
                origins: origins,
            }

            log("before function");
            log(client.personsAndGroupsManager.mePerson.displayName);
            client.signInManager.signIn(options).then(function () {
                log('Signed in as ' + client.personsAndGroupsManager.mePerson.displayName());
            });

            log("completed");
            $('#loginbox').hide();
            $('#signout').show();
            $('#whoami').show();
            $('#pullcontacts').show();
            $('#getcontacts').show();
            $('#schedulemeeting').show();

        });

        // when the user clicks on the "Who AM I" button
        $('#whoami').click(function () {
            $('#userdetails').show();
            var me = client.personsAndGroupsManager.mePerson;
            log("Looking for title...");
            me.title.get().then(function (value) {
                log(value);
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

        // when the user clicks on the "Pull My Contacts" button
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

        $('#schedulemeeting').click(function () {
            $('#createMeeting').show();
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