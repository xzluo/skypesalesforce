/**
 * jLync UI controls.
 *
 * This is the view layer in Skype.Web.View built on
 * top of the model layer in Skype.Web.Model namespace.
 *
 * Every UI control is represented by a function-constructor
 * that constructs with jQuery API a DOM element that can be
 * then used as any other DOM element: for example, it can be
 * inserted in any place in the HTML page.
 *
 * The view layer is based on two ideas:
 *
 *  1.  All UI controls are created by View.Factory which holds an
 *      instance of Model.Application and provide factorys methods to create
 *      UI controls - one method per UI control. All factory methods
 *      behave in a very similar way and perform three actions:
 *
 *          -   A factory method (e.g. View.Factory.ContactCard) takes
 *              a simple parameter (e.g. "antonkh") for the corresponding
 *              UI control. This simple parameter is enough to construct
 *              the corresponding model (e.g. Model.Contact).
 *
 *          -   Then the factory method asynchronously creates the corresponding
 *              model (e.g. Model.Contact) and creates a Promise that resolves
 *              to the model after it's created.
 *
 *          -   At last the factory method invokes the constructor of
 *              the UI control and gives to it the created Promise which, as
 *              it was mentioned, resolves to the corresponding model.
 *
 *  2.  Every constructor function of a UI control takes a Promise as an argument
 *      which resolves to the model. While the Promise is resolving, the constructor
 *      creates a DOM element and returns it. This allows to show the UI control
 *      to the user right away. And after the Promise resolves, the UI control
 *      updates the created DOM element appropriately.
 *
 * @authors antonkh
 * @created July 2013
 * @namespace Skype.Web.View
 * @dependency jLync/lync - The model layer.
 */

(function () {
    'use strict';

    /* global $:false */

    //#region Imports (from Skype.Web.Model)

    var Model = Skype.Web.Model;
    var Utils = Skype.Web.Utils;

    var wait = Utils.Task.wait;
    var assert = Utils.assert;
    var foreach = Utils.foreach;

    //#endregion

    //#region Factory

    /**
    * The view factory creates UI controls. A UI control
    * is a jQuery element linked to corresponding models.
    *
    * @param creds - The credentials to sign in to the Lync server.
    *
    * @method ContactPresence(id) - @see ContactPresence
    * @method ContactCard(id) - @see ContactCard
    * @method ConversationWindow(id) - @see ConversationWindow
    * @method ContactList() - @see Group
    * @method Groups() - @see GroupList
    *
    * @example
    *
    *      To use any of the above mentioned UI controls,
    *      an instance of the factory needs to be created and
    *      a created UI control must be insrted into the DOM
    *      tree using the jQuery API:
    *
    *          var factory = Factory({
    *              username: 'user1@contnoso.com',
    *              password: 'JU!78e*%wjjhJ&&61'
    *          });
    *
    *          $('body').append(factory.ContactList());
    *          factory.ContactCard('user2').appendTo($('body'));
    */
    function Factory(creds) {
        assert(creds);

        var client = Model.Application();
        var signin = client.signInManager.signIn(creds);
        var contactsCache = {}; // contactsCache[id] = contact model        
        var methods = {}; // factory methods

        /**
        * Asynchronously returns the Me model.
        */
        function getMe() {
            return signin.then(function () {
                return client.personsAndGroupsManager.mePerson;
            });
        }

        /**
        * Asynchronously finds a contact and returns it.
        *
        * @param {string} id
        *
        * @returns {Promise} - It resolves to a Model.Contact.
        */
        function getContact(id) {
            assert(id);

            return signin.then(function () {
                return contactsCache[id] || client.search({ query: id, limit: 1 });
            }).then(function (sr) {
                var contact = sr.contacts[0];

                if (!contact)
                    throw new Error(id + ' not found');

                contactsCache[id] = contact;
                return contact;
            });
        }

        /**
        * Asynchronously returns a conversation model with the
        * given contact model.
        *
        * @param {Promise} participant - It resolves to the contact model.
        *
        * @returns {Promise} - It resolves to the conversation model.
        */
        function getConversation(participant) {
            return participant.then(function (contact) {
                return client.startMessaging({
                    to: contact.uri(),
                    subject: 'jLync/1.0 Test',
                    message: 'How are you?'
                });
            });
        }

        /**
        * Defines a factory method that creates a jLync UI control.
        */
        function define(name, method) {
            assert(!methods[name]);
            assert(method);

            methods[name] = function () {
                return method.apply(null, [].slice.call(arguments, 0)).addClass('lync-ui-control');
            };
        }

        define('MePresenceAndName', function () {
            // Me and Contact have different interfaces, but
            // ContactPresence uses only "name" and "presence"
            // that are provided by both classes
            return ContactPresence(getMe(), 'Me');
        });

        define('MeCard', function () {
            return MeCard(getMe());
        });

        define('ContactPresence', function (id) {
            return ContactPresence(getContact(id), id);
        });

        define('ContactHeader', function (id) {
            return ContactHeader(getContact(id), id);
        });

        define('ContactCard', function (id) {
            return ContactCard(getContact(id), id);
        });

        define('ConversationWindow', function (id) {
            var contact = getContact(id);
            var conversation = getConversation(contact);

            return ConversationWindow(contact, conversation, id);
        });

        define('ContactList', function () {
            return Group(signin.then(function () {
                return client.personsAndGroupsManager.all.persons;
            }), 'Contact List');
        });

        define('Groups', function () {
            return GroupList(signin.then(function () {
                return client.personsAndGroupsManager.all.groups;
            }));
        });

        return methods;
    }

    //#endregion

    //#region MeCard

    /**
    * MeCard is built on top of Model.Me and
    * represents a DOM element that lets see and change
    * some properties of the currently signed in user,
    * such as the presence availability state.
    *
    * @returns a jQuery DOM element.
    */
    function MeCard(dfdMe) {
        var header = ContactHeader(dfdMe, 'Me', true);
        var me;

        var buttons = $('<div>').addClass('lync-buttons').append(
            PresenceStateButton('Online', 'Available'),
            PresenceStateButton('Busy', 'Busy'),
            PresenceStateButton('DoNotDisturb', 'Do not disturb'),
            PresenceStateButton('BeRightBack', 'Be right back'),
            PresenceStateButton('Away', 'Appear away'));

        buttons.hide();

        wait(dfdMe).then(function (r) {
            me = r;
            buttons.show();
        });

        return $('<div>')
            .addClass('lync-self-card')
            .addClass('lync-glowing-border')
            .append(header, buttons);

        function PresenceStateButton(availability, text) {
            var button = $('<div>').addClass('lync-button');

            button.append($('<span>').addClass('lync-presence-bg-' + availability).addClass('lync-presence-icon'));
            button.append($('<span>').addClass('lync-presence-text').text(text));

            button.on('click', function () {
                if (me) me.presence.set({ availability: availability });
            });

            return button;
        }
    }

    //#endregion

    //#region ConversationWindow

    /**
    * ConversationWindow is built on top of Model.Conversation and
    * represents a DOM element that looks like the Lync's conversation window.
    *
    * @returns a jQuery DOM element.
    */
    function ConversationWindow(contact, conversation, id) {
        var caption = $('<div>').addClass('lync-caption');
        var header = ContactHeader(contact, id, true);
        var history = $('<div>').addClass('lync-chathistory');
        var input = $('<div>').addClass('lync-chatinput').attr('contenteditable', 'false');
        var buttons = $('<div>').addClass('lync-buttons');

        function button(folder, picture) {
            return $('<a>').append($('<img>').attr('src', '/jlync/images/' + folder + '/' + picture + '.png'));
        }

        buttons.append(
            button('bigbuttons', 'im'),
            button('bigbuttons', 'audio'),
            button('bigbuttons', 'video'),
            button('bigbuttons', 'screen'),
            button('bigbuttons', 'people'));

        var expand = button('bighdrbuttons', 'expand');
        var close = button('bighdrbuttons', 'close');

        caption.append(expand, close);

        close.on('click', function () {
            cw.remove();
        });

        wait(conversation).then(function (conversation) {
            var im = conversation.chatService;

            conversation.state.when('Disconnected', function () {
                input.attr('contenteditable', 'false');
                addNotification('The conversation is ended.');
            });

            im.messages.added(function (message) {
                addMessage(message);
            });

            input.attr('contenteditable', 'false');

            input.on('keypress', function (event) {
                if (event.which == 13) {
                    event.preventDefault();
                    im.send(input.text());
                    input.text('');
                }
            });
        }).then(null, function (error) {
            addNotification(error + '');
        });

        function addNotification(text) {
            history.append($('<div>').addClass('lync-chatnotification').text(text));
        }

        function addMessage(message) {
            var name = $('<div>').addClass('lync-sender').text('Resolving name...');
            var timestamp = $('<div>').addClass('lync-timestamp').text('12:49 PM');
            var text = $('<div>').addClass('lync-text').text(message.text());
            var chatmsg = $('<div>').addClass('lync-chatmessage').append(timestamp, name, text);

            history.append(chatmsg);

            if (message.sender) {
                message.sender.name.changed(function (text) {
                    name.text(text);
                });

                message.sender.uri.changed(function (uri) {
                    if (!name.text())
                        name.text(uri);
                });
            }

            message.timestamp.changed(function (ts) {
                timestamp.text(ts.toLocaleTimeString());
            });
        }

        var cw = $('<div>').addClass('lync-conversation-window').append(
            caption,
            header,
            history,
            input,
            buttons);

        return cw;
    }

    //#endregion

    //#region ContactCard

    /**
    * ContactCard is built on top of Model.Contact and represents
    * a DOM element that looks like the Lync's contact card (or hover card)
    *
    * @returns a jQuery DOM element.
    */
    function ContactCard(contact, id) {
        var caption = $('<div>').addClass('lync-caption');
        var header = ContactHeader(contact, id);
        var info = $('<div>');

        function button(picture) {
            return $('<a>').append($('<img>').attr('src', '/jlync/images/hdrbuttons/' + picture + '.png'));
        }

        var close = button('close');

        close.on('click', function () {
            card.remove();
        });

        function block(title, text) {
            return $('<div>').addClass('lync-infoblock').append($('<div>').text(title), text);
        }

        var meeting = $('<a>').attr('href', '').text('Schedule a meeting');
        var email = $('<a>').attr('href', '').text('N/A');
        var phonecall = $('<a>').attr('href', '').text('N/A');
        var sendim = $('<a>').attr('href', '').text('N/A');
        var office = $('<div>').text('N/A');
        var company = $('<div>').text('N/A');

        info.append(
            block('Calendar', meeting),
            block('Send Email', email),
            block('Call Work', phonecall),
            block('IM', sendim),
            block('Office', office),
            block('Company', company));

        var card = $('<div>')
            .addClass('lync-contact-card')
            .addClass('lync-glowing-border')
            .append(caption, header, info);

        function parsePhone(tel) {
            try {
                var p = tel.match(/(\d)(\d\d\d)(\d\d\d)(\d\d\d\d)/);
                return '+' + p[1] + '(' + p[2] + ')' + p[3] + '-' + p[4];
            } catch (error) {
                return tel;
            }
        }

        wait(contact).then(function (contact) {
            meeting.attr('href', '?');

            contact.office.get().then(function () {
                email.attr('href', 'mailto:' + contact.emails()).text(contact.emails());
                sendim.attr('href', contact.uri()).text(contact.emails());
                phonecall.attr('href', contact.workPhone()).text(parsePhone(contact.workPhone()));
                office.text(contact.office());
                company.text(contact.company());
            });
        });

        return card;
    }

    //#endregion

    //#region ContactHeader

    /**
    * ContactHeader is built on top of Model.Contact and represents
    * a DOM element that displays the contact's photo as well as its
    * name, presence state and title. This UI element can be seen in
    * the header of the Lync's conversation window.
    *
    * @returns a jQuery DOM element.
    */
    function ContactHeader(contact, id, minimized) {
        var photo = $('<img>');
        var name = $('<div>').addClass('lync-name');
        var presence = $('<div>').addClass('lync-presence');
        var title = $('<div>').addClass('lync-title');
        var buttons = $('<div>').addClass('lync-buttons');
        var info = $('<div>').append(name, presence, title);

        photo.addClass('lync-presence-bg-None');
        name.text(id);
        presence.text('Unknown');
        title.text('Unknown');

        function button(picture) {
            return $('<a>').append($('<img>').attr('src', '/jlync/images/buttons/' + picture + '.png')).addClass('lync-' + picture);
        }

        var btnim = button('im');
        var btnaudio = button('audio');
        var btnvideo = button('video');
        var btnemail = button('email');

        buttons.append(btnim, btnaudio, btnvideo, btnemail);

        wait(contact).then(function (contact) {
            contact.name.get().then(function () {
                name.text(contact.name());
                title.text(contact.title() + ', ' + contact.department());

                if (contact.workPhone)
                    btnaudio.attr('href', contact.workPhone());

                btnemail.attr('href', 'mailto:' + contact.emails());

                if (contact.uri) {
                    btnvideo.attr('href', contact.uri());
                    //btnim.attr('href', contact.uri());
                }
            });

            contact.presence.changed(function (value) {
                var tags = [];

                if (value.availability) tags.push(value.availability);
                if (value.activity) tags.push(value.activity);
                if (value.deviceType) tags.push(value.deviceType);

                presence.text(tags.join(' - '));
                photo.removeClass().addClass('lync-presence-bg-' + value.availability);
            });

            contact.photo.changed(function (url) {
                photo.attr('src', url);
            });
        }).then(null, function (error) {
            presence.text(error || 'Not Found');
        });

        return $('<div>').addClass('lync-contact-header').append(photo, info).addClass(minimized ? 'lync-contact-headerminimized' : '');
    }

    //#endregion

    //#region ContactPresence

    /**
    * ContactPresence is built on top of Model.Contact and represents
    * a DOM element that displays the name of the contact and its
    * presence state.
    *
    * @param {async Contact} dfdContact
    * @param {String} id - Something to show in place of the contact's namewhile it's not known.
    *
    * @member {Contact} contact
    *
    * @returns a jQuery DOM element.
    */
    function ContactPresence(dfdContact, id) {
        var icon = $('<span>');
        var name = $('<span>').addClass('name');
        var device = $('<span>').addClass('device');
        var activity = $('<span>').addClass('activity');
        var container = $('<div>').addClass('lync-contact-presence');

        name.text(id);
        icon.addClass('lync-presence-bg-None');

        wait(dfdContact).then(function (contact) {
            container.contact = contact;

            contact.name.changed(function (value) {
                name.text(value);
            });

            contact.presence.changed(function (presence) {
                icon.removeClass().addClass('lync-presence-bg-' + presence.availability);
                device.text(presence.deviceType ? ' - ' + presence.deviceType : '');
                activity.text(presence.activity ? ' - ' + presence.activity : '');
            });
        }).then(null, function (error) {
            var text = id + ' - Not Found';
            if (error) text += ' (' + error + ')';
            name.text(text);
        });

        return container.append(
            $('<span>').addClass('icon').append(icon),
            $('<span>').addClass('text').append(name, activity, device));
    }

    //#endregion

    //#region ContactList

    /**
    * ContactList gets a collection of contact models
    * and represents them as ContactPresence elements.
    *
    * @returns a jQuery DOM element.
    */
    function ContactList(contacts) {
        var xcontainer = $('<div>').addClass('lync-contact-list');
        var xcontacts = {}; // xcontacts[id] = ContactPresence
        var ncontacts = 0;
        var xnobody = $('<div>').addClass('lync-empty').text('Nobody is here');

        contacts.added(function (contact, id) {
            var xcontact = ContactPresence(contact, 'Resolving name...');
            assert(!xcontacts[id]);
            xcontainer.append(xcontacts[id] = xcontact);
            ncontacts++;
            xnobody.hide();
        });

        contacts.removed(function (contact, id) {
            assert(xcontacts[id]);
            xcontacts[id].remove();
            delete xcontacts[id];
            ncontacts--;
            xnobody.show();
        });

        return xcontainer.append(xnobody);
    }

    //#endregion

    //#region Group

    /**
    * Group is a view for Model.Group.
    *
    * @param {async Group|Collection} group - It resolves to a Group or to a collection of contacts.
    *
    * @returns a jQuery DOM element.
    */
    function Group(group, title) {
        assert(title);

        var xcontainer = $('<div>').addClass('lync-contact-group');
        var xtitle = $('<div>').addClass('lync-title').text(title);
        var xcontacts = $('<div>').addClass('lync-contacts');

        wait(group).then(function (g) {
            xcontacts.append(ContactList(g.persons || g));
            if (g.name) { // g may be a collection
                g.name.changed(function (name) {
                    xtitle.text(name || g.relationshipLevel || title);
                });
            }
        }).then(null, function (error) {
            xcontacts.text(error || 'Cannot display the contact list at this time');
        });

        xtitle.on('click', function () {
            xcontainer.toggleClass('lync-expanded');
        });

        return xcontainer.append(xtitle, xcontacts);
    }

    //#endregion

    //#region GroupList

    /**
    * GroupList is a view for a collection of group models.
    * There are two such collections: the list of user-created groups
    * and the list of relationship groups.
    *
    * @param {async Collection} list - Resolves to a collection of groups.
    *
    * @returns a jQuery DOM element.
    */
    function GroupList(list) {
        var xcontainer = $('<div>').addClass('lync-group-list');
        var xgroups = {}; // xgroups[id] = Group

        wait(list).then(function (groups) {
            groups.added(function (group, id) {
                var xgroup = Group(group, 'Unnamed Group');
                assert(!xgroups[id]);
                xcontainer.append(xgroups[id] = xgroup);
            });

            groups.removed(function (group, id) {
                assert(xgroups[id]);
                xgroups[id].remove();
                delete xgroups[id];
            });
        }).then(null, function (error) {
            xcontainer.text(error || 'Cannot get the list of groups');
        });

        return xcontainer;
    }

    //#endregion

    //#region SignInFrame

    /**
     * @method status({String}) - Changes the status text.
     * @event "sign-in-click" - Occurs when the "Sign In" button is clicked.
     */
    function SignInFrame(creds) {
        var tagContainer = $('<div>').addClass('lync-signin-frame').addClass('lync-ui-control');
        var tagUserTitle = $('<div>').text('User name:').addClass('lync-title');
        var tagUserName = $('<div>').attr('contenteditable', true).addClass('lync-input-control').text(creds && creds.username);
        var tagPasswordTitle = $('<div>').text('Password:').addClass('lync-title');
        var tagPassword = $('<div>').attr('contenteditable', true).addClass('lync-input-control').text(creds && creds.password);
        var tagSignIn = $('<div>').text('Sign in').addClass('lync-button-control');
        var tagStatus = $('<div>').addClass('lync-status');

        tagSignIn.on('click', function (event) {
            event.preventDefault();
            tagSignIn.hide();
            tagContainer.trigger('sign-in-click', {
                username: tagUserName.text(),
                password: tagPassword.text()
            });
        });

        tagContainer.append(
            tagUserTitle,
            tagUserName,
            tagPasswordTitle,
            tagPassword,
            tagSignIn,
            tagStatus);

        tagContainer.status = function (text) {
            tagStatus.text(text);
            return this;
        };

        return tagContainer;
    }

    //#endregion

    //#region SearchBox

    /**
     * @param {async Application} dfdClient
     * @returns {jQuery DOM element}
     */
    function SearchBox(dfdClient) {
        var tagQuery = $('<div>').addClass('lync-input-control').attr('contenteditable', true);
        var tagResults = $('<div>').addClass('lync-results');
        var tagContainer = $('<div>').addClass('lync-search-box').addClass('lync-ui-control');

        wait(dfdClient).then(function (client) {
            tagQuery.on('keypress', function (event) {
                if (event.which == 13) {
                    event.preventDefault();
                    tagResults.text('Searching...');
                    client.search({
                        query: tagQuery.text(),
                        limit: 50
                    }).then(function (results) {
                        if (results.contacts.length == 0)
                            tagResults.text('Nothing found');
                        else {
                            tagResults.empty();
                            foreach(results.contacts, function (contact, index) {
                                var tagContact = ContactPresence(contact, 'Contact #' + index);
                                tagResults.append(tagContact);
                                tagContact.on('click', function () {
                                    tagContainer.trigger('contact-click', contact);
                                });
                            });
                        }
                    }).then(null, function (error) {
                        tagResults.text(error || 'Something went wrong');
                    });
                }
            });
        }).then(null, function (error) {
            tagResults.text(error || 'Something went wrong');
        });

        return tagContainer.append(tagQuery, tagResults);
    }

    //#endregion

    //#region ViewCollection

    function ViewCollection(source, view) {
        var tagContainer = $('<div>');
        var tags = {};

        source.added(function (item, id) {
            tagContainer.append(tags[id] = view(item));
        });

        source.removed(function (item, id) {
            tags[id].remove();
        });

        return tagContainer;
    }

    //#endregion

    //#region Exports (to Skype.Web.View)

    Skype.Web.View = {
        Factory: Factory,

        MeCard: MeCard,
        ConversationWindow: ConversationWindow,
        ContactCard: ContactCard,
        ContactHeader: ContactHeader,
        ContactPresence: ContactPresence,
        Group: Group,
        ContactList: ContactList,
        GroupList: GroupList,
        SignInFrame: SignInFrame,
        SearchBox: SearchBox,
        Collection: ViewCollection
    };

    //#endregion
})();
