if (!Array.prototype.findIndex)
    Array.prototype.findIndex = function (callback) {
        var index;
        for (index = 0; index < this.length; index++) {
            if (callback(this[index], index, this))
                return index;
        }
        return -1;
    };

var SCL2 = {};

SCL2.checkEvents = function (app, events, resolve, reject, cmdName, taskId) {
    var dfd = Q.defer();
    var evts = [];
    var evtsToCheck = JSON.parse(JSON.stringify(events));
    var result;
    var error;
    console.log('[SCL2] ' + cmdName + ' start.')
    function eventListener(data) {
        evts.push(data);
        if (data.t == 'EndWaitForConversation')
            debugger;

        var index = evtsToCheck.findIndex(function (element, index, array) {
            if (data.t == element.t) {
                for (var k in element) {
                    if (element[k] != data[k])
                        return false;
                }
                return true;
            }
            return false;
        });
        if (index > -1 && (data.taskId ? data.taskId == taskId : true))
            evtsToCheck.splice(index, 1);

        if (resolve && resolve.t == data.t && resolve.taskState == data.taskState && data.taskId == taskId) {
            result = data.result;
        }

        if (reject && reject.t == data.t && reject.taskState == data.taskState && data.taskId == taskId) {
            error = data.error;
            app.off('event', eventListener);
            dfd.reject(error);
            console.log('[SCL2] ' + cmdName + ' rejected.');
        }

        if (evtsToCheck.length == 0) {
            app.off('event', eventListener);
            dfd.resolve(result);
            console.log('[SCL2] ' + cmdName + ' resolved.');
        }
    }

    app.on('event', eventListener);
    return dfd.promise;
}

SCL2.getCommand = function (cmdName, evtsToCheck, resolve, reject) {
    return function (app, options) {
        var promise;
        var args = [].slice.call(arguments, 1);

        var taskId = app[cmdName].apply(null, args);
        promise = SCL2.checkEvents(app, evtsToCheck, resolve, reject, cmdName, taskId);

        return promise;
    };
};

// ---- SignInManager ----
SCL2.signIn = function (jcApp, options) {
    return Q(jcApp.app.signInManager.signIn(options));
}

/** 
 * Sign in anonymously
 *
 * @params {string} meeting - meeting uri
 * @params {string} name - display name of the guest
 */
SCL2.signInAnonymous = function (jcApp, options) {
    return Q(jcApp.app.signInManager.signIn(options));
}

SCL2.signOut = function (jcApp) {
    return Q(jcApp.app.signInManager.signOut());
}

// ---- PersonsAndGroupsManager ----
SCL2.setMePersonStatus = function (jcApp, status) {
    return Q(jcApp.app.personsAndGroupsManager.mePerson.status.set(status));
}

SCL2.resetMePersonStatus = function (jcApp) {
    return Q(jcApp.app.personsAndGroupsManager.mePerson.status.reset());
}

SCL2.setMePersonLocation = function (jcApp, location) {
    return Q(jcApp.app.personsAndGroupsManager.mePerson.location.set(location));
}

SCL2.searchForPerson = function (jcApp, query) {
    var searchQuery = jcApp.app.personsAndGroupsManager.createPersonSearchQuery();
    searchQuery.text(query.text);
    searchQuery.limit(query.limit);
    return Q(searchQuery.getMore());
}

// ---- ConversationsManager ----
SCL2.createConversation = function (jcApp, persons, topic, context) {
    var dfd = Q.defer();
    var p1, p2;
    var conversation;
    var participants;
    try {

        conversation = jcApp.app.conversationsManager.createConversation();

        if (topic)
            p1 = conversation.topic.set(topic);

        participants = persons.map(function (p) {
            return conversation.createParticipant(p);
        });
        participants.forEach(function (p) {
            conversation.participants.add(p);
        });
        dfd.resolve(conversation);
    } catch (ex) {
        dfd.reject(ex);
    }

    return dfd.promise;
}

SCL2.joinMeetingConversation = function (jcApp, meetingUri) {
    var dfd = Q.defer();
    var conversation;
    var participants;

    try {
        conversation = jcApp.app.conversationsManager.getConversationByUri(meetingUri, true);
        dfd.resolve(conversation);
    } catch (ex) {
        dfd.reject(ex);
    }
    return dfd.promise;
}

// get or create a P2P conversation
SCL2.getConversation = function (jcApp, uri, topic, context) {
    var dfd = Q.defer();

    try {
        var conversation = jcApp.app.conversationsManager.getConversation(uri);
        if (topic)
            conversation.topic.set(topic);
        dfd.resolve(conversation);
    } catch (ex) {
        dfd.reject(ex);
    }

    return dfd.promise;
}

SCL2.addParticipant = function (jcApp, conversation, person) {
    var dfd = Q.defer();

    var participant;
    try {
        participant = conversation.createParticipant(person);
        conversation.participants.add(participant);
        dfd.resolve();
    } catch (ex) {
        dfd.reject(ex);
    }

    return dfd.promise;
}

SCL2.ejectParticipant = function (jcApp, conversation, participant) {
    return Q(participant.eject());
}

// ---- ChatService ----
/**
 * @param {string} format - 'text' or 'html'
 */
SCL2.sendMessage = function(jcApp, conversation, message, format) {
    return Q(conversation.chatService.sendMessage(message, format));
}

SCL2.sendIsTyping = function (jcApp, conversation) {
    return Q(conversation.chatService.sendIsTyping());
}

SCL2.acceptChatService = function (jcApp, conversation) {
    return Q(conversation.chatService.accept());
}

SCL2.rejectChatService = function (jcApp, conversation) {
    return Q(conversation.chatService.reject());
}

SCL2.startChatService = function (jcApp, conversation, cbTask) {
    var task = conversation.chatService.start();
    if (cbTask)
        cbTask(task);
    return Q(task);
}

SCL2.stopChatService = function (jcApp, conversation) {
    return Q(conversation.chatService.stop());
}

// ---- AudioService ----

SCL2.sendDtmf = function (jcApp, conversation, dtmf) {
    return Q(conversation.audioService.sendDtmf(dtmf));
}

SCL2.startAudioService = function (jcApp, conversation, cbTask) {
    var task = conversation.audioService.start();
    if (cbTask)
        cbTask(task);
    return Q(task);
}

SCL2.acceptAudioService = function (jcApp, conversation) {
    return Q(conversation.audioService.accept());
}

SCL2.rejectAudioService = function (jcApp, conversation) {
    return Q(conversation.audioService.reject());
}

SCL2.stopAudioService = function (jcApp, conversation) {
    return Q(conversation.audioService.stop());
}

/** participantAudio **/
SCL2.setIsMuted = function (jsApp, conversation, muted) {
    return Q(conversation.selfParticipant.audio.isMuted.set(muted));
}

SCL2.setIsOnHold = function (jsApp, conversation, onHold) {
    return Q(conversation.selfParticipant.audio.isOnHold.set(onHold));
}

// ---- VideoService ----
SCL2.startVideoService = function (jcApp, conversation) {
    return Q(conversation.videoService.start());
}

SCL2.stopVideoService = function (jcApp, conversation) {
    return Q(conversation.videoService.stop());
}

SCL2.acceptVideoService = function (jcApp, conversation) {
    return Q(conversation.videoService.accept());
}

SCL2.rejectVideoService = function (jcApp, conversation) {
    return Q(conversation.videoService.reject());
}

// ---- Conversation ----
SCL2.leaveConversation = function (jcApp, conversation) {
    return Q(conversation.leave());
}

SCL2.removeConversation = function (jcApp, conversation) {
    return Q(jcApp.app.conversationsManager.conversations.remove(conversation));
}

SCL2.waitForMessageReceived = function (jcApp, conversation, options) {
    var dfd = Q.defer();

    jcApp.on('event', appEventHandler);

    function appEventHandler(event) {
        if (event.t == 'ActivityItemAdded' && event.type == 'TextMessage') {
            dfd.resolve(event.item);
            jcApp.off('event', appEventHandler);
        }
    }

    return dfd.promise;
}

function waitForNotifiedThenAcceptOrReject(app, serviceType, method, options) {
    var dfd = Q.defer();

    app.on('event', appEventHandler);

    function resolve(dfd, r) {
        dfd.resolve(r);
        app.off('event', appEventHandler);
    }

    function reject(dfd, e) {
        dfd.reject(error);
        app.off('event', appEventHandler);
    }

    function appEventHandler(event) {
        var matchService;

        switch (serviceType) {
            case 'chatService':
                matchService = event.s.match(/_SelfParticipantChat/);
                break;
            case 'audioService':
                matchService = event.s.match(/_SelfParticipantAudio/);
                break;
            case 'videoService':
                matchService = event.s.match(/_SelfParticipantVideo/);
                break;
        }

        if (event.t == 'StateChanged' && event.state == 'Notified') {
            if (matchService) {
                event.context.conversation[serviceType][method]().then(function () {
                    resolve(dfd, event.context.conversation);
                }, function (error) {
                    reject(dfd, error);
                });
            }
        }
    }

    return dfd.promise;
}

SCL2.waitForChatNotifiedThenAccept = function (app, options) {
    return waitForNotifiedThenAcceptOrReject(app, 'chatService', 'accept', options);
}

SCL2.waitForChatNotifiedThenReject = function (app, options) {
    return waitForNotifiedThenAcceptOrReject(app, 'chatService', 'reject', options);
}

SCL2.waitForAudioNotifiedThenAccept = function (app, options) {
    return waitForNotifiedThenAcceptOrReject(app, 'audioService', 'accept', options);
}

SCL2.waitForAudioNotifiedThenReject = function (app, options) {
    return waitForNotifiedThenAcceptOrReject(app, 'audioService', 'reject', options);
}

SCL2.waitForVideoNotifiedThenAccept = function (app, options) {
    return waitForNotifiedThenAcceptOrReject(app, 'videoService', 'accept', options);
}

SCL2.waitForVideoNotifiedThenReject = function (app, options) {
    return waitForNotifiedThenAcceptOrReject(app, 'videoService', 'reject', options);
}

function showOrHideVideo(app, conversation, participant, toShow, container) {
    var dfd = Q.defer();

    var channel = participant.video.channels(0);
    if (toShow) {
        channel.stream.source.sink.container.set(container).then(function () {
            return channel.isStarted.set(true);
        }).then(function () {
            dfd.resolve();
        }, function (error) {
            dfd.reject(error);
        });
    } else {
        channel.stream.source.sink.container.set(null).then(function () {
            return channel.isStarted.set(false);
        }).then(function () {
            dfd.resolve();
        }, function (error) {
            dfd.reject(error);
        })
    }

    return dfd.promise;
}

SCL2.showParticipantVideo = function (app, conversation, participant, container) {
    return showOrHideVideo(app, conversation, participant, true, container);
}

SCL2.hideParticipantVideo = function (app, conversation, participant) {
    return showOrHideVideo(app, conversation, participant, false, null);
}

SCL2.showMyVideo = function (app, conversation, container) {
    return showOrHideVideo(app, conversation, conversation.selfParticipant, true, container)
}

SCL2.hideMyVideo = function (app, conversation) {
    return showOrHideVideo(app, conversation, conversation.selfParticipant, false, null);
}

/**
 *
 * SCL2Proxy -> SCL2Remote
 * 
 {
 opId: <opId>,
 from: <tid>,
 to: <eid>,
 params: {
   c: <cmdName>,
   }
 }

 * SCL2Remote -> SCL2Proxy
 {
opId: <opId>,
opStatus: <opStatus>,
from: <eid>,
to: <tid>,
params: {
  c: <cmdName>,
  d: <data>
  }
}
 */
function SCL2Proxy(proxySocket, eid, tid) {
    var dfd = {};

    function register() {
        proxySocket.emit('who', {
            type: 'SCL2Proxy',
            who: 'test',
            tid: tid,
            eid: eid
        });
    }

    proxySocket.on('data', function (data) {
        if (data.to && data.to != eid)
            return;

        if (dfd[data.opId] && data.opStatus == 'resolved') {
            dfd[data.opId].resolve(data.result);
        } else if (dfd[data.opId] && data.opStatus == 'rejected') {
            dfd[data.opId].reject(data.error);
        }
    });

    function init() {
        var opId = id();
        dfd[opId] = Q.defer();

        proxySocket.emit('data', { opId: opId, from: tid, to: eid, params: { c: 'init' } });
        return dfd[opId].promise;
    }

    function signIn() {
        var opId = id();
        dfd[opId] = Q.defer();

        proxySocket.emit('data', { opId: opId, from: tid, to: eid, params: { c: 'signIn' } });

        return dfd[opId].promise;
    }

    function signOut() {
        var opId = id();
        dfd[opId] = Q.defer();

        proxySocket.emit('data', { opId: opId, from: tid, to: eid, params: { c: 'signOut' } });

        return dfd[opId].promise;
    }

    function searchForPerson(query) {
        var opId = id();
        dfd[opId] = Q.defer();

        proxySocket.emit('data', { opId: opId, from: tid, to: eid, params: { c: 'searchForPerson', query: query } });

        return dfd[opId].promise;
    }

    return {
        register: register,
        init: init,
        signIn: signIn,
        signOut: signOut,
        searchForPerson: searchForPerson
    }
}

var cache = {};
// generate a simple id
function id() {
    return Math.random().toString(16).slice(2);
}

// add __id property to the modelObject so that it can be indexed in our cache
function addToCache(modelObj) {
    if (!modelObj.__id) {
        Object.defineProperty(modelObj, '__id', {
            value: id(),
            enumerable: false,
            configurable: false
        });
    }
    if (!cache[modelObj.__id]) {
        cache[modelObj.__id] = modelObj;
    }
}

// remove an model object indexed by its __id property
function removeFromCache(modelObj) {
    cache[modelObj.__id] = null;
    delete cache[modelObj.__id];
}

function getFromCache(id) {
    return cache[id];
}

function SCL2Remote(url, eid) {
    var socket = io.connect('http://localhost/');
    var app;

    var handlers = {
        init: init,
        signIn: signIn,
        signOut: signOut,
        searchForPerson: searchForPerson
    };

    socket.on('connect', function () {
        socket.emit('who', {
            type: 'SCL2Remote',
            who: 'jcafe',
            eid: eid
        });
    });

    socket.on('data', function (data) {
        console.log('>>>> data: ', data);
        //socket.emit('data', { d: data });

        switch (data.params.c) {
            case 'init':
                handlers[data.params.c](data);
                break;
            case 'signIn':
                handlers[data.params.c](data);
                break;
            case 'searchForPerson':
                searchForPerson(data); // app, { text: data.options.text + '@devex.ccsctp.net', limit: 1 });
                break;
            case 'signOut':
                signOut(data);
                break;
            default:
                invokeSCL2Command(data)
        }
    });


    function init(data) {
        if (app && app.application().signInManager.state() != 'SignedOut')
            app.application().signInManager.signOut().then(function () {
                initInternal(data);
            });
        else
            initInternal(data);
    }

    function initInternal(data) {
        app = new JCafe();
        app.on('event', function (data) {
            console.log('[app] ', data);
            socket.emit('data', { d: data, to: eid } );
        })
        app.init(new Application());
        socket.emit('data', { d: data, to: eid, opId: data.opId, opStatus: 'resolved' });
    }


    function invokeSCL2Command(data) {
        var command = data.c;
        var options;
        var promise = SCL2[command](app, options);
        promise.then(function () {
            socket.emit('data', { d: data, opId: data.opId, opStatus: 'resolved' });
        }, function (error) {
            socket.emit('data', { d: data, opId: data.opId, opStatus: 'rejected', error: error });
        })
    }

    function signIn(data) {
        var promise = SCL2.signIn(app, {
            auth: Skype.Web.Auth.Passive(),
            origins: origins
        })

        promise.then(function () {
            socket.emit('data', { d: data, to: eid, opId: data.opId, opStatus: 'resolved' });
        }, function (error) {
            socket.emit('data', { d: data, to: eid, opId: data.opId, opStatus: 'rejected', error: error });
        });
    }

    function signOut(data) {
        var promise = SCL2.signOut(app);
        promise.then(function () {
            socket.emit('data', { d: data, to: eid, opId: data.opId, opStatus: 'resolved' });
        }, function () {
            socket.emit('data', { d: data, to: eid, opId: data.opId, opStatus: 'rejected' });
        });
    }

    function searchForPerson(data) {
        var promise = SCL2.searchForPerson(app, data.params.query);
        promise.then(function (p) {
            if (p.length > 0) {
                addToCache(p[0].result);
                socket.emit('data', { d: data, to: eid, opId: data.opId, opStatus: 'resolved', result: { person: p[0].result.__id } });
            }
        }, function () {
        });
    }
}


