describe('_jCafe EDog Automation - SignIn/Out', function () {
    var topoParams;
    var userParams1, userParams2, userParams3;
    var app1, app2, app3;
    var access_token1, access_token2, access_token3;
    var origins;

    function initApp(app) {
        var newApp
          , p
          , dfd = Q.defer();

        if (app && app.application().signInManager.state() != 'SignedOut') {
            p = SCL2.signOut(app);
        }

        if (p) {
            p.then(function () {
                newApp = new JCafe();
                newApp.init(new Application());
                dfd.resolve(newApp);
            })
        } else {
            newApp = new JCafe();
            newApp.init(new Application());
            dfd.resolve(newApp);
        }
        return dfd.promise;
    }


    function auth(token) {
        var access_token = token;
        return function auth(req, send) {
            if (req.url.indexOf('/ucwa') === 0 || req.url.indexOf(topoParams.ucwaServerFQDN) === 0) {
                req.headers['Authorization'] = 'Bearer ' + access_token.trim();
            }
            return send(req);
        }
    }

    beforeEach(function () {
        var p1, p2, p3;
        runs(function () {
            topoParams = jCafeAutomationConfig.topologies['edog'];
            userParams1 = topoParams.users[0];
            userParams2 = topoParams.users[1];
            userParams3 = topoParams.users[2];

            origins = topoParams.origins;

            p1 = getWebTicket(topoParams, userParams1);
            p2 = getWebTicket(topoParams, userParams2);
            p3 = getWebTicket(topoParams, userParams3);
        });

        waitsFor(function () {
            return p1.inspect().state == 'fulfilled' && p2.inspect().state == 'fulfilled' && p3.inspect().state == 'fulfilled';
        }, 'obtaining access tokens for app1, app2 and app3', 30000);

        runs(function () {
            access_token1 = p1.inspect().value;
            access_token2 = p2.inspect().value;
            access_token3 = p3.inspect().value;

            p1 = initApp(app1);
            p2 = initApp(app2);
            p3 = initApp(app3);
        });

        waitsFor(function () {
            return p1.inspect().state == 'fulfilled' && p2.inspect().state == 'fulfilled' && p3.inspect().state == 'fulfilled';
        }, 'initializing apps', 30000);

        runs(function () {
            app1 = p1.inspect().value;
            app2 = p2.inspect().value;
            app3 = p3.inspect().value;
        })
    });

    afterEach(function () {
        var p1, p2, p3;

        runs(function () {
            p1 = SCL2.signOut(app1);
            p2 = SCL2.signOut(app2);
            p3 = SCL2.signOut(app3);
        });

        waitsFor(function () {
            return p1.inspect().state == 'fulfilled' && p2.inspect().state == 'fulfilled' && p3.inspect().state == 'fulfilled';
        }, 'app to sign out', 30000);
    });

    it('sign in using Passive Auth', function () {
        var p, p2, p3;

        runs(function () {
            p1 = SCL2.signIn(app1, {
                auth: auth(access_token1),
                origins: origins
            });
            p2 = SCL2.signIn(app2, {
                auth: auth(access_token2),
                origins: origins
            });
            p3 = SCL2.signIn(app3, {
                auth: auth(access_token3),
                origins: origins
            });
        });
        waitsFor(function () {
            return p1.inspect().state == 'fulfilled' && p2.inspect().state == 'fulfilled' && p3.inspect().state == 'fulfilled';
        }, 'app to sign in', 30000 * 4);
        runs(function () {
            //p = sclProxy.signIn();
        });
        waitsFor(function () {
            return true;
            return p.inspect().state == 'rejected';
        }, 'app to sign in failed', 30000);
    })

    it('sign in using Passive Auth', function () {
        var p, p2, p3;

        runs(function () {
            p1 = SCL2.signIn(app1, {
                auth: auth(access_token1),
                origins: origins
            });
            p2 = SCL2.signIn(app2, {
                auth: auth(access_token2),
                origins: origins
            });
            p3 = SCL2.signIn(app3, {
                auth: auth(access_token3),
                origins: origins
            });
        });
        waitsFor(function () {
            return p1.inspect().state == 'fulfilled' && p2.inspect().state == 'fulfilled' && p3.inspect().state == 'fulfilled';
        }, 'app to sign in', 30000 * 4);
        runs(function () {
            //p = sclProxy.signIn();
        });
        waitsFor(function () {
            return true;
            return p.inspect().state == 'rejected';
        }, 'app to sign in failed', 30000);
        runs(function () {
            expect(app1.application().signInManager.state()).toEqual('SignedIn');
        })
    })

    xit('sign in and search for person', function () {
        var p, p2, p3;
        runs(function () {
            p = sclProxy.signIn();
            p2 = sclProxy3.signIn();
            p3 = SCL2.signIn(app, {
                auth: Skype.Web.Auth.Passive(),
                origins: origins
            })
        });

        waitsFor(function () {
            return p.inspect().state == 'fulfilled' && p2.inspect().state == 'fulfilled' && p2.inspect().state == 'fulfilled';
        }, 'app to sign in', 30000 * 4);

        runs(function () {
            //p = SCL2.searchForPerson(app, { text: 'cafe2@devex.ccsctp.net', limit: 1 });
            p = sclProxy.searchForPerson({ text: 'cafe2@devex.ccsctp.net', limit: 1 });
        })

        waitsFor(function () {
            return p.inspect().state == 'fulfilled';
        }, 'search for skypebot2', 30000);

        runs(function () {
            return;
            var result = p.inspect().value;
            var person;
            expect(result.length).toBe(1);
            person = result[0].result;
            expect(person.id()).toBe('sip:cafe2@devex.ccsctp.net');
        })
    })

    xit('sign in using Passive Auth', function () {
        var p, p2, p3;

        runs(function () {
            p = sclProxy.signIn();
            p2 = sclProxy3.signIn();
            p3 = SCL2.signIn(app, {
                auth: Skype.Web.Auth.Passive(),
                origins: origins
            });
        });
        waitsFor(function () {
            return p.inspect().state == 'fulfilled' && p2.inspect().state == 'fulfilled' && p3.inspect().state == 'fulfilled';
        }, 'app to sign in', 30000 * 4);
        runs(function () {
            p = sclProxy.signIn();
        });
        waitsFor(function () {
            return p.inspect().state == 'rejected';
        }, 'app to sign in failed', 30000);
    })
});

xdescribe('_jCafe EDog Automation - P2PIM', function () {
    beforeEach(function () {
        var p, p2;
        runs(function () {
            p = Q.delay(5000);
        });
        waitsFor(function () {
            return p.inspect().state == 'fulfilled';
        }, 'delay', 30000);

        runs(function () {
            p = sclProxy.init();
            p.delay(5000);
        });
        waitsFor(function () {
            return p.inspect().state == 'fulfilled';
        }, 'delay', 30000);

        runs(function () {
            p = sclProxy.signOut('e1');
            initLocalApp();
        });
        waitsFor(function () {
            return p.inspect().state == 'fulfilled';
        }, 'app to sign out', 30000);

        runs(function () {
            p = sclProxy.signIn('e1');
            p2 = SCL2.signIn(app, {
                auth: Skype.Web.Auth.Passive(),
                origins: origins
            })
        });
        waitsFor(function () {
            return p.inspect().state == 'fulfilled' && p2.inspect().state == 'fulfilled';
        }, 'app to sign in', 30000);
    });

    afterEach(function () {
        var p;
        runs(function () {
            p = sclProxy.signOut('e1');
        });
        waitsFor(function () {
            return p.inspect().state == 'fulfilled';
        }, 'app to sign out', 30000);
    });

    it('Sends a message from client1 to client2 and receives it on client2.', function () {
        var p, p2;
        runs(function () {
            p = SCL2.searchForPerson(app, { text: 'cafe2@devex.ccsctp.net', limit: 1 });
        })
        waitsFor(function () {
            return p.inspect().state == 'fulfilled';
        }, 'search for skypebot2', 30000);
        runs(function () {
            var result = p.inspect().value;
            var person;
            expect(result.length).toBe(1);
            person = result[0].result;
            expect(person.id()).toBe('sip:cafe2@devex.ccsctp.net');
        })

        runs(function () {
            return;
            p = sclProxy.signIn('e1');
            p2 = SCL2.signIn(app, {
                auth: Skype.Web.Auth.Passive(),
                origins: origins
            })
        });
        waitsFor(function () {
            return true;// p.inspect().state == 'fulfilled' && p2.inspect().state == 'fulfilled';
        }, 'app to sign in', 30000);
    })

    xit('Sends a message from client1 to client2 and receives it on client2.', function () {
        var subject = 'Automation test for jLync. ' + new Date().toJSON(); // a unique id of the conversation
        var cv1, cv2; // conversation models for client1 and client2
        var p1, p2;
        var message1 = 'hello, world';
        var priority = 'important';

        runs(function () {
            var sender = 'cafe1@devex.ccsctp.net';
            //p2 = sclProxy.acceptChatServie(sender, subject, message1);
            //p1 = SCL2.startChat(client1, client1_person2, subject, message1, priority);
            //p1[0] = p1[0].delay(5000);
        })
        waitsFor(function () {
            return p2.inspect().state == 'fulfilled';
        }, 'client2 should receive the IM from client1', 30000);
        return;
        runs(function () {
            jasmine.log('get the conversation objects for client1 and client2');
            cv1 = p1[1].inspect().value.conversation;
            cv2 = p2[1].inspect().value.conversation;
        });

        runs(function () {
            jasmine.log('sending the 2st IM: client2 => client1');
            p2 = SCL.verifyReceiveChatMessage(cv1, message2);
            p1 = SCL.sendChatMessage(cv2, message2);
        });

        waitsFor(function () {
            return Utils.fulfilled(p1, p2);
        }, 'client1 should receive the reply from client2', defaultTimeOut);

        runs(function () {
            jasmine.log('sending the 3rd IM: client1 => client2');
            p2 = SCL.verifyReceiveChatMessage(cv2, message3);
            p1 = SCL.sendChatMessage(cv1, message3);
        });

        waitsFor(function () {
            return Utils.fulfilled(p1, p2);
        }, 'client1 should send message3 to client2', defaultTimeOut);

        runs(function () {
            p1 = SCL.stopChat(cv1);
            p2 = SCL.stopChat(cv2);
        });

        waitsFor(function () {
            return Utils.fulfilled(p1, p2);
        }, 'conversation #1 and #2 to be Disconnected', defaultTimeOut + 750 * 1000); // need to find our why UCWA sometimes spend more 
        // than 45 seconds to send conversation Disconnected event
    });
});
