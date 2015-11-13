'use strict'

var express = require('express');
var http = require('http');
var path = require('path');
var fs = require('fs');
var socketio = require('socket.io');
var botUtils = require('../jlyncbot/bot_node_utils');

var rootUrl = path.join(__dirname, '../../');
console.log(rootUrl);

var app = express();
app.use(express.static(rootUrl));
var server = http.createServer(app);

var io = socketio.listen(server);
server.listen(80);

var spawn = require('child_process').spawn;

var proc = spawn('../DrBro/bin/debug/drbro.exe');

proc.stdout.on('data', function (data) {
    console.log(data.toString());
    (function (data) {
        setTimeout(function () {
            var evt;
            try {
                evt = JSON.parse(data.toString());

                switch (evt.options.title) {
                    case 'data:,':
                        proc.stdin.write(JSON.stringify({ "cmd": "goToUrl", "options": { "url": "http://sdfpilot.outlook.com/owa/devex.ccsctp.net", "id": evt.options.id } }) + '\n');
                        break;
                    case 'Sign in to Office 365':
                        if (evt.options.id == 'e1') {
                            proc.stdin.write(JSON.stringify({ "cmd": "signIn", "options": { "username": "cafe1@devex.ccsctp.net", "password": "07Apples", "id": evt.options.id } }) + '\n');
                        } else if (evt.options.id == 'e2') {
                            proc.stdin.write(JSON.stringify({ "cmd": "signIn", "options": { "username": "cafe2@devex.ccsctp.net", "password": "07Apples", "id": evt.options.id } }) + '\n');
                        } else if (evt.options.id == 'e3') {
                            proc.stdin.write(JSON.stringify({ "cmd": "signIn", "options": { "username": "cafe3@devex.ccsctp.net", "password": "07Apples", "id": evt.options.id } }) + '\n');
                        }
                        break;
                    case 'Ucja Cafe1 - Outlook Web App':
                        proc.stdin.write(JSON.stringify({ "cmd": "goToUrl", "options": { "url": "http://localhost/jlyncTest/jCafe/test.html?type=test&id=t1", "id": evt.options.id } }) + '\n');
                        break;
                    case 'Ucja Cafe2 - Outlook Web App':
                        proc.stdin.write(JSON.stringify({ "cmd": "goToUrl", "options": { "url": "http://localhost/jlyncTest/jCafe/jcafe.html?type=remote&id=e2", "id": evt.options.id } }) + '\n');
                        break;
                    case 'Ucja Cafe3 - Outlook Web App':
                        proc.stdin.write(JSON.stringify({ "cmd": "goToUrl", "options": { "url": "http://localhost/jlyncTest/jCafe/jcafe.html?type=remote&id=e3", "id": evt.options.id } }) + '\n');
                        break;
                    case 'Test - done_':
                        setTimeout(function () {
                            proc.stdin.write(JSON.stringify({ "cmd": "quit", "options": { "id": evt.options.id } }) + '\n');
                        }, 5000);
                        break;
                }
            } catch (error) {
                //console.log(error);
            }
        }, 200);
    })(data);
});

proc.on('exit', function (code) {
    console.log('exit on code: ' + code);
})

var jCafeSocket = {};
var scl2ProxySocket;
var scl2RemoteSocket = {};

io.set('log level', 1);
io.on('connection', function (socket) {
    console.log('socket connected');

    socket.on('who', function(w) {
        console.log('>>>> who: ', w);
        if (w.type == 'SCL2Proxy') {
            if (true || !scl2ProxySocket) {
                scl2ProxySocket = socket;
                scl2ProxySocket.on('data', function (data) {
                    console.log('RX>>>> received from proxy socket data: ', data);
                    if (data.cmd) {
                        proc.stdin.write(JSON.stringify(data) + '\n');
                    } else if (data.params && data.params.c && scl2RemoteSocket[data.to]) {
                        console.log('TX>>>> sent to remote socket data: ', data.to);
                        scl2RemoteSocket[data.to].emit('data', data);
                    }
                });
            }
        } else if (w.type == 'SCL2Remote') {
            scl2RemoteSocket[w.eid] = socket;
            scl2RemoteSocket[w.eid].on('data', function (data) {
                console.log('RX>>>> received from remote socket data: ', data);
                console.log('Tx>>>> sent to to proxy: ', data);
                if (scl2ProxySocket) {
                    scl2ProxySocket.emit('data', data);
                }
            })
        }
    });
    socket.on('disconnect', function () {
        console.log('socket disconnected');
    })
});

function bootStrap() {
    setTimeout(function () {
        proc.stdin.write(JSON.stringify({ cmd: "startBrowser", options: { browser: "chrome", id: "e1" } }) + '\n');
        proc.stdin.write(JSON.stringify({ cmd: "startBrowser", options: { browser: "chrome", id: "e2" } }) + '\n');
        proc.stdin.write(JSON.stringify({ cmd: "startBrowser", options: { browser: "chrome", id: "e3" } }) + '\n');
        setTimeout(function () {
            proc.stdin.write(JSON.stringify({ cmd: "watch", options: { id: "e1", what: "title" } }) + '\n');
            proc.stdin.write(JSON.stringify({ cmd: "watch", options: { id: "e2", what: "title" } }) + '\n');
            proc.stdin.write(JSON.stringify({ cmd: "watch", options: { id: "e3", what: "title" } }) + '\n');
        }, 100)
    }, 1000);
}

botUtils.kill('chrome.exe', function (error) {
    console.log('killed chrome');
    botUtils.startBrowser('chrome', 'http://localhost/jLyncTest/jCafe/test.html')
})
//bootStrap();