'use strict';

var Application = Skype.Web.Model.Application;
var PassiveAuth = Skype.Web.Auth.Passive;
var EventEmitter = EventEmitter;

// generates a simple id and attaches it to the object in the format of obj.___id = '000999_SUF'
function ___id(obj, suffix) {
    var id;

    if (!obj.___id) {
        obj.___id = ___id.getId(suffix);
    }

    // this cached object repository is for debugging purpose
    if (!___id.dbg[obj.___id]) {
        ___id.dbg[obj.___id] = obj;
    }
    return obj.___id;
}

___id.getId = function (suffix) {
    var id = '' + ___id.next++;
    if (___id.next > ___id.max) ___id.next = 0;
    return '$' + (new Array(___id.len - id.length + 1)).join('0') + id + '_' + suffix;
};
___id.next = 0;
___id.max = 999999;
___id.len = (___id.max + '').length;
___id.dbg = {};

function Event(type, options) {
    this.t = type;
    this.s = options.sender.___id;

    for (var k in options) {
        if (k !== 'sender' && k !== 'data') {
            this[k] = options[k];
        }
    }

    Object.defineProperty(this, '_data', {
        value: options.data,
        enumerable: false,
        configurable: false
    });
}

function createEvent(type, options) {
    return new Event(type, options);
}

/**
 * an application using jCafe interface. It subscribes as many jCafe events as possible, and
 * emits those events to an event hub with a certain context. The event consumers can then
 * verify the events and take actions accordingly.
 */
function JCafe(app) {
    var event = new EventEmitter();
    var application = app;
    var sgnMgr;
    var pngMgr;
    var conMgr;
    var devMgr;

    // ---- internal functions ----
    function emit(eventName, data) {
        var evt = new Event(eventName, data);
        event.emit('event', evt);
    }

    // ---- Application ----

    // ---- SignInManager ----
    function whenSignedIn() {
        pngMgr = application.personsAndGroupsManager;
        conMgr = application.conversationsManager;
        devMgr = application.devicesManager;

        var mePerson = pngMgr.mePerson;
        var persons = pngMgr.all.persons;
        var groups = pngMgr.all.groups;

        var conversations = conMgr.conversations;

        ___id(conMgr, 'ConversationsManager');
        ___id(pngMgr, 'PersonsAndGroupsManager');
        ___id(devMgr, 'DevicesManager');
        ___id(devMgr.microphones, 'Microphones');

        // ---- personsAndGroupManager ----
        ___id(mePerson, 'MePerson');
        mePerson.status.changed(function (status) {
            emit('MePersonStatusChanged', {
                sender: mePerson,
                status: status
            });
        });
        mePerson.activity.changed(function (activity) {
            emit('MePersonActivityChanged', {
                sender: mePerson,
                activity: activity
            });
        });
        mePerson.note.type.changed(function (type) {
            emit('MePersonNoteTypeChanged', {
                sender: mePerson, 
                noteType: type 
            });
        });
        mePerson.note.text.changed(function (text) {
            emit('MePersonNoteTextChanged', {
                sender: mePerson, 
                noteText: text });
        });

        mePerson.location.changed(function (location) {
            emit('MePersonLocationChanged', {
                sender: mePerson,
                location: location
            });
        })

        ___id(persons, 'AllPersons');
        ___id(groups, 'AllGroups');

        persons.added(function (person) {
            emit('PersonAdded', {
                sender: persons,
                id: person.id(),
                hostGroupType: pngMgr.all.type(),
                hostGroupName: pngMgr.all.name(),
                hostGroupRelationshipLevel: pngMgr.all.relationshipLevel(), 
                person: person,
                hostGroup: pngMgr.all,
                context: {
                    person: person,
                    hostGroup: pngMgr.all
                }
            });
        });

        persons.removed(function (person) {
            emit('PersonRemoved', { 
                sender: persons, 
                id: person.id(), 
                hostGroupType: pngMgr.all.type(),
                hostGroupName: pngMgr.all.name(),
                hostGroupRelationshipLevel: pngMgr.all.relationshipLevel(),
                person: person, 
                hostGroup: pngMgr.all,
                context: {
                    person: person,
                    hostGroup: pngMgr.all
                }
            });
        });

        groups.added(function (group) {
            emit('GroupAdded', { 
                sender: groups,
                groupType: group.type(),
                groupName: group.name(), 
                groupRelationshipLevel: group.relationshipLevel(), 
                hostGroupType: pngMgr.all.type(), 
                hostGroupName: pngMgr.all.name(), 
                hostGroupRelationshipLevel: pngMgr.all.relationshipLevel(),
                group: group,
                hostGroup: pngMgr.all,
                context: {
                    group: group,
                    hostGroup: pngMgr.all
                }
            });
            group.persons.added(function (person) {
                emit('PersonAdded', { 
                    sender: group.persons, 
                    id: person.id(), 
                    hostGroupType: group.type(),
                    hostGroupName: group.name(), 
                    hostGroupRelationshipLevel: group.relationshipLevel(),
                    person: person, 
                    hostGroup: group,
                    context: {
                        person: person,
                        hostGroup: group
                    }
                });
            })
            group.persons.remove(function (person) {
                emit('PersonRemoved', { 
                    sender: group.persons, 
                    id: person.id(),
                    hostGroupType: group.type(),
                    hostGroupName: group.name(), 
                    hostGroupRelationshipLevel: group.relationshipLevel(),
                    person: person, 
                    hostGroup: group,
                    context: {
                        person: person,
                        hostGroup: group
                    }
                });
            })
        });

        groups.removed(function (group) {
            emit('GroupRemoved', {
                sender: groups, 
                groupType: group.type(), 
                groupName: group.name(),
                groupRelationshipLevel: group.relationshipLevel(), 
                hostGroupType: pngMgr.all.type(),
                hostGroupName: pngMgr.all.name(), 
                hostGroupRelationshipLevel: pngMgr.all.relationshipLevel(),
                group: group,
                hostGroup: pngMgr.all,
                context: {
                    group: group,
                    hostGroup: pngMgr.all
                }
            });
        });

        // ---- conversationsManager ----
        ___id(conversations, 'Conversations');
        conversations.added(function (conversation) {
            var selfParticipant = conversation.selfParticipant;
            var participants = conversation.participants;
            var chatService = conversation.chatService;
            var audioService = conversation.audioService;
            var videoService = conversation.videoService;
            var historyService = conversation.historyService;
            var activeModalities = conversation.activeModalities;

            conversation.avatarUrl.changed(function(newAvatarUrl) {
                console.log("newAvatarUrl: ", newAvatarUrl);
            });
            
            conversation.avatarUrl.subscribe();
            
            ___id(conversation, 'Conversation');
            ___id(conversation.leave, 'ConversationLeave');
            ___id(conversation.chatService, 'ChatService');
            ___id(conversation.chatService.accept, 'ChatServiceAccept');
            ___id(conversation.chatService.reject, 'ChatServiceReject');
            ___id(conversation.chatService.start, 'ChatServiceStart');
            ___id(conversation.chatService.stop, 'ChatServiceStop');
            ___id(conversation.chatService.sendMessage, 'ChatServiceSendMessage');
            ___id(conversation.chatService.sendIsTyping, 'ChatServiceSendIsTyping');
            ___id(conversation.audioService, 'AudioService');
            ___id(conversation.audioService.accept, 'AudioServiceAccept');
            ___id(conversation.audioService.reject, 'AudioServiceReject');
            ___id(conversation.audioService.start, 'AudioServiceStart');
            ___id(conversation.audioService.stop, 'AudioServiceStop');
            ___id(conversation.audioService.sendDtmf, 'AudioServiceSendDtmf');
            ___id(conversation.videoService, 'VideoService');
            ___id(conversation.videoService.accept, 'VideoServiceAccept');
            ___id(conversation.videoService.reject, 'VideoServiceReject');
            ___id(conversation.videoService.start, 'VideoServiceStart');
            ___id(conversation.videoService.stop, 'VideoServiceStop');
            ___id(selfParticipant, 'SelfParticipant');
            ___id(selfParticipant.chat, 'SelfParticipantChat');
            ___id(selfParticipant.audio, 'SelfParticipantAudio');
            ___id(selfParticipant.video, 'SelfParticipantVideo');
            ___id(participants, 'Participants');
            ___id(activeModalities, 'ActiveModalities');
            ___id(historyService, 'HistoryService');

            emit('ConversationAdded', {
                sender: conversations,
                conversationId: conversation.___id,
                selfParticipantChatState: selfParticipant.chat.state(),
                selfParticipantAudioState: selfParticipant.audio.state(),
                selfParticipantVideoState: selfParticipant.video.state(),
                context: {
                    conversation: conversation
                }
            });

            conversation.leave.enabled.changed(function (enabled) {
                emit('EnabledChanged', { 
                    sender: conversation.leave, 
                    enabled: enabled, 
                    conversationId: conversation.___id,
                    context: {
                        enabled: enabled,
                        conversation: conversation
                    }
                });
            });
            conversation.isGroupConversation.changed(function (isGroupConversation) {
                emit('IsGroupConversationChanged', { 
                    sender: conversation,
                    isGroupConversation: isGroupConversation,
                    conversationId: conversation.___id,
                    context: {
                        isGroupConversation: isGroupConversation,
                        conversation: conversation
                    }
                });
            });

            // ---- selfParticipant.chat ----
            selfParticipant.chat.state.changed(function (state) {
                emit('StateChanged', { 
                    sender: selfParticipant.chat, 
                    state: state,
                    conversationId: conversation.___id,
                    context: {
                        state: state,
                        conversation: conversation
                    }
                });
            });

            selfParticipant.chat.isTyping.changed(function (isTyping) {
                emit('IsTypingChanged', {
                    sender: selfParticipant.chat,
                    isTyping: isTyping,
                    conversationId: conversation.___id,
                    context: {
                        isTyping: isTyping,
                        conversation: conversation
                    }
                });
            });

            // ---- selfParticipant.audio ----
            selfParticipant.audio.state.changed(function (state) {
                emit('StateChanged', {
                    sender: selfParticipant.audio,
                    state: state,
                    conversationId: conversation.___id,
                    context: {
                        state: state,
                        conversation: conversation
                    }
                });
            });

            selfParticipant.audio.isMuted.changed(function (isMuted) {
                emit('IsMutedChanged', {
                    sender: selfParticipant.audio,
                    isMuted: isMuted,
                    conversationId: conversation.___id,
                    context: {
                        isMuted: isMuted,
                        conversation: conversation
                    }
                })
            });

            selfParticipant.audio.isOnHold.changed(function (isOnHold) {
                emit('IsOnHoldChanged', {
                    sender: selfParticipant.audio,
                    isOnHold: isOnHold,
                    conversationId: conversation.___id,
                    context: {
                        isOnHold: isOnHold,
                        conversation: conversation
                    }
                })
            });

            selfParticipant.audio.isSpeaking.changed(function (isSpeaking) {
                emit('IsSpeakingChanged', {
                    sender: selfParticipant.audio,
                    isSpeaking: isSpeaking,
                    conversationId: conversation.___id,
                    context: {
                        isSpeaking: isSpeaking,
                        conversation: conversation
                    }
                })
            });

            // ---- selfParticipant.video ----
            selfParticipant.video.state.changed(function (state) {
                emit('StateChanged', {
                    sender: selfParticipant.video,
                    state: state,
                    conversationId: conversation.___id,
                    context: {
                        state: state,
                        conversation: conversation
                    }
                })
            })


            var selfParticipantStream;
            var selfParticipantChannel;
            selfParticipantChannel = selfParticipant.video.channels(0);
            selfParticipantStream = selfParticipantChannel.stream;

            selfParticipantStream.state.changed(function (state) {
                emit('StateChanged', {
                    sender: selfParticipant,
                    senderType: 'StreamStateChanged',
                    state: state,
                    stream: selfParticipantStream,
                    conversationId: conversation.___id,
                    context: {
                        state: state,
                        stream: selfParticipantStream,
                        participant: selfParticipant,
                        covnersation: conversation
                    }
                })
            });

            selfParticipantChannel.isStarted.changed(function (isStarted) {
                emit('IsStartedChanged', {
                    sender: selfParticipant,
                    senderType: 'ChannelIsStartedChanged',
                    isStarted: isStarted,
                    conversationId: conversation.___id,
                    context: {
                        isStarted: isStarted,
                        channel: selfParticipantChannel,
                        participant: selfParticipant,
                        conversation: conversation
                    }
                });
            });




            participants.added(function (participant) {
                var chat = participant.chat;
                var audio = participant.audio;
                var video = participant.video;
                ___id(participant, 'Participant');
                ___id(participant.chat, 'ParticipantChat');
                ___id(participant.audio, 'ParticipantAudio');
                ___id(participant.video, 'ParticipantVideo');

                emit('ParticipantAdded', {
                    sender: participants,
                    participant: participant,
                    conversationId: conversation.___id,
                    context: {
                        participant: participant,
                        conversation: conversation
                    }
                });

                // ---- participant.chat ----
                chat.state.changed(function (state) {
                    emit('StateChanged', { 
                        sender: chat, 
                        state: state, 
                        participant: participant,
                        conversationId: conversation.___id,
                        context: {
                            state: state,
                            participant: participant,
                            conversation: conversation
                        }
                    });
                });
                chat.isTyping.changed(function (isTyping) {
                    emit('IsTypingChanged', {
                        sender: chat,
                        isTyping: isTyping,
                        participant: participant,
                        conversationId: conversation.___id,
                        context: {
                            participant: participant,
                            conversation: conversation
                        }
                    });
                });

                // ---- participant.audio ----
                audio.state.changed(function (state) {
                    emit('StateChanged', {
                        sender: audio,
                        state: state,
                        conversationId: conversation.___id,
                        participant: participant,
                        context: {
                            state: state,
                            participant: participant,
                            conversation: conversation
                        }
                    });
                });

                audio.isMuted.changed(function (isMuted) {
                    emit('IsMutedChanged', {
                        sender: audio,
                        isMuted: isMuted,
                        conversationId: conversation.___id,
                        participant: participant,
                        context: {
                            isMuted: isMuted,
                            participant: participant,
                            conversation: conversation
                        }
                    })
                });

                audio.isOnHold.changed(function (isOnHold) {
                    emit('IsOnHoldChanged', {
                        sender: audio,
                        isOnHold: isOnHold,
                        conversationId: conversation.___id,
                        participant: participant,
                        context: {
                            isOnHold: isOnHold,
                            participant: participant,
                            conversation: conversation
                        }
                    })
                });

                audio.isSpeaking.changed(function (isSpeaking) {
                    emit('IsSpeakingChanged', {
                        sender: audio,
                        isSpeaking: isSpeaking,
                        conversationId: conversation.___id,
                        participant: participant,
                        context: {
                            participant: participant,
                            conversation: conversation
                        }
                    })
                });

                // ---- participant.video ----
                video.state.changed(function (state) {

                    // This line is required for P2P video rendition
                    if (state == 'Connected') {
                        //participant.video.channels(0).stream.source.sink.format('Fit');
                        //participant.video.channels(0).stream.source.sink.container.set(document.getElementById("renderWindow0"));
                        //participant.video.channels(0).stream.source.sink.format('Fit');
                    }

                    emit('StateChanged', {
                        sender: video,
                        state: state,
                        conversationId: conversation.___id,
                        participant: participant,
                        context: {
                            state: state,
                            participant: participant,
                            conversation: conversation
                        }
                    });
                });

                var stream;
                var channel;
                channel = participant.video.channels(0);
                stream = channel.stream;

                stream.state.changed(function (state) {
                    emit('StateChanged', {
                        sender: participant,
                        senderType: 'StreamStateChanged',
                        state: state,
                        stream: stream,
                        conversationId: conversation.___id,
                        participant: participant,
                        context: {
                            state: state,
                            stream: stream,
                            participant: participant,
                            covnersation: conversation
                        }
                    })
                });

                channel.isStarted.changed(function (isStarted) {
                    emit('IsStartedChanged', {
                        sender: participant,
                        senderType: 'ChannelIsStartedChanged',
                        isStarted: isStarted,
                        conversationId: conversation.___id,
                        participant: participant,
                        context: {
                            isStarted: isStarted,
                            channel: channel,
                            participant: participant,
                            conversation: conversation
                        }
                    });
                });
            });

            participants.removed(function (participant) {
                emit('ParticipantRemoved', {
                    sender: participants,
                    conversationId: conversation.___id,
                    participant: participant,
                    context: {
                        participant: participant,
                        conversation: conversation
                    }
                });
            });

            activeModalities.chat.changed(function (isActive) {
                emit('ChatActiveChanged', {
                    sender: activeModalities,
                    conversationId: conversation.___id,
                    isActive: isActive,
                    context: {
                        isActive: isActive,
                        conversation: conversation
                    }
                })
            });

            activeModalities.audio.changed(function (isActive) {
                emit('AudioActiveChanged', {
                    sender: activeModalities,
                    conversationId: conversation.___id,
                    isActive: isActive,
                    context: {
                        isActive: isActive,
                        conversation: conversation
                    }
                })
            });

            activeModalities.video.changed(function (isActive) {
                emit('VideoActiveChanged', {
                    sender: activeModalities,
                    conversationId: conversation.___id,
                    isActive: isActive,
                    context: {
                        isActive: isActive,
                        conversation: conversation
                    }
                })
            });

            // ---- chatService ----
            chatService.accept.enabled.changed(function (enabled) {
                emit('EnabledChanged', {
                    sender: chatService.accept,
                    enabled: enabled,
                    conversationId: conversation.___id,
                    context: {
                        enabled: enabled,
                        conversation: conversation
                    }
                });
            });

            chatService.reject.enabled.changed(function (enabled) {
                emit('EnabledChanged', {
                    sender: chatService.reject,
                    enabled: enabled,
                    conversationId: conversation.___id,
                    context: {
                        enabled: enabled,
                        conversation: conversation
                    }
                });
            });

            chatService.start.enabled.changed(function (enabled) {
                emit('EnabledChanged', {
                    sender: chatService.start,
                    enabled: enabled,
                    conversationId: conversation.___id,
                    context: {
                        enabled: enabled,
                        conversation: conversation
                    }
                });
            });

            chatService.stop.enabled.changed(function (enabled) {
                emit('EnabledChanged', {
                    sender: chatService.stop,
                    enabled: enabled,
                    conversationId: conversation.___id,
                    context: {
                        enabled: enabled,
                        conversation: conversation
                    }
                });
            });

            chatService.sendMessage.enabled.changed(function (enabled) {
                emit('EnabledChanged', {
                    sender: chatService.sendMessage,
                    enabled: enabled,
                    conversationId: conversation.___id,
                    context: {
                        enabled: enabled,
                        conversation: conversation
                    }
                });
            });

            chatService.sendIsTyping.enabled.changed(function (enabled) {
                emit('EnabledChanged', {
                    sender: chatService.sendIsTyping,
                    enabled: enabled,
                    conversationId: conversation.___id,
                    context: {
                        enabled: enabled,
                        conversation: conversation
                    }
                });
            });

            // ---- audioService ----
            audioService.accept.enabled.changed(function (enabled) {
                emit('EnabledChanged', {
                    sender: audioService.accept,
                    enabled: enabled,
                    conversationId: conversation.___id,
                    context: {
                        enabled: enabled,
                        conversation: conversation
                    }
                });
            });

            audioService.reject.enabled.changed(function (enabled) {
                emit('EnabledChanged', {
                    sender: audioService.reject,
                    enabled: enabled,
                    conversationId: conversation.___id,
                    context: {
                        enabled: enabled,
                        conversation: conversation
                    }
                });
            });

            audioService.start.enabled.changed(function (enabled) {
                emit('EnabledChanged', {
                    sender: audioService.start,
                    enabled: enabled,
                    conversationId: conversation.___id,
                    context: {
                        enabled: enabled,
                        conversation: conversation
                    }
                });
            });

            audioService.stop.enabled.changed(function (enabled) {
                emit('EnabledChanged', {
                    sender: audioService.stop,
                    enabled: enabled,
                    conversationId: conversation.___id,
                    context: {
                        conversation: conversation
                    }
                });
            });

            audioService.sendDtmf.enabled.changed(function (enabled) {
                emit('EnabledChanged', {
                    sender: audioService.sendDtmf,
                    enabled: enabled,
                    conversationId: conversation.___id,
                    context: {
                        conversation: conversation
                    }
                });
            });

            audioService.callConnected.changed(function (callConnected) {
                emit('CallConnectedChanged', {
                    sender: audioService,
                    callConnected: callConnected,
                    conversationId: conversation.___id,
                    context: {
                        conversation: conversation
                    }
                })
            });

            // ---- videoService ----
            videoService.start.enabled.changed(function (enabled) {
                emit('EnabledChanged', {
                    sender: videoService.start,
                    enabled: enabled,
                    conversationId: conversation.___id,
                    context: {
                        conversation: conversation
                    }
                })
            })

            videoService.stop.enabled.changed(function (enabled) {
                emit('EnabledChanged', {
                    sender: videoService.stop,
                    enabled: enabled,
                    conversationId: conversation.___id,
                    context: {
                        conversation: conversation
                    }
                })
            })

            videoService.accept.enabled.changed(function (enabled) {
                emit('EnabledChanged', {
                    sender: videoService.accept,
                    enabled: enabled,
                    conversationId: conversation.___id,
                    context: {
                        conversation: conversation
                    }
                })
            })

            videoService.reject.enabled.changed(function (enabled) {
                emit('EnabledChanged', {
                    sender: videoService.reject,
                    enabled: enabled,
                    conversationId: conversation.___id,
                    context: {
                        conversation: conversation
                    }
                })
            })

            // ---- historyService ----
            ___id(historyService.activityItems, 'ActivityItems');
            historyService.activityItems.added(function (item) {
                ___id(item, 'ActivityItem');
                if (item.type() == 'TextMessage') {
                    emit('ActivityItemAdded', {
                        sender: historyService.activityItems,
                        type: item.type(),
                        direction: item.direction(),
                        senderId: item.sender.id(),
                        status: item.status(),
                        item: item, 
                        conversationId: conversation.___id,
                        context: {
                            item: item,
                            conversation: conversation
                        }
                    });
                } else if (item.type() == 'ParticipantJoined') {
                    emit('ParticipantJoined', {
                        sender: historyService.activityItems,
                        type: item.type(),
                        timestamp: item.timestamp(),
                        persons: item.persons(),
                        item: item,
                        conversationId: conversation.___id,
                        context: {
                            item: item,
                            conversation: conversation
                        }
                    })
                } else if (item.type() == 'ParticipantLeft') {
                    emit('ParticipantLeft', {
                        sender: historyService.activityItems,
                        type: item.type(),
                        timestamp: item.timestamp(),
                        persons: item.persons(),
                        item: item,
                        conversationId: conversation.___id,
                        context: {
                            item: item,
                            conversation: conversation
                        }
                    })
                }
                

                item.isRead.changed(function (isRead) {
                    emit('IsReadChanged', { 
                        sender: item, 
                        isRead: isRead,
                        itemType: item.type(), 
                        item: item, 
                        conversationId: conversation.___id,
                        context: {
                            isRead: isRead,
                            item: item,
                            conversation: conversation
                        }
                    });
                });

                item.status.changed(function (status) {
                    emit('StatusChanged', {
                        sender: item,
                        status: status,
                        itemType: item.type(), 
                        item: item,
                        conversationId: conversation.___id,
                        context: {
                            status: status,
                            item: item,
                            conversation: conversation
                        }
                    });
                });
            });

            historyService.unreadActivityItemsCount.changed(function (count) {
                emit('UnreadActivityItemsCountChanged', { 
                    sender: historyService, 
                    count: count, 
                    conversationId: conversation.___id,
                    context: {
                        count: count,
                        conversation: conversation
                    }
                });
            });
        });

        conversations.removed(function (conversation) {
            emit('ConversationRemoved', {
                sender: conversations,
                conversationId: conversation.___id,
                context: {
                    conversation: conversation
                }
            });
        });

        // ---- devicesManager ----
        devMgr.selectedCamera.changed(function (cam) {
            emit('SelectedCameraChanged', {
                sender: devMgr,
                selectedCamera: cam,
                context: {
                    selectedCamera: cam
                }
            })
        });

        devMgr.selectedMicrophone.changed(function (mic) {
            emit('SelectedMicrophoneChanged', {
                sender: devMgr,
                selectedMicrophone: mic,
                context: {
                    selectedMicrophone: mic
                }
            })
        });

        devMgr.selectedSpeaker.changed(function (spk) {
            emit('SelectedSpeakerChanged', {
                sender: devMgr,
                selectedSpeaker: spk,
                context: {
                    selectedSpeaker: spk
                }
            })
        });

        devMgr.cameras.added(function (camera) {
            emit('CameraAdded', {
                sender: devMgr.cameras,
                camera: camera,
                context: {
                    camera: camera
                }
            })
        });

        devMgr.cameras.removed(function (camera) {
            emit('CameraRemoved', {
                sender: devMgr.cameras,
                camera: camera,
                context: {
                    camera: camera
                }
            })
        });

        devMgr.microphones.added(function (microphone) {
            emit('MicrophoneAdded', {
                sender: devMgr.microphones,
                microphone: microphone,
                context: {
                    microphone: microphone
                }
            })
        });

        devMgr.microphones.removed(function (microphone) {
            emit('MicrophoneRemoved', {
                sender: devMgr.microphones,
                microphone: microphone,
                context: {
                    microphone: microphone
                }
            })
        });

        devMgr.speakers.added(function (speaker) {
            emit('SpeakerAdded', {
                sender: devMgr.speakers,
                speaker: speaker,
                context: {
                    speaker: speaker
                }
            })
        });

        devMgr.speakers.removed(function (speaker) {
            emit('SpeakerRemoved', {
                sender: devMgr.speakers,
                speaker: speaker,
                context: {
                    speaker: speaker
                }
            })
        });
    }

    function init() {
        sgnMgr = application.signInManager;
        ___id(sgnMgr, 'SignInManager');
        ___id(sgnMgr.signIn, 'SignIn');
        ___id(sgnMgr.signOut, 'SignOut');

        sgnMgr.signIn.enabled.changed(function (enabled) {
            emit('EnabledChanged', {
                sender: sgnMgr.signIn,
                enabled: enabled,
                context: {
                    enabled: enabled,
                }
            })
        });

        sgnMgr.signOut.enabled.changed(function (enabled) {
            emit('EnabledChanged', {
                sender: sgnMgr.signOut,
                enabled: enabled,
                context: {
                    enabled: enabled,
                }
            })
        });

        sgnMgr.state.changed(function (state) {
            emit('StateChanged', {
                sender: sgnMgr,
                state: state,
                context: {
                    state: state,
                }
            })
        });

        sgnMgr.state.when('SignedIn', whenSignedIn);
    }

    return {
        app: application,
        application: function () { return application; },
        init: init,
        on: event.on.bind(event),
        off: event.off.bind(event),
    };
}
