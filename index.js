$(function () {
    'use strict';

    var client = new Skype.Web.Model.Application;
    var guid = Skype.Web.Utils.guid;
    var lblStatus = $('#status');
    var lblDevices = $('#devices');
    var signedIn;
    var meeting;

    // reads a param from the query part of the URL
    function qparam(name) {
        var rx = new RegExp('\\b' + name + '=([^#&]*)');
        var mp = rx.exec(location.search);
        if (mp) return decodeURIComponent(mp[1]);
    }

    if (qparam('username')) $('#username').text(qparam('username'));
    if (qparam('password')) $('#password').text(qparam('password'));

    // when the user clicks on the "Sign In" button
    $('#signin').click(function () {
        if (!signedIn) {
            var changed = function (value) {
                status(value);
            };

            // start signing in
            client.signInManager.signIn({
                username: $('#username').text(),
                password: $('#password').text()
            }).then(function () {
                status('Signed in as ' + client.personsAndGroupsManager.mePerson.displayName());
                signedIn = true;

                $('.signinframe').hide();
                $('.meetingOptions').show();

                client.conversations.added(function (conversation) {
                    conversation.modalities.removed(function (modality) {
                        if (modality.is('Messaging')) {
                            status('Leaving messaging');
                            $('.messaging').hide();
                        }
                    });
                });

                client.personsAndGroupsManager.all.persons.subscribe();

                client.personsAndGroupsManager.all.persons.added(function (contact) {
                    var attendee = $('<option/>');
                    var leader = $('<option/>');

                    contact.displayName.get().then(function (name) {
                        attendee.text(name);
                        leader.text(name);
                    });

                    contact.id.get().then(function (uri) {
                        attendee.val(uri);
                        leader.val(uri);
                    });

                    $('#attendees').append(attendee);
                    $('#leaders').append(leader);
                });
            }, function (error) {
                // if something goes wrong in either of the steps above,
                // display the error message
                console.error(error);
                changed = null;
                status('Cannot sign in: ' + error || 'Cannot sign in');
            })
            .status.changed(function (status) {
                if (changed) {
                    changed(status);
                }
            });
        }
    });

    // when the user clicks on the "Sign Out" button
    $('#signout').click(function () {
        $('.signinframe').show();
        $('.meetingOptions').hide();
        $('.actions').hide();
        $('.messaging').hide();
        $('#chathistory').html('');
        $('#chatinput').text('');
        lblStatus.html('');

        // start signing out
        client.signInManager.signOut().then(function () {
            // and report the success
            alert('Signed out');
            signedIn = false;
        }, function (error) {
            // or a failure
            alert(error || 'Cannot sign out');
            signedIn = false;
        });
    });

    $('#scheduleMeeting').click(function () {
        if (client) {
            var options = getMeetingOptions();

            client.scheduleMeeting(options).then(function (m) {
                $('#expirationTime').val(0);
                $('.actions').show();
                meeting = m;
            });
        }
    });

    $('#updateMeeting').click(function () {
        if (meeting) {
            var options = getMeetingOptions();

            if (options.accessLevel) {
                meeting.accessLevel(options.accessLevel);
            }

            if (options.attendees) {
                meeting.attendees(options.attendees);
            }

            if (options.description) {
                meeting.description(options.description);
            }

            if (options.entryExitAnnouncement) {
                meeting.entryExitAnnouncement(options.entryExitAnnouncement);
            }

            if (options.expirationTime) {
                meeting.expirationTime(options.expirationTime);
            }

            if (options.leaders) {
                meeting.leaders(options.leaders);
            }

            if (options.lobbyBypassForPhoneUsers) {
                meeting.lobbyBypassForPhoneUsers(options.lobbyBypassForPhoneUsers);
            }

            if (options.phoneUserAdmission) {
                meeting.phoneUserAdmission(options.phoneUserAdmission);
            }

            if (options.subject) {
                meeting.subject(options.subject);
            }
        }
    });

    function getMeetingOptions() {
        var options = {
            accessLevel: $('#accessLevel option:selected').val(),
            attendees: [],
            automaticLeaderAssignment: $('#automaticLeaderAssignment option:selected').val(),
            description: $('#description').text(),
            entryExitAnnouncement: $('#entryExitAnnouncement option:selected').val(),
            expirationTime: $('#expirationTime').val(),
            leaders: [],
            lobbyBypassForPhoneUsers: $('#lobbyBypassForPhoneUsers option:selected').val(),
            phoneUserAdmission: $('#phoneUserAdmission option:selected').val(),
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

    $('#joinConference').click(function () {
        if (client && meeting) {
            status("Joining meeting: " + meeting.onlineMeetingUri());
            status("Join URL: " + meeting.joinUrl());

            var dfd = client.startMeeting({
                subject: meeting.subject(),
                priority: 'Normal',
                threadId: guid(),
                uri: meeting.onlineMeetingUri()
            });

            handleMessaging(dfd);
        }
    });

    $('#addParticipant').click(function () {
        var conv = client.conversations(0),
            uri = $('#participant').text(),
            dfd;

        if (conv) {
            dfd = conv.addParticipant(uri);
            status('Adding participant', dfd);
        }
    });

    // creates a DOM element on top of Model.Message
    function createMessageView(message) {
        var domSenderName = $('<div>').addClass('sender');
        var domMessageText = $('<div>').addClass('text');
        var domMessage = $('<div>').addClass('message');

        domMessage.append(domSenderName, domMessageText);

        bindText(domSenderName, message.sender.name, function (name) {
            return name || message.sender.uri() || 'Unknown Participant';
        });

        bindText(domMessageText, message.text, function (text) {
            return text || '<empty message>';
        });

        return domMessage;
    }

    // bind a DOM element's contents to a text property
    function bindText(dom, property, transform) {
        dom.text(transform(property()));

        property.subscribe();
        property.changed(function (text) {
            dom.text(transform(text));
        });
    }

    // displays the status of an operation
    function status(value, dfd) {
        if (dfd) {
            dfd.then(function () {
                lblStatus.append($('<div>').text(value + ': ' + 'Succeeded'));
            }, function (error) {
                lblStatus.append($('<div>').text(value + ': ' + (error || 'Failed')));
            });

            dfd.status('changed', function (status) {
                lblStatus.append($('<div>').text(value + ': ' + status));
            });
        } else {
            lblStatus.append($('<div>').text(value));
        }
    }

    // handles the result of messaging modality
    function handleMessaging(dfd) {
        dfd.then(function () {
            status('Established messaging');
            $('#chathistory').html('');
            $('#chatinput').text('');
            $('.messaging').show();

            var conv = client.conversations(0);
            var messaging = conv.modalities('Messaging');

            messaging.messages.added(function (message) {
                $('#chathistory').append(createMessageView(message));
                console.log('+message,', message);
            });

            $('#chatinput').on('keypress', function (event) {
                var text = $('#chatinput').text();

                if (event.which === 13) {
                    status('Sending ' + text);
                    $('#chatinput').text('');

                    messaging.send(text).then(function () {
                        status('The message has been sent');
                    }, function (error) {
                        status(error || 'Failed to send the message');
                    });

                    return false;
                }
            });
        }, function (error) {
            status(error || 'Failed to establish messaging');
        });
    }
});