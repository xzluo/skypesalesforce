/**
 * This script demonstrates how to sign the user in and how to sign it out.
 */
$(function () {
    'use strict';

    // create an instance of the Application object;
    // note, that different instances of Client may
    // represent different users
    var client = new Skype.Web.Model.Application;

    // whenever client.state changes, display its value
    client.signInManager.state.changed(function (state) {
        $('#client_state').text(state);
    });

    window.webTicketReady = function () {
        $('#waiting').text('READY To Start Sign In :)');
    }

    // when the user clicks on the "Sign In" button
    $('#signin').click(function () {
        var uri = $('#username').text();
        var username = uri;
        var password = $('#password').text();
        var topoParams = {
            domainName: 'devex.ccsctp.net',
            authType: 'oauth',
            clientID: 'd3590ed6-52b3-4102-aeff-aad2292ab01c',
            resourceAppIdUrl: 'https://webdir0d.tip.lync.com',
            authorityUrl: 'https://login.windows-ppe.net/common/oauth2/authorize/',
            ucwaServerFQDN: 'https://webdir0d.tip.lync.com',
            origins: [{
                origin: 'https://webdir0d.tip.lync.com/autodiscover/autodiscoverservice.svc/root?originalDomain=devex.ccsctp.net',
                xframe: 'https://webdir0d.tip.lync.com/xframe'
            }]
        };

        var userParams = {
            uri: uri,
            username: username,
            password: password
        };

        var webTicket;

        getWebTicket(topoParams, userParams).then(function (ticket) {
            webTicket = ticket;

            $('#waiting').text('Obtained web ticket, started signing in ... :)')
            function auth(token) {
                var access_token = token;
                return function auth(req, send) {
                    if (req.url.indexOf('/ucwa') === 0 || req.url.indexOf(topoParams.ucwaServerFQDN) === 0) {
                        req.headers['Authorization'] = 'Bearer ' + access_token.trim();
                    }
                    return send(req);
                }
            }

            client.signInManager.signIn({
                auth: auth(webTicket),
                origins: topoParams.origins
            }).then(function () {
                // when the sign in operation succeeds display the user name
                alert('Signed in as ' + client.personsAndGroupsManager.mePerson.displayName());
            }, function (error) {
                // if something goes wrong in either of the steps above,
                // display the error message
                alert(error || 'Cannot sign in');
            });
        });
    });

    // when the user clicks on the "Sign Out" button
    $('#signout').click(function () {
        // start signing out
        client.signInManager.signOut()
            .then(function () {
                // and report the success
                alert('Signed out');
            }, function (error) {
                // or a failure
                alert(error || 'Cannot sign out');
            });
    });
});
